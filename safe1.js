import nodemailer from "nodemailer";
import path from "path";
import imaps from "imap-simple";
import { MailComposer } from "mailcomposer";
import crypto from "crypto";

export const pdfPath = path.resolve("./Codegrin-Portfolio.pdf");

// Enhanced configuration with better headers
const config = {
  smtp: {
    host: "smtp.hostinger.com",
    port: 465,
    secure: true,
    auth: {
      user: "info@codegrin.com",
      pass: "Yourcode@2025",
    },
    // Add connection options for better delivery
    connectionTimeout: 60000,
    greetingTimeout: 30000,
    socketTimeout: 60000,
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
      "INBOX"
    ];

    for (const mailbox of candidates) {
      try {
        await connection.append(raw, { mailbox, flags: ["\\Seen"] });
        console.log(`📥 Appended message to Sent folder: ${mailbox}`);
        return;
      } catch (err) {
        // Continue to next candidate
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
    }
  } finally {
    connection.end();
  }
}

const testRecipients = [
  "test-gokpmu401@srv1.mail-tester.com",
];

const transporter = nodemailer.createTransport(config.smtp);

// Generate a proper Message-ID
function generateMessageId() {
  return `<${crypto.randomUUID()}@codegrin.com>`;
}

// Improved email with better spam score
const buildImprovedEmail = (to) => {
  const messageId = generateMessageId();
  
  return {
    from: {
      name: 'Chintan Rabadiya - Codegrin Technologies',
      address: 'info@codegrin.com'
    },
    to: to,
    replyTo: 'info@codegrin.com',
    
    // Less promotional subject line
    subject: "Development Partnership Inquiry - Codegrin Technologies",
    
    // Add important headers to improve deliverability
    headers: {
      'Message-ID': messageId,
      'Date': new Date().toUTCString(),
      'X-Mailer': 'Codegrin-Mailer-1.0',
      'X-Priority': '3',
      'X-MSMail-Priority': 'Normal',
      'Importance': 'Normal',
      'List-Unsubscribe': '<mailto:info@codegrin.com?subject=UNSUBSCRIBE>',
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
    
    // Improved text version with less promotional language
    text: `Hello,

I hope this message finds you well.

My name is Chintan Rabadiya, CEO of Codegrin Technologies. We are a software development company that specializes in creating custom web and mobile applications for businesses.

I am writing to inquire about potential collaboration opportunities with your organization.

About Our Services:

DEVELOPMENT TEAM AUGMENTATION
We provide experienced developers for long-term partnerships:
- Full-stack web development
- Mobile application development using Flutter
- Flexible team scaling options

CUSTOM SOFTWARE DEVELOPMENT  
We build tailored solutions including:
- Web applications and platforms
- E-commerce solutions
- API development and system integration
- Database architecture and optimization

Our team consists of over 25 experienced developers who have successfully completed more than 100 projects. We focus on transparent communication, regular progress updates, and ongoing support.

For team augmentation, our rates are:
- Mid-level developers: INR 50,000/month
- Senior developers: INR 80,000/month
- Custom project pricing available upon request

I would be happy to discuss how our team might support your development initiatives. Please feel free to respond to this email if you are interested in learning more.

Thank you for your time and consideration.

Best regards,

Chintan Rabadiya
Chief Executive Officer
Codegrin Technologies

Contact Details:
Email: info@codegrin.com
Website: www.codegrin.com
Phone: +91 91062 69972

---
Privacy Notice: We respect your privacy and do not share contact information with third parties.
To unsubscribe: Reply with "UNSUBSCRIBE" in the subject line.
`,
    
    // Cleaner HTML with better structure
    html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Development Partnership Inquiry</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #2c3e50;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #ffffff;
            }
            .container {
                background-color: #ffffff;
                border: 1px solid #e1e8ed;
                border-radius: 8px;
                overflow: hidden;
            }
            .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px 20px;
                text-align: center;
            }
            .header h1 {
                margin: 0;
                font-size: 24px;
                font-weight: 600;
            }
            .content {
                padding: 30px;
            }
            .greeting {
                font-size: 16px;
                margin-bottom: 20px;
            }
            .section {
                margin: 25px 0;
            }
            .section h2 {
                color: #2c3e50;
                font-size: 18px;
                margin-bottom: 15px;
                padding-bottom: 8px;
                border-bottom: 2px solid #3498db;
            }
            .service-grid {
                display: flex;
                gap: 20px;
                margin: 20px 0;
                flex-wrap: wrap;
            }
            .service-card {
                flex: 1;
                min-width: 250px;
                background-color: #f8f9fa;
                padding: 20px;
                border-radius: 6px;
                border-left: 4px solid #3498db;
            }
            .service-card h3 {
                color: #2c3e50;
                margin-top: 0;
                font-size: 16px;
            }
            .service-card ul {
                margin: 10px 0;
                padding-left: 18px;
            }
            .service-card li {
                margin-bottom: 5px;
                font-size: 14px;
            }
            .stats {
                background-color: #ecf0f1;
                padding: 20px;
                border-radius: 6px;
                text-align: center;
                margin: 20px 0;
            }
            .stats-grid {
                display: flex;
                justify-content: space-around;
                flex-wrap: wrap;
                gap: 15px;
            }
            .stat-item {
                text-align: center;
            }
            .stat-number {
                font-size: 28px;
                font-weight: bold;
                color: #3498db;
                display: block;
            }
            .stat-label {
                font-size: 14px;
                color: #7f8c8d;
            }
            .pricing-info {
                background-color: #f8f9fa;
                padding: 20px;
                border-radius: 6px;
                border: 1px solid #dee2e6;
            }
            .pricing-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px 0;
                border-bottom: 1px solid #e9ecef;
            }
            .pricing-item:last-child {
                border-bottom: none;
            }
            .contact-section {
                background-color: #2c3e50;
                color: white;
                padding: 25px;
                border-radius: 6px;
                margin: 25px 0;
            }
            .contact-section h3 {
                margin-top: 0;
                color: #ecf0f1;
            }
            .contact-info {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            .contact-item {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .footer {
                font-size: 12px;
                color: #7f8c8d;
                text-align: center;
                padding: 20px;
                background-color: #f8f9fa;
                border-top: 1px solid #e1e8ed;
            }
            .unsubscribe-link {
                color: #3498db;
                text-decoration: none;
            }
            .unsubscribe-link:hover {
                text-decoration: underline;
            }
            
            @media (max-width: 600px) {
                .service-grid {
                    flex-direction: column;
                }
                .stats-grid {
                    flex-direction: column;
                    gap: 10px;
                }
                .pricing-item {
                    flex-direction: column;
                    text-align: center;
                    gap: 5px;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Partnership Inquiry</h1>
                <p>Codegrin Technologies</p>
            </div>
            
            <div class="content">
                <div class="greeting">
                    <p>Hello,</p>
                    <p>I hope this message finds you well.</p>
                </div>
                
                <p>My name is <strong>Chintan Rabadiya</strong>, CEO of <strong>Codegrin Technologies</strong>. We are a software development company that specializes in creating custom web and mobile applications for businesses.</p>
                
                <p>I am writing to inquire about potential collaboration opportunities with your organization.</p>
                
                <div class="stats">
                    <div class="stats-grid">
                        <div class="stat-item">
                            <span class="stat-number">25+</span>
                            <span class="stat-label">Developers</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-number">100+</span>
                            <span class="stat-label">Projects</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-number">5+</span>
                            <span class="stat-label">Years Experience</span>
                        </div>
                    </div>
                </div>

                <div class="section">
                    <h2>Our Services</h2>
                    <div class="service-grid">
                        <div class="service-card">
                            <h3>Team Augmentation</h3>
                            <ul>
                                <li>Experienced developers for long-term partnerships</li>
                                <li>Full-stack web development</li>
                                <li>Mobile app development (Flutter)</li>
                                <li>Flexible scaling options</li>
                            </ul>
                        </div>
                        <div class="service-card">
                            <h3>Custom Development</h3>
                            <ul>
                                <li>Web applications and platforms</li>
                                <li>E-commerce solutions</li>
                                <li>API development and integration</li>
                                <li>Database architecture</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div class="section">
                    <h2>Investment Information</h2>
                    <div class="pricing-info">
                        <div class="pricing-item">
                            <span>Mid-level Developer</span>
                            <strong>INR 50,000/month</strong>
                        </div>
                        <div class="pricing-item">
                            <span>Senior Developer</span>
                            <strong>INR 80,000/month</strong>
                        </div>
                        <div class="pricing-item">
                            <span>Project-based</span>
                            <strong>Custom pricing</strong>
                        </div>
                    </div>
                </div>

                <p>We focus on transparent communication, regular progress updates, and ongoing support to ensure project success.</p>
                
                <p>I would be happy to discuss how our team might support your development initiatives. Please feel free to respond to this email if you are interested in learning more.</p>
                
                <p>Thank you for your time and consideration.</p>
                
                <div class="contact-section">
                    <h3>Contact Information</h3>
                    <div class="contact-info">
                        <div class="contact-item">
                            <strong>Chintan Rabadiya</strong> - Chief Executive Officer
                        </div>
                        <div class="contact-item">
                            📧 <a href="mailto:info@codegrin.com" style="color: #3498db;">info@codegrin.com</a>
                        </div>
                        <div class="contact-item">
                            🌐 <a href="https://www.codegrin.com" style="color: #3498db;">www.codegrin.com</a>
                        </div>
                        <div class="contact-item">
                            📞 +91 91062 69972
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="footer">
                <p><strong>Privacy Notice:</strong> We respect your privacy and do not share contact information with third parties.</p>
                <p>To unsubscribe: <a href="mailto:info@codegrin.com?subject=UNSUBSCRIBE" class="unsubscribe-link">Click here</a> or reply with "UNSUBSCRIBE".</p>
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

// Add delay between emails to avoid being marked as bulk sender
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function sendImprovedEmail() {
  if (testRecipients.length === 0) {
    console.log('❌ Please add your own email address to test first');
    return;
  }

  try {
    await transporter.verify();
    console.log('✅ SMTP connection verified');
    
    for (let i = 0; i < testRecipients.length; i++) {
      const to = testRecipients[i];
      const mailOptions = buildImprovedEmail(to);
      
      console.log(`📤 Sending email ${i + 1}/${testRecipients.length} to: ${to}`);
      
      const info = await transporter.sendMail(mailOptions);
      await appendToSentFolder(mailOptions);
      
      console.log(`✅ Sent to ${to}: ${info.messageId}`);
      console.log(`📋 Response: ${info.response}`);
      
      // Add delay between emails (2-5 seconds)
      if (i < testRecipients.length - 1) {
        const delayTime = 2000 + Math.random() * 3000;
        console.log(`⏳ Waiting ${Math.round(delayTime/1000)} seconds before next email...`);
        await delay(delayTime);
      }
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code) {
      console.error('❌ Error Code:', error.code);
    }
  } finally {
    transporter.close();
  }
}

// Export for use
export { sendImprovedEmail, buildImprovedEmail };

console.log('🚨 IMPROVED EMAIL SENDER');
console.log('✨ Spam-optimized version with better deliverability');
console.log('📧 Test with your own email first');

// Uncomment to send:
sendImprovedEmail();