import { useState, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, LoaderCircle, Upload, X } from "lucide-react";
import toast from "react-hot-toast";
import AuthLayout from "../../components/auth/AuthLayout";
import { AuthContext } from "../../context/AuthContext";
import {
  completeTeacherProfile,
} from "../../services/APIService";
import TeachingSelectionsEditor, { sanitizeTeachingSelections, validTeachingSelections } from "../../components/teacher/TeachingSelectionsEditor";

const MAX_TEACHER_FILES = 10;
const MAX_TEACHER_FILE_SIZE = 20 * 1024 * 1024;
const TEACHER_FILE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
];
const TEACHER_FILE_ACCEPT = ".png,.jpg,.jpeg,.webp,.pdf,.docx,.xls,.xlsx,.ppt,.pptx,.txt";

// Multi-select chips field
const MultiSelectField = ({
  label,
  options = [],
  selected,
  onChange,
  placeholder,
  disabled,
}) => {
  const display = (o) => {
    if (typeof o === "object" && o !== null)
      return o.name?.ar || o.name?.en || o.name || "";
    return o.name ?? o;
  };

  const toggle = (option) => {
    const ids = option.ids ?? [option.id ?? option];
    const allSelected = ids.every((id) => selected.includes(id));
    onChange(
      allSelected
        ? selected.filter((id) => !ids.includes(id))
        : [...new Set([...selected, ...ids])],
    );
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[13px] font-medium text-[#1F2937]">{label}</label>
      <div
        className={`min-h-12 px-3 py-2 rounded-xl border border-[#1F293733] bg-[#F9FAFA] flex flex-wrap gap-2 ${disabled ? "opacity-50 pointer-events-none" : ""}`}
      >
        {disabled && (
          <span className="text-[14px] text-[#9CA3AF] self-center">
            جاري التحميل...
          </span>
        )}
        {!disabled && options.length === 0 && (
          <span className="text-[14px] text-[#9CA3AF] self-center">
            {placeholder}
          </span>
        )}
        {!disabled &&
          options.map((o) => {
            const id = o.id ?? o;
            const ids = o.ids ?? [id];
            const active = ids.every((subjectId) => selected.includes(subjectId));
            return (
              <button
                key={id}
                type="button"
                onClick={() => toggle(o)}
                className={`px-3 py-1 rounded-lg text-[13px] font-medium border transition-colors ${
                  active
                    ? "bg-[#123C91] text-white [&_svg]:text-white border-[#123C91]"
                    : "bg-white text-[#6B7280] border-[#1F293733] hover:border-[#123C91]"
                }`}
              >
                {display(o)}
              </button>
            );
          })}
      </div>
    </div>
  );
};

// Main page
const TeacherDetailsPage = () => {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const { user, updateUser } = useContext(AuthContext);
  console.log("token:", localStorage.getItem("token"));
  console.log("user:", localStorage.getItem("user"));

  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    language: ["arabic"],
    teachingSelections: [{ curriculum: "", stages: [] }],
    experienceYears: "",
  });

  const [files, setFiles] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const sanitizedSelections = sanitizeTeachingSelections(form.teachingSelections);
    if (!form.language.length || !validTeachingSelections(sanitizedSelections)) {
      toast.error("يرجى إكمال جميع الحقول المطلوبة");
      return;
    }

    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.append("language", JSON.stringify(form.language));
      if (form.experienceYears) {
        payload.append("experienceYears", String(Number(form.experienceYears)));
      }
      payload.append("teachingSelections", JSON.stringify(sanitizedSelections));
      files.forEach((file) => payload.append("files", file));

      const res = await completeTeacherProfile(payload);

      // ✅ لو الـ API رجّع user محدّث فيه status، احفظه
      const updatedUser = res.data?.data?.teacher || res.data?.data || res.data?.user;

      // بعض استجابات الـ API ترجع الحالة فقط، لذلك لا نستبدل بيانات المستخدم
      // ونثبت الدور حتى يظل الحساب المعلّق معروفًا كحساب معلم.
      const patched = {
        ...user,
        ...(updatedUser && typeof updatedUser === "object" ? updatedUser : {}),
        role: "teacher",
        status: updatedUser?.status || "pending",
        registrationStatus: "pending-approval",
      };
      updateUser(patched);

      navigate("/pending");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "حدث خطأ غير متوقع");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full mx-auto px-1 py-8" dir="rtl">
        <button type="button" onClick={() => navigate(-1)} className="mb-4 inline-flex items-center gap-2 text-[14px] font-medium text-[#123C91] hover:underline">
          <ArrowRight size={17} /> رجوع
        </button>
        <h2
          className="text-[26px] font-bold mb-2 text-[#1F2937]"
          style={{ fontFamily: "Tajawal, sans-serif" }}
        >
          أكمل بيانات حسابك
        </h2>
        <p className="text-[14px] text-[#6B7280] mb-6">
          نحتاج بعض التفاصيل قبل مراجعة حسابك
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <MultiSelectField
            label="لغات التدريس"
            options={[{ id: "arabic", name: "العربية" }, { id: "languages", name: "اللغات" }]}
            selected={form.language}
            onChange={(language) => setForm((p) => ({ ...p, language }))}
            placeholder="اختر لغة تدريس واحدة على الأقل"
          />
          <TeachingSelectionsEditor value={form.teachingSelections} onChange={(teachingSelections) => setForm((p) => ({ ...p, teachingSelections }))} />

          {/* Experience years */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-[#1F2937]">
              سنوات الخبرة
            </label>
            <input
              type="number"
              name="experienceYears"
              placeholder="مثال: 5"
              min="0"
              value={form.experienceYears}
              onChange={handleChange}
              className="w-full h-12 px-4 rounded-xl border border-[#1F293733] bg-[#F9FAFA] text-[14px] outline-none focus:border-[#123C91] transition-colors"
            />
          </div>

          {/* File upload */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-[#1F2937]">
              المستندات{" "}
              <span className="text-[#9CA3AF] font-normal">(اختياري)</span>
            </label>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={files.length >= MAX_TEACHER_FILES}
              className="w-full py-4 border-dashed border-2 border-[#1F293733] rounded-xl flex items-center justify-center gap-2 text-[14px] text-[#6B7280] hover:border-[#123C91] hover:text-[#123C91] transition-colors"
            >
              <Upload size={16} />
              {files.length
                ? `تم اختيار ${files.length} من ${MAX_TEACHER_FILES} ملفات`
                : "ارفع مستنداتك هنا (حتى 10 ملفات)"}
            </button>
            {files.map((file) => (
              <div
                key={`${file.name}-${file.size}-${file.lastModified}`}
                className="flex items-center justify-between bg-[#F0F4FF] rounded-lg px-3 py-2"
              >
                <span className="text-[13px] text-[#123C91] truncate max-w-[80%]">
                  {file.name}
                </span>
                <button
                  type="button"
                  aria-label={`حذف ${file.name}`}
                  onClick={() =>
                    setFiles((current) => current.filter((item) => item !== file))
                  }
                >
                  <X size={14} className="text-[#6B7280]" />
                </button>
              </div>
            ))}
            <input
              ref={fileRef}
              type="file"
              multiple
              accept={TEACHER_FILE_ACCEPT}
              className="hidden"
              onChange={(e) => {
                const selectedFiles = Array.from(e.target.files || []);
                const validFiles = selectedFiles.filter((file) => {
                  if (!TEACHER_FILE_TYPES.includes(file.type)) {
                    toast.error(`نوع الملف غير مدعوم: ${file.name}`);
                    return false;
                  }
                  if (file.size > MAX_TEACHER_FILE_SIZE) {
                    toast.error(`حجم الملف يجب ألا يتجاوز 20 ميجابايت: ${file.name}`);
                    return false;
                  }
                  return true;
                });

                setFiles((current) => {
                  const knownFiles = new Set(
                    current.map(
                      (file) => `${file.name}-${file.size}-${file.lastModified}`,
                    ),
                  );
                  const newFiles = validFiles.filter(
                    (file) =>
                      !knownFiles.has(
                        `${file.name}-${file.size}-${file.lastModified}`,
                      ),
                  );
                  const availableSlots = MAX_TEACHER_FILES - current.length;
                  if (newFiles.length > availableSlots) {
                    toast.error("يمكن رفع 10 ملفات بحد أقصى");
                  }
                  return [...current, ...newFiles.slice(0, availableSlots)];
                });
                e.target.value = "";
              }}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full h-14 bg-[#123C91] text-white [&_svg]:text-white rounded-xl font-semibold text-[15px] hover:bg-[#0f3278] transition-colors disabled:opacity-60 mt-2"
            style={{ fontFamily: "Tajawal, sans-serif" }}
          >
            {submitting ? (
              <span className="inline-flex items-center justify-center gap-2">
                <LoaderCircle size={19} className="animate-spin" />
                جاري الإرسال...
              </span>
            ) : (
              "تقديم الطلب"
            )}
          </button>
        </form>
      </div>
    </AuthLayout>
  );
};

export default TeacherDetailsPage;
