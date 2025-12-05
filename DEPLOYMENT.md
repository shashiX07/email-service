# Deployment Guide

## Quick Deploy to Vercel

### 1. Prerequisites
- GitHub account
- Vercel account (free)
- Your code pushed to GitHub repository

### 2. Deploy Steps

#### Option A: Via Vercel Dashboard
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will auto-detect the configuration
5. Add environment variables (see below)
6. Click "Deploy"

#### Option B: Via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### 3. Environment Variables

Add these in Vercel Dashboard → Settings → Environment Variables:

**Required Variables:**
```
API_KEY=your_secure_api_key_here
```

**SMTP Variables (Optional - can configure from frontend):**
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
DEFAULT_FROM_EMAIL=your-email@gmail.com
DEFAULT_FROM_NAME=Your Name
DEFAULT_TO_EMAIL=recipient@gmail.com
```

**System Variables:**
```
NODE_ENV=production
```

### 4. After Deployment

1. **Access Your Dashboard:**
   - Visit: `https://your-project.vercel.app`
   - You'll see the web interface

2. **Configure from Frontend:**
   - Go to Configuration tab
   - Set your API Key
   - Configure SMTP settings
   - Test connection
   - Save configuration

3. **Test Your Service:**
   - Use the Send Email tab
   - Try Bulk Email feature
   - Create your signature

### 5. Using the API

**Your API Endpoints:**
```
https://your-project.vercel.app/api/send-email
https://your-project.vercel.app/api/contact-form
https://your-project.vercel.app/api/test-smtp
https://your-project.vercel.app/health
```

**Example API Call:**
```javascript
const response = await fetch('https://your-project.vercel.app/api/send-email', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'your-api-key'
  },
  body: JSON.stringify({
    to: 'recipient@example.com',
    subject: 'Hello',
    content: '<h1>Test Email</h1>',
    isHtml: true
  })
});
```

### 6. Troubleshooting

**Frontend not showing?**
- Check vercel.json routes are correct
- Ensure public/ folder is deployed
- Check browser console for errors

**API not working?**
- Verify environment variables are set
- Check API key is correct
- Review Vercel logs: Dashboard → Deployments → View Function Logs

**SMTP issues?**
- Use frontend SMTP test feature
- For Gmail: Use App Password, not regular password
- Check firewall/network restrictions

### 7. Custom Domain (Optional)

1. Go to Vercel Dashboard → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Wait for DNS propagation (up to 48 hours)

### 8. Monitoring

**Check Logs:**
```bash
vercel logs [deployment-url]
```

**View in Dashboard:**
- Vercel Dashboard → Your Project → Logs
- Real-time function execution logs
- Error tracking

### 9. Updates

**Deploy Updates:**
```bash
git add .
git commit -m "Update"
git push origin main
```
Vercel will auto-deploy on push!

### 10. Security Tips

✅ **DO:**
- Use strong, unique API keys
- Enable rate limiting (already configured)
- Use App Passwords for Gmail
- Store credentials in Vercel environment variables
- Use HTTPS for all API calls

❌ **DON'T:**
- Commit .env file to GitHub
- Share your API key publicly
- Use regular Gmail password
- Disable CORS in production

## Support

For issues:
1. Check Vercel deployment logs
2. Test SMTP from frontend dashboard
3. Verify environment variables
4. Review browser console for frontend errors

## Success! 🎉

Your email service is now live and accessible worldwide via Vercel's global CDN!
