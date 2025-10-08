import express from "express";
import bodyParser from "body-parser";
import nodemailer from "nodemailer";
import path from "path";
import imaps from "imap-simple";
import { MailComposer } from "mailcomposer";
import cors from "cors";

// Path to attachment
export const pdfPath = path.resolve("./Codegrin-Portfolio.pdf");

// ---------------- SMTP Options (STARTTLS primary, SSL fallback) ----------------
const smtpOptionsPrimary = {
  host: "smtp.hostinger.com",
  port: 587, // STARTTLS
  secure: false,
  auth: {
    user: "info@codegrin.com",
    pass: "YourFault@2025",
  },
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
  rateDelta: 1000,
  rateLimit: 5,
  tls: {
    servername: "smtp.hostinger.com",
    rejectUnauthorized: false, // set true in production if certs are valid
    minVersion: "TLSv1.2",
  },
  connectionTimeout: 30000,
  greetingTimeout: 30000,
  socketTimeout: 60000,
  logger: false, // set true if you want nodemailer's logger
  debug: false,  // set true temporarily to see SMTP transcript
};

const smtpOptionsFallback = {
  ...smtpOptionsPrimary,
  port: 465,
  secure: true, // SSL-wrapped (implicit TLS)
  debug: false,
};

// Helper to create transporter
function createTransporter(opts) {
  return nodemailer.createTransport(opts);
}

let transporter = createTransporter(smtpOptionsPrimary);

// ---------------- IMAP config ----------------
const imapConfig = {
  imap: {
    user: "info@codegrin.com",
    password: "YourFault@2025",
    host: "imap.hostinger.com",
    port: 993,
    tls: true,
    authTimeout: 10000,
  },
};

// ---------------- appendToSentFolder (unchanged) ----------------
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

// ----------------- Placeholder replacement -----------------
function replacePlaceholders(html, to) {
  const placeholders = {
    username: to.split("@")[0],
    email: to,
    date: new Date().toLocaleDateString(),
    company: "Your Company",
    customField1: "",
    customField2: "",
  };

  let result = html;
  for (const [key, value] of Object.entries(placeholders)) {
    const regex = new RegExp(`{{${key}}}`, "g");
    result = result.replace(regex, value);
  }
  return result;
}

// ----------------- Build email options -----------------
const buildSafeEmail = (to, customTemplate = null, customSubject = null, customAttachments = null) => {
  const baseOptions = {
    from: {
      name: "Chintan Rabadiya",
      address: "info@codegrin.com",
    },
    to: to,
    subject: customSubject || "Proposal for Development Partnership – Codegrin Technologies",
  };

  if (customTemplate) {
    // Convert Base64 data URLs to nodemailer attachment format
    const attachments = [];
    if (customAttachments && Array.isArray(customAttachments)) {
      for (const att of customAttachments) {
        if (att.dataUrl && att.name) {
          // Extract Base64 data from data URL (format: data:mime/type;base64,xxxxx)
          const matches = att.dataUrl.match(/^data:([^;]+);base64,(.+)$/);
          if (matches) {
            attachments.push({
              filename: att.name,
              content: Buffer.from(matches[2], 'base64'),
              contentType: att.type || matches[1],
            });
            console.log(`✓ Processed attachment from Supabase: ${att.name} (${att.type})`);
          }
        }
      }
    }

    console.log(`📧 Custom email built with ${attachments.length} attachment(s) from Supabase`);
    return {
      ...baseOptions,
      html: replacePlaceholders(customTemplate, to),
      text: "Please view this email in an HTML-compatible email client.",
      attachments: attachments,
    };
  }

  // Default text & HTML
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
    html: `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /><title>Partnership Opportunity - Codegrin</title></head><body>
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
      <div style="background:#f8f9fa;padding:20px;text-align:center;border-bottom:3px solid #007bff;margin-bottom:20px;">
        <img src="cid:logo@codegrin" alt="Codegrin Logo" style="max-width:160px;margin-bottom:10px;display:block;margin-left:auto;margin-right:auto;" />
        <h1 style="color:#007bff;margin:10px 0;">Partnership Opportunity</h1>
        <p style="margin:0;"><strong>Codegrin Technologies</strong></p>
      </div>
      <div style="padding:0 10px;">
        <p>Hello,</p>
        <p>I hope this message finds you well.</p>
        <p>My name is <strong>Chintan Rabadiya</strong>, and I am the CEO of <strong>Codegrin Technologies</strong>. We are a software development company specializing in custom web and mobile applications.</p>
        <h3>Our Services</h3>
        <ul>
          <li>Dedicated development teams</li>
          <li>Custom web & mobile apps (Flutter, React)</li>
          <li>API integrations & scalable backends</li>
        </ul>
        <h3>Why Choose Codegrin</h3>
        <ul>
          <li>25+ developers, 100+ projects</li>
          <li>Transparent communication & post-launch support</li>
        </ul>
        <div style="background:#e9ecef;padding:15px;border-radius:6px;margin:20px 0;">
          <strong>Contact:</strong> info@codegrin.com | +91 91062 69972
        </div>
        <p>Best regards,<br/><strong>Chintan Rabadiya</strong></p>
      </div>
      <div style="font-size:12px;color:#6c757d;text-align:center;margin-top:20px;border-top:1px solid #dee2e6;padding-top:15px;">
        Codegrin Technologies · <a href="https://www.codegrin.com">www.codegrin.com</a>
      </div>
    </div>
    </body></html>`,
    attachments: [
      {
        filename: "Codegrin-Portfolio.pdf",
        path: pdfPath,
        contentType: "application/pdf",
        cid: "portfolio",
      },
      {
        filename: "logo.png",
        path: path.resolve("./full-code-grin-logo-png.png"),
        cid: "logo@codegrin",
      },
    ],
  };
};

