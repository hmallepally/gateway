import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Send, Copy, RefreshCw } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface GatewayResponse {
  status_code: number
  data: any
}

export function GatewayTester() {
  const [requestData, setRequestData] = useState({
    bomVersionId: 'CREDIT_CARD:PREMIUM:1.0',
    customerId: 'CUST_12345',
    applicationId: 'APP_67890',
    requestType: 'SCORING'
  })
  const [customJson, setCustomJson] = useState('')
  const [response, setResponse] = useState<GatewayResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('form')
  const { toast } = useToast()

  const sampleRequests = {
    creditCard: {
      bomVersionId: 'CREDIT_CARD:PREMIUM:1.0',
      customerId: 'CUST_12345',
      applicationId: 'APP_67890',
      requestType: 'SCORING',
      customerData: {
        creditScore: 750,
        annualIncome: 85000,
        employmentStatus: 'EMPLOYED',
        debtToIncomeRatio: 0.25
      }
    },
    personalLoan: {
      bomVersionId: 'PERSONAL_LOAN:SECURED:2.1',
      customerId: 'CUST_54321',
      applicationId: 'APP_09876',
      requestType: 'RISK_ASSESSMENT',
      loanData: {
        requestedAmount: 50000,
        collateralValue: 60000,
        loanPurpose: 'HOME_IMPROVEMENT'
      }
    },
    mortgage: {
      bomVersionId: 'MORTGAGE:CONVENTIONAL:3.0',
      customerId: 'CUST_98765',
      applicationId: 'APP_13579',
      requestType: 'UNDERWRITING',
      mortgageData: {
        loanAmount: 350000,
        propertyValue: 400000,
        downPayment: 50000,
        creditScore: 780
      }
    }
  }

  const sendGatewayRequest = async () => {
    setLoading(true)
    try {
      let requestBody
      if (activeTab === 'form') {
        requestBody = {
          ...requestData,
          timestamp: new Date().toISOString()
        }
      } else {
        requestBody = JSON.parse(customJson)
      }

      const gatewayRequest = {
        headers: {
          'Content-Type': 'application/json'
        },
        body: requestBody,
        method: 'POST'
      }

      const response = await fetch('http://localhost:8000/gateway', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(gatewayRequest),
      })

      const data = await response.json()
      setResponse({
        status_code: response.status,
        data
      })

      toast({
        title: "Request Sent",
        description: `Gateway responded with status ${response.status}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send gateway request",
        variant: "destructive"
      })
      setResponse({
        status_code: 500,
        data: { error: error instanceof Error ? error.message : 'Unknown error' }
      })
    } finally {
      setLoading(false)
    }
  }

  const loadSampleRequest = (sampleKey: keyof typeof sampleRequests) => {
    const sample = sampleRequests[sampleKey]
    setRequestData({
      bomVersionId: sample.bomVersionId,
      customerId: sample.customerId,
      applicationId: sample.applicationId,
      requestType: sample.requestType
    })
    setCustomJson(JSON.stringify(sample, null, 2))
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied",
      description: "Content copied to clipboard",
    })
  }

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900">Gateway Request Tester</h3>
        <p className="text-sm text-blue-700">Test API Gateway routing and parameter augmentation</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-blue-200 shadow-lg">
          <CardHeader className="bg-blue-50 border-b border-blue-200">
            <CardTitle className="text-blue-900">Request Configuration</CardTitle>
            <CardDescription className="text-blue-700">
              Configure your gateway request or use sample data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2 mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadSampleRequest('creditCard')}
                  className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400"
                >
                  Credit Card Sample
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadSampleRequest('personalLoan')}
                  className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400"
                >
                  Personal Loan Sample
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadSampleRequest('mortgage')}
                  className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400"
                >
                  Mortgage Sample
                </Button>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 bg-white border border-blue-200">
                  <TabsTrigger value="form" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-700 hover:bg-blue-50">Form Input</TabsTrigger>
                  <TabsTrigger value="json" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-700 hover:bg-blue-50">JSON Input</TabsTrigger>
                </TabsList>

                <TabsContent value="form" className="space-y-4">
                  <div>
                    <Label htmlFor="bomVersionId" className="text-blue-700 font-medium">BOM Version ID</Label>
                    <Input
                      id="bomVersionId"
                      value={requestData.bomVersionId}
                      onChange={(e) => setRequestData({...requestData, bomVersionId: e.target.value})}
                      placeholder="PRODUCT:SUBPRODUCT:VERSION"
                      className="border-blue-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                    <p className="text-xs text-blue-600 mt-1">
                      Format: PRODUCT:SUBPRODUCT:VERSION (e.g., CREDIT_CARD:PREMIUM:1.0)
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="customerId" className="text-blue-700 font-medium">Customer ID</Label>
                      <Input
                        id="customerId"
                        value={requestData.customerId}
                        onChange={(e) => setRequestData({...requestData, customerId: e.target.value})}
                        placeholder="CUST_12345"
                        className="border-blue-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="applicationId" className="text-blue-700 font-medium">Application ID</Label>
                      <Input
                        id="applicationId"
                        value={requestData.applicationId}
                        onChange={(e) => setRequestData({...requestData, applicationId: e.target.value})}
                        placeholder="APP_67890"
                        className="border-blue-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="requestType" className="text-blue-700 font-medium">Request Type</Label>
                    <Select 
                      value={requestData.requestType} 
                      onValueChange={(value) => setRequestData({...requestData, requestType: value})}
                    >
                      <SelectTrigger className="border-blue-300 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SCORING">Scoring</SelectItem>
                        <SelectItem value="RISK_ASSESSMENT">Risk Assessment</SelectItem>
                        <SelectItem value="FRAUD_DETECTION">Fraud Detection</SelectItem>
                        <SelectItem value="UNDERWRITING">Underwriting</SelectItem>
                        <SelectItem value="PRICING">Pricing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>

                <TabsContent value="json" className="space-y-4">
                  <div>
                    <Label htmlFor="customJson" className="text-blue-700 font-medium">Custom JSON Request</Label>
                    <Textarea
                      id="customJson"
                      value={customJson}
                      onChange={(e) => setCustomJson(e.target.value)}
                      placeholder="Enter your custom JSON request here..."
                      rows={12}
                      className="font-mono text-sm border-blue-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <Button 
                onClick={sendGatewayRequest} 
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Send Gateway Request
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 shadow-lg">
          <CardHeader className="bg-blue-50 border-b border-blue-200">
            <CardTitle className="text-blue-900">Response</CardTitle>
            <CardDescription className="text-blue-700">
              Gateway response with routing and parameter augmentation results
            </CardDescription>
          </CardHeader>
          <CardContent>
            {response ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge 
                    variant={response.status_code < 400 ? "default" : "destructive"}
                    className={response.status_code < 400 ? "bg-blue-600 text-white" : "bg-red-600 text-white"}
                  >
                    Status: {response.status_code}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(JSON.stringify(response.data, null, 2))}
                    className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400"
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </Button>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <pre className="text-sm overflow-auto max-h-96 text-blue-900">
                    {JSON.stringify(response.data, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-blue-600">
                No response yet. Send a request to see the gateway response.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-blue-200 shadow-lg">
        <CardHeader className="bg-blue-50 border-b border-blue-200">
          <CardTitle className="text-blue-900">Gateway Testing Guide</CardTitle>
          <CardDescription className="text-blue-700">
            Understanding how the API Gateway processes requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2 text-blue-900">Request Routing</h4>
              <p className="text-sm text-blue-700">
                The gateway extracts the <code className="bg-blue-100 px-1 rounded text-blue-800">bomVersionId</code> from your request 
                to determine which Fico environment (PLOR/DM) to route to based on the product and version.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-blue-900">Parameter Augmentation</h4>
              <p className="text-sm text-blue-700">
                Cached parameters matching your product/subproduct are automatically added to your request 
                before forwarding to the Fico endpoint. Check the response to see augmented parameters.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-blue-900">Sample BOM Version IDs</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li><code className="bg-blue-100 px-1 rounded text-blue-800">CREDIT_CARD:PREMIUM:1.0</code> - Premium credit card processing</li>
                <li><code className="bg-blue-100 px-1 rounded text-blue-800">PERSONAL_LOAN:SECURED:2.1</code> - Secured personal loan assessment</li>
                <li><code className="bg-blue-100 px-1 rounded text-blue-800">MORTGAGE:CONVENTIONAL:3.0</code> - Conventional mortgage underwriting</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
