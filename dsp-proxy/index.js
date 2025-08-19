const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const bodyParser = require("body-parser");
const fetch = require("node-fetch"); // Import node-fetch for server-side requests

const app = express();
const PORT = 8080;

// Use body-parser to parse JSON and URL-encoded bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// CORS middleware - applied to all requests
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // Allow all origins
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, Amazon-Advertising-API-ClientId, Amazon-Advertising-API-Scope, Amazon-Advertising-API-AdvertiserId, Amazon-Advertising-API-EntityId");
  
  // Handle preflight OPTIONS requests
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// New endpoint for server-side authentication
app.post("/proxy-auth/token", async (req, res) => {
  const { grant_type, refresh_token, client_id, client_secret } = req.body;

  try {
    const authResponse = await fetch("https://api.amazon.com/auth/o2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        grant_type,
        refresh_token,
        client_id,
        client_secret,
      }),
    });

    const data = await authResponse.json();
    if (!authResponse.ok) {
      console.error("Amazon Auth API error:", data);
      return res.status(authResponse.status).json(data);
    }

    res.json(data);
  } catch (error) {
    console.error("Proxy authentication error:", error);
    res.status(500).json({ error: "Internal server error during authentication" });
  }
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

app.listen(PORT, () => {
  console.log(`Proxy server listening on port ${PORT}`);
});



