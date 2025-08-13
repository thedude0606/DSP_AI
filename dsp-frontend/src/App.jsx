import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Switch } from '@/components/ui/switch.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { 
  Settings, 
  Target, 
  TrendingUp, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Users, 
  Play,
  Pause,
  BarChart3,
  Tv,
  Globe,
  Building,
  Zap,
  Shield,
  Star,
  CheckCircle,
  AlertCircle,
  Info,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2,
  Loader2
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import { AmazonDSPService } from './services/AmazonDSPService'
import './App.css'

// Publisher deals configuration with real Amazon DSP deal IDs
const publisherDeals = [
  {
    id: 'disney-ctv',
    name: 'Disney',
    type: 'Connected TV',
    dealId: 'Magnite Streaming Web Video:Disney-DSE-IOA-Amazon-FY25',
    logo: '🏰',
    platform: 'MAGNITE'
  },
  {
    id: 'hulu-ctv',
    name: 'Hulu',
    type: 'Connected TV',
    dealId: 'Magnite Streaming Web Video:Disney-ENT-IOA-Amazon-2024',
    logo: '📺',
    platform: 'MAGNITE'
  },
  {
    id: 'max-ctv',
    name: 'Max',
    type: 'Connected TV',
    dealId: 'Magnite Streaming Web Video:IOA-AA-MAX-OTT-187125',
    logo: '🎬',
    platform: 'MAGNITE'
  },
  {
    id: 'peacock-ctv',
    name: 'Peacock',
    type: 'Connected TV',
    dealId: 'FreeWheel:NBC-DSP-00004',
    logo: '🦚',
    platform: 'FREEWHEEL'
  },
  {
    id: 'roku-ctv',
    name: 'Roku',
    type: 'Connected TV',
    dealId: 'Magnite Streaming Web Video:604ea400-aa35-4719-9c16-113c2c6c69f0',
    logo: '📱',
    platform: 'MAGNITE'
  }
]

// Contextual groups with real Amazon DSP contextual IDs
const contextualGroups = [
  {
    id: 'family-friendly',
    name: 'Family Friendly',
    contextualId: '618512476282000766',
    icon: '👨‍👩‍👧‍👦',
    description: 'Content suitable for all family members'
  },
  {
    id: 'sports',
    name: 'Sports',
    contextualId: '601140589569333667',
    icon: '⚽',
    description: 'Sports and athletic content'
  },
  {
    id: 'spanish-language',
    name: 'Spanish Language',
    contextualId: '641983497392560407',
    icon: '🇪🇸',
    description: 'Spanish language content and programming'
  },
  {
    id: 'comedy',
    name: 'Comedy',
    contextualId: '622624460583885731',
    icon: '😂',
    description: 'Comedy and entertainment content'
  },
  {
    id: 'news',
    name: 'News',
    contextualId: '588676739747242257',
    icon: '📰',
    description: 'News and current affairs programming'
  }
]

// Amazon O&O inventory with real deal IDs
const amazonOO = [
  {
    id: 'pva-ctv',
    name: 'Prime Video Ads',
    type: 'Connected TV',
    dealId: 'Prime Video ads:EXT8Z36T18A2M0G',
    logo: '🎥',
    status: 'premium',
    description: 'Premium Amazon Prime Video inventory'
  }
]

