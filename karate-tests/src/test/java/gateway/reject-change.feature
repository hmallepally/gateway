Feature: Reject Change Helper

Scenario: Reject a Change
  * def changeId = __arg.changeId
  * url baseUrl
  
  Given path 'api/changes', changeId, 'reject'
  And request 
    """
    {
      "approved_by": "approver_user",
      "comments": "Rejected via automated test - invalid configuration"
    }
    """
  When method POST
  Then status 200
  And match response.status == 'REJECTED'
  And match response.approved_by == 'approver_user'
  
  * karate.log('Change', changeId, 'rejected successfully')
