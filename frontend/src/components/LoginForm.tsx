import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

interface LoginFormProps {
  onLogin: (token: string, user: any) => void
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('email', email)
      formData.append('password', password)
      
      const authResponse = await fetch('http://localhost:8000/auth/oauth/authorize', {
        method: 'POST',
        body: formData
      })

      if (!authResponse.ok) {
        throw new Error('Invalid credentials')
      }

      const { authorization_code } = await authResponse.json()

      const tokenFormData = new FormData()
      tokenFormData.append('authorization_code', authorization_code)
      
      const tokenResponse = await fetch('http://localhost:8000/auth/oauth/token', {
        method: 'POST',
        body: tokenFormData
      })

      if (!tokenResponse.ok) {
        throw new Error('Failed to get access token')
      }

      const tokenData = await tokenResponse.json()
      
      localStorage.setItem('access_token', tokenData.access_token)
      localStorage.setItem('user', JSON.stringify(tokenData.user))
      
      onLogin(tokenData.access_token, tokenData.user)
      
      toast({
        title: "Success",
        description: `Welcome back, ${tokenData.user.name}!`
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid email or password",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto shadow-xl border-blue-200">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
          <CardTitle className="text-2xl font-bold text-center">Sign In</CardTitle>
          <CardDescription className="text-blue-100 text-center">
            Enter your credentials to access the API Gateway Management System
          </CardDescription>
        </CardHeader>
        <CardContent className="bg-white p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-blue-700 font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="editor@example.com"
                className="border-blue-300 focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-blue-700 font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="border-blue-300 focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200" 
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mt-4">
              <p className="text-blue-800 font-semibold mb-2">Test Accounts:</p>
              <p className="text-blue-700 text-sm">Editor: editor@example.com / editor123</p>
              <p className="text-blue-700 text-sm">Approver: approver@example.com / approver123</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
