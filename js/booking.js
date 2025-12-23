// Simple Fitness Booking System
// Easy to use, reliable booking interface

document.addEventListener('DOMContentLoaded', function() {
  // Get DOM elements
  const calendarDays = document.getElementById('calendar-days');
  const monthYear = document.getElementById('month-year');
  const prevMonthBtn = document.getElementById('prev-month');
  const nextMonthBtn = document.getElementById('next-month');
  const availableSlots = document.getElementById('available-slots');
  const selectDatePrompt = document.querySelector('.select-date-prompt');
  const selectedDatetime = document.getElementById('selected-datetime');
  const bookingForm = document.getElementById('session-form');
  const bookingMessage = document.getElementById('booking-message');

  // State
  let currentMonth = new Date().getMonth();
  let currentYear = new Date().getFullYear();
  let selectedDate = null;
  let selectedTime = null;

  // Initialize
  init();

  function init() {
    if (!calendarDays || !monthYear) {
      console.error('Calendar elements not found');
      return;
    }

    updateStepIndicator(1);
    generateCalendar();
    setupEventListeners();
  }

  function setupEventListeners() {
    if (prevMonthBtn) {
      prevMonthBtn.onclick = () => {
        currentMonth--;
        if (currentMonth < 0) {
          currentMonth = 11;
          currentYear--;
        }
        generateCalendar();
        clearSelection();
      };
    }

    if (nextMonthBtn) {
      nextMonthBtn.onclick = () => {
        currentMonth++;
        if (currentMonth > 11) {
          currentMonth = 0;
          currentYear++;
        }
        generateCalendar();
        clearSelection();
      };
    }

    if (bookingForm) {
      bookingForm.onsubmit = handleSubmit;
    }
  }

  function generateCalendar() {
    if (!calendarDays || !monthYear) return;

    calendarDays.innerHTML = '';

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                        'July', 'August', 'September', 'October', 'November', 'December'];
    monthYear.textContent = `${monthNames[currentMonth]} ${currentYear}`;

    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      const empty = document.createElement('div');
      empty.className = 'day empty';
      calendarDays.appendChild(empty);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayEl = document.createElement('div');
      dayEl.className = 'day';
      dayEl.textContent = day;

      const date = new Date(currentYear, currentMonth, day);
      date.setHours(0, 0, 0, 0);

      // Check if past
      if (date < today) {
        dayEl.className += ' disabled';
      } else {
        // Make clickable
        dayEl.className += ' selectable';
        dayEl.onclick = () => selectDate(day);
      }

      // Highlight today
      if (date.getTime() === today.getTime()) {
        dayEl.className += ' today';
      }

      calendarDays.appendChild(dayEl);
    }
  }

  function selectDate(day) {
    // Clear previous selection
    document.querySelectorAll('.day.selected').forEach(el => {
      el.classList.remove('selected');
    });

    // Find and select clicked day
    const days = document.querySelectorAll('.day.selectable');
    const clicked = Array.from(days).find(el => parseInt(el.textContent) === day);
    
    if (clicked) {
      clicked.classList.add('selected');
      selectedDate = new Date(currentYear, currentMonth, day);
      selectedTime = null;
      showTimeSlots();
      updateSelectedDisplay();
      updateStepIndicator(1);
    }
  }

  function showTimeSlots() {
    if (!availableSlots) return;

    availableSlots.innerHTML = '';
    if (selectDatePrompt) {
      selectDatePrompt.style.display = 'none';
    }

    // Generate time slots (8 AM to 7 PM)
    const hours = [];
    for (let h = 8; h < 19; h++) {
      hours.push(h);
    }

    hours.forEach(hour => {
      const slot = document.createElement('div');
      slot.className = 'time-slot';
      slot.textContent = formatTime(hour + ':00');
      slot.onclick = () => selectTime(hour + ':00', slot);
      availableSlots.appendChild(slot);
    });
  }

  function selectTime(time, element) {
    // Clear previous selection
    document.querySelectorAll('.time-slot.selected').forEach(el => {
      el.classList.remove('selected');
    });

    element.classList.add('selected');
    selectedTime = time;
    updateSelectedDisplay();
    updateStepIndicator(2);
  }
  
  function updateStepIndicator(step) {
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

  function updateSelectedDisplay() {
    if (!selectedDatetime) return;

    if (selectedDate && selectedTime) {
      const dateStr = selectedDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      const timeStr = formatTime(selectedTime);
      selectedDatetime.textContent = `Selected: ${dateStr} at ${timeStr}`;
    } else {
      selectedDatetime.textContent = 'No date and time selected';
    }
  }

  function clearSelection() {
    selectedDate = null;
    selectedTime = null;
    if (availableSlots) availableSlots.innerHTML = '';
    if (selectDatePrompt) selectDatePrompt.style.display = 'block';
    if (selectedDatetime) selectedDatetime.textContent = 'No date and time selected';
  }

  async function handleSubmit(e) {
    e.preventDefault();

    // Validate
    if (!selectedDate || !selectedTime) {
      showMessage('Please select a date and time first.', 'error');
      return;
    }

    const name = document.getElementById('name')?.value.trim();
    const email = document.getElementById('email')?.value.trim();
    const phone = document.getElementById('phone')?.value.trim();

    if (!name || !email || !phone) {
      showMessage('Please fill in all required fields.', 'error');
      return;
    }

    // Create booking
    const booking = {
      name,
      email,
      phone,
      notes: document.getElementById('notes')?.value.trim() || '',
      date: formatDateString(selectedDate),
      time: selectedTime
    };

    // Submit booking
    const button = bookingForm.querySelector('button[type="submit"]');
    const btnText = button?.querySelector('.btn-text');
    const originalText = btnText ? btnText.textContent : (button?.textContent || 'Confirm Booking');
    
    if (button) {
      button.disabled = true;
      if (btnText) {
        btnText.textContent = 'Booking...';
      } else {
        button.textContent = 'Booking...';
      }
    }

    // Store booking data and show payment section
    updateStepIndicator(3);
    
    // Show payment section instead of submitting directly
    if (typeof window.showPaymentSection === 'function') {
      window.showPaymentSection(booking);
    } else {
      // Fallback if payment system not loaded yet
      setTimeout(() => {
        if (typeof window.showPaymentSection === 'function') {
          window.showPaymentSection(booking);
        } else {
          showMessage('Loading payment options...', 'success');
          // Try again after a short delay
          setTimeout(() => {
            if (typeof window.showPaymentSection === 'function') {
              window.showPaymentSection(booking);
            } else {
              // Ultimate fallback - submit without payment
              submitBookingWithoutPayment(booking);
            }
          }, 1000);
        }
      }, 100);
    }
    
    // Re-enable button
    if (button) {
      button.disabled = false;
      if (btnText) {
        btnText.textContent = originalText;
      } else {
        button.textContent = originalText;
      }
    }
  }
  
  async function submitBookingWithoutPayment(booking) {
    try {
      if (typeof API !== 'undefined' && API.Booking) {
        const result = await API.Booking.createBooking(booking);
        if (result.success) {
          showMessage('✅ Booking confirmed! You will receive a confirmation email.', 'success');
          setTimeout(() => resetForm(), 2000);
        } else {
          showMessage(result.message || 'Booking failed. Please try again.', 'error');
        }
      } else {
        showMessage('✅ Booking request received! We will contact you to confirm.', 'success');
        console.log('Booking data:', booking);
        setTimeout(() => resetForm(), 2000);
      }
    } catch (error) {
      console.error('Booking error:', error);
      showMessage('An error occurred. Please try again or contact us directly.', 'error');
    }
  }

  function showMessage(text, type) {
    if (!bookingMessage) return;

    bookingMessage.textContent = text;
    bookingMessage.className = `mt-3 ${type === 'success' ? 'text-success' : 'text-danger'}`;
    bookingMessage.style.display = 'block';

    if (type === 'success') {
      setTimeout(() => {
        bookingMessage.style.display = 'none';
      }, 5000);
    }
  }

  function resetForm() {
    if (bookingForm) bookingForm.reset();
    clearSelection();
    generateCalendar();
    updateStepIndicator(1);
  }

  function updateStepIndicator(step) {
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

  function formatTime(time) {
    const [hours] = time.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:00 ${ampm}`;
  }

  function formatDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
});
