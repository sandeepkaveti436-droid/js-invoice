export interface EmailValidationResult {
  valid: boolean;
  reason?: string;
}

const BLOCKED_USERNAMES = new Set([
  'abc', 
  'xyz', 
  'test', 
  'testing', 
  'dummy', 
  'fake', 
  'sample', 
  'demo',
  'temp', 
  'user.google', 
  'google', 
  'user', 
  'asdf', 
  'qwerty', 
  '123',
  '1234', 
  '12345', 
  'admin', 
  'alex', 
  'null', 
  'undefined', 
  'none', 
  'nobody', 
  'anonymous'
]);

const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com', 
  '10minutemail.com', 
  'tempmail.com', 
  'guerrillamail.com',
  'yopmail.com', 
  'throwawaymail.com', 
  'trashmail.com', 
  'sharklasers.com',
  'dispostable.com', 
  'getairmail.com', 
  'maildrop.cc', 
  'temp-mail.org'
]);

/**
 * Validates that an email is a genuine, official email address and not a dummy or temporary address.
 */
export function validateOfficialEmail(rawEmail: string): EmailValidationResult {
  const email = (rawEmail || '').trim().toLowerCase();
  
  if (!email) {
    return { valid: false, reason: 'Please enter your email address.' };
  }

  // Standard email format check
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, reason: 'Please enter a valid official email address (e.g. name@company.com or name@gmail.com).' };
  }

  const parts = email.split('@');
  if (parts.length !== 2) {
    return { valid: false, reason: 'Invalid email address format.' };
  }

  const [username, domain] = parts;

  // Blocked dummy prefixes
  if (BLOCKED_USERNAMES.has(username)) {
    return {
      valid: false,
      reason: `"${email}" is a dummy email address. Please use your genuine, official email address.`
    };
  }

  // Minimum username length
  if (username.length < 3) {
    return {
      valid: false,
      reason: 'Email username must be at least 3 characters. Dummy usernames like "a@" or "ab@" are not allowed.'
    };
  }

  // Prefixes starting with dummy indicators
  const dummyPrefixes = ['test', 'dummy', 'fake', 'temp', 'sample'];
  for (const prefix of dummyPrefixes) {
    if (username.startsWith(prefix) && (username.length === prefix.length || /^[0-9_.-]/.test(username.slice(prefix.length)))) {
      return {
        valid: false,
        reason: `Dummy or test address prefix "${prefix}" is not permitted. Please use your official email address.`
      };
    }
  }

  // Repeated character usernames (e.g. 'aaaa', '1111')
  if (/^(.)\1+$/.test(username)) {
    return {
      valid: false,
      reason: 'Email username cannot consist solely of repetitive characters. Please use your official email.'
    };
  }

  // Disposable domain check
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return {
      valid: false,
      reason: 'Disposable or temporary email domains are not allowed. Please use your official email address.'
    };
  }

  return { valid: true };
}
