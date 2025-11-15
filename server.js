const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// 🔧 TRUST PROXY - Fix for Vercel deployment
app.set('trust proxy', 1);

// Middleware
app.use(helmet());
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
}));

app.options('*', cors());
app.use(express.json({ limit: '12mb' }));

// 🔧 UPDATED RATE LIMITING - Fixed for production
const emailLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10, // 10 requests per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress || 'unknown';
  },
  message: {
    success: false,
    error: 'Too many email requests from this IP, please try again later.',
    retryAfter: '10 minutes'
  },
  skip: (req) => process.env.NODE_ENV === 'development'
});

// 🔧 FIXED: Create SMTP transporter (removed 'er' from createTransporter)
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// 🔧 ENHANCED API KEY VERIFICATION
const verifyApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.body.apiKey || req.query.apiKey;
  
  console.log('Received API Key:', apiKey ? `${apiKey.substring(0, 8)}...` : 'None');
  console.log('Expected API Key:', process.env.API_KEY ? `${process.env.API_KEY.substring(0, 8)}...` : 'Not Set');
  
  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error: 'API key is required',
      hint: 'Include X-API-Key header in your request'
    });
  }
  
  if (apiKey !== process.env.API_KEY) {
    return res.status(403).json({
      success: false,
      error: 'Invalid API key',
      received: apiKey ? `${apiKey.substring(0, 8)}...` : 'None'
    });
  }
  
  next();
};

// Health check endpoints
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Email API Server is running on Vercel',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    apiKeyConfigured: !!process.env.API_KEY,
    features: {
      'contact-form': '/api/contact-form',
      'generic-email': '/api/send-email',
      'test-email': '/api/test-email'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Email API Server is healthy',
    timestamp: new Date().toISOString(),
    smtp_configured: !!(process.env.SMTP_USER && process.env.SMTP_PASS),
    api_key_configured: !!process.env.API_KEY
  });
});

// 🧪 Manual test email endpoint
app.post('/api/test-email', verifyApiKey, async (req, res) => {
  try {
    await sendStartupTestEmail();
    res.json({
      success: true,
      message: 'Test email sent successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to send test email',
      details: error.message
    });
  }
});

// Contact form endpoint
app.post('/api/contact-form', emailLimiter, verifyApiKey, async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, email, subject, message'
      });
    }

    const htmlTemplate = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Contact Message</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background: #ffffff;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
          }
          .content {
            padding: 30px;
          }
          .field {
            margin-bottom: 20px;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 8px;
            border-left: 4px solid #667eea;
          }
          .field strong {
            color: #495057;
            display: block;
            margin-bottom: 5px;
          }
          .message-content {
            white-space: pre-wrap;
            background: white;
            padding: 15px;
            border-radius: 5px;
            border: 1px solid #e9ecef;
          }
          .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #6c757d;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📧 New Contact Message</h1>
            <p>Portfolio Contact Form Submission</p>
          </div>
          
          <div class="content">
            <div class="field">
              <strong>👤 Name:</strong>
              ${name}
            </div>
            
            <div class="field">
              <strong>📧 Email:</strong>
              <a href="mailto:${email}">${email}</a>
            </div>
            
            <div class="field">
              <strong>📝 Subject:</strong>
              ${subject}
            </div>
            
            <div class="field">
              <strong>💬 Message:</strong>
              <div class="message-content">${message}</div>
            </div>
          </div>
          
          <div class="footer">
            <p>Received on ${new Date().toLocaleString()}</p>
            <p>Reply directly to this email to respond to ${name}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const transporter = createTransporter();
    await transporter.verify();

    const mailOptions = {
      from: `"${process.env.DEFAULT_FROM_NAME}" <${process.env.DEFAULT_FROM_EMAIL}>`,
      to: process.env.DEFAULT_TO_EMAIL,
      replyTo: email,
      subject: `🌟 Portfolio Contact: ${subject}`,
      html: htmlTemplate,
      text: `
        New Contact Form Message
        
        From: ${name} (${email})
        Subject: ${subject}
        
        Message:
        ${message}
        
        Sent on: ${new Date().toLocaleString()}
      `
    };

    const info = await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: 'Contact form submitted successfully',
      messageId: info.messageId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Contact form error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to send contact form',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Server initialization
const initializeServer = async () => {
  try {
    console.log('🚀 Starting Email API Server...');
    console.log('🔑 API Key configured:', !!process.env.API_KEY);
    
    // Send startup test email (only in production)
    if (process.env.NODE_ENV === 'production') {
      await sendStartupTestEmail();
    }
    
    console.log('✅ Server initialization complete!');
  } catch (error) {
    console.error('⚠️  Server started with warnings:', error.message);
  }
};

// Export for Vercel
module.exports = app;

// Local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, async () => {
    console.log(`🚀 Email API Server running on port ${PORT}`);
    console.log(`📧 SMTP configured for: ${process.env.SMTP_USER}`);
    console.log(`🔑 API Key authentication enabled`);
    
    await initializeServer();
  });
} else {
  // Vercel serverless initialization
  initializeServer();
}
