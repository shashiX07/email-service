// Configuration Management
const CONFIG_KEY = 'emailApiConfig';
const SIGNATURE_KEY = 'emailSignature';

// Load configuration from localStorage
function loadConfig() {
    const saved = localStorage.getItem(CONFIG_KEY);
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch (e) {
            console.error('Failed to parse saved config:', e);
        }
    }
    return {
        apiKey: '',
        apiEndpoint: window.location.origin,
        defaultFromEmail: '',
        defaultFromName: '',
        defaultToEmail: '',
        smtp: {
            provider: 'custom',
            host: '',
            port: '587',
            secure: false,
            user: '',
            pass: ''
        }
    };
}

// Load signature from localStorage
function loadSignature() {
    const saved = localStorage.getItem(SIGNATURE_KEY);
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch (e) {
            console.error('Failed to parse saved signature:', e);
        }
    }
    return {
        name: '',
        title: '',
        email: '',
        phone: '',
        website: '',
        company: '',
        custom: ''
    };
}

// Save signature to localStorage
function saveSignatureData(signature) {
    localStorage.setItem(SIGNATURE_KEY, JSON.stringify(signature));
}

// Save configuration to localStorage
function saveConfig(config) {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}

// Get current configuration
function getConfig() {
    return loadConfig();
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initializeTabs();
    loadSavedConfiguration();
    loadSavedSignature();
    checkServerHealth();
    setupEventListeners();
    setupBulkEmailListeners();
    setupSignatureListeners();
});

// Tab Navigation
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');

            // Remove active class from all tabs and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add active class to clicked tab and corresponding content
            button.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });
}

// Load Saved Configuration
function loadSavedConfiguration() {
    const config = getConfig();

    document.getElementById('apiKey').value = config.apiKey || '';
    document.getElementById('apiEndpoint').value = config.apiEndpoint || window.location.origin;
    document.getElementById('defaultFromEmail').value = config.defaultFromEmail || '';
    document.getElementById('defaultFromName').value = config.defaultFromName || '';
    document.getElementById('defaultToEmail').value = config.defaultToEmail || '';

    // Load SMTP configuration
    if (config.smtp) {
        document.getElementById('smtpProvider').value = config.smtp.provider || 'custom';
        document.getElementById('smtpHost').value = config.smtp.host || '';
        document.getElementById('smtpPort').value = config.smtp.port || '587';
        document.getElementById('smtpSecure').checked = config.smtp.secure || false;
        document.getElementById('smtpUser').value = config.smtp.user || '';
        document.getElementById('smtpPass').value = config.smtp.pass || '';
    }

    updateApiKeyStatus(config.apiKey);
}

// Setup Event Listeners
function setupEventListeners() {
    // Configuration Tab
    document.getElementById('saveConfig').addEventListener('click', saveConfiguration);
    document.getElementById('clearConfig').addEventListener('click', clearConfiguration);
    document.getElementById('testConnection').addEventListener('click', testConnection);
    document.getElementById('toggleApiKey').addEventListener('click', toggleApiKeyVisibility);
    
    // SMTP Configuration
    document.getElementById('smtpProvider').addEventListener('change', handleProviderChange);
    document.getElementById('toggleSmtpPass').addEventListener('click', toggleSmtpPasswordVisibility);
    document.getElementById('testSmtpConnection').addEventListener('click', testSmtpConnection);
    document.getElementById('saveSmtpConfig').addEventListener('click', saveSmtpConfiguration);

    // Send Email Form
    document.getElementById('sendEmailForm').addEventListener('submit', handleSendEmail);
}

// Setup Bulk Email Listeners
function setupBulkEmailListeners() {
    document.getElementById('bulkEmailForm').addEventListener('submit', handleBulkEmail);
    document.getElementById('bulkRecipients').addEventListener('input', updateRecipientCount);
}

// Setup Signature Listeners
function setupSignatureListeners() {
    document.getElementById('saveSignature').addEventListener('click', handleSaveSignature);
    document.getElementById('clearSignature').addEventListener('click', handleClearSignature);
    document.getElementById('previewSignature').addEventListener('click', handlePreviewSignature);
}

