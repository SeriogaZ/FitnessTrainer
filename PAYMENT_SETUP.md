# Payment System Setup Guide

## Overview
The booking system now includes integrated payment processing with support for:
- **Credit/Debit Cards** (via Stripe)
- **Apple Pay** (via Stripe)
- **Google Pay / Samsung Pay** (via Stripe)
- **PayPal**

## Important: You Don't Need to Share Your Card Info
The payment system uses payment gateways (Stripe and PayPal) that handle all transactions securely. You'll receive payments directly to your business account - no card information needs to be shared with me.

## Setup Instructions

### 1. Stripe Setup (for Credit Cards, Apple Pay, Google Pay)

1. **Create a Stripe Account**
   - Go to https://stripe.com
   - Sign up for a free account
   - Complete business verification

2. **Get Your API Keys**
   - Go to Developers → API keys
   - Copy your **Publishable Key** (starts with `pk_`)
   - Copy your **Secret Key** (starts with `sk_`) - keep this secret!

3. **Update the Code**
   - Open `js/payment.js`
   - Find line 14: `const stripeKey = 'pk_test_51...';`
   - Replace with your actual Stripe Publishable Key
   - Example: `const stripeKey = 'pk_live_51AbCdEf...';`

4. **Backend Setup (Required for Production)**
   - You'll need to create a payment intent endpoint on your server
   - Stripe requires server-side processing for security
   - See Stripe documentation for creating payment intents

### 2. PayPal Setup

1. **Create a PayPal Business Account**
   - Go to https://www.paypal.com/business
   - Sign up for a business account
   - Complete business verification

2. **Get Your Client ID**
   - Go to PayPal Developer Dashboard
   - Create a new app
   - Copy your **Client ID**

3. **Update the Code**
   - Open `index.html`
   - Find the PayPal script tag (around line 400)
   - Replace `YOUR_PAYPAL_CLIENT_ID` with your actual Client ID
   - Example: `client-id=AbCdEf123456...`

### 3. Backend Payment Processing

You'll need to add payment processing endpoints to your server:

**Stripe Payment Intent Endpoint:**
```javascript
// In server/routes/paymentRoutes.js
router.post('/create-payment-intent', async (req, res) => {
  const { amount, currency } = req.body;
  
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100, // Convert to cents
    currency: currency || 'eur',
  });
  
  res.json({ clientSecret: paymentIntent.client_secret });
});
```

**PayPal Order Capture:**
PayPal handles this automatically through their SDK, but you may want to verify payments on your server.

### 4. Testing

**Stripe Test Mode:**
- Use test card: `4242 4242 4242 4242`
- Any future expiry date
- Any 3-digit CVC
- Test mode keys start with `pk_test_`

**PayPal Sandbox:**
- Use PayPal sandbox accounts for testing
- Create test accounts in PayPal Developer Dashboard

## Payment Flow

1. Customer fills booking form
2. Clicks "Continue to Payment"
3. Payment section appears with all options
4. Customer chooses payment method:
   - **Apple Pay/Google Pay**: One-click payment
   - **PayPal**: Redirects to PayPal
   - **Credit Card**: Enters card details
5. Payment processed securely
6. Booking confirmed after successful payment

## Security Notes

- Never commit API keys to version control
- Use environment variables for sensitive keys
- Always use HTTPS in production
- Stripe handles PCI compliance automatically
- PayPal handles security for their payments

## Pricing

The current system is set to €50.00 per session. To change:
- Update `js/payment.js` - search for `50.00`
- Update `index.html` - search for `€50.00`

## Support

For payment issues:
- Stripe: https://support.stripe.com
- PayPal: https://www.paypal.com/support

