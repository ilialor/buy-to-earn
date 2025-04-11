/**
 * Localization module
 * 
 * This module exports all available localizations and utility functions
 * for the Co-Intent platform.
 */

import en from './en.js';
import ru from './ru.js';
import es from './es.js';

// All available locales
export const locales = {
  en,
  ru,
  es
};

// Locale metadata with display names
export const localeMetadata = {
  en: {
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧'
  },
  ru: {
    name: 'Russian',
    nativeName: 'Русский',
    flag: '🇷🇺'
  },
  es: {
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸'
  }
};

// Default locale
export const DEFAULT_LOCALE = 'en';

// Get browser language or default locale
export function getBrowserLocale() {
  const browserLang = navigator.language.split('-')[0];
  return locales[browserLang] ? browserLang : DEFAULT_LOCALE;
}

// Get stored user locale preference or use browser locale
export function getUserLocale() {
  return localStorage.getItem('userLocale') || getBrowserLocale();
}

// Set user locale preference
export function setUserLocale(locale) {
  if (locales[locale]) {
    localStorage.setItem('userLocale', locale);
    return true;
  }
  return false;
}

// Get a translation by key with fallback to default locale
export function getTranslation(key, locale = getUserLocale()) {
  // Split the key path (e.g. "nav.marketplace")
  const keys = key.split('.');
  
  // Try to get the translation from the selected locale
  let result = locales[locale];
  let found = true;
  
  // Traverse through the keys in the selected locale
  for (const k of keys) {
    if (result && typeof result === 'object' && k in result) {
      result = result[k];
    } else {
      found = false;
      break;
    }
  }
  
  // If translation is found, return it
  if (found && result !== undefined && result !== null && typeof result !== 'object') {
    return result;
  }
  
  // If not found in selected locale, try default locale
  if (locale !== DEFAULT_LOCALE) {
    result = locales[DEFAULT_LOCALE];
    found = true;
    
    // Traverse through the keys in the default locale
    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k];
      } else {
        found = false;
        break;
      }
    }
    
    // If found in default locale, return it
    if (found && result !== undefined && result !== null && typeof result !== 'object') {
      console.log(`Fallback translation for "${key}": using "${DEFAULT_LOCALE}" instead of "${locale}"`);
      return result;
    }
  }
  
  // If not found in any locale, return the key itself as fallback
  console.warn(`Translation key not found: "${key}" (locale: ${locale})`);
  return key;
}

// Get current locale object
export function getCurrentLocale() {
  return locales[getUserLocale()];
}

export default {
  locales,
  localeMetadata,
  DEFAULT_LOCALE,
  getBrowserLocale,
  getUserLocale,
  setUserLocale,
  getTranslation,
  getCurrentLocale
}; 