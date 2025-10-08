import express from "express";
import bodyParser from "body-parser";
import nodemailer from "nodemailer";
import path from "path";
import imaps from "imap-simple";
import { MailComposer } from "mailcomposer";
import cors from "cors";
// Path to attachment
export const pdfPath = path.resolve("./Codegrin-Portfolio.pdf");

// SMTP config (you already have these values in your original code)
const config = {
  smtp: {
    host: "smtp.hostinger.com",
    port: 465,
    secure: true,
    auth: {
      user: "info@codegrin.com",
      pass: "Yourcode@2025",
    },
  },
};

const imapConfig = {
  imap: {
    user: "info@codegrin.com",
    password: "Yourcode@2025",
    host: "imap.hostinger.com",
    port: 993,
    tls: true,
    authTimeout: 10000,
  },
};

// Keep your appendToSentFolder function (unchanged, but included here)
async function appendToSentFolder(mailOptions) {
  const composer = new MailComposer(mailOptions);
  const raw = await new Promise((resolve, reject) => {
    composer.compile().build((err, message) => {
      if (err) return reject(err);
      resolve(message);
    });
  });

  const connection = await imaps.connect(imapConfig);
  try {
    const candidates = [
      "Sent",
      "INBOX.Sent",
      "INBOX/Sent",
      "Sent Items",
      "INBOX.Sent Items",
      "Sent-Mail",
      "INBOX.Sent-Mail",
      "INBOX",
    ];

    for (const mailbox of candidates) {
      try {
        await connection.append(raw, { mailbox, flags: ["\\Seen"] });
        console.log(`📥 Appended message to Sent folder: ${mailbox}`);
        return;
      } catch (err) {
        // try next
      }
    }

    const boxes = await connection.getBoxes();
    function findSentRecursive(obj, prefix = "") {
      for (const name in obj) {
        const delim = obj[name].delimiter || ".";
        const fullName = prefix ? `${prefix}${delim}${name}` : name;
        if (/sent/i.test(name) || /sent/i.test(fullName)) return fullName;
        if (obj[name].children) {
          const found = findSentRecursive(obj[name].children, fullName);
          if (found) return found;
        }
      }
      return null;
    }

    const foundMailbox = findSentRecursive(boxes);
    if (foundMailbox) {
      await connection.append(raw, { mailbox: foundMailbox, flags: ["\\Seen"] });
      console.log(`📥 Appended message to Sent folder: ${foundMailbox}`);
      return;
    }

    throw new Error("No Sent-like mailbox found on IMAP server (tried common names).");
  } finally {
    connection.end();
  }
}

// Helper function to replace placeholders in template
function replacePlaceholders(html, to) {
  const placeholders = {
    username: to.split('@')[0],
    email: to,
    date: new Date().toLocaleDateString(),
    company: 'Your Company',
    customField1: '',
    customField2: ''
  };

  let result = html;
  for (const [key, value] of Object.entries(placeholders)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, value);
  }
  return result;
}

