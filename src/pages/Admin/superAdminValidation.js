const NAME_PATTERN = /^[A-Za-z\s]+$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateRequiredText(value, fieldName) {
  const trimmedValue = (value ?? "").trim();

  if (!trimmedValue) {
    return { isValid: false, message: `${fieldName} is required.` };
  }

  return { isValid: true, message: "" };
}

function validateAlphaName(value, fieldName) {
  const trimmedValue = (value ?? "").trim();

  if (!trimmedValue) {
    return { isValid: false, message: `${fieldName} is required.` };
  }

  if (!NAME_PATTERN.test(trimmedValue)) {
    return {
      isValid: false,
      message: `${fieldName} must contain only alphabets and spaces.`,
    };
  }

  return { isValid: true, message: "" };
}

export function validateSuperAdminForm({
  name,
  employeeId,
  designation,
  email,
  phoneNumber,
  password,
  address,
}) {
  const nameCheck = validateAlphaName(name, "Name");
  if (!nameCheck.isValid) return nameCheck;

  if (employeeId === "" || employeeId === null || employeeId === undefined) {
    return { isValid: false, message: "Employee ID is required." };
  }

  if (Number(employeeId) <= 0) {
    return { isValid: false, message: "Employee ID must be greater than 0." };
  }

  const designationCheck = validateRequiredText(designation, "Designation");
  if (!designationCheck.isValid) return designationCheck;

  const emailCheck = validateRequiredText(email, "Email");
  if (!emailCheck.isValid) return emailCheck;

  if (!EMAIL_PATTERN.test((email ?? "").trim())) {
    return { isValid: false, message: "Please enter a valid email address." };
  }

  const cleanedPhoneNumber = String(phoneNumber ?? "").replace(/\D/g, "");
  if (cleanedPhoneNumber.length !== 10) {
    return {
      isValid: false,
      message: "Phone number must contain exactly 10 digits.",
    };
  }

  const passwordCheck = validateRequiredText(password, "Password");
  if (!passwordCheck.isValid) return passwordCheck;

  const addressCheck = validateRequiredText(address, "Address");
  if (!addressCheck.isValid) return addressCheck;

  return { isValid: true, message: "" };
}

export function validateBranchAdminForm({
  name,
  employeeId,
  designation,
  collegeId,
  branchId,
  email,
  phoneNumber,
  password,
  address,
}) {
  const nameCheck = validateAlphaName(name, "Name");
  if (!nameCheck.isValid) return nameCheck;

  if (employeeId === "" || employeeId === null || employeeId === undefined) {
    return { isValid: false, message: "Employee ID is required." };
  }

  if (Number(employeeId) <= 0) {
    return { isValid: false, message: "Employee ID must be greater than 0." };
  }

  const designationCheck = validateRequiredText(designation, "Designation");
  if (!designationCheck.isValid) return designationCheck;

  if (!collegeId) {
    return { isValid: false, message: "College is required." };
  }

  if (!branchId) {
    return { isValid: false, message: "Branch is required." };
  }

  const emailCheck = validateRequiredText(email, "Email");
  if (!emailCheck.isValid) return emailCheck;

  if (!EMAIL_PATTERN.test((email ?? "").trim())) {
    return { isValid: false, message: "Please enter a valid email address." };
  }

  const cleanedPhoneNumber = String(phoneNumber ?? "").replace(/\D/g, "");
  if (cleanedPhoneNumber.length !== 10) {
    return {
      isValid: false,
      message: "Phone number must contain exactly 10 digits.",
    };
  }

  const passwordCheck = validateRequiredText(password, "Password");
  if (!passwordCheck.isValid) return passwordCheck;

  const addressCheck = validateRequiredText(address, "Address");
  if (!addressCheck.isValid) return addressCheck;

  return { isValid: true, message: "" };
}

export function validateStudentForm({
  name,
  studentCode,
  collegeId,
  branchId,
  sectionId,
  guardianName,
  guardianPhoneNumber,
  email,
  phoneNumber,
  password,
  address,
}) {
  const nameCheck = validateAlphaName(name, "Name");
  if (!nameCheck.isValid) return nameCheck;

  if (studentCode === "" || studentCode === null || studentCode === undefined) {
    return { isValid: false, message: "Student code is required." };
  }

  if (Number(studentCode) <= 0) {
    return { isValid: false, message: "Student code must be greater than 0." };
  }

  if (!collegeId) {
    return { isValid: false, message: "College is required." };
  }

  if (!branchId) {
    return { isValid: false, message: "Branch is required." };
  }

  if (!sectionId) {
    return { isValid: false, message: "Section is required." };
  }

  const guardianNameCheck = validateAlphaName(guardianName, "Guardian name");
  if (!guardianNameCheck.isValid) return guardianNameCheck;

  const cleanedGuardianPhone = String(guardianPhoneNumber ?? "").replace(
    /\D/g,
    "",
  );
  if (cleanedGuardianPhone.length !== 10) {
    return {
      isValid: false,
      message: "Guardian phone number must contain exactly 10 digits.",
    };
  }

  const emailCheck = validateRequiredText(email, "Email");
  if (!emailCheck.isValid) return emailCheck;

  if (!EMAIL_PATTERN.test((email ?? "").trim())) {
    return { isValid: false, message: "Please enter a valid email address." };
  }

  const cleanedPhoneNumber = String(phoneNumber ?? "").replace(/\D/g, "");
  if (cleanedPhoneNumber.length !== 10) {
    return {
      isValid: false,
      message: "Phone number must contain exactly 10 digits.",
    };
  }

  const passwordCheck = validateRequiredText(password, "Password");
  if (!passwordCheck.isValid) return passwordCheck;

  const addressCheck = validateRequiredText(address, "Address");
  if (!addressCheck.isValid) return addressCheck;

  return { isValid: true, message: "" };
}
