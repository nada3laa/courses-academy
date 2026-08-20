import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ChevronDown, Check, Loader2, AlertCircle } from "lucide-react";
import AdminLayout from "../../../components/admin/layout/AdminLayout";

import {
  getStudent,
  getAvailableTeachers,
  getAvailableClassrooms,
  getAllPackages,
  getAllDiscounts,
  createSubscription,
} from "../../../services/APIService";
import Breadcrumbs from "../../shared/Breadcrumbs";
// ─── Helpers ──────────────────────────────────────────────────────────────────
const idOf = (obj) => {
  if (!obj) return "";
  if (typeof obj === "string") return obj;
  return obj.id || obj._id || "";
};

const extractList = (resData) => {
  if (!resData) return [];

  const root = resData?.data || resData;
  const raw = root?.data || root || [];

  return Array.isArray(raw) ? raw : [];
};

const nameOf = (obj) =>
  obj?.name?.ar || obj?.name?.en || obj?.fullName || obj?.user?.fullName || "—";

const computeFinalPrice = (basePrice, discount, increase) => {
  let price = basePrice;
  if (discount) {
    price =
      discount.type === "percentage"
        ? price * (1 - (discount.value || 0) / 100)
        : Math.max(0, price - (discount.value || 0));
  }
  return Math.max(0, Math.round(price + (Number(increase) || 0)));
};

// ─── Select Field (بيشتغل بـ id/label بدل نص عادي) ────────────────────────────
const SelectField = ({
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled,
  loading,
}) => (
  <div>
    <label className="block text-[12px] text-[#8C9198] mb-1.5 text-right">
      {label}
    </label>
    <div className="relative">
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || loading}
        className="w-full h-11 px-3.5 appearance-none bg-[#F9FAFA] border border-[#E5E7EB] rounded-lg text-[13px] text-[#1F2937] outline-none cursor-pointer focus:border-[#123C91] focus:ring-2 focus:ring-[#123C91]/20 transition-colors text-right disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={15}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none"
      />
    </div>
  </div>
);