// Configuration Functions
function saveConfiguration() {
    const currentConfig = getConfig();
    
    const config = {
        apiKey: document.getElementById('apiKey').value.trim(),
        apiEndpoint: document.getElementById('apiEndpoint').value.trim() || window.location.origin,
        defaultFromEmail: document.getElementById('defaultFromEmail').value.trim(),
        defaultFromName: document.getElementById('defaultFromName').value.trim(),
        defaultToEmail: document.getElementById('defaultToEmail').value.trim(),
        smtp: currentConfig.smtp || {}
    };

    if (!config.apiKey) {
        showToast('error', 'API Key Required', 'Please enter an API key');
        return;
    }

    saveConfig(config);
    updateApiKeyStatus(config.apiKey);
    showToast('success', 'Saved!', 'Configuration saved successfully');
}

function clearConfiguration() {
    if (confirm('Are you sure you want to clear all configuration?')) {
        localStorage.removeItem(CONFIG_KEY);
        loadSavedConfiguration();
        showToast('info', 'Cleared', 'All configuration has been cleared');
    }
}

async function testConnection() {
    const config = getConfig();
    if (!config.apiKey) {
        showToast('error', 'Configuration Required', 'Please configure your API key first');
        return;
    }

    showToast('info', 'Testing...', 'Testing connection to API server');

    try {
        const response = await fetch(`${config.apiEndpoint}/health`, {
            headers: {
                'X-API-Key': config.apiKey
            }
        });

        const data = await response.json();

        if (response.ok) {
            showToast('success', 'Connection Successful!', 
                `Server is healthy. SMTP: ${data.smtp_configured ? 'Configured' : 'Not Configured'}`);
        } else {
            showToast('error', 'Connection Failed', data.error || 'Failed to connect to server');
        }
    } catch (error) {
        showToast('error', 'Connection Error', 'Unable to reach the API server');
        console.error('Connection test error:', error);
    }
}

function toggleApiKeyVisibility() {
    const input = document.getElementById('apiKey');
    const icon = document.querySelector('#toggleApiKey i');

    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'fas fa-eye';
    }
}

function toggleSmtpPasswordVisibility() {
    const input = document.getElementById('smtpPass');
    const icon = document.querySelector('#toggleSmtpPass i');

    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'fas fa-eye';
    }
}

function updateApiKeyStatus(apiKey) {
    const statusElement = document.getElementById('apiKeyStatus');
    if (apiKey && apiKey.length > 0) {
        statusElement.textContent = 'Configured';
        statusElement.style.color = 'var(--success)';
    } else {
        statusElement.textContent = 'Not Configured';
        statusElement.style.color = 'var(--danger)';
    }
}

// SMTP Provider Presets
const smtpPresets = {
    gmail: {
        host: 'smtp.gmail.com',
        port: '587',
        secure: false
    },
    outlook: {
        host: 'smtp-mail.outlook.com',
        port: '587',
        secure: false
    },
    yahoo: {
        host: 'smtp.mail.yahoo.com',
        port: '587',
        secure: false
    },
    zoho: {
        host: 'smtp.zoho.com',
        port: '587',
        secure: false
    },
    custom: {
        host: '',
        port: '587',
        secure: false
    }
};

function handleProviderChange() {
    const provider = document.getElementById('smtpProvider').value;
    const preset = smtpPresets[provider];
    
    if (preset) {
        document.getElementById('smtpHost').value = preset.host;
        document.getElementById('smtpPort').value = preset.port;
        document.getElementById('smtpSecure').checked = preset.secure;
        
        // Show helpful message
        if (provider === 'gmail') {
            showToast('info', 'Gmail Selected', 'Remember to use an App Password, not your regular Gmail password');
        } else if (provider === 'outlook') {
            showToast('info', 'Outlook Selected', 'Use your Outlook/Hotmail email and password');
        }
    }
}

