@echo off
setlocal enabledelayedexpansion

echo 🚀 Deploying API Gateway to Kubernetes...

echo 🔍 Checking Kubernetes connection...
kubectl cluster-info >nul 2>&1
if !errorlevel! neq 0 (
    echo ❌ ERROR: Cannot connect to Kubernetes cluster
    echo 💡 Please ensure:
    echo    1. Docker Desktop is running
    echo    2. Kubernetes is enabled in Docker Desktop settings
    echo    3. kubectl is configured correctly
    echo.
    echo 🔧 To enable Kubernetes in Docker Desktop:
    echo    - Open Docker Desktop
    echo    - Go to Settings ^> Kubernetes
    echo    - Check "Enable Kubernetes"
    echo    - Click "Apply & Restart"
    echo.
    echo 🚨 If issues persist, try running with --validate=false:
    echo    kubectl apply -f namespace.yaml --validate=false
    exit /b 1
)

echo 📦 Creating namespace...
kubectl apply -f namespace.yaml --validate=false
if !errorlevel! neq 0 (
    echo ❌ Failed to create namespace. Trying without validation...
    kubectl apply -f namespace.yaml --validate=false
    if !errorlevel! neq 0 exit /b !errorlevel!
)

echo 🐘 Deploying PostgreSQL...
kubectl apply -f postgres-configmap.yaml --validate=false
if !errorlevel! neq 0 exit /b !errorlevel!
kubectl apply -f postgres-secret.yaml --validate=false
if !errorlevel! neq 0 exit /b !errorlevel!
kubectl apply -f postgres-init-configmap.yaml --validate=false
if !errorlevel! neq 0 exit /b !errorlevel!
kubectl apply -f postgres-deployment.yaml --validate=false
if !errorlevel! neq 0 exit /b !errorlevel!

echo 🔴 Deploying Redis...
kubectl apply -f redis-deployment.yaml --validate=false
if !errorlevel! neq 0 exit /b !errorlevel!

echo ⏳ Waiting for databases to be ready...
kubectl wait --for=condition=ready pod -l app=postgres -n api-gateway --timeout=300s
if !errorlevel! neq 0 exit /b !errorlevel!
kubectl wait --for=condition=ready pod -l app=redis -n api-gateway --timeout=300s
if !errorlevel! neq 0 exit /b !errorlevel!

echo 🔧 Deploying backend...
kubectl apply -f backend-configmap.yaml --validate=false
if !errorlevel! neq 0 exit /b !errorlevel!
kubectl apply -f backend-deployment.yaml --validate=false
if !errorlevel! neq 0 exit /b !errorlevel!

echo ⏳ Waiting for backend to be ready...
kubectl wait --for=condition=ready pod -l app=api-gateway-backend -n api-gateway --timeout=300s
if !errorlevel! neq 0 exit /b !errorlevel!

echo 🌐 Deploying frontend...
kubectl apply -f frontend-deployment.yaml --validate=false
if !errorlevel! neq 0 exit /b !errorlevel!

echo 🌍 Deploying ingress...
kubectl apply -f ingress.yaml --validate=false
if !errorlevel! neq 0 exit /b !errorlevel!

echo ⏳ Waiting for frontend to be ready...
kubectl wait --for=condition=ready pod -l app=api-gateway-frontend -n api-gateway --timeout=300s
if !errorlevel! neq 0 exit /b !errorlevel!

echo ✅ Deployment complete!
echo.
echo 📋 Deployment Status:
kubectl get pods -n api-gateway
echo.
echo 🔗 Services:
kubectl get services -n api-gateway
echo.
echo 🌐 Access the application:
echo   Frontend: http://api-gateway.local
echo   Backend API: http://api-gateway.local/api
echo.
echo 💡 Don't forget to:
echo   1. Build and push Docker images
echo   2. Update /etc/hosts with: ^<INGRESS_IP^> api-gateway.local
echo   3. Run database migrations if needed
