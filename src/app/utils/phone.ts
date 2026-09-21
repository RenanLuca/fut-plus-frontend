const MAX_PHONE_DIGITS = 11;

export function onlyPhoneDigits(value: string) {
  return value.replace(/\D/g, "").slice(0, MAX_PHONE_DIGITS);
}

export function formatPhone(digits: string) {
  if (digits.length === 0) return "";
  if (digits.length <= 2) return `(${digits}`;

  const areaCode = digits.slice(0, 2);
  const number = digits.slice(2);
  const prefixLength = digits.length > 10 ? 5 : 4;

  return number.length > prefixLength
    ? `(${areaCode}) ${number.slice(0, prefixLength)}-${number.slice(prefixLength)}`
    : `(${areaCode}) ${number}`;
}
