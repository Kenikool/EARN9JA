export const validateEmail = (email: string): string | null => {
  if (!email) {
    return "Email is required";
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Invalid email format";
  }
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password) {
    return "Password is required";
  }
  if (password.length < 6) {
    return "Password must be at least 6 characters";
  }
  return null;
};

export const validatePhoneNumber = (phone: string): string | null => {
  if (!phone) {
    return "Phone number is required";
  }
  const phoneRegex = /^[0-9]{11}$/;
  if (!phoneRegex.test(phone)) {
    return "Phone number must be 11 digits";
  }
  return null;
};

export const validateRequired = (
  value: string,
  fieldName: string
): string | null => {
  if (!value || value.trim() === "") {
    return `${fieldName} is required`;
  }
  return null;
};

export const validateOTP = (otp: string): string | null => {
  if (!otp) {
    return "OTP is required";
  }
  if (otp.length !== 6) {
    return "OTP must be 6 digits";
  }
  if (!/^\d+$/.test(otp)) {
    return "OTP must contain only numbers";
  }
  return null;
};
