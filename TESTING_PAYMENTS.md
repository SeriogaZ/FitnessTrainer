# Testing Payments on Localhost

## Yes, you can test payments on localhost! 🎉

Stripe works perfectly on localhost for testing. You don't need HTTPS or a production server.

## Quick Start

1. **The code is already set up with a test key** - you can start testing immediately!

2. **Start your server:**
   ```bash
   cd server
   npm run dev
   ```

3. **Open your browser:**
   - Go to `http://localhost:5000`
   - Complete a booking
   - Go to the payment section

## Test Cards

Use these Stripe test cards (they work in test mode only):

### ✅ Success Cards:
- **Card Number:** `4242 4242 4242 4242`
- **Expiry:** Any future date (e.g., `12/25`)
- **CVC:** Any 3 digits (e.g., `123`)
- **ZIP:** Any 5 digits (e.g., `12345`)

### ❌ Decline Cards (to test errors):
- **Card Number:** `4000 0000 0000 0002` (Card declined)
- **Card Number:** `4000 0000 0000 9995` (Insufficient funds)
- **Expiry:** Any future date
- **CVC:** Any 3 digits

### 🔐 3D Secure Test:
- **Card Number:** `4000 0025 0000 3155` (Requires authentication)
- **Expiry:** Any future date
- **CVC:** Any 3 digits

## Current Payment Flow

**Note:** The current implementation simulates payment success for testing purposes. The payment UI will work, but no actual charge is made.

### What Works Now:
- ✅ Payment form displays correctly
- ✅ Card input validation
- ✅ Error messages
- ✅ Success messages
- ✅ Booking creation after "payment"

### For Full Payment Processing:

To actually process payments (even in test mode), you'll need to:

1. **Set up a backend payment endpoint** (see `PAYMENT_SETUP.md`)
2. **Use your own Stripe test keys** from your Stripe dashboard
3. **Create payment intents** on the server

## Using Your Own Stripe Test Keys

1. **Sign up for Stripe** (free): https://stripe.com
2. **Get your test keys:**
   - Go to Developers → API keys
   - Copy your **Test Publishable Key** (starts with `pk_test_`)
3. **Update the code:**
   - Open `js/payment.js`
   - Find line 15: `const stripeKey = 'pk_test_...';`
   - Replace with your test key
   - Or set it via environment variable: `window.STRIPE_PUBLISHABLE_KEY = 'your_test_key';`

## Testing Apple Pay / Google Pay

- **Apple Pay:** Only works on Safari (Mac/iOS) with a real Apple device
- **Google Pay:** Works in Chrome on desktop and mobile
- Both require proper Stripe configuration and may not work fully in test mode on localhost

## What Happens in Test Mode?

- ✅ All payment forms work
- ✅ Card validation works
- ✅ No real money is charged
- ✅ You can see transactions in your Stripe Dashboard (test mode)
- ✅ Test cards work immediately

## Troubleshooting

**"Card payment not available" error:**
- Make sure Stripe.js is loaded (check browser console)
- Check that your Stripe key starts with `pk_test_` or `pk_live_`

**Payment form not showing:**
- Check browser console for errors
- Make sure you're on the payment section after completing booking form

**Test cards not working:**
- Make sure you're using test mode keys (`pk_test_...`)
- Check that the card number is exactly `4242 4242 4242 4242`
- Try a different expiry date (must be in the future)

## Next Steps

Once you're ready for production:
1. Get your **live** Stripe keys
2. Set up backend payment processing
3. Update keys to production keys
4. Test thoroughly before going live!

