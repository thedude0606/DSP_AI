const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();
const PORT = 3000;

// CORS middleware - applied to all requests
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // Allow all origins
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, Amazon-Advertising-API-ClientId, Amazon-Advertising-API-Scope");
  
  // Handle preflight OPTIONS requests
  if (req.method === "OPTIONS") {
    // Add a dummy AdvertiserId for OPTIONS requests to satisfy potential server-side checks
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, Amazon-Advertising-API-ClientId, Amazon-Advertising-API-Scope, Amazon-Advertising-API-AdvertiserId, Amazon-Advertising-API-EntityId");
    res.header("Amazon-Advertising-API-AdvertiserId", "dummy_advertiser_id"); // Dummy value
    res.header("Amazon-Advertising-API-EntityId", "dummy_entity_id"); // Dummy value
    return res.sendStatus(200);
  }
  next();
});

// Proxy for Amazon Advertising API
app.use(
  "/advertising-api",
  createProxyMiddleware({
    target: "https://advertising-api.amazon.com",
    changeOrigin: true,
    pathRewrite: {
      "^/advertising-api": "",
    },
    onProxyReq: (proxyReq, req, res) => {
      // Add client ID header for Amazon Advertising API
      if (req.headers["amazon-advertising-api-clientid"]) {
        proxyReq.setHeader("Amazon-Advertising-API-ClientId", req.headers["amazon-advertising-api-clientid"]);
      }
      // Add scope header for Amazon Advertising API
      if (req.headers["amazon-advertising-api-scope"]) {
        proxyReq.setHeader("Amazon-Advertising-API-Scope", req.headers["amazon-advertising-api-scope"]);
      }
    },
    secure: false, // For development, set to true in production
    logLevel: "debug",
  })
);

// Proxy for Amazon Authentication API
app.use(
  "/auth",
  createProxyMiddleware({
    target: "https://api.amazon.com",
    changeOrigin: true,
    pathRewrite: {
      "^/auth": "",
    },
    secure: false, // For development, set to true in production
    logLevel: "debug",
  })
);

app.listen(PORT, () => {
  console.log(`Proxy server listening on port ${PORT}`);
});