// ----------------- Transporter readiness check (tries 587 -> 465) -----------------
async function ensureTransporterReady() {
  try {
    console.log("Verifying SMTP connection (port 587 / STARTTLS)...");
    // create a fresh transporter for verification
    transporter = createTransporter(smtpOptionsPrimary);
    await transporter.verify();
    console.log("✓ SMTP verified on port 587 (STARTTLS)");
    return true;
  } catch (err) {
    console.warn("✗ Verify failed on port 587:", err && err.message ? err.message : err);
    console.log("Attempting fallback to port 465 (SSL)...");
    try {
      transporter = createTransporter(smtpOptionsFallback);
      await transporter.verify();
      console.log("✓ SMTP verified on port 465 (SSL)");
      return true;
    } catch (err2) {
      console.error("✗ Fallback verify failed on port 465:", err2 && err2.message ? err2.message : err2);
      return false;
    }
  }
}

// ----------------- Auth middleware -----------------
const EXPECTED_USER = "info-codegrin";
const EXPECTED_PASS = "YourCode#2025";

function authMiddleware(req, res, next) {
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
      // Fallthrough
    }
  }
  if (req.body && typeof req.body === "object") {
    const { authUser, authPass } = req.body;
    if (authUser === EXPECTED_USER && authPass === EXPECTED_PASS) {
      delete req.body.authUser;
      delete req.body.authPass;
      return next();
    }
  }
  res.setHeader("WWW-Authenticate", 'Basic realm="Codegrin Protected API"');
  return res.status(401).json({ message: "Unauthorized: invalid or missing credentials." });
}

// ----------------- Express app setup -----------------
const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: "5mb" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.resolve(".")));

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.get("/", (req, res) => res.sendFile(path.resolve("./index.html")));

function normalizeIncomingEmails(raw) {
  if (typeof raw !== "string") return "";
  let s = raw;
  s = s.replace(/\\r\\n/g, "\n");
  s = s.replace(/\\n/g, "\n");
  s = s.replace(/\\t/g, "\t");
  s = s.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  s = s.replace(/[\u200B-\u200D\uFEFF]/g, "");
  s = s.trim();
  s = s.replace(/^[,;\s]+|[,;\s]+$/g, "");
  return s;
}

// ----------------- Send endpoint -----------------
app.post("/send", authMiddleware, async (req, res) => {
  try {
    const rawInput = req.body.emails ?? req.body.emailsText ?? null;
    if (!rawInput || typeof rawInput !== "string" || rawInput.trim() === "") {
      return res.status(400).json({ message: "Missing or empty 'emails' field. Paste one address per line." });
    }

    const customTemplate = req.body.customTemplate || null;
    const customSubject = req.body.subject || null;
    const customAttachments = req.body.attachments || null;

    if (customTemplate) {
      console.log('📧 Using custom template from Supabase');
      if (customAttachments && Array.isArray(customAttachments)) {
        console.log(`📎 Found ${customAttachments.length} attachment(s) from Supabase`);
      }
    }

    const normalized = normalizeIncomingEmails(rawInput);
    const lines = normalized.split(/\n+/).map((l) => l.trim()).filter(Boolean);
    const addresses = lines.flatMap((l) => l.split(/[,;]+/).map((a) => a.trim()).filter(Boolean));
    const unique = Array.from(new Set(addresses));

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalid = unique.filter((e) => !emailRegex.test(e));
    if (invalid.length) {
      return res.status(400).json({
        message: "Invalid addresses found",
        invalid,
        debug: {
          originalPreview: rawInput.length > 500 ? rawInput.slice(0, 500) + "..." : rawInput,
          normalizedPreview: normalized.length > 500 ? normalized.slice(0, 500) + "..." : normalized,
        },
      });
    }

    // Ensure transporter is ready (tries 587 then 465)
    const ready = await ensureTransporterReady();
    if (!ready) {
      return res.status(503).json({
        message: "SMTP server connection failed. Please check your network connection and SMTP settings.",
        hint: "Common causes: firewall blocking SMTP ports, incorrect credentials, or DNS issues.",
      });
    }

    const results = { sent: [], failed: [] };

    for (const to of unique) {
      try {
        const mailOptions = buildSafeEmail(to, customTemplate, customSubject, customAttachments);

        console.log(`Sending email to ${to}...`);
        const info = await transporter.sendMail(mailOptions);
        console.log(`✓ Sent to ${to}: ${info.messageId}`);

        // Try to append to sent folder (non-blocking)
        try {
          await appendToSentFolder(mailOptions);
          console.log(`✓ Appended to Sent folder for ${to}`);
        } catch (e) {
          console.warn("⚠ IMAP append failed:", e && e.message ? e.message : e);
        }

        results.sent.push({ to, messageId: info.messageId });
      } catch (err) {
        console.error(`✗ Send failed for ${to}:`, err && err.message ? err.message : err);
        results.failed.push({ to, error: err && err.message ? err.message : String(err) });
      }
    }

    return res.json({
      message: "Done",
      results,
      summary: `Sent: ${results.sent.length}, Failed: ${results.failed.length}`,
    });
  } catch (err) {
    console.error("Server error /send:", err && err.stack ? err.stack : err);
    return res.status(500).json({
      message: "Internal server error",
      error: err && err.message ? err.message : String(err),
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }
});

// ----------------- Start server -----------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Server listening on http://localhost:${PORT}`);
  console.log("Testing SMTP connection...");
  const ok = await ensureTransporterReady();
  if (!ok) {
    console.warn("SMTP verification failed at startup. /send endpoint will return 503 until fixed.");
  }
});
