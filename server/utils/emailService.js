const nodemailer = require('nodemailer');
require('dotenv').config();

// Create reusable transporter
let transporter = null;

function initializeEmailService() {
  const emailService = process.env.EMAIL_SERVICE || 'gmail';
  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_PASSWORD;
  const trainerEmail = process.env.TRAINER_EMAIL || emailUser;

  if (!emailUser || !emailPassword) {
    console.warn('⚠️  Email service not configured. Email notifications will be disabled.');
    console.warn('   Set EMAIL_USER, EMAIL_PASSWORD, and TRAINER_EMAIL in .env file');
    return null;
  }

  // Create transporter based on service
  if (emailService === 'gmail') {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPassword // Use App Password for Gmail
      }
    });
  } else if (emailService === 'smtp') {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: emailUser,
        pass: emailPassword
      }
    });
  } else {
    console.warn(`Unknown email service: ${emailService}`);
    return null;
  }

  console.log(`✅ Email service initialized (${emailService})`);
  console.log(`   Notifications will be sent to: ${trainerEmail}`);
  return transporter;
}

// Initialize on module load
transporter = initializeEmailService();

/**
 * Send booking notification email to trainer
 */
async function sendBookingNotification(booking) {
  if (!transporter) {
    console.warn('Email service not available. Skipping notification.');
    return false;
  }

  const trainerEmail = process.env.TRAINER_EMAIL || process.env.EMAIL_USER;
  if (!trainerEmail) {
    console.warn('TRAINER_EMAIL not set. Skipping notification.');
    return false;
  }

  // Format date and time
  const bookingDate = new Date(booking.date + 'T12:00:00');
  const formattedDate = bookingDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Format time
  const [hours, minutes] = booking.time.split(':');
  const hour12 = parseInt(hours) % 12 || 12;
  const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM';
  const formattedTime = `${hour12}:${minutes} ${ampm}`;

  const mailOptions = {
    from: `"Fitness Booking System" <${process.env.EMAIL_USER}>`,
    to: trainerEmail,
    subject: `New Booking: ${booking.name} - ${formattedDate} at ${formattedTime}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f8bc1a; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
          .booking-details { background-color: white; padding: 20px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #f8bc1a; }
          .detail-row { margin: 10px 0; }
          .label { font-weight: bold; color: #666; }
          .value { color: #333; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>🎯 New Booking Confirmed!</h2>
          </div>
          <div class="content">
            <p>You have a new booking:</p>
            <div class="booking-details">
              <div class="detail-row">
                <span class="label">Client Name:</span>
                <span class="value">${booking.name}</span>
              </div>
              <div class="detail-row">
                <span class="label">Email:</span>
                <span class="value">${booking.email}</span>
              </div>
              <div class="detail-row">
                <span class="label">Phone:</span>
                <span class="value">${booking.phone}</span>
              </div>
              <div class="detail-row">
                <span class="label">Date:</span>
                <span class="value">${formattedDate}</span>
              </div>
              <div class="detail-row">
                <span class="label">Time:</span>
                <span class="value">${formattedTime}</span>
              </div>
              ${booking.notes ? `
              <div class="detail-row">
                <span class="label">Notes:</span>
                <span class="value">${booking.notes}</span>
              </div>
              ` : ''}
              <div class="detail-row">
                <span class="label">Payment Status:</span>
                <span class="value">✅ Paid (€50.00)</span>
              </div>
            </div>
            <p>Please confirm this booking in your calendar.</p>
          </div>
          <div class="footer">
            <p>This is an automated notification from your Fitness Booking System.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
New Booking Confirmed!

Client: ${booking.name}
Email: ${booking.email}
Phone: ${booking.phone}
Date: ${formattedDate}
Time: ${formattedTime}
${booking.notes ? `Notes: ${booking.notes}` : ''}

Payment Status: Paid (€50.00)

Please confirm this booking in your calendar.
    `.trim()
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Booking notification email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Error sending booking notification email:', error);
    return false;
  }
}

module.exports = {
  sendBookingNotification,
  transporter
};


