# SMTP Connection Troubleshooting Guide

## The Error: "Greeting never received"

This error means the SMTP client couldn't establish a connection to the mail server within the timeout period.

## Common Causes & Solutions

### 1. Firewall/Network Blocking Port 465

**Test if port is blocked:**
```bash
# Test if you can reach the SMTP server
telnet smtp.hostinger.com 465

# Or using nc (netcat)
nc -zv smtp.hostinger.com 465

# Or using curl
curl -v telnet://smtp.hostinger.com:465
```

**If port 465 is blocked, try port 587 (STARTTLS):**

Edit your `index.js` config to:
```javascript
const config = {
  smtp: {
    host: "smtp.hostinger.com",
    port: 587,              // Change from 465 to 587
    secure: false,          // Change from true to false
    requireTLS: true,       // Add this
    // ... rest of config
  },
};
```

### 2. VPN or Corporate Network Issues

- Try disabling VPN temporarily
- Check if your ISP blocks outgoing SMTP connections
- Try using a mobile hotspot to test connectivity

### 3. DNS Resolution Issues

**Test DNS resolution:**
```bash
nslookup smtp.hostinger.com
# or
dig smtp.hostinger.com
```

**If DNS fails, add to `/etc/hosts` (Linux/Mac) or `C:\Windows\System32\drivers\etc\hosts` (Windows):**
```
# Get IP first with: nslookup smtp.hostinger.com
[IP_ADDRESS] smtp.hostinger.com
```

### 4. Hostinger-Specific Settings

Hostinger requires:
- **Authenticated SMTP** (you have this)
- **From address must match authenticated user** (you have this)
- **Port 465 (SSL) or 587 (TLS)**

**Try alternative Hostinger settings:**
```javascript
const config = {
  smtp: {
    host: "smtp.hostinger.com",
    port: 587,
    secure: false,
    auth: {
      user: "info@codegrin.com",
      pass: "Yourcode@2025",
    },
    tls: {
      ciphers: 'SSLv3',
      rejectUnauthorized: false
    }
  },
};
```

### 5. Test with Gmail (Temporary Debugging)

To verify if it's a Hostinger-specific issue, try Gmail:

```javascript
const config = {
  smtp: {
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: "your-gmail@gmail.com",
      pass: "your-app-password", // Not regular password!
    },
  },
};
```

**Note:** Gmail requires an [App Password](https://support.google.com/accounts/answer/185833)

### 6. Check Hostinger Control Panel

1. Log into Hostinger control panel
2. Go to **Email Accounts**
3. Verify SMTP settings are enabled
4. Check for any security restrictions
5. Ensure email account is active

### 7. Rate Limiting / IP Block

Hostinger may block your IP if:
- Too many failed login attempts
- Suspicious activity detected
- Sending too many emails too fast

**Contact Hostinger support** to check if your IP is blocked.

## Recommended Testing Steps

### Step 1: Test basic connectivity
```bash
ping smtp.hostinger.com
telnet smtp.hostinger.com 465
```

### Step 2: Test with OpenSSL
```bash
openssl s_client -connect smtp.hostinger.com:465 -crlf
# You should see: 220 smtp.hostinger.com ESMTP
```

### Step 3: Try port 587 instead
Update your config to use port 587 with STARTTLS

### Step 4: Enable debug mode
Already added in the code:
```javascript
logger: true,
debug: false,  // Set to true for verbose output
```

### Step 5: Test from different network
- Try mobile hotspot
- Try different WiFi network
- Try VPN (or disable VPN if using one)

## Quick Fix Options

### Option A: Use Port 587 (Most Common Fix)

Edit `index.js`:
```javascript
const config = {
  smtp: {
    host: "smtp.hostinger.com",
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: "info@codegrin.com",
      pass: "Yourcode@2025",
    },
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 60000,
  },
};
```

### Option B: Increase Timeouts

Already implemented in your code (30 seconds for connection, 60 seconds for socket).

### Option C: Use Nodemailer Debug

Set `debug: true` in config to see detailed SMTP conversation.

## Still Not Working?

1. **Check Hostinger server status:** https://www.hostinger.com/status
2. **Contact Hostinger support** with error details
3. **Verify credentials** are correct (password might have special chars)
4. **Check email quota** hasn't been exceeded
5. **Try from a different server/location** to rule out network issues

## Alternative: Use SendGrid or Mailgun

If Hostinger continues to have issues, consider using a transactional email service:

**SendGrid:**
```javascript
const config = {
  smtp: {
    host: "smtp.sendgrid.net",
    port: 587,
    auth: {
      user: "apikey",
      pass: "YOUR_SENDGRID_API_KEY",
    },
  },
};
```

**Mailgun:**
```javascript
const config = {
  smtp: {
    host: "smtp.mailgun.org",
    port: 587,
    auth: {
      user: "postmaster@yourdomain.mailgun.org",
      pass: "YOUR_MAILGUN_PASSWORD",
    },
  },
};
```

## Need More Help?

Run the server with debug output:
```bash
NODE_ENV=development node index.js
```

Check the detailed logs for more information about where the connection is failing.