function AuthenticationSetup({ onAuthenticated }) {
  const [credentials, setCredentials] = useState({
    clientId: localStorage.getItem('dsp_client_id') || '',
    clientSecret: localStorage.getItem('dsp_client_secret') || '',
    refreshToken: localStorage.getItem('dsp_refresh_token') || ''
  })
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleConnect = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      const dspService = new AmazonDSPService(credentials)
      const isValid = await dspService.validateCredentials()
      
      if (isValid) {
        // Store credentials securely
        localStorage.setItem('dsp_client_id', credentials.clientId)
        localStorage.setItem('dsp_client_secret', credentials.clientSecret)
        localStorage.setItem('dsp_refresh_token', credentials.refreshToken)
        
        setIsConnected(true)
        onAuthenticated(dspService)
      } else {
        setError('Invalid credentials. Please check your API credentials.')
      }
    } catch (err) {
      setError(`Connection failed: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md glass-card">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">Amazon DSP Console</CardTitle>
          <CardDescription>Connect your Amazon DSP API credentials to get started</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="clientId">Client ID</Label>
            <Input
              id="clientId"
              type="text"
              placeholder="Enter your client ID"
              value={credentials.clientId}
              onChange={(e) => setCredentials(prev => ({ ...prev, clientId: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="clientSecret">Client Secret</Label>
            <Input
              id="clientSecret"
              type="password"
              placeholder="Enter your client secret"
              value={credentials.clientSecret}
              onChange={(e) => setCredentials(prev => ({ ...prev, clientSecret: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="refreshToken">Refresh Token</Label>
            <Input
              id="refreshToken"
              type="password"
              placeholder="Enter your refresh token"
              value={credentials.refreshToken}
              onChange={(e) => setCredentials(prev => ({ ...prev, refreshToken: e.target.value }))}
            />
          </div>
          <Button 
            onClick={handleConnect} 
            className="w-full amazon-gradient text-white"
            disabled={isLoading || !credentials.clientId || !credentials.clientSecret || !credentials.refreshToken}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Connect to Amazon DSP
              </>
            )}
          </Button>
          {isConnected && (
            <div className="flex items-center justify-center text-green-600 mt-4">
              <CheckCircle className="w-5 h-5 mr-2" />
              Successfully connected!
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function EntitySelector({ dspService, onEntitySelected }) {
  const [entities, setEntities] = useState([])
  const [advertisers, setAdvertisers] = useState([])
  const [selectedEntity, setSelectedEntity] = useState('')
  const [selectedAdvertiser, setSelectedAdvertiser] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadEntitiesAndAdvertisers()
  }, [])

  const loadEntitiesAndAdvertisers = async () => {
    try {
      setIsLoading(true)
      const [entitiesData, advertisersData] = await Promise.all([
        dspService.getEntities(),
        dspService.getAdvertisers()
      ])
      setEntities(entitiesData)
      setAdvertisers(advertisersData)
    } catch (err) {
      setError(`Failed to load entities: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleContinue = () => {
    const entity = entities.find(e => e.entityId === selectedEntity)
    const advertiser = advertisers.find(a => a.advertiserId === selectedAdvertiser)
    onEntitySelected({ entity, advertiser })
  }

  const availableAdvertisers = advertisers.filter(adv => 
    !selectedEntity || adv.entityId === selectedEntity
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-orange-500" />
          <p className="text-gray-600">Loading entities and advertisers...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg glass-card">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center mb-4">
            <Building className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">Select Entity & Advertiser</CardTitle>
          <CardDescription>Choose your entity and advertiser to continue</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="entity">Entity</Label>
            <Select value={selectedEntity} onValueChange={setSelectedEntity}>
              <SelectTrigger>
                <SelectValue placeholder="Select an entity" />
              </SelectTrigger>
              <SelectContent>
                {entities.map(entity => (
                  <SelectItem key={entity.entityId} value={entity.entityId}>
                    <div className="flex items-center">
                      <Badge variant="outline" className="mr-2">{entity.entityType}</Badge>
                      {entity.entityName}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="advertiser">Advertiser</Label>
            <Select 
              value={selectedAdvertiser} 
              onValueChange={setSelectedAdvertiser}
              disabled={!selectedEntity}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an advertiser" />
              </SelectTrigger>
              <SelectContent>
                {availableAdvertisers.map(advertiser => (
                  <SelectItem key={advertiser.advertiserId} value={advertiser.advertiserId}>
                    {advertiser.advertiserName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={handleContinue}
            className="w-full amazon-gradient text-white"
            disabled={!selectedEntity || !selectedAdvertiser}
          >
            <Play className="w-4 h-4 mr-2" />
            Continue to Campaign Builder
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function CampaignBuilder({ dspService, selectedEntity }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [campaignData, setCampaignData] = useState({
    name: '',
    flightStart: '',
    flightEnd: '',
    budget: '',
    goal: 'REACH',
    targeting: {
      country: 'US',
      platform: 'CONNECTED_TV',
      zipCodes: '',
      dmas: '',
      createSeparateLineItems: false
    },
    selectedInventory: {
      publishers: [],
      contextual: [],
      amazonOO: []
    }
  })
  const [forecastData, setForecastData] = useState(null)
  const [isLoadingForecast, setIsLoadingForecast] = useState(false)

  const steps = [
    { id: 0, title: 'Campaign Details', icon: Settings },
    { id: 1, title: 'Targeting', icon: Target },
    { id: 2, title: 'Inventory', icon: Tv },
    { id: 3, title: 'Forecast', icon: TrendingUp }
  ]

  const handleInventorySelection = (type, item, selected) => {
    setCampaignData(prev => ({
      ...prev,
      selectedInventory: {
        ...prev.selectedInventory,
        [type]: selected 
          ? [...prev.selectedInventory[type], item]
          : prev.selectedInventory[type].filter(i => i.id !== item.id)
      }
    }))
  }

  const generateForecast = async () => {
    setIsLoadingForecast(true)
    try {
      const forecast = await dspService.generateForecast({
        advertiserId: selectedEntity.advertiser.advertiserId,
        budget: parseFloat(campaignData.budget),
        startDate: campaignData.flightStart,
        endDate: campaignData.flightEnd,
        targeting: campaignData.targeting,
        inventory: campaignData.selectedInventory
      })
      setForecastData(forecast)
    } catch (err) {
      console.error('Forecast generation failed:', err)
    } finally {
      setIsLoadingForecast(false)
    }
  }

  const createCampaign = async () => {
    try {
      const campaign = await dspService.createCampaign({
        advertiserId: selectedEntity.advertiser.advertiserId,
        name: campaignData.name,
        objective: campaignData.goal,
        budget: {
          amount: parseFloat(campaignData.budget),
          type: 'LIFETIME'
        },
        schedule: {
          startDate: campaignData.flightStart,
          endDate: campaignData.flightEnd
        },
        targeting: campaignData.targeting,
        inventory: campaignData.selectedInventory
      })
      
      // Handle successful campaign creation
      console.log('Campaign created:', campaign)
    } catch (err) {
      console.error('Campaign creation failed:', err)
    }
  }

  useEffect(() => {
    if (currentStep === 3 && !forecastData) {
      generateForecast()
    }
  }, [currentStep])

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <CampaignDetailsStep campaignData={campaignData} setCampaignData={setCampaignData} />
      case 1:
        return <TargetingStep campaignData={campaignData} setCampaignData={setCampaignData} />
      case 2:
        return <InventoryStep campaignData={campaignData} onInventorySelection={handleInventorySelection} />
      case 3:
        return <ForecastStep campaignData={campaignData} forecastData={forecastData} isLoading={isLoadingForecast} />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Campaign Builder</h1>
            <p className="text-gray-600">Create your Amazon DSP streaming TV campaign</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Save Draft
            </Button>
            <Button className="amazon-gradient text-white" onClick={createCampaign}>
              <Play className="w-4 h-4 mr-2" />
              Launch Campaign
            </Button>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = index === currentStep
              const isCompleted = index < currentStep
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center space-x-3 ${index < steps.length - 1 ? 'progress-step' : ''}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                      isCompleted 
                        ? 'bg-green-500 border-green-500 text-white' 
                        : isActive 
                          ? 'bg-orange-500 border-orange-500 text-white' 
                          : 'bg-gray-100 border-gray-300 text-gray-400'
                    }`}>
                      {isCompleted ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                    </div>
                    <span className={`font-medium ${isActive ? 'text-orange-600' : isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                      {step.title}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="animate-fade-in-up">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button 
            variant="outline" 
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
          >
            Previous
          </Button>
          <Button 
            onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
            disabled={currentStep === steps.length - 1}
            className="amazon-gradient text-white"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

function CampaignDetailsStep({ campaignData, setCampaignData }) {
  return (
    <Card className="modern-card">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Tv className="w-5 h-5 mr-2 text-orange-500" />
          Streaming TV Campaign Details
        </CardTitle>
        <CardDescription>Configure your campaign basic information and budget</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="campaignName">Campaign Name</Label>
            <Input
              id="campaignName"
              placeholder="Enter campaign name"
              value={campaignData.name}
              onChange={(e) => setCampaignData(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="goal">Campaign Goal</Label>
            <Select value={campaignData.goal} onValueChange={(value) => setCampaignData(prev => ({ ...prev, goal: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="REACH">Reach</SelectItem>
                <SelectItem value="AWARENESS">Awareness</SelectItem>
                <SelectItem value="CONSIDERATION">Consideration</SelectItem>
                <SelectItem value="CONVERSION">Conversion</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="flightStart">Flight Start Date</Label>
            <Input
              id="flightStart"
              type="date"
              value={campaignData.flightStart}
              onChange={(e) => setCampaignData(prev => ({ ...prev, flightStart: e.target.value }))}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="flightEnd">Flight End Date</Label>
            <Input
              id="flightEnd"
              type="date"
              value={campaignData.flightEnd}
              onChange={(e) => setCampaignData(prev => ({ ...prev, flightEnd: e.target.value }))}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="budget">Total Budget ($)</Label>
            <Input
              id="budget"
              type="number"
              placeholder="50000"
              value={campaignData.budget}
              onChange={(e) => setCampaignData(prev => ({ ...prev, budget: e.target.value }))}
            />
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <Info className="w-5 h-5 text-blue-500 mr-3 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Streaming TV Campaign</h4>
              <p className="text-sm text-blue-700 mt-1">
                This campaign will target Connected TV inventory across premium streaming platforms. 
                Default targeting is set to US audiences on Connected TV devices.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function TargetingStep({ campaignData, setCampaignData }) {
  return (
    <div className="space-y-6">
      <Card className="modern-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-orange-500" />
            Geographic Targeting
          </CardTitle>
          <CardDescription>Define your geographic targeting parameters</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Country</Label>
              <Select value={campaignData.targeting.country} onValueChange={(value) => 
                setCampaignData(prev => ({ ...prev, targeting: { ...prev.targeting, country: value } }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="US">United States</SelectItem>
                  <SelectItem value="CA">Canada</SelectItem>
                  <SelectItem value="UK">United Kingdom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Platform</Label>
              <Select value={campaignData.targeting.platform} onValueChange={(value) => 
                setCampaignData(prev => ({ ...prev, targeting: { ...prev.targeting, platform: value } }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CONNECTED_TV">Connected TV</SelectItem>
                  <SelectItem value="MOBILE">Mobile</SelectItem>
                  <SelectItem value="DESKTOP">Desktop</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="zipCodes">Zip Codes (comma-separated)</Label>
              <Textarea
                id="zipCodes"
                placeholder="90210, 10001, 60601..."
                value={campaignData.targeting.zipCodes}
                onChange={(e) => setCampaignData(prev => ({ 
                  ...prev, 
                  targeting: { ...prev.targeting, zipCodes: e.target.value } 
                }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dmas">DMAs (comma-separated)</Label>
              <Textarea
                id="dmas"
                placeholder="Los Angeles, New York, Chicago..."
                value={campaignData.targeting.dmas}
                onChange={(e) => setCampaignData(prev => ({ 
                  ...prev, 
                  targeting: { ...prev.targeting, dmas: e.target.value } 
                }))}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="separateLineItems"
              checked={campaignData.targeting.createSeparateLineItems}
              onCheckedChange={(checked) => setCampaignData(prev => ({ 
                ...prev, 
                targeting: { ...prev.targeting, createSeparateLineItems: checked } 
              }))}
            />
            <Label htmlFor="separateLineItems">Create separate line items for each zip code/DMA</Label>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function InventoryStep({ campaignData, onInventorySelection }) {
  return (
    <div className="space-y-6">
      {/* 3P Publisher Deals */}
      <Card className="modern-card inventory-section">
        <CardHeader>
          <CardTitle className="flex items-center">
            <div className="publisher-logo mr-3">
              <Building className="w-6 h-6 text-orange-500" />
            </div>
            3P Publisher Deals
          </CardTitle>
          <CardDescription>Premium publisher inventory and deals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {publisherDeals.map(deal => (
              <PublisherCard 
                key={deal.id} 
                deal={deal} 
                selected={campaignData.selectedInventory.publishers.some(p => p.id === deal.id)}
                onSelect={(selected) => onInventorySelection('publishers', deal, selected)}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contextual Groups */}
      <Card className="modern-card inventory-section">
        <CardHeader>
          <CardTitle className="flex items-center">
            <div className="publisher-logo mr-3">
              <Target className="w-6 h-6 text-blue-500" />
            </div>
            Contextual Groups
          </CardTitle>
          <CardDescription>Content-based targeting segments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contextualGroups.map(group => (
              <ContextualCard 
                key={group.id} 
                group={group} 
                selected={campaignData.selectedInventory.contextual.some(c => c.id === group.id)}
                onSelect={(selected) => onInventorySelection('contextual', group, selected)}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Amazon O&O */}
      <Card className="modern-card inventory-section">
        <CardHeader>
          <CardTitle className="flex items-center">
            <div className="publisher-logo mr-3 amazon-gradient">
              <Star className="w-6 h-6 text-white" />
            </div>
            Amazon O&O
          </CardTitle>
          <CardDescription>Premium Amazon owned and operated inventory</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {amazonOO.map(inventory => (
              <AmazonOOCard 
                key={inventory.id} 
                inventory={inventory} 
                selected={campaignData.selectedInventory.amazonOO.some(a => a.id === inventory.id)}
                onSelect={(selected) => onInventorySelection('amazonOO', inventory, selected)}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function PublisherCard({ deal, selected, onSelect }) {
  return (
    <Card className={`cursor-pointer transition-all duration-200 interactive-hover ${
      selected ? 'ring-2 ring-orange-500 bg-orange-50' : 'hover:shadow-lg'
    }`} onClick={() => onSelect(!selected)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center">
            <div className="text-2xl mr-3">{deal.logo}</div>
            <div>
              <h3 className="font-semibold">{deal.name}</h3>
              <Badge variant="outline" className="text-xs">{deal.type}</Badge>
            </div>
          </div>
          {selected && <CheckCircle className="w-5 h-5 text-orange-500" />}
        </div>
        
        <div className="mt-3 text-xs text-gray-500 truncate" title={deal.dealId}>
          {deal.dealId}
        </div>
        
        <div className="mt-2">
          <Badge variant="outline" className="text-xs">{deal.platform}</Badge>
        </div>
      </CardContent>
    </Card>
  )
}

function ContextualCard({ group, selected, onSelect }) {
  return (
    <Card className={`cursor-pointer transition-all duration-200 interactive-hover ${
      selected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-lg'
    }`} onClick={() => onSelect(!selected)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center">
            <div className="text-2xl mr-3">{group.icon}</div>
            <div>
              <h3 className="font-semibold">{group.name}</h3>
              <p className="text-xs text-gray-600">{group.description}</p>
            </div>
          </div>
          {selected && <CheckCircle className="w-5 h-5 text-blue-500" />}
        </div>
        
        <div className="mt-3 text-xs text-gray-500 font-mono">
          ID: {group.contextualId}
        </div>
      </CardContent>
    </Card>
  )
}

function AmazonOOCard({ inventory, selected, onSelect }) {
  return (
    <Card className={`cursor-pointer transition-all duration-200 interactive-hover ${
      selected ? 'ring-2 ring-orange-500 bg-gradient-to-br from-orange-50 to-yellow-50' : 'hover:shadow-lg'
    }`} onClick={() => onSelect(!selected)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center">
            <div className="text-2xl mr-3">{inventory.logo}</div>
            <div>
              <h3 className="font-semibold">{inventory.name}</h3>
              <Badge className="text-xs amazon-gradient text-white">{inventory.status}</Badge>
            </div>
          </div>
          {selected && <CheckCircle className="w-5 h-5 text-orange-500" />}
        </div>
        
        <p className="text-sm text-gray-600 mb-3">{inventory.description}</p>
        
        <div className="mt-3 text-xs text-gray-500 truncate" title={inventory.dealId}>
          {inventory.dealId}
        </div>
      </CardContent>
    </Card>
  )
}

function ForecastStep({ campaignData, forecastData, isLoading }) {
  const totalSelectedInventory = 
    campaignData.selectedInventory.publishers.length +
    campaignData.selectedInventory.contextual.length +
    campaignData.selectedInventory.amazonOO.length

  if (isLoading) {
    return (
      <Card className="modern-card forecast-chart">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-orange-500" />
            <p className="text-gray-600">Generating forecast...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!forecastData) {
    return (
      <Card className="modern-card forecast-chart">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="w-8 h-8 mx-auto mb-4 text-red-500" />
            <p className="text-gray-600">Unable to generate forecast. Please check your configuration.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="modern-card forecast-chart">
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-orange-500" />
            Campaign Forecast
          </CardTitle>
          <CardDescription>Projected performance based on your configuration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              <h4 className="font-medium mb-4">Projected Reach & Frequency</h4>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={forecastData.dailyProjections}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Line yAxisId="left" type="monotone" dataKey="reach" stroke="#FF9900" strokeWidth={3} />
                  <Line yAxisId="right" type="monotone" dataKey="frequency" stroke="#007EB9" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 border">
                <h5 className="font-medium text-gray-900 mb-2">Projected Totals</h5>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Reach:</span>
                    <span className="font-semibold">{forecastData.totalReach?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg Frequency:</span>
                    <span className="font-semibold">{forecastData.averageFrequency?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Impressions:</span>
                    <span className="font-semibold">{forecastData.totalImpressions?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Est. CPM:</span>
                    <span className="font-semibold">${forecastData.estimatedCPM?.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                <h5 className="font-medium text-orange-900 mb-2">Selected Inventory</h5>
                <div className="text-sm text-orange-700">
                  <p>{totalSelectedInventory} inventory sources selected</p>
                  <p className="mt-1">
                    {campaignData.selectedInventory.publishers.length} Publishers, {' '}
                    {campaignData.selectedInventory.contextual.length} Contextual, {' '}
                    {campaignData.selectedInventory.amazonOO.length} Amazon O&O
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t pt-6">
            <h4 className="font-medium mb-4">Daily Impression Forecast</h4>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={forecastData.dailyProjections}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="impressions" fill="#FF9900" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function App() {
  const [dspService, setDspService] = useState(null)
  const [selectedEntity, setSelectedEntity] = useState(null)

  const handleAuthenticated = (service) => {
    setDspService(service)
  }

  const handleEntitySelected = (selection) => {
    setSelectedEntity(selection)
  }

  if (!dspService) {
    return <AuthenticationSetup onAuthenticated={handleAuthenticated} />
  }

  if (!selectedEntity) {
    return <EntitySelector dspService={dspService} onEntitySelected={handleEntitySelected} />
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<CampaignBuilder dspService={dspService} selectedEntity={selectedEntity} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App