// Reuse your buildSafeEmail, accept "to" dynamically
const buildSafeEmail = (to, customTemplate = null, customSubject = null) => {
  const baseOptions = {
    from: {
      name: "Chintan Rabadiya",
      address: "info@codegrin.com",
    },
    to: to,
    subject: customSubject || "Proposal for Development Partnership – Codegrin Technologies",
  };

  // If custom template is provided, use it instead of default
  if (customTemplate) {
    return {
      ...baseOptions,
      html: replacePlaceholders(customTemplate, to),
      text: 'Please view this email in an HTML-compatible email client.',
      attachments: []
    };
  }

  // Default template
  return {
    ...baseOptions,
     text: `Hello,
    
        I hope this message finds you well.
        
        My name is Chintan Rabadiya, and I am the CEO of Codegrin Technologies. We are a software development company specializing in custom web and mobile applications.
        
        I am reaching out to explore potential partnership opportunities with your organization.
        
        OUR SERVICES:
        
        DEDICATED DEVELOPMENT TEAM
        - Experienced developers available for long-term projects
        - Full-stack web development expertise
        - Mobile application development (Flutter)
        - Flexible engagement models
        
        PROJECT-BASED DEVELOPMENT
        - Custom web applications
        - E-commerce platforms
        - API development and integration
        - Database design and optimization
        
        PRICING STRUCTURE:
        - Mid-level Developer: INR 50,000 per month
        - Senior Developer: INR 80,000 per month
        - Project-based pricing available upon request
        
        WHY CHOOSE CODEGRIN:
        - Over 25 experienced developers on our team
        - Proven track record with 100+ successful projects
        - Transparent communication and regular updates
        - Post-launch support and maintenance
        
        I would welcome the opportunity to discuss how we can support your development needs.
        
        Please feel free to reply to this email or contact me directly.
        
        Best regards,
        
        Chintan Rabadiya
        Chief Executive Officer
        Codegrin Technologies
        
        Contact Information:
        Email: info@codegrin.com
        Website: www.codegrin.com
        Phone: +91 91062 69972
        
        ---
        UNSUBSCRIBE: If you do not wish to receive future communications, please reply with "UNSUBSCRIBE" in the subject line.
        
        This email was sent by Codegrin Technologies. We respect your privacy and will not share your information with third parties.
        `,
        
            // Clean, professional HTML version
            html: `
             <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Partnership Opportunity - Codegrin Technologies</title>
                <style>
                    body {
                        font-family: Arial, Helvetica, sans-serif;
                        line-height: 1.6;
                        color: #333333;
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                        background-color: #ffffff;
                    }
                    .header {
                        background-color: #f8f9fa;
                        padding: 20px;
                        text-align: center;
                        border-bottom: 3px solid #007bff;
                        margin-bottom: 30px;
                    }
                    .logo {
                        max-width: 200px;
                        height: auto;
                        margin-bottom: 15px;
                    }
                    .content {
                        padding: 0 20px;
                    }
                    h1 {
                        color: #007bff;
                        font-size: 24px;
                        margin-bottom: 10px;
                    }
                    h2 {
                        color: #495057;
                        font-size: 18px;
                        margin-top: 25px;
                        margin-bottom: 15px;
                        border-bottom: 1px solid #dee2e6;
                        padding-bottom: 5px;
                    }
                    .service-list {
                        background-color: #f8f9fa;
                        padding: 15px;
                        border-left: 4px solid #007bff;
                        margin: 15px 0;
                    }
                    .pricing-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 20px 0;
                    }
                    .pricing-table th,
                    .pricing-table td {
                        padding: 10px;
                        text-align: left;
                        border: 1px solid #dee2e6;
                    }
                    .pricing-table th {
                        background-color: #007bff;
                        color: white;
                    }
                    .pricing-table tr:nth-child(even) {
                        background-color: #f8f9fa;
                    }
                    .contact-info {
                        background-color: #e9ecef;
                        padding: 20px;
                        border-radius: 5px;
                        margin: 20px 0;
                    }
                    .footer {
                        font-size: 12px;
                        color: #6c757d;
                        text-align: center;
                        margin-top: 30px;
                        padding-top: 20px;
                        border-top: 1px solid #dee2e6;
                    }
                    .unsubscribe {
                        font-size: 11px;
                        color: #868e96;
                        margin-top: 15px;
                    }
                    a {
                        color: #007bff;
                        text-decoration: none;
                    }
                    a:hover {
                        text-decoration: underline;
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <img src="cid:logo@codegrin" alt="Codegrin Technologies Logo" class="logo" >

                    <h1>Partnership Opportunity</h1>
                    <p><strong>Codegrin Technologies</strong></p>
                </div>
        
                <div class="content">
                    <p>Hello,</p>
                    
                    <p>I hope this message finds you well.</p>
                    
                    <p>My name is <strong>Chintan Rabadiya</strong>, and I am the CEO of <strong>Codegrin Technologies</strong>. We are a software development company specializing in custom web and mobile applications.</p>
                    
                    <p>I am reaching out to explore potential partnership opportunities with your organization.</p>
        
                    <h2>Our Services</h2>
                    
                    <div class="service-list">
                        <h3>Dedicated Development Team</h3>
                        <ul>
                            <li>Experienced developers available for long-term projects</li>
                            <li>Full-stack web development expertise</li>
                            <li>Mobile application development (Flutter)</li>
                            <li>Flexible engagement models</li>
                        </ul>
                    </div>
        
                    <div class="service-list">
                        <h3>Project-Based Development</h3>
                        <ul>
                            <li>Custom web applications</li>
                            <li>E-commerce platforms</li>
                            <li>API development and integration</li>
                            <li>Database design and optimization</li>
                        </ul>
                    </div>
        
                    <h2>Pricing Structure</h2>
                    <table class="pricing-table">
                        <thead>
                            <tr>
                                <th>Service Type</th>
                                <th>Monthly Rate (INR)</th>
                                <th>Commitment</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Mid-level Developer</td>
                                <td>50,000</td>
                                <td>160 hours/month</td>
                            </tr>
                            <tr>
                                <td>Senior Developer</td>
                                <td>80,000</td>
                                <td>160 hours/month</td>
                            </tr>
                            <tr>
                                <td>Project-based</td>
                                <td>Variable</td>
                                <td>Based on scope</td>
                            </tr>
                        </tbody>
                    </table>
        
                    <h2>Why Choose Codegrin</h2>
                    <ul>
                        <li>Over 25 experienced developers on our team</li>
                        <li>Proven track record with 100+ successful projects</li>
                        <li>Transparent communication and regular updates</li>
                        <li>Post-launch support and maintenance</li>
                    </ul>
        
                    <p>I would welcome the opportunity to discuss how we can support your development needs.</p>
                    
                    <p>Please feel free to reply to this email or contact me directly.</p>
        
                    <div class="contact-info">
                        <h3>Contact Information</h3>
                        <p><strong>Chintan Rabadiya</strong><br>
                        Chief Executive Officer<br>
                        Codegrin Technologies</p>
                        
                        <p>
                            Email: <a href="mailto:info@codegrin.com">info@codegrin.com</a><br>
                            Website: <a href="https://www.codegrin.com">www.codegrin.com</a><br>
                            Phone: +91 91062 69972
                        </p>
                    </div>
                </div>
        
                <div class="footer">
                    <div class="unsubscribe">
                        <p><strong>UNSUBSCRIBE:</strong> If you do not wish to receive future communications, please <a href="mailto:info@codegrin.com?subject=UNSUBSCRIBE">click here to unsubscribe</a>.</p>
                        
                        <p>This email was sent by Codegrin Technologies. We respect your privacy and will not share your information with third parties.</p>
                    </div>
                </div>
            </body>
            </html>
            `,
            
            attachments: [
              {
                filename: "Codegrin-Portfolio.pdf",
                path: pdfPath,
                contentType: "application/pdf",
                cid: "portfolio"
              },
              {
    filename: "logo.png",
    path: path.resolve("./full-code-grin-logo-png.png"), // local file
    cid: "logo@codegrin" // any unique cid string
  }
            ],
  };
};

