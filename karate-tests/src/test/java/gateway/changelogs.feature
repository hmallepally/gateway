Feature: Change Log Management

Background:
  * url baseUrl

@smoke
Scenario: Get All Changes
  Given path 'api/changes'
  When method GET
  Then status 200
  And match response == '#[]'
  And match each response == 
    """
    {
      id: '#number',
      table_name: '#string',
      record_id: '#number',
      field_name: '#string',
      old_value: '#string?',
      new_value: '#string',
      change_type: '#string',
      status: '#string',
      changed_by: '#string',
      changed_on: '#string',
      approved_by: '#string?',
      approved_on: '#string?'
    }
    """

@regression
Scenario: Get Pending Changes
  Given path 'api/changes/pending'
  When method GET
  Then status 200
  And match response == '#[]'
  * def pendingChanges = response
  * karate.log('Pending changes count:', pendingChanges.length)

@regression
Scenario: Approve Change Workflow
  # First create a configuration to generate a change log entry
  Given path 'api/fico-configs'
  And request 
    """
    {
      "product_code": "APPROVAL_TEST:CONFIG",
      "version": "1.0",
      "url": "https://approval-test.example.com/api",
      "authentication_url": "https://approval-test.example.com/auth",
      "client_id": "approval_client",
      "secret": "approval_secret",
      "status": "ACTIVE",
      "created_by": "editor_user"
    }
    """
  When method POST
  Then status 201
  * def configId = response.id
  
  # Check if change log entry was created
  Given path 'api/changes'
  And param table_name = 'fico_environment_config'
  And param record_id = configId
  When method GET
  Then status 200
  * def changes = response
  * def createChange = karate.filter(changes, function(x){ return x.change_type == 'CREATE' && x.record_id == configId })[0]
  
  # Approve the change if it exists and is pending
  * if (createChange && createChange.status == 'PENDING') karate.call('approve-change.feature', {changeId: createChange.id})

@regression
Scenario: Reject Change Workflow
  # Create a parameter to generate a change log entry
  Given path 'api/parameters'
  And request 
    """
    {
      "product_id": "REJECT_TEST",
      "subproduct_id": "CONFIG",
      "component": "TEST",
      "parameter_name": "reject_test_param",
      "parameter_value": "reject_value",
      "effective_from": "2024-01-01T00:00:00Z",
      "status": "ACTIVE",
      "created_by": "editor_user"
    }
    """
  When method POST
  Then status 201
  * def paramId = response.id
  
  # Check for change log entry
  Given path 'api/changes'
  And param table_name = 'configurable_parameters'
  And param record_id = paramId
  When method GET
  Then status 200
  * def changes = response
  * def createChange = karate.filter(changes, function(x){ return x.change_type == 'CREATE' && x.record_id == paramId })[0]
  
  # Reject the change if it exists and is pending
  * if (createChange && createChange.status == 'PENDING') karate.call('reject-change.feature', {changeId: createChange.id})
