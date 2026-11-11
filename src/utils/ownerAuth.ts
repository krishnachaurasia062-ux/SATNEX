/**
 * Owner Authentication and Custom Code Persistence Utility
 * Restricts code modification exclusively to the project creator: Krishna Chaurasia (krishnachaurasia062@gmail.com)
 */

export const OWNER_EMAIL = 'krishnachaurasia062@gmail.com';
export const OWNER_NAME = 'Krishna Chaurasia';
export const OWNER_PASSKEY = 'krishna_@gps';

const AUTH_STORAGE_KEY = 'gps_exhibition_owner_authenticated';
const AUTH_EMAIL_KEY = 'gps_exhibition_owner_email';
const CUSTOM_CODE_PREFIX = 'gps_custom_code_';

// Check if owner is currently logged in on this browser
export const isOwnerLoggedIn = (): boolean => {
  try {
    return localStorage.getItem(AUTH_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
};

// Verify owner credentials (strictly accepts only the passkey 'krishna_@gps')
export const verifyOwnerCredentials = (input: string): { success: boolean; message: string } => {
  const clean = input.trim();
  
  if (!clean) {
    return { success: false, message: 'Access Denied' };
  }

  // Strictly only allow the exact passkey 'krishna_@gps'
  if (clean === OWNER_PASSKEY || clean.toLowerCase() === OWNER_PASSKEY.toLowerCase()) {
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, 'true');
      localStorage.setItem(AUTH_EMAIL_KEY, OWNER_NAME);
      // Dispatch custom event so all open views immediately update
      window.dispatchEvent(new Event('gps_owner_auth_change'));
    } catch (e) {
      console.warn('Storage not available', e);
    }
    return {
      success: true,
      message: `Owner Edit Mode unlocked.`,
    };
  }

  return {
    success: false,
    message: 'Access Denied',
  };
};

// Lock owner mode (when presenting to teachers or judges)
export const lockOwnerMode = (): void => {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(AUTH_EMAIL_KEY);
    window.dispatchEvent(new Event('gps_owner_auth_change'));
  } catch (e) {
    console.warn('Storage error', e);
  }
};

// Get customized code for a script file (or returns default if unedited)
export const getCustomScriptCode = (filename: string, defaultCode: string): string => {
  try {
    const saved = localStorage.getItem(CUSTOM_CODE_PREFIX + filename);
    if (saved && saved.trim().length > 0) {
      return saved;
    }
  } catch {
    // fallback
  }
  return defaultCode;
};

// Save edited code for a script file
export const saveCustomScriptCode = (filename: string, newCode: string): void => {
  try {
    localStorage.setItem(CUSTOM_CODE_PREFIX + filename, newCode);
    window.dispatchEvent(new CustomEvent('gps_custom_code_saved', { detail: { filename } }));
  } catch (e) {
    console.error('Failed to save custom script', e);
  }
};

// Reset script code back to default original implementation
export const resetCustomScriptCode = (filename: string): void => {
  try {
    localStorage.removeItem(CUSTOM_CODE_PREFIX + filename);
    window.dispatchEvent(new CustomEvent('gps_custom_code_saved', { detail: { filename } }));
  } catch (e) {
    console.error('Failed to reset custom script', e);
  }
};

// Check if a script has active custom modifications
export const hasCustomScriptModifications = (filename: string): boolean => {
  try {
    return localStorage.getItem(CUSTOM_CODE_PREFIX + filename) !== null;
  } catch {
    return false;
  }
};
