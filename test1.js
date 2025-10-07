import nodemailer from "nodemailer";
import imaps from "imap-simple";
import fs from "fs";
import path from "path";
import { MailComposer } from "mailcomposer";
import validator from "validator";

// Minimal configuration - appears as personal email
const config = {
  smtp: {
    host: "smtp.hostinger.com",
    port: 465,
    secure: true,
    pool: false, // No pooling - single personal emails
    auth: {
      user: "info@codegrin.com",
      pass: "Yourcode@2025",
    },
    requireTLS: true,
    tls: {
      rejectUnauthorized: false,
      minVersion: "TLSv1.2"
    }
  },
  imap: {
    imap: {
      user: "info@codegrin.com",
      password: "Yourcode@2025",
      host: "imap.hostinger.com",
      port: 993,
      tls: true,
      authTimeout: 10000,
    },
  },
  delays: {
    betweenEmails: 30000, // 30 seconds between emails (very conservative)
    retryDelay: 20000, // 20 seconds before retry
    maxRetries: 2,
  }
};

// Single recipient for testing
const recipients = [
  "jinupatel6352@gmail.com",
];

export const pdfPath = path.resolve("./Codegrin-Portfolio.pdf");

// Validate email addresses
const validateEmails = (emails) => {
  return emails.filter(email => {
    if (!validator.isEmail(email)) {
      console.log(`⚠️  Invalid email address: ${email}`);
      return false;
    }
    return true;
  });
};

// Create minimal transporter
const createTransporter = () => {
  return nodemailer.createTransport(config.smtp);
};

const transporter = createTransporter();

// Helper: find a likely sent folder name
function findSentMailbox(boxes) {
  const candidates = ["sent", "sent items", "sent-mail", "sentitems"];
  function search(obj, prefix = "") {
    for (const name in obj) {
      const fullName = prefix ? `${prefix}${name}` : name;
      const lower = name.toLowerCase();
      if (candidates.includes(lower) || candidates.includes(fullName.toLowerCase())) return fullName;
      if (obj[name].children) {
        const found = search(obj[name].children, `${fullName}${obj[name].delimiter || "."}`);
        if (found) return found;
      }
    }
    return null;
  }
  return search(boxes) || "Sent";
}

// Build ultra-clean personal email
const buildMailOptions = (to) => {
  return {
    from: {
      name: 'Chintan Rabadiya',
      address: 'info@codegrin.com'
    },
    to: to,
    replyTo: 'info@codegrin.com',
    subject: "Software Development Inquiry",
    
    // Minimal headers - just like a regular email client
    headers: {
      'X-Priority': '3',
    },
    
    // Simple, personal plain text
    text: `Hello,

I hope you're doing well.

My name is Chintan Rabadiya, and I'm reaching out from Codegrin Technologies, a software development company based in India.

I wanted to introduce our services and see if there might be opportunities for collaboration on software development projects.

We specialize in:
- Web application development (React, Node.js, PHP)
- Mobile app development (Flutter, React Native)
- Custom software solutions
- API development and integrations

Our team consists of 25+ experienced developers, and we've completed over 100 projects for clients worldwide.

We offer flexible engagement models:
- Dedicated developer: ₹50,000-70,000/month
- Project-based development
- Hourly consulting

If you have any upcoming software development needs or would like to learn more about our capabilities, I'd be happy to discuss further.

You can reach me directly at this email or call +91 91062 69972.

Thank you for your time.

Best regards,
Chintan Rabadiya
CEO, Codegrin Technologies
www.codegrin.com

P.S. I've attached our portfolio for your reference.`,

    // Clean, minimal HTML
    html: `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px;">
        <p>Hello,</p>
        
        <p>I hope you're doing well.</p>
        
        <p>My name is <strong>Chintan Rabadiya</strong>, and I'm reaching out from Codegrin Technologies, a software development company based in India.</p>
        
        <p>I wanted to introduce our services and see if there might be opportunities for collaboration on software development projects.</p>
        
        <p><strong>We specialize in:</strong></p>
        <ul>
            <li>Web application development (React, Node.js, PHP)</li>
            <li>Mobile app development (Flutter, React Native)</li>
            <li>Custom software solutions</li>
            <li>API development and integrations</li>
        </ul>
        
        <p>Our team consists of 25+ experienced developers, and we've completed over 100 projects for clients worldwide.</p>
        
        <p><strong>We offer flexible engagement models:</strong></p>
        <ul>
            <li>Dedicated developer: ₹50,000-70,000/month</li>
            <li>Project-based development</li>
            <li>Hourly consulting</li>
        </ul>
        
        <p>If you have any upcoming software development needs or would like to learn more about our capabilities, I'd be happy to discuss further.</p>
        
        <p>You can reach me directly at this email or call +91 91062 69972.</p>
        
        <p>Thank you for your time.</p>
        
        <p>Best regards,<br>
        <strong>Chintan Rabadiya</strong><br>
        CEO, Codegrin Technologies<br>
        <a href="http://www.codegrin.com">www.codegrin.com</a></p>
        
        <p><em>P.S. I've attached our portfolio for your reference.</em></p>
    </div>
    `,
    
    attachments: [
      {
        filename: "Codegrin-Portfolio.pdf",
        path: pdfPath,
        contentType: "application/pdf"
      },
    ],
    
    priority: 'normal'
  };
};

