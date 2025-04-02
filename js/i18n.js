/**
 * Internationalization functionality for Co-Intent platform
 * 
 * This file contains functionality for handling internationalization,
 * including language switching and dynamic text updating.
 */

import { getUserLocale, setUserLocale, getTranslation, localeMetadata } from '../locales/index.js';

// Elements that should be translated
const TRANSLATABLE_ATTRIBUTES = [
  { selector: '[data-i18n]', attribute: 'data-i18n', property: 'textContent' },
  { selector: '[data-i18n-placeholder]', attribute: 'data-i18n-placeholder', property: 'placeholder' },
  { selector: '[data-i18n-value]', attribute: 'data-i18n-value', property: 'value' },
  { selector: '[data-i18n-title]', attribute: 'data-i18n-title', property: 'title' },
  { selector: '[data-i18n-alt]', attribute: 'data-i18n-alt', property: 'alt' },
  { selector: '[data-i18n-aria-label]', attribute: 'data-i18n-aria-label', property: 'ariaLabel' }
];

/**
 * Initialize internationalization features
 */
export function initI18n() {
  // Create and add the language selector to the header
  createLanguageSelector();
  
  // Apply initial translations
  translateDocument();
  
  // Update document language attribute
  document.documentElement.lang = getUserLocale();
}

/**
 * Create language selector UI component
 */
function createLanguageSelector() {
  // Create container element
  const langSelector = document.createElement('div');
  langSelector.className = 'language-selector';
  
  // Create the language dropdown button
  const currentLang = getUserLocale();
  const currentLangData = localeMetadata[currentLang];
  
  // Create button
  const langButton = document.createElement('button');
  langButton.className = 'lang-button';
  langButton.innerHTML = `${currentLangData.flag} <span>${currentLangData.nativeName}</span>`;
  langButton.setAttribute('aria-label', `Change language. Current language: ${currentLangData.name}`);
  langButton.setAttribute('aria-expanded', 'false');
  langButton.setAttribute('aria-controls', 'language-dropdown');
  
  // Create dropdown
  const langDropdown = document.createElement('div');
  langDropdown.className = 'language-dropdown';
  langDropdown.id = 'language-dropdown';
  langDropdown.setAttribute('role', 'menu');
  
  // Add language options
  Object.entries(localeMetadata).forEach(([code, data]) => {
    const langOption = document.createElement('div');
    langOption.className = 'language-option';
    if (code === currentLang) {
      langOption.classList.add('active');
    }
    langOption.setAttribute('role', 'menuitem');
    langOption.setAttribute('tabindex', '0');
    langOption.setAttribute('data-locale', code);
    langOption.innerHTML = `${data.flag} <span>${data.nativeName}</span>`;
    
    // Add click event handler
    langOption.addEventListener('click', () => {
      if (code !== getUserLocale()) {
        // Change language
        setUserLocale(code);
        
        // Update language attribute
        document.documentElement.lang = code;
        
        // Update translations
        translateDocument();
        
        // Update language selector
        langButton.innerHTML = `${data.flag} <span>${data.nativeName}</span>`;
        
        // Update active class
        document.querySelectorAll('.language-option').forEach(el => {
          el.classList.toggle('active', el.getAttribute('data-locale') === code);
        });
        
        // Hide dropdown
        langDropdown.classList.remove('show');
        langButton.setAttribute('aria-expanded', 'false');
      }
    });
    
    langDropdown.appendChild(langOption);
  });
  
  // Add click event to toggle dropdown
  langButton.addEventListener('click', (e) => {
    e.stopPropagation();
    const isExpanded = langButton.getAttribute('aria-expanded') === 'true';
    langButton.setAttribute('aria-expanded', !isExpanded);
    langDropdown.classList.toggle('show');
  });
  
  // Close dropdown when clicking outside
  document.addEventListener('click', () => {
    langDropdown.classList.remove('show');
    langButton.setAttribute('aria-expanded', 'false');
  });
  
  // Add components to the selector
  langSelector.appendChild(langButton);
  langSelector.appendChild(langDropdown);
  
  // Insert the language selector in the header
  const userControls = document.querySelector('.user-controls-auth');
  if (userControls) {
    userControls.parentNode.insertBefore(langSelector, userControls);
  }
}

/**
 * Translate all elements in the document that have i18n attributes
 */
export function translateDocument() {
  console.log("Translating document to: " + getUserLocale());
  
  // Loop through all translatable attribute types
  TRANSLATABLE_ATTRIBUTES.forEach(({ selector, attribute, property }) => {
    // Get all elements with this attribute
    const elements = document.querySelectorAll(selector);
    console.log(`Found ${elements.length} elements with ${attribute}`);
    
    // Translate each element
    elements.forEach(element => {
      const key = element.getAttribute(attribute);
      if (key) {
        const translation = getTranslation(key);
        if (translation && translation !== key) {
          element[property] = translation;
        } else {
          console.warn(`Missing or invalid translation for key: "${key}"`);
        }
      }
    });
  });
  
  // Force calculator to initialize or reinitialize if it exists
  if (typeof RevenueCalculator !== 'undefined' && window.revenueCalculator) {
    console.log("Reinitializing revenue calculator after language change");
    window.revenueCalculator.init();
  } else if (typeof RevenueCalculator !== 'undefined') {
    console.log("Initializing revenue calculator after translation");
    window.revenueCalculator = new RevenueCalculator();
    window.revenueCalculator.init();
  }
}

/**
 * Translate a specific node and its children
 * @param {HTMLElement} node - The DOM node to translate
 */
export function translateNode(node) {
  console.log("Translating node:", node);
  
  // Check if the node itself has any i18n attributes
  TRANSLATABLE_ATTRIBUTES.forEach(({ attribute, property }) => {
    const key = node.getAttribute && node.getAttribute(attribute);
    if (key) {
      const translation = getTranslation(key);
      if (translation && translation !== key) {
        node[property] = translation;
      } else {
        console.warn(`Node translation missing for key: "${key}"`);
      }
    }
  });
  
  // Also check all translatable children
  TRANSLATABLE_ATTRIBUTES.forEach(({ selector, attribute, property }) => {
    if (node.querySelectorAll) {
      const elements = node.querySelectorAll(selector);
      console.log(`Found ${elements.length} child elements with ${attribute}`);
      
      elements.forEach(element => {
        const key = element.getAttribute(attribute);
        if (key) {
          const translation = getTranslation(key);
          if (translation && translation !== key) {
            element[property] = translation;
          } else {
            console.warn(`Child translation missing for key: "${key}"`);
          }
        }
      });
    }
  });
}

/**
 * Get a translation (convenience export for components)
 */
export function t(key) {
  return getTranslation(key);
}

// Initialize i18n when DOM is ready
document.addEventListener('DOMContentLoaded', initI18n);

// Also initialize when page is fully loaded (in case some elements were added dynamically)
window.addEventListener('load', () => {
  setTimeout(translateDocument, 500);
});

export default {
  initI18n,
  translateDocument,
  translateNode,
  t
}; 