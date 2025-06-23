#!/bin/bash


set -e

echo "🚀 Deploying API Gateway to Kubernetes..."

echo "📦 Creating namespace..."
kubectl apply -f namespace.yaml

echo "🐘 Deploying PostgreSQL..."
kubectl apply -f postgres-configmap.yaml
kubectl apply -f postgres-secret.yaml
kubectl apply -f postgres-init-configmap.yaml
kubectl apply -f postgres-deployment.yaml

echo "🔴 Deploying Redis..."
kubectl apply -f redis-deployment.yaml

echo "⏳ Waiting for databases to be ready..."
kubectl wait --for=condition=ready pod -l app=postgres -n api-gateway --timeout=300s
kubectl wait --for=condition=ready pod -l app=redis -n api-gateway --timeout=300s

echo "🔧 Deploying backend..."
kubectl apply -f backend-configmap.yaml
kubectl apply -f backend-deployment.yaml

echo "⏳ Waiting for backend to be ready..."
kubectl wait --for=condition=ready pod -l app=api-gateway-backend -n api-gateway --timeout=300s

echo "🌐 Deploying frontend..."
kubectl apply -f frontend-deployment.yaml

echo "🌍 Deploying ingress..."
kubectl apply -f ingress.yaml

echo "⏳ Waiting for frontend to be ready..."
kubectl wait --for=condition=ready pod -l app=api-gateway-frontend -n api-gateway --timeout=300s

echo "✅ Deployment complete!"
echo ""
echo "📋 Deployment Status:"
kubectl get pods -n api-gateway
echo ""
echo "🔗 Services:"
kubectl get services -n api-gateway
echo ""
echo "🌐 Access the application:"
echo "  Frontend: http://api-gateway.local"
echo "  Backend API: http://api-gateway.local/api"
echo ""
echo "💡 Don't forget to:"
echo "  1. Build and push Docker images"
echo "  2. Update /etc/hosts with: <INGRESS_IP> api-gateway.local"
echo "  3. Run database migrations if needed"