// Delay function for rate limiting
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Send email with retry logic
const sendEmailWithRetry = async (mailOptions, maxRetries = config.delays.maxRetries) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const info = await transporter.sendMail(mailOptions);
      return info;
    } catch (error) {
      console.log(`❌ Attempt ${attempt} failed for ${mailOptions.to}: ${error.message}`);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Exponential backoff
      const delayTime = config.delays.retryDelay * Math.pow(2, attempt - 1);
      console.log(`⏳ Waiting ${delayTime}ms before retry...`);
      await delay(delayTime);
    }
  }
};

// Main process: send email and append to Sent
async function sendAndSaveAll() {
  // Validate email addresses first
  const validEmails = validateEmails(recipients);
  
  if (validEmails.length === 0) {
    console.log('❌ No valid email addresses found.');
    return;
  }

  console.log(`📧 Starting to send personal business emails to ${validEmails.length} recipients...`);
  
  // Verify SMTP connection
  try {
    await transporter.verify();
    console.log('✅ SMTP connection verified');
  } catch (error) {
    console.error('❌ SMTP connection failed:', error.message);
    return;
  }

  // Connect IMAP once
  const connection = await imaps.connect(config.imap);
  
  try {
    const boxes = await connection.getBoxes();
    const sentBox = findSentMailbox(boxes);
    console.log(`📁 Using sent folder: ${sentBox}`);

    let successCount = 0;
    let failureCount = 0;

    for (let i = 0; i < validEmails.length; i++) {
      const to = validEmails[i];
      
      try {
        console.log(`\n📤 Sending personal business email ${i + 1}/${validEmails.length} to: ${to}`);
        
        const mailOptions = buildMailOptions(to);

        // 1) Send via SMTP with retry logic
        const info = await sendEmailWithRetry(mailOptions);
        console.log(`✅ Email sent successfully to ${to}`);
        console.log(`   Message ID: ${info.messageId}`);
        console.log(`   Response: ${info.response}`);
        successCount++;

        // 2) Build raw MIME using MailComposer
        const mailComposer = new MailComposer(mailOptions);
        const raw = await new Promise((resolve, reject) => {
          mailComposer.compile().build((err, message) => {
            if (err) return reject(err);
            resolve(message);
          });
        });

        // 3) Append raw message to Sent folder
        await connection.append(raw, { mailbox: sentBox, flags: ["\\Seen"] });
        console.log(`📥 Saved to sent folder: ${sentBox}`);

        // Very conservative rate limiting: wait between emails
        if (i < validEmails.length - 1) {
          console.log(`⏳ Waiting ${config.delays.betweenEmails}ms before next email...`);
          await delay(config.delays.betweenEmails);
        }

      } catch (err) {
        console.error(`❌ Failed to process email for ${to}:`, err.message);
        failureCount++;
        
        // Continue with next email after a longer delay
        if (i < validEmails.length - 1) {
          await delay(config.delays.betweenEmails * 2);
        }
      }
    }

    console.log(`\n📊 Email sending completed:`);
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ❌ Failed: ${failureCount}`);
    console.log(`   📈 Success Rate: ${((successCount / validEmails.length) * 100).toFixed(1)}%`);

  } finally {
    connection.end();
    transporter.close();
    console.log('\n🔒 Connections closed.');
  }
}

// Enhanced error handling and logging
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

console.log('🚀 Starting Personal Business Email Outreach...');
console.log('📧 Ultra-clean personal email approach:');
console.log('   ✓ Minimal headers (no marketing indicators)');
console.log('   ✓ Personal, conversational tone');
console.log('   ✓ Simple HTML structure');
console.log('   ✓ Very slow sending rate (30 seconds between emails)');
console.log('   ✓ No bulk mail or list management headers');
console.log('   ✓ Appears as genuine business inquiry');

sendAndSaveAll().catch((err) => {
  console.error("💥 Fatal error:", err.message || err);
  process.exit(1);
});