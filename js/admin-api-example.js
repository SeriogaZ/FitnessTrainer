// Example of how to modify admin.js to use the API instead of localStorage

document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const loginForm = document.getElementById('admin-login-form');
  const adminPanel = document.getElementById('admin-panel');
  const logoutBtn = document.getElementById('logout-btn');
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  const calendarDays = document.getElementById('calendar-days');
  const monthYear = document.getElementById('month-year');
  const prevMonthBtn = document.getElementById('prev-month');
  const nextMonthBtn = document.getElementById('next-month');
  const timeSlots = document.getElementById('time-slots');
  const bookingsList = document.getElementById('bookings-list');
  const settingsForm = document.getElementById('settings-form');
  
  // State variables
  let currentDate = new Date();
  let currentMonth = currentDate.getMonth();
  let currentYear = currentDate.getFullYear();
  let selectedDate = null;
  let selectedTimeSlot = null;
  let settings = null;
  let isLoggedIn = false;
  
  // Initialize the admin panel
  init();
  
  async function init() {
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
        showLoginForm();
      }
    } else {
      showLoginForm();
    }
    
    // Add event listeners
    loginForm.addEventListener('submit', handleLogin);
    logoutBtn.addEventListener('click', handleLogout);
    tabButtons.forEach(button => {
      button.addEventListener('click', () => switchTab(button.dataset.tab));
    });
    prevMonthBtn.addEventListener('click', goToPrevMonth);
    nextMonthBtn.addEventListener('click', goToNextMonth);
    settingsForm.addEventListener('submit', handleSettingsUpdate);
  }
  
  // Login/Logout functions
  async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
      await API.Admin.login(username, password);
      showAdminPanel();
    } catch (error) {
      alert(`Login failed: ${error.message || 'Invalid credentials'}`);
    }
  }
  
  async function handleLogout() {
    try {
      await API.Admin.logout();
      localStorage.removeItem('authToken');
      showLoginForm();
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if API call fails
      localStorage.removeItem('authToken');
      showLoginForm();
    }
  }
  
  function showLoginForm() {
    loginForm.style.display = 'block';
    adminPanel.style.display = 'none';
    isLoggedIn = false;
  }
  
  async function showAdminPanel() {
    loginForm.style.display = 'none';
    adminPanel.style.display = 'block';
    isLoggedIn = true;
    
    // Load initial data
    try {
      // Get settings
      const settingsResponse = await API.Settings.getSettings();
      settings = settingsResponse.data;
      
      // Update settings form
      document.getElementById('start-hour').value = settings.startHour;
      document.getElementById('end-hour').value = settings.endHour;
      document.getElementById('session-duration').value = settings.sessionDuration;
      
      // Set days off checkboxes
      const daysOffCheckboxes = document.querySelectorAll('input[name="days-off"]');
      daysOffCheckboxes.forEach(checkbox => {
        checkbox.checked = settings.daysOff.includes(checkbox.value);
      });
      
      document.getElementById('advance-booking-days').value = settings.advanceBookingDays;
      document.getElementById('min-advance-hours').value = settings.minAdvanceHours;
      
      // Generate calendar
      generateCalendar(currentMonth, currentYear);
      
      // Load bookings list
      loadBookingsList();
      
      // Show calendar view tab by default
      switchTab('calendar');
    } catch (error) {
      console.error('Error loading admin data:', error);
      alert('Failed to load admin data. Please try again later.');
    }
  }
  
  // Tab switching
  function switchTab(tabId) {
    // Hide all tab contents
    tabContents.forEach(content => {
      content.style.display = 'none';
    });
    
    // Remove active class from all tab buttons
    tabButtons.forEach(button => {
      button.classList.remove('active');
    });
    
    // Show selected tab content
    document.getElementById(`${tabId}-tab`).style.display = 'block';
    
    // Add active class to selected tab button
    document.querySelector(`.tab-btn[data-tab="${tabId}"]`).classList.add('active');
    
    // Refresh data based on tab
    if (tabId === 'calendar') {
      generateCalendar(currentMonth, currentYear);
    } else if (tabId === 'bookings') {
      loadBookingsList();
    }
  }
  
  // Calendar functions
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
      
      // Check if this day is today
      if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
        dayElement.classList.add('today');
      }
      
      // Add click event for all days
      dayElement.addEventListener('click', function() {
        selectDay(day, month, year);
      });
      
      calendarDays.appendChild(dayElement);
    }
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
  async function generateTimeSlots(date) {
    // Clear previous time slots
    timeSlots.innerHTML = '';
    
    try {
      // Format date for API
      const dateString = formatDate(date);
      
      // Get bookings for this date from API
      const response = await API.Booking.getBookingsByDate(dateString);
      const bookings = response.data;
      
      // Update time slots header
      document.getElementById('time-slots-date').textContent = formatDateForDisplay(date);
      
      // Determine time slots based on settings
      const startHour = settings ? settings.startHour : 8;
      const endHour = settings ? settings.endHour : 19;
      
      // Create time slot elements
      for (let hour = startHour; hour < endHour; hour++) {
        const time = `${hour}:00`;
        const timeSlotElement = document.createElement('div');
        timeSlotElement.classList.add('time-slot');
        timeSlotElement.textContent = formatTime(time);
        
        // Check if this slot is booked
        if (bookings[time]) {
          if (bookings[time].isBlocked) {
            timeSlotElement.classList.add('blocked');
            timeSlotElement.title = 'This slot is blocked by admin';
          } else {
            timeSlotElement.classList.add('booked');
            timeSlotElement.title = 'This slot is booked by a customer';
          }
        }
        
        // Add click event for all slots
        timeSlotElement.addEventListener('click', function() {
          selectTimeSlot(time, timeSlotElement);
        });
        
        timeSlots.appendChild(timeSlotElement);
      }
    } catch (error) {
      console.error(`Error generating time slots for ${formatDate(date)}:`, error);
      const errorMessage = document.createElement('p');
      errorMessage.textContent = 'Failed to load time slots. Please try again later.';
      errorMessage.style.color = 'red';
      timeSlots.appendChild(errorMessage);
    }
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
    
    // Show action buttons
    document.getElementById('slot-actions').style.display = 'flex';
  }
  
  // Block/unblock time slot
  async function blockTimeSlot() {
    if (!selectedDate || !selectedTimeSlot) {
      alert('Please select a date and time slot first.');
      return;
    }
    
    try {
      await API.Admin.blockTimeSlot(formatDate(selectedDate), selectedTimeSlot);
      alert('Time slot has been blocked successfully.');
      generateTimeSlots(selectedDate);
    } catch (error) {
      console.error('Error blocking time slot:', error);
      alert(`Failed to block time slot: ${error.message || 'Please try again later.'}`);
    }
  }
  
  async function unblockTimeSlot() {
    if (!selectedDate || !selectedTimeSlot) {
      alert('Please select a date and time slot first.');
      return;
    }
    
    try {
      await API.Admin.unblockTimeSlot(formatDate(selectedDate), selectedTimeSlot);
      alert('Time slot has been unblocked successfully.');
      generateTimeSlots(selectedDate);
    } catch (error) {
      console.error('Error unblocking time slot:', error);
      alert(`Failed to unblock time slot: ${error.message || 'Please try again later.'}`);
    }
  }
  
  // Load bookings list
  async function loadBookingsList() {
    try {
      // Clear previous bookings
      bookingsList.innerHTML = '';
      
      // Get all bookings from API
      const response = await API.Admin.getAllBookings();
      const bookings = response.data;
      
      if (bookings.length === 0) {
        bookingsList.innerHTML = '<p>No bookings found.</p>';
        return;
      }
      
      // Group bookings by date
      const bookingsByDate = {};
      bookings.forEach(booking => {
        if (!bookingsByDate[booking.date]) {
          bookingsByDate[booking.date] = [];
        }
        bookingsByDate[booking.date].push(booking);
      });
      
      // Sort dates
      const sortedDates = Object.keys(bookingsByDate).sort();
      
      // Create bookings list
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
          const bookingItem = document.createElement('div');
          bookingItem.classList.add('booking-item');
          
          if (booking.isBlocked) {
            bookingItem.classList.add('blocked');
            bookingItem.innerHTML = `
              <div class="booking-time">${formatTime(booking.time)}</div>
              <div class="booking-details">
                <strong>BLOCKED</strong>
                <p>This slot has been manually blocked by the admin.</p>
              </div>
              <button class="cancel-booking" data-id="${booking._id}">Unblock</button>
            `;
          } else {
            bookingItem.innerHTML = `
              <div class="booking-time">${formatTime(booking.time)}</div>
              <div class="booking-details">
                <strong>${booking.name}</strong>
                <p>Email: ${booking.email}</p>
                <p>Phone: ${booking.phone}</p>
                ${booking.notes ? `<p>Notes: ${booking.notes}</p>` : ''}
              </div>
              <button class="cancel-booking" data-id="${booking._id}">Cancel</button>
            `;
          }
          
          bookingsList.appendChild(bookingItem);
        });
      });
      
      // Add event listeners to cancel buttons
      document.querySelectorAll('.cancel-booking').forEach(button => {
        button.addEventListener('click', () => cancelBooking(button.dataset.id));
      });
    } catch (error) {
      console.error('Error loading bookings:', error);
      bookingsList.innerHTML = '<p class="error">Failed to load bookings. Please try again later.</p>';
    }
  }
  
  // Cancel booking
  async function cancelBooking(id) {
    if (!confirm('Are you sure you want to cancel this booking?')) {
      return;
    }
    
    try {
      await fetch(`${API_BASE_URL}/bookings/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      alert('Booking has been cancelled successfully.');
      loadBookingsList();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert(`Failed to cancel booking: ${error.message || 'Please try again later.'}`);
    }
  }
  
  // Settings functions
  async function handleSettingsUpdate(e) {
    e.preventDefault();
    
    // Get form values
    const startHour = parseInt(document.getElementById('start-hour').value);
    const endHour = parseInt(document.getElementById('end-hour').value);
    const sessionDuration = parseInt(document.getElementById('session-duration').value);
    
    // Get selected days off
    const daysOffCheckboxes = document.querySelectorAll('input[name="days-off"]:checked');
    const daysOff = Array.from(daysOffCheckboxes).map(checkbox => checkbox.value);
    
    const advanceBookingDays = parseInt(document.getElementById('advance-booking-days').value);
    const minAdvanceHours = parseInt(document.getElementById('min-advance-hours').value);
    
    // Validate input
    if (startHour >= endHour) {
      alert('Start hour must be before end hour.');
      return;
    }
    
    // Create settings object
    const settingsData = {
      startHour,
      endHour,
      sessionDuration,
      daysOff,
      advanceBookingDays,
      minAdvanceHours
    };
    
    try {
      // Update settings via API
      const response = await API.Settings.updateSettings(settingsData);
      settings = response.data;
      
      alert('Settings have been updated successfully.');
    } catch (error) {
      console.error('Error updating settings:', error);
      alert(`Failed to update settings: ${error.message || 'Please try again later.'}`);
    }
  }
  
  // Navigation functions
  function goToPrevMonth() {
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }
    generateCalendar(currentMonth, currentYear);
    
    // Reset time slots
    timeSlots.innerHTML = '';
    document.getElementById('time-slots-date').textContent = 'No date selected';
    selectedDate = null;
    selectedTimeSlot = null;
  }
  
  function goToNextMonth() {
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    generateCalendar(currentMonth, currentYear);
    
    // Reset time slots
    timeSlots.innerHTML = '';
    document.getElementById('time-slots-date').textContent = 'No date selected';
    selectedDate = null;
    selectedTimeSlot = null;
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
  
  // Add event listeners for block/unblock buttons
  document.getElementById('block-slot-btn').addEventListener('click', blockTimeSlot);
  document.getElementById('unblock-slot-btn').addEventListener('click', unblockTimeSlot);
});
