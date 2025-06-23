
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FicoConfigManager } from '@/components/FicoConfigManager'
import { ParameterManager } from '@/components/ParameterManager'
import { ChangeLogViewer } from '@/components/ChangeLogViewer'
import { GatewayTester } from '@/components/GatewayTester'
import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">API Gateway Configuration Management</h1>
          <p className="text-gray-600">Manage Fico environment configurations, parameters, and monitor changes</p>
        </header>

        <Tabs defaultValue="configs" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="configs">Fico Configurations</TabsTrigger>
            <TabsTrigger value="parameters">Parameters</TabsTrigger>
            <TabsTrigger value="changes">Change Log</TabsTrigger>
            <TabsTrigger value="gateway">Gateway Tester</TabsTrigger>
          </TabsList>

          <TabsContent value="configs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Fico Environment Configurations</CardTitle>
                <CardDescription>
                  Manage Fico PLOR and DM environment configurations including URLs, authentication, and credentials
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FicoConfigManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="parameters" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configurable Parameters</CardTitle>
                <CardDescription>
                  Manage product-specific parameters with effective dating and caching support
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ParameterManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="changes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Change Log & Approvals</CardTitle>
                <CardDescription>
                  Review pending changes and manage approval workflow
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChangeLogViewer />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gateway" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Gateway Request Tester</CardTitle>
                <CardDescription>
                  Test the API Gateway functionality with request routing and parameter augmentation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GatewayTester />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default App