async function testSmtpConnection() {
    const smtpConfig = {
        host: document.getElementById('smtpHost').value.trim(),
        port: document.getElementById('smtpPort').value.trim(),
        secure: document.getElementById('smtpSecure').checked,
        user: document.getElementById('smtpUser').value.trim(),
        pass: document.getElementById('smtpPass').value.trim()
    };

    if (!smtpConfig.host || !smtpConfig.port || !smtpConfig.user || !smtpConfig.pass) {
        showToast('error', 'Missing Fields', 'Please fill in all SMTP fields');
        return;
    }

    const testButton = document.getElementById('testSmtpConnection');
    const originalText = testButton.innerHTML;
    testButton.innerHTML = '<span class="loading"></span> Testing...';
    testButton.disabled = true;

    try {
        const config = getConfig();
        const response = await fetch(`${config.apiEndpoint}/api/test-smtp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(smtpConfig)
        });

        const result = await response.json();

        if (response.ok && result.success) {
            showToast('success', 'Connection Successful!', 'SMTP configuration is valid and working');
        } else {
            showToast('error', 'Connection Failed', result.details || result.error || 'Unable to connect to SMTP server');
        }
    } catch (error) {
        showToast('error', 'Network Error', 'Unable to test SMTP connection: ' + error.message);
        console.error('SMTP test error:', error);
    } finally {
        testButton.innerHTML = originalText;
        testButton.disabled = false;
    }
}

function saveSmtpConfiguration() {
    const smtpConfig = {
        provider: document.getElementById('smtpProvider').value,
        host: document.getElementById('smtpHost').value.trim(),
        port: document.getElementById('smtpPort').value.trim(),
        secure: document.getElementById('smtpSecure').checked,
        user: document.getElementById('smtpUser').value.trim(),
        pass: document.getElementById('smtpPass').value.trim()
    };

    if (!smtpConfig.host || !smtpConfig.port || !smtpConfig.user || !smtpConfig.pass) {
        showToast('error', 'Missing Fields', 'Please fill in all SMTP fields');
        return;
    }

    const config = getConfig();
    config.smtp = smtpConfig;
    saveConfig(config);

    showToast('success', 'SMTP Config Saved!', 'Your SMTP configuration has been saved locally');
}

// Server Health Check
async function checkServerHealth() {
    const config = getConfig();
    const statusIndicator = document.getElementById('statusIndicator');
    const statusDot = statusIndicator.querySelector('.status-dot');
    const statusText = statusIndicator.querySelector('.status-text');

    try {
        const response = await fetch(`${config.apiEndpoint}/health`);
        const data = await response.json();

        if (response.ok && data.success) {
            statusDot.style.background = 'var(--success)';
            statusText.textContent = 'Online';
            
            // Update dashboard stats
            document.getElementById('serverStatus').textContent = 'Running';
            document.getElementById('serverStatus').style.color = 'var(--success)';
            
            document.getElementById('smtpStatus').textContent = 
                data.smtp_configured ? 'Configured' : 'Not Configured';
            document.getElementById('smtpStatus').style.color = 
                data.smtp_configured ? 'var(--success)' : 'var(--warning)';
            
            updateApiKeyStatus(config.apiKey);
            updateLastUpdated();
        } else {
            throw new Error('Server unhealthy');
        }
    } catch (error) {
        statusDot.style.background = 'var(--danger)';
        statusText.textContent = 'Offline';
        document.getElementById('serverStatus').textContent = 'Offline';
        document.getElementById('serverStatus').style.color = 'var(--danger)';
        console.error('Health check error:', error);
    }
}

function updateLastUpdated() {
    document.getElementById('lastUpdated').textContent = new Date().toLocaleTimeString();
}

// Send Email Handler
async function handleSendEmail(e) {
    e.preventDefault();

    const config = getConfig();
    if (!config.apiKey) {
        showToast('error', 'Configuration Required', 'Please configure your API key first');
        return;
    }

    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    submitButton.innerHTML = '<span class="loading"></span> Sending...';
    submitButton.disabled = true;

    let content = document.getElementById('emailContent').value.trim();
    
    // Add signature if requested
    if (document.getElementById('includeSignature').checked) {
        const signature = generateSignatureHTML();
        if (signature) {
            content += signature;
        }
    }

    const emailData = {
        to: document.getElementById('emailTo').value.trim(),
        subject: document.getElementById('emailSubject').value.trim(),
        content: content,
        from: document.getElementById('emailFromCustom').value.trim() || undefined,
        fromName: document.getElementById('emailFromName').value.trim() || undefined,
        replyTo: document.getElementById('emailReplyTo').value.trim() || undefined,
        isHtml: document.getElementById('isHtml').checked
    };

    try {
        const response = await fetch(`${config.apiEndpoint}/api/send-email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': config.apiKey
            },
            body: JSON.stringify(emailData)
        });

        const result = await response.json();

        if (response.ok && result.success) {
            showToast('success', 'Email Sent!', 'Your email has been sent successfully');
            e.target.reset();
            document.getElementById('isHtml').checked = true;
        } else {
            showToast('error', 'Failed to Send', result.error || 'An error occurred');
        }
    } catch (error) {
        showToast('error', 'Network Error', 'Unable to connect to the API server');
        console.error('Send email error:', error);
    } finally {
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
    }
}

