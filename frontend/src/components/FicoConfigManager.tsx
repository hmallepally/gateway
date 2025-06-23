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

export function FicoConfigManager() {
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
      const response = await fetch('http://localhost:8000/api/fico-configs')
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
      const url = editingConfig 
        ? `http://localhost:8000/api/fico-configs/${editingConfig.product_code}/${editingConfig.version}`
        : 'http://localhost:8000/api/fico-configs'
      
      const method = editingConfig ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
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
        <div>
          <h3 className="text-lg font-semibold">Fico Environment Configurations</h3>
          <p className="text-sm text-gray-600">Manage PLOR and DM environment settings</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setEditingConfig(null); }}>
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
                    value={formData.created_by}
                    onChange={(e) => setFormData({...formData, created_by: e.target.value})}
                    required
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

      <Card>
        <CardHeader>
          <CardTitle>Current Configurations</CardTitle>
          <CardDescription>
            {configs.length} configuration{configs.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>API URL</TableHead>
                <TableHead>Client ID</TableHead>
                <TableHead>Secret</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {configs.map((config) => {
                const configKey = `${config.product_code}-${config.version}`
                return (
                  <TableRow key={configKey}>
                    <TableCell className="font-medium">{config.product_code}</TableCell>
                    <TableCell>{config.version}</TableCell>
                    <TableCell className="max-w-xs truncate" title={config.url}>
                      {config.url}
                    </TableCell>
                    <TableCell>{config.client_id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">
                          {showSecrets[configKey] ? config.secret : maskSecret(config.secret)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSecretVisibility(configKey)}
                        >
                          {showSecrets[configKey] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={config.status === 'ACTIVE' ? 'default' : 'secondary'}>
                        {config.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{config.created_by}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(config)}
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
            <div className="text-center py-8 text-gray-500">
              No configurations found. Add your first configuration to get started.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
