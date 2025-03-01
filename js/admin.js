// Admin Panel JavaScript

document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const loginForm = document.getElementById('login-form');
  const adminDashboard = document.getElementById('admin-dashboard');
  const adminLoginBtn = document.getElementById('admin-login-btn');
  const adminPassword = document.getElementById('admin-password');
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  
  // Calendar Elements
  const calendarDays = document.getElementById('calendar-days');
  const monthYear = document.getElementById('month-year');
  const prevMonthBtn = document.getElementById('prev-month');
  const nextMonthBtn = document.getElementById('next-month');
  const availableSlots = document.getElementById('available-slots');
  const selectedDateDisplay = document.getElementById('selected-date-display');
  const markBookedBtn = document.getElementById('mark-booked-btn');
  const markAvailableBtn = document.getElementById('mark-available-btn');
  
  // Bookings Elements
  const filterPeriod = document.getElementById('filter-period');
  const refreshBookingsBtn = document.getElementById('refresh-bookings');
  const bookingsList = document.getElementById('bookings-list');
  
  // Settings Elements
  const startHour = document.getElementById('start-hour');
  const endHour = document.getElementById('end-hour');
  const sessionDuration = document.getElementById('session-duration');
  const daysOffCheckboxes = document.querySelectorAll('.day-checkbox input');
  const saveSettingsBtn = document.getElementById('save-settings');
  
  // State variables
  let currentDate = new Date();
  let currentMonth = currentDate.getMonth();
  let currentYear = currentDate.getFullYear();
  let selectedDate = null;
  let selectedTimeSlots = [];
  
  // Initialize the admin panel
  init();
  
  function init() {
    // Add event listeners
    adminLoginBtn.addEventListener('click', handleLogin);
    tabButtons.forEach(button => {
      button.addEventListener('click', () => switchTab(button.dataset.tab));
    });
    
    prevMonthBtn.addEventListener('click', goToPrevMonth);
    nextMonthBtn.addEventListener('click', goToNextMonth);
    markBookedBtn.addEventListener('click', markSlotsAsBooked);
    markAvailableBtn.addEventListener('click', markSlotsAsAvailable);
    
    filterPeriod.addEventListener('change', loadBookings);
    refreshBookingsBtn.addEventListener('click', loadBookings);
    
    saveSettingsBtn.addEventListener('click', saveSettings);
    
    // Load settings
    loadSettings();
    
    // Generate calendar
    generateCalendar(currentMonth, currentYear);
  }
  
  // Admin Login
  function handleLogin() {
    const password = adminPassword.value;
    
    // Simple password check (in a real app, this would be more secure)
    if (password === 'admin123') {
      loginForm.style.display = 'none';
      adminDashboard.style.display = 'block';
      
      // Load initial data
      loadBookings();
    } else {
      alert('Incorrect password. Please try again.');
    }
  }
  
  // Tab Switching
  function switchTab(tabId) {
    // Update active tab button
    tabButtons.forEach(button => {
      if (button.dataset.tab === tabId) {
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }
    });
    
    // Show selected tab content
    tabContents.forEach(content => {
      if (content.id === tabId + '-tab') {
        content.classList.add('active');
      } else {
        content.classList.remove('active');
      }
    });
    
    // Refresh data based on tab
    if (tabId === 'bookings') {
      loadBookings();
    }
  }
  
  // Calendar Functions
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
    const settings = getSettings();
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dayElement = document.createElement('div');
      dayElement.classList.add('day');
      dayElement.textContent = day;
      
      const dateObj = new Date(year, month, day);
      const dateString = formatDate(dateObj);
      
      // Check if this day is today
      if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
        dayElement.classList.add('today');
      }
      
      // Check if this day is a day off
      const dayOfWeek = dateObj.getDay();
      if (settings.daysOff.includes(dayOfWeek.toString())) {
        dayElement.classList.add('disabled');
        dayElement.title = 'Day off';
      } else {
        // Check if all slots for this day are booked
        const dayFullyBooked = isDateFullyBooked(dateString, bookings);
        if (dayFullyBooked) {
          dayElement.classList.add('booked');
          dayElement.title = 'Fully booked';
        }
        
        // Add click event for selectable days
        dayElement.addEventListener('click', function() {
          selectDay(day, month, year);
        });
      }
      
      calendarDays.appendChild(dayElement);
    }
  }
  
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
    selectedDateDisplay.textContent = formatDateForDisplay(selectedDate);
    
    // Generate time slots for selected date
    generateTimeSlots(selectedDate);
    
    // Clear selected time slots
    selectedTimeSlots = [];
  }
  
  function generateTimeSlots(date) {
    // Clear previous time slots
    availableSlots.innerHTML = '';
    
    // Get bookings for this date
    const bookings = getBookings();
    const dateString = formatDate(date);
    const bookedSlots = bookings[dateString] || {};
    
    // Get settings
    const settings = getSettings();
    const startTime = parseInt(settings.startHour);
    const endTime = parseInt(settings.endHour);
    
    // Create time slot elements
    for (let hour = startTime; hour < endTime; hour++) {
      const time = `${hour}:00`;
      const timeSlotElement = document.createElement('div');
      timeSlotElement.classList.add('time-slot');
      timeSlotElement.textContent = formatTime(time);
      timeSlotElement.dataset.time = time;
      
      // Check if this slot is booked
      if (bookedSlots[time]) {
        timeSlotElement.classList.add('booked');
        
        // Add client info as tooltip if it's a real booking (not blocked)
        if (!bookedSlots[time].isBlocked) {
          const booking = bookedSlots[time];
          timeSlotElement.title = `Booked by: ${booking.name} (${booking.phone})`;
        } else {
          timeSlotElement.title = 'This slot is blocked';
        }
      }
      
      // Add click event for time slots
      timeSlotElement.addEventListener('click', function() {
        toggleTimeSlotSelection(time, timeSlotElement);
      });
      
      availableSlots.appendChild(timeSlotElement);
    }
  }
  
  function toggleTimeSlotSelection(time, element) {
    if (element.classList.contains('selected')) {
      // Deselect
      element.classList.remove('selected');
      selectedTimeSlots = selectedTimeSlots.filter(slot => slot !== time);
    } else {
      // Select
      element.classList.add('selected');
      selectedTimeSlots.push(time);
    }
  }
  
  function markSlotsAsBooked() {
    if (!selectedDate || selectedTimeSlots.length === 0) {
      alert('Please select a date and at least one time slot.');
      return;
    }
    
    const dateString = formatDate(selectedDate);
    const bookings = getBookings();
    
    // Initialize date entry if it doesn't exist
    if (!bookings[dateString]) {
      bookings[dateString] = {};
    }
    
    // Mark selected slots as booked
    selectedTimeSlots.forEach(time => {
      bookings[dateString][time] = {
        name: 'BLOCKED',
        email: 'admin@example.com',
        phone: '0000000000',
        notes: 'This slot has been manually blocked by the admin.',
        date: dateString,
        time: time,
        timestamp: new Date().toISOString(),
        isBlocked: true
      };
    });
    
    // Save bookings
    localStorage.setItem('bookings', JSON.stringify(bookings));
    
    // Refresh time slots
    generateTimeSlots(selectedDate);
    
    // Clear selected time slots
    selectedTimeSlots = [];
    
    // Refresh calendar
    generateCalendar(currentMonth, currentYear);
    
    alert('Selected time slots have been marked as booked.');
  }
  
  function markSlotsAsAvailable() {
    if (!selectedDate || selectedTimeSlots.length === 0) {
      alert('Please select a date and at least one time slot.');
      return;
    }
    
    const dateString = formatDate(selectedDate);
    const bookings = getBookings();
    
    // Check if there are any bookings for this date
    if (!bookings[dateString]) {
      alert('No bookings found for this date.');
      return;
    }
    
    // Remove selected slots from bookings
    let removedCount = 0;
    selectedTimeSlots.forEach(time => {
      if (bookings[dateString][time]) {
        delete bookings[dateString][time];
        removedCount++;
      }
    });
    
    // Remove date entry if no more bookings
    if (Object.keys(bookings[dateString]).length === 0) {
      delete bookings[dateString];
    }
    
    // Save bookings
    localStorage.setItem('bookings', JSON.stringify(bookings));
    
    // Refresh time slots
    generateTimeSlots(selectedDate);
    
    // Clear selected time slots
    selectedTimeSlots = [];
    
    // Refresh calendar
    generateCalendar(currentMonth, currentYear);
    
    alert(`${removedCount} time slot(s) have been marked as available.`);
  }
  
  function goToPrevMonth() {
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }
    generateCalendar(currentMonth, currentYear);
  }
  
  function goToNextMonth() {
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    generateCalendar(currentMonth, currentYear);
  }
  
  // Bookings Functions
  function loadBookings() {
    const bookings = getBookings();
    const period = filterPeriod.value;
    
    // Clear bookings list
    bookingsList.innerHTML = '';
    
    // Filter bookings based on selected period
    const filteredBookings = filterBookingsByPeriod(bookings, period);
    
    // Check if there are any bookings
    if (Object.keys(filteredBookings).length === 0) {
      const noBookingsMsg = document.createElement('p');
      noBookingsMsg.classList.add('no-bookings');
      noBookingsMsg.textContent = 'No bookings found for the selected period.';
      bookingsList.appendChild(noBookingsMsg);
      return;
    }
    
    // Sort bookings by date and time
    const sortedBookings = sortBookings(filteredBookings);
    
    // Create booking items
    sortedBookings.forEach(booking => {
      const bookingItem = createBookingItem(booking);
      bookingsList.appendChild(bookingItem);
    });
  }
  
  function filterBookingsByPeriod(bookings, period) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const filteredBookings = {};
    
    for (const dateString in bookings) {
      const bookingDate = new Date(dateString);
      bookingDate.setHours(0, 0, 0, 0);
      
      let includeDate = false;
      
      switch (period) {
        case 'today':
          includeDate = bookingDate.getTime() === today.getTime();
          break;
        case 'week':
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - today.getDay());
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          includeDate = bookingDate >= weekStart && bookingDate <= weekEnd;
          break;
        case 'month':
          includeDate = bookingDate.getMonth() === today.getMonth() && 
                       bookingDate.getFullYear() === today.getFullYear();
          break;
        default: // 'all'
          includeDate = true;
          break;
      }
      
      if (includeDate) {
        filteredBookings[dateString] = bookings[dateString];
      }
    }
    
    return filteredBookings;
  }
  
  function sortBookings(bookings) {
    const sortedBookings = [];
    
    // Convert bookings object to array
    for (const dateString in bookings) {
      for (const timeString in bookings[dateString]) {
        sortedBookings.push(bookings[dateString][timeString]);
      }
    }
    
    // Sort by date and time
    sortedBookings.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateA - dateB;
    });
    
    return sortedBookings;
  }
  
  function createBookingItem(booking) {
    const bookingItem = document.createElement('div');
    bookingItem.classList.add('booking-item');
    
    const bookingDate = new Date(booking.date);
    const formattedDate = formatDateForDisplay(bookingDate);
    const formattedTime = formatTime(booking.time);
    
    bookingItem.innerHTML = `
      <div class="booking-header">
        <span class="booking-date">${formattedDate} at ${formattedTime}</span>
        <span class="booking-status ${booking.isBlocked ? 'status-cancelled' : 'status-confirmed'}">
          ${booking.isBlocked ? 'Blocked' : 'Confirmed'}
        </span>
      </div>
      <div class="booking-details">
        <p><strong>Name:</strong> ${booking.name}</p>
        <p><strong>Contact:</strong> ${booking.email} / ${booking.phone}</p>
        ${booking.notes ? `<p><strong>Notes:</strong> ${booking.notes}</p>` : ''}
      </div>
      <div class="booking-actions">
        <button class="btn-admin btn-small" onclick="cancelBooking('${booking.date}', '${booking.time}')">
          ${booking.isBlocked ? 'Unblock' : 'Cancel'} Booking
        </button>
      </div>
    `;
    
    return bookingItem;
  }
  
  // Settings Functions
  function loadSettings() {
    const settings = getSettings();
    
    // Set form values
    startHour.value = settings.startHour;
    endHour.value = settings.endHour;
    sessionDuration.value = settings.sessionDuration;
    
    // Set days off checkboxes
    daysOffCheckboxes.forEach(checkbox => {
      checkbox.checked = settings.daysOff.includes(checkbox.value);
    });
  }
  
  function saveSettings() {
    // Get form values
    const settings = {
      startHour: startHour.value,
      endHour: endHour.value,
      sessionDuration: sessionDuration.value,
      daysOff: []
    };
    
    // Get selected days off
    daysOffCheckboxes.forEach(checkbox => {
      if (checkbox.checked) {
        settings.daysOff.push(checkbox.value);
      }
    });
    
    // Save settings
    localStorage.setItem('bookingSettings', JSON.stringify(settings));
    
    // Refresh calendar
    generateCalendar(currentMonth, currentYear);
    
    alert('Settings saved successfully.');
  }
  
  // Utility Functions
  function getBookings() {
    const bookingsJSON = localStorage.getItem('bookings');
    return bookingsJSON ? JSON.parse(bookingsJSON) : {};
  }
  
  function getSettings() {
    const settingsJSON = localStorage.getItem('bookingSettings');
    const defaultSettings = {
      startHour: '8',
      endHour: '19',
      sessionDuration: '60',
      daysOff: ['0'] // Sunday off by default
    };
    
    return settingsJSON ? JSON.parse(settingsJSON) : defaultSettings;
  }
  
  function isDateFullyBooked(dateString, bookings) {
    if (!bookings[dateString]) return false;
    
    const settings = getSettings();
    const startTime = parseInt(settings.startHour);
    const endTime = parseInt(settings.endHour);
    const totalSlots = endTime - startTime;
    
    // Count booked slots for this date
    const bookedSlotsCount = Object.keys(bookings[dateString]).length;
    return bookedSlotsCount >= totalSlots;
  }
  
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
    return `${hour12}:${minutes || '00'} ${ampm}`;
  }
});

// Global function for canceling bookings (called from HTML)
function cancelBooking(date, time) {
  const bookings = JSON.parse(localStorage.getItem('bookings') || '{}');
  
  // Check if booking exists
  if (!bookings[date] || !bookings[date][time]) {
    alert('Booking not found.');
    return;
  }
  
  // Confirm cancellation
  if (confirm('Are you sure you want to cancel this booking?')) {
    // Remove booking
    delete bookings[date][time];
    
    // Remove date entry if no more bookings
    if (Object.keys(bookings[date]).length === 0) {
      delete bookings[date];
    }
    
    // Save bookings
    localStorage.setItem('bookings', JSON.stringify(bookings));
    
    // Refresh bookings list
    document.getElementById('refresh-bookings').click();
    
    alert('Booking has been cancelled.');
  }
}
