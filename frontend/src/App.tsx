
import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FicoConfigManager } from '@/components/FicoConfigManager'
import { ParameterManager } from '@/components/ParameterManager'
import { ChangeLogViewer } from '@/components/ChangeLogViewer'
import { GatewayTester } from '@/components/GatewayTester'
import { LoginForm } from '@/components/LoginForm'
import './App.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [token, setToken] = useState('')

  useEffect(() => {
    const savedToken = localStorage.getItem('access_token')
    const savedUser = localStorage.getItem('user')
    
    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
      setIsAuthenticated(true)
    }
  }, [])

  const handleLogin = (accessToken: string, userData: any) => {
    setToken(accessToken)
    setUser(userData)
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    setToken('')
    setUser(null)
    setIsAuthenticated(false)
  }

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex justify-between items-center bg-white rounded-lg shadow-md p-6 border border-blue-200">
          <div>
            <h1 className="text-3xl font-bold text-blue-900 mb-2">API Gateway Configuration Management</h1>
            <p className="text-blue-700">Welcome back, {user?.name} ({user?.role})</p>
          </div>
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400"
          >
            Sign Out
          </Button>
        </header>

        <Tabs defaultValue="configs" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 bg-white border border-blue-200 shadow-sm">
            <TabsTrigger 
              value="configs" 
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-700 hover:bg-blue-50"
            >
              Fico Configurations
            </TabsTrigger>
            <TabsTrigger 
              value="parameters"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-700 hover:bg-blue-50"
            >
              Parameters
            </TabsTrigger>
            <TabsTrigger 
              value="changes"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-700 hover:bg-blue-50"
            >
              Change Log
            </TabsTrigger>
            <TabsTrigger 
              value="gateway"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-700 hover:bg-blue-50"
            >
              Gateway Tester
            </TabsTrigger>
          </TabsList>

          <TabsContent value="configs" className="space-y-4">
            <Card className="shadow-lg border border-blue-200">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
                <CardTitle className="text-xl font-bold">Fico Environment Configurations</CardTitle>
                <CardDescription className="text-blue-100">
                  Manage Fico PLOR and DM environment configurations including URLs, authentication, and credentials
                </CardDescription>
              </CardHeader>
              <CardContent className="bg-white p-6">
                <FicoConfigManager user={user} token={token} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="parameters" className="space-y-4">
            <Card className="shadow-lg border border-blue-200">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
                <CardTitle className="text-xl font-bold">Configurable Parameters</CardTitle>
                <CardDescription className="text-blue-100">
                  Manage product-specific parameters with effective dating and caching support
                </CardDescription>
              </CardHeader>
              <CardContent className="bg-white p-6">
                <ParameterManager user={user} token={token} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="changes" className="space-y-4">
            <Card className="shadow-lg border border-blue-200">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
                <CardTitle className="text-xl font-bold">Change Log & Approvals</CardTitle>
                <CardDescription className="text-blue-100">
                  Review pending changes and manage approval workflow
                </CardDescription>
              </CardHeader>
              <CardContent className="bg-white p-6">
                <ChangeLogViewer user={user} token={token} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gateway" className="space-y-4">
            <Card className="shadow-lg border border-blue-200">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
                <CardTitle className="text-xl font-bold">Gateway Request Tester</CardTitle>
                <CardDescription className="text-blue-100">
                  Test the API Gateway functionality with request routing and parameter augmentation
                </CardDescription>
              </CardHeader>
              <CardContent className="bg-white p-6">
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
