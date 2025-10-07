import nodemailer from "nodemailer";
import validator from "validator";

// Minimal configuration - exactly like manual email
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

// Single recipient for testing
const recipients = [
  "chintanrabadiya123@gmail.com",
];

// Create minimal transporter
const transporter = nodemailer.createTransport(config.smtp);

// Build extremely simple email - like manual sending
const buildSimpleEmail = (to) => {
  return {
    from: 'info@codegrin.com', // Simple from - no display name
    to: to,
    subject: "Software Development Services",
    
    // Simple plain text only
    text: `Hello,

I hope you're doing well.

I'm Chintan from Codegrin Technologies, a software development company in India.

We specialize in web and mobile app development. Our team has 25+ developers and we've completed 100+ projects.

Services we offer:
- Web applications (React, Node.js, PHP)
- Mobile apps (Flutter, React Native)  
- Custom software development
- API development

Our rates:
- Mid-level developer: ₹50,000/month
- Senior developer: ₹70,000/month
- Project-based pricing available

If you have any software development needs, I'd be happy to discuss further.

Best regards,
Chintan Rabadiya
Codegrin Technologies
info@codegrin.com
+91 91062 69972`,

    // Simple HTML version
    html: `<p>Hello,</p>

<p>I hope you're doing well.</p>

<p>I'm Chintan from Codegrin Technologies, a software development company in India.</p>

<p>We specialize in web and mobile app development. Our team has 25+ developers and we've completed 100+ projects.</p>

<p><strong>Services we offer:</strong></p>
<ul>
<li>Web applications (React, Node.js, PHP)</li>
<li>Mobile apps (Flutter, React Native)</li>
<li>Custom software development</li>
<li>API development</li>
</ul>

<p><strong>Our rates:</strong></p>
<ul>
<li>Mid-level developer: ₹50,000/month</li>
<li>Senior developer: ₹70,000/month</li>
<li>Project-based pricing available</li>
</ul>

<p>If you have any software development needs, I'd be happy to discuss further.</p>

<p>Best regards,<br>
Chintan Rabadiya<br>
Codegrin Technologies<br>
info@codegrin.com<br>
+91 91062 69972</p>`
  };
};

// Send simple email
async function sendSimpleEmail() {
  console.log('📧 Sending ultra-simple email...');
  
  try {
    // Verify connection
    await transporter.verify();
    console.log('✅ SMTP connection verified');
    
    const to = recipients[0];
    const mailOptions = buildSimpleEmail(to);
    
    console.log(`📤 Sending to: ${to}`);
    
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully!`);
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   Response: ${info.response}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    transporter.close();
  }
}

console.log('🚀 Starting Ultra-Simple Email...');
console.log('📧 Minimal approach - no extra headers, no attachments, no complexity');

sendSimpleEmail();