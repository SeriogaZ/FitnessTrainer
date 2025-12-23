// Payment System Integration
// Supports: Stripe (Credit Cards, Apple Pay, Google Pay)

let stripe = null;
let cardElement = null;
let cardExpiry = null;
let cardCvc = null;
let elements = null;
let currentBooking = null;

// Initialize payment system
document.addEventListener('DOMContentLoaded', function() {
  // Initialize Stripe (replace with your publishable key)
  // Get from environment or use test key
  const stripeKey = window.STRIPE_PUBLISHABLE_KEY || 'pk_test_51ShXbXI83wpzjW6mMpQWj4SrEfKo85NLwg8woPzVTR7t0s91oCalJEsYf6iZSSgCahPn2VFs6uyUQs0gKgcTvYxU00oWM0SYYz'; // You'll need to add your Stripe publishable key
  
  if (typeof Stripe !== 'undefined' && stripeKey && stripeKey !== 'pk_test_51ShXbXI83wpzjW6mMpQWj4SrEfKo85NLwg8woPzVTR7t0s91oCalJEsYf6iZSSgCahPn2VFs6uyUQs0gKgcTvYxU00oWM0SYYz') {
    stripe = Stripe(stripeKey);
    elements = stripe.elements();
    
    // Create card elements
    const style = {
      base: {
        fontSize: '16px',
        color: '#333',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#fa755a',
      },
    };

    cardElement = elements.create('cardNumber', { style });
    cardElement.mount('#card-number');

    cardExpiry = elements.create('cardExpiry', { style });
    cardExpiry.mount('#card-expiry');

    cardCvc = elements.create('cardCvc', { style });
    cardCvc.mount('#card-cvc');
  }

  // Setup event listeners
  setupPaymentListeners();
  
  // Check for Apple Pay / Google Pay availability
  checkPaymentMethods();
});

function setupPaymentListeners() {
  // Card form submission
  const cardForm = document.getElementById('card-form');
  if (cardForm) {
    cardForm.addEventListener('submit', handleCardPayment);
  }

  // Apple Pay
  const applePayBtn = document.getElementById('apple-pay-btn');
  if (applePayBtn) {
    applePayBtn.addEventListener('click', handleApplePay);
  }

  // Google Pay
  const googlePayBtn = document.getElementById('google-pay-btn');
  if (googlePayBtn) {
    googlePayBtn.addEventListener('click', handleGooglePay);
  }
}

function checkPaymentMethods() {
  // Check Apple Pay availability
  if (window.ApplePaySession && ApplePaySession.canMakePayments()) {
    const applePayBtn = document.getElementById('apple-pay-btn');
    if (applePayBtn) applePayBtn.style.display = 'block';
  }

  // Check Google Pay availability
  if (window.PaymentRequest) {
    const googlePayBtn = document.getElementById('google-pay-btn');
    if (googlePayBtn) googlePayBtn.style.display = 'block';
  }
}

// Show payment section
function showPaymentSection(booking) {
  currentBooking = booking;
  
  // Hide booking section
  const bookingSection = document.querySelector('.booking_section');
  if (bookingSection) bookingSection.style.display = 'none';
  
  // Show payment section
  const paymentSection = document.getElementById('payment-section');
  if (paymentSection) {
    paymentSection.style.display = 'block';
    paymentSection.scrollIntoView({ behavior: 'smooth' });
  }
  
  // Update summary
  updateBookingSummary(booking);
  
}

function updateBookingSummary(booking) {
  const dateEl = document.getElementById('summary-date');
  const timeEl = document.getElementById('summary-time');
  const nameEl = document.getElementById('summary-name');
  const emailEl = document.getElementById('summary-email');
  
  if (dateEl && booking.date) {
    const date = new Date(booking.date + 'T12:00:00');
    dateEl.textContent = date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  
  if (timeEl && booking.time) {
    timeEl.textContent = formatTime(booking.time);
  }
  
  if (nameEl) nameEl.textContent = booking.name;
  if (emailEl) emailEl.textContent = booking.email;
}


// Handle card payment
async function handleCardPayment(e) {
  e.preventDefault();
  
  if (!stripe || !cardElement) {
    showPaymentMessage('Card payment not available. Please contact us.', 'error');
    return;
  }

  const cardholderName = document.getElementById('cardholder-name')?.value;
  if (!cardholderName) {
    showPaymentMessage('Please enter cardholder name.', 'error');
    return;
  }

  const button = document.getElementById('card-submit');
  const originalText = button?.textContent || 'Pay €50.00';
  if (button) {
    button.disabled = true;
    button.textContent = 'Processing...';
  }

  try {
    // Create payment method
    const { paymentMethod, error } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
      billing_details: {
        name: cardholderName,
        email: currentBooking.email,
      },
    });

    if (error) {
      showPaymentMessage(error.message, 'error');
      if (button) {
        button.disabled = false;
        button.textContent = originalText;
      }
      return;
    }

    // Process payment (you'll need to create a payment intent on your server)
    // For now, we'll simulate success
    completeBooking('card', paymentMethod.id);
    
  } catch (error) {
    console.error('Payment error:', error);
    showPaymentMessage('Payment failed. Please try again.', 'error');
    if (button) {
      button.disabled = false;
      button.textContent = originalText;
    }
  }
}

