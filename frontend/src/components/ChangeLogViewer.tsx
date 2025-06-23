import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CheckCircle, XCircle, Clock, Eye } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface ChangeLog {
  log_id: number
  table_name: string
  record_id: string
  field_name: string
  old_value?: string
  new_value?: string
  changed_by: string
  change_timestamp: string
  status: string
  reviewed_by?: string
  reviewed_on?: string
  approved_by?: string
  approved_on?: string
  comments?: string
}

export function ChangeLogViewer() {
  const [changeLogs, setChangeLogs] = useState<ChangeLog[]>([])
  const [pendingChanges, setPendingChanges] = useState<ChangeLog[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedChange, setSelectedChange] = useState<ChangeLog | null>(null)
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false)
  const [approvalComments, setApprovalComments] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    fetchChangeLogs()
    fetchPendingChanges()
  }, [])

  const fetchChangeLogs = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/change-logs')
      const data = await response.json()
      setChangeLogs(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch change logs",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchPendingChanges = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/change-logs/pending')
      const data = await response.json()
      setPendingChanges(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch pending changes",
        variant: "destructive"
      })
    }
  }

  const handleApproval = async (action: 'APPROVE' | 'REJECT') => {
    if (!selectedChange) return

    try {
      const response = await fetch(`http://localhost:8000/api/change-logs/${selectedChange.log_id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          approved_by: 'approver1',
          comments: approvalComments
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Change ${action.toLowerCase()}ed successfully`,
        })
        setIsApprovalDialogOpen(false)
        setSelectedChange(null)
        setApprovalComments('')
        fetchChangeLogs()
        fetchPendingChanges()
      } else {
        throw new Error(`Failed to ${action.toLowerCase()} change`)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${action.toLowerCase()} change`,
        variant: "destructive"
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>
      case 'PENDING_APPROVAL':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const openApprovalDialog = (change: ChangeLog) => {
    setSelectedChange(change)
    setApprovalComments('')
    setIsApprovalDialogOpen(true)
  }

  if (loading) {
    return <div className="flex justify-center p-4">Loading change logs...</div>
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Change Log & Approval Management</h3>
        <p className="text-sm text-gray-600">Review and approve configuration changes</p>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">
            Pending Approval ({pendingChanges.length})
          </TabsTrigger>
          <TabsTrigger value="all">
            All Changes ({changeLogs.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Approvals</CardTitle>
              <CardDescription>
                Changes waiting for approval from authorized personnel
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Table</TableHead>
                    <TableHead>Record ID</TableHead>
                    <TableHead>Field</TableHead>
                    <TableHead>Change</TableHead>
                    <TableHead>Changed By</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingChanges.map((change) => (
                    <TableRow key={change.log_id}>
                      <TableCell className="font-medium">{change.table_name}</TableCell>
                      <TableCell className="max-w-xs truncate" title={change.record_id}>
                        {change.record_id}
                      </TableCell>
                      <TableCell>{change.field_name}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm text-red-600">
                            From: {change.old_value || 'N/A'}
                          </div>
                          <div className="text-sm text-green-600">
                            To: {change.new_value || 'N/A'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{change.changed_by}</TableCell>
                      <TableCell>{formatDate(change.change_timestamp)}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openApprovalDialog(change)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {pendingChanges.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No pending changes found.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Change Logs</CardTitle>
              <CardDescription>
                Complete history of configuration changes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Table</TableHead>
                    <TableHead>Record ID</TableHead>
                    <TableHead>Field</TableHead>
                    <TableHead>Change</TableHead>
                    <TableHead>Changed By</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {changeLogs.map((change) => (
                    <TableRow key={change.log_id}>
                      <TableCell>{change.log_id}</TableCell>
                      <TableCell className="font-medium">{change.table_name}</TableCell>
                      <TableCell className="max-w-xs truncate" title={change.record_id}>
                        {change.record_id}
                      </TableCell>
                      <TableCell>{change.field_name}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm text-red-600">
                            From: {change.old_value || 'N/A'}
                          </div>
                          <div className="text-sm text-green-600">
                            To: {change.new_value || 'N/A'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{change.changed_by}</TableCell>
                      <TableCell>{getStatusBadge(change.status)}</TableCell>
                      <TableCell>{formatDate(change.change_timestamp)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {changeLogs.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No change logs found.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isApprovalDialogOpen} onOpenChange={setIsApprovalDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Change Request</DialogTitle>
            <DialogDescription>
              Review and approve or reject this configuration change
            </DialogDescription>
          </DialogHeader>
          {selectedChange && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Table</Label>
                  <div className="font-medium">{selectedChange.table_name}</div>
                </div>
                <div>
                  <Label>Record ID</Label>
                  <div className="font-medium">{selectedChange.record_id}</div>
                </div>
              </div>
              <div>
                <Label>Field Changed</Label>
                <div className="font-medium">{selectedChange.field_name}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Old Value</Label>
                  <div className="p-2 bg-red-50 border border-red-200 rounded text-red-800">
                    {selectedChange.old_value || 'N/A'}
                  </div>
                </div>
                <div>
                  <Label>New Value</Label>
                  <div className="p-2 bg-green-50 border border-green-200 rounded text-green-800">
                    {selectedChange.new_value || 'N/A'}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Changed By</Label>
                  <div className="font-medium">{selectedChange.changed_by}</div>
                </div>
                <div>
                  <Label>Change Date</Label>
                  <div className="font-medium">{formatDate(selectedChange.change_timestamp)}</div>
                </div>
              </div>
              {selectedChange.comments && (
                <div>
                  <Label>Change Comments</Label>
                  <div className="p-2 bg-gray-50 border rounded">
                    {selectedChange.comments}
                  </div>
                </div>
              )}
              <div>
                <Label htmlFor="approval_comments">Approval Comments</Label>
                <Textarea
                  id="approval_comments"
                  value={approvalComments}
                  onChange={(e) => setApprovalComments(e.target.value)}
                  placeholder="Add comments about your approval decision..."
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApprovalDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => handleApproval('REJECT')}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject
            </Button>
            <Button 
              onClick={() => handleApproval('APPROVE')}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
