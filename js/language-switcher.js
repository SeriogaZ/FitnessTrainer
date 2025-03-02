// Language switcher functionality

// Default language
let currentLanguage = 'en';

// Initialize language from localStorage or browser preference
document.addEventListener('DOMContentLoaded', function() {
  // Check if language is stored in localStorage
  const savedLanguage = localStorage.getItem('language');
  
  if (savedLanguage && ['en', 'ru', 'lv'].includes(savedLanguage)) {
    currentLanguage = savedLanguage;
  } else {
    // Try to detect browser language
    const browserLang = navigator.language || navigator.userLanguage;
    
    // Set language based on browser preference if available
    if (browserLang.startsWith('ru')) {
      currentLanguage = 'ru';
    } else if (browserLang.startsWith('lv')) {
      currentLanguage = 'lv';
    }
  }
  
  // Apply the language
  applyLanguage(currentLanguage);
  
  // Update language selector
  const languageSelector = document.getElementById('language-selector');
  if (languageSelector) {
    languageSelector.value = currentLanguage;
  }
});

// Function to switch language
function switchLanguage(lang) {
  if (['en', 'ru', 'lv'].includes(lang)) {
    currentLanguage = lang;
    localStorage.setItem('language', lang);
    applyLanguage(lang);
  }
}

// Apply translations to the page
function applyLanguage(lang) {
  // Get translations for the selected language
  const texts = translations[lang];
  
  // Update all elements with data-i18n attribute
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach(element => {
    const key = element.getAttribute('data-i18n');
    
    if (texts[key]) {
      // Check if this is an input with placeholder
      if (element.tagName === 'INPUT' && element.hasAttribute('placeholder')) {
        element.placeholder = texts[key];
      } 
      // Check if this is a link with href attribute
      else if (element.tagName === 'A' && element.hasAttribute('href')) {
        element.innerHTML = texts[key];
      }
      // Regular element
      else {
        element.innerHTML = texts[key];
      }
    }
  });
  
  // Update document title if translation exists
  if (texts['page_title']) {
    document.title = texts['page_title'];
  }
  
  // Update language selector
  const languageSelector = document.getElementById('language-selector');
  if (languageSelector) {
    languageSelector.value = lang;
  }
}

// Create language selector in the navbar
function createLanguageSelector() {
  // Create the language selector container
  const selectorContainer = document.createElement('div');
  selectorContainer.className = 'language-selector-container';
  selectorContainer.style.display = 'flex';
  selectorContainer.style.alignItems = 'center';
  
  // Create the label
  const label = document.createElement('span');
  label.className = 'language-label';
  label.setAttribute('data-i18n', 'language');
  label.textContent = translations[currentLanguage]['language'];
  label.style.marginRight = '10px';
  label.style.color = '#333';
  
  // Create language buttons
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'ru', name: 'Русский' },
    { code: 'lv', name: 'Latviešu' }
  ];
  
  const buttonsContainer = document.createElement('div');
  buttonsContainer.className = 'language-buttons';
  buttonsContainer.style.display = 'flex';
  buttonsContainer.style.gap = '5px';
  
  languages.forEach(lang => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'language-button';
    button.textContent = lang.code.toUpperCase();
    button.style.padding = '5px 8px';
    button.style.border = lang.code === currentLanguage ? '2px solid #f8bc1a' : '1px solid #ddd';
    button.style.borderRadius = '4px';
    button.style.background = lang.code === currentLanguage ? '#f8bc1a' : '#fff';
    button.style.color = lang.code === currentLanguage ? '#fff' : '#333';
    button.style.cursor = 'pointer';
    button.style.fontWeight = 'bold';
    button.style.fontSize = '12px';
    
    button.addEventListener('click', function() {
      switchLanguage(lang.code);
      
      // Update button styles
      document.querySelectorAll('.language-button').forEach(btn => {
        btn.style.border = '1px solid #ddd';
        btn.style.background = '#fff';
        btn.style.color = '#333';
      });
      
      this.style.border = '2px solid #f8bc1a';
      this.style.background = '#f8bc1a';
      this.style.color = '#fff';
    });
    
    buttonsContainer.appendChild(button);
  });
  
  // Append elements to container
  selectorContainer.appendChild(label);
  selectorContainer.appendChild(buttonsContainer);
  
  return selectorContainer;
}

// Add language selector to the navbar when the page loads
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, adding language selector');
  
  // Try to find the navbar element
  const navbar = document.querySelector('.custom_nav-container');
  console.log('Navbar element:', navbar);
  
  if (navbar) {
    // Create language selector container
    const langContainer = document.createElement('div');
    langContainer.className = 'language-selector-wrapper';
    langContainer.style.marginLeft = 'auto';
    langContainer.style.display = 'flex';
    langContainer.style.alignItems = 'center';
    
    // Create and add the language selector
    const languageSelector = createLanguageSelector();
    langContainer.appendChild(languageSelector);
    
    // Add the language selector to the navbar
    navbar.appendChild(langContainer);
    console.log('Language selector added to navbar');
    
    // Apply initial language
    applyLanguage(currentLanguage);
    console.log('Initial language applied:', currentLanguage);
  } else {
    console.error('Navbar element not found');
  }
});
