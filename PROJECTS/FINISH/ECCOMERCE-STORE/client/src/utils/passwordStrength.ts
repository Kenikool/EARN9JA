export interface PasswordStrength {
  score: number; // 0-4
  label: string; // 'Weak', 'Fair', 'Good', 'Strong'
  color: string; // Tailwind color class
  percentage: number; // 0-100
}

export function calculatePasswordStrength(password: string): PasswordStrength {
  let score = 0;
  
  if (!password) {
    return { score: 0, label: 'Too short', color: 'error', percentage: 0 };
  }

  // Length check
  if (password.length >= 6) score++;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;

  // Character variety checks
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++; // Mixed case
  if (/\d/.test(password)) score++; // Numbers
  if (/[^a-zA-Z\d]/.test(password)) score++; // Special characters

  // Normalize score to 0-4
  const normalizedScore = Math.min(Math.floor(score / 1.5), 4);

  const strengthMap: Record<number, { label: string; color: string }> = {
    0: { label: 'Too short', color: 'error' },
    1: { label: 'Weak', color: 'error' },
    2: { label: 'Fair', color: 'warning' },
    3: { label: 'Good', color: 'info' },
    4: { label: 'Strong', color: 'success' },
  };

  const { label, color } = strengthMap[normalizedScore];
  const percentage = (normalizedScore / 4) * 100;

  return { score: normalizedScore, label, color, percentage };
}
