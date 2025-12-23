# Email Notification Setup

## Overview
The booking system will send you an email notification every time a client makes a booking and completes payment.

## Setup Options

### Option 1: Gmail (Easiest - Recommended)

#### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account: https://myaccount.google.com
2. Go to **Security**
3. Enable **2-Step Verification** if not already enabled

#### Step 2: Create an App Password
1. Go to: https://myaccount.google.com/apppasswords
2. Select **"Mail"** and **"Other (Custom name)"**
3. Enter name: `Fitness Booking System`
4. Click **"Generate"**
5. **Copy the 16-character password** (you'll need this!)

#### Step 3: Update Your .env File
Open `server/.env` and add:

```env
# Email Configuration (Gmail)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-character-app-password
TRAINER_EMAIL=your-email@gmail.com
```

**Important:**
- `EMAIL_USER`: Your Gmail address
- `EMAIL_PASSWORD`: The 16-character app password (not your regular password!)
- `TRAINER_EMAIL`: The email where you want to receive notifications (usually same as EMAIL_USER)

#### Step 4: Restart Your Server
```powershell
cd server
npm install  # Install nodemailer if not already installed
npm run dev
```

---

### Option 2: Custom SMTP (Other Email Providers)

If you use a different email provider (Outlook, Yahoo, custom domain, etc.):

#### Update Your .env File
```env
# Email Configuration (SMTP)
EMAIL_SERVICE=smtp
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_SECURE=false
EMAIL_USER=your-email@yourdomain.com
EMAIL_PASSWORD=your-email-password
TRAINER_EMAIL=your-email@yourdomain.com
```

**Common SMTP Settings:**

**Outlook/Hotmail:**
```
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
```

**Yahoo:**
```
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_SECURE=false
```

**Custom Domain (cPanel, etc.):**
- Check with your hosting provider for SMTP settings
- Usually: `mail.yourdomain.com` on port 587

---

### Option 3: Email Service Providers (Production)

For production, consider using:
- **SendGrid** (free tier: 100 emails/day)
- **Mailgun** (free tier: 5,000 emails/month)
- **AWS SES** (very cheap)
- **Resend** (modern, developer-friendly)

These require API keys instead of passwords. Contact me if you want to set up one of these.

---

## Testing

1. Make a test booking through your website
2. Complete the payment
3. Check your email inbox (and spam folder)
4. You should receive a nicely formatted email with booking details

---

## Troubleshooting

### "Email service not configured" warning
- Check your `.env` file has all required variables
- Make sure there are no extra spaces or quotes
- Restart your server after updating `.env`

### "Authentication failed" error
- **Gmail:** Make sure you're using an App Password, not your regular password
- **Other:** Verify your email and password are correct
- Check if your email provider requires special settings

### Emails going to spam
- This is normal for automated emails
- Check your spam/junk folder
- Consider using a professional email service for production

### Not receiving emails
- Check server console for error messages
- Verify `TRAINER_EMAIL` is correct
- Test with a different email address
- Check spam folder

---

## Email Format

You'll receive emails with:
- Client name and contact information
- Booking date and time (formatted nicely)
- Payment confirmation
- Any notes from the client
- Professional HTML formatting

---

## Security Notes

- Never commit your `.env` file to version control
- App passwords are safer than regular passwords
- For production, consider using environment variables on your hosting platform

---

## Need Help?

- Gmail App Passwords: https://support.google.com/accounts/answer/185833
- Nodemailer Documentation: https://nodemailer.com/about/
- Check server console for detailed error messages


