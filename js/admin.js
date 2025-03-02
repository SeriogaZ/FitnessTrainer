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
  let settings = null;
  
  // Initialize the admin panel
  init();
  
  async function init() {
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
    
    // Check if user is already logged in
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        // Verify token by getting admin info
        await API.Admin.getAllBookings();
        showAdminPanel();
      } catch (error) {
        // Token is invalid or expired
        localStorage.removeItem('authToken');
      }
    }
  }
  
  // Admin Login
  async function handleLogin() {
    const password = adminPassword.value;
    
    try {
      // Use API for admin login
      await API.Admin.login('admin', password);
      showAdminPanel();
    } catch (error) {
      alert('Incorrect password or login failed');
    }
  }
  
  async function showAdminPanel() {
    loginForm.style.display = 'none';
    adminDashboard.style.display = 'block';
    
    try {
      // Get settings from API
      const response = await API.Settings.getSettings();
      settings = response.data;
      
      // Load settings into form
      loadSettings();
      
      // Generate calendar
      generateCalendar(currentMonth, currentYear);
      
      // Load bookings
      loadBookings();
    } catch (error) {
      console.error('Error loading admin data:', error);
      
      // Fallback to default settings if API call fails
      settings = {
        startHour: 8,
        endHour: 19,
        sessionDuration: 60,
        daysOff: ['0'] // Sunday off by default
      };
      
      // Load default settings into form
      loadSettings();
      
      // Generate calendar with default settings
      generateCalendar(currentMonth, currentYear);
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
      const dayOfWeek = dateObj.getDay().toString();
      if (settings && settings.daysOff && settings.daysOff.includes(dayOfWeek)) {
        dayElement.classList.add('disabled');
        dayElement.title = 'Day off';
      }
      
      // Add click event for all days (admin can select any day)
      dayElement.addEventListener('click', function() {
        selectDay(day, month, year);
      });
      
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
  
  async function generateTimeSlots(date) {
    // Clear previous time slots
    availableSlots.innerHTML = '';
    
    try {
      // Format date for API
      const dateString = formatDate(date);
      
      // Get bookings for this date from API
      const response = await API.Booking.getBookingsByDate(dateString);
      const bookings = response.data;
      
      // Determine time slots based on settings
      const startHour = settings ? settings.startHour : 8;
      const endHour = settings ? settings.endHour : 19;
      
      // Create time slot elements
      for (let hour = startHour; hour < endHour; hour++) {
        const time = `${hour}:00`;
        const timeSlotElement = document.createElement('div');
        timeSlotElement.classList.add('time-slot');
        timeSlotElement.textContent = formatTime(time);
        timeSlotElement.dataset.time = time;
        
        // Check if this slot is booked
        if (bookings[time]) {
          if (bookings[time].isBlocked) {
            timeSlotElement.classList.add('blocked');
            timeSlotElement.title = 'This slot is blocked by admin';
          } else {
            timeSlotElement.classList.add('booked');
            timeSlotElement.title = `Booked by: ${bookings[time].name} (${bookings[time].phone})`;
          }
        }
        
        // Add click event for all slots
        timeSlotElement.addEventListener('click', function() {
          toggleTimeSlotSelection(time, timeSlotElement);
        });
        
        availableSlots.appendChild(timeSlotElement);
      }
    } catch (error) {
      console.error(`Error generating time slots for ${formatDate(date)}:`, error);
      const errorMessage = document.createElement('p');
      errorMessage.textContent = 'Failed to load time slots. Please try again later.';
      errorMessage.style.color = 'red';
      availableSlots.appendChild(errorMessage);
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
  
  async function markSlotsAsBooked() {
    if (!selectedDate || selectedTimeSlots.length === 0) {
      alert('Please select a date and at least one time slot.');
      return;
    }
    
    try {
      // Use API to block time slots
      for (const time of selectedTimeSlots) {
        await API.Admin.blockTimeSlot(formatDate(selectedDate), time);
      }
      
      // Refresh time slots
      generateTimeSlots(selectedDate);
      
      // Clear selected time slots
      selectedTimeSlots = [];
      
      alert('Selected time slots have been marked as booked.');
    } catch (error) {
      console.error('Error blocking time slots:', error);
      alert(`Failed to block time slots: ${error.message || 'Please try again later.'}`);
    }
  }
  
  async function markSlotsAsAvailable() {
    if (!selectedDate || selectedTimeSlots.length === 0) {
      alert('Please select a date and at least one time slot.');
      return;
    }
    
    try {
      // Use API to unblock time slots
      for (const time of selectedTimeSlots) {
        await API.Admin.unblockTimeSlot(formatDate(selectedDate), time);
      }
      
      // Refresh time slots
      generateTimeSlots(selectedDate);
      
      // Clear selected time slots
      selectedTimeSlots = [];
      
      alert('Selected time slots have been marked as available.');
    } catch (error) {
      console.error('Error unblocking time slots:', error);
      alert(`Failed to unblock time slots: ${error.message || 'Please try again later.'}`);
    }
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
  async function loadBookings() {
    try {
      // Get all bookings from API
      const response = await API.Admin.getAllBookings();
      const bookings = response.data;
      
      // Clear bookings list
      bookingsList.innerHTML = '';
      
      // Filter bookings based on selected period
      const period = filterPeriod.value;
      const filteredBookings = filterBookingsByPeriod(bookings, period);
      
      // Check if there are any bookings
      if (filteredBookings.length === 0) {
        const noBookingsMsg = document.createElement('p');
        noBookingsMsg.classList.add('no-bookings');
        noBookingsMsg.textContent = 'No bookings found for the selected period.';
        bookingsList.appendChild(noBookingsMsg);
        return;
      }
      
      // Group bookings by date
      const bookingsByDate = {};
      filteredBookings.forEach(booking => {
        if (!bookingsByDate[booking.date]) {
          bookingsByDate[booking.date] = [];
        }
        bookingsByDate[booking.date].push(booking);
      });
      
      // Sort dates
      const sortedDates = Object.keys(bookingsByDate).sort();
      
      // Create booking items
      sortedDates.forEach(date => {
        const dateHeader = document.createElement('h3');
        dateHeader.textContent = new Date(date).toLocaleDateString(undefined, {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        bookingsList.appendChild(dateHeader);
        
        // Sort bookings by time
        const sortedBookings = bookingsByDate[date].sort((a, b) => {
          return a.time.localeCompare(b.time);
        });
        
        // Create booking items
        sortedBookings.forEach(booking => {
          const bookingItem = createBookingItem(booking);
          bookingsList.appendChild(bookingItem);
        });
      });
    } catch (error) {
      console.error('Error loading bookings:', error);
      bookingsList.innerHTML = '<p class="no-bookings">Failed to load bookings. Please try again later.</p>';
    }
  }
  
  function filterBookingsByPeriod(bookings, period) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return bookings.filter(booking => {
      const bookingDate = new Date(booking.date);
      bookingDate.setHours(0, 0, 0, 0);
      
      switch (period) {
        case 'today':
          return bookingDate.getTime() === today.getTime();
        case 'week':
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - today.getDay());
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          return bookingDate >= weekStart && bookingDate <= weekEnd;
        case 'month':
          return bookingDate.getMonth() === today.getMonth() && 
                 bookingDate.getFullYear() === today.getFullYear();
        default: // 'all'
          return true;
      }
    });
  }
  
  function createBookingItem(booking) {
    const bookingItem = document.createElement('div');
    bookingItem.classList.add('booking-item');
    
    const formattedTime = formatTime(booking.time);
    
    if (booking.isBlocked) {
      bookingItem.classList.add('blocked');
      bookingItem.innerHTML = `
        <div class="booking-header">
          <span class="booking-time">${formattedTime}</span>
          <span class="booking-status status-blocked">Blocked</span>
        </div>
        <div class="booking-details">
          <p>This slot has been manually blocked by the admin.</p>
        </div>
        <div class="booking-actions">
          <button class="btn-admin btn-small cancel-booking" data-id="${booking._id || booking.id}" data-date="${booking.date}" data-time="${booking.time}">
            Unblock
          </button>
        </div>
      `;
    } else {
      bookingItem.innerHTML = `
        <div class="booking-header">
          <span class="booking-time">${formattedTime}</span>
          <span class="booking-status status-confirmed">Confirmed</span>
        </div>
        <div class="booking-details">
          <p><strong>Name:</strong> ${booking.name}</p>
          <p><strong>Contact:</strong> ${booking.email} / ${booking.phone}</p>
          ${booking.notes ? `<p><strong>Notes:</strong> ${booking.notes}</p>` : ''}
        </div>
        <div class="booking-actions">
          <button class="btn-admin btn-small cancel-booking" data-id="${booking._id || booking.id}" data-date="${booking.date}" data-time="${booking.time}">
            Cancel
          </button>
        </div>
      `;
    }
    
    // Add event listener to cancel button
    const cancelBtn = bookingItem.querySelector('.cancel-booking');
    cancelBtn.addEventListener('click', function() {
      const id = this.dataset.id;
      const date = this.dataset.date;
      const time = this.dataset.time;
      cancelBooking(id, date, time, booking.isBlocked);
    });
    
    return bookingItem;
  }
  
  async function cancelBooking(id, date, time, isBlocked) {
    if (!confirm(`Are you sure you want to ${isBlocked ? 'unblock' : 'cancel'} this booking?`)) {
      return;
    }
    
    try {
      if (isBlocked) {
        await API.Admin.unblockTimeSlot(date, time);
      } else {
        // Use the booking ID to cancel a regular booking
        await fetch(`/api/bookings/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });
      }
      
      alert(`Booking has been ${isBlocked ? 'unblocked' : 'cancelled'} successfully.`);
      loadBookings();
    } catch (error) {
      console.error(`Error ${isBlocked ? 'unblocking' : 'cancelling'} booking:`, error);
      alert(`Failed to ${isBlocked ? 'unblock' : 'cancel'} booking: ${error.message || 'Please try again later.'}`);
    }
  }
  
  // Settings Functions
  function loadSettings() {
    if (!settings) return;
    
    // Set form values
    startHour.value = settings.startHour;
    endHour.value = settings.endHour;
    sessionDuration.value = settings.sessionDuration;
    
    // Set days off checkboxes
    daysOffCheckboxes.forEach(checkbox => {
      checkbox.checked = settings.daysOff.includes(checkbox.value);
    });
  }
  
  async function saveSettings() {
    // Get form values
    const startHourValue = startHour.value;
    const endHourValue = endHour.value;
    const sessionDurationValue = sessionDuration.value;
    
    // Validate input
    if (parseInt(startHourValue) >= parseInt(endHourValue)) {
      alert('Start hour must be before end hour.');
      return;
    }
    
    // Get selected days off
    const daysOff = [];
    daysOffCheckboxes.forEach(checkbox => {
      if (checkbox.checked) {
        daysOff.push(checkbox.value);
      }
    });
    
    // Create settings object
    const settingsData = {
      startHour: parseInt(startHourValue),
      endHour: parseInt(endHourValue),
      sessionDuration: parseInt(sessionDurationValue),
      daysOff
    };
    
    try {
      // Update settings via API
      const response = await API.Settings.updateSettings(settingsData);
      settings = response.data;
      
      // Refresh calendar
      generateCalendar(currentMonth, currentYear);
      
      alert('Settings have been updated successfully.');
    } catch (error) {
      console.error('Error updating settings:', error);
      alert(`Failed to update settings: ${error.message || 'Please try again later.'}`);
    }
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
    return `${hour12}:${minutes || '00'} ${ampm}`;
  }
});