const transporter = nodemailer.createTransport(config.smtp);
const EXPECTED_USER = "info-codegrin";
const EXPECTED_PASS = "YourCode#2025";

function authMiddleware(req, res, next) {
  // 1) Try Basic Auth header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Basic ")) {
    try {
      const base64 = authHeader.split(" ")[1];
      const decoded = Buffer.from(base64, "base64").toString("utf8");
      const [user, pass] = decoded.split(":");
      if (user === EXPECTED_USER && pass === EXPECTED_PASS) {
        return next();
      }
    } catch (e) {
      // fallthrough to other checks
    }
  }
  if (req.body && typeof req.body === "object") {
    const { authUser, authPass } = req.body;
    if (authUser === EXPECTED_USER && authPass === EXPECTED_PASS) {
      // remove credentials from body so later logging/sending doesn't leak them
      delete req.body.authUser;
      delete req.body.authPass;
      return next();
    }
  }

  // If we get here, no valid creds
  res.setHeader("WWW-Authenticate", 'Basic realm="Codegrin Protected API"');
  return res.status(401).json({ message: "Unauthorized: invalid or missing credentials." });
}
const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: "5mb" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.resolve(".")));

// Simple request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Serve index.html
app.get("/", (req, res) => res.sendFile(path.resolve("./index.html")));

