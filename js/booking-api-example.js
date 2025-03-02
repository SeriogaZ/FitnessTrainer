// Example of how to modify booking.js to use the API instead of localStorage

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
    } catch (error) {
      console.error('Error initializing booking system:', error);
      alert('Failed to load booking system. Please try again later.');
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
