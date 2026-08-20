const CURRENCY_META = {
  EGP: { flag: "🇪🇬", symbol: "ج.م" },
  USD: { flag: "🇺🇸", symbol: "$" },
  SAR: { flag: "🇸🇦", symbol: "ر.س" },
  AED: { flag: "🇦🇪", symbol: "د.إ" },
  KWD: { flag: "🇰🇼", symbol: "د.ك" },
};

const CurrencySelector = ({
  currencies,
  value,
  onChange,
  disabled = false,
}) => (
  <div className="mt-6">
    <p className="mb-3 text-sm font-semibold text-[#1F2937]">اختر عملة الدفع</p>
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {currencies.map((option) => {
        const meta = CURRENCY_META[option.currency] || {};
        return (
          <button
            key={option.currency}
            type="button"
            disabled={disabled}
            onClick={() => onChange(option.currency)}
            aria-pressed={value === option.currency}
            className={`flex min-h-24 flex-col items-center justify-center rounded-xl border p-3 text-center transition-colors disabled:cursor-default ${
              value === option.currency
                ? "border-[#123C91] bg-blue-50 ring-2 ring-[#123C91]/10"
                : "border-gray-200 bg-white hover:border-[#123C91]/50"
            }`}
          >
            <span className="text-2xl" aria-hidden="true">
              {option.country?.flag || meta.flag || "💱"}
            </span>
            <span className="mt-1 text-sm font-semibold text-[#1F2937]">
              {option.currency}
            </span>
            <span className="text-xs text-gray-500">
              {meta.symbol || option.currency} ·{" "}
              {option.name || option.currency}
            </span>
          </button>
        );
      })}
    </div>
  </div>
);

export default CurrencySelector;
