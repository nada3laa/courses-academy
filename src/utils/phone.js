export const buildInternationalPhone = (phoneCode, phone) => {
  const localPhone = String(phone || "").trim().replace(/[^\d+]/g, "");

  if (!localPhone) return "";
  if (localPhone.startsWith("+")) return localPhone;

  const normalizedCode = String(phoneCode || "").trim();
  if (!normalizedCode) return localPhone;

  // الصفر الأول خاص بالاتصال المحلي ولا يُرسل بعد إضافة كود الدولة.
  return `${normalizedCode}${localPhone.replace(/^0+/, "")}`;
};

const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";
const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

export const normalizePhoneSearch = (value) =>
  String(value || "")
    .replace(/[٠-٩]/g, (digit) => String(ARABIC_DIGITS.indexOf(digit)))
    .replace(/[۰-۹]/g, (digit) => String(PERSIAN_DIGITS.indexOf(digit)))
    .replace(/\D/g, "");
