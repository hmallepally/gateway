import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Eye, EyeOff } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface FicoConfig {
  product_code: string
  version: string
  url: string
  authentication_url: string
  client_id: string
  secret: string
  created_by: string
  created_on: string
  modified_by?: string
  modified_on?: string
  status: string
}

interface FicoConfigManagerProps {
  user: any
  token: string
}

export function FicoConfigManager({ user, token }: FicoConfigManagerProps) {
  const [configs, setConfigs] = useState<FicoConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingConfig, setEditingConfig] = useState<FicoConfig | null>(null)
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    product_code: '',
    version: '',
    url: '',
    authentication_url: '',
    client_id: '',
    secret: '',
    created_by: 'admin',
    status: 'ACTIVE'
  })

  useEffect(() => {
    fetchConfigs()
  }, [])

  const fetchConfigs = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/fico-configs', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      setConfigs(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch configurations",
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
        created_by: user.user_id
      }

      const url = editingConfig 
        ? `http://localhost:8000/api/fico-configs/${editingConfig.product_code}/${editingConfig.version}`
        : 'http://localhost:8000/api/fico-configs'
      
      const method = editingConfig ? 'PUT' : 'POST'
      
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
          description: `Configuration ${editingConfig ? 'updated' : 'created'} successfully`,
        })
        setIsDialogOpen(false)
        setEditingConfig(null)
        resetForm()
        fetchConfigs()
      } else {
        throw new Error('Failed to save configuration')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save configuration",
        variant: "destructive"
      })
    }
  }

  const resetForm = () => {
    setFormData({
      product_code: '',
      version: '',
      url: '',
      authentication_url: '',
      client_id: '',
      secret: '',
      created_by: 'admin',
      status: 'ACTIVE'
    })
  }

  const handleEdit = (config: FicoConfig) => {
    setEditingConfig(config)
    setFormData({
      product_code: config.product_code,
      version: config.version,
      url: config.url,
      authentication_url: config.authentication_url,
      client_id: config.client_id,
      secret: config.secret,
      created_by: config.created_by,
      status: config.status
    })
    setIsDialogOpen(true)
  }

  const toggleSecretVisibility = (key: string) => {
    setShowSecrets(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const maskSecret = (secret: string) => {
    return '*'.repeat(secret.length)
  }

  if (loading) {
    return <div className="flex justify-center p-4">Loading configurations...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 flex-1 mr-4">
          <h3 className="text-lg font-semibold text-blue-900">Fico Environment Configurations</h3>
          <p className="text-sm text-blue-700">Manage PLOR and DM environment settings</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => { resetForm(); setEditingConfig(null); }}
              disabled={user?.role !== 'EDITOR' && user?.role !== 'APPROVER'}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Configuration
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingConfig ? 'Edit Configuration' : 'Add New Configuration'}
              </DialogTitle>
              <DialogDescription>
                Configure Fico environment settings for PLOR or DM systems
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="product_code">Product Code</Label>
                  <Select 
                    value={formData.product_code} 
                    onValueChange={(value) => setFormData({...formData, product_code: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PLOR">PLOR</SelectItem>
                      <SelectItem value="DM">DM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="version">Version</Label>
                  <Input
                    id="version"
                    value={formData.version}
                    onChange={(e) => setFormData({...formData, version: e.target.value})}
                    placeholder="e.g., 1.2, 2.0"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="url">API URL</Label>
                <Input
                  id="url"
                  value={formData.url}
                  onChange={(e) => setFormData({...formData, url: e.target.value})}
                  placeholder="https://api.fico.com/plor/process"
                  required
                />
              </div>
              <div>
                <Label htmlFor="authentication_url">Authentication URL</Label>
                <Input
                  id="authentication_url"
                  value={formData.authentication_url}
                  onChange={(e) => setFormData({...formData, authentication_url: e.target.value})}
                  placeholder="https://auth.fico.com/oauth/token"
                  required
                />
              </div>
              <div>
                <Label htmlFor="client_id">Client ID</Label>
                <Input
                  id="client_id"
                  value={formData.client_id}
                  onChange={(e) => setFormData({...formData, client_id: e.target.value})}
                  placeholder="client_id_123"
                  required
                />
              </div>
              <div>
                <Label htmlFor="secret">Client Secret</Label>
                <Input
                  id="secret"
                  type="password"
                  value={formData.secret}
                  onChange={(e) => setFormData({...formData, secret: e.target.value})}
                  placeholder="client_secret_456"
                  required
                />
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
                  {editingConfig ? 'Update' : 'Create'} Configuration
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-blue-200 shadow-lg">
        <CardHeader className="bg-blue-50 border-b border-blue-200">
          <CardTitle className="text-blue-900">Current Configurations</CardTitle>
          <CardDescription className="text-blue-700">
            {configs.length} configuration{configs.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-blue-50">
                <TableHead className="text-blue-900 font-semibold">Product</TableHead>
                <TableHead className="text-blue-900 font-semibold">Version</TableHead>
                <TableHead className="text-blue-900 font-semibold">API URL</TableHead>
                <TableHead className="text-blue-900 font-semibold">Client ID</TableHead>
                <TableHead className="text-blue-900 font-semibold">Secret</TableHead>
                <TableHead className="text-blue-900 font-semibold">Status</TableHead>
                <TableHead className="text-blue-900 font-semibold">Created By</TableHead>
                <TableHead className="text-blue-900 font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {configs.map((config) => {
                const configKey = `${config.product_code}-${config.version}`
                return (
                  <TableRow key={configKey} className="hover:bg-blue-50">
                    <TableCell className="font-medium text-blue-900">{config.product_code}</TableCell>
                    <TableCell className="text-blue-900">{config.version}</TableCell>
                    <TableCell className="max-w-xs truncate text-blue-700" title={config.url}>
                      {config.url}
                    </TableCell>
                    <TableCell className="text-blue-900">{config.client_id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-blue-900">
                          {showSecrets[configKey] ? config.secret : maskSecret(config.secret)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSecretVisibility(configKey)}
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                        >
                          {showSecrets[configKey] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={config.status === 'ACTIVE' ? 'default' : 'secondary'}
                             className={config.status === 'ACTIVE' ? 'bg-blue-600' : 'bg-blue-200 text-blue-800'}>
                        {config.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-blue-900">{config.created_by}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(config)}
                          disabled={user?.role !== 'EDITOR' && user?.role !== 'APPROVER'}
                          className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          {configs.length === 0 && (
            <div className="text-center py-8 text-blue-600">
              No configurations found. Add your first configuration to get started.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
