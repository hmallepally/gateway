Feature: API Gateway Request Processing

Background:
  * url baseUrl
  * def testData = read('classpath:data/gateway-requests.csv')

@smoke
Scenario: Health Check
  Given path 'health'
  When method GET
  Then status 200
  And match response == { status: 'healthy' }

@regression
Scenario Outline: Gateway Request Processing - <testCase>
  Given path 'api/gateway/process'
  And request 
    """
    {
      "headers": { "Content-Type": "application/json" },
      "body": {
        "bomVersionId": "<bomVersionId>",
        "customerId": "<customerId>",
        "applicationId": "<applicationId>",
        "requestType": "<requestType>",
        "productId": "<productId>",
        "subproductId": "<subproductId>"
      },
      "method": "POST"
    }
    """
  When method POST
  Then status <expectedStatus>
  And match response.status_code == <expectedResponseStatus>
  
  # Validate parameter augmentation if successful
  * if (expectedStatus == 200) karate.call('validate-parameters.feature', { response: response, productId: '<productId>', subproductId: '<subproductId>' })

Examples:
| testCase | bomVersionId | customerId | applicationId | requestType | productId | subproductId | expectedStatus | expectedResponseStatus |
| Credit Card Premium | CREDIT_CARD:PREMIUM:1.0 | CUST_12345 | APP_67890 | Scoring | CREDIT_CARD | PREMIUM | 200 | 200 |
| PLOR Standard | PLOR:STANDARD:1.2 | CUST_99999 | APP_PLOR | Processing | PLOR | STANDARD | 200 | 200 |
| Invalid Product | INVALID:PRODUCT:1.0 | CUST_ERROR | APP_ERROR | Test | INVALID | PRODUCT | 404 | # |
| Missing BomVersionId | # | CUST_MISSING | APP_MISSING | Test | MISSING | VERSION | 400 | # |

@performance
Scenario: Gateway Performance Test
  Given path 'api/gateway/process'
  And request 
    """
    {
      "headers": { "Content-Type": "application/json" },
      "body": {
        "bomVersionId": "CREDIT_CARD:PREMIUM:1.0",
        "customerId": "PERF_TEST_001",
        "applicationId": "PERF_APP_001",
        "requestType": "Scoring",
        "productId": "CREDIT_CARD",
        "subproductId": "PREMIUM"
      },
      "method": "POST"
    }
    """
  When method POST
  Then status 200
  And assert responseTime < 5000
  And match response.status_code == 200
