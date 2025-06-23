@echo off
setlocal enabledelayedexpansion

echo 🚀 deleting API Gateway to Kubernetes...




echo 🐘 delete PostgreSQL...
kubectl delete -f postgres-configmap.yaml 
if !errorlevel! neq 0 exit /b !errorlevel!
kubectl delete -f postgres-secret.yaml  
if !errorlevel! neq 0 exit /b !errorlevel!
kubectl apply -f postgres-init-configmap.yaml  
if !errorlevel! neq 0 exit /b !errorlevel!
kubectl delete -f postgres-deployment.yaml  
if !errorlevel! neq 0 exit /b !errorlevel!

echo 🔴 deleting Redis...
kubectl delete -f redis-deployment.yaml  
if !errorlevel! neq 0 exit /b !errorlevel!


echo 🔧 deleting backend...
kubectl delete -f backend-configmap.yaml  
if !errorlevel! neq 0 exit /b !errorlevel!
kubectl delete -f backend-deployment.yaml  
if !errorlevel! neq 0 exit /b !errorlevel!


echo 🌐 deleting frontend...
kubectl delete -f frontend-deployment.yaml  
if !errorlevel! neq 0 exit /b !errorlevel!

echo 🌍 deleting ingress...
kubectl delete -f ingress.yaml  
if !errorlevel! neq 0 exit /b !errorlevel!

echo ✅ deltion complete!

echo 📦 deleting namespace...
kubectl delete -f namespace.yaml  
