Feature: Approve Change Helper

Scenario: Approve a Change
  * def changeId = __arg.changeId
  * url baseUrl
  
  Given path 'api/changes', changeId, 'approve'
  And request 
    """
    {
      "approved_by": "approver_user",
      "comments": "Approved via automated test"
    }
    """
  When method POST
  Then status 200
  And match response.status == 'APPROVED'
  And match response.approved_by == 'approver_user'
  
  * karate.log('Change', changeId, 'approved successfully')
