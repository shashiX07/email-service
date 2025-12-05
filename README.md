# Email API Service Documentation

## Overview

This is a complete email service API built with Node.js and Express that provides secure email sending functionality using Gmail SMTP. The service is designed to handle contact form submissions and general email sending with proper authentication, rate limiting, and beautiful HTML templates.

## 🚀 Features

- ✅ **Web Dashboard** - Modern UI to manage everything from the browser
- ✅ **SMTP Configuration** - Configure email providers (Gmail, Outlook, Yahoo, Zoho) from frontend
- ✅ **Bulk Email Sending** - Send emails to multiple recipients at once
- ✅ **Email Signatures** - Create and manage custom email signatures
- ✅ **Secure API Key Authentication**
- ✅ **Rate Limiting** (10 emails per 10 minutes per IP)
- ✅ **Multiple SMTP Provider Support**
- ✅ **Beautiful HTML Email Templates**
- ✅ **Input Validation & Sanitization**
- ✅ **CORS Support**
- ✅ **Error Handling & Logging**
- ✅ **Vercel Deployment Ready**
- ✅ **Health Check Endpoints**

## 📁 Project Structure

```
email-service/
├── public/
│   ├── index.html      # Web dashboard interface
│   ├── styles.css      # Dashboard styling
│   └── script.js       # Dashboard functionality
├── .env                # Environment variables (sensitive data)
├── .gitignore         # Git ignore rules
├── .vercelignore      # Vercel ignore rules
├── package.json       # Node.js dependencies and scripts
├── server.js          # Main server application
├── vercel.json        # Vercel deployment configuration
└── README.md          # Documentation
```

## 🛠 Installation & Setup

### 1. Prerequisites

- Node.js >= 18.0.0
- Gmail account with App Password enabled
- Git

### 2. Local Development Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd email_api

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env file with your credentials
nano .env

# Start development server
npm run dev
```

### 3. Environment Configuration

Create a .env file in the email_api directory:

```env
# Server Configuration
PORT=3001
API_KEY=your_super_secret_api_key_here

# Gmail SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=your-app-password

# Default Settings
DEFAULT_FROM_EMAIL=your-gmail@gmail.com
DEFAULT_FROM_NAME=Your Name
DEFAULT_TO_EMAIL=recipient@gmail.com

# Environment
NODE_ENV=development
```

### 4. Gmail Setup

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account Settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   - Use this 16-character password as `SMTP_PASS`

## 📡 API Endpoints

### Base URL
- **Local**: `http://localhost:3001`
- **Production**: `https://your-deployment.vercel.app`

### Authentication

All protected endpoints require an API key in the request headers:

```javascript
headers: {
  'X-API-Key': 'your_api_key_here'
}
```

### Endpoints

#### 1. Health Check
```http
GET /
GET /health
```

**Response:**
```json
{
  "success": true,
  "message": "Email API Server is running",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0"
}
```

#### 2. Contact Form Submission
```http
POST /api/contact-form
```

**Headers:**
```
Content-Type: application/json
X-API-Key: your_api_key_here
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Project Inquiry",
  "message": "Hello, I'm interested in your services..."
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Contact form submitted successfully",
  "messageId": "<unique-message-id>",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Missing required fields: name, email, subject, message"
}
```

#### 3. Generic Email Sending
```http
POST /api/send-email
```

**Headers:**
```
Content-Type: application/json
X-API-Key: your_api_key_here
```

**Request Body:**
```json
{
  "to": "recipient@example.com",
  "subject": "Email Subject",
  "content": "<h1>HTML Content</h1><p>Your message here</p>",
  "from": "sender@example.com",
  "fromName": "Sender Name",
  "replyTo": "reply@example.com",
  "isHtml": true
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Email sent successfully",
  "messageId": "<unique-message-id>",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 🎯 Frontend Integration

### React/TypeScript Example

```tsx
// ContactApp.tsx
import React, { useState } from 'react';

