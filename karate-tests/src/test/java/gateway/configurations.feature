Feature: Fico Configuration Management

Background:
  * url baseUrl
  * def configData = read('classpath:data/fico-configs.csv')

@smoke
Scenario: Get All Configurations
  Given path 'api/fico-configs'
  When method GET
  Then status 200
  And match response == '#[]'
  And match each response == 
    """
    {
      id: '#number',
      product_code: '#string',
      version: '#string',
      url: '#string',
      authentication_url: '#string',
      client_id: '#string',
      secret: '#string',
      status: '#string',
      created_by: '#string',
      created_on: '#string',
      modified_by: '#string?',
      modified_on: '#string?'
    }
    """

@regression
Scenario Outline: Create Fico Configuration - <testCase>
  Given path 'api/fico-configs'
  And request 
    """
    {
      "product_code": "<productCode>",
      "version": "<version>",
      "url": "<url>",
      "authentication_url": "<authUrl>",
      "client_id": "<clientId>",
      "secret": "<secret>",
      "status": "<status>",
      "created_by": "<createdBy>"
    }
    """
  When method POST
  Then status <expectedStatus>
  
  # Store created config ID for cleanup
  * if (expectedStatus == 201) def createdConfigId = response.id
  * if (expectedStatus == 201) karate.set('createdConfigs', createdConfigId)

Examples:
| testCase | productCode | version | url | authUrl | clientId | secret | status | createdBy | expectedStatus |
| Valid Credit Card | CREDIT_CARD:GOLD | 2.0 | https://fico-gold.example.com/api | https://fico-gold.example.com/auth | gold_client | gold_secret | ACTIVE | test_user | 201 |
| Valid Mortgage | MORTGAGE:STANDARD | 1.5 | https://fico-mortgage.example.com/api | https://fico-mortgage.example.com/auth | mortgage_client | mortgage_secret | ACTIVE | test_user | 201 |
| Duplicate Product | CREDIT_CARD:PREMIUM | 1.0 | https://duplicate.example.com/api | https://duplicate.example.com/auth | dup_client | dup_secret | ACTIVE | test_user | 409 |

@regression
Scenario: Update Fico Configuration
  # First create a config to update
  Given path 'api/fico-configs'
  And request 
    """
    {
      "product_code": "UPDATE_TEST:CONFIG",
      "version": "1.0",
      "url": "https://original.example.com/api",
      "authentication_url": "https://original.example.com/auth",
      "client_id": "original_client",
      "secret": "original_secret",
      "status": "ACTIVE",
      "created_by": "test_user"
    }
    """
  When method POST
  Then status 201
  * def configId = response.id
  
  # Now update the config
  Given path 'api/fico-configs', configId
  And request 
    """
    {
      "product_code": "UPDATE_TEST:CONFIG",
      "version": "1.0",
      "url": "https://updated.example.com/api",
      "authentication_url": "https://updated.example.com/auth",
      "client_id": "updated_client",
      "secret": "updated_secret",
      "status": "ACTIVE",
      "modified_by": "test_user"
    }
    """
  When method PUT
  Then status 200
  And match response.url == 'https://updated.example.com/api'
  And match response.client_id == 'updated_client'

@cleanup
Scenario: Delete Test Configurations
  # Clean up any test configurations created during testing
  Given path 'api/fico-configs'
  When method GET
  Then status 200
  * def configs = response
  * def testConfigs = karate.filter(configs, function(x){ return x.product_code.includes('TEST') || x.created_by == 'test_user' })
  * karate.forEach(testConfigs, function(config){ karate.call('delete-config.feature', {configId: config.id}) })
