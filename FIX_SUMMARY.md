# Attachment Source Fix - Complete

## Problem Identified
Attachments were being received from sessionStorage instead of Supabase database because:

1. **email-editor.html line 956**: Stored FULL template data (including attachments) in sessionStorage
2. **index.html line 339-340**: Had a fallback that used sessionStorage data when Supabase wasn't available
3. **index.html line 455**: Re-stored full template data to sessionStorage on page load

## Changes Made

### 1. email-editor.html - useTemplateById() function
**BEFORE:**
```javascript
window.useTemplateById = async function(id) {
  const templates = await getTemplates();
  const tpl = templates.find(t => t.id === id);
  
  if (tpl) {
    // Stored FULL data including attachments ❌
    sessionStorage.setItem('cg_selected_template', JSON.stringify(tpl));
    window.location.href = '/';
  }
};
```

**AFTER:**
```javascript
window.useTemplateById = async function(id) {
  if (id) {
    // Store ONLY the template ID ✅
    sessionStorage.setItem('cg_selected_template', JSON.stringify({ id }));
    window.location.href = '/';
  }
};
```

### 2. index.html - sendEmails() function
**BEFORE:**
```javascript
if (selectedTpl.id && window.supabaseClient) {
  // Fetch from Supabase
  templateData = data;
} else {
  // Fallback to sessionStorage ❌
  templateData = selectedTpl;
}
```

**AFTER:**
```javascript
if (selectedTpl.id && window.supabaseClient) {
  // Fetch from Supabase - ONLY SOURCE ✅
  templateData = data;
  console.log('✅ Template fetched from Supabase:', templateData.name);
  if (templateData.attachments) {
    console.log(`✅ ${templateData.attachments.length} attachment(s) from Supabase`);
  }
} else {
  // Show error - NO fallback ✅
  resultEl.textContent = 'Error: Cannot load template - database connection issue.';
  return;
}
```

### 3. index.html - loadTemplateFromSupabase() function
**BEFORE:**
```javascript
if (data) {
  // Re-stored full data ❌
  sessionStorage.setItem('cg_selected_template', JSON.stringify(data));
  
  // Update UI
  document.getElementById('subject').value = data.subject;
}
```

**AFTER:**
```javascript
if (data) {
  // DO NOT store full data - keep only ID ✅
  // sessionStorage only stores the template ID reference
  
  // Update UI
  document.getElementById('subject').value = data.subject;
  console.log('✅ Template loaded from Supabase:', data.name);
}
```

## Result

### SessionStorage Now Stores:
```json
{
  "id": "uuid-here"
}
```
**ONLY the template ID** - no HTML, no subject, no attachments

### Supabase as Single Source of Truth:
- ✅ Every time email is sent, fresh fetch from Supabase
- ✅ Every time preview is shown, fresh fetch from Supabase
- ✅ Every time page loads, fresh fetch from Supabase
- ✅ NO fallback to sessionStorage
- ✅ Attachments ALWAYS come from Supabase database

### Added Logging:
- "✅ Template fetched from Supabase: Template Name"
- "✅ X attachment(s) from Supabase: [file1.pdf, file2.png]"
- "✅ Processed attachment from Supabase: filename (type)"
- "📧 Custom email built with X attachment(s) from Supabase"

## Verification Steps

1. Clear browser cache and sessionStorage
2. Select a template from email editor
3. Check console logs - should show "✅ Template fetched from Supabase"
4. Send email - should show "📎 Found X attachment(s) from Supabase"
5. Check server logs - should show "✓ Processed attachment from Supabase: filename"

**The email attachments now come 100% from Supabase database!**
