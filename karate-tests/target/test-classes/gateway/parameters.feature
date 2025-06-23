Feature: Configurable Parameters Management

Background:
  * url baseUrl
  * def paramData = read('classpath:data/parameters.csv')

@smoke
Scenario: Get All Parameters
  Given path 'api/parameters'
  When method GET
  Then status 200
  And match response == '#[]'
  And match each response == 
    """
    {
      id: '#number',
      product_id: '#string',
      subproduct_id: '#string',
      component: '#string',
      parameter_name: '#string',
      parameter_value: '#string',
      effective_from: '#string',
      effective_to: '#string?',
      status: '#string',
      created_by: '#string',
      created_on: '#string',
      modified_by: '#string?',
      modified_on: '#string?'
    }
    """

@regression
Scenario Outline: Create Parameter - <testCase>
  Given path 'api/parameters'
  And request 
    """
    {
      "product_id": "<productId>",
      "subproduct_id": "<subproductId>",
      "component": "<component>",
      "parameter_name": "<parameterName>",
      "parameter_value": "<parameterValue>",
      "effective_from": "<effectiveFrom>",
      "effective_to": "<effectiveTo>",
      "status": "<status>",
      "created_by": "<createdBy>"
    }
    """
  When method POST
  Then status <expectedStatus>
  
  # Validate response structure for successful creation
  * if (expectedStatus == 201) match response.parameter_name == '<parameterName>'
  * if (expectedStatus == 201) match response.parameter_value == '<parameterValue>'

Examples:
| testCase | productId | subproductId | component | parameterName | parameterValue | effectiveFrom | effectiveTo | status | createdBy | expectedStatus |
| Credit Card Scoring | CREDIT_CARD | PREMIUM | SCORING | max_credit_limit | 50000 | 2024-01-01T00:00:00Z | # | ACTIVE | test_user | 201 |
| Risk Assessment | CREDIT_CARD | STANDARD | RISK_ASSESSMENT | risk_threshold | 0.75 | 2024-01-01T00:00:00Z | # | ACTIVE | test_user | 201 |
| Mortgage Rate | MORTGAGE | STANDARD | PRICING | base_rate | 3.5 | 2024-01-01T00:00:00Z | 2024-12-31T23:59:59Z | ACTIVE | test_user | 201 |
| Invalid Product | INVALID | PRODUCT | TEST | test_param | test_value | 2024-01-01T00:00:00Z | # | ACTIVE | test_user | 400 |

@regression
Scenario: Parameter Cache Refresh
  Given path 'api/parameters/refresh-cache'
  And request 
    """
    {
      "product_id": "CREDIT_CARD",
      "subproduct_id": "PREMIUM"
    }
    """
  When method POST
  Then status 200
  And match response.message == '#string'
  And match response.cached_parameters == '#object'

@performance
Scenario: Parameter Retrieval Performance
  Given path 'api/parameters'
  And param product_id = 'CREDIT_CARD'
  And param subproduct_id = 'PREMIUM'
  When method GET
  Then status 200
  And assert responseTime < 2000