// ─── Subject Accordion Item ───────────────────────────────────────────────────
const SubjectAccordion = ({
  subject,
  isOpen,
  onToggle,
  data,
  packages,
  discounts,
  packagesLoading,
  onTeacherChange,
  onFieldChange,
}) => {
  const teacherOptions = (data.teachers || []).map((t) => ({
    value: t.id || t._id,
    label: t.fullName || t.user?.fullName || nameOf(t),
  }));

  const classroomOptions = (data.classrooms || []).map((c) => ({
    value: c.id || c._id,
    label: typeof c.name === "string" ? c.name : nameOf(c),
  }));

  const packageOptions = (packages || []).map((p) => ({
    value: p.id || p._id,
    label: typeof p.name === "string" ? p.name : nameOf(p),
  }));
  const discountOptions = [
    { value: "", label: "بدون خصم" },
    ...discounts.map((d) => ({
      value: d.id || d._id,
      label: `${d.code} — ${d.type === "percentage" ? `${d.value}%` : `${d.value} جنيه`}`,
    })),
  ];

  const selectedPackage = (packages || []).find(
    (p) => (p.id || p._id) === data.packageId,
  );
  const selectedDiscount = discounts.find(
    (d) => (d.id || d._id) === data.discountId,
  );
  const basePrice = selectedPackage?.price ?? 0;
  const finalPrice = computeFinalPrice(
    basePrice,
    selectedDiscount,
    data.increase,
  );

  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden bg-white">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-2 px-4 sm:px-5 py-4 hover:bg-gray-50/60 transition-colors"
      >
        <span className="font-['Tajawal'] font-semibold text-[14px] sm:text-[19px] text-[#1F2937] truncate">
          {subject.name}
        </span>
        <ChevronDown
          size={17}
          className={`text-[#9CA3AF] transition-transform shrink-0 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="px-4 sm:px-5 pb-5 pt-1 border-t border-gray-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-4 mb-2">
            <SelectField
              label="المعلم"
              placeholder={
                data.loadingTeachers
                  ? "جاري تحميل المعلمين..."
                  : teacherOptions.length
                    ? "اختر المعلم"
                    : "لا يوجد معلمون متاحون لهذه المادة"
              }
              value={data.teacherId}
              onChange={(v) => onTeacherChange(subject.id, v)}
              options={teacherOptions}
              loading={data.loadingTeachers}
            />
            <SelectField
              label="المجموعة"
              placeholder={
                data.teacherId ? "اختر المجموعة" : "اختر المعلم أولاً"
              }
              value={data.classroomId}
              onChange={(v) => onFieldChange(subject.id, { classroomId: v })}
              options={classroomOptions}
              disabled={!data.teacherId}
              loading={data.loadingClassrooms}
            />
            <SelectField
              label="الباقة"
              placeholder={
                packagesLoading ? "جاري تحميل الباقات..." : "اختر الباقة"
              }
              value={data.packageId}
              onChange={(v) => onFieldChange(subject.id, { packageId: v })}
              options={packageOptions}
              loading={packagesLoading}
            />
            <SelectField
              label="الخصم"
              placeholder="اختر كود الخصم"
              value={data.discountId}
              onChange={(v) => onFieldChange(subject.id, { discountId: v })}
              options={discountOptions}
            />
          </div>

          <div>
            <label className="block text-[12px] text-[#8C9198] mb-1.5 text-right">
              الزيادة (اختياري)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                placeholder="0"
                value={data.increase}
                onChange={(e) =>
                  onFieldChange(subject.id, { increase: e.target.value })
                }
                className="w-full h-11 px-3.5 pl-14 bg-[#F9FAFA] border border-[#E5E7EB] rounded-lg text-[13px] text-[#1F2937] outline-none focus:border-[#123C91] focus:ring-2 focus:ring-[#123C91]/20 transition-colors text-right"
              />
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[12px] text-[#9CA3AF]">
                جنيه
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-dashed border-gray-200">
            <span className="text-[15px] font-bold text-[#123C91]">
              {finalPrice} جنيه مصري
            </span>
            <span className="text-[12px] text-[#8C9198]">السعر النهائي</span>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Toast ────────────────────────────────────────────────────────────────────
const Toast = ({ message, show }) => (
  <div
    dir="rtl"
    className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-[60] transition-all duration-300 px-4 w-full max-w-sm ${
      show
        ? "opacity-100 translate-y-0"
        : "opacity-0 translate-y-3 pointer-events-none"
    }`}
  >
    <div className="flex items-center gap-3 bg-[#1F2937] text-white rounded-xl px-4 py-3.5 shadow-xl">
      <span className="w-7 h-7 rounded-full bg-[#15A862] flex items-center justify-center shrink-0">
        <Check size={15} />
      </span>
      <span className="text-[13px] font-medium">{message}</span>
    </div>
  </div>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
const ActivateSubscriptionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // بيانات الطالب/الطلب: بتيجي من state لو المستخدم جه من صفحة الطلبات، أو بنجيبها من الـ API لو الصفحة اتفتحت مباشرة
  const [request, setRequest] = useState(location.state?.request || null);
  const [requestLoading, setRequestLoading] = useState(
    !location.state?.request,
  );
  const [requestError, setRequestError] = useState("");

  useEffect(() => {
    if (request) return;
    const fetchRequest = async () => {
      setRequestLoading(true);
      setRequestError("");
      try {
        const res = await getStudent(id);
        setRequest(res.data.data);
      } catch (err) {
        setRequestError(
          err?.response?.data?.message || "تعذر تحميل بيانات الطلب",
        );
      } finally {
        setRequestLoading(false);
      }
    };
    fetchRequest();
  }, [id, request]);

  const subjects = useMemo(
    () =>
      (request?.preferredSubjects || [])
        .map((s) => ({
          id: idOf(s),
          name: nameOf(s) || "مادة",
        }))
        .filter((s) => s.id),
    [request],
  );

  // ─── معلمين وخصومات: قائمة عامة بنجيبها مرة واحدة ───────────────────────────
  const [discounts, setDiscounts] = useState([]);
  const [packages, setPackages] = useState([]);
  const [metaLoading, setMetaLoading] = useState(true);
  const [metaError, setMetaError] = useState("");

  useEffect(() => {
    const fetchMeta = async () => {
      setMetaLoading(true);
      setMetaError("");

      try {
        const [discountsRes, packagesRes] = await Promise.all([
          getAllDiscounts({ isActive: true }),
          getAllPackages(),
        ]);

        setDiscounts(extractList(discountsRes.data));
        setPackages(extractList(packagesRes.data));
      } catch (err) {
        setMetaError(
          err?.response?.data?.message ||
            "تعذر تحميل بيانات الخصومات أو الباقات",
        );
      } finally {
        setMetaLoading(false);
      }
    };

    fetchMeta();
  }, []);
  // ─── بيانات كل مادة (معلم / مجموعة / باقة / خصم / زيادة) ────────────────────
  const [subjectData, setSubjectData] = useState({});
  const [openSubject, setOpenSubject] = useState("");

  useEffect(() => {
    if (!subjects.length) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSubjectData((prev) => {
      const next = { ...prev };
      subjects.forEach((s) => {
        if (!next[s.id]) {
          next[s.id] = {
            teacherId: "",
            classroomId: "",
            packageId: "",
            discountId: "",
            increase: "",

            teachers: [],
            classrooms: [],
            loadingTeachers: false,
            loadingClassrooms: false,

            teachersLoaded: false,
          };
        }
      });
      return next;
    });
    setOpenSubject((prevOpen) => prevOpen || subjects[0]?.id || "");
  }, [subjects]);

  const patchSubject = (subjectId, patch) => {
    setSubjectData((prev) => ({
      ...prev,
      [subjectId]: { ...prev[subjectId], ...patch },
    }));
  };

  const loadAvailableTeachers = async (subjectId) => {
    const curriculum = idOf(request?.curriculum);
    const stage = idOf(request?.stage);
    const grade = idOf(request?.grade);

    if (!curriculum || !stage || !grade || !subjectId) return;

    patchSubject(subjectId, {
      loadingTeachers: true,
      teachers: [],
      teachersLoaded: false,
    });

    try {
      const res = await getAvailableTeachers({
        curriculum,
        stage,
        grade,
        subject: subjectId,
      });

      const list = extractList(res.data);

      const normalizedTeachers = list
        .map((teacher) => {
          // الحقول جاية مباشرة على الأوبجكت (id, fullName, isActive, registrationStatus)
          // بنعمل fallback لأي شكل تاني (teacherId / user.xxx) احتياطًا بس
          const teacherIdValue = teacher.id || teacher._id || teacher.teacherId;
          const isActive = teacher.isActive ?? teacher.user?.isActive;
          const registrationStatus =
            teacher.registrationStatus ?? teacher.user?.registrationStatus;
          const isDeleted =
            teacher.isDeleted ?? teacher.user?.isDeleted ?? false;

          return {
            id: teacherIdValue,
            userId: teacher.userId || teacher.user?._id || teacherIdValue,
            fullName:
              teacher.fullName || teacher.user?.fullName || "معلم بدون اسم",
            username: teacher.username || teacher.user?.username,
            rating: teacher.rating,
            totalReviews: teacher.totalReviews,
            isActive,
            registrationStatus,
            isDeleted,
          };
        })
        // الشرط المطلوب بالظبط: لازم يكون مفعّل، حالته "active"، ومش محذوف
        .filter(
          (teacher) =>
            teacher.id &&
            teacher.isActive === true &&
            teacher.registrationStatus === "active" &&
            teacher.isDeleted !== true,
        );

      patchSubject(subjectId, {
        teachers: normalizedTeachers,
        loadingTeachers: false,
        teachersLoaded: true,
      });
    } catch (err) {
      console.error("فشل تحميل المعلمين المتاحين:", err);
      patchSubject(subjectId, {
        teachers: [],
        loadingTeachers: false,
        teachersLoaded: true,
      });
    }
  };

  const handleFieldChange = (subjectId, patch) =>
    patchSubject(subjectId, patch);

  const handleTeacherChange = async (subjectId, teacherId) => {
    patchSubject(subjectId, {
      teacherId,
      classroomId: "",
      classrooms: [],
      loadingClassrooms: true,
    });

    try {
      const res = await getAvailableClassrooms({
        teacher: teacherId,
        subject: subjectId,
      });

      patchSubject(subjectId, {
        classrooms: extractList(res.data),
        loadingClassrooms: false,
      });
    } catch (err) {
      console.error("فشل تحميل المجموعات:", err);
      patchSubject(subjectId, {
        classrooms: [],
        loadingClassrooms: false,
      });
    }
  };

  const handleToggleSubject = async (subjectId) => {
    const next = openSubject === subjectId ? "" : subjectId;
    setOpenSubject(next);

    if (!next) return;

    const current = subjectData[subjectId];

    if (!current) return;

    if (!current.teachersLoaded && !current.loadingTeachers) {
      loadAvailableTeachers(subjectId);
    }
  };
  useEffect(() => {
    if (!openSubject) return;

    const current = subjectData[openSubject];

    if (!current) return;

    if (!current.teachersLoaded && !current.loadingTeachers) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadAvailableTeachers(openSubject);
    }

    // loadAvailableTeachers intentionally reads the latest request and subject state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openSubject, subjectData]);
  // ─── تفعيل الاشتراك ───────────────────────────────────────────────────────
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [showToast, setShowToast] = useState(false);
  const toastTimer = useRef(null);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const handleActivate = async () => {
    const selectedSubjects = subjects.filter((s) => {
      const data = subjectData[s.id];
      return data?.teacherId && data?.classroomId && data?.packageId;
    });

    if (!selectedSubjects.length) {
      setSubmitError(
        "من فضلك اختر المعلم والمجموعة والباقة لمادة واحدة على الأقل قبل التفعيل",
      );
      return;
    }

    setSubmitting(true);
    setSubmitError("");
    try {
      const studentId =
        idOf(request?.student) ||
        idOf(request?.studentId) ||
        request?._id ||
        request?.id ||
        id;

      const items = selectedSubjects.map((s) => {
        const d = subjectData[s.id];
        const selectedClassroom = (d.classrooms || []).find(
          (classroom) => idOf(classroom) === d.classroomId,
        );
        const selectedPackage = packages.find(
          (packageItem) => idOf(packageItem) === d.packageId,
        );
        const selectedDiscount = discounts.find(
          (discount) => idOf(discount) === d.discountId,
        );
        const price = Number(selectedPackage?.price) || 0;
        const discountAmount = selectedDiscount
          ? selectedDiscount.type === "percentage"
            ? (price * (Number(selectedDiscount.value) || 0)) / 100
            : Number(selectedDiscount.value) || 0
          : 0;

        return {
          subject: s.id,
          teacher: d.teacherId,
          classroom: d.classroomId,
          package: d.packageId,
          type: ["private", "group"].includes(selectedClassroom?.type)
            ? selectedClassroom.type
            : "group",
          discount: Math.min(price, Math.max(0, discountAmount)),
        };
      });

      await createSubscription({
        student: studentId,
        items,
      });

      setShowToast(true);
      clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => setShowToast(false), 3000);
      setTimeout(() => navigate("/admin/subscriptions/requests"), 1200);
    } catch (err) {
      setSubmitError(
        err?.response?.data?.message || "تعذر تفعيل الاشتراك، حاول مرة أخرى",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Loading / Error states للطلب نفسه ──────────────────────────────────────
  if (requestLoading) {
    return (
      <AdminLayout>
        <Breadcrumbs homeTo="/admin-dashboard" />
        <div
          className="flex items-center justify-center py-24 text-[#8C9198]"
          dir="rtl"
        >
          <Loader2 size={20} className="animate-spin ml-2" />
          <span className="text-[14px]">جاري تحميل بيانات الطلب...</span>
        </div>
      </AdminLayout>
    );
  }

  if (requestError || !request) {
    return (
      <AdminLayout>
        <Breadcrumbs homeTo="/admin-dashboard" />
        <div
          dir="rtl"
          className="flex flex-col items-center justify-center py-24 gap-3 text-center"
        >
          <AlertCircle size={22} className="text-red-500" />
          <p className="text-[14px] text-red-600">
            {requestError || "تعذر إيجاد هذا الطلب"}
          </p>
          <button
            onClick={() => navigate("/admin/subscriptions/requests")}
            className="px-4 py-2 rounded-lg border border-gray-200 text-[13px] text-[#374151] hover:bg-gray-50"
          >
            الرجوع لطلبات الاشتراك
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
        <Breadcrumbs homeTo="/admin-dashboard" />
      <div
        dir="rtl"
        className="w-full max-w-full p-3 sm:p-4 md:p-6 font-['IBM_Plex_Sans_Arabic'] overflow-x-hidden"
      >
        <div className="w-full">
          <div className="flex flex-col-reverse sm:flex-row items-start sm:items-center justify-between mb-1 gap-2">
            <h2 className="font-['IBM_Plex_Sans_Arabic'] mb-2 font-semibold text-[16px] sm:text-[24px] text-[#123C91]">
              تفعيل الاشتراك
            </h2>
          </div>
          <p className="text-[#9CA3AF] text-[12px] sm:text-[16px] mb-1">
            الطالب:{" "}
            <span className="text-[#374151] font-medium">
              {nameOf(request.user)}
            </span>
          </p>
          <p className="text-[#9CA3AF] text-[12px] sm:text-[16px] mb-6">
            حدد المعلم والمجموعة والباقة لكل مادة ثم أكد الاشتراك
          </p>

          {metaError && (
            <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-[13px]">
              <AlertCircle size={15} />
              <span>{metaError}</span>
            </div>
          )}

          {subjects.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl py-14 px-4 text-center">
              <p className="text-[14px] text-[#9CA3AF]">
                لا توجد مواد مطلوبة لهذا الطالب
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {subjects.map((subject) => (
                <SubjectAccordion
                  key={subject.id}
                  subject={subject}
                  isOpen={openSubject === subject.id}
                  onToggle={() => handleToggleSubject(subject.id)}
                  data={subjectData[subject.id] || {}}
                  packages={packages}
                  discounts={discounts}
                  packagesLoading={metaLoading}
                  onTeacherChange={handleTeacherChange}
                  onFieldChange={handleFieldChange}
                />
              ))}
            </div>
          )}

          {submitError && (
            <div className="flex items-center gap-2 mt-4 p-3 rounded-lg bg-red-50 text-red-600 text-[13px]">
              <AlertCircle size={15} />
              <span>{submitError}</span>
            </div>
          )}

          {/* Footer actions */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 mt-6 sm:max-w-md">
            <button
              onClick={handleActivate}
              disabled={submitting || metaLoading || subjects.length === 0}
              className="flex-1 py-3 bg-[#123C91] text-white [&_svg]:text-white rounded-xl font-medium text-[14px] hover:bg-[#0f3280] transition-colors shadow-sm shadow-[#123C91]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              تفعيل الاشتراك
            </button>
            <button
              onClick={() => navigate("/admin/subscriptions/requests")}
              className="flex-1 py-3 border border-[#E5E5E5] rounded-xl text-[#374151] font-medium text-[14px] hover:bg-gray-50 transition-colors"
            >
              إلغاء
            </button>
          </div>
        </div>
      </div>

      <Toast message="تم تفعيل الاشتراك بنجاح" show={showToast} />
    </AdminLayout>
  );
};

export default ActivateSubscriptionPage;