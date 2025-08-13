# Amazon DSP API Documentation

**Author:** Manus AI  
**Date:** August 13, 2025  
**Version:** 1.0

## Table of Contents

1. [Introduction](#introduction)
2. [Authentication](#authentication)
3. [API Endpoints Overview](#api-endpoints-overview)
4. [Campaign Management API](#campaign-management-api)
5. [Reporting API](#reporting-api)
6. [Universal Targeting API](#universal-targeting-api)
7. [Discovery Apps API](#discovery-apps-api)
8. [Data Models](#data-models)
9. [Error Handling](#error-handling)
10. [Rate Limiting](#rate-limiting)
11. [Best Practices](#best-practices)
12. [Code Examples](#code-examples)

## Introduction

Amazon DSP (Demand-Side Platform) provides a comprehensive suite of APIs that enable programmatic advertising management across Amazon's advertising ecosystem. This documentation synthesizes information from Amazon's Advanced Tools Center to provide developers with a complete reference for integrating with Amazon DSP services.

The Amazon DSP APIs enable advertisers and partners to programmatically manage their advertising operations, including campaign creation and management, audience targeting, creative asset management, and comprehensive performance reporting. The platform supports both self-serve advertisers and managed service providers with robust authentication, rate limiting, and error handling mechanisms.

### Key API Categories

Amazon DSP APIs are organized into several key categories, each serving specific aspects of programmatic advertising management:

**Campaign Management APIs** provide comprehensive tools for creating, updating, and managing advertising campaigns, ad groups, and individual advertisements. These APIs support the full lifecycle of campaign management from initial setup through optimization and performance monitoring.

**Reporting APIs** offer detailed performance analytics and metrics across campaigns, audiences, and creative assets. The reporting infrastructure supports both real-time performance monitoring and historical analysis with flexible data export capabilities.

**Universal Targeting APIs** enable sophisticated audience building and management through Amazon's comprehensive targeting capabilities, including custom audiences, lookalike audiences, and Amazon's pre-built audience segments.

**Discovery Apps APIs** provide access to Amazon's audience discovery tools and targeting recommendations, enabling advertisers to identify and reach new audience segments based on performance data and behavioral insights.

## Authentication

Amazon DSP APIs utilize OAuth 2.0 authentication with Login with Amazon (LWA) for secure access to advertising resources. The authentication process requires proper credential management and token refresh mechanisms to maintain continuous API access.

### OAuth 2.0 Flow

The authentication process follows the standard OAuth 2.0 authorization code flow with specific requirements for Amazon's advertising ecosystem:

1. **Authorization Request**: Direct users to Amazon's authorization endpoint with appropriate scope parameters
2. **Authorization Code**: Receive authorization code from successful user consent
3. **Access Token Exchange**: Exchange authorization code for access and refresh tokens
4. **API Access**: Use access token for authenticated API requests
5. **Token Refresh**: Implement automatic token refresh using refresh tokens

### Required Scopes

Amazon DSP APIs require specific OAuth scopes to access different functionality:

- `advertising::campaign_management`: Access to campaign creation, modification, and management
- `advertising::reporting`: Access to performance data and reporting endpoints
- `advertising::audiences`: Access to audience management and targeting capabilities
- `advertising::creatives`: Access to creative asset management and performance data

### Authentication Headers

All API requests must include proper authentication headers:

```
Authorization: Bearer {access_token}
Amazon-Advertising-API-ClientId: {client_id}
Amazon-Advertising-API-Scope: {profile_id}
```

### Profile Management

Amazon DSP uses profile-based access control where each profile represents an advertiser account or entity. Profiles must be specified in API requests to ensure proper data isolation and access control.

## API Endpoints Overview

Amazon DSP APIs are organized around RESTful principles with consistent URL patterns and HTTP methods. The base URL for all API endpoints is `https://advertising-api.amazon.com`.

### Base URL Structure

```
https://advertising-api.amazon.com/{version}/{resource}
```

### Versioning Strategy

Amazon DSP APIs use URL-based versioning with different versions for different API categories:

- Campaign Management: `/dsp/campaigns/v1`
- Reporting: `/dsp/reports/v3`
- Universal Targeting: `/dsp/targeting/v1`
- Discovery Apps: `/dsp/discovery/v1`

### Common HTTP Methods

- `GET`: Retrieve resources and data
- `POST`: Create new resources
- `PUT`: Update existing resources
- `DELETE`: Remove resources
- `PATCH`: Partial resource updates

### Response Formats

All API responses use JSON format with consistent structure:

```json
{
  "data": {},
  "metadata": {
    "requestId": "string",
    "timestamp": "ISO8601",
    "version": "string"
  },
  "errors": []
}
```

## Campaign Management API

The Campaign Management API provides comprehensive tools for managing advertising campaigns across Amazon's DSP platform. This API supports the complete campaign lifecycle from creation through optimization and performance monitoring.

### Campaign Hierarchy

Amazon DSP campaigns follow a hierarchical structure:

1. **Campaigns**: Top-level containers with budget, schedule, and objective settings
2. **Ad Groups**: Targeting and bidding containers within campaigns
3. **Ads**: Individual creative executions within ad groups

### Campaign Operations

#### Create Campaign

```
POST /dsp/campaigns/v1/campaigns
```

Creates a new advertising campaign with specified configuration parameters.

**Request Body:**
```json
{
  "name": "string",
  "objective": "AWARENESS|CONSIDERATION|CONVERSION",
  "budget": {
    "amount": "number",
    "type": "DAILY|LIFETIME"
  },
  "schedule": {
    "startDate": "YYYY-MM-DD",
    "endDate": "YYYY-MM-DD"
  },
  "status": "ACTIVE|PAUSED|ARCHIVED"
}
```

**Response:**
```json
{
  "campaignId": "string",
  "status": "SUCCESS|ERROR",
  "message": "string"
}
```

#### Update Campaign

```
PUT /dsp/campaigns/v1/campaigns/{campaignId}
```

Updates an existing campaign with new configuration parameters.

#### Get Campaign

```
GET /dsp/campaigns/v1/campaigns/{campaignId}
```

Retrieves detailed information about a specific campaign.

#### List Campaigns

```
GET /dsp/campaigns/v1/campaigns
```

Retrieves a list of campaigns with optional filtering and pagination.

**Query Parameters:**
- `status`: Filter by campaign status
- `objective`: Filter by campaign objective
- `limit`: Number of results per page (max 100)
- `offset`: Pagination offset

### Ad Group Operations

#### Create Ad Group

```
POST /dsp/campaigns/v1/adGroups
```

Creates a new ad group within a specified campaign.

**Request Body:**
```json
{
  "campaignId": "string",
  "name": "string",
  "bidding": {
    "strategy": "MANUAL|AUTOMATIC",
    "amount": "number"
  },
  "targeting": {
    "audiences": ["string"],
    "demographics": {},
    "interests": ["string"]
  }
}
```

#### Update Ad Group

```
PUT /dsp/campaigns/v1/adGroups/{adGroupId}
```

Updates an existing ad group configuration.

#### Get Ad Group

```
GET /dsp/campaigns/v1/adGroups/{adGroupId}
```

Retrieves detailed information about a specific ad group.

### Ad Operations

#### Create Ad

```
POST /dsp/campaigns/v1/ads
```

Creates a new advertisement within a specified ad group.

**Request Body:**
```json
{
  "adGroupId": "string",
  "name": "string",
  "creative": {
    "type": "DISPLAY|VIDEO|AUDIO",
    "assetId": "string",
    "landingPageUrl": "string"
  },
  "status": "ACTIVE|PAUSED"
}
```

## Reporting API

The Reporting API provides comprehensive performance analytics and metrics for Amazon DSP campaigns. The API supports both real-time performance monitoring and historical analysis with flexible data export capabilities.

### Report Types

Amazon DSP supports several report types for different analytical needs:

- **Campaign Reports**: Performance metrics at the campaign level
- **Ad Group Reports**: Detailed performance data for ad groups
- **Audience Reports**: Audience engagement and conversion metrics
- **Creative Reports**: Creative asset performance analysis
- **Custom Reports**: Flexible reporting with custom dimensions and metrics

### Report Generation Process

The reporting API uses an asynchronous process for generating reports:

1. **Request Report**: Submit report generation request with parameters
2. **Poll Status**: Check report generation status
3. **Download Report**: Retrieve completed report data

#### Request Report

```
POST /dsp/reports/v3/reports
```

Initiates report generation with specified parameters.

**Request Body:**
```json
{
  "reportType": "CAMPAIGN|AD_GROUP|AUDIENCE|CREATIVE",
  "format": "JSON|CSV",
  "dateRange": {
    "startDate": "YYYY-MM-DD",
    "endDate": "YYYY-MM-DD"
  },
  "dimensions": ["string"],
  "metrics": ["string"],
  "filters": {}
}
```

**Response:**
```json
{
  "reportId": "string",
  "status": "PENDING|IN_PROGRESS|COMPLETED|FAILED",
  "estimatedCompletionTime": "ISO8601"
}
```

#### Check Report Status

```
GET /dsp/reports/v3/reports/{reportId}
```

Retrieves the current status of a report generation request.

#### Download Report

```
GET /dsp/reports/v3/reports/{reportId}/download
```

Downloads the completed report data.

### Available Metrics

Amazon DSP provides comprehensive metrics for performance analysis:

**Impression Metrics:**
- `impressions`: Total number of ad impressions
- `viewableImpressions`: Number of viewable impressions
- `viewabilityRate`: Percentage of viewable impressions

**Engagement Metrics:**
- `clicks`: Total number of clicks
- `clickThroughRate`: Click-through rate percentage
- `videoViews`: Number of video views (video ads only)
- `videoCompletionRate`: Video completion rate percentage

**Conversion Metrics:**
- `conversions`: Total number of conversions
- `conversionRate`: Conversion rate percentage
- `costPerConversion`: Average cost per conversion

**Financial Metrics:**
- `spend`: Total advertising spend
- `costPerClick`: Average cost per click
- `costPerMille`: Cost per thousand impressions
- `returnOnAdSpend`: Return on advertising spend

### Report Dimensions

Reports can be segmented by various dimensions:

- `date`: Daily performance breakdown
- `campaign`: Campaign-level segmentation
- `adGroup`: Ad group-level segmentation
- `audience`: Audience segment breakdown
- `creative`: Creative asset performance
- `placement`: Placement type analysis
- `device`: Device type segmentation
- `geography`: Geographic performance breakdown

## Universal Targeting API

The Universal Targeting API enables sophisticated audience building and management through Amazon's comprehensive targeting capabilities. This API provides access to custom audiences, lookalike audiences, and Amazon's pre-built audience segments.

### Audience Types

Amazon DSP supports several audience types for targeting:

**Custom Audiences**: Audiences created from advertiser's customer data
**Lookalike Audiences**: Audiences similar to existing customer segments
**Amazon Audiences**: Pre-built audience segments based on Amazon data
**Behavioral Audiences**: Audiences based on shopping and browsing behavior
**Demographic Audiences**: Age, gender, and income-based segments

### Audience Operations

#### Create Custom Audience

```
POST /dsp/targeting/v1/audiences
```

Creates a custom audience from uploaded customer data.

**Request Body:**
```json
{
  "name": "string",
  "description": "string",
  "type": "CUSTOM|LOOKALIKE",
  "sourceData": {
    "type": "EMAIL|PHONE|DEVICE_ID",
    "data": ["string"]
  },
  "matchRate": "number"
}
```

#### Get Audience

```
GET /dsp/targeting/v1/audiences/{audienceId}
```

Retrieves detailed information about a specific audience.

#### List Audiences

```
GET /dsp/targeting/v1/audiences
```

Retrieves a list of available audiences with filtering options.

#### Update Audience

```
PUT /dsp/targeting/v1/audiences/{audienceId}
```

Updates audience configuration and membership.

### Targeting Criteria

The Universal Targeting API supports various targeting criteria:

**Geographic Targeting:**
- Country-level targeting
- State/province targeting
- City-level targeting
- Postal code targeting

**Demographic Targeting:**
- Age ranges
- Gender
- Household income
- Education level

**Interest Targeting:**
- Shopping categories
- Brand preferences
- Lifestyle interests
- Purchase intent signals

**Behavioral Targeting:**
- Purchase history
- Browsing behavior
- Engagement patterns
- Seasonal preferences

## Discovery Apps API

The Discovery Apps API provides access to Amazon's audience discovery tools and targeting recommendations. This API enables advertisers to identify and reach new audience segments based on performance data and behavioral insights.

### Discovery Operations

#### Get Audience Recommendations

```
GET /dsp/discovery/v1/audiences/recommendations
```

Retrieves audience recommendations based on campaign performance and objectives.

**Query Parameters:**
- `campaignId`: Source campaign for recommendations
- `objective`: Campaign objective for targeting
- `limit`: Number of recommendations to return

**Response:**
```json
{
  "recommendations": [
    {
      "audienceId": "string",
      "name": "string",
      "description": "string",
      "estimatedReach": "number",
      "relevanceScore": "number",
      "recommendationReason": "string"
    }
  ]
}
```

#### Get Interest Categories

```
GET /dsp/discovery/v1/interests
```

Retrieves available interest categories for targeting.

#### Get Demographic Options

```
GET /dsp/discovery/v1/demographics
```

Retrieves available demographic targeting options.

## Data Models

### Campaign Model

```json
{
  "campaignId": "string",
  "name": "string",
  "objective": "AWARENESS|CONSIDERATION|CONVERSION",
  "status": "ACTIVE|PAUSED|ARCHIVED",
  "budget": {
    "amount": "number",
    "type": "DAILY|LIFETIME",
    "spent": "number",
    "remaining": "number"
  },
  "schedule": {
    "startDate": "YYYY-MM-DD",
    "endDate": "YYYY-MM-DD",
    "timezone": "string"
  },
  "createdDate": "ISO8601",
  "lastModifiedDate": "ISO8601"
}
```

### Ad Group Model

```json
{
  "adGroupId": "string",
  "campaignId": "string",
  "name": "string",
  "status": "ACTIVE|PAUSED",
  "bidding": {
    "strategy": "MANUAL|AUTOMATIC",
    "amount": "number",
    "type": "CPC|CPM|CPA"
  },
  "targeting": {
    "audiences": ["string"],
    "demographics": {},
    "interests": ["string"],
    "geography": {}
  },
  "createdDate": "ISO8601",
  "lastModifiedDate": "ISO8601"
}
```

### Audience Model

```json
{
  "audienceId": "string",
  "name": "string",
  "description": "string",
  "type": "CUSTOM|LOOKALIKE|AMAZON",
  "size": "number",
  "status": "ACTIVE|BUILDING|READY|ERROR",
  "sourceData": {
    "type": "EMAIL|PHONE|DEVICE_ID",
    "matchRate": "number"
  },
  "createdDate": "ISO8601",
  "lastModifiedDate": "ISO8601"
}
```

## Error Handling

Amazon DSP APIs use standard HTTP status codes and provide detailed error information in response bodies.

### HTTP Status Codes

- `200 OK`: Successful request
- `201 Created`: Resource successfully created
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

### Error Response Format

```json
{
  "errors": [
    {
      "code": "string",
      "message": "string",
      "field": "string",
      "value": "string"
    }
  ],
  "requestId": "string"
}
```

### Common Error Codes

- `INVALID_PARAMETER`: Request parameter validation failed
- `AUTHENTICATION_FAILED`: Invalid or expired authentication token
- `INSUFFICIENT_PERMISSIONS`: User lacks required permissions
- `RESOURCE_NOT_FOUND`: Requested resource does not exist
- `RATE_LIMIT_EXCEEDED`: API rate limit exceeded
- `BUDGET_EXCEEDED`: Campaign budget limit reached

## Rate Limiting

Amazon DSP APIs implement rate limiting to ensure fair usage and system stability.

### Rate Limit Headers

API responses include rate limiting information in headers:

- `X-RateLimit-Limit`: Maximum requests per time window
- `X-RateLimit-Remaining`: Remaining requests in current window
- `X-RateLimit-Reset`: Time when rate limit window resets

### Rate Limit Guidelines

- **Campaign Management**: 100 requests per minute per profile
- **Reporting**: 50 requests per minute per profile
- **Targeting**: 200 requests per minute per profile
- **Discovery**: 100 requests per minute per profile

### Best Practices for Rate Limiting

1. Implement exponential backoff for rate limit errors
2. Cache frequently accessed data to reduce API calls
3. Use batch operations when available
4. Monitor rate limit headers and adjust request frequency
5. Implement request queuing for high-volume operations

## Best Practices

### Authentication Management

1. Implement secure token storage and refresh mechanisms
2. Use appropriate OAuth scopes for required functionality
3. Handle token expiration gracefully with automatic refresh
4. Implement proper error handling for authentication failures

### API Usage Optimization

1. Use pagination for large data sets
2. Implement caching strategies for frequently accessed data
3. Batch operations when possible to reduce API calls
4. Use appropriate filters to minimize data transfer
5. Implement retry logic with exponential backoff

### Data Management

1. Validate data before API submission
2. Implement proper error handling and logging
3. Use appropriate data types and formats
4. Handle asynchronous operations properly
5. Implement data synchronization strategies

### Performance Optimization

1. Use compression for large payloads
2. Implement connection pooling for HTTP requests
3. Cache authentication tokens appropriately
4. Use appropriate timeout values
5. Monitor API performance and optimize accordingly

## Code Examples

### JavaScript/Node.js Authentication

```javascript
const axios = require('axios');

class AmazonDSPClient {
  constructor(clientId, clientSecret, refreshToken) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.refreshToken = refreshToken;
    this.accessToken = null;
    this.baseURL = 'https://advertising-api.amazon.com';
  }

  async authenticate() {
    try {
      const response = await axios.post('https://api.amazon.com/auth/o2/token', {
        grant_type: 'refresh_token',
        refresh_token: this.refreshToken,
        client_id: this.clientId,
        client_secret: this.clientSecret
      });
      
      this.accessToken = response.data.access_token;
      return this.accessToken;
    } catch (error) {
      throw new Error(`Authentication failed: ${error.message}`);
    }
  }

  async makeRequest(method, endpoint, data = null) {
    if (!this.accessToken) {
      await this.authenticate();
    }

    const config = {
      method,
      url: `${this.baseURL}${endpoint}`,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Amazon-Advertising-API-ClientId': this.clientId,
        'Content-Type': 'application/json'
      }
    };

    if (data) {
      config.data = data;
    }

    try {
      const response = await axios(config);
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        // Token expired, refresh and retry
        await this.authenticate();
        config.headers['Authorization'] = `Bearer ${this.accessToken}`;
        const retryResponse = await axios(config);
        return retryResponse.data;
      }
      throw error;
    }
  }
}
```

### Campaign Creation Example

```javascript
async function createCampaign(client, profileId, campaignData) {
  try {
    const response = await client.makeRequest('POST', '/dsp/campaigns/v1/campaigns', {
      ...campaignData,
      headers: {
        'Amazon-Advertising-API-Scope': profileId
      }
    });
    
    console.log('Campaign created:', response.campaignId);
    return response;
  } catch (error) {
    console.error('Campaign creation failed:', error.message);
    throw error;
  }
}

// Usage example
const campaignData = {
  name: 'Holiday Electronics Campaign',
  objective: 'CONVERSION',
  budget: {
    amount: 50000,
    type: 'LIFETIME'
  },
  schedule: {
    startDate: '2025-11-01',
    endDate: '2025-12-31'
  },
  status: 'ACTIVE'
};

createCampaign(client, 'profile123', campaignData);
```

### Report Generation Example

```javascript
async function generateReport(client, profileId, reportParams) {
  try {
    // Request report generation
    const reportRequest = await client.makeRequest('POST', '/dsp/reports/v3/reports', {
      ...reportParams,
      headers: {
        'Amazon-Advertising-API-Scope': profileId
      }
    });
    
    const reportId = reportRequest.reportId;
    console.log('Report requested:', reportId);
    
    // Poll for completion
    let status = 'PENDING';
    while (status !== 'COMPLETED' && status !== 'FAILED') {
      await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30 seconds
      
      const statusResponse = await client.makeRequest('GET', `/dsp/reports/v3/reports/${reportId}`);
      status = statusResponse.status;
      console.log('Report status:', status);
    }
    
    if (status === 'COMPLETED') {
      // Download report
      const reportData = await client.makeRequest('GET', `/dsp/reports/v3/reports/${reportId}/download`);
      return reportData;
    } else {
      throw new Error('Report generation failed');
    }
  } catch (error) {
    console.error('Report generation error:', error.message);
    throw error;
  }
}

// Usage example
const reportParams = {
  reportType: 'CAMPAIGN',
  format: 'JSON',
  dateRange: {
    startDate: '2025-08-01',
    endDate: '2025-08-13'
  },
  dimensions: ['date', 'campaign'],
  metrics: ['impressions', 'clicks', 'spend', 'conversions']
};

generateReport(client, 'profile123', reportParams);
```

### Audience Management Example

```javascript
async function createCustomAudience(client, profileId, audienceData) {
  try {
    const response = await client.makeRequest('POST', '/dsp/targeting/v1/audiences', {
      ...audienceData,
      headers: {
        'Amazon-Advertising-API-Scope': profileId
      }
    });
    
    console.log('Audience created:', response.audienceId);
    return response;
  } catch (error) {
    console.error('Audience creation failed:', error.message);
    throw error;
  }
}

// Usage example
const audienceData = {
  name: 'High-Value Customers',
  description: 'Customers with high lifetime value',
  type: 'CUSTOM',
  sourceData: {
    type: 'EMAIL',
    data: [
      'customer1@example.com',
      'customer2@example.com',
      // ... more customer emails
    ]
  }
};

createCustomAudience(client, 'profile123', audienceData);
```

This comprehensive API documentation provides developers with the necessary information to integrate with Amazon DSP services effectively. The documentation covers authentication, all major API endpoints, data models, error handling, and practical code examples to accelerate development and ensure successful implementation.

