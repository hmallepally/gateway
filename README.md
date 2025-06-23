# API Gateway System

A comprehensive API Gateway and Configuration Management System designed to serve as an intelligent intermediary between downstream client applications and Fico PLOR/DM platform solutions.

## 🚀 Features

- **Dynamic Request Routing**: Routes requests based on `bomVersionId` extraction from request payloads
- **Parameter Caching**: High-performance configuration caching with effective date handling
- **Request Augmentation**: Automatically merges cached parameters with original requests
- **Configuration Management**: Web-based UI for managing Fico environment configurations
- **Approval Workflow**: Role-based access control with Editor/Approver roles
- **Comprehensive Audit Trail**: Complete logging of all configuration changes
- **Karate Testing Framework**: Gradle-based testing with embedded wrapper
- **Kubernetes Deployment**: Complete K8s manifests for production deployment

## 📋 Prerequisites

### All Platforms
- **Git**: Version control system
- **Docker**: For containerization and local database services
- **kubectl**: Kubernetes command-line tool (for K8s deployment)

### Platform-Specific Requirements

#### Windows
- **Python 3.12+**: Download from [python.org](https://www.python.org/downloads/)
- **Node.js 18+**: Download from [nodejs.org](https://nodejs.org/)
- **Poetry**: Python dependency management
  ```powershell
  # Install Poetry
  (Invoke-WebRequest -Uri https://install.python-poetry.org -UseBasicParsing).Content | python -
  
  # Add Poetry to PATH (restart terminal after)
  $env:PATH += ";$env:APPDATA\Python\Scripts"
  ```
- **Java 11+**: For Karate testing framework
  ```powershell
  # Install via Chocolatey (recommended)
  choco install openjdk11
  
  # Or download from https://adoptium.net/
  ```

#### macOS
- **Python 3.12+**: 
  ```bash
  # Using Homebrew (recommended)
  brew install python@3.12
  
  # Or download from python.org
  ```
- **Node.js 18+**:
  ```bash
  # Using Homebrew
  brew install node
  
  # Or using nvm
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
  nvm install 18
  nvm use 18
  ```
- **Poetry**:
  ```bash
  # Using Homebrew
  brew install poetry
  
  # Or using curl
  curl -sSL https://install.python-poetry.org | python3 -
  ```
- **Java 11+**:
  ```bash
  # Using Homebrew
  brew install openjdk@11
  
  # Add to PATH
  echo 'export PATH="/opt/homebrew/opt/openjdk@11/bin:$PATH"' >> ~/.zshrc
  ```

#### Linux (Ubuntu/Debian)
- **Python 3.12+**:
  ```bash
  sudo apt update
  sudo apt install python3.12 python3.12-pip python3.12-venv
  ```
- **Node.js 18+**:
  ```bash
  # Using NodeSource repository
  curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
  sudo apt-get install -y nodejs
  
  # Or using nvm
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
  nvm install 18
  nvm use 18
  ```
- **Poetry**:
  ```bash
  curl -sSL https://install.python-poetry.org | python3 -
  
  # Add to PATH
  echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
  source ~/.bashrc
  ```
- **Java 11+**:
  ```bash
  sudo apt update
  sudo apt install openjdk-11-jdk
  
  # Verify installation
  java -version
  ```

#### Linux (CentOS/RHEL/Fedora)
- **Python 3.12+**:
  ```bash
  # CentOS/RHEL
  sudo yum install python3.12 python3.12-pip
  
  # Fedora
  sudo dnf install python3.12 python3.12-pip
  ```
- **Node.js 18+**:
  ```bash
  # Using NodeSource repository
  curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
  sudo yum install nodejs  # or sudo dnf install nodejs
  ```
- **Poetry**:
  ```bash
  curl -sSL https://install.python-poetry.org | python3 -
  echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
  source ~/.bashrc
  ```
- **Java 11+**:
  ```bash
  # CentOS/RHEL
  sudo yum install java-11-openjdk-devel
  
  # Fedora
  sudo dnf install java-11-openjdk-devel
  ```

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/hmallepally/gateway.git
cd gateway
```

### 2. Backend Setup

#### All Platforms
```bash
cd backend

# Install dependencies
poetry install

# Set up environment variables
cp .env.example .env
# Edit .env file with your configuration

# Start PostgreSQL and Redis (using Docker)
docker run -d --name postgres-gateway -e POSTGRES_PASSWORD=gateway123 -e POSTGRES_DB=gateway -p 5432:5432 postgres:15
docker run -d --name redis-gateway -p 6379:6379 redis:7-alpine

# Run database migrations and seed data
poetry run python app/seed_data.py

# Start the backend server
poetry run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

The backend will be available at: `http://localhost:8000`
- API Documentation: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/healthz`

### 3. Frontend Setup

#### All Platforms
```bash
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env file to point to your backend URL

# Start the development server
npm run dev
```

The frontend will be available at: `http://localhost:5173`

### 4. Testing Setup

#### Karate Testing Framework (Gradle-based)

```bash
cd karate-tests

# Run all tests (uses embedded Gradle wrapper)
./gradlew test

# Run specific test suites
./gradlew smokeTests
./gradlew regressionTests
./gradlew performanceTests

# Run environment-specific tests
./gradlew testDev
./gradlew testStaging
./gradlew testProd

# Generate HTML reports
./gradlew test --info
# Reports available at: build/reports/tests/test/index.html
```

#### Backend Unit Tests
```bash
cd backend
poetry run pytest
```

## 🐳 Docker Setup (Alternative)

### Using Docker Compose
```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Individual Docker Commands
```bash
# Build backend
docker build -f Dockerfile.backend -t gateway-backend .

# Build frontend
docker build -f Dockerfile.frontend -t gateway-frontend .

# Run backend
docker run -d -p 8000:8000 --name gateway-backend gateway-backend

# Run frontend
docker run -d -p 3000:80 --name gateway-frontend gateway-frontend
```

## ☸️ Kubernetes Deployment

### Prerequisites
- Kubernetes cluster (local or cloud)
- kubectl configured to access your cluster

### Deployment Steps
```bash
cd k8s

# Make deployment script executable
chmod +x deploy.sh

# Deploy all components
./deploy.sh

# Check deployment status
kubectl get pods -n gateway-system
kubectl get services -n gateway-system

# Access the application
kubectl port-forward -n gateway-system service/frontend-service 8080:80
```

### Manual Deployment
```bash
# Create namespace
kubectl apply -f namespace.yaml

# Deploy database and cache
kubectl apply -f postgres-configmap.yaml
kubectl apply -f postgres-secret.yaml
kubectl apply -f postgres-deployment.yaml
kubectl apply -f redis-deployment.yaml

# Deploy backend
kubectl apply -f backend-configmap.yaml
kubectl apply -f backend-deployment.yaml

# Deploy frontend
kubectl apply -f frontend-deployment.yaml

# Set up ingress
kubectl apply -f ingress.yaml
```

## 🧪 Testing

### API Testing with curl

#### Health Check
```bash
curl -X GET http://localhost:8000/healthz
```

#### Gateway Request Processing
```bash
curl -X POST http://localhost:8000/gateway \
  -H "Content-Type: application/json" \
  -d '{
    "body": {
      "bomVersionId": "PLOR:1.2",
      "customerId": "12345",
      "productType": "credit_assessment"
    }
  }'
```

#### Configuration Management
```bash
# Get all Fico configurations
curl -X GET http://localhost:8000/api/fico-configs

# Get all parameters
curl -X GET http://localhost:8000/api/parameters

# Get change log
curl -X GET http://localhost:8000/api/changelogs
```

### Frontend Testing
1. Navigate to `http://localhost:5173`
2. Test all four tabs:
   - **Fico Configurations**: CRUD operations for environment configs
   - **Parameters**: Parameter management with effective dating
   - **Change Log**: View and approve/reject changes
   - **Gateway Tester**: Test request routing and augmentation

### Karate Test Execution
```bash
cd karate-tests

# Run all tests with detailed output
./gradlew test --info

# Run tests with specific tags
./gradlew test -Dkarate.options="--tags @smoke"

# Run tests against different environments
./gradlew testDev -Dkarate.env=dev
./gradlew testStaging -Dkarate.env=staging
./gradlew testProd -Dkarate.env=prod

# Generate and view HTML reports
./gradlew test
open build/reports/tests/test/index.html  # macOS
start build/reports/tests/test/index.html  # Windows
xdg-open build/reports/tests/test/index.html  # Linux
```

## 📁 Project Structure

```
gateway/
├── backend/                    # FastAPI backend application
│   ├── app/
│   │   ├── main.py            # FastAPI application entry point
│   │   ├── models.py          # Database models
│   │   ├── schemas.py         # Pydantic schemas
│   │   ├── database.py        # Database configuration
│   │   ├── services/          # Business logic services
│   │   └── mock_services.py   # Mock Fico endpoints
│   ├── pyproject.toml         # Poetry dependencies
│   └── .env                   # Environment variables
├── frontend/                   # React frontend application
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── App.tsx           # Main application component
│   │   └── main.tsx          # Application entry point
│   ├── package.json          # NPM dependencies
│   └── .env                  # Environment variables
├── karate-tests/              # Karate testing framework
│   ├── src/test/java/gateway/ # Feature files
│   ├── src/test/java/data/    # CSV test data
│   ├── build.gradle          # Gradle build configuration
│   ├── gradlew               # Gradle wrapper (Unix)
│   └── gradlew.bat           # Gradle wrapper (Windows)
├── k8s/                       # Kubernetes deployment manifests
│   ├── namespace.yaml
│   ├── postgres-deployment.yaml
│   ├── backend-deployment.yaml
│   ├── frontend-deployment.yaml
│   └── deploy.sh             # Deployment script
├── Dockerfile.backend         # Backend container image
├── Dockerfile.frontend        # Frontend container image
└── docker-compose.yml         # Local development setup
```

## 🔧 Configuration

### Backend Configuration (.env)
```env
# Database
DATABASE_URL=postgresql://postgres:gateway123@localhost:5432/gateway

# Redis
REDIS_URL=redis://localhost:6379

# API Settings
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=true

# Mock Services
MOCK_FICO_PLOR_URL=http://localhost:8001
MOCK_FICO_DM_URL=http://localhost:8002
```

### Frontend Configuration (.env)
```env
# Backend API URL
VITE_API_BASE_URL=http://localhost:8000

# Environment
VITE_NODE_ENV=development
```

### Karate Configuration
```javascript
// karate-config.js
function fn() {
  var env = karate.env || 'dev';
  var config = {
    baseUrl: 'http://localhost:8000',
    timeout: 30000
  };
  
  if (env === 'staging') {
    config.baseUrl = 'https://gateway-staging.example.com';
  } else if (env === 'prod') {
    config.baseUrl = 'https://gateway.example.com';
  }
  
  return config;
}
```

## 🚨 Troubleshooting

### Common Issues

#### Backend Issues
1. **Database Connection Error**
   ```bash
   # Check if PostgreSQL is running
   docker ps | grep postgres
   
   # Restart PostgreSQL container
   docker restart postgres-gateway
   ```

2. **Poetry Dependencies**
   ```bash
   # Clear poetry cache
   poetry cache clear --all pypi
   
   # Reinstall dependencies
   poetry install --no-cache
   ```

3. **Port Already in Use**
   ```bash
   # Find process using port 8000
   lsof -i :8000  # macOS/Linux
   netstat -ano | findstr :8000  # Windows
   
   # Kill the process or use different port
   poetry run uvicorn app.main:app --port 8001
   ```

#### Frontend Issues
1. **Node Modules Issues**
   ```bash
   # Clear node modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Build Errors**
   ```bash
   # Clear Vite cache
   rm -rf .vite
   npm run dev
   ```

3. **TypeScript Errors**
   ```bash
   # Check TypeScript configuration
   npx tsc --noEmit
   ```

#### Karate Testing Issues
1. **Gradle Wrapper Permissions**
   ```bash
   # Make gradlew executable (Unix/macOS)
   chmod +x gradlew
   ```

2. **Java Version Issues**
   ```bash
   # Check Java version
   java -version
   
   # Set JAVA_HOME if needed
   export JAVA_HOME=/path/to/java11  # Unix/macOS
   set JAVA_HOME=C:\path\to\java11   # Windows
   ```

3. **Test Failures**
   ```bash
   # Run tests with debug output
   ./gradlew test --debug --stacktrace
   
   # Check test reports
   open build/reports/tests/test/index.html
   ```

#### Kubernetes Issues
1. **Pod Not Starting**
   ```bash
   # Check pod logs
   kubectl logs -n gateway-system <pod-name>
   
   # Describe pod for events
   kubectl describe pod -n gateway-system <pod-name>
   ```

2. **Service Not Accessible**
   ```bash
   # Check service endpoints
   kubectl get endpoints -n gateway-system
   
   # Port forward for testing
   kubectl port-forward -n gateway-system service/backend-service 8000:8000
   ```

### Platform-Specific Issues

#### Windows
- Use PowerShell or Command Prompt as Administrator
- Ensure Windows Subsystem for Linux (WSL) is enabled for better compatibility
- Use `gradlew.bat` instead of `./gradlew`

#### macOS
- Install Xcode Command Line Tools: `xcode-select --install`
- Use Homebrew for package management
- Ensure proper permissions for executable files

#### Linux
- Ensure proper permissions: `chmod +x gradlew`
- Install build essentials: `sudo apt-get install build-essential`
- Check firewall settings for port access

## 📚 API Documentation

### Gateway Endpoints
- `POST /gateway` - Process gateway requests with routing and augmentation
- `GET /healthz` - Health check endpoint

### Configuration Management
- `GET /api/fico-configs` - List all Fico configurations
- `POST /api/fico-configs` - Create new Fico configuration
- `PUT /api/fico-configs/{product_code}/{version}` - Update configuration
- `DELETE /api/fico-configs/{product_code}/{version}` - Delete configuration

### Parameter Management
- `GET /api/parameters` - List all parameters
- `POST /api/parameters` - Create new parameter
- `PUT /api/parameters/{product_id}/{subproduct_id}/{component}/{parameter}` - Update parameter
- `DELETE /api/parameters/{product_id}/{subproduct_id}/{component}/{parameter}` - Delete parameter

### Change Log & Approvals
- `GET /api/changelogs` - List all change logs
- `POST /api/changelogs/{log_id}/approve` - Approve pending change
- `POST /api/changelogs/{log_id}/reject` - Reject pending change

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes and add tests
4. Run the test suite: `./gradlew test`
5. Commit your changes: `git commit -am 'Add some feature'`
6. Push to the branch: `git push origin feature/your-feature-name`
7. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the troubleshooting section above
- Review the API documentation at `http://localhost:8000/docs`

## 🔄 Development Workflow

### Local Development
1. Start backend: `poetry run uvicorn app.main:app --reload`
2. Start frontend: `npm run dev`
3. Run tests: `./gradlew test`
4. Make changes and test locally
5. Commit and push changes

### Testing Workflow
1. Unit tests: `poetry run pytest` (backend)
2. Integration tests: `./gradlew test` (Karate)
3. Manual testing: Use frontend UI and curl commands
4. Performance testing: `./gradlew performanceTests`

### Deployment Workflow
1. Test locally with Docker: `docker-compose up`
2. Deploy to staging: Update K8s manifests and deploy
3. Run staging tests: `./gradlew testStaging`
4. Deploy to production: `kubectl apply -f k8s/`
5. Monitor and validate: Check logs and metrics
