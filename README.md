# Codegrin Mail Sender with Template Editor

A secure email sending application with a dynamic HTML template editor and preview functionality.

## Features

- **Secure Login System**: Password-protected access with session management
- **Bulk Email Sending**: Send emails to multiple recipients at once
- **Dynamic Template Editor**: Create and customize HTML email templates without editing code
- **Live Preview**: See how your emails look before sending
- **Template Management**: Save up to 5 templates per user (stored in browser local storage)
- **Placeholder Support**: Use dynamic placeholders like `{{username}}`, `{{email}}`, `{{date}}`, etc.
- **IMAP Integration**: Automatically saves sent emails to your Sent folder E-mail@2025

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
node index.js
```

3. Open your browser and navigate to `http://localhost:3000`

4. Login with your credentials

## Using the Template Editor

1. Click the **"Template Editor"** button in the main interface
2. Create your custom HTML email template using the editor
3. Use the toolbar to insert common HTML elements
4. Add placeholders using the format `{{placeholderName}}`
5. Click **"Update Preview"** to see a live preview
6. Click **"Save Template"** to save it (max 5 templates)
7. Return to the main page and click **"Use"** on any saved template

## Available Placeholders

- `{{username}}` - Recipient's username (extracted from email)
- `{{email}}` - Recipient's email address
- `{{date}}` - Current date
- `{{company}}` - Company name
- `{{customField1}}` - Custom field 1
- `{{customField2}}` - Custom field 2

## Template Storage

Templates are stored in your browser's local storage, meaning:
- Templates are saved per browser/device
- Maximum of 5 templates per user
- Templates persist across sessions
- No database required

## Security Notes

- Always use HTTPS in production
- Credentials are stored in session storage (cleared on browser close)
- Server validates all authentication requests
- Email addresses are validated before sending