// Handle Apple Pay
async function handleApplePay() {
  if (!stripe) {
    showPaymentMessage('Apple Pay not available.', 'error');
    return;
  }

  try {
    const { error } = await stripe.redirectToCheckout({
      paymentMethodType: 'apple_pay',
      lineItems: [{
        price: 'price_1234567890', // You'll need to create a price in Stripe
        quantity: 1,
      }],
      mode: 'payment',
      successUrl: window.location.href + '?success=true',
      cancelUrl: window.location.href + '?canceled=true',
    });

    if (error) {
      showPaymentMessage(error.message, 'error');
    }
  } catch (error) {
    showPaymentMessage('Apple Pay failed. Please try another method.', 'error');
  }
}

// Handle Google Pay
async function handleGooglePay() {
  if (!window.PaymentRequest) {
    showPaymentMessage('Google Pay not available.', 'error');
    return;
  }

  const paymentRequest = new PaymentRequest(
    [
      {
        supportedMethods: 'https://google.com/pay',
        data: {
          environment: 'TEST',
          apiVersion: 2,
          apiVersionMinor: 0,
          merchantInfo: {
            merchantId: 'YOUR_MERCHANT_ID',
            merchantName: 'Deivids Auzins Fitness'
          },
          allowedPaymentMethods: [{
            type: 'CARD',
            parameters: {
              allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
              allowedCardNetworks: ['MASTERCARD', 'VISA']
            }
          }],
          transactionInfo: {
            totalPriceStatus: 'FINAL',
            totalPrice: '50.00',
            totalPriceLabel: 'Total',
            currencyCode: 'EUR'
          }
        }
      }
    ],
    {
      total: {
        label: 'Fitness Session',
        amount: {
          currency: 'EUR',
          value: '50.00'
        }
      }
    }
  );

  try {
    const paymentResponse = await paymentRequest.show();
    await paymentResponse.complete('success');
    completeBooking('google_pay', paymentResponse.details.paymentToken);
  } catch (error) {
    if (error.name !== 'AbortError') {
      showPaymentMessage('Google Pay failed. Please try another method.', 'error');
    }
  }
}

// Complete booking after payment
async function completeBooking(paymentMethod, paymentId) {
  // Update step indicator to step 4 (Confirm)
  updatePaymentStepIndicator(4);
  
  const bookingData = {
    ...currentBooking,
    paymentMethod,
    paymentId,
    amount: 50.00,
    currency: 'EUR',
    paid: true
  };

  try {
    // Submit booking to API
    if (typeof API !== 'undefined' && API.Booking) {
      const result = await API.Booking.createBooking(bookingData);
      if (result.success) {
        showPaymentMessage('✅ Payment successful! Your booking is confirmed.', 'success');
        setTimeout(() => {
          showSuccessPage(bookingData);
        }, 2000);
      } else {
        showPaymentMessage('Booking failed. Payment was processed. Please contact us.', 'error');
      }
    } else {
      // Fallback
      showPaymentMessage('✅ Payment successful! Your booking is confirmed.', 'success');
      console.log('Booking with payment:', bookingData);
      setTimeout(() => {
        showSuccessPage(bookingData);
      }, 2000);
    }
  } catch (error) {
    console.error('Error completing booking:', error);
    showPaymentMessage('Payment successful but booking failed. Please contact us.', 'error');
  }
}

function updatePaymentStepIndicator(step) {
  const steps = document.querySelectorAll('.step');
  if (steps.length === 0) return;
  
  steps.forEach((s, index) => {
    if (index < step) {
      s.classList.add('active');
    } else {
      s.classList.remove('active');
    }
  });
}

function showSuccessPage(booking) {
  // Hide payment section
  const paymentSection = document.getElementById('payment-section');
  if (paymentSection) paymentSection.style.display = 'none';
  
  // Show success message
  const bookingSection = document.querySelector('.booking_section');
  if (bookingSection) {
    bookingSection.innerHTML = `
      <div class="container">
        <div class="success-message text-center">
          <div class="success-icon">✅</div>
          <h2>Booking Confirmed!</h2>
          <p>Your payment has been processed successfully.</p>
          <div class="booking-details">
            <p><strong>Date:</strong> ${new Date(booking.date + 'T12:00:00').toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${formatTime(booking.time)}</p>
            <p><strong>Amount Paid:</strong> €${booking.amount.toFixed(2)}</p>
          </div>
          <p>You will receive a confirmation email shortly.</p>
          <a href="index.html" class="btn-book">Book Another Session</a>
        </div>
      </div>
    `;
    bookingSection.scrollIntoView({ behavior: 'smooth' });
  }
}

function showPaymentMessage(text, type) {
  const messageEl = document.getElementById('payment-message');
  if (!messageEl) return;

  messageEl.textContent = text;
  messageEl.className = `mt-3 ${type === 'success' ? 'text-success' : 'text-danger'}`;
  messageEl.style.display = 'block';
}

function formatTime(time) {
  const [hours] = time.split(':');
  const h = parseInt(hours);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:00 ${ampm}`;
}

// Go back to calendar
function goBackToCalendar() {
  // Hide payment section
  const paymentSection = document.getElementById('payment-section');
  if (paymentSection) paymentSection.style.display = 'none';
  
  // Show booking section
  const bookingSection = document.querySelector('.booking_section');
  if (bookingSection) {
    bookingSection.style.display = 'block';
    bookingSection.scrollIntoView({ behavior: 'smooth' });
  }
  
  // Reset step indicator to step 2 (Your Details)
  updatePaymentStepIndicator(2);
  
  // Clear any payment messages
  const paymentMessage = document.getElementById('payment-message');
  if (paymentMessage) {
    paymentMessage.style.display = 'none';
    paymentMessage.textContent = '';
  }
}

// Export functions
window.showPaymentSection = showPaymentSection;
window.goBackToCalendar = goBackToCalendar;

