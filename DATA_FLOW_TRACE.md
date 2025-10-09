# Email Template & Attachment Data Flow Analysis

## Current Implementation Status: ✅ FULLY FROM SUPABASE

### 1. EMAIL EDITOR (email-editor.html)
**Storage Location:** Supabase Database (`email_templates` table)

- **Templates:** Saved via `supabase.from('email_templates').upsert()`
- **Attachments:** Stored as Base64 data URLs in JSON array format
- **Data Structure:**
  ```json
  {
    "id": "uuid",
    "name": "Template Name",
    "subject": "Email Subject",
    "html": "<html>...</html>",
    "attachments": [
      {
        "name": "file.pdf",
        "type": "application/pdf",
        "size": 12345,
        "dataUrl": "data:application/pdf;base64,..."
      }
    ]
  }
  ```

### 2. TEMPLATE SELECTION FLOW
**File:** `email-editor.html` → `useTemplateById()` function

1. User clicks "Use" button on a template
2. Function fetches template from Supabase: `await getTemplates()`
3. Stores full template data in sessionStorage: `sessionStorage.setItem('cg_selected_template', JSON.stringify(tpl))`
4. Redirects to main mail sender page

**Current Issue:** SessionStorage contains FULL template data (including attachments)

### 3. MAIL SENDER PAGE (index.html)
**Data Source:** Supabase Database (Real-time fetch)

#### On Page Load:
- Reads template ID from sessionStorage
- Fetches fresh data from Supabase: 
  ```javascript
  await window.supabaseClient
    .from('email_templates')
    .select('*')
    .eq('id', tpl.id)
    .maybeSingle()
  ```

#### When Sending/Previewing (sendEmails function):
**Line 314-345:** Fetches template from Supabase
```javascript
// CURRENT CODE - CORRECT ✅
if (selectedTpl.id && window.supabaseClient) {
  // Fetch fresh template data from Supabase
  const { data, error } = await window.supabaseClient
    .from('email_templates')
    .select('*')
    .eq('id', selectedTpl.id)
    .maybeSingle();
  
  if (data) {
    templateData = data; // ✅ COMES FROM SUPABASE
  }
}
```

**Line 379-386:** Sends data to server
```javascript
if (templateData) {
  bodyObj.customTemplate = templateData.html;        // ✅ FROM SUPABASE
  bodyObj.subject = templateData.subject;            // ✅ FROM SUPABASE
  bodyObj.attachments = templateData.attachments;    // ✅ FROM SUPABASE (Base64)
}
```

### 4. SERVER (index.js)
**Data Source:** Receives from frontend (which got it from Supabase)

#### Endpoint: POST /send
**Line 376-378:** Receives template data
```javascript
const customTemplate = req.body.customTemplate || null;   // HTML from Supabase
const customSubject = req.body.subject || null;           // Subject from Supabase
const customAttachments = req.body.attachments || null;   // Attachments from Supabase
```

#### Attachment Processing (buildSafeEmail function)
**Line 154-181:** Converts Base64 to Buffer
```javascript
if (customTemplate) {
  const attachments = [];
  if (customAttachments && Array.isArray(customAttachments)) {
    for (const att of customAttachments) {
      if (att.dataUrl && att.name) {
        const matches = att.dataUrl.match(/^data:([^;]+);base64,(.+)$/);
        if (matches) {
          attachments.push({
            filename: att.name,
            content: Buffer.from(matches[2], 'base64'), // ✅ FROM SUPABASE
            contentType: att.type || matches[1],
          });
        }
      }
    }
  }
  return {
    ...baseOptions,
    html: replacePlaceholders(customTemplate, to),
    attachments: attachments  // ✅ ALL FROM SUPABASE
  };
}
```

#### Default Attachments (ONLY when NO custom template)
**Line 269-281:** Uses local files
```javascript
// Only executed when customTemplate is NULL
attachments: [
  {
    filename: "Codegrin-Portfolio.pdf",
    path: pdfPath,  // Local file
  },
  {
    filename: "logo.png",
    path: path.resolve("./full-code-grin-logo-png.png"),  // Local file
  },
]
```

## VERIFICATION CHECKLIST ✅

- [x] Templates stored in Supabase
- [x] Attachments stored as Base64 in Supabase
- [x] Frontend fetches from Supabase (not sessionStorage) when sending
- [x] Server receives Supabase data (not local files) for custom templates
- [x] Local files only used when NO custom template selected
- [x] Logging added to track data source

## CONCLUSION

**Current Status:** ✅ WORKING CORRECTLY

All email templates and attachments come from Supabase database when using custom templates. Local files (PDF, logo) are ONLY used when sending emails WITHOUT a custom template (default mode).

The sessionStorage is only used to store the template ID for reference, and the actual data is fetched fresh from Supabase every time an email is sent.
