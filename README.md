# API Gateway System

A comprehensive API Gateway system for managing Fico platform interactions with dynamic routing, parameter caching, and configuration management.

## 🚀 Overview

This API Gateway provides a robust solution for routing requests to Fico PLOR/DM endpoints with intelligent parameter augmentation and comprehensive configuration management. The system includes a FastAPI backend, React frontend, PostgreSQL database, and Kubernetes deployment manifests.

## ✨ Key Features

- **Dynamic Request Routing**: Extracts `bomVersionId` from request payloads to determine routing
- **Parameter Caching**: Redis-based caching with effective date handling
- **Request Augmentation**: Merges cached parameters with original requests
- **Configuration Management**: Web-based UI for managing Fico environment configurations
- **Approval Workflow**: Role-based access control with approval process
- **Audit Logging**: Comprehensive change tracking and audit trail
- **Mock Services**: Built-in mock endpoints for testing
- **Karate Testing**: Gradle-based testing framework with CSV-driven data

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend │    │  FastAPI Backend │    │  PostgreSQL DB  │
│   (Port 5173)   │◄──►│   (Port 8000)   │◄──►│   (Port 5432)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   Redis Cache   │
                       │   (Port 6379)   │
                       └─────────────────┘
```

## 📋 Prerequisites

### Windows

**Required Software:**
- **Java 17+**: Download from [Oracle JDK](https://www.oracle.com/java/technologies/downloads/) or [OpenJDK](https://openjdk.org/)
- **Python 3.12+**: Download from [python.org](https://www.python.org/downloads/)
- **Node.js 18+**: Download from [nodejs.org](https://nodejs.org/)
- **PostgreSQL 15+**: Download from [postgresql.org](https://www.postgresql.org/download/windows/)
- **Redis**: Use [Redis for Windows](https://github.com/microsoftarchive/redis/releases) or Docker
- **Git**: Download from [git-scm.com](https://git-scm.com/download/win)

**Package Manager (Optional but Recommended):**
```powershell
# Install Chocolatey
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install packages via Chocolatey
choco install openjdk python nodejs postgresql redis git
```

**Poetry Installation:**
```powershell
# Install Poetry
(Invoke-WebRequest -Uri https://install.python-poetry.org -UseBasicParsing).Content | python -
# Add to PATH: %APPDATA%\Python\Scripts
```

### Linux (Ubuntu/Debian)

**Update Package Manager:**
```bash
sudo apt update && sudo apt upgrade -y
```

**Install Required Packages:**
```bash
# Java 17
sudo apt install openjdk-17-jdk -y

# Python 3.12 and pip
sudo apt install python3.12 python3.12-venv python3-pip -y

# Node.js 18+ (via NodeSource)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs -y

# PostgreSQL 15
sudo apt install postgresql postgresql-contrib -y

# Redis
sudo apt install redis-server -y

# Git
sudo apt install git -y

# Build essentials
sudo apt install build-essential -y
```

**Poetry Installation:**
```bash
curl -sSL https://install.python-poetry.org | python3 -
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

### Linux (CentOS/RHEL/Fedora)

**For CentOS/RHEL 8+:**
```bash
# Enable EPEL repository
sudo dnf install epel-release -y

# Java 17
sudo dnf install java-17-openjdk java-17-openjdk-devel -y

# Python 3.12
sudo dnf install python3.12 python3.12-pip -y

# Node.js 18+
sudo dnf module install nodejs:18/common -y

# PostgreSQL 15
sudo dnf install postgresql postgresql-server postgresql-contrib -y
sudo postgresql-setup --initdb
sudo systemctl enable postgresql --now

# Redis
sudo dnf install redis -y
sudo systemctl enable redis --now

# Git and build tools
sudo dnf install git gcc gcc-c++ make -y
```

**Poetry Installation:**
```bash
curl -sSL https://install.python-poetry.org | python3 -
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

### macOS

**Install Homebrew (if not already installed):**
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

**Install Required Packages:**
```bash
# Java 17
brew install openjdk@17
echo 'export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"' >> ~/.zshrc

# Python 3.12
brew install python@3.12

# Node.js 18+
brew install node@18
echo 'export PATH="/opt/homebrew/opt/node@18/bin:$PATH"' >> ~/.zshrc

# PostgreSQL 15
brew install postgresql@15
echo 'export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"' >> ~/.zshrc

# Redis
brew install redis

# Git (usually pre-installed)
brew install git
```

**Poetry Installation:**
```bash
curl -sSL https://install.python-poetry.org | python3 -
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

**Start Services:**
```bash
# PostgreSQL
brew services start postgresql@15

# Redis
brew services start redis
```

## 🚀 Installation & Setup

### 1. Clone Repository

```bash
git clone https://github.com/hmallepally/gateway.git
cd gateway
```

### 2. Database Setup

**PostgreSQL Configuration:**

```bash
# Create database and user
sudo -u postgres psql
```

```sql
CREATE DATABASE gateway_db;
CREATE USER gateway_user WITH PASSWORD 'gateway_password';
GRANT ALL PRIVILEGES ON DATABASE gateway_db TO gateway_user;
\q
```

**For Windows (using psql):**
```cmd
psql -U postgres
-- Run the same SQL commands above
```

### 3. Backend Setup

```bash
cd backend

# Install dependencies
poetry install

# Configure environment
cp .env.example .env
# Edit .env with your database credentials

# Run database migrations and seed data
poetry run python app/seed_data.py

# Start the backend server
poetry run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**Backend Environment Variables (.env):**
```env
DATABASE_URL=postgresql://gateway_user:gateway_password@localhost:5432/gateway_db
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=your-secret-key-here
ENVIRONMENT=development
LOG_LEVEL=INFO
```

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

### 5. Testing Setup

**Karate Tests (Gradle-based):**
```bash
cd karate-tests

# Run all tests
./gradlew test

# Run specific test suites
./gradlew smokeTests
./gradlew regressionTests
./gradlew performanceTests

# Environment-specific testing
./gradlew testDev
./gradlew testStaging
./gradlew testProd
```

**Backend Unit Tests:**
```bash
cd backend
poetry run pytest
```

## 🐳 Docker Setup

**Build and run with Docker Compose:**
```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d

# Stop services
docker-compose down
```

## ☸️ Kubernetes Deployment

**Prerequisites:**
- Kubernetes cluster (minikube, kind, or cloud provider)
- kubectl configured
- Docker images built and pushed to registry
  * docker build -t api-gateway-backend:latest -f .\Dockerfile.backend .
  * docker build -t api-gateway-frontend:latest -f .\Dockerfile.frontend .

**Deploy to Kubernetes:**
```bash
cd k8s

# Make deployment script executable
chmod +x deploy.sh

# Deploy all components
./deploy.sh

or run the commands individually.
 * kubectl apply -f k8s/backend-deployment.yaml
 * kubectl apply -f k8s/frontend-deployment.yaml
 * kubectl get pods -n api-gateway
 * kubectl describe pods -n api-gateway

### Check deployment status
 * kubectl get pods -n api-gateway
 * kubectl get services -n api-gateway
```

**Access the application:**
```bash
# Port forward to access locally
kubectl port-forward -n api-gateway service/frontend-service 8080:80
kubectl port-forward -n api-gateway service/backend-service 8000:8000
```

## 🧪 Testing

### API Testing

**Health Check:**
```bash
curl http://localhost:8000/healthz
```

**Get Configurations:**
```bash
curl http://localhost:8000/api/fico-configs
```

**Test Gateway Processing:**
```bash
curl -X POST http://localhost:8000/gateway \
  -H "Content-Type: application/json" \
  -d '{
    "bomVersionId": "CREDIT_CARD:PREMIUM:1.0",
    "customerId": "CUST_12345",
    "applicationId": "APP_67890",
    "requestType": "SCORING"
  }'
