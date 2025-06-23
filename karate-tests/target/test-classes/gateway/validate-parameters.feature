Feature: Parameter Validation Helper

Scenario: Validate Parameter Augmentation
  * def response = __arg.response
  * def productId = __arg.productId
  * def subproductId = __arg.subproductId
  
  # Check if parameters were augmented in the response
  * def responseBody = response.body
  * if (responseBody.parameters) karate.log('Parameters found:', responseBody.parameters)
  
  # Validate parameter structure if present
  * if (responseBody.parameters) match responseBody.parameters == '#object'
  
  # Log parameter augmentation for debugging
  * karate.log('Parameter validation completed for:', productId + '/' + subproductId)
