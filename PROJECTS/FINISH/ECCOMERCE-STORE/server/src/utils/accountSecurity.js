/**
 * Account Security Utilities
 * Functions for account lockout, failed login tracking, and security checks
 */

/**
 * Increment failed login attempts
 * @param {Object} user - User document
 * @returns {Promise<Object>} Updated user
 */
export const incrementFailedAttempts = async (user) => {
  user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
  
  // Lock account after 5 failed attempts
  if (user.failedLoginAttempts >= 5) {
    user.accountLockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
  }
  
  await user.save();
  return user;
};

/**
 * Reset failed login attempts
 * @param {Object} user - User document
 * @returns {Promise<Object>} Updated user
 */
export const resetFailedAttempts = async (user) => {
  user.failedLoginAttempts = 0;
  user.accountLockedUntil = undefined;
  await user.save();
  return user;
};

/**
 * Check if account is locked
 * @param {Object} user - User document
 * @returns {boolean} True if account is locked
 */
export const isAccountLocked = (user) => {
  if (!user.accountLockedUntil) {
    return false;
  }
  
  // Check if lockout period has expired
  if (new Date() > user.accountLockedUntil) {
    return false;
  }
  
  return true;
};

/**
 * Get remaining lockout time in minutes
 * @param {Object} user - User document
 * @returns {number} Minutes remaining, or 0 if not locked
 */
export const getRemainingLockoutTime = (user) => {
  if (!user.accountLockedUntil) {
    return 0;
  }
  
  const now = new Date();
  const lockoutEnd = new Date(user.accountLockedUntil);
  
  if (now > lockoutEnd) {
    return 0;
  }
  
  const remainingMs = lockoutEnd - now;
  const remainingMinutes = Math.ceil(remainingMs / (60 * 1000));
  
  return remainingMinutes;
};

/**
 * Lock account manually
 * @param {Object} user - User document
 * @param {number} durationMinutes - Lockout duration in minutes
 * @returns {Promise<Object>} Updated user
 */
export const lockAccount = async (user, durationMinutes = 30) => {
  user.accountLockedUntil = new Date(Date.now() + durationMinutes * 60 * 1000);
  await user.save();
  return user;
};

/**
 * Unlock account manually
 * @param {Object} user - User document
 * @returns {Promise<Object>} Updated user
 */
export const unlockAccount = async (user) => {
  user.failedLoginAttempts = 0;
  user.accountLockedUntil = undefined;
  await user.save();
  return user;
};

/**
 * Check password history to prevent reuse
 * @param {string} newPassword - New password (plain text)
 * @param {Array} passwordHistory - Array of hashed passwords
 * @param {Object} bcrypt - bcrypt instance
 * @returns {Promise<boolean>} True if password was used before
 */
export const isPasswordInHistory = async (newPassword, passwordHistory, bcrypt) => {
  if (!passwordHistory || passwordHistory.length === 0) {
    return false;
  }
  
  for (const historyEntry of passwordHistory) {
    const isMatch = await bcrypt.compare(newPassword, historyEntry.password);
    if (isMatch) {
      return true;
    }
  }
  
  return false;
};

/**
 * Add password to history
 * @param {Object} user - User document
 * @param {string} hashedPassword - Hashed password
 * @param {number} maxHistory - Maximum number of passwords to keep (default 5)
 * @returns {Promise<Object>} Updated user
 */
export const addPasswordToHistory = async (user, hashedPassword, maxHistory = 5) => {
  if (!user.passwordHistory) {
    user.passwordHistory = [];
  }
  
  // Add new password to history
  user.passwordHistory.unshift({
    password: hashedPassword,
    changedAt: new Date(),
  });
  
  // Keep only the last N passwords
  if (user.passwordHistory.length > maxHistory) {
    user.passwordHistory = user.passwordHistory.slice(0, maxHistory);
  }
  
  // Update password changed date
  user.passwordChangedAt = new Date();
  
  // Set password expiry (90 days from now)
  user.passwordExpiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
  
  await user.save();
  return user;
};

/**
 * Check if password has expired
 * @param {Object} user - User document
 * @returns {boolean} True if password has expired
 */
export const isPasswordExpired = (user) => {
  if (!user.passwordExpiresAt) {
    return false;
  }
  
  return new Date() > user.passwordExpiresAt;
};

/**
 * Get days until password expires
 * @param {Object} user - User document
 * @returns {number} Days until expiry, or -1 if expired, or null if no expiry set
 */
export const getDaysUntilPasswordExpiry = (user) => {
  if (!user.passwordExpiresAt) {
    return null;
  }
  
  const now = new Date();
  const expiryDate = new Date(user.passwordExpiresAt);
  
  if (now > expiryDate) {
    return -1; // Already expired
  }
  
  const diffMs = expiryDate - now;
  const diffDays = Math.ceil(diffMs / (24 * 60 * 60 * 1000));
  
  return diffDays;
};