function normalizeIncomingEmails(raw) {
  // raw could contain literal backslash-n sequences like "\\n" (two characters) if double-escaped.
  if (typeof raw !== "string") return "";
  let s = raw;

  // Replace escaped newline sequences with real newlines
  s = s.replace(/\\r\\n/g, "\n");
  s = s.replace(/\\n/g, "\n");
  // Also replace literal escaped comma sequences (unlikely) and tabs
  s = s.replace(/\\t/g, "\t");
  // Normalize CRLF -> LF
  s = s.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  // Remove any zero-width or unusual whitespace
  s = s.replace(/[\u200B-\u200D\uFEFF]/g, "");
  // Trim surrounding whitespace and leading/trailing commas
  s = s.trim();
  s = s.replace(/^[,;\s]+|[,;\s]+$/g, "");
  return s;
}
// ---------------------------------------------------------------------------

app.post("/send", authMiddleware, async (req, res) => {
  try {
    const rawInput = req.body.emails ?? req.body.emailsText ?? null;
    if (!rawInput || typeof rawInput !== "string" || rawInput.trim() === "") {
      return res.status(400).json({ message: "Missing or empty 'emails' field. Paste one address per line." });
    }

    // Get custom template if provided
    const customTemplate = req.body.customTemplate || null;
    const customSubject = req.body.subject || null;

    // Normalize first to convert escaped/newline-literal sequences into actual newlines
    const normalized = normalizeIncomingEmails(rawInput);

    // Split into lines by real newline, then split each by commas/semicolons if present
    const lines = normalized.split(/\n+/).map(l => l.trim()).filter(Boolean);
    const addresses = lines.flatMap(l => l.split(/[,;]+/).map(a => a.trim()).filter(Boolean));
    const unique = Array.from(new Set(addresses));

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalid = unique.filter(e => !emailRegex.test(e));
    if (invalid.length) {
      // Return helpful debug: include the original raw preview and normalized preview
      return res.status(400).json({
        message: "Invalid addresses found",
        invalid,
        debug: {
          originalPreview: rawInput.length > 500 ? rawInput.slice(0, 500) + "..." : rawInput,
          normalizedPreview: normalized.length > 500 ? normalized.slice(0, 500) + "..." : normalized
        }
      });
    }

    await transporter.verify();
    const results = { sent: [], failed: [] };

    for (const to of unique) {
      try {
        const mailOptions = buildSafeEmail(to, customTemplate, customSubject);

        const info = await transporter.sendMail(mailOptions);
        try { await appendToSentFolder(mailOptions); } catch (e) { console.warn("IMAP append failed:", e.message || e); }
        results.sent.push({ to, messageId: info.messageId });
      } catch (err) {
        console.error("Send failed for", to, err);
        results.failed.push({ to, error: err.message ?? String(err) });
      }
    }

    return res.json({ message: "Done", results });
  } catch (err) {
    console.error("Server error /send:", err);
    return res.status(500).json({ message: "Internal server error", error: err.message ?? String(err) });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));