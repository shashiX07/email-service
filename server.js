// filepath: d:\webOS\cosmic-web-desktop\email_api\server.js
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'https://yourdomain.com', 'https://*.vercel.app'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const emailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many email requests, please try again later.',
    retryAfter: '15 minutes'
  }
});

// Create SMTP transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
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

// Middleware to verify API key
const verifyApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.body.apiKey;
  
  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error: 'API key is required'
    });
  }
  
  if (apiKey !== process.env.API_KEY) {
    return res.status(403).json({
      success: false,
      error: 'Invalid API key'
    });
  }
  
  next();
};

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Email API Server is running on Vercel',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Email API Server is healthy',
    timestamp: new Date().toISOString()
  });
});

// Contact form specific endpoint
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

// Generic email endpoint
app.post('/api/send-email', emailLimiter, verifyApiKey, async (req, res) => {
  try {
    const {
      to,
      subject,
      content,
      from,
      fromName,
      replyTo,
      isHtml = true
    } = req.body;

    if (!to || !subject || !content) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: to, subject, content'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email address'
      });
    }

    const transporter = createTransporter();
    await transporter.verify();

    const mailOptions = {
      from: fromName ? `"${fromName}" <${from || process.env.DEFAULT_FROM_EMAIL}>` : from || process.env.DEFAULT_FROM_EMAIL,
      to: to,
      replyTo: replyTo || from || process.env.DEFAULT_FROM_EMAIL,
      subject: subject,
      [isHtml ? 'html' : 'text']: content,
      ...(isHtml && {
        text: content.replace(/<[^>]*>/g, '')
      })
    };

    const info = await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: 'Email sent successfully',
      messageId: info.messageId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Email sending error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to send email',
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

// Export for Vercel
module.exports = app;

// Only listen if not in Vercel
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Email API Server running on port ${PORT}`);
  });
}