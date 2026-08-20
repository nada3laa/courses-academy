export const currencyCodeOf = (source, fallback = "EGP") =>
  source?.currency ||
  source?.order?.currency ||
  source?.subscriptionOrder?.currency ||
  fallback;

export const exchangeRateOf = (source) => {
  const rate = Number(
    source?.exchangeRate ??
      source?.order?.exchangeRate ??
      source?.subscriptionOrder?.exchangeRate,
  );
  return Number.isFinite(rate) && rate > 0 ? rate : null;
};

export const formatMoney = (value, currency = "EGP") =>
  `${Number(value || 0).toLocaleString("ar-EG", {
    maximumFractionDigits: 2,
  })} ${currency}`;

export const formatEgpEquivalent = (value, source) => {
  const currency = currencyCodeOf(source);
  const rate = currency === "EGP" ? 1 : exchangeRateOf(source);
  if (rate == null) return null;

  return `${Number(Number(value || 0) * rate).toLocaleString("ar-EG", {
    maximumFractionDigits: 2,
  })} ج.م`;
};
