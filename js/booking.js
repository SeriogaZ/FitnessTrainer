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
  let settings = null;
  
  // Initialize the booking system
  init();
  
  async function init() {
    try {
      // Get settings from API
      const response = await API.Settings.getSettings();
      settings = response.data;
      
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
    } catch (error) {
      console.error('Error initializing booking system:', error);
      // Fallback to default settings if API call fails
      settings = {
        startHour: 8,
        endHour: 19,
        sessionDuration: 60,
        daysOff: ['0'] // Sunday off by default
      };
      
      // Initialize calendar with default settings
      generateCalendar(currentMonth, currentYear);
      
      // Event listeners
      prevMonthBtn.addEventListener('click', goToPrevMonth);
      nextMonthBtn.addEventListener('click', goToNextMonth);
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
        try {
          // Check if this day is a day off
          const dayOfWeek = checkDate.getDay().toString();
          if (settings && settings.daysOff && settings.daysOff.includes(dayOfWeek)) {
            dayElement.classList.add('disabled');
            dayElement.title = 'Day off';
          } else {
            // Check if all slots for this day are booked
            const response = await API.Booking.getBookingsByDate(dateString);
            const bookings = response.data;
            
            // Count booked slots
            const bookedSlotsCount = Object.keys(bookings).length;
            const totalSlots = settings ? (settings.endHour - settings.startHour) : 11;
            
            if (bookedSlotsCount >= totalSlots) {
              dayElement.classList.add('booked');
              dayElement.title = 'Fully booked';
            } else {
              // Add click event for selectable days
              dayElement.addEventListener('click', function() {
                selectDay(day, month, year);
              });
            }
          }
        } catch (error) {
          console.error(`Error checking availability for ${dateString}:`, error);
          // Still make the day selectable if there's an error
          dayElement.addEventListener('click', function() {
            selectDay(day, month, year);
          });
        }
      }
      
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
    availableSlots.innerHTML = '';
    selectDatePrompt.style.display = 'none';
    
    try {
      // Format date for API
      const dateString = formatDate(date);
      
      // Check if this day is a day off
      const dayOfWeek = date.getDay().toString();
      if (settings && settings.daysOff && settings.daysOff.includes(dayOfWeek)) {
        const dayOffMessage = document.createElement('p');
        dayOffMessage.textContent = 'This day is not available for bookings.';
        dayOffMessage.classList.add('day-off-message');
        availableSlots.appendChild(dayOffMessage);
        return;
      }
      
      // Get bookings for this date from API
      const response = await API.Booking.getBookingsByDate(dateString);
      const bookings = response.data;
      
      // Determine available time slots based on settings
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
    } catch (error) {
      console.error(`Error generating time slots for ${formatDate(date)}:`, error);
      const errorMessage = document.createElement('p');
      errorMessage.textContent = 'Failed to load time slots. Please try again later.';
      errorMessage.style.color = 'red';
      availableSlots.appendChild(errorMessage);
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
  async function handleBookingSubmit(e) {
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
      time: selectedTimeSlot
    };
    
    try {
      // Submit booking to API
      const response = await API.Booking.createBooking(booking);
      
      // Show success message
      alert('Your booking request has been submitted! You will receive a confirmation shortly.');
      
      // Reset form and selections
      resetForm();
    } catch (error) {
      console.error('Error creating booking:', error);
      alert(`Booking failed: ${error.message || 'Please try again later.'}`);
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
      <div class="admin-actions" id="admin-actions" style="display: none;">
        <h5>Mark Slots as Booked</h5>
        <p>Select a date and time slot above, then click "Mark as Booked" to block that slot.</p>
        <button id="mark-booked" class="btn-book">Mark Selected Slot as Booked</button>
        <button id="view-bookings" class="btn-book" style="margin-top: 10px; background-color: #3c0e78;">View All Bookings</button>
      </div>
    `;
    
    bookingContainer.appendChild(adminPanel);
    
    // Add event listeners for admin functionality
    document.getElementById('admin-login').addEventListener('click', async function() {
      const password = document.getElementById('admin-password').value;
      
      try {
        // Use API for admin login
        await API.Admin.login('admin', password);
        document.getElementById('admin-actions').style.display = 'block';
      } catch (error) {
        alert('Incorrect password or login failed');
      }
    });
    
    document.getElementById('mark-booked').addEventListener('click', async function() {
      if (!selectedDate || !selectedTimeSlot) {
        alert('Please select a date and time slot to mark as booked.');
        return;
      }
      
      try {
        // Use API to block time slot
        await API.Admin.blockTimeSlot(formatDate(selectedDate), selectedTimeSlot);
        
        // Refresh the calendar and time slots
        generateCalendar(currentMonth, currentYear);
        if (selectedDate) {
          generateTimeSlots(selectedDate);
        }
        
        alert('The selected slot has been marked as booked.');
      } catch (error) {
        console.error('Error blocking time slot:', error);
        alert(`Failed to block time slot: ${error.message || 'Please try again later.'}`);
      }
    });
    
    document.getElementById('view-bookings').addEventListener('click', async function() {
      try {
        // Get all bookings from API
        const response = await API.Admin.getAllBookings();
        const bookings = response.data;
        
        if (bookings.length === 0) {
          alert('No bookings found.');
          return;
        }
        
        // Format bookings for display
        let bookingsList = 'All Bookings:\n\n';
        
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
        
        // Format bookings by date
        sortedDates.forEach(date => {
          const formattedDate = new Date(date).toLocaleDateString();
          bookingsList += `=== ${formattedDate} ===\n`;
          
          // Sort bookings by time
          const sortedBookings = bookingsByDate[date].sort((a, b) => {
            return a.time.localeCompare(b.time);
          });
          
          // Add each booking
          sortedBookings.forEach(booking => {
            bookingsList += `${formatTime(booking.time)}\n`;
            bookingsList += `Name: ${booking.name}\n`;
            bookingsList += `Contact: ${booking.email} / ${booking.phone}\n`;
            if (booking.notes) {
              bookingsList += `Notes: ${booking.notes}\n`;
            }
            bookingsList += '\n';
          });
        });
        
        // Display bookings in an alert (in a real app, this would be a proper UI)
        alert(bookingsList);
      } catch (error) {
        console.error('Error getting bookings:', error);
        alert(`Failed to get bookings: ${error.message || 'Please try again later.'}`);
      }
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
    return `${hour12}:${minutes || '00'} ${ampm}`;
  }
});
