Feature: Delete Configuration Helper

Scenario: Delete a Configuration
  * def configId = __arg.configId
  * url baseUrl
  
  Given path 'api/fico-configs', configId
  When method DELETE
  Then status 204
  
  * karate.log('Configuration', configId, 'deleted successfully')