const ContactApp = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('https://your-api-url.vercel.app/api/contact-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'your_api_key_here'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        alert('Message sent successfully!');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      alert('Failed to send message. Please try again.');
    }
  };

  // ... rest of component
};
```

### JavaScript/Vanilla Example

```javascript
async function sendContactForm(formData) {
  try {
    const response = await fetch('https://your-api-url.vercel.app/api/contact-form', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'your_api_key_here'
      },
      body: JSON.stringify(formData)
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
}
```

## 🚀 Deployment

### Vercel Deployment

1. **Push to GitHub:**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Deploy to Vercel:**
   - Connect your GitHub repository to Vercel
   - Import the project
   - Configure environment variables in Vercel dashboard
   - Deploy

3. **Set Environment Variables in Vercel:**
   Go to your Vercel project dashboard → Settings → Environment Variables and add:
   ```
   API_KEY=your_secret_key
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-gmail@gmail.com
   SMTP_PASS=your-app-password
   DEFAULT_FROM_EMAIL=your-gmail@gmail.com
   DEFAULT_FROM_NAME=Your Name
   DEFAULT_TO_EMAIL=recipient@gmail.com
   NODE_ENV=production
   ```

### Alternative Deployments

#### Heroku
```bash
# Install Heroku CLI
npm install -g heroku

# Login and create app
heroku login
heroku create your-app-name

# Set environment variables
heroku config:set API_KEY=your_secret_key
heroku config:set SMTP_USER=your-gmail@gmail.com
# ... add all other variables

# Deploy
git push heroku main
```

#### Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

## 🔒 Security Features

### 1. API Key Authentication
- All endpoints require a valid API key
- Keys should be stored securely and rotated regularly

### 2. Rate Limiting
- Maximum 5 requests per 15-minute window per IP
- Prevents spam and abuse

### 3. Input Validation
- Email format validation
- Required field checking
- Content sanitization

### 4. CORS Configuration
- Restricts origins that can access the API
- Configurable for development and production

### 5. Helmet.js Security Headers
- Adds various HTTP headers for security
- Protects against common vulnerabilities

## 📧 Email Templates

### Contact Form Template
The service automatically generates beautiful HTML emails with:
- Professional styling
- Responsive design
- Sender information display
- Message formatting
- Timestamp and source tracking

### Template Structure
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    /* Professional CSS styling */
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📧 New Contact Message</h1>
    </div>
    <div class="content">
      <!-- Contact information fields -->
    </div>
    <div class="footer">
      <!-- Timestamp and reply instructions -->
    </div>
  </div>
</body>
</html>
```

## 🐛 Error Handling

### Common Error Codes

| Status Code | Error | Description |
|-------------|-------|-------------|
| 400 | Bad Request | Missing required fields or invalid data |
| 401 | Unauthorized | Missing API key |
| 403 | Forbidden | Invalid API key |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server or SMTP error |

### Error Response Format
```json
{
  "success": false,
  "error": "Error description",
  "details": "Additional error details (development only)"
}
```

## 📊 Monitoring & Logging

### Server Logs
The server logs important events:
- Successful email sends
- Authentication failures
- Rate limit violations
- SMTP errors

### Health Monitoring
Use the health endpoints to monitor service status:
```bash
curl https://your-api-url.vercel.app/health
```

## 🧪 Testing

### Manual Testing

1. **Health Check:**
```bash
curl https://your-api-url.vercel.app/health
```

2. **Contact Form:**
```bash
curl -X POST https://your-api-url.vercel.app/api/contact-form \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_api_key" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "subject": "Test Subject",
    "message": "Test message"
  }'
```

### Integration Testing
Create automated tests to verify:
- API key authentication
- Email sending functionality
- Rate limiting
- Error handling

## 🔧 Configuration Options

### SMTP Settings
```env
SMTP_HOST=smtp.gmail.com      # SMTP server
SMTP_PORT=587                 # SMTP port (587 for TLS)
SMTP_SECURE=false            # true for SSL, false for TLS
SMTP_USER=your-email         # Gmail address
SMTP_PASS=app-password       # Gmail app password
```

### Rate Limiting
```javascript
const emailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 minutes
  max: 5,                     // Maximum requests per window
  message: {
    error: 'Too many requests',
    retryAfter: '15 minutes'
  }
});
```

### CORS Origins
```javascript
app.use(cors({
  origin: [
    'http://localhost:5173',     // Vite dev server
    'http://localhost:3000',     // React dev server
    'https://yourdomain.com',    // Production domain
    'https://*.vercel.app'       // Vercel deployments
  ],
  credentials: true
}));
```

## 🚨 Troubleshooting

### Common Issues

1. **SMTP Authentication Error**
   - Verify Gmail app password is correct
   - Check 2FA is enabled on Gmail account
   - Ensure correct SMTP settings

2. **API Key Authentication Failed**
   - Check API key in request headers
   - Verify environment variable is set correctly

3. **Rate Limit Exceeded**
   - Wait for rate limit window to reset
   - Implement client-side rate limiting

4. **CORS Error**
   - Add your domain to allowed origins
   - Check request headers and method

5. **Deployment Issues**
   - Verify all environment variables are set
   - Check server logs for specific errors
   - Ensure proper Vercel configuration

### Debug Mode
Set `NODE_ENV=development` to get detailed error messages in responses.

## 📋 Best Practices

### Security
- Use strong, unique API keys
- Rotate API keys regularly
- Keep environment variables secure
- Monitor for suspicious activity

### Performance
- Implement client-side validation
- Use appropriate rate limiting
- Monitor email delivery rates
- Cache SMTP connections when possible

### Reliability
- Implement retry logic in clients
- Monitor service health
- Set up alerts for failures
- Have backup email services ready

## 📚 Additional Resources

- [Nodemailer Documentation](https://nodemailer.com/)
- [Express.js Guide](https://expressjs.com/)
- [Vercel Deployment Docs](https://vercel.com/docs)
- [Gmail SMTP Settings](https://support.google.com/mail/answer/7126229)

## 🤝 Support

For issues and questions:
1. Check this documentation
2. Review server logs
3. Test with manual API calls
4. Check Gmail SMTP configuration
5. Verify environment variables

---

**Version:** 1.0.0  
**Last Updated:** January 2024  
**License:** MIT