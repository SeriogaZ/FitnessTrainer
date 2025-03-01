// Booking System JavaScript

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

  // State variables
  let currentDate = new Date();
  let currentMonth = currentDate.getMonth();
  let currentYear = currentDate.getFullYear();
  let selectedDate = null;
  let selectedTimeSlot = null;
  
  // Time slots (24-hour format)
  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', 
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'
  ];
  
  // Initialize the booking system
  init();
  
  function init() {
    // Initialize calendar
    generateCalendar(currentMonth, currentYear);
    
    // Event listeners
    prevMonthBtn.addEventListener('click', goToPrevMonth);
    nextMonthBtn.addEventListener('click', goToNextMonth);
    bookingForm.addEventListener('submit', handleBookingSubmit);
    
    // Check if admin mode is enabled via URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('admin') === 'true') {
      createAdminPanel();
    }
  }
  
  // Calendar generation
  function generateCalendar(month, year) {
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
    const bookings = getBookings();
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dayElement = document.createElement('div');
      dayElement.classList.add('day');
      dayElement.textContent = day;
      
      const dateString = formatDate(new Date(year, month, day));
      
      // Check if this day is today
      if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
        dayElement.classList.add('today');
      }
      
      // Check if this day is in the past
      const checkDate = new Date(year, month, day);
      if (checkDate < new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
        dayElement.classList.add('disabled');
      } else {
        // Check if all slots for this day are booked
        const dayFullyBooked = isDateFullyBooked(dateString, bookings);
        if (dayFullyBooked) {
          dayElement.classList.add('booked');
        } else {
          // Add click event for selectable days
          dayElement.addEventListener('click', function() {
            selectDay(day, month, year);
          });
        }
      }
      
      calendarDays.appendChild(dayElement);
    }
  }
  
  // Check if all time slots for a date are booked
  function isDateFullyBooked(dateString, bookings) {
    if (!bookings[dateString]) return false;
    
    // Count booked slots for this date
    const bookedSlotsCount = Object.keys(bookings[dateString]).length;
    return bookedSlotsCount >= timeSlots.length;
  }
  
  // Handle day selection
  function selectDay(day, month, year) {
    // Remove selected class from previously selected day
    const previousSelected = document.querySelector('.day.selected');
    if (previousSelected) {
      previousSelected.classList.remove('selected');
    }
    
    // Add selected class to clicked day
    const dayElements = document.querySelectorAll('.day:not(.empty)');
    const selectedDayElement = dayElements[day - 1];
    selectedDayElement.classList.add('selected');
    
    // Update selected date
    selectedDate = new Date(year, month, day);
    
    // Generate time slots for selected date
    generateTimeSlots(selectedDate);
  }
  
  // Generate time slots for selected date
  function generateTimeSlots(date) {
    // Clear previous time slots
    availableSlots.innerHTML = '';
    selectDatePrompt.style.display = 'none';
    
    // Get bookings for this date
    const bookings = getBookings();
    const dateString = formatDate(date);
    const bookedSlots = bookings[dateString] || {};
    
    // Create time slot elements
    timeSlots.forEach(time => {
      const timeSlotElement = document.createElement('div');
      timeSlotElement.classList.add('time-slot');
      timeSlotElement.textContent = formatTime(time);
      
      // Check if this slot is booked
      if (bookedSlots[time]) {
        timeSlotElement.classList.add('booked');
        timeSlotElement.title = 'This slot is already booked';
      } else {
        // Add click event for available slots
        timeSlotElement.addEventListener('click', function() {
          selectTimeSlot(time, timeSlotElement);
        });
      }
      
      availableSlots.appendChild(timeSlotElement);
    });
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
  function handleBookingSubmit(e) {
    e.preventDefault();
    
    // Validate selection
    if (!selectedDate || !selectedTimeSlot) {
      alert('Please select a date and time slot before booking.');
      return;
    }
    
    // Get form data
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const notes = document.getElementById('notes').value;
    
    // Create booking object
    const booking = {
      name,
      email,
      phone,
      notes,
      date: formatDate(selectedDate),
      time: selectedTimeSlot,
      timestamp: new Date().toISOString()
    };
    
    // Save booking
    saveBooking(booking);
    
    // Send email notification (in a real app, this would be done server-side)
    sendEmailNotification(booking);
    
    // Show success message
    alert('Your booking request has been submitted! You will receive a confirmation shortly.');
    
    // Reset form and selections
    resetForm();
  }
  
  // Save booking to localStorage
  function saveBooking(booking) {
    const bookings = getBookings();
    
    // Initialize date entry if it doesn't exist
    if (!bookings[booking.date]) {
      bookings[booking.date] = {};
    }
    
    // Add booking to the date's time slot
    bookings[booking.date][booking.time] = booking;
    
    // Save to localStorage
    localStorage.setItem('bookings', JSON.stringify(bookings));
  }
  
  // Get bookings from localStorage
  function getBookings() {
    const bookingsJSON = localStorage.getItem('bookings');
    return bookingsJSON ? JSON.parse(bookingsJSON) : {};
  }
  
  // Send email notification (simulated)
  function sendEmailNotification(booking) {
    console.log('Email notification would be sent with:', booking);
    // In a real application, this would make an API call to a server
    // that would send an email to the trainer
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
    
    // Regenerate calendar to reflect new bookings
    generateCalendar(currentMonth, currentYear);
  }
  
  // Navigation functions
  function goToPrevMonth() {
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }
    generateCalendar(currentMonth, currentYear);
    
    // Reset time slots when changing month
    availableSlots.innerHTML = '';
    selectDatePrompt.style.display = 'block';
  }
  
  function goToNextMonth() {
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    generateCalendar(currentMonth, currentYear);
    
    // Reset time slots when changing month
    availableSlots.innerHTML = '';
    selectDatePrompt.style.display = 'block';
  }
  
  // Admin functionality
  function createAdminPanel() {
    const bookingContainer = document.querySelector('.booking_container');
    
    // Create admin panel
    const adminPanel = document.createElement('div');
    adminPanel.classList.add('admin-controls');
    adminPanel.innerHTML = `
      <h4>Admin Controls</h4>
      <div class="admin-password">
        <input type="password" id="admin-password" placeholder="Enter admin password">
        <button id="admin-login">Login</button>
      </div>
      <div class="admin-actions" id="admin-actions">
        <h5>Mark Slots as Booked</h5>
        <p>Select a date and time slot above, then click "Mark as Booked" to block that slot.</p>
        <button id="mark-booked" class="btn-book">Mark Selected Slot as Booked</button>
        <button id="view-bookings" class="btn-book" style="margin-top: 10px; background-color: #3c0e78;">View All Bookings</button>
      </div>
    `;
    
    bookingContainer.appendChild(adminPanel);
    
    // Add event listeners for admin functionality
    document.getElementById('admin-login').addEventListener('click', function() {
      const password = document.getElementById('admin-password').value;
      // Simple password check (in a real app, this would be more secure)
      if (password === 'admin123') {
        document.getElementById('admin-actions').style.display = 'block';
      } else {
        alert('Incorrect password');
      }
    });
    
    document.getElementById('mark-booked').addEventListener('click', function() {
      if (!selectedDate || !selectedTimeSlot) {
        alert('Please select a date and time slot to mark as booked.');
        return;
      }
      
      // Create a "blocked" booking
      const booking = {
        name: 'BLOCKED',
        email: 'admin@example.com',
        phone: '0000000000',
        notes: 'This slot has been manually blocked by the admin.',
        date: formatDate(selectedDate),
        time: selectedTimeSlot,
        timestamp: new Date().toISOString(),
        isBlocked: true
      };
      
      // Save the blocked booking
      saveBooking(booking);
      
      // Refresh the calendar and time slots
      generateCalendar(currentMonth, currentYear);
      if (selectedDate) {
        generateTimeSlots(selectedDate);
      }
      
      alert('The selected slot has been marked as booked.');
    });
    
    document.getElementById('view-bookings').addEventListener('click', function() {
      const bookings = getBookings();
      let bookingsList = 'All Bookings:\n\n';
      
      // Check if there are any bookings
      if (Object.keys(bookings).length === 0) {
        alert('No bookings found.');
        return;
      }
      
      // Format bookings for display
      for (const date in bookings) {
        for (const time in bookings[date]) {
          const booking = bookings[date][time];
          const formattedDate = new Date(date).toLocaleDateString();
          bookingsList += `${formattedDate} at ${formatTime(time)}\n`;
          bookingsList += `Name: ${booking.name}\n`;
          bookingsList += `Contact: ${booking.email} / ${booking.phone}\n`;
          if (booking.notes) {
            bookingsList += `Notes: ${booking.notes}\n`;
          }
          bookingsList += '\n';
        }
      }
      
      // Display bookings in an alert (in a real app, this would be a proper UI)
      alert(bookingsList);
    });
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
