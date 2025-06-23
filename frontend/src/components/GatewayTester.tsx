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
      <div>
        <h3 className="text-lg font-semibold">Gateway Request Tester</h3>
        <p className="text-sm text-gray-600">Test API Gateway routing and parameter augmentation</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Request Configuration</CardTitle>
            <CardDescription>
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
                >
                  Credit Card Sample
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadSampleRequest('personalLoan')}
                >
                  Personal Loan Sample
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadSampleRequest('mortgage')}
                >
                  Mortgage Sample
                </Button>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="form">Form Input</TabsTrigger>
                  <TabsTrigger value="json">JSON Input</TabsTrigger>
                </TabsList>

                <TabsContent value="form" className="space-y-4">
                  <div>
                    <Label htmlFor="bomVersionId">BOM Version ID</Label>
                    <Input
                      id="bomVersionId"
                      value={requestData.bomVersionId}
                      onChange={(e) => setRequestData({...requestData, bomVersionId: e.target.value})}
                      placeholder="PRODUCT:SUBPRODUCT:VERSION"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Format: PRODUCT:SUBPRODUCT:VERSION (e.g., CREDIT_CARD:PREMIUM:1.0)
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="customerId">Customer ID</Label>
                      <Input
                        id="customerId"
                        value={requestData.customerId}
                        onChange={(e) => setRequestData({...requestData, customerId: e.target.value})}
                        placeholder="CUST_12345"
                      />
                    </div>
                    <div>
                      <Label htmlFor="applicationId">Application ID</Label>
                      <Input
                        id="applicationId"
                        value={requestData.applicationId}
                        onChange={(e) => setRequestData({...requestData, applicationId: e.target.value})}
                        placeholder="APP_67890"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="requestType">Request Type</Label>
                    <Select 
                      value={requestData.requestType} 
                      onValueChange={(value) => setRequestData({...requestData, requestType: value})}
                    >
                      <SelectTrigger>
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
                    <Label htmlFor="customJson">Custom JSON Request</Label>
                    <Textarea
                      id="customJson"
                      value={customJson}
                      onChange={(e) => setCustomJson(e.target.value)}
                      placeholder="Enter your custom JSON request here..."
                      rows={12}
                      className="font-mono text-sm"
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <Button 
                onClick={sendGatewayRequest} 
                disabled={loading}
                className="w-full"
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

        <Card>
          <CardHeader>
            <CardTitle>Response</CardTitle>
            <CardDescription>
              Gateway response with routing and parameter augmentation results
            </CardDescription>
          </CardHeader>
          <CardContent>
            {response ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge 
                    variant={response.status_code < 400 ? "default" : "destructive"}
                  >
                    Status: {response.status_code}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(JSON.stringify(response.data, null, 2))}
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </Button>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="text-sm overflow-auto max-h-96">
                    {JSON.stringify(response.data, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No response yet. Send a request to see the gateway response.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gateway Testing Guide</CardTitle>
          <CardDescription>
            Understanding how the API Gateway processes requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Request Routing</h4>
              <p className="text-sm text-gray-600">
                The gateway extracts the <code className="bg-gray-100 px-1 rounded">bomVersionId</code> from your request 
                to determine which Fico environment (PLOR/DM) to route to based on the product and version.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Parameter Augmentation</h4>
              <p className="text-sm text-gray-600">
                Cached parameters matching your product/subproduct are automatically added to your request 
                before forwarding to the Fico endpoint. Check the response to see augmented parameters.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Sample BOM Version IDs</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li><code className="bg-gray-100 px-1 rounded">CREDIT_CARD:PREMIUM:1.0</code> - Premium credit card processing</li>
                <li><code className="bg-gray-100 px-1 rounded">PERSONAL_LOAN:SECURED:2.1</code> - Secured personal loan assessment</li>
                <li><code className="bg-gray-100 px-1 rounded">MORTGAGE:CONVENTIONAL:3.0</code> - Conventional mortgage underwriting</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
