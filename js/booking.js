// Fitness Booking System - Client Side
// Connects to backend API for booking management

document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const calendarDays = document.getElementById('calendar-days');
  const monthYear = document.getElementById('month-year');
  const prevMonthBtn = document.getElementById('prev-month');
  const nextMonthBtn = document.getElementById('next-month');
  const availableSlots = document.getElementById('available-slots');
  const selectDatePrompt = document.querySelector('.select-date-prompt');
  const selectedDatetime = document.getElementById('selected-datetime');
  const bookingForm = document.getElementById('session-form');
  const bookingMessage = document.getElementById('booking-message');

  // State variables
  let currentDate = new Date();
  let currentMonth = currentDate.getMonth();
  let currentYear = currentDate.getFullYear();
  let selectedDate = null;
  let selectedTimeSlot = null;
  let settings = {
    startHour: 8,
    endHour: 19,
    daysOff: ['0'] // Sunday by default
  };
  
  // Initialize the booking system
  init();
  
  async function init() {
    // Load settings from API
    try {
      const settingsData = await API.Settings.getSettings();
      if (settingsData.success && settingsData.data) {
        settings = {
          startHour: settingsData.data.startHour || 8,
          endHour: settingsData.data.endHour || 19,
          daysOff: settingsData.data.daysOff || ['0']
        };
      }
    } catch (error) {
      console.warn('Could not load settings from API, using defaults:', error);
      // Use default settings - calendar will still work
    }
    
    // Initialize step indicator
    updateStepIndicator(1);
    
    // Initialize calendar (works even without API)
    await generateCalendar(currentMonth, currentYear);
    
    // Event listeners
    if (prevMonthBtn) {
      prevMonthBtn.addEventListener('click', goToPrevMonth);
    }
    if (nextMonthBtn) {
      nextMonthBtn.addEventListener('click', goToNextMonth);
    }
    if (bookingForm) {
      bookingForm.addEventListener('submit', handleBookingSubmit);
    }
  }
  
  // Calendar generation
  async function generateCalendar(month, year) {
    // Clear previous calendar
    calendarDays.innerHTML = '';
    
    // Update month and year display
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'];
    monthYear.textContent = `${monthNames[month]} ${year}`;
    
    // Get first day of month and number of days in month
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Create empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      const emptyDay = document.createElement('div');
      emptyDay.classList.add('day', 'empty');
      calendarDays.appendChild(emptyDay);
    }
    
    // Create cells for each day of the month
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Store day elements for later API checking
    const dayElements = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dayElement = document.createElement('div');
      dayElement.classList.add('day');
      dayElement.textContent = day;
      
      const dateString = formatDate(new Date(year, month, day));
      const checkDate = new Date(year, month, day);
      checkDate.setHours(0, 0, 0, 0);
      
      // Store date info in element
      dayElement.dataset.date = dateString;
      dayElement.dataset.day = day;
      dayElement.dataset.month = month;
      dayElement.dataset.year = year;
      
      // Check if this day is today
      if (checkDate.getTime() === today.getTime()) {
        dayElement.classList.add('today');
      }
      
      // Check if this day is in the past
      if (checkDate < today) {
        dayElement.classList.add('disabled');
      } else {
        // Check if this day is a day off
        const dayOfWeek = checkDate.getDay().toString();
        if (settings.daysOff.includes(dayOfWeek)) {
          dayElement.classList.add('disabled');
        } else {
          // Make clickable by default - we'll check bookings on click
          dayElement.addEventListener('click', function() {
            selectDay(day, month, year);
          });
          dayElements.push({ element: dayElement, dateString: dateString });
        }
      }
      
      calendarDays.appendChild(dayElement);
    }
    
    // Optionally check bookings for visible days (non-blocking)
    // This runs in background and updates the calendar
    checkBookingsForMonth(dayElements);
  }
  
  // Check bookings for multiple days (optimized)
  async function checkBookingsForMonth(dayElements) {
    // Check if API is available
    if (typeof API === 'undefined' || !API.Booking) {
      console.log('API not available, calendar will work in offline mode');
      return;
    }
    
    // Only check a few days at a time to avoid overwhelming the API
    const daysToCheck = dayElements.slice(0, 10); // Check first 10 days
    
    for (const { element, dateString } of daysToCheck) {
      try {
        const bookingsData = await API.Booking.getBookingsByDate(dateString);
        if (bookingsData && bookingsData.success && bookingsData.data) {
          const bookedSlots = Object.keys(bookingsData.data).length;
          const totalSlots = settings.endHour - settings.startHour;
          
          if (bookedSlots >= totalSlots) {
            element.classList.add('booked');
            // Remove click handler if fully booked
            const newElement = element.cloneNode(true);
            element.parentNode.replaceChild(newElement, element);
          }
        }
      } catch (error) {
        // Silently fail - allow booking anyway
        // Calendar will work even if API is down
      }
    }
  }
  
  // Handle day selection
  async function selectDay(day, month, year) {
    // Find the clicked day element
    const dayElement = Array.from(document.querySelectorAll('.day:not(.empty)')).find(el => {
      const elDay = parseInt(el.textContent);
      const elMonth = parseInt(el.dataset.month);
      const elYear = parseInt(el.dataset.year);
      return elDay === day && elMonth === month && elYear === year;
    });
    
    // If element not found by dataset, try by text content
    if (!dayElement) {
      const dayElements = document.querySelectorAll('.day:not(.empty):not(.disabled):not(.booked)');
      const found = Array.from(dayElements).find(el => parseInt(el.textContent) === day);
      if (found) {
        found.classList.add('selected');
      }
    } else {
      // Remove selected class from previously selected day
      const previousSelected = document.querySelector('.day.selected');
      if (previousSelected) {
        previousSelected.classList.remove('selected');
      }
      
      // Add selected class to clicked day
      dayElement.classList.add('selected');
    }
    
    // Update selected date
    selectedDate = new Date(year, month, day);
    selectedTimeSlot = null; // Reset time slot when date changes
    
    // Update step indicator
    updateStepIndicator(1);
    
    // Generate time slots for selected date
    await generateTimeSlots(selectedDate);
  }
  
  // Generate time slots for selected date
  async function generateTimeSlots(date) {
    // Clear previous time slots
    if (availableSlots) {
      availableSlots.innerHTML = '';
    }
    if (selectDatePrompt) {
      selectDatePrompt.style.display = 'none';
    }
    
    const dateString = formatDate(date);
    
    // Get bookings for this date from API
    let bookedSlots = {};
    try {
      if (typeof API !== 'undefined' && API.Booking) {
        const bookingsData = await API.Booking.getBookingsByDate(dateString);
        if (bookingsData && bookingsData.success && bookingsData.data) {
          bookedSlots = bookingsData.data;
        }
      }
    } catch (error) {
      console.warn('Could not fetch bookings, showing all slots as available:', error);
      // Continue without API - show all slots as available
    }
    
    // Check if this day is a day off
    const dayOfWeek = date.getDay().toString();
    if (settings.daysOff.includes(dayOfWeek)) {
      const dayOffMessage = document.createElement('p');
      dayOffMessage.textContent = 'This day is not available for bookings.';
      dayOffMessage.classList.add('day-off-message');
      availableSlots.appendChild(dayOffMessage);
      return;
    }
    
    // Create time slot elements
    for (let hour = settings.startHour; hour < settings.endHour; hour++) {
      const time = `${hour.toString().padStart(2, '0')}:00`;
      const timeSlotElement = document.createElement('div');
      timeSlotElement.classList.add('time-slot');
      timeSlotElement.textContent = formatTime(time);
      
      // Check if this slot is booked
      if (bookedSlots[time] && bookedSlots[time].isBooked) {
        timeSlotElement.classList.add('booked');
        timeSlotElement.title = 'This slot is already booked';
      } else {
        // Add click event for available slots
        timeSlotElement.addEventListener('click', function() {
          selectTimeSlot(time, timeSlotElement);
        });
      }
      
      availableSlots.appendChild(timeSlotElement);
    }
    
    // Update selected datetime display
    updateSelectedDatetime();
  }
  
  // Handle time slot selection
  function selectTimeSlot(time, element) {
    // Remove selected class from previously selected time slot
    const previousSelected = document.querySelector('.time-slot.selected');
    if (previousSelected) {
      previousSelected.classList.remove('selected');
    }
    
    // Add selected class to clicked time slot
    element.classList.add('selected');
    
    // Update selected time slot
    selectedTimeSlot = time;
    
    // Update selected datetime display
    updateSelectedDatetime();
    
    // Update step indicator
    updateStepIndicator(2);
  }
  
  // Update step indicator
  function updateStepIndicator(step) {
    const steps = document.querySelectorAll('.step');
    steps.forEach((s, index) => {
      if (index < step) {
        s.classList.add('active');
      } else {
        s.classList.remove('active');
      }
    });
  }
  
  // Update the selected datetime display
  function updateSelectedDatetime() {
    if (selectedDate && selectedTimeSlot) {
      const formattedDate = formatDateForDisplay(selectedDate);
      const formattedTime = formatTime(selectedTimeSlot);
      selectedDatetime.textContent = `Selected: ${formattedDate} at ${formattedTime}`;
    } else {
      selectedDatetime.textContent = 'No date and time selected';
    }
  }
  
  // Handle booking form submission
  async function handleBookingSubmit(e) {
    e.preventDefault();
    
    // Validate selection
    if (!selectedDate || !selectedTimeSlot) {
      showMessage('Please select a date and time slot before booking.', 'error');
      return;
    }
    
    // Get form data
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const notes = document.getElementById('notes').value.trim();
    
    // Validate form fields
    if (!name || !email || !phone) {
      showMessage('Please fill in all required fields.', 'error');
      return;
    }
    
    // Create booking object
    const booking = {
      name,
      email,
      phone,
      date: formatDate(selectedDate),
      time: selectedTimeSlot,
      notes: notes || undefined
    };
    
    // Show loading state
    const submitButton = bookingForm.querySelector('button[type="submit"]');
    const btnText = submitButton.querySelector('.btn-text');
    const originalText = btnText ? btnText.textContent : submitButton.textContent;
    submitButton.disabled = true;
    if (btnText) {
      btnText.textContent = 'Booking...';
    } else {
      submitButton.textContent = 'Booking...';
    }
    
    // Update step indicator
    updateStepIndicator(3);
    
    try {
      // Send booking to API
      const result = await API.Booking.createBooking(booking);
      
      if (result.success) {
        showMessage('✅ Your booking has been confirmed! You will receive a confirmation email shortly.', 'success');
        resetForm();
      } else {
        showMessage(result.message || 'Failed to create booking. Please try again.', 'error');
        updateStepIndicator(2); // Go back to step 2
      }
    } catch (error) {
      console.error('Booking error:', error);
      showMessage(error.message || 'An error occurred. Please try again later.', 'error');
      updateStepIndicator(2); // Go back to step 2
    } finally {
      submitButton.disabled = false;
      if (btnText) {
        btnText.textContent = originalText;
      } else {
        submitButton.textContent = originalText;
      }
    }
  }
  
  // Show message to user
  function showMessage(message, type) {
    bookingMessage.textContent = message;
    bookingMessage.className = `mt-3 ${type === 'success' ? 'text-success' : 'text-danger'}`;
    bookingMessage.style.display = 'block';
    
    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
      setTimeout(() => {
        bookingMessage.style.display = 'none';
      }, 5000);
    }
  }
  
  // Reset form and selections after booking
  function resetForm() {
    // Clear form fields
    bookingForm.reset();
    
    // Clear selections
    selectedDate = null;
    selectedTimeSlot = null;
    
    // Remove selected classes
    const selectedDay = document.querySelector('.day.selected');
    if (selectedDay) {
      selectedDay.classList.remove('selected');
    }
    
    const selectedSlot = document.querySelector('.time-slot.selected');
    if (selectedSlot) {
      selectedSlot.classList.remove('selected');
    }
    
    // Reset time slots
    availableSlots.innerHTML = '';
    selectDatePrompt.style.display = 'block';
    
    // Reset selected datetime display
    selectedDatetime.textContent = 'No date and time selected';
    
    // Reset step indicator
    updateStepIndicator(1);
    
    // Regenerate calendar to reflect new bookings
    await generateCalendar(currentMonth, currentYear);
  }
  
  // Navigation functions
  async function goToPrevMonth() {
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }
    
    // Reset time slots when changing month
    availableSlots.innerHTML = '';
    selectDatePrompt.style.display = 'block';
    selectedDate = null;
    selectedTimeSlot = null;
    updateSelectedDatetime();
    
    // Regenerate calendar
    await generateCalendar(currentMonth, currentYear);
  }
  
  async function goToNextMonth() {
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    
    // Reset time slots when changing month
    availableSlots.innerHTML = '';
    selectDatePrompt.style.display = 'block';
    selectedDate = null;
    selectedTimeSlot = null;
    updateSelectedDatetime();
    
    // Regenerate calendar
    await generateCalendar(currentMonth, currentYear);
  }
  
  // Utility functions
  function formatDate(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
  
  function formatDateForDisplay(date) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  }
  
  function formatTime(time) {
    // Convert 24-hour format to 12-hour format
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  }
});