```

### Frontend Testing

1. Open `http://localhost:5173` in your browser
2. Navigate through the four main tabs:
   - **Fico Configurations**: Manage environment configurations
   - **Parameters**: Configure parameters with effective dating
   - **Change Log**: Review and approve changes
   - **Gateway Tester**: Test request processing

### Karate Integration Tests

**Run comprehensive test suites:**
```bash
cd karate-tests

# All tests
./gradlew test

# Smoke tests (quick validation)
./gradlew smokeTests

# Regression tests (comprehensive)
./gradlew regressionTests

# Performance tests
./gradlew performanceTests
```

**View test reports:**
- HTML Report: `build/reports/tests/test/index.html`
- JUnit XML: `build/test-results/test/*.xml`

## 🔧 Configuration

### Backend Configuration

**Environment Variables:**
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `SECRET_KEY`: JWT signing key
- `ENVIRONMENT`: deployment environment (development/staging/production)
- `LOG_LEVEL`: logging level (DEBUG/INFO/WARNING/ERROR)

### Frontend Configuration

**Environment Variables (.env.local):**
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_ENVIRONMENT=development
```

### Database Schema

**Main Tables:**
- `Fico_Environment_Config`: Environment configurations
- `Configurable_Parameters`: Parameters with effective dating
- `Change_Log`: Audit trail and approval workflow

## 🔍 Troubleshooting

### Common Issues

**1. Port Already in Use:**
```bash
# Find process using port
lsof -i :8000  # or :5173 for frontend
# Kill process
kill -9 <PID>
```

**2. Database Connection Issues:**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql  # Linux
brew services list | grep postgresql  # macOS

# Test connection
psql -h localhost -U gateway_user -d gateway_db
```

