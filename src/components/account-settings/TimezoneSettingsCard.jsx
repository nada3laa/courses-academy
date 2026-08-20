import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Loader2, Pencil } from "lucide-react";
import toast from "react-hot-toast";
import {
  getUserTimezones,
  updateMyTimezone,
} from "../../services/APIService";

const FALLBACK_TIMEZONES = [
  {
    country: "Egypt",
    countryCode: "EG",
    timezone: "Africa/Cairo",
    label: "Egypt - Cairo",
  },
  {
    country: "Saudi Arabia",
    countryCode: "SA",
    timezone: "Asia/Riyadh",
    label: "Saudi Arabia - Riyadh",
  },
  {
    country: "Kuwait",
    countryCode: "KW",
    timezone: "Asia/Kuwait",
    label: "Kuwait",
  },
  {
    country: "Qatar",
    countryCode: "QA",
    timezone: "Asia/Qatar",
    label: "Qatar",
  },
  {
    country: "Bahrain",
    countryCode: "BH",
    timezone: "Asia/Bahrain",
    label: "Bahrain",
  },
  {
    country: "United Arab Emirates",
    countryCode: "AE",
    timezone: "Asia/Dubai",
    label: "United Arab Emirates - Dubai",
  },
];

const normalizeTimezones = (resData) => {
  const raw = resData?.data?.data || resData?.data || resData || [];
  return Array.isArray(raw)
    ? raw
        .filter((item) => item?.timezone)
        .map((item) => ({
          id: item.timezone,
          label: item.label || item.timezone,
          country: item.country || "",
          countryCode: item.countryCode || "",
        }))
    : [];
};

const extractTimezone = (resData) => {
  const root = resData?.data || resData || {};
  return (
    root.timezone ||
    root.user?.timezone ||
    root.data?.timezone ||
    root.data?.user?.timezone ||
    ""
  );
};

