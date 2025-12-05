# Email API Service

A complete email service API with web dashboard for sending emails via SMTP. Configure everything from the browser - no backend setup required!

## 🚀 Features

- **Web Dashboard** - Configure and manage everything from the browser
- **SMTP Configuration** - Support for Gmail, Outlook, Yahoo, Zoho, or custom SMTP
- **Bulk Email** - Send to multiple recipients at once
- **Email Signatures** - Create custom HTML signatures
- **API Key Authentication** & Rate Limiting
- **Vercel Deployment Ready**

## 🛠 Quick Setup

```bash
# Clone and install
git clone <your-repo-url>
cd email-service
npm install

# Start local server
npm run dev
```

Visit `http://localhost:3001` and configure everything from the web dashboard!

## 🌐 Deploy to Vercel

1. Push to GitHub
2. Import to Vercel
3. Add environment variable: `API_KEY=your_secret_key`
4. Deploy!

Visit your deployment URL and configure SMTP from the dashboard.

## 📡 API Endpoints

**Base URLs:**
- Local: `http://localhost:3001`
- Production: `https://your-deployment.vercel.app`

### 1. Send Email
```http
POST /api/send-email
```
**Headers:** `X-API-Key: your_api_key`

**Body:**
```json
{
  "to": "recipient@example.com",
  "subject": "Subject",
  "content": "<h1>HTML content</h1>",
  "isHtml": true
}
```

### 2. Contact Form
```http
POST /api/contact-form
```
**Headers:** `X-API-Key: your_api_key`

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Inquiry",
  "message": "Message content"
}
```

### 3. Test SMTP
```http
POST /api/test-smtp
```
**No API key required**

**Body:**
```json
{
  "host": "smtp.gmail.com",
  "port": "587",
  "secure": false,
  "user": "your@email.com",
  "pass": "password"
}
```

### 4. Health Check
```http
GET /health
```

## 🎯 Example Usage

```javascript
const response = await fetch('https://your-api.vercel.app/api/send-email', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'your_api_key'
  },
  body: JSON.stringify({
    to: 'user@example.com',
    subject: 'Hello',
    content: '<h1>Test Email</h1>'
  })
});
```

## 📋 Environment Variables

**Required:**
- `API_KEY` - Your secret API key

**Optional (can configure from dashboard):**
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
- `DEFAULT_FROM_EMAIL`, `DEFAULT_FROM_NAME`

## 🚨 Error Codes

| Code | Error |
|------|-------|
| 400 | Missing required fields |
| 401 | Missing API key |
| 403 | Invalid API key |
| 429 | Rate limit exceeded |
| 500 | Server/SMTP error |

---

**License:** MIT