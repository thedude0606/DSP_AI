/**
 * Amazon DSP API Service
 * Handles all interactions with Amazon DSP APIs
 */

class AmazonDSPService {
  constructor(credentials) {
    this.clientId = credentials.clientId
    this.clientSecret = credentials.clientSecret
    this.refreshToken = credentials.refreshToken
    this.accessToken = null
    this.baseURL = 'https://advertising-api.amazon.com'
    this.profileId = null
  }

  /**
   * Authenticate with Amazon DSP API
   */
  async authenticate() {
    try {
      const response = await fetch('https://api.amazon.com/auth/o2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: this.refreshToken,
          client_id: this.clientId,
          client_secret: this.clientSecret
        })
      })

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.statusText}`)
      }

      const data = await response.json()
      this.accessToken = data.access_token
      return this.accessToken
    } catch (error) {
      console.error('Authentication error:', error)
      throw error
    }
  }

  /**
   * Make authenticated API request
   */
  async makeRequest(method, endpoint, data = null, profileId = null) {
    if (!this.accessToken) {
      await this.authenticate()
    }

    const config = {
      method,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Amazon-Advertising-API-ClientId': this.clientId,
        'Content-Type': 'application/json'
      }
    }

    if (profileId || this.profileId) {
      config.headers['Amazon-Advertising-API-Scope'] = profileId || this.profileId
    }

    if (data) {
      config.body = JSON.stringify(data)
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config)
      
      if (response.status === 401) {
        // Token expired, refresh and retry
        await this.authenticate()
        config.headers['Authorization'] = `Bearer ${this.accessToken}`
        const retryResponse = await fetch(`${this.baseURL}${endpoint}`, config)
        
        if (!retryResponse.ok) {
          throw new Error(`API request failed: ${retryResponse.statusText}`)
        }
        
        return await retryResponse.json()
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`API request failed: ${response.statusText} - ${JSON.stringify(errorData)}`)
      }

      return await response.json()
    } catch (error) {
      console.error('API request error:', error)
      throw error
    }
  }

  /**
   * Validate API credentials
   */
  async validateCredentials() {
    try {
      await this.authenticate()
      // Test with a simple API call
      await this.getProfiles()
      return true
    } catch (error) {
      console.error('Credential validation failed:', error)
      return false
    }
  }

  /**
   * Get available profiles
   */
  async getProfiles() {
    try {
      const response = await this.makeRequest('GET', '/v2/profiles')
      return response
    } catch (error) {
      console.error('Failed to get profiles:', error)
      throw error
    }
  }

  /**
   * Get entities (advertisers/agencies)
   */
  async getEntities() {
    try {
      const profiles = await this.getProfiles()
      return profiles.map(profile => ({
        entityId: profile.profileId,
        entityName: profile.accountInfo?.name || `Profile ${profile.profileId}`,
        entityType: profile.accountInfo?.type || 'ADVERTISER'
      }))
    } catch (error) {
      console.error('Failed to get entities:', error)
      throw error
    }
  }

  /**
   * Get advertisers for an entity
   */
  async getAdvertisers() {
    try {
      const profiles = await this.getProfiles()
      return profiles.map(profile => ({
        advertiserId: profile.profileId,
        advertiserName: profile.accountInfo?.name || `Advertiser ${profile.profileId}`,
        entityId: profile.profileId
      }))
    } catch (error) {
      console.error('Failed to get advertisers:', error)
      throw error
    }
  }

  /**
   * Create a new campaign
   */
  async createCampaign(campaignData) {
    try {
      this.profileId = campaignData.advertiserId

      // Create the main campaign
      const campaign = await this.makeRequest('POST', '/dsp/campaigns/v1/campaigns', {
        name: campaignData.name,
        objective: campaignData.objective,
        budget: campaignData.budget,
        schedule: campaignData.schedule,
        status: 'ACTIVE'
      })

      // Create line items based on targeting and inventory selection
      const lineItems = await this.createLineItems(campaign.campaignId, campaignData)

      return {
        campaign,
        lineItems
      }
    } catch (error) {
      console.error('Failed to create campaign:', error)
      throw error
    }
  }

  /**
   * Create line items for a campaign
   */
  async createLineItems(campaignId, campaignData) {
    const lineItems = []

    try {
      // Create line items for each selected inventory source
      const { publishers, contextual, amazonOO } = campaignData.selectedInventory

      // Handle geographic targeting
      const geoTargets = this.parseGeographicTargeting(campaignData.targeting)

      // Create line items for 3P Publisher Deals
      for (const publisher of publishers) {
        if (campaignData.targeting.createSeparateLineItems && geoTargets.length > 1) {
          // Create separate line items for each geographic target
          for (const geoTarget of geoTargets) {
            const lineItem = await this.createSingleLineItem(campaignId, {
              name: `${publisher.name} - ${geoTarget.name}`,
              inventorySource: 'THIRD_PARTY',
              dealId: publisher.dealId,
              targeting: {
                ...campaignData.targeting,
                geographic: [geoTarget]
              }
            })
            lineItems.push(lineItem)
          }
        } else {
          // Create single line item for all geographic targets
          const lineItem = await this.createSingleLineItem(campaignId, {
            name: `${publisher.name} - All Targets`,
            inventorySource: 'THIRD_PARTY',
            dealId: publisher.dealId,
            targeting: {
              ...campaignData.targeting,
              geographic: geoTargets
            }
          })
          lineItems.push(lineItem)
        }
      }

      // Create line items for Contextual Groups
      for (const context of contextual) {
        const lineItem = await this.createSingleLineItem(campaignId, {
          name: `Contextual - ${context.name}`,
          inventorySource: 'CONTEXTUAL',
          contextualId: context.contextualId,
          targeting: {
            ...campaignData.targeting,
            geographic: geoTargets
          }
        })
        lineItems.push(lineItem)
      }

      // Create line items for Amazon O&O
      for (const amazon of amazonOO) {
        const lineItem = await this.createSingleLineItem(campaignId, {
          name: `Amazon O&O - ${amazon.name}`,
          inventorySource: 'AMAZON_OO',
          dealId: amazon.dealId,
          targeting: {
            ...campaignData.targeting,
            geographic: geoTargets
          }
        })
        lineItems.push(lineItem)
      }

      return lineItems
    } catch (error) {
      console.error('Failed to create line items:', error)
      throw error
    }
  }

  /**
   * Create a single line item
   */
  async createSingleLineItem(campaignId, lineItemData) {
    try {
      const lineItem = await this.makeRequest('POST', '/dsp/campaigns/v1/lineItems', {
        campaignId,
        name: lineItemData.name,
        inventorySource: lineItemData.inventorySource,
        dealId: lineItemData.dealId,
        contextualId: lineItemData.contextualId,
        targeting: this.formatTargeting(lineItemData.targeting),
        bidding: {
          strategy: 'AUTOMATIC',
          type: 'CPM'
        },
        status: 'ACTIVE'
      })

      return lineItem
    } catch (error) {
      console.error('Failed to create line item:', error)
      throw error
    }
  }

  /**
   * Parse geographic targeting from user input
   */
  parseGeographicTargeting(targeting) {
    const geoTargets = []

    // Parse zip codes
    if (targeting.zipCodes) {
      const zipCodes = targeting.zipCodes.split(',').map(zip => zip.trim()).filter(zip => zip)
      zipCodes.forEach(zip => {
        geoTargets.push({
          type: 'ZIP_CODE',
          value: zip,
          name: `ZIP ${zip}`
        })
      })
    }

    // Parse DMAs
    if (targeting.dmas) {
      const dmas = targeting.dmas.split(',').map(dma => dma.trim()).filter(dma => dma)
      dmas.forEach(dma => {
        geoTargets.push({
          type: 'DMA',
          value: dma,
          name: dma
        })
      })
    }

    // If no specific targeting, use country-level
    if (geoTargets.length === 0) {
      geoTargets.push({
        type: 'COUNTRY',
        value: targeting.country,
        name: targeting.country
      })
    }

    return geoTargets
  }

  /**
   * Format targeting for API submission
   */
  formatTargeting(targeting) {
    return {
      geographic: targeting.geographic?.map(geo => ({
        type: geo.type,
        value: geo.value
      })),
      platform: targeting.platform,
      deviceTypes: targeting.platform === 'CONNECTED_TV' ? ['CONNECTED_TV'] : ['DESKTOP', 'MOBILE', 'TABLET']
    }
  }

  /**
   * Generate campaign forecast
   */
  async generateForecast(forecastData) {
    try {
      const response = await this.makeRequest('POST', '/dsp/forecasting/v1/forecast', {
        advertiserId: forecastData.advertiserId,
        budget: forecastData.budget,
        startDate: forecastData.startDate,
        endDate: forecastData.endDate,
        targeting: this.formatTargeting(forecastData.targeting),
        inventory: this.formatInventoryForForecast(forecastData.inventory)
      })

      return this.processForecastResponse(response)
    } catch (error) {
      console.error('Failed to generate forecast:', error)
      // Return mock data if forecast API fails
      return this.generateMockForecast(forecastData)
    }
  }

  /**
   * Format inventory selection for forecast API
   */
  formatInventoryForForecast(inventory) {
    const formattedInventory = []

    // Add publisher deals
    inventory.publishers?.forEach(publisher => {
      formattedInventory.push({
        type: 'THIRD_PARTY_DEAL',
        dealId: publisher.dealId,
        platform: publisher.platform
      })
    })

    // Add contextual groups
    inventory.contextual?.forEach(context => {
      formattedInventory.push({
        type: 'CONTEXTUAL',
        contextualId: context.contextualId
      })
    })

    // Add Amazon O&O
    inventory.amazonOO?.forEach(amazon => {
      formattedInventory.push({
        type: 'AMAZON_OO',
        dealId: amazon.dealId
      })
    })

    return formattedInventory
  }

  /**
   * Process forecast API response
   */
  processForecastResponse(response) {
    return {
      totalReach: response.projectedReach,
      totalImpressions: response.projectedImpressions,
      averageFrequency: response.projectedFrequency,
      estimatedCPM: response.estimatedCPM,
      dailyProjections: response.dailyBreakdown?.map(day => ({
        date: day.date,
        impressions: day.impressions,
        reach: day.reach,
        frequency: day.frequency
      })) || []
    }
  }

  /**
   * Generate mock forecast data (fallback)
   */
  generateMockForecast(forecastData) {
    const startDate = new Date(forecastData.startDate)
    const endDate = new Date(forecastData.endDate)
    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
    
    const dailyProjections = []
    let cumulativeReach = 0
    const baseImpressions = Math.floor(forecastData.budget / 15) // Assuming $15 CPM
    
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)
      
      const dailyImpressions = Math.floor(baseImpressions / days * (0.8 + Math.random() * 0.4))
      const dailyReach = Math.floor(dailyImpressions * 0.7) // Assuming 70% unique reach
      cumulativeReach = Math.min(cumulativeReach + dailyReach * 0.3, dailyReach * i * 0.8)
      
      dailyProjections.push({
        date: date.toISOString().split('T')[0],
        impressions: dailyImpressions,
        reach: Math.floor(cumulativeReach),
        frequency: cumulativeReach > 0 ? (dailyImpressions * (i + 1)) / cumulativeReach : 1
      })
    }

    return {
      totalReach: Math.floor(cumulativeReach),
      totalImpressions: baseImpressions,
      averageFrequency: baseImpressions / cumulativeReach,
      estimatedCPM: 15.0,
      dailyProjections
    }
  }

  /**
   * Get campaign performance data
   */
  async getCampaignPerformance(campaignId, dateRange) {
    try {
      const reportRequest = await this.makeRequest('POST', '/dsp/reports/v3/reports', {
        reportType: 'CAMPAIGN',
        format: 'JSON',
        dateRange: dateRange,
        dimensions: ['date', 'campaign'],
        metrics: ['impressions', 'clicks', 'spend', 'conversions'],
        filters: {
          campaignId: [campaignId]
        }
      })

      // Poll for report completion
      let reportStatus = 'PENDING'
      let attempts = 0
      const maxAttempts = 30

      while (reportStatus !== 'COMPLETED' && reportStatus !== 'FAILED' && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 5000)) // Wait 5 seconds
        
        const statusResponse = await this.makeRequest('GET', `/dsp/reports/v3/reports/${reportRequest.reportId}`)
        reportStatus = statusResponse.status
        attempts++
      }

      if (reportStatus === 'COMPLETED') {
        const reportData = await this.makeRequest('GET', `/dsp/reports/v3/reports/${reportRequest.reportId}/download`)
        return reportData
      } else {
        throw new Error('Report generation failed or timed out')
      }
    } catch (error) {
      console.error('Failed to get campaign performance:', error)
      throw error
    }
  }

  /**
   * Get available inventory
   */
  async getAvailableInventory(targeting) {
    try {
      const response = await this.makeRequest('POST', '/dsp/inventory/v1/search', {
        targeting: this.formatTargeting(targeting),
        inventoryTypes: ['THIRD_PARTY', 'CONTEXTUAL', 'AMAZON_OO']
      })

      return response
    } catch (error) {
      console.error('Failed to get available inventory:', error)
      // Return static inventory if API fails
      return {
        thirdParty: publisherDeals,
        contextual: contextualGroups,
        amazonOO: amazonOO
      }
    }
  }

  /**
   * Update campaign
   */
  async updateCampaign(campaignId, updates) {
    try {
      const response = await this.makeRequest('PUT', `/dsp/campaigns/v1/campaigns/${campaignId}`, updates)
      return response
    } catch (error) {
      console.error('Failed to update campaign:', error)
      throw error
    }
  }

  /**
   * Pause/Resume campaign
   */
  async updateCampaignStatus(campaignId, status) {
    try {
      const response = await this.makeRequest('PUT', `/dsp/campaigns/v1/campaigns/${campaignId}`, {
        status: status
      })
      return response
    } catch (error) {
      console.error('Failed to update campaign status:', error)
      throw error
    }
  }

  /**
   * Get campaign details
   */
  async getCampaign(campaignId) {
    try {
      const response = await this.makeRequest('GET', `/dsp/campaigns/v1/campaigns/${campaignId}`)
      return response
    } catch (error) {
      console.error('Failed to get campaign:', error)
      throw error
    }
  }

  /**
   * List campaigns
   */
  async getCampaigns(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString()
      const response = await this.makeRequest('GET', `/dsp/campaigns/v1/campaigns?${queryParams}`)
      return response
    } catch (error) {
      console.error('Failed to get campaigns:', error)
      throw error
    }
  }
}

export { AmazonDSPService }