// Bulk Email Handler
async function handleBulkEmail(e) {
    e.preventDefault();

    const config = getConfig();
    if (!config.apiKey) {
        showToast('error', 'Configuration Required', 'Please configure your API key first');
        return;
    }

    const recipientsText = document.getElementById('bulkRecipients').value.trim();
    const recipients = parseRecipients(recipientsText);

    if (recipients.length === 0) {
        showToast('error', 'No Recipients', 'Please enter at least one valid email address');
        return;
    }

    const submitButton = e.target.querySelector('button[type="submit"]');
    submitButton.disabled = true;

    let content = document.getElementById('bulkContent').value.trim();
    
    // Add signature if requested
    if (document.getElementById('bulkIncludeSignature').checked) {
        const signature = generateSignatureHTML();
        if (signature) {
            content += signature;
        }
    }

    const emailData = {
        subject: document.getElementById('bulkSubject').value.trim(),
        content: content,
        from: document.getElementById('bulkFromCustom').value.trim() || undefined,
        fromName: document.getElementById('bulkFromName').value.trim() || undefined,
        replyTo: document.getElementById('bulkReplyTo').value.trim() || undefined,
        isHtml: document.getElementById('bulkIsHtml').checked
    };

    // Show progress
    document.getElementById('bulkProgress').style.display = 'block';
    document.getElementById('bulkResults').style.display = 'none';
    document.getElementById('totalCount').textContent = recipients.length;
    document.getElementById('sentCount').textContent = '0';
    document.getElementById('failedCount').textContent = '0';

    const results = [];
    let sent = 0;
    let failed = 0;

    // Send emails one by one
    for (let i = 0; i < recipients.length; i++) {
        const recipient = recipients[i];
        const progress = ((i + 1) / recipients.length) * 100;
        
        document.getElementById('progressFill').style.width = `${progress}%`;
        document.getElementById('progressText').textContent = 
            `Sending to ${recipient} (${i + 1}/${recipients.length})`;

        try {
            const response = await fetch(`${config.apiEndpoint}/api/send-email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': config.apiKey
                },
                body: JSON.stringify({
                    ...emailData,
                    to: recipient
                })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                sent++;
                results.push({ email: recipient, success: true, message: 'Sent successfully' });
            } else {
                failed++;
                results.push({ email: recipient, success: false, message: result.error || 'Unknown error' });
            }
        } catch (error) {
            failed++;
            results.push({ email: recipient, success: false, message: error.message });
        }

        document.getElementById('sentCount').textContent = sent;
        document.getElementById('failedCount').textContent = failed;

        // Small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Show results
    document.getElementById('progressText').textContent = 'Complete!';
    displayBulkResults(results);
    document.getElementById('bulkResults').style.display = 'block';

    submitButton.disabled = false;

    if (failed === 0) {
        showToast('success', 'All Emails Sent!', `Successfully sent ${sent} emails`);
    } else {
        showToast('warning', 'Partially Complete', `Sent: ${sent}, Failed: ${failed}`);
    }
}

// Parse recipients from text input
function parseRecipients(text) {
    // Split by newlines and commas, trim whitespace, filter empty strings
    const emails = text
        .split(/[\n,]+/)
        .map(email => email.trim())
        .filter(email => email.length > 0)
        .filter(email => {
            // Basic email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        });
    
    // Remove duplicates
    return [...new Set(emails)];
}

// Update recipient count
function updateRecipientCount() {
    const recipientsText = document.getElementById('bulkRecipients').value.trim();
    const recipients = parseRecipients(recipientsText);
    document.getElementById('recipientCount').textContent = recipients.length;
}

// Display bulk results
function displayBulkResults(results) {
    const resultsList = document.getElementById('resultsList');
    resultsList.innerHTML = '';

    results.forEach(result => {
        const resultItem = document.createElement('div');
        resultItem.className = `result-item ${result.success ? 'success' : 'error'}`;
        
        resultItem.innerHTML = `
            <div class="result-icon">
                <i class="fas ${result.success ? 'fa-check' : 'fa-times'}"></i>
            </div>
            <div class="result-info">
                <div class="result-email">${result.email}</div>
                <div class="result-message">${result.message}</div>
            </div>
        `;
        
        resultsList.appendChild(resultItem);
    });
}

// Signature Management Functions
function loadSavedSignature() {
    const signature = loadSignature();
    
    document.getElementById('signatureName').value = signature.name || '';
    document.getElementById('signatureTitle').value = signature.title || '';
    document.getElementById('signatureEmail').value = signature.email || '';
    document.getElementById('signaturePhone').value = signature.phone || '';
    document.getElementById('signatureWebsite').value = signature.website || '';
    document.getElementById('signatureCompany').value = signature.company || '';
    document.getElementById('signatureCustom').value = signature.custom || '';
}

function handleSaveSignature() {
    const signature = {
        name: document.getElementById('signatureName').value.trim(),
        title: document.getElementById('signatureTitle').value.trim(),
        email: document.getElementById('signatureEmail').value.trim(),
        phone: document.getElementById('signaturePhone').value.trim(),
        website: document.getElementById('signatureWebsite').value.trim(),
        company: document.getElementById('signatureCompany').value.trim(),
        custom: document.getElementById('signatureCustom').value.trim()
    };

    saveSignatureData(signature);
    showToast('success', 'Signature Saved!', 'Your email signature has been saved');
}

function handleClearSignature() {
    if (confirm('Are you sure you want to clear your signature?')) {
        localStorage.removeItem(SIGNATURE_KEY);
        loadSavedSignature();
        document.getElementById('signaturePreviewBox').style.display = 'none';
        showToast('info', 'Signature Cleared', 'Your signature has been cleared');
    }
}

function handlePreviewSignature() {
    const html = generateSignatureHTML();
    const previewBox = document.getElementById('signaturePreviewBox');
    const previewContent = document.getElementById('signaturePreviewContent');
    
    if (html) {
        previewContent.innerHTML = html;
        previewBox.style.display = 'block';
        showToast('info', 'Preview Generated', 'Scroll down to see your signature preview');
    } else {
        showToast('warning', 'No Signature', 'Please add signature details first');
    }
}

function generateSignatureHTML() {
    const signature = loadSignature();
    
    // If custom HTML is provided, use that
    if (signature.custom && signature.custom.trim()) {
        return '<div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb;">' + 
               signature.custom + '</div>';
    }
    
    // Check if any signature fields are filled
    if (!signature.name && !signature.title && !signature.email && 
        !signature.phone && !signature.website && !signature.company) {
        return '';
    }
    
    // Generate default signature template
    let html = '<div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb; font-family: Arial, sans-serif;">';
    html += '<div style="margin-bottom: 20px;">';
    
    if (signature.name) {
        html += `<div style="font-size: 18px; font-weight: 700; color: #667eea; margin-bottom: 5px;">${signature.name}</div>`;
    }
    
    if (signature.title) {
        html += `<div style="font-size: 14px; color: #6b7280; margin-bottom: 10px;">${signature.title}</div>`;
    }
    
    if (signature.company) {
        html += `<div style="font-size: 14px; color: #1f2937; margin-bottom: 10px;"><strong>${signature.company}</strong></div>`;
    }
    
    html += '<div style="height: 2px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); margin: 15px 0; width: 100px;"></div>';
    
    html += '<div style="font-size: 13px; color: #1f2937; line-height: 1.8;">';
    
    if (signature.email) {
        html += `<div>📧 <a href="mailto:${signature.email}" style="color: #667eea; text-decoration: none;">${signature.email}</a></div>`;
    }
    
    if (signature.phone) {
        html += `<div>📱 ${signature.phone}</div>`;
    }
    
    if (signature.website) {
        html += `<div>🌐 <a href="${signature.website}" style="color: #667eea; text-decoration: none;">${signature.website}</a></div>`;
    }
    
    html += '</div>';
    html += '</div>';
    html += '</div>';
    
    return html;
}

// Toast Notification System
function showToast(type, title, message) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const iconMap = {
        success: 'fa-check-circle',
        error: 'fa-times-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };

    toast.innerHTML = `
        <div class="toast-icon">
            <i class="fas ${iconMap[type]}"></i>
        </div>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;

    container.appendChild(toast);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

// Refresh dashboard periodically
setInterval(() => {
    if (document.querySelector('.tab-content.active').id === 'dashboard') {
        checkServerHealth();
    }
}, 30000); // Every 30 seconds
