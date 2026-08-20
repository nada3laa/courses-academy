import { useEffect, useState } from "react";
import { Loader2, Plus, Save } from "lucide-react";
import toast from "react-hot-toast";
import {
  createExchangeRate,
  getCountries,
  getExchangeRates,
  updateExchangeRate,
} from "../../../services/APIService";

const CURRENCY_NAMES = {
  EGP: "الجنيه المصري",
  USD: "الدولار الأمريكي",
  SAR: "الريال السعودي",
  AED: "الدرهم الإماراتي",
  KWD: "الدينار الكويتي",
};
const CURRENCY_FLAGS = {
  EGP: "🇪🇬",
  USD: "🇺🇸",
  SAR: "🇸🇦",
  AED: "🇦🇪",
  KWD: "🇰🇼",
};

const ExchangeRatesSettings = () => {
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState("");
  const [newCurrency, setNewCurrency] = useState("");
  const [newName, setNewName] = useState("");
  const [newRate, setNewRate] = useState("");
  const [newCountry, setNewCountry] = useState("");
  const [countries, setCountries] = useState([]);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([getExchangeRates(), getCountries()])
      .then(([ratesResponse, countriesResponse]) => {
        if (!active) return;
        setRates(ratesResponse.data?.data || []);
        setCountries(countriesResponse.data?.data || []);
      })
      .catch((error) =>
        toast.error(error.response?.data?.message || "تعذر تحميل أسعار الصرف"),
      )
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const changeField = (currency, field, value) => {
    setRates((current) =>
      current.map((rate) =>
        rate.currency === currency ? { ...rate, [field]: value } : rate,
      ),
    );
  };

  const save = async (rate) => {
    const value = Number(rate.egpPerUnit);
    if (!(value > 0)) return toast.error("أدخل سعر صرف صالحًا");
    setSaving(rate.currency);
    try {
      const country =
        typeof rate.country === "object"
          ? rate.country.id || rate.country._id
          : rate.country;
      const response = await updateExchangeRate(rate.currency, {
        name: rate.name,
        egpPerUnit: value,
        country,
      });
      const updated = response.data?.data;
      if (updated)
        setRates((current) =>
          current.map((item) =>
            item.currency === rate.currency ? { ...item, ...updated } : item,
          ),
        );
      toast.success(`تم تحديث سعر ${rate.currency}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "تعذر تحديث سعر الصرف");
    } finally {
      setSaving("");
    }
  };

  const addCurrency = async (event) => {
    event.preventDefault();
    const currency = newCurrency.trim().toUpperCase();
    const name = newName.trim();
    const egpPerUnit = Number(newRate);
    if (!name) return toast.error("أدخل اسم العملة");
    if (!/^[A-Z]{3}$/.test(currency))
      return toast.error("أدخل كود عملة ISO مكونًا من 3 حروف");
    if (!(egpPerUnit > 0)) return toast.error("أدخل سعر صرف صالحًا");
    if (!newCountry) return toast.error("اختر الدولة المرتبطة بالعملة");
    setAdding(true);
    try {
      const response = await createExchangeRate({
        name,
        currency,
        egpPerUnit,
        country: newCountry,
      });
      const created = response.data?.data || {
        name,
        currency,
        egpPerUnit,
        country: newCountry,
      };
      setRates((current) => [...current, created]);
      setNewCurrency("");
      setNewName("");
      setNewRate("");
      setNewCountry("");
      toast.success(`تمت إضافة عملة ${currency}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "تعذر إضافة العملة");
    } finally {
      setAdding(false);
    }
  };

  return (
    <section className="rounded-2xl border border-[#E5E5E5] bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-lg font-bold text-[#123C91]">إدارة أسعار الصرف</h2>
      <p className="mt-1 text-sm text-[#6B7280]">
        قيمة وحدة واحدة من العملة بالجنيه المصري.
      </p>
      <form
        onSubmit={addCurrency}
        className="mt-5 grid gap-3 rounded-xl border border-dashed border-[#B8C8E8] bg-[#F8FAFF] p-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <label className="text-sm font-medium text-[#374151]">
          اسم العملة
          <input
            type="text"
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            placeholder="US Dollar"
            className="mt-2 h-11 w-full rounded-lg border border-gray-200 px-3 outline-none focus:border-[#123C91]"
          />
        </label>
        <label className="text-sm font-medium text-[#374151]">
          كود العملة
          <input
            type="text"
            maxLength={3}
            value={newCurrency}
            onChange={(event) =>
              setNewCurrency(event.target.value.toUpperCase())
            }
            placeholder="KWD"
            className="mt-2 h-11 w-full rounded-lg border border-gray-200 px-3 uppercase outline-none focus:border-[#123C91]"
            dir="ltr"
          />
        </label>
        <label className="text-sm font-medium text-[#374151]">
          قيمتها بالجنيه المصري
          <input
            type="number"
            min="0.0001"
            step="0.0001"
            value={newRate}
            onChange={(event) => setNewRate(event.target.value)}
            placeholder="160"
            className="mt-2 h-11 w-full rounded-lg border border-gray-200 px-3 outline-none focus:border-[#123C91]"
          />
        </label>
        <label className="text-sm font-medium text-[#374151]">
          الدولة
          <select
            value={newCountry}
            onChange={(event) => setNewCountry(event.target.value)}
            className="mt-2 h-11 w-full rounded-lg border border-gray-200 bg-white px-3 outline-none focus:border-[#123C91]"
          >
            <option value="">اختر الدولة</option>
            {countries.map((country) => (
              <option
                key={country.id || country._id}
                value={country.id || country._id}
              >
                {country.flag}{" "}
                {country.nativeName ||
                  country.name?.ar ||
                  country.name?.en ||
                  country.name}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          disabled={adding}
          className="mt-auto flex h-11 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 text-sm font-medium !text-white disabled:opacity-60 lg:col-start-4"
        >
          {adding ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Plus size={16} />
          )}
          إضافة العملة
        </button>
      </form>
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin text-[#123C91]" />
        </div>
      ) : (
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {rates.map((rate) => {
            const base = rate.isBaseCurrency || rate.currency === "EGP";
            return (
              <div
                key={rate.currency}
                className="rounded-xl border border-gray-200 p-4"
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-[#1F2937]">
                      <span className="ml-2" aria-hidden="true">
                        {rate.country?.flag ||
                          CURRENCY_FLAGS[rate.currency] ||
                          "💱"}
                      </span>
                      {rate.name ||
                        CURRENCY_NAMES[rate.currency] ||
                        rate.currency}
                    </p>
                    <p className="text-xs text-gray-500">{rate.currency}</p>
                  </div>
                  {base && (
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-[#123C91]">
                      العملة الأساسية
                    </span>
                  )}
                </div>
                {!base && (
                  <div className="mb-3 grid gap-2 sm:grid-cols-2">
                    <input
                      type="text"
                      value={rate.name || ""}
                      onChange={(event) =>
                        changeField(rate.currency, "name", event.target.value)
                      }
                      className="h-11 rounded-lg border border-gray-200 px-3 outline-none focus:border-[#123C91]"
                      placeholder="اسم العملة"
                    />
                    <select
                      value={
                        typeof rate.country === "object"
                          ? rate.country.id || rate.country._id || ""
                          : rate.country || ""
                      }
                      onChange={(event) =>
                        changeField(
                          rate.currency,
                          "country",
                          event.target.value,
                        )
                      }
                      className="h-11 rounded-lg border border-gray-200 bg-white px-3 outline-none focus:border-[#123C91]"
                    >
                      <option value="">اختر الدولة</option>
                      {countries.map((country) => (
                        <option
                          key={country.id || country._id}
                          value={country.id || country._id}
                        >
                          {country.flag}{" "}
                          {country.nativeName ||
                            country.name?.ar ||
                            country.name?.en ||
                            country.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0.0001"
                    step="0.0001"
                    disabled={base}
                    value={rate.egpPerUnit}
                    onChange={(event) =>
                      changeField(
                        rate.currency,
                        "egpPerUnit",
                        event.target.value,
                      )
                    }
                    className="h-11 min-w-0 flex-1 rounded-lg border border-gray-200 px-3 outline-none focus:border-[#123C91] disabled:bg-gray-100"
                  />
                  {!base && (
                    <button
                      type="button"
                      disabled={saving === rate.currency}
                      onClick={() => save(rate)}
                      className="flex h-11 items-center gap-2 rounded-lg bg-[#123C91] px-4 text-sm font-medium !text-white disabled:opacity-60"
                    >
                      {saving === rate.currency ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Save size={16} />
                      )}
                      حفظ
                    </button>
                  )}
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  {rate.egpPerUnit
                    ? `1 ${rate.currency} = ${rate.egpPerUnit} EGP`
                    : "سعر الصرف غير محدد بعد"}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default ExchangeRatesSettings;
