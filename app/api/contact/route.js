import { NextResponse } from 'next/server';
import { rateLimit, handleError, createResponse } from '@/lib/api-security';
import { supabaseAdmin } from '@/lib/supabase';

const supabase = supabaseAdmin;

export async function POST(request) {
  try {
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown';
    if (!rateLimit(`contact-post-${clientIP}`, 3, 300000)) { // 3 submissions per 5 minutes
      return NextResponse.json({ error: 'Too many contact submissions. Please try again later.' }, { status: 429 });
    }

    const body = await request.json();
    const { name, email, phone, company, subject, message, source = 'website' } = body;

    // Basic validation
    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Name, email, and message are required' }, { status: 400 });
    }

    // Email validation
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    // Get request metadata
    const userAgent = request.headers.get('user-agent') || '';
    const referrer = request.headers.get('referer') || '';

    // Save to database
    const { data: submission, error: dbError } = await supabase
      .from('contact_submissions')
      .insert([{
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone?.trim() || null,
        company: company?.trim() || null,
        subject: subject?.trim() || null,
        message: message.trim(),
        source,
        status: 'new',
        ip_address: clientIP,
        user_agent: userAgent,
        referrer,
        email_sent: false
      }])
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return handleError(dbError, 'Failed to save contact submission');
    }

    // Send email notification
    try {
      await sendEmailNotification(submission);
      
      // Update submission to mark email as sent
      await supabase
        .from('contact_submissions')
        .update({ 
          email_sent: true, 
          email_sent_at: new Date().toISOString() 
        })
        .eq('id', submission.id);

    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Don't fail the request if email fails - submission is still saved
    }

    return createResponse({
      message: 'Thank you for your message! We will get back to you soon.',
      id: submission.id
    }, 201);

  } catch (error) {
    console.error('Contact form error:', error);
    return handleError(error, 'Failed to process contact submission');
  }
}

async function sendEmailNotification(submission) {
  // Get email template
  const { data: template } = await supabase
    .from('email_templates')
    .select('subject, html_content, text_content')
    .eq('name', 'contact_notification')
    .eq('is_active', true)
    .single();

  if (!template) {
    console.warn('No email template found for contact_notification');
    return;
  }

  // Replace template variables
  const variables = {
    name: submission.name,
    email: submission.email,
    phone: submission.phone || 'Not provided',
    company: submission.company || 'Not provided',
    subject: submission.subject || 'No subject',
    message: submission.message,
    created_at: new Date(submission.created_at).toLocaleString()
  };

  let htmlContent = template.html_content;
  let textContent = template.text_content;
  let subject = template.subject;

  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`;
    htmlContent = htmlContent?.replace(new RegExp(placeholder, 'g'), value);
    textContent = textContent?.replace(new RegExp(placeholder, 'g'), value);
    subject = subject?.replace(new RegExp(placeholder, 'g'), value);
  });

  // For now, we'll use a simple email service
  // In production, you should use a service like Resend, SendGrid, or AWS SES
  const emailData = {
    to: 'adonsstudio3@gmail.com',
    from: 'noreply@adons-studio.com', // Replace with your domain
    subject,
    html: htmlContent,
    text: textContent,
    reply_to: submission.email
  };

  // Send email using Resend API
  if (process.env.RESEND_API_KEY) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Use Resend's test domain until adons.studio is verified
          from: 'ADONS Contact Form <onboarding@resend.dev>',
          to: [emailData.to],
          reply_to: submission.email,
          subject: emailData.subject,
          html: emailData.html,
          text: emailData.text,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Resend API error: ${JSON.stringify(error)}`);
      }

      const result = await response.json();
      console.log('✅ Email sent successfully via Resend:', result.id);
    } catch (error) {
      console.error('❌ Failed to send email:', error);
      throw error;
    }
  } else {
    console.warn('⚠️ RESEND_API_KEY not configured - email not sent');
    console.log('📧 Email would be sent:', {
      to: emailData.to,
      subject: emailData.subject,
      from: submission.email
    });
  }
}

// GET endpoint to fetch contact submissions (admin only)
export async function GET(request) {
  try {
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown';
    if (!rateLimit(`contact-get-${clientIP}`, 30, 60000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const limit = Math.min(parseInt(url.searchParams.get('limit')) || 50, 100);
    const offset = parseInt(url.searchParams.get('offset')) || 0;

    let query = supabase
      .from('contact_submissions')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      return handleError(error, 'Failed to fetch contact submissions');
    }

    return createResponse({ 
      submissions: data,
      total: data.length,
      offset,
      limit
    });

  } catch (error) {
    return handleError(error, 'Failed to fetch contact submissions');
  }
}