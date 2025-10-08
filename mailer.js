import nodemailer from "nodemailer";
import imaps from "imap-simple";
import fs from "fs";
import path from "path";
import { MailComposer } from "mailcomposer";

// Recipient list
const recipients = [
"chintanrabadiya123@gmail.com",
];

const pdfPath = path.resolve("./Codegrin-Portfolio.pdf");

// Create transporter
const transporter = nodemailer.createTransport({
host: "smtp.hostinger.com",
  port: 465,
  secure: true,
  pool: true,           // use pool to avoid bursts
  maxConnections: 3,
  auth: {
    user: "info@codegrin.com",
    pass: "YourFault@2025",
  },
});

// IMAP config for Hostinger
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

// Helper: find a likely sent folder name (search recursively)
function findSentMailbox(boxes) {
  const candidates = ["sent", "sent items", "sent-mail", "sent items", "sent items", "sent-mail", "sentitems", "sentitems"];
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

// Build mail options (you can switch to html if needed)
const buildSafeEmail = (to) => {
  return {
    from: 'info@codegrin.com',
    to: to,
    subject: "Proposal for Development Partnership – Codegrin Technologies",
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
    - Senior Developer: INR 70,000 per month
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
                            <td>70,000</td>
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
        ],
  };
};


// Main process: send email and append to Sent
async function sendAndSaveAll() {
  // connect IMAP once
  const connection = await imaps.connect(imapConfig);
  try {
    const boxes = await connection.getBoxes();
    const sentBox = findSentMailbox(boxes);

    for (const to of recipients) {
      try {
        const mailOptions = buildMailOptions(to);

        // 1) Send via SMTP
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Sent to ${to}: ${info.messageId}`);

        // 2) Build raw MIME using MailComposer (preserves attachments & html)
        const mailComposer = new MailComposer(mailOptions);
        const raw = await new Promise((resolve, reject) => {
          mailComposer.compile().build((err, message) => {
            if (err) return reject(err);
            resolve(message);
          });
        });

        // 3) Append raw message to Sent folder
        await connection.append(raw, { mailbox: sentBox, flags: ["\\Seen"] });
        console.log(`📥 Appended to Sent folder (${sentBox}) for ${to}`);
      } catch (err) {
        console.error(`❌ Error for ${to}:`, err.message || err);
      }
    }
  } finally {
    connection.end();
  }
}

sendAndSaveAll().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
