import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  X,
  Upload,
  Settings2,
  FileText,
  Calendar,
  Clock,
  Loader2,
} from "lucide-react";
import TeacherLayout from "../layout/TeacherLayout";
import {
  getMyClassrooms,
  getClassroomSessions,
  createAssignment,
} from "../../../services/APIService"; // عدّل المسار حسب مكان api.js عندك

// ─── Reusable primitives ──────────────────────────────────────────────────────
const SectionHeader = ({ icon: Icon, title }) => (
  <div className="flex items-center gap-2 mb-4" dir="rtl">
    <Icon size={18} className="text-[#123C91]" />
    <h1
      className="text-2xl font-bold text-[#1F2937]"
      style={{ fontFamily: "Tajawal, sans-serif" }}
    >
      {title}
    </h1>
  </div>
);

const Label = ({ children }) => (
  <label className="block font-['Tajawal'] font-medium text-[16px] text-right text-[#1F2937] pb-1">
    {children}
  </label>
);

const inputClass =
  "w-full h-12 px-4 border border-[#E5E5E5] rounded-lg bg-[#F9FAFA] font-['IBM_Plex_Sans_Arabic'] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#123C91] transition-all text-right placeholder:text-[#8C9198]";
const SelectField = ({ value, onChange, options, placeholder, disabled }) => (
  <div className="relative">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={`${inputClass} appearance-none cursor-pointer ${
        disabled ? "bg-gray-50 text-gray-400 cursor-not-allowed" : ""
      }`}
      style={{
        fontFamily: "IBM Plex Sans Arabic, sans-serif",
        direction: "rtl",
      }}
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  </div>
);

