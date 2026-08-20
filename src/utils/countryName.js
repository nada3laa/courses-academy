export const getArabicCountryName = (country) => {
  if (!country) return "";
  if (typeof country === "string") return country;
  return (
    country.nameAr ||
    country.arabicName ||
    country.name?.ar ||
    (typeof country.name === "string" ? country.name : "") ||
    country.name?.en ||
    country.englishName ||
    ""
  );
};

export const countryOption = (country) => ({
  id: country.id || country._id,
  code: country.code || country.countryCode,
  phoneCode: country.phoneCode || country.dialCode || country.callingCode,
  flagUrl: country.flagUrl || country.flag,
  label: getArabicCountryName(country),
});

export const getCountryId = (country) => {
  if (!country) return "";
  if (typeof country === "string") return country;
  return country.id || country._id || country.value || "";
};

export const resolveCountryLabel = ({
  country,
  countryCode,
  options = [],
}) => {
  const populatedName = getArabicCountryName(country);
  if (populatedName && typeof country === "object") return populatedName;

  const countryId = getCountryId(country);
  const normalizedCode =
    countryCode ||
    (typeof country === "object"
      ? country.code || country.countryCode
      : "");
  const match = options.find(
    (option) =>
      (countryId && String(option.id) === String(countryId)) ||
      (normalizedCode &&
        String(option.code || "").toUpperCase() ===
          String(normalizedCode).toUpperCase()),
  );

  return match?.label || match?.name || populatedName || "";
};