**3. Redis Connection Issues:**
```bash
# Check Redis status
sudo systemctl status redis  # Linux
brew services list | grep redis  # macOS

# Test connection
redis-cli ping
```

**4. Poetry Issues:**
```bash
# Clear cache
poetry cache clear --all pypi

# Reinstall dependencies
poetry install --no-cache
```

**5. Node.js/npm Issues:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**6. Java/Gradle Issues:**
```bash
# Check Java version
java -version

# Clean Gradle cache
./gradlew clean

# Rebuild
./gradlew build --refresh-dependencies
```

### Platform-Specific Issues

**Windows:**
- Use PowerShell as Administrator for installations
- Ensure PATH variables are set correctly
- Use Windows Subsystem for Linux (WSL) for better compatibility

**macOS:**
- Use Homebrew for package management
- Ensure Xcode Command Line Tools are installed: `xcode-select --install`
- Check PATH in `.zshrc` or `.bash_profile`

**Linux:**
- Ensure all required packages are installed
- Check firewall settings if services aren't accessible
- Use `sudo` for system-level installations

## 📚 API Documentation

**Interactive API Documentation:**
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

**Key Endpoints:**
- `GET /healthz` - Health check
- `GET /api/fico-configs` - List configurations
- `POST /api/fico-configs` - Create configuration
- `GET /api/parameters` - List parameters
- `POST /gateway` - Process gateway request
- `GET /api/change-logs` - View change history

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Run tests: `./gradlew test` and `poetry run pytest`
5. Commit your changes: `git commit -am 'Add some feature'`
6. Push to the branch: `git push origin feature/your-feature`
7. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the troubleshooting section above
- Review the API documentation at `/docs`

## 🚀 Deployment Notes

**Production Considerations:**
- Use environment-specific configuration files
- Enable SSL/TLS for all endpoints
- Configure proper logging and monitoring
- Set up database backups
- Use secrets management for sensitive data
- Configure load balancing for high availability

**Monitoring:**
- Health check endpoints for all services
- Application metrics and logging
- Database performance monitoring
- Redis cache hit rates
- API response times and error rates
