-- Insert default email templates (with conflict handling)
INSERT INTO email_templates (name, subject, html_content, text_content, variables, is_active) VALUES

-- Contact notification template
('contact_notification', 
'New Contact Form Submission - {{name}}', 
'<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .field { margin-bottom: 15px; }
        .label { font-weight: bold; color: #555; }
        .value { margin-top: 5px; padding: 10px; background: white; border-left: 4px solid #2563eb; }
        .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>New Contact Form Submission</h1>
        </div>
        <div class="content">
            <div class="field">
                <div class="label">Name:</div>
                <div class="value">{{name}}</div>
            </div>
            <div class="field">
                <div class="label">Email:</div>
                <div class="value">{{email}}</div>
            </div>
            <div class="field">
                <div class="label">Phone:</div>
                <div class="value">{{phone}}</div>
            </div>
            <div class="field">
                <div class="label">Company:</div>
                <div class="value">{{company}}</div>
            </div>
            <div class="field">
                <div class="label">Subject:</div>
                <div class="value">{{subject}}</div>
            </div>
            <div class="field">
                <div class="label">Message:</div>
                <div class="value">{{message}}</div>
            </div>
            <div class="field">
                <div class="label">Submitted:</div>
                <div class="value">{{created_at}}</div>
            </div>
        </div>
        <div class="footer">
            <p>This message was sent from your website contact form.</p>
            <p>Reply directly to this email to respond to {{name}}.</p>
        </div>
    </div>
</body>
</html>', 
'New Contact Form Submission

Name: {{name}}
Email: {{email}}
Phone: {{phone}}
Company: {{company}}
Subject: {{subject}}

Message:
{{message}}

Submitted: {{created_at}}

Reply directly to this email to respond to {{name}}.', 
'["name", "email", "phone", "company", "subject", "message", "created_at"]'::jsonb, 
true),

-- Auto-reply template
('contact_auto_reply', 
'Thank you for contacting Adons Studio - {{name}}', 
'<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Thank You for Contacting Us!</h1>
        </div>
        <div class="content">
            <p>Hi {{name}},</p>
            
            <p>Thank you for reaching out to Adons Studio. We have received your message and will get back to you within 24 hours.</p>
            
            <p><strong>Your message:</strong></p>
            <blockquote style="background: #f9f9f9; padding: 15px; border-left: 4px solid #2563eb; margin: 20px 0;">
                {{message}}
            </blockquote>
            
            <p>If you have any urgent questions, please feel free to call us directly.</p>
            
            <p>Best regards,<br>
            The Adons Studio Team</p>
        </div>
        <div class="footer">
            <p>Adons Studio - Creative Visual Effects & Animation</p>
            <p>This is an automated response. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>', 
'Hi {{name}},

Thank you for reaching out to Adons Studio. We have received your message and will get back to you within 24 hours.

Your message:
{{message}}

If you have any urgent questions, please feel free to call us directly.

Best regards,
The Adons Studio Team

---
Adons Studio - Creative Visual Effects & Animation
This is an automated response. Please do not reply to this email.', 
'["name", "message"]'::jsonb, 
false), -- Disabled by default

-- Welcome email template (for future use)
('welcome_email', 
'Welcome to Adons Studio - {{name}}', 
'<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .cta { text-align: center; margin: 30px 0; }
        .button { background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; }
        .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to Adons Studio!</h1>
        </div>
        <div class="content">
            <p>Hi {{name}},</p>
            
            <p>Welcome to Adons Studio! We''re excited to have you join our community of creative professionals.</p>
            
            <p>At Adons Studio, we specialize in:</p>
            <ul>
                <li>Visual Effects (VFX)</li>
                <li>3D Animation</li>
                <li>Motion Graphics</li>
                <li>Post-Production</li>
            </ul>
            
            <div class="cta">
                <a href="#" class="button">Explore Our Portfolio</a>
            </div>
            
            <p>If you have any questions or need assistance, don''t hesitate to reach out.</p>
            
            <p>Best regards,<br>
            The Adons Studio Team</p>
        </div>
        <div class="footer">
            <p>Adons Studio - Creative Visual Effects & Animation</p>
        </div>
    </div>
</body>
</html>', 
'Hi {{name}},

Welcome to Adons Studio! We''re excited to have you join our community of creative professionals.

At Adons Studio, we specialize in:
- Visual Effects (VFX)
- 3D Animation
- Motion Graphics
- Post-Production

Visit our portfolio: [Portfolio URL]

If you have any questions or need assistance, don''t hesitate to reach out.

Best regards,
The Adons Studio Team

---
Adons Studio - Creative Visual Effects & Animation', 
'["name"]'::jsonb, 
false) -- Disabled by default

ON CONFLICT (name) DO UPDATE SET
  subject = EXCLUDED.subject,
  html_content = EXCLUDED.html_content,
  text_content = EXCLUDED.text_content,
  variables = EXCLUDED.variables,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();