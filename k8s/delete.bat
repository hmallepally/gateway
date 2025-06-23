@echo off
setlocal enabledelayedexpansion

echo 🚀 deleting API Gateway to Kubernetes...




echo 🐘 delete PostgreSQL...
kubectl delete -f postgres-configmap.yaml 

kubectl delete -f postgres-secret.yaml  

kubectl apply -f postgres-init-configmap.yaml  

kubectl delete -f postgres-deployment.yaml  


echo 🔴 deleting Redis...
kubectl delete -f redis-deployment.yaml  



echo 🔧 deleting backend...
kubectl delete -f backend-configmap.yaml  

kubectl delete -f backend-deployment.yaml  
echo 🌐 deleting frontend...
kubectl delete -f frontend-deployment.yaml  

echo 🌍 deleting ingress...
kubectl delete -f ingress.yaml  

echo ✅ deltion complete!

echo 📦 deleting namespace...
kubectl delete -f namespace.yaml  