// ─── Page ─────────────────────────────────────────────────────────────────────
const AddAssignmentPage = ({ onSubmit }) => {
  const navigate = useNavigate();
  const fileRef = useRef();
  const query = new URLSearchParams(window.location.search);
  const linkedClassroom = query.get("classroom") || "";
  const linkedSession = query.get("session") || "";

  const [form, setForm] = useState({
    title: "",
    description: "",
    groupId: linkedClassroom,
    lessonId: linkedSession,
    deadline: "",
    deadlineTime: "",
    totalGrade: 100,
    passGrade: 50,
    files: [],
  });

  const [groups, setGroups] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [loadingLessons, setLoadingLessons] = useState(Boolean(linkedClassroom));
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  // جلب مجموعات (فصول) المعلّم عند فتح الصفحة
  useEffect(() => {
    getMyClassrooms()
      .then((res) => setGroups(res.data?.data || []))
      .catch(() => setErrorMsg("تعذّر تحميل قائمة المجموعات"));
  }, []);

  // جلب حصص المجموعة المختارة كل ما groupId يتغيّر
  useEffect(() => {
    if (!form.groupId) return;
    getClassroomSessions(form.groupId)
      .then((res) => setLessons(res.data?.data || []))
      .catch(() => setLessons([]))
      .finally(() => setLoadingLessons(false));
  }, [form.groupId]);

  const handleFiles = (e) => {
    const picked = Array.from(e.target.files);
    set("files", [...form.files, ...picked]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files);
    set("files", [...form.files, ...dropped]);
  };

  const handleSubmit = async () => {
    setErrorMsg("");

    if (!form.title || !form.groupId || !form.deadline) {
      setErrorMsg("من فضلك أكمل عنوان الواجب، المجموعة، وتاريخ التسليم");
      return;
    }

    // دمج التاريخ والوقت في ISO string زي ما الـ API بيتوقع (dueDate)
    const time = form.deadlineTime || "23:59";
    const dueDateISO = new Date(`${form.deadline}T${time}`).toISOString();

    const formData = new FormData();
    formData.append("classroom", form.groupId);
    if (form.lessonId) formData.append("session", form.lessonId);
    formData.append("title", form.title);
    if (form.description) formData.append("description", form.description);
    formData.append("dueDate", dueDateISO);
    formData.append("totalScore", form.totalGrade);
    form.files.forEach((file) => formData.append("attachments", file));

    try {
      setSubmitting(true);
      const res = await createAssignment(formData);
      onSubmit?.(res.data?.data);
      navigate(-1);
    } catch (err) {
      setErrorMsg(
        err?.response?.data?.message ||
          "حدث خطأ أثناء إضافة الواجب، حاول مرة أخرى",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const groupOptions = groups.map((g) => ({ value: g.id, label: g.name }));
  const lessonOptions = lessons.map((l) => ({ value: l.id, label: l.title }));

  return (
    <TeacherLayout>
      <div
        className="min-h-screen  p-4 sm:p-6 lg:p-2"
        style={{ fontFamily: "IBM Plex Sans Arabic, Tajawal, sans-serif" }}
        dir="rtl"
      >
        <div className="mx-auto">
          <h1 className="font-[IBM_Plex_Sans_Arabic] text-xl mb-4 sm:text-2xl font-bold text-[#123C91]">
            إضافة واجب
          </h1>

          {errorMsg && (
            <div className="mb-4 bg-[#FFE9E9] text-[#D32F2F] text-sm rounded-lg px-4 py-3">
              {errorMsg}
            </div>
          )}

          {/* ── Two-column body ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* ════ RIGHT col — basic info + attachments ════ */}
            <div className="flex flex-col gap-5">
              {/* Basic info */}
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <SectionHeader icon={FileText} title="بيانات الواجب الأساسية" />
                <div className="flex flex-col gap-3">
                  <div>
                    <Label>عنوان الواجب</Label>
                    <input
                      className={inputClass}
                      placeholder="مثال: حل مسائل التفاضل"
                      value={form.title}
                      onChange={(e) => set("title", e.target.value)}
                      style={{ fontFamily: "IBM Plex Sans Arabic, sans-serif" }}
                    />
                  </div>
                  <div>
                    <Label>وصف الواجب وتعليمات التنفيذ (اختياري)</Label>
                    <textarea
                      className={`w-full p-4 border border-[#E5E5E5] rounded-lg bg-[#F9FAFA] font-['IBM_Plex_Sans_Arabic'] text-[14px] focus:ring-2 focus:ring-[#123C91] outline-none transition-all resize-none text-right`}
                      rows={4}
                      placeholder="أكتب تعليمات مفصلة للطلاب لمساعدتهم في إنجاز الواجب..."
                      value={form.description}
                      onChange={(e) => set("description", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Attachments */}
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <SectionHeader icon={Upload} title="مرفقات الواجب" />
                <p
                  className=" text-gray-400 text-[14px] mb-3"
                  style={{ fontFamily: "IBM Plex Sans Arabic, sans-serif" }}
                >
                  أضف ملف الواجب وأي ملفات إضافية تدعم عملية الحل والفهم.
                </p>
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-all"
                >
                  <Upload size={28} className="text-blue-400" />
                  <p
                    className="text-sm text-gray-500 text-center"
                    style={{ fontFamily: "IBM Plex Sans Arabic, sans-serif" }}
                  >
                    اسحب الملفات هنا أو اضغط للاختيار
                  </p>
                  <p className="text-xs text-gray-400">PDF, DOCX, JPG, PPT</p>
                  <input
                    ref={fileRef}
                    type="file"
                    multiple
                    className="hidden"
                    accept=".pdf,.docx,.jpg,.jpeg,.ppt,.pptx"
                    onChange={handleFiles}
                  />
                </div>
                {form.files.length > 0 && (
                  <ul className="mt-3 space-y-1">
                    {form.files.map((f, i) => (
                      <li
                        key={i}
                        className="flex items-center justify-between text-xs text-gray-600 bg-gray-50 rounded-lg px-3 py-2"
                      >
                        <span>{f.name}</span>
                        <button
                          onClick={() =>
                            set(
                              "files",
                              form.files.filter((_, j) => j !== i),
                            )
                          }
                          className="text-gray-400 hover:text-red-500 transition-all"
                        >
                          <X size={13} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* ════ LEFT col — settings ════ */}
            <div className="flex flex-col gap-5">
              {/* Assignment settings */}
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <SectionHeader icon={Settings2} title="إعدادات الواجب" />
                <div className="flex flex-col gap-3">
                  <div>
                    <Label>المجموعة المستهدفة</Label>
                    <SelectField
                      value={form.groupId}
                      onChange={(v) => {
                        setLessons([]);
                        setLoadingLessons(Boolean(v));
                        set("groupId", v);
                        set("lessonId", "");
                      }}
                      options={groupOptions}
                      placeholder="اختر المجموعة"
                    />
                  </div>
                  <div>
                    <Label>الحصة المستهدفة (اختياري)</Label>
                    <SelectField
                      value={form.lessonId}
                      onChange={(v) => set("lessonId", v)}
                      options={lessonOptions}
                      placeholder={
                        !form.groupId
                          ? "اختر المجموعة أولاً"
                          : loadingLessons
                            ? "جارٍ التحميل..."
                            : "اختر الحصة"
                      }
                      disabled={!form.groupId || loadingLessons}
                    />
                  </div>
                  <div>
                    <Label>تاريخ ووقت التسليم</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="relative">
                        <input
                          type="date"
                          className={`${inputClass} pl-9`}
                          value={form.deadline}
                          onChange={(e) => set("deadline", e.target.value)}
                          style={{
                            fontFamily: "IBM Plex Sans Arabic, sans-serif",
                          }}
                        />
                        <Calendar
                          size={15}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                        />
                      </div>
                      <div className="relative">
                        <input
                          type="time"
                          className={`${inputClass} pl-9`}
                          value={form.deadlineTime}
                          onChange={(e) => set("deadlineTime", e.target.value)}
                          style={{
                            fontFamily: "IBM Plex Sans Arabic, sans-serif",
                          }}
                        />
                        <Clock
                          size={15}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>الدرجة الكلية</Label>
                      <input
                        type="number"
                        className={inputClass}
                        placeholder="100/100"
                        value={form.totalGrade}
                        onChange={(e) => set("totalGrade", e.target.value)}
                        style={{
                          fontFamily: "IBM Plex Sans Arabic, sans-serif",
                        }}
                      />
                    </div>
                    <div>
                      <Label>درجة النجاح</Label>
                      <input
                        type="number"
                        className={inputClass}
                        placeholder="50"
                        value={form.passGrade}
                        onChange={(e) => set("passGrade", e.target.value)}
                        style={{
                          fontFamily: "IBM Plex Sans Arabic, sans-serif",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* ── Footer actions ── */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-6 mt-2">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full sm:flex-1 h-12 sm:h-12.5 bg-[#123C91] text-white [&_svg]:text-white rounded-lg font-bold text-sm sm:text-[16px] flex items-center justify-center gap-2 shadow-sm order-1 sm:order-1 disabled:opacity-60"
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              {submitting ? "جارٍ الإضافة..." : "إضافة الواجب"}
            </button>
            <button
              onClick={() => navigate(-1)}
              disabled={submitting}
              className="w-full sm:w-auto sm:px-16 lg:px-40 h-12 sm:h-12.5 text-[#575F69] bg-white border border-[#E5E5E5] font-semibold rounded-lg order-2 sm:order-2"
            >
              إلغاء
            </button>
          </div>
        </div>
      </div>
    </TeacherLayout>
  );
};

export default AddAssignmentPage;