const TimezoneDropdown = ({
  value,
  options,
  onChange,
  loading,
  disabled,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = options.find((option) => option.id === value);
  const isDisabled = disabled || loading;

  useEffect(() => {
    const handler = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <label className="block text-xs text-(--text-light) mb-1.5">
        المنطقة الزمنية
      </label>
      <button
        type="button"
        onClick={() => !isDisabled && setOpen((current) => !current)}
        disabled={isDisabled}
        className={`w-full h-11 px-3.5 rounded-lg border border-(--border-light) bg-(--bg-section) text-sm text-right flex items-center justify-between transition-colors ${
          isDisabled
            ? "opacity-60 cursor-not-allowed"
            : "cursor-pointer hover:border-(--primary)"
        }`}
      >
        <span className={selected ? "text-(--text-dark)" : "text-(--text-light)"}>
          {loading ? "جاري التحميل..." : selected?.label || "اختر المنطقة الزمنية"}
        </span>
        {loading ? (
          <Loader2 size={14} className="animate-spin text-(--text-light)" />
        ) : (
          <ChevronDown
            size={16}
            className={`text-(--text-light) transition-transform shrink-0 ${open ? "rotate-180" : ""}`}
          />
        )}
      </button>
      {open && !isDisabled && (
        <ul className="absolute z-20 top-full right-0 left-0 mt-1 max-h-56 overflow-y-auto bg-(--white) border border-(--border-light) rounded-lg shadow-lg">
          {options.map((option) => (
            <li
              key={option.id}
              onClick={() => {
                onChange(option.id);
                setOpen(false);
              }}
              className="px-3.5 py-2.5 text-sm cursor-pointer hover:bg-(--bg-section) text-(--text-dark)"
            >
              <span className="block">{option.label}</span>
              <span className="block text-xs text-(--text-light)" dir="ltr">
                {option.id}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const TimezoneSettingsCard = ({ timezone, onUpdated }) => {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [error, setError] = useState("");
  const [selectedTimezone, setSelectedTimezone] = useState(timezone || "");
  const [options, setOptions] = useState(
    normalizeTimezones({ data: FALLBACK_TIMEZONES }),
  );

  useEffect(() => {
    getUserTimezones()
      .then((res) => {
        const list = normalizeTimezones(res.data);
        if (list.length) setOptions(list);
      })
      .catch(() => {
        toast.error("تعذر تحميل المناطق الزمنية");
      })
      .finally(() => setLoadingOptions(false));
  }, []);

  const selectedLabel = useMemo(() => {
    if (!timezone) return "—";
    return options.find((option) => option.id === timezone)?.label || timezone;
  }, [options, timezone]);

  const handleCancel = () => {
    setSelectedTimezone(timezone || "");
    setError("");
    setEditing(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!selectedTimezone) {
      setError("اختر المنطقة الزمنية");
      return;
    }

    setSaving(true);
    try {
      const res = await updateMyTimezone({ timezone: selectedTimezone });
      const updatedTimezone = extractTimezone(res.data) || selectedTimezone;
      toast.success("تم تحديث المنطقة الزمنية بنجاح");
      onUpdated?.({ timezone: updatedTimezone });
      setEditing(false);
    } catch (err) {
      setError(
        err.response?.data?.message || "حدث خطأ أثناء تحديث المنطقة الزمنية",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-(--white) border border-(--border-light) rounded-2xl shadow-(--shadow) p-6"
    >
      <div className="mb-4">
        <div className="flex items-center justify-between gap-3 mb-2">
          <h3 className="text-[16px] font-bold text-(--text-dark)">
            المنطقة الزمنية
          </h3>
          {!editing && (
            <button
              type="button"
              onClick={() => {
                setSelectedTimezone(timezone || "");
                setEditing(true);
              }}
              className="flex items-center gap-1.5 text-[14px] font-medium text-(--primary) hover:text-(--primary-dark) transition-colors shrink-0"
            >
              <Pencil size={14} />
              تعديل البيانات
            </button>
          )}
        </div>
        <p className="text-xs sm:text-sm text-(--text-light)">
          يتم عرض مواعيد الحصص والجداول حسب المنطقة الزمنية المختارة.
        </p>
      </div>

      {!editing ? (
        <div className="border border-x-4 border-[#123C9180] rounded-xl p-5 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
          <div className="flex flex-col gap-1.5 min-w-0">
            <span className="text-[14px] mb-1 text-(--text-light)">
              المنطقة الزمنية
            </span>
            <span className="text-sm font-semibold text-(--text-dark) wrap-break-word">
              {selectedLabel}
            </span>
          </div>
          <div className="flex flex-col gap-1.5 min-w-0">
            <span className="text-[14px] mb-1 text-(--text-light)">
              البلد والمدينة
            </span>
            <span
              className="text-sm font-semibold text-(--text-dark) wrap-break-word"
              dir="ltr"
            >
              {timezone || "—"}
            </span>
          </div>
        </div>
      ) : (
        <div className="border border-x-4 border-[#123C9180] rounded-xl p-5 grid grid-cols-1 gap-5">
          <TimezoneDropdown
            value={selectedTimezone}
            options={options}
            onChange={setSelectedTimezone}
            loading={loadingOptions}
            disabled={saving}
          />
        </div>
      )}

      {editing && (
        <>
          {error && <p className="text-sm text-red-500 mt-3">{error}</p>}
          <div className="flex items-center gap-3 mt-5">
            <button
              type="submit"
              disabled={saving || loadingOptions}
              className="px-5 py-2.5 rounded-lg bg-(--primary) text-white text-sm font-medium hover:bg-(--primary-dark) transition-colors flex items-center gap-2 disabled:opacity-60"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              حفظ المنطقة الزمنية
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="px-5 py-2.5 rounded-lg border border-(--border-light) text-(--text-dark) text-sm font-medium hover:bg-(--bg-section) transition-colors disabled:opacity-60"
            >
              إلغاء
            </button>
          </div>
        </>
      )}
    </form>
  );
};

export default TimezoneSettingsCard;
