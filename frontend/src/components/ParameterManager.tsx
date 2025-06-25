import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, RefreshCw } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Parameter {
  product_id: string
  subproduct_id: string
  component: string
  parameter: string
  value: string
  effective_from: string
  effective_to?: string
  created_by: string
  created_on: string
  modified_by?: string
  modified_on?: string
  status: string
}

interface ParameterManagerProps {
  user: any
  token: string
}

export function ParameterManager({ user, token }: ParameterManagerProps) {
  const [parameters, setParameters] = useState<Parameter[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingParameter, setEditingParameter] = useState<Parameter | null>(null)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    product_id: '',
    subproduct_id: '',
    component: '',
    parameter: '',
    value: '',
    effective_from: new Date().toISOString().split('T')[0],
    effective_to: '',
    created_by: 'admin',
    status: 'ACTIVE'
  })

  useEffect(() => {
    fetchParameters()
  }, [])

  const fetchParameters = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/parameters', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      setParameters(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch parameters",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const submitData = {
        ...formData,
        effective_from: new Date(formData.effective_from).toISOString(),
        effective_to: formData.effective_to ? new Date(formData.effective_to).toISOString() : null,
        created_by: user.user_id
      }

      const url = editingParameter 
        ? `http://localhost:8000/api/parameters/${editingParameter.product_id}/${editingParameter.subproduct_id}/${editingParameter.component}/${editingParameter.parameter}`
        : 'http://localhost:8000/api/parameters'
      
      const method = editingParameter ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submitData),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Parameter ${editingParameter ? 'updated' : 'created'} successfully`,
        })
        setIsDialogOpen(false)
        setEditingParameter(null)
        resetForm()
        fetchParameters()
      } else {
        throw new Error('Failed to save parameter')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save parameter",
        variant: "destructive"
      })
    }
  }

  const resetForm = () => {
    setFormData({
      product_id: '',
      subproduct_id: '',
      component: '',
      parameter: '',
      value: '',
      effective_from: new Date().toISOString().split('T')[0],
      effective_to: '',
      created_by: 'admin',
      status: 'ACTIVE'
    })
  }

  const handleEdit = (parameter: Parameter) => {
    setEditingParameter(parameter)
    setFormData({
      product_id: parameter.product_id,
      subproduct_id: parameter.subproduct_id,
      component: parameter.component,
      parameter: parameter.parameter,
      value: parameter.value,
      effective_from: parameter.effective_from.split('T')[0],
      effective_to: parameter.effective_to ? parameter.effective_to.split('T')[0] : '',
      created_by: parameter.created_by,
      status: parameter.status
    })
    setIsDialogOpen(true)
  }

  const refreshCache = async (productId: string, subproductId: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/cache/refresh/${productId}/${subproductId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Cache refreshed successfully",
        })
      } else {
        throw new Error('Failed to refresh cache')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh cache",
        variant: "destructive"
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const isEffective = (parameter: Parameter) => {
    const now = new Date()
    const effectiveFrom = new Date(parameter.effective_from)
    const effectiveTo = parameter.effective_to ? new Date(parameter.effective_to) : null
    
    return effectiveFrom <= now && (!effectiveTo || effectiveTo >= now)
  }

  if (loading) {
    return <div className="flex justify-center p-4">Loading parameters...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 flex-1 mr-4">
          <h3 className="text-lg font-semibold text-blue-900">Configurable Parameters</h3>
          <p className="text-sm text-blue-700">Manage product-specific parameters with effective dating</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => { resetForm(); setEditingParameter(null); }}
              disabled={user?.role !== 'EDITOR' && user?.role !== 'APPROVER'}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Parameter
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingParameter ? 'Edit Parameter' : 'Add New Parameter'}
              </DialogTitle>
              <DialogDescription>
                Configure parameters with effective dating for caching and request augmentation
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="product_id">Product ID</Label>
                  <Select 
                    value={formData.product_id} 
                    onValueChange={(value) => setFormData({...formData, product_id: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                      <SelectItem value="PERSONAL_LOAN">Personal Loan</SelectItem>
                      <SelectItem value="MORTGAGE">Mortgage</SelectItem>
                      <SelectItem value="AUTO_LOAN">Auto Loan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="subproduct_id">Subproduct ID</Label>
                  <Select 
                    value={formData.subproduct_id} 
                    onValueChange={(value) => setFormData({...formData, subproduct_id: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subproduct" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PREMIUM">Premium</SelectItem>
                      <SelectItem value="STANDARD">Standard</SelectItem>
                      <SelectItem value="BASIC">Basic</SelectItem>
                      <SelectItem value="SECURED">Secured</SelectItem>
                      <SelectItem value="UNSECURED">Unsecured</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="component">Component</Label>
                  <Select 
                    value={formData.component} 
                    onValueChange={(value) => setFormData({...formData, component: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select component" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SCORING">Scoring</SelectItem>
                      <SelectItem value="RISK_ASSESSMENT">Risk Assessment</SelectItem>
                      <SelectItem value="FRAUD_DETECTION">Fraud Detection</SelectItem>
                      <SelectItem value="PRICING">Pricing</SelectItem>
                      <SelectItem value="UNDERWRITING">Underwriting</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="parameter">Parameter Name</Label>
                  <Input
                    id="parameter"
                    value={formData.parameter}
                    onChange={(e) => setFormData({...formData, parameter: e.target.value})}
                    placeholder="e.g., min_score_threshold"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="value">Parameter Value</Label>
                <Input
                  id="value"
                  value={formData.value}
                  onChange={(e) => setFormData({...formData, value: e.target.value})}
                  placeholder="e.g., 700, 0.4, true"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="effective_from">Effective From</Label>
                  <Input
                    id="effective_from"
                    type="date"
                    value={formData.effective_from}
                    onChange={(e) => setFormData({...formData, effective_from: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="effective_to">Effective To (Optional)</Label>
                  <Input
                    id="effective_to"
                    type="date"
                    value={formData.effective_to}
                    onChange={(e) => setFormData({...formData, effective_to: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="created_by">Created By</Label>
                  <Input
                    id="created_by"
                    value={user?.user_id || formData.created_by}
                    disabled
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => setFormData({...formData, status: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingParameter ? 'Update' : 'Create'} Parameter
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-blue-200 shadow-lg">
        <CardHeader className="bg-blue-50 border-b border-blue-200">
          <CardTitle className="text-blue-900">Current Parameters</CardTitle>
          <CardDescription className="text-blue-700">
            {parameters.length} parameter{parameters.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-blue-50">
                <TableHead className="text-blue-900 font-semibold">Product</TableHead>
                <TableHead className="text-blue-900 font-semibold">Subproduct</TableHead>
                <TableHead className="text-blue-900 font-semibold">Component</TableHead>
                <TableHead className="text-blue-900 font-semibold">Parameter</TableHead>
                <TableHead className="text-blue-900 font-semibold">Value</TableHead>
                <TableHead className="text-blue-900 font-semibold">Effective Period</TableHead>
                <TableHead className="text-blue-900 font-semibold">Status</TableHead>
                <TableHead className="text-blue-900 font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {parameters.map((param, index) => (
                <TableRow key={index} className="hover:bg-blue-50">
                  <TableCell className="font-medium text-blue-900">{param.product_id}</TableCell>
                  <TableCell className="text-blue-900">{param.subproduct_id}</TableCell>
                  <TableCell className="text-blue-900">{param.component}</TableCell>
                  <TableCell className="text-blue-900">{param.parameter}</TableCell>
                  <TableCell className="font-mono text-sm text-blue-700">{param.value}</TableCell>
                  <TableCell>
                    <div className="text-sm text-blue-900">
                      <div>From: {formatDate(param.effective_from)}</div>
                      {param.effective_to && <div>To: {formatDate(param.effective_to)}</div>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Badge variant={param.status === 'ACTIVE' ? 'default' : 'secondary'}
                             className={param.status === 'ACTIVE' ? 'bg-blue-600' : 'bg-blue-200 text-blue-800'}>
                        {param.status}
                      </Badge>
                      {isEffective(param) && (
                        <Badge variant="outline" className="text-blue-600 border-blue-600">
                          Current
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(param)}
                        disabled={user?.role !== 'EDITOR' && user?.role !== 'APPROVER'}
                        className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => refreshCache(param.product_id, param.subproduct_id)}
                        className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {parameters.length === 0 && (
            <div className="text-center py-8 text-blue-600">
              No parameters found. Add your first parameter to get started.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
