import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SUPABASE_AUTH_SMTP_HOST,
  port: parseInt(process.env.SUPABASE_AUTH_SMTP_PORT || '587'),
  auth: {
    user: process.env.SUPABASE_AUTH_SMTP_USER,
    pass: process.env.SUPABASE_AUTH_SMTP_PASS,
  },
})

export async function sendEmail(to: string, subject: string, html: string) {
  const mailOptions = {
    from: `"${process.env.SUPABASE_AUTH_SMTP_SENDER_NAME}" <${process.env.SUPABASE_AUTH_SMTP_USER}>`,
    to,
    subject,
    html,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log('Email sent successfully')
  } catch (error) {
    console.error('Error sending email:', error)
    throw error
  }
}