import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  Banknote,
  Eye,
  Inbox,
  Loader2,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import AdminLayout from "../../../components/admin/layout/AdminLayout";
import EntityProfileModal from "../../../components/admin/users/EntityProfileModal";
import Breadcrumbs from "../../shared/Breadcrumbs";
import {
  cancelTeacherSalary,
  getTeacherSalaries,
  getTeacherSalariesSummary,
  getTeacherSalary,
  getTeacher,
  payTeacherSalary,
  previewTeacherSalary,
} from "../../../services/APIService";

const LIMIT = 20;
const current = new Date();
const money = (value) => `${Number(value || 0).toLocaleString("ar-EG")} ج.م`;
const date = (value) =>
  value
    ? new Date(value).toLocaleString("ar-EG", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "—";
const teacherName = (teacher) =>
  teacher?.user?.fullName || teacher?.fullName || "—";
const isApprovedTeacher = (teacher) => {
  const status = String(
    teacher?.status ||
      teacher?.registrationStatus ||
      teacher?.user?.registrationStatus ||
      teacher?.user?.status ||
      "",
  ).toLowerCase();
  return status === "approved";
};
const paymentLabels = {
  cash: "نقدي",
  "bank-transfer": "تحويل بنكي",
  wallet: "محفظة",
  instapay: "إنستاباي",
  other: "أخرى",
};
const referenceFields = {
  instapay: {
    label: "رقم أو معرّف إنستاباي",
    placeholder: "مثال: 01000000000 أو username@instapay",
    required: true,
  },
  wallet: {
    label: "رقم المحفظة",
    placeholder: "أدخل رقم الهاتف المرتبط بالمحفظة",
    required: true,
  },
  "bank-transfer": {
    label: "رقم الحساب البنكي",
    placeholder: "أدخل رقم الحساب أو IBAN",
    required: true,
  },
  other: {
    label: "مرجع عملية الدفع",
    placeholder: "أدخل رقمًا أو وصفًا مرجعيًا (اختياري)",
    required: false,
  },
};
const statusLabels = { paid: "مصروف", cancelled: "ملغي" };
const errorMessage = (error, fallback) =>
  error.response?.data?.message || fallback;

const Modal = ({ title, onClose, children, wide = false }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/55 px-4 py-2 backdrop-blur-[2px] sm:px-8 sm:py-4"
    dir="rtl"
    onMouseDown={onClose}
  >
    <section
      className={`max-h-[calc(100vh-16px)] w-full overflow-y-auto rounded-[24px] border border-white/60 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.25)] sm:max-h-[calc(100vh-32px)] ${wide ? "max-w-2xl" : "max-w-xl"}`}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between border-b border-[#E8EEF6] px-6 py-3 sm:px-9">
        <h2 className="text-lg font-semibold text-[#123C91] sm:text-xl">
          {title}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="إغلاق"
          className="rounded-xl bg-[#F4F7FB] p-2 text-gray-500 transition hover:bg-red-50 hover:text-red-600"
        >
          <X size={20} />
        </button>
      </div>
      <div className="px-6 py-3 sm:px-9">{children}</div>
    </section>
  </div>
);

const Pagination = ({ meta, page, setPage }) => {
  const last = Math.max(meta?.last_page || 1, 1);
  if (last <= 1) return null;
  return (
    <div className="mt-5 flex items-center justify-center gap-3">
      <button
        disabled={page <= 1}
        onClick={() => setPage(page - 1)}
        className="rounded-lg border bg-white px-4 py-2 text-sm disabled:opacity-40"
      >
        السابق
      </button>
      <span className="text-sm text-gray-600">
        صفحة {page} من {last}
      </span>
      <button
        disabled={page >= last}
        onClick={() => setPage(page + 1)}
        className="rounded-lg border bg-white px-4 py-2 text-sm disabled:opacity-40"
      >
        التالي
      </button>
    </div>
  );
};

export default function TeacherSalariesPage() {
  const [tab, setTab] = useState("summary");
  const [month, setMonth] = useState(current.getMonth() + 1);
  const [year, setYear] = useState(current.getFullYear());
  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paying, setPaying] = useState(null);
  const [details, setDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [profileTeacher, setProfileTeacher] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response =
        tab === "summary"
          ? await getTeacherSalariesSummary({
              month,
              year,
              teacherStatus: "approved",
              page,
              limit: LIMIT,
            })
          : await getTeacherSalaries({
              month,
              year,
              teacherStatus: "approved",
              status: status || undefined,
              page,
              limit: LIMIT,
            });
      const salaries = response.data?.data || [];
      setItems(salaries.filter((item) => isApprovedTeacher(item.teacher)));
      setPagination(response.data?.pagination || null);
    } catch (e) {
      setError(errorMessage(e, "تعذر تحميل بيانات الرواتب"));
    } finally {
      setLoading(false);
    }
  }, [tab, month, year, page, status]);
  useEffect(() => {
    const timer = window.setTimeout(load, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const changeFilter =
    (setter, numeric = false) =>
    (event) => {
      setter(numeric ? Number(event.target.value) : event.target.value);
      setPage(1);
    };

  const openDetails = async (id) => {
    setDetailsLoading(true);
    setDetails({});
    try {
      const response = await getTeacherSalary(id);
      setDetails(response.data?.data);
    } catch (e) {
      toast.error(errorMessage(e, "تعذر تحميل التفاصيل"));
      setDetails(null);
    } finally {
      setDetailsLoading(false);
    }
  };

  const openTeacherProfile = async (teacher) => {
    setProfileTeacher(teacher);
    const teacherId = teacher?.id || teacher?._id;
    if (!teacherId) return;

    try {
      const response = await getTeacher(teacherId);
      const fullTeacher = response.data?.data ?? response.data;
      if (!fullTeacher || typeof fullTeacher !== "object") return;
      setProfileTeacher((current) => ({
        ...current,
        ...fullTeacher,
        user: {
          ...(current?.user || {}),
          ...(fullTeacher.user || {}),
        },
      }));
    } catch (error) {
      toast.error(errorMessage(error, "تعذر تحميل ملف المعلم الكامل"));
    }
  };

  const handleCancel = async () => {
    const reason = window.prompt("اكتب سبب إلغاء عملية الصرف");
    if (!reason?.trim()) return;
    try {
      await cancelTeacherSalary(details._id || details.id, reason.trim());
      toast.success("تم إلغاء عملية الصرف");
      setDetails(null);
      load();
    } catch (e) {
      toast.error(errorMessage(e, "تعذر إلغاء العملية"));
    }
  };

  const searchValue = search.trim().toLocaleLowerCase("ar");
  const filteredItems = searchValue
    ? items.filter((item) => {
        const user = item.teacher?.user || {};
        return [teacherName(item.teacher), user.email, user.phone]
          .filter(Boolean)
          .some((value) =>
            String(value).toLocaleLowerCase("ar").includes(searchValue),
          );
      })
    : items;

  return (
    <AdminLayout>
      <Breadcrumbs homeTo="/admin-dashboard" />
      <main className="mx-auto max-w-[1500px] px-2 py-3 sm:px-6" dir="rtl">
        <header className="mb-6 flex items-start justify-between gap-3 rounded-2xl bg-gradient-to-l from-[#123C91] to-[#1C58B7] p-5 text-white shadow-sm sm:p-6">
          <div>
            <h1 className="text-2xl font-semibold">رواتب المعلمين</h1>
            <p className="mt-1 text-sm text-blue-100">
              حساب الرواتب وتسجيل ومتابعة عمليات الصرف الشهرية.
            </p>
          </div>
          <button
            onClick={load}
            disabled={loading}
            aria-label="تحديث البيانات"
            className="rounded-xl border border-white/25 bg-white/10 p-2.5 text-white transition hover:bg-white/20"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
        </header>
        <div className="mb-5 inline-flex rounded-xl border border-[#DCE8F7] bg-white p-1 shadow-sm">
          <button
            onClick={() => {
              setTab("summary");
              setPage(1);
            }}
            className={`rounded-lg px-4 py-2.5 text-sm font-medium transition ${tab === "summary" ? "bg-[#123C91] text-white shadow-sm" : "text-gray-500 hover:bg-gray-50"}`}
          >
            ملخص الشهر
          </button>
          <button
            onClick={() => {
              setTab("history");
              setPage(1);
            }}
            className={`rounded-lg px-4 py-2.5 text-sm font-medium transition ${tab === "history" ? "bg-[#123C91] text-white shadow-sm" : "text-gray-500 hover:bg-gray-50"}`}
          >
            سجل عمليات الصرف
          </button>
        </div>
        <div className="mb-5 grid gap-4 rounded-2xl border border-[#DCE8F7] bg-white p-5 shadow-sm sm:grid-cols-2 xl:grid-cols-4">
          <label className="text-sm font-medium text-gray-600 xl:col-span-2">
            البحث عن معلم
            <div className="relative mt-1.5">
              <Search
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="الاسم، البريد الإلكتروني أو الهاتف"
                className="w-full rounded-xl border border-gray-200 bg-[#FAFCFF] py-2.5 pr-10 pl-3 text-gray-800 outline-none transition focus:border-[#123C91] focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </label>
          <label className="text-sm text-gray-600">
            الشهر
            <select
              value={month}
              onChange={changeFilter(setMonth, true)}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-gray-800"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(2026, i).toLocaleString("ar-EG", { month: "long" })}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm text-gray-600">
            السنة
            <input
              type="number"
              min="2000"
              value={year}
              onChange={changeFilter(setYear, true)}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-gray-800"
            />
          </label>
          {tab === "history" && (
            <label className="text-sm text-gray-600 xl:col-start-4">
              الحالة
              <select
                value={status}
                onChange={changeFilter(setStatus)}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-gray-800"
              >
                <option value="">الكل</option>
                <option value="paid">مصروف</option>
                <option value="cancelled">ملغي</option>
              </select>
            </label>
          )}
        </div>
        {loading ? (
          <div className="flex justify-center gap-2 py-20 text-gray-500">
            <Loader2 className="animate-spin" /> جاري التحميل...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-100 bg-white py-14 text-center text-red-600">
            <AlertCircle className="mx-auto mb-2" />
            {error}
            <br />
            <button onClick={load} className="mt-3 text-sm text-[#123C91]">
              إعادة المحاولة
            </button>
          </div>
        ) : !filteredItems.length ? (
          <div className="rounded-2xl border border-[#DCE8F7] bg-white py-16 text-center text-gray-500 shadow-sm">
            <Inbox className="mx-auto mb-2" />
            {searchValue
              ? "لا توجد نتائج مطابقة للبحث"
              : "لا توجد بيانات لهذه الفترة"}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-2xl border border-[#DCE8F7] bg-white shadow-sm">
              <table className="w-full min-w-[850px] text-right text-sm">
                <thead className="bg-[#F2F7FD] text-[#41546D]">
                  <tr>
                    <th className="p-4">المعلم</th>
                    {tab === "summary" ? (
                      <>
                        <th className="p-4">الحصص</th>
                        <th className="p-4">الساعات</th>
                        <th className="p-4">الراتب</th>
                        <th className="p-4">الحالة</th>
                        <th className="p-4">الإجراء</th>
                      </>
                    ) : (
                      <>
                        <th className="p-4">الشهر</th>
                        <th className="p-4">الساعات</th>
                        <th className="p-4">الإجمالي</th>
                        <th className="p-4">طريقة الدفع</th>
                        <th className="p-4">الحالة</th>
                        <th className="p-4">الإجراء</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEF2F7]">
                  {filteredItems.map((item) =>
                    tab === "summary" ? (
                      <tr
                        key={item.teacher?.id}
                        className="transition hover:bg-[#F8FBFF]"
                      >
                        <td className="p-4">
                          <button
                            type="button"
                            onClick={() => openTeacherProfile(item.teacher)}
                            className="text-right"
                          >
                            <strong className="text-[#123C91] hover:underline">
                              {teacherName(item.teacher)}
                            </strong>
                            <p className="mt-1 text-xs text-gray-500">
                              {item.teacher?.user?.email ||
                                item.teacher?.user?.phone ||
                                ""}
                            </p>
                          </button>
                        </td>
                        <td className="p-4">{item.totalSessions}</td>
                        <td className="p-4">{item.totalHours}</td>
                        <td className="p-4 font-semibold text-[#123C91]">
                          {item.salary?.isPaid
                            ? money(item.salary.totalSalary)
                            : "—"}
                        </td>
                        <td className="p-4">
                          <span
                            className={`rounded-full px-3 py-1.5 text-xs font-medium ${item.salary?.isPaid ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}
                          >
                            {item.salary?.isPaid ? "تم الصرف" : "غير مصروف"}
                          </span>
                        </td>
                        <td className="p-4">
                          {item.salary?.isPaid ? (
                            <button
                              onClick={() => openDetails(item.salary.id)}
                              className="rounded-lg border border-blue-100 p-2 text-[#123C91] transition hover:bg-blue-50"
                            >
                              <Eye size={18} />
                            </button>
                          ) : (
                            <button
                              onClick={() => setPaying(item)}
                              className="rounded-lg bg-[#123C91] px-4 py-2.5 text-xs font-medium text-white shadow-sm transition hover:bg-[#0D2F75]"
                            >
                              معاينة وصرف
                            </button>
                          )}
                        </td>
                      </tr>
                    ) : (
                      <tr
                        key={item._id || item.id}
                        className="transition hover:bg-[#F8FBFF]"
                      >
                        <td className="p-4">
                          <button
                            type="button"
                            onClick={() => openTeacherProfile(item.teacher)}
                            className="font-semibold text-[#123C91] hover:underline"
                          >
                            {teacherName(item.teacher)}
                          </button>
                        </td>
                        <td className="p-4">
                          {item.month}/{item.year}
                        </td>
                        <td className="p-4">{item.totalHours}</td>
                        <td className="p-4 font-semibold text-[#123C91]">
                          {money(item.totalSalary)}
                        </td>
                        <td className="p-4">
                          {paymentLabels[item.paymentMethod] || "—"}
                        </td>
                        <td className="p-4">
                          <span
                            className={`rounded-full px-3 py-1.5 text-xs ${item.status === "cancelled" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}
                          >
                            {statusLabels[item.status] || item.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => openDetails(item._id || item.id)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-blue-100 px-3 py-2 text-[#123C91] transition hover:bg-blue-50"
                          >
                            <Eye size={17} /> التفاصيل
                          </button>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
            <Pagination meta={pagination?.meta} page={page} setPage={setPage} />
          </>
        )}
        {paying && (
          <PayModal
            item={paying}
            month={month}
            year={year}
            onClose={() => setPaying(null)}
            onSuccess={() => {
              setPaying(null);
              load();
            }}
          />
        )}
        {details && (
          <Modal
            title="تفاصيل عملية الراتب"
            onClose={() => setDetails(null)}
            wide
          >
            {detailsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="animate-spin" />
              </div>
            ) : (
              <Details salary={details} onCancel={handleCancel} />
            )}
          </Modal>
        )}
        <EntityProfileModal
          entity={profileTeacher}
          role="teacher"
          onClose={() => setProfileTeacher(null)}
        />
      </main>
    </AdminLayout>
  );
}

function PayModal({ item, month, year, onClose, onSuccess }) {
  const [rate, setRate] = useState("");
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState("instapay");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const runPreview = async (e) => {
    e.preventDefault();
    if (!(Number(rate) > 0)) return toast.error("أدخل سعر ساعة صالحًا");
    setLoading(true);
    try {
      const r = await previewTeacherSalary({
        teacherId: item.teacher.id,
        month,
        year,
        hourlyRate: Number(rate),
      });
      setPreview(r.data?.data);
    } catch (err) {
      toast.error(errorMessage(err, "تعذر حساب الراتب"));
    } finally {
      setLoading(false);
    }
  };
  const referenceField = referenceFields[method];
  const pay = async () => {
    if (referenceField?.required && !reference.trim()) {
      toast.error(`أدخل ${referenceField.label}`);
      return;
    }
    setLoading(true);
    try {
      await payTeacherSalary({
        teacherId: item.teacher.id,
        month,
        year,
        hourlyRate: Number(rate),
        paymentMethod: method,
        ...(reference.trim() && { referenceNumber: reference.trim() }),
        ...(notes.trim() && { notes: notes.trim() }),
      });
      toast.success("تم صرف الراتب بنجاح");
      onSuccess();
    } catch (err) {
      if (err.response?.status === 409) onSuccess();
      toast.error(errorMessage(err, "تعذر تنفيذ عملية الصرف"));
    } finally {
      setLoading(false);
    }
  };
  return (
    <Modal title={`صرف راتب ${teacherName(item.teacher)}`} onClose={onClose}>
      <form onSubmit={runPreview}>
        <label className="text-sm text-gray-600">
          سعر الساعة (ج.م)
          <input
            autoFocus
            type="number"
            min="0.01"
            step="0.01"
            value={rate}
            onChange={(e) => {
              setRate(e.target.value);
              setPreview(null);
            }}
            className="mt-1.5 w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:border-[#123C91] focus:ring-2 focus:ring-blue-100"
          />
        </label>
        <button
          disabled={loading}
          className="mt-3.5 w-full rounded-xl bg-[#123C91] py-2.5 text-white transition hover:bg-[#0D2F75] disabled:opacity-50"
        >
          {loading ? "جاري الحساب..." : "معاينة الراتب"}
        </button>
      </form>
      {preview && (
        <div className="mt-4 space-y-3.5 border-t border-[#E8EEF6] pt-4">
          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div className="rounded-xl bg-gray-50 p-3">
              <small>الحصص</small>
              <strong className="block">{preview.totalSessions}</strong>
            </div>
            <div className="rounded-xl bg-gray-50 p-3">
              <small>الساعات</small>
              <strong className="block">{preview.totalHours}</strong>
            </div>
            <div className="rounded-xl bg-blue-50 p-3">
              <small>الإجمالي</small>
              <strong className="block text-[#123C91]">
                {money(preview.totalSalary)}
              </strong>
            </div>
          </div>
          {preview.isPaid ? (
            <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
              تم صرف هذا الراتب بالفعل.
            </p>
          ) : (
            <>
              <label className="block text-sm">
                طريقة الدفع
                <select
                  value={method}
                  onChange={(e) => {
                    setMethod(e.target.value);
                    setReference("");
                  }}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:border-[#123C91] focus:ring-2 focus:ring-blue-100"
                >
                  {Object.entries(paymentLabels).map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </select>
              </label>
              {referenceField && (
                <label className="block text-sm text-gray-700">
                  {referenceField.label}
                  {referenceField.required && (
                    <span className="mr-1 text-red-500">*</span>
                  )}
                  <input
                    type="text"
                    required={referenceField.required}
                    placeholder={referenceField.placeholder}
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-[#123C91] focus:ring-2 focus:ring-blue-100"
                  />
                </label>
              )}
              <textarea
                placeholder="ملاحظات (اختياري)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-20 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[#123C91] focus:ring-2 focus:ring-blue-100"
              />
              <button
                type="button"
                onClick={pay}
                disabled={loading}
                className="w-full rounded-xl bg-[#12A892] py-2.5 font-medium text-white transition hover:bg-[#0D8F7D] disabled:opacity-50"
              >
                <Banknote className="ml-2 inline" size={18} />
                تأكيد الصرف
              </button>
            </>
          )}
        </div>
      )}
    </Modal>
  );
}

function Details({ salary, onCancel }) {
  const referenceLabel =
    referenceFields[salary.paymentMethod]?.label || "الرقم المرجعي";
  const rows = [
    ["المعلم", teacherName(salary.teacher)],
    ["الفترة", `${salary.month}/${salary.year}`],
    ["عدد الحصص", salary.totalSessions],
    ["إجمالي الساعات", salary.totalHours],
    ["سعر الساعة", money(salary.hourlyRate)],
    ["إجمالي الراتب", money(salary.totalSalary)],
    ["الحالة", statusLabels[salary.status] || salary.status],
    ["طريقة الدفع", paymentLabels[salary.paymentMethod] || "—"],
    [referenceLabel, salary.referenceNumber || "—"],
    ["تاريخ الصرف", date(salary.paidAt)],
    ["ملاحظات", salary.notes || "—"],
  ];
  return (
    <>
      <dl className="grid gap-3 sm:grid-cols-2">
        {rows.map(([k, v]) => (
          <div key={k} className="rounded-xl bg-gray-50 p-3">
            <dt className="text-xs text-gray-500">{k}</dt>
            <dd className="mt-1 font-medium text-gray-800">{v ?? "—"}</dd>
          </div>
        ))}
      </dl>
      {salary.status === "cancelled" && (
        <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">
          سبب الإلغاء: {salary.cancellationReason || "—"}
          <br />
          تاريخ الإلغاء: {date(salary.cancelledAt)}
        </div>
      )}
      {salary.status === "paid" && (
        <button
          type="button"
          onClick={onCancel}
          className="mt-5 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
        >
          إلغاء عملية الصرف
        </button>
      )}
    </>
  );
}
