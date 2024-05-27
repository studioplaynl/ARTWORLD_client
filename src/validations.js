/* eslint-disable max-len */

/** Check if email is valid */
export function isValidEmail(val) {
  const regex =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return regex.test(String(val).toLowerCase());
}

/** Check if password is between 8-24 characters long */
export function isValidPassword(val) {
  const regex = /^[^]{8,24}$/g;
  return regex.test(val);
}

/** Check if string has no special characters (except a-z A-Z 0-9) */
export function hasSpecialCharacter(val) {
  const regex = /^[a-zA-Z0-9]+$/g;
  return !regex.test(val);
}

/** Remove special characters from string (except a-z A-Z 0-9) */
export function removeSpecialCharacters(str) {
  return str.replace(/[^a-zA-Z0-9]/g, '');
}

/** Check for valid phone number? Let's trust users to input something valid due to inpredictable formatting.. */
export function isValidPhone(val) {
  const regex = /.*/g;
  return regex.test(val);
}

export function isEmpty(val) {
  return val.trim().length === 0;
}

export function isEqual(val1, val2) {
  return val1 === val2;
}

/** Check if URL is valid */
export function isValidUrl(val) {
  return /^(ftp|http|https):\/\/[^ "]+$/.test(val);
}
