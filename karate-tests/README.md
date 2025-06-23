# Karate API Testing Framework

This directory contains a comprehensive Karate-based testing framework for the API Gateway system with generic templates and CSV-driven test data for easy automation.

## 🏗️ Framework Structure

```
karate-tests/
├── build.gradle                      # Gradle build configuration with Karate dependencies
├── gradle.properties                 # Gradle properties and JVM settings
├── settings.gradle                   # Gradle project settings
├── gradlew                          # Gradle wrapper script (Unix/Linux/macOS)
├── gradlew.bat                      # Gradle wrapper script (Windows)
├── gradle/wrapper/
│   └── gradle-wrapper.properties   # Gradle wrapper configuration
├── src/test/java/
│   ├── karate-config.js             # Global configuration for environments
│   ├── gateway/
│   │   ├── GatewayTestRunner.java   # JUnit 5 test runner
│   │   ├── gateway.feature          # Main gateway processing tests
│   │   ├── configurations.feature   # Fico configuration management tests
│   │   ├── parameters.feature       # Parameter management tests
│   │   ├── changelogs.feature       # Change log and approval workflow tests
│   │   ├── validate-parameters.feature # Parameter validation helper
│   │   ├── approve-change.feature   # Change approval helper
│   │   ├── reject-change.feature    # Change rejection helper
│   │   └── delete-config.feature    # Configuration deletion helper
│   └── data/
│       ├── gateway-requests.csv     # Test data for gateway requests
│       ├── fico-configs.csv         # Test data for Fico configurations
│       └── parameters.csv           # Test data for parameters
└── README.md                        # This file
```

## 🚀 Quick Start

### Prerequisites
- Java 11 or higher
- No Gradle installation required (uses embedded Gradle wrapper)
- API Gateway backend running on localhost:8000

### Running Tests

1. **Run all tests**
   ```bash
   cd karate-tests
   ./gradlew test
   ```

2. **Run specific test suites**
   ```bash
   ./gradlew smokeTests
   ./gradlew regressionTests
   ./gradlew performanceTests
   ./gradlew cleanupTests
   ```

3. **Run with different environment**
   ```bash
   ./gradlew testDev
   ./gradlew testStaging
   ./gradlew testProd
   ```

4. **Run with tags**
   ```bash
   ./gradlew test -Dkarate.options="--tags @smoke"
   ./gradlew test -Dkarate.options="--tags @regression"
   ./gradlew test -Dkarate.options="--tags @performance"
   ```

## 📊 Test Categories

### @smoke
Quick validation tests for core functionality:
- Health check endpoint
- Basic configuration retrieval
- Parameter listing
- Change log access

### @regression
Comprehensive functional tests:
- Gateway request processing with various bomVersionId formats
- CRUD operations for configurations and parameters
- Approval workflow testing
- Error handling and validation

### @performance
Performance and load testing:
- Response time validation
- Concurrent request handling
- Cache performance testing

### @cleanup
Cleanup operations:
- Remove test data after test execution
- Reset system state

## 🔧 Configuration

### Environment Configuration (karate-config.js)
```javascript
var config = {
  env: 'dev',
  baseUrl: 'http://localhost:8000',
  frontendUrl: 'http://localhost:5173',
  timeout: 30000
}
```

### Test Data (CSV Files)
- **gateway-requests.csv**: Test scenarios for gateway request processing
- **fico-configs.csv**: Configuration test data with various validation scenarios
- **parameters.csv**: Parameter test data with effective dating and validation

## 📈 Reporting

Karate generates comprehensive HTML reports after test execution:
- **Location**: `build/reports/tests/test/`
- **Main Report**: `index.html`
- **Detailed Reports**: Individual feature reports with request/response details

### JUnit Integration
- JUnit XML reports: `build/test-results/test/`
- Compatible with CI/CD systems (Jenkins, GitHub Actions, etc.)

## 🧪 Test Scenarios

### Gateway Processing Tests
- ✅ Request routing based on bomVersionId extraction
- ✅ Parameter augmentation validation
- ✅ Multiple product/version combinations
- ✅ Error handling for invalid requests
- ✅ Performance validation

### Configuration Management Tests
- ✅ CRUD operations for Fico environment configurations
- ✅ Validation of required fields
- ✅ Duplicate prevention
- ✅ Status management (ACTIVE/INACTIVE)

### Parameter Management Tests
- ✅ Parameter creation with effective dating
- ✅ Cache refresh functionality
- ✅ Product/subproduct/component hierarchy
- ✅ Parameter value validation

### Change Log & Approval Tests
- ✅ Change tracking for all modifications
- ✅ Approval workflow (PENDING → APPROVED/REJECTED)
- ✅ Role-based access control
- ✅ Audit trail validation

## 🔄 Generic Framework Features

### Data-Driven Testing
- CSV-based test data for easy maintenance
- Parameterized test scenarios
- Environment-specific data sets

### Reusable Components
- Helper features for common operations
- Shared validation logic
- Modular test structure

### Schema Validation
- Automatic response schema validation
- Type checking and structure validation
- Custom validation rules

### Error Handling
- Comprehensive error scenario testing
- Validation of error messages and codes
- Recovery testing

## 🚀 CI/CD Integration

### Gradle Integration
The project uses embedded Gradle wrapper with JUnit 5 platform integration:
```gradle
test {
    useJUnitPlatform()
    systemProperty 'karate.env', System.getProperty('karate.env', 'dev')
    systemProperty 'file.encoding', 'UTF-8'
    maxParallelForks = Runtime.runtime.availableProcessors()
}
```

### GitHub Actions Example
```yaml
- name: Run Karate Tests
  run: |
    cd karate-tests
    ./gradlew test -Dkarate.env=ci
    
- name: Publish Test Results
  uses: dorny/test-reporter@v1
  if: always()
  with:
    name: Karate Test Results
    path: karate-tests/build/test-results/test/*.xml
    reporter: java-junit
```

## 📝 Adding New Tests

1. **Create new feature file**
   ```gherkin
   Feature: New Feature Testing
   
   Background:
     * url baseUrl
     * def testData = read('classpath:data/new-feature.csv')
   
   Scenario Outline: Test Scenario - <testCase>
     # Test implementation
   ```

2. **Add CSV test data**
   ```csv
   testCase,param1,param2,expectedResult
   Valid Case,value1,value2,success
   Invalid Case,invalid1,invalid2,error
   ```

3. **Update test runner**
   ```java
   @Karate.Test
   Karate testNewFeature() {
       return Karate.run("new-feature").relativeTo(getClass());
   }
   ```

## 🛠️ Troubleshooting

### Common Issues
1. **Connection refused**: Ensure API Gateway backend is running on localhost:8000
2. **Test data not found**: Verify CSV files are in `src/test/java/data/` directory
3. **Schema validation failures**: Check response structure matches expected schema

### Debug Mode
```bash
./gradlew test -Dkarate.options="--debug"
```

### Logging
Karate provides detailed logging for request/response debugging:
- Request headers and body
- Response status and content
- Assertion results
- Performance metrics

## 📚 Documentation

- [Karate Official Documentation](https://github.com/karatelabs/karate)
- [API Gateway Requirements](../Requirements.md)
- [Backend API Documentation](../backend/README.md)

## 🤝 Contributing

1. Follow the existing test structure and naming conventions
2. Add comprehensive test data in CSV format
3. Include both positive and negative test scenarios
4. Update documentation for new test features
5. Ensure all tests pass before submitting changes
