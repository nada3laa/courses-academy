const digits = (value) => String(value || "").replace(/\D/g, "");

const flagEmoji = (code) => {
  const normalized = String(code || "").trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(normalized)) return "";
  return [...normalized]
    .map((letter) => String.fromCodePoint(127397 + letter.charCodeAt(0)))
    .join("");
};

const dialCodeOf = (country) =>
  String(
    country?.phoneCode || country?.dialCode || country?.callingCode || "",
  ).replace(/[^\d]/g, "");

const countryIdOf = (country) =>
  typeof country === "string"
    ? country
    : country?.id || country?._id || country?.value || "";

const resolveCountry = ({ phone, country, countryCode, options }) => {
  const countryId = countryIdOf(country);
  const code =
    countryCode ||
    (typeof country === "object" ? country?.code || country?.countryCode : "");
  const explicit = options.find(
    (option) =>
      (countryId && String(option.id) === String(countryId)) ||
      (code && String(option.code || "").toUpperCase() === String(code).toUpperCase()),
  );
  if (explicit) return explicit;

  const phoneDigits = digits(phone);
  return [...options]
    .filter((option) => dialCodeOf(option))
    .sort((a, b) => dialCodeOf(b).length - dialCodeOf(a).length)
    .find((option) => phoneDigits.startsWith(dialCodeOf(option)));
};

export default function PhoneDisplay({ phone, country, countryCode, options = [] }) {
  if (!phone) return "—";

  const matchedCountry = resolveCountry({ phone, country, countryCode, options });
  const dialCode = dialCodeOf(matchedCountry);
  const phoneDigits = digits(phone);
  const localNumber = dialCode && phoneDigits.startsWith(dialCode)
    ? phoneDigits.slice(dialCode.length)
    : phoneDigits;
  const flag = flagEmoji(matchedCountry?.code || matchedCountry?.countryCode);

  if (!dialCode) {
    return <span dir="ltr" className="inline-block whitespace-nowrap">{phone}</span>;
  }

  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap" dir="ltr">
      {matchedCountry?.flagUrl ? (
        <img src={matchedCountry.flagUrl} alt="" className="h-4 w-6 rounded-sm object-cover" />
      ) : (
        flag && <span aria-hidden="true">{flag}</span>
      )}
      <span>(+{dialCode})</span>
      <span>{localNumber}</span>
    </span>
  );
}
