import { useEffect, useState } from "react";
import {
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Film,
  GripVertical,
  Image as ImageIcon,
  Layers3,
  Plus,
  DollarSign,
  Trash2,
  UploadCloud,
  Video,
  X,
} from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import TeacherLayout from "../../../components/teacher/layout/TeacherLayout";
// ⚠️ تأكدي من المسار ده صح عندك (نفس نمط TeacherLayout بس جوه components/admin/layout)
import AdminLayout from "../../../components/admin/layout/AdminLayout";
import CourseStepsNavigation from "../components/CourseStepsNavigation";
import { addCourseCategory, fetchCourseCategories, fetchCourseInstructors, fetchTeacherCourse, saveCourseToApi } from "../api/coursesApi";
import { getCurriculums, getCurriculumStages, getStageGrades, getSubjects } from "../../../services/APIService";

const EMPTY_COURSE = {
  title: "",
  titleEn: "",
  category: "",
  instructorId: "",
  level: "",
  language: "عربي",
  description: "",
  shortDescription: "",
  requirements: "",
  outcomes: [],
  targetAudience: "",
  academicCurriculum: "",
  academicStage: "",
  academicGrade: "",
  subject: "",
  tags: [],
  cover: "",
  promoVideo: "",
  curriculum: [],
  pricingType: "paid",
  price: "",
  discountPercent: "",
  status: "مسودة",
};

const STEPS = ["المعلومات الأساسية", "بناء المحتوى", "التسعير", "المراجعة"];
const inputClass =
  "mt-2 h-11 w-full rounded-lg border border-[#E5E5E5] bg-[#F9FAFA] px-4 text-right font-['IBM_Plex_Sans_Arabic'] text-[13px] text-[#1F2937] outline-none transition-all placeholder:text-[11px] placeholder:font-normal placeholder:text-[#8C9198] focus:border-[#123C91] focus:ring-2 focus:ring-[#123C91]/15 sm:h-12 sm:text-[14px] sm:placeholder:text-[12px]";
const optionId = (item) => item?._id || item?.id || "";
const optionName = (item) => item?.name?.ar || item?.name?.en || item?.name || item?.title?.ar || item?.title?.en || item?.title || "—";
const extractOptions = (response, key) => {
  const data = response?.data?.data ?? response?.data ?? [];
  if (Array.isArray(data)) return data;
  return data?.[key] || data?.items || data?.results || [];
};

const UploadBox = ({ label, accept, value, onChange, onRemove, icon: Icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const isVideo = accept.startsWith("video/");
  const previewUrl =
    value && typeof value === "object" ? value.previewUrl || value.dataUrl : "";

  const handleFile = (file) => {
    if (!file) return;
    setPendingFile({
      file,
      name: file.name,
      type: file.type,
      size: file.size,
      previewUrl: URL.createObjectURL(file),
    });
  };

  const openModal = () => {
    setPendingFile(
      value && typeof value === "object" ? value : null,
    );
    setIsOpen(true);
  };

  const closeModal = () => {
    setPendingFile(null);
    setIsOpen(false);
  };

  const confirmFile = () => {
    if (!pendingFile) return;
    onChange(pendingFile);
    setIsOpen(false);
  };

  const pendingPreviewUrl = pendingFile?.previewUrl || pendingFile?.dataUrl;

  return (
    <div className="block text-right text-sm font-medium text-[#1F2937]">
      <span className="mb-3 block">{label}</span>
      {previewUrl ? (
        <div className="overflow-hidden rounded-xl border border-[#D8DCE2] bg-[#F8FAFC]">
          <div className="flex min-h-40 items-center justify-center bg-[#EEF2F6] sm:min-h-48">
            {isVideo ? (
              <video
                src={previewUrl}
                controls
                className="max-h-56 w-full bg-black object-contain sm:max-h-64"
              >
                متصفحك لا يدعم تشغيل الفيديو.
              </video>
            ) : (
              <img
                src={previewUrl}
                alt={`معاينة ${label}`}
                className="max-h-56 w-full object-contain sm:max-h-64"
              />
            )}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 p-3">
            <span className="min-w-0 flex-1 truncate text-xs font-normal text-[#667085]">
              {value.name}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={openModal}
                className="cursor-pointer rounded-md border border-[#D0D5DD] bg-white px-3 py-2 text-xs font-semibold text-[#475467] transition hover:border-[#123C91] hover:text-[#123C91]"
              >
                تغيير
              </button>
              <button
                type="button"
                onClick={onRemove}
                className="rounded-md border border-[#FECACA] bg-white px-3 py-2 text-xs font-semibold text-[#D92D20] transition hover:bg-[#FFF5F5]"
              >
                حذف
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={openModal}
          className="flex min-h-40 w-full cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#D8DCE2] bg-[#FCFCFD] px-4 py-5 text-center transition hover:border-[#123C91] hover:bg-[#F7FAFF] sm:min-h-48 sm:px-5"
        >
          <span className="mb-3 grid h-11 w-11 place-items-center rounded-lg bg-[#EAF2FF] text-[#123C91]">
            <Icon size={21} strokeWidth={1.8} />
          </span>
          <span className="text-sm font-semibold text-[#575F69]">
            رفع {label}
          </span>
          <span className="mt-1.5 text-[11px] font-normal text-[#8C9198]">
            اضغط هنا لاختيار الملف
          </span>
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-black/50 p-3 sm:p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`إضافة ${label}`}
            className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[#EAECF0] px-4 py-4 sm:px-5">
              <div className="min-w-0">
                <h3 className="text-base font-bold text-[#1F2937]">
                  {previewUrl ? `تغيير ${label}` : `إضافة ${label}`}
                </h3>
                <p className="mt-1 text-xs font-normal text-[#667085]">
                  اختر {isVideo ? "ملف فيديو" : "صورة"} ثم راجع المعاينة قبل الإضافة.
                </p>
              </div>
              <button
                type="button"
                aria-label="إغلاق"
                onClick={closeModal}
                className="shrink-0 rounded-md p-2 text-[#667085] transition hover:bg-[#F2F4F7]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 sm:p-5">
              {pendingPreviewUrl ? (
                <div className="overflow-hidden rounded-xl border border-[#D8DCE2]">
                  <div className="flex min-h-48 items-center justify-center bg-[#EEF2F6] sm:min-h-56">
                    {isVideo ? (
                      <video
                        src={pendingPreviewUrl}
                        controls
                        className="max-h-72 w-full bg-black object-contain sm:max-h-80"
                      >
                        متصفحك لا يدعم تشغيل الفيديو.
                      </video>
                    ) : (
                      <img
                        src={pendingPreviewUrl}
                        alt={`معاينة ${label}`}
                        className="max-h-72 w-full object-contain sm:max-h-80"
                      />
                    )}
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3 p-3">
                    <span className="min-w-0 flex-1 truncate text-xs font-normal text-[#667085]">
                      {pendingFile.name}
                    </span>
                    <label className="cursor-pointer rounded-md border border-[#D0D5DD] px-3 py-2 text-xs font-semibold text-[#475467] hover:border-[#123C91] hover:text-[#123C91]">
                      اختيار ملف آخر
                      <input
                        type="file"
                        accept={accept}
                        className="sr-only"
                        onChange={(event) => handleFile(event.target.files?.[0])}
                      />
                    </label>
                  </div>
                </div>
              ) : (
                <label
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault();
                    handleFile(event.dataTransfer.files?.[0]);
                  }}
                  className="flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#C9D3E0] bg-[#F9FBFD] px-4 text-center transition hover:border-[#123C91] hover:bg-[#F5F8FF] sm:min-h-64 sm:px-6"
                >
                  <span className="mb-3 grid h-12 w-12 place-items-center rounded-xl bg-[#EAF2FF] text-[#123C91]">
                    <UploadCloud size={23} />
                  </span>
                  <strong className="text-sm text-[#344054]">
                    اسحب الملف هنا أو اضغط للاختيار
                  </strong>
                  <span className="mt-2 text-[11px] font-normal text-[#8C9198]">
                    {isVideo ? "MP4 أو WebM أو MOV" : "PNG أو JPG أو WebP"}
                  </span>
                  <input
                    type="file"
                    accept={accept}
                    className="sr-only"
                    onChange={(event) => handleFile(event.target.files?.[0])}
                  />
                </label>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3 border-t border-[#EAECF0] bg-[#FCFCFD] px-4 py-4 sm:px-5">
              <button
                type="button"
                onClick={closeModal}
                className="h-10 rounded-md border border-[#D0D5DD] bg-white px-5 text-sm font-medium text-[#475467]"
              >
                إلغاء
              </button>
              <button
                type="button"
                disabled={!pendingFile}
                onClick={confirmFile}
                className="h-10 rounded-md bg-[#123C91] px-6 text-sm font-semibold text-white transition hover:bg-[#0E327A] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {previewUrl ? "حفظ التغيير" : "إضافة"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TagsField = ({ label, values = [], onChange, placeholder }) => {
  const [text, setText] = useState("");
  const addValue = () => {
    const value = text.trim();
    if (!value || values.includes(value)) return;
    onChange([...values, value]);
    setText("");
  };

  return (
    <label className="block space-y-2 text-right text-sm font-medium text-[#1F2937]">
      <span>{label}</span>
      <input
        className={inputClass}
        value={text}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            addValue();
          }
        }}
        onBlur={addValue}
        placeholder={placeholder}
      />
      <span className="block text-xs font-normal text-[#8C9198]">
        اكتب قيمة واحدة ثم اضغط Enter لإضافتها
      </span>
      {values.length > 0 && (
        <span className="flex flex-wrap gap-2">
          {values.map((value) => (
            <span key={value} className="inline-flex items-center gap-2 rounded-md border border-[#DCE6F5] bg-[#F7FAFF] px-3 py-1.5 text-xs font-normal text-[#344054]">
              {value}
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  onChange(values.filter((item) => item !== value));
                }}
                className="text-[#98A2B3] hover:text-red-500"
              >
                ×
              </button>
            </span>
          ))}
        </span>
      )}
    </label>
  );
};

const TeacherCourseFormPage = ({ useTeacherLayout = true }) => {
  const { courseId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const isAdminFlow = location.pathname.startsWith("/admin");
  const returnPath = isAdminFlow ? "/admin/courses" : "/teacher/courses";
  const [existingCourse, setExistingCourse] = useState(null);
  const [categories, setCategories] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [curriculums, setCurriculums] = useState([]);
  const [stages, setStages] = useState([]);
  const [grades, setGrades] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadStatus, setUploadStatus] = useState({ label: "", percent: 0 });
  const [step, setStep] = useState(0);
  const [contentModal, setContentModal] = useState(null);
  const [quizModal, setQuizModal] = useState(null);
  const [course, setCourse] = useState(EMPTY_COURSE);

  useEffect(() => {
    fetchCourseCategories()
      .then(setCategories)
      .catch(() => toast.error("تعذر تحميل تصنيفات الدورات"));
  }, []);

  useEffect(() => {
    if (!isAdminFlow) return;
    fetchCourseInstructors()
      .then(setInstructors)
      .catch(() => toast.error("تعذر تحميل قائمة المدرسين"));
  }, [isAdminFlow]);

  useEffect(() => {
    getCurriculums()
      .then((response) => setCurriculums(extractOptions(response, "curriculums")))
      .catch(() => setCurriculums([]));
  }, []);

  useEffect(() => {
    if (!course.academicCurriculum) return;
    getCurriculumStages(course.academicCurriculum)
      .then((response) => setStages(extractOptions(response, "stages")))
      .catch(() => setStages([]));
  }, [course.academicCurriculum]);

  useEffect(() => {
    if (!course.academicStage) return;
    getStageGrades(course.academicStage)
      .then((response) => setGrades(extractOptions(response, "grades")))
      .catch(() => setGrades([]));
  }, [course.academicStage]);

  useEffect(() => {
    if (!course.academicGrade) return;
    getSubjects({ grade: course.academicGrade })
      .then((response) => setSubjects(extractOptions(response, "subjects")))
      .catch(() => setSubjects([]));
  }, [course.academicGrade]);

  useEffect(() => {
    if (!courseId) return;
    fetchTeacherCourse(courseId)
      .then((item) => {
        setExistingCourse(item);
        setCourse({
          ...EMPTY_COURSE,
          ...item,
          category: item.categoryId || item.category,
          instructorId: item.instructorId || "",
          academicCurriculum: item.academicCurriculumId || "",
          academicStage: item.academicStageId || "",
          academicGrade: item.academicGradeId || "",
          subject: item.subjectId || "",
          titleEn: item.titleEn || item.title,
          tags: item.tags || [],
          curriculum: item.curriculum || [],
          cover: item.coverImage ? { name: "صورة الغلاف", previewUrl: item.coverImage } : "",
          promoVideo: item.promoVideoUrl ? { name: "الفيديو الترويجي", previewUrl: item.promoVideoUrl } : "",
        });
      })
      .catch((error) => toast.error(error?.response?.data?.message || "تعذر تحميل بيانات الدورة"));
  }, [courseId]);

  const update = (field, value) =>
    setCourse((current) => ({ ...current, [field]: value }));

  const createCategory = async () => {
    if (!newCategory.trim()) return;
    try {
      const created = await addCourseCategory(newCategory);
      setCategories((items) => [...items, created]);
      update("category", created._id || created.id);
      setNewCategory("");
      toast.success("تم إنشاء التصنيف");
    } catch (error) {
      toast.error(error?.response?.data?.message || "تعذر إنشاء التصنيف");
    }
  };

  const validateStep = () => {
    if (step === 0 && (!course.title.trim() || !course.titleEn.trim() || !course.category || !course.level)) {
      toast.error("أكمل عنوان الدورة بالعربية والإنجليزية والتصنيف والمستوى");
      return false;
    }
    if (step === 0 && course.academicCurriculum && (!course.academicStage || !course.academicGrade || !course.subject)) {
      toast.error("أكمل المنهج والمرحلة والصف والمادة، أو اختر دورة عامة");
      return false;
    }
    if (step === 1 && course.curriculum.length === 0) {
      toast.error("أضف قسمًا واحدًا على الأقل للمحتوى");
      return false;
    }
    if (step === 1) {
      const emptySection = course.curriculum.find((section) => !section.lessons?.length);
      if (emptySection) {
        toast.error(`أضف درسًا واحدًا على الأقل داخل قسم «${emptySection.title || "بدون عنوان"}»`);
        return false;
      }
      const sectionWithUntitledLesson = course.curriculum.find((section) =>
        section.lessons.some((lesson) => !lesson.title?.trim()),
      );
      if (sectionWithUntitledLesson) {
        toast.error(`أكمل عنوان كل درس داخل قسم «${sectionWithUntitledLesson.title || "بدون عنوان"}»`);
        return false;
      }
    }
    if (step === 2 && course.pricingType === "paid" && Number(course.price) <= 0) {
      toast.error("أدخل سعرًا صحيحًا للدورة");
      return false;
    }
    if (step === 2 && course.pricingType === "paid" && Number(course.discountPercent || 0) >= 100) {
      toast.error("نسبة الخصم يجب أن تكون أقل من 100%");
      return false;
    }
    return true;
  };

  const next = () => {
    if (validateStep()) setStep((current) => Math.min(3, current + 1));
  };

  const save = async (status = course.status) => {
    if (saving) return;
    if (!course.title.trim() || !course.titleEn.trim() || !course.category || !course.level) {
      toast.error("أكمل عنوان الدورة بالعربية والإنجليزية والتصنيف والمستوى قبل الحفظ");
      setStep(0);
      return;
    }
    if (course.academicCurriculum && (!course.academicStage || !course.academicGrade || !course.subject)) {
      toast.error("أكمل المنهج والمرحلة والصف والمادة قبل الحفظ");
      setStep(0);
      return;
    }
    if (status === "قيد المراجعة") {
      if (!course.cover?.file && !course.cover?.previewUrl && !course.coverImage) {
        toast.error("ارفع صورة غلاف للدورة قبل الإرسال للمراجعة");
        setStep(0);
        return;
      }
      const emptySection = course.curriculum.find((section) => !section.lessons?.length);
      if (!course.curriculum.length || emptySection) {
        toast.error(emptySection
          ? `أضف درسًا واحدًا على الأقل داخل قسم «${emptySection.title || "بدون عنوان"}»`
          : "أضف قسمًا ودرسًا واحدًا على الأقل قبل الإرسال للمراجعة");
        setStep(1);
        return;
      }
      const untitledLesson = course.curriculum.some((section) =>
        section.lessons.some((lesson) => !lesson.title?.trim()),
      );
      if (untitledLesson) {
        toast.error("أكمل عناوين جميع الدروس قبل الإرسال للمراجعة");
        setStep(1);
        return;
      }
      const quizLesson = course.curriculum.find((section) =>
        section.lessons.some((lesson) => lesson.type === "اختبار"),
      );
      if (quizLesson) {
        toast.error(`نوع «اختبار» غير مدعوم كدرس في الـ API الحالي داخل قسم «${quizLesson.title || "بدون عنوان"}». استخدم فيديو أو ملف.`);
        setStep(1);
        return;
      }
      const videoWithoutMedia = course.curriculum.find((section) =>
        section.lessons.some((lesson) => lesson.type === "فيديو" && !lesson.media?.file && !lesson.media?.url),
      );
      if (videoWithoutMedia) {
        toast.error(`ارفع فيديو لكل درس فيديو داخل قسم «${videoWithoutMedia.title || "بدون عنوان"}»`);
        setStep(1);
        return;
      }
      const documentWithoutMedia = course.curriculum.find((section) =>
        section.lessons.some((lesson) => lesson.type === "ملف" && !lesson.media?.file && !lesson.media?.url),
      );
      if (documentWithoutMedia) {
        toast.error(`ارفع ملف كل درس من نوع ملف داخل قسم «${documentWithoutMedia.title || "بدون عنوان"}»`);
        setStep(1);
        return;
      }
    }
    setSaving(true);
    setUploadStatus({ label: "جاري تجهيز الدورة", percent: 0 });
    const savingToast = toast.loading(status === "قيد المراجعة" ? "جاري رفع الملفات وإرسال الدورة..." : "جاري حفظ الدورة...");
    try {
      const saved = await saveCourseToApi({
        course,
        courseId: existingCourse?.id || courseId,
        submit: status === "قيد المراجعة",
        onProgress: setUploadStatus,
      });
      toast.success(existingCourse ? "تم تعديل الدورة بنجاح" : "تم إنشاء الدورة بنجاح", { id: savingToast });
      navigate(returnPath, { replace: true, state: { savedId: saved.id, refresh: true } });
    } catch (error) {
      if (error.savedCourseId) {
        setExistingCourse((current) => ({ ...(current || course), id: error.savedCourseId }));
      }
      const body = error?.response?.data;
      toast.error(body?.message || body?.error || body?.code || error?.message || "تعذر حفظ الدورة", { id: savingToast });
    } finally {
      setSaving(false);
    }
  };

  const addSection = () =>
    update("curriculum", [
      ...course.curriculum,
      { id: crypto.randomUUID(), title: `قسم ${course.curriculum.length + 1}`, lessons: [] },
    ]);

  const updateSection = (sectionId, patch) =>
    update(
      "curriculum",
      course.curriculum.map((section) =>
        section.id === sectionId ? { ...section, ...patch } : section,
      ),
    );

  const removeSection = (sectionId) =>
    update("curriculum", course.curriculum.filter((section) => section.id !== sectionId));

  const addLesson = (sectionId) =>
    updateSection(sectionId, {
      lessons: [
        ...(course.curriculum.find((section) => section.id === sectionId)?.lessons || []),
        { id: crypto.randomUUID(), title: "", type: "فيديو", duration: 0, preview: false, media: null, attachments: [], quiz: [] },
      ],
    });

  const updateLesson = (sectionId, lessonId, patch) => {
    const section = course.curriculum.find((item) => item.id === sectionId);
    if (!section) return;
    updateSection(sectionId, {
      lessons: section.lessons.map((lesson) =>
        lesson.id === lessonId ? { ...lesson, ...patch } : lesson,
      ),
    });
  };

  const activeModalLesson = (modal) => {
    const section = course.curriculum.find((item) => item.id === modal?.sectionId);
    return section?.lessons.find((lesson) => lesson.id === modal?.lessonId);
  };

  const openQuizBuilder = (sectionId, lesson) => {
    if (!lesson.quiz?.length) {
      updateLesson(sectionId, lesson.id, {
        quiz: [{
          id: crypto.randomUUID(),
          text: "",
          options: ["", "", "", ""],
          correctIndex: 0,
          points: 0,
        }],
      });
    }
    setQuizModal({ sectionId, lessonId: lesson.id });
  };

  const totalLessons = course.curriculum.reduce(
    (sum, section) => sum + section.lessons.length,
    0,
  );
  const totalContent = course.curriculum.reduce(
    (sum, section) =>
      sum +
      section.lessons.filter(
        (lesson) => lesson.media || lesson.attachments?.length || lesson.quiz?.length,
      ).length,
    0,
  );
  const coursePrice = Math.max(0, Number(course.price) || 0);
  const discountPercent = Math.min(
    100,
    Math.max(0, Number(course.discountPercent) || 0),
  );
  const discountAmount = coursePrice * (discountPercent / 100);
  const priceAfterDiscount = coursePrice - discountAmount;
  const platformFee = priceAfterDiscount * 0.15;
  const teacherNet = priceAfterDiscount - platformFee;
  const money = (value) =>
    `${Number(value).toLocaleString("ar-EG", { maximumFractionDigits: 2 })} ج.م`;

  const formContent = (
    <div
      dir="rtl"
      className="min-h-screen px-3 pt-1 pb-5 text-right sm:px-5 md:px-8"
    >
      <div className="mx-auto w-full ">
        <div className="mb-4">
          <h1 className="text-[15px] font-bold text-[#123C91] sm:text-[16px]">
            {existingCourse ? "تعديل الدورة" : "إنشاء دورة جديدة"}
          </h1>
          <p className="mt-1 text-xs text-[#667085] sm:text-sm">
            الخطوة {step + 1} من 4 · {STEPS[step]}
          </p>
        </div>

        <div className="mb-4 overflow-x-auto">
          <CourseStepsNavigation currentStep={step + 1} />
        </div>

        <section className="rounded-2xl border border-[#E5E5E5] bg-white px-4 py-6 shadow-[0px_0px_3px_0px_rgba(0,0,0,0.08)] sm:px-8 sm:py-7 md:px-12 md:py-8 lg:px-16">
          {step === 0 && (
            <div className="mx-2 space-y-6 sm:mx-4 sm:space-y-7 sm:-mt-8 md:mx-6 lg:mx-8 lg:-mt-12">
                <div>
                  <h2 className="text-right font-['IBM_Plex_Sans_Arabic'] text-[17px] font-medium text-[#1F2937] sm:text-[18px] md:text-[20px]">المعلومات الأساسية</h2>
                  <p className="mt-1 text-right font-['IBM_Plex_Sans_Arabic'] text-[13px] text-[#575F69] sm:text-[14px] md:text-[16px]">أدخل بيانات الدورة التي ستظهر للطلاب.</p>
                </div>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <label className="block space-y-2 text-right text-[14px] font-medium text-[#1F2937] sm:text-[15px] md:text-[17px]">عنوان الدورة بالعربية *
                    <input className={inputClass} value={course.title} onChange={(e) => update("title", e.target.value)} placeholder="مثال: مقدمة في البرمجة" />
                  </label>
                  <label className="block space-y-2 text-right text-[14px] font-medium text-[#1F2937] sm:text-[15px] md:text-[17px]">عنوان الدورة بالإنجليزية *
                    <input dir="ltr" className={`${inputClass} text-left`} value={course.titleEn} onChange={(e) => update("titleEn", e.target.value)} placeholder="Introduction to Programming" />
                  </label>
                </div>
                <label className="block space-y-2 text-right text-sm font-medium text-[#1F2937]">وصف الدورة
                  <textarea className={`${inputClass} h-20 py-3`} value={course.description} onChange={(e) => update("description", e.target.value)} placeholder="اكتب وصفًا شاملًا للدورة..." />
                </label>
                <label className="block space-y-2 text-right text-sm font-medium text-[#1F2937]">متطلبات الدورة
                  <textarea className={`${inputClass} h-20 py-3`} value={course.requirements} onChange={(e) => update("requirements", e.target.value)} placeholder="اكتب متطلبات الالتحاق بالدورة..." />
                </label>
                <TagsField
                  label="ماذا سيتعلم الطالب؟"
                  values={course.outcomes}
                  onChange={(values) => update("outcomes", values)}
                  placeholder="اكتب ناتج تعلم مثل: إتقان الأساسيات"
                />
                <label className="block space-y-2 text-right text-sm font-medium text-[#1F2937]">لمن هذه الدورة؟
                  <input className={inputClass} value={course.targetAudience || ""} onChange={(e) => update("targetAudience", e.target.value)} placeholder="اكتب الفئات المستهدفة بهذه الدورة..." />
                </label>
                <TagsField
                  label="الوسوم"
                  values={course.tags}
                  onChange={(values) => update("tags", values)}
                  placeholder="مثال: برمجة، مبتدئين"
                />
                <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
                  <label className="space-y-2 text-right text-sm font-medium text-[#1F2937]">التصنيف *
                    <select className={inputClass} value={course.category} onChange={(e) => update("category", e.target.value)}>
                      <option value="">اختر التصنيف</option>
                      {categories.map((item) => (
                        <option key={item._id || item.id} value={item._id || item.id}>
                          {item.name?.ar || item.name?.en || item.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  {isAdminFlow && (
                    <label className="space-y-2 text-right text-sm font-medium text-[#1F2937]">المدرس / الإنستراكتور *
                      <select className={inputClass} value={course.instructorId || ""} onChange={(event) => update("instructorId", event.target.value)}>
                        <option value="">اختر المدرس</option>
                        {instructors.map((teacher) => {
                          const account = teacher.user || teacher;
                          const id = teacher._id || teacher.id || account._id || account.id;
                          const name = account.fullName || account.name || `${account.firstName || ""} ${account.lastName || ""}`.trim() || account.email;
                          return <option key={id} value={id}>{name}</option>;
                        })}
                      </select>
                    </label>
                  )}
                  <label className="space-y-2 text-right text-sm font-medium text-[#1F2937]">المستوى *
                    <select className={inputClass} value={course.level} onChange={(e) => update("level", e.target.value)}>
                      <option value="">اختر المستوى</option>
                      {["مبتدئ", "متوسط", "متقدم", "جميع المستويات"].map((item) => <option key={item}>{item}</option>)}
                    </select>
                  </label>
                  <label className="space-y-2 text-right text-sm font-medium text-[#1F2937]">لغة الشرح *
                    <select className={inputClass} value={course.language} onChange={(e) => update("language", e.target.value)}>
                      <option>عربي</option><option>إنجليزي</option>
                    </select>
                  </label>
                </div>
                {isAdminFlow && categories.length === 0 && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <p className="mb-3 text-sm text-amber-800">لا توجد تصنيفات في الباك حاليًا. أنشئ أول تصنيف قبل حفظ الدورة.</p>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <input
                        className={inputClass}
                        value={newCategory}
                        onChange={(event) => setNewCategory(event.target.value)}
                        placeholder="اسم التصنيف، مثال: برمجة"
                      />
                      <button type="button" onClick={createCategory} className="mt-2 shrink-0 rounded-lg bg-[#123C91] px-5 text-sm font-semibold text-white">
                        إنشاء التصنيف
                      </button>
                    </div>
                  </div>
                )}
                <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-4">
                  <label className="space-y-2 text-right text-sm font-medium text-[#1F2937]">المنهج
                    <select className={inputClass} value={course.academicCurriculum || ""} onChange={(e) => setCourse((current) => ({ ...current, academicCurriculum: e.target.value, academicStage: "", academicGrade: "", subject: "" }))}>
                      <option value="">دورة عامة</option>
                      {curriculums.map((item) => <option key={optionId(item)} value={optionId(item)}>{optionName(item)}</option>)}
                    </select>
                  </label>
                  <label className="space-y-2 text-right text-sm font-medium text-[#1F2937]">المرحلة
                    <select disabled={!course.academicCurriculum} className={`${inputClass} disabled:cursor-not-allowed disabled:opacity-60`} value={course.academicStage || ""} onChange={(e) => setCourse((current) => ({ ...current, academicStage: e.target.value, academicGrade: "", subject: "" }))}>
                      <option value="">اختر المرحلة</option>
                      {stages.map((item) => <option key={optionId(item)} value={optionId(item)}>{optionName(item)}</option>)}
                    </select>
                  </label>
                  <label className="space-y-2 text-right text-sm font-medium text-[#1F2937]">الصف الدراسي
                    <select disabled={!course.academicStage} className={`${inputClass} disabled:cursor-not-allowed disabled:opacity-60`} value={course.academicGrade || ""} onChange={(e) => setCourse((current) => ({ ...current, academicGrade: e.target.value, subject: "" }))}>
                      <option value="">اختر الصف</option>
                      {grades.map((item) => <option key={optionId(item)} value={optionId(item)}>{optionName(item)}</option>)}
                    </select>
                  </label>
                  <label className="space-y-2 text-right text-sm font-medium text-[#1F2937]">المادة
                    <select disabled={!course.academicGrade} className={`${inputClass} disabled:cursor-not-allowed disabled:opacity-60`} value={course.subject || ""} onChange={(e) => update("subject", e.target.value)}>
                      <option value="">اختر المادة</option>
                      {subjects.map((item) => <option key={optionId(item)} value={optionId(item)}>{optionName(item)}</option>)}
                    </select>
                  </label>
                </div>
                <div className="grid gap-6 border-t border-[#EAECF0] pt-6 sm:grid-cols-2">
                  <UploadBox
                    label="صورة الغلاف"
                    accept="image/png,image/jpeg,image/webp"
                    value={course.cover}
                    onChange={(file) => update("cover", file)}
                    onRemove={() => update("cover", "")}
                    icon={ImageIcon}
                  />
                  <UploadBox
                    label="فيديو ترويجي"
                    accept="video/mp4,video/webm,video/quicktime"
                    value={course.promoVideo}
                    onChange={(file) => update("promoVideo", file)}
                    onRemove={() => update("promoVideo", "")}
                    icon={Film}
                  />
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="mx-2 space-y-5 sm:mx-4 sm:-mt-8 md:mx-6 lg:mx-8 lg:-mt-12">
                <div>
                  <h2 className="text-[16px] font-semibold text-[#1F2937] sm:text-[17px]">بناء المنهج الدراسي</h2>
                  <p className="mt-1.5 text-[13px] text-[#667085] sm:text-[14px]">
                    قم ببناء وتنظيم محتوى دورتك التعليمية خطوة بخطوة لتجربة تعلم متكاملة للطلاب.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-3 text-[13px] text-[#667085] sm:gap-4 sm:text-[14px]">
                    <span className="inline-flex items-center gap-1.5"><Layers3 size={14} className="text-[#123C91]" />{course.curriculum.length} أقسام</span>
                    <span className="inline-flex items-center gap-1.5"><Video size={14} className="text-[#123C91]" />{totalLessons} دروس</span>
                    <span>{totalContent} دروس بمحتوى</span>
                  </div>
                  <button type="button" onClick={addSection} className="flex h-10 items-center gap-2 rounded-md bg-[#123C91] px-4 text-sm font-semibold text-white hover:bg-[#0E327A] sm:px-5">
                    <Plus size={16} /> إضافة قسم / وحدة
                  </button>
                </div>
                {course.curriculum.length === 0 && (
                  <button onClick={addSection} className="flex min-h-40 w-full flex-col items-center justify-center rounded-xl border border-dashed border-[#D0D5DD] text-[#667085] sm:min-h-48">
                    <Plus className="mb-2" /> ابدأ بإضافة قسم للمحتوى
                  </button>
                )}
                {course.curriculum.map((section, sectionIndex) => (
                  <div key={section.id} className="overflow-hidden rounded-xl border border-[#DDE2E8] bg-white">
                    <div className="flex items-center gap-2 border-b border-[#E7EBF0] bg-[#EEF6FF] px-3 py-3 sm:px-4">
                      <GripVertical size={16} className="shrink-0 text-[#98A2B3]" />
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#123C91] text-xs font-semibold text-white">{sectionIndex + 1}</span>
                      <input aria-label={`عنوان القسم ${sectionIndex + 1}`} className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-[#344054] outline-none" value={section.title} onChange={(e) => updateSection(section.id, { title: e.target.value })} />
                      <button type="button" aria-label="حذف القسم" onClick={() => removeSection(section.id)} className="shrink-0 rounded p-1 text-[#98A2B3] hover:bg-white hover:text-red-600"><X size={15} /></button>
                    </div>
                    <div>
                      {section.lessons.map((lesson, lessonIndex) => (
                        <div key={lesson.id} className="border-b border-[#EAECF0] px-3 py-3 last:border-b-0 sm:px-4">
                          <div className="flex flex-wrap items-center gap-2 xl:grid xl:flex-nowrap xl:grid-cols-[18px_26px_minmax(170px,1fr)_105px_80px_auto_auto_34px]">
                            <GripVertical size={15} className="hidden shrink-0 text-[#B0B7C3] sm:block" />
                            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#F1F4F8] text-[11px] text-[#667085]">{lessonIndex + 1}</span>
                            <input className="h-9 min-w-[160px] flex-1 basis-full rounded-md border border-transparent px-2 text-sm text-[#344054] outline-none placeholder:text-[#98A2B3] focus:border-[#D0D5DD] sm:basis-auto xl:min-w-0 xl:basis-auto" value={lesson.title} onChange={(e) => updateLesson(section.id, lesson.id, { title: e.target.value })} placeholder="اكتب عنوان الدرس..." />
                            <select className="h-9 shrink-0 rounded-md border border-[#D0D5DD] bg-white px-2 text-xs text-[#475467] outline-none" value={lesson.type} onChange={(e) => updateLesson(section.id, lesson.id, { type: e.target.value, media: null })}>
                              <option>فيديو</option><option>ملف</option><option>اختبار</option>
                            </select>
                            <label className="flex h-9 shrink-0 items-center justify-center gap-1 rounded-md border border-[#E1E5EA] bg-[#FAFAFA] px-2 text-xs text-[#667085]">
                              <input type="number" min="0" className="w-8 bg-transparent text-center outline-none" value={lesson.duration || ""} onChange={(e) => updateLesson(section.id, lesson.id, { duration: Number(e.target.value) })} placeholder="0" />
                              <span>د</span>
                            </label>
                            <label className="flex shrink-0 items-center gap-2 whitespace-nowrap text-xs text-[#475467]">
                              <button type="button" role="switch" aria-checked={Boolean(lesson.preview)} onClick={() => updateLesson(section.id, lesson.id, { preview: !lesson.preview })} className={`relative h-5 w-9 rounded-full transition ${lesson.preview ? "bg-[#12C6B0]" : "bg-[#D0D5DD]"}`}>
                                <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${lesson.preview ? "right-0.5" : "right-4"}`} />
                              </button>
                              معاينة
                            </label>
                            {lesson.type === "اختبار" ? (
                              <button onClick={() => openQuizBuilder(section.id, lesson)} className="h-9 shrink-0 rounded-md border border-[#12C6B0] bg-[#E8FFFC] px-3 text-xs font-semibold text-[#087F72]">
                                {lesson.quiz?.length ? "تعديل الاختبار" : "بناء الاختبار"}
                              </button>
                            ) : (
                              <button onClick={() => setContentModal({ sectionId: section.id, lessonId: lesson.id })} className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md border border-[#D0D5DD] px-3 text-xs font-medium text-[#475467]">
                                <Video size={14} />
                                {lesson.media || lesson.attachments?.length ? "تغيير المحتوى" : "إضافة محتوى +"}
                              </button>
                            )}
                            <button type="button" aria-label="حذف الدرس" onClick={() => updateSection(section.id, { lessons: section.lessons.filter((item) => item.id !== lesson.id) })} className="shrink-0 p-2 text-[#98A2B3] hover:text-red-600"><X size={15} /></button>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {lesson.media?.name && (
                              <span className="rounded-md bg-[#E8FFFC] px-3 py-1.5 text-xs font-medium text-[#087F72]">{lesson.type === "ملف" ? "📎" : "🎬"} {lesson.media.name}</span>
                            )}
                            {lesson.attachments?.map((file) => (
                              <span key={file.name} className="rounded-md bg-[#F2F4F7] px-3 py-1.5 text-xs text-[#475467]">{file.name}</span>
                            ))}
                          </div>
                        </div>
                      ))}
                      <button type="button" onClick={() => addLesson(section.id)} className="flex items-center gap-1 px-4 py-3 text-sm font-semibold text-[#123C91] hover:bg-[#F8FAFC] sm:px-5"><Plus size={15} /> إضافة درس</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {step === 2 && (
              <div className="mx-2 space-y-5 sm:mx-4 sm:-mt-8 md:mx-6 lg:mx-8 lg:-mt-12">
                <div>
                  <h2 className="font-bold text-[#1F2937]">تسعير الدورة</h2>
                  <p className="mt-1 text-[14px] text-[#667085]">
                    حدد سعر الدورة ونوع التسعير، ويمكنك إضافة خصومات.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => update("pricingType", "paid")}
                    className={`min-h-28 rounded-xl border p-4 text-right transition sm:min-h-32 sm:p-5 ${
                      course.pricingType === "paid"
                        ? "border-[#123C91] bg-[#EAF2FF]"
                        : "border-[#E5E7EB] bg-white"
                    }`}
                  >
                    <span className={`grid h-10 w-10 place-items-center rounded-lg ${
                      course.pricingType === "paid"
                        ? "bg-[#123C91] text-white"
                        : "bg-[#F2F4F7] text-[#667085]"
                    }`}>
                      <DollarSign size={20} />
                    </span>
                    <strong className="mt-3 block">مدفوعة</strong>
                    <span className="mt-1 block text-[14px] text-[#667085]">
                      حدد سعرًا مناسبًا للدورة قبل نشرها
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => update("pricingType", "free")}
                    className={`min-h-28 rounded-xl border p-4 text-right transition sm:min-h-32 sm:p-5 ${
                      course.pricingType === "free"
                        ? "border-[#123C91] bg-[#EAF2FF]"
                        : "border-[#E5E7EB] bg-white"
                    }`}
                  >
                    <span className={`grid h-10 w-10 place-items-center rounded-lg ${
                      course.pricingType === "free"
                        ? "bg-[#123C91] text-white"
                        : "bg-[#F2F4F7] text-[#667085]"
                    }`}>
                      <BadgeCheck size={20} />
                    </span>
                    <strong className="mt-3 block">مجانية</strong>
                    <span className="mt-1 block text-xs text-[#667085]">
                      إتاحة الدورة لجميع الطلاب مجانًا
                    </span>
                  </button>
                </div>
                {course.pricingType === "paid" && (
                  <>
                    <label className="block space-y-2 text-sm font-medium text-[#1F2937]">
                      السعر بالجنيه المصري *
                      <input type="number" min="1" className={inputClass} value={course.price} onChange={(e) => update("price", e.target.value)} placeholder="أدخل سعر الدورة" />
                    </label>
                    <label className="block space-y-2 text-sm font-medium text-[#1F2937]">
                      نسبة الخصم
                      <input type="number" min="0" max="99" className={inputClass} value={course.discountPercent || ""} onChange={(e) => update("discountPercent", e.target.value)} placeholder="أدخل النسبة" />
                    </label>
                    <div className="overflow-hidden rounded-xl bg-[#EAF4FF] text-sm text-[#344054]">
                      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 sm:px-5">
                        <strong className="text-[#123C91]">سعر الدورة</strong>
                        <span>{money(coursePrice)}</span>
                      </div>
                      {discountPercent > 0 && (
                        <>
                          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#D7E7FC] px-4 py-3 sm:px-5">
                            <span>الخصم ({discountPercent}%)</span>
                            <span>- {money(discountAmount)}</span>
                          </div>
                          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#D7E7FC] px-4 py-3 sm:px-5">
                            <span>السعر بعد الخصم</span>
                            <strong>{money(priceAfterDiscount)}</strong>
                          </div>
                        </>
                      )}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#D7E7FC] px-4 py-3 sm:px-5">
                        <strong className="text-[#123C91]">رسوم المنصة (15%)</strong>
                        <span>- {money(platformFee)}</span>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#D7E7FC] px-4 py-4 font-bold sm:px-5">
                        <span>صافي أرباحك</span>
                        <span>{money(teacherNet)}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="mx-2 space-y-5 sm:mx-4 sm:-mt-8 md:mx-6 lg:mx-8 lg:-mt-12">
                <div><h2 className="font-bold text-[#1F2937]">مراجعة الدورة</h2><p className="mt-1 text-[14px] text-[#667085]">تأكد من البيانات قبل الإرسال.</p></div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-[#E5E7EB] p-4"><h3 className="mb-3 font-bold">المعلومات الأساسية</h3><dl className="space-y-2 text-[14px]"><div><dt className="text-[#667085]">العنوان</dt><dd>{course.title}</dd></div><div><dt className="text-[#667085]">التصنيف والمستوى</dt><dd>{course.category} · {course.level}</dd></div><div><dt className="text-[#667085]">اللغة</dt><dd>{course.language}</dd></div></dl></div>
                  <div className="rounded-xl border border-[#E5E7EB] p-4"><h3 className="mb-3 font-bold">المحتوى والتسعير</h3><dl className="space-y-2 text-[14px]"><div><dt className="text-[#667085]">الأقسام</dt><dd>{course.curriculum.length} قسم</dd></div><div><dt className="text-[#667085]">الدروس</dt><dd>{course.curriculum.reduce((sum, section) => sum + section.lessons.length, 0)} درس</dd></div><div><dt className="text-[#667085]">السعر</dt><dd>{course.pricingType === "free" ? "مجانية" : `${course.price} جنيه`}</dd></div></dl></div>
                </div>
                <div className="rounded-lg bg-[#EAF4FF] p-3 text-sm text-[#123C91]">بعد الإرسال ستصبح الدورة قيد المراجعة قبل النشر.</div>
              </div>
            )}

            <div className="mx-2 mt-8 flex flex-col items-stretch justify-between gap-3 border-t border-[#EAECF0] pt-5 sm:mx-4 sm:flex-row sm:items-center md:mx-6 lg:mx-8">
              <button onClick={() => step === 0 ? navigate(returnPath) : setStep((current) => current - 1)} className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#D0D5DD] px-4 py-2.5 text-sm sm:w-auto sm:px-5"><ChevronRight size={16} /> {step === 0 ? "إلغاء" : "السابق"}</button>
              <div className="grid w-full grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:flex sm:w-auto">
                {existingCourse && step < 3 ? (
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => save(course.status)}
                    className="w-full rounded-lg border border-[#123C91] bg-[#EAF2FF] px-4 py-2.5 text-sm font-semibold text-[#123C91] transition hover:bg-[#DCE9FF] sm:w-auto sm:px-5"
                  >
                    حفظ التعديلات
                  </button>
                ) : !existingCourse ? (
                  <button type="button" disabled={saving} onClick={() => save("مسودة")} className="w-full rounded-lg border border-[#D0D5DD] px-4 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-5">{saving ? "جاري الحفظ..." : "حفظ كمسودة"}</button>
                ) : null}
                {step < 3 ? (
                  <button type="button" onClick={next} className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#123C91] px-5 py-2.5 text-sm font-semibold text-white sm:w-auto sm:px-7">التالي <ChevronLeft size={16} /></button>
                ) : (
                  <button
                    type="button"
                    disabled={saving}
                    aria-busy={saving}
                    onClick={() => save("قيد المراجعة")}
                    className="w-full rounded-lg bg-[#123C91] px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-70 sm:w-auto sm:px-7"
                  >
                    {saving ? `${uploadStatus.label}${uploadStatus.percent ? ` (${uploadStatus.percent}%)` : "..."}` : existingCourse ? "حفظ وإرسال للمراجعة" : "إرسال للمراجعة"}
                  </button>
                )}
              </div>
            </div>
            {saving && (
              <div className="mx-2 mt-3 sm:mx-4 md:mx-6 lg:mx-8" dir="rtl">
                <div className="mb-1 flex justify-between text-xs text-[#667085]"><span>{uploadStatus.label}</span><span>{uploadStatus.percent}%</span></div>
                <div className="h-2 overflow-hidden rounded-full bg-[#E5E7EB]"><div className="h-full rounded-full bg-[#12AFA0] transition-all" style={{ width: `${uploadStatus.percent}%` }} /></div>
              </div>
            )}
          </section>

          {contentModal && (
            <div className="fixed inset-0 z-[70] grid place-items-center bg-black/45 p-3 sm:p-4">
              <div dir="rtl" className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-4 shadow-2xl sm:p-5">
                <div className="mb-4 flex items-start justify-between">
                  <div className="min-w-0">
                    <h3 className="font-bold text-[#1F2937]">ملفات الدرس</h3>
                    <p className="mt-1 truncate text-xs text-[#667085]">{activeModalLesson(contentModal)?.title || "الدرس"}</p>
                  </div>
                  <button onClick={() => setContentModal(null)} className="shrink-0 p-1 text-[#667085]"><X size={18} /></button>
                </div>
                <label className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#D0D5DD] p-4 text-center text-sm text-[#475467] sm:min-h-36">
                  <UploadCloud className="mb-3 text-[#123C91]" size={30} />
                  {activeModalLesson(contentModal)?.type === "ملف"
                    ? "اسحب الملف هنا أو اضغط للاختيار"
                    : "اسحب الفيديو هنا أو اضغط للاختيار"}
                  <span className="mt-1 text-xs text-[#98A2B3]">
                    {activeModalLesson(contentModal)?.type === "ملف"
                      ? "PDF, DOC, DOCX, PPT, PPTX, JPG, PNG"
                      : "MP4, WebM, MOV"}
                  </span>
                  <input
                    type="file"
                    accept={activeModalLesson(contentModal)?.type === "ملف"
                      ? ".pdf,.doc,.docx,.ppt,.pptx,image/jpeg,image/png"
                      : "video/mp4,video/webm,video/quicktime"}
                    className="sr-only"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;
                      updateLesson(contentModal.sectionId, contentModal.lessonId, {
                        media: {
                          file,
                          name: file.name,
                          type: file.type,
                          size: file.size,
                          previewUrl: URL.createObjectURL(file),
                        },
                      });
                    }}
                  />
                </label>
                {activeModalLesson(contentModal)?.type === "فيديو" && activeModalLesson(contentModal)?.media?.previewUrl && (
                  <video controls className="mt-4 max-h-72 w-full rounded-xl bg-black" src={activeModalLesson(contentModal).media.previewUrl}>
                    متصفحك لا يدعم تشغيل الفيديو.
                  </video>
                )}
                <div className="mt-5 flex flex-wrap gap-3">
                  <button onClick={() => setContentModal(null)} className="min-w-[100px] flex-1 rounded-lg border border-[#D0D5DD] py-2.5 text-sm">إلغاء</button>
                  <button onClick={() => setContentModal(null)} className="min-w-[100px] flex-1 rounded-lg bg-[#123C91] py-2.5 text-sm font-semibold text-white">تأكيد</button>
                </div>
              </div>
            </div>
          )}

          {quizModal && activeModalLesson(quizModal) && (
            <div className="absolute inset-0 z-[70] overflow-y-auto bg-[#F7F8FC] p-3 sm:p-4 md:p-7">
              <div dir="rtl" className="mx-auto max-w-5xl">
                <div className="mb-5 flex items-start justify-between gap-3">
                  <div className="min-w-0"><h2 className="text-lg font-bold text-[#1F2937] sm:text-xl">بناء الاختبار</h2><p className="mt-1 truncate text-sm text-[#667085]">{activeModalLesson(quizModal).title || "اختبار الدرس"}</p></div>
                  <button onClick={() => setQuizModal(null)} className="shrink-0 p-2 text-[#667085]"><X /></button>
                </div>
                <div className="mb-4 rounded-lg bg-[#EAF4FF] p-3 text-sm text-[#475467]">
                  أضف الأسئلة وحدد الإجابة الصحيحة لكل سؤال. يمكنك إضافة 4 خيارات لكل سؤال.
                </div>
                <div className="space-y-4">
                  {activeModalLesson(quizModal).quiz.map((question, questionIndex) => (
                    <div key={question.id} className="rounded-xl border border-[#E5E7EB] bg-white p-4 sm:p-5">
                      <div className="mb-4 flex items-center justify-between">
                        <strong>السؤال {questionIndex + 1}</strong>
                        <button
                          onClick={() => updateLesson(quizModal.sectionId, quizModal.lessonId, {
                            quiz: activeModalLesson(quizModal).quiz.filter((item) => item.id !== question.id),
                          })}
                          className="text-red-600"
                        ><Trash2 size={17} /></button>
                      </div>
                      <label className="block space-y-2 text-sm">نص السؤال
                        <textarea
                          className={`${inputClass} h-20 py-3`}
                          value={question.text}
                          onChange={(event) => updateLesson(quizModal.sectionId, quizModal.lessonId, {
                            quiz: activeModalLesson(quizModal).quiz.map((item) => item.id === question.id ? { ...item, text: event.target.value } : item),
                          })}
                          placeholder="اكتب سؤالك هنا..."
                        />
                      </label>
                      <p className="mt-4 mb-2 text-xs text-[#667085]">الاختيارات — اضغط على الدائرة لتحديد الإجابة الصحيحة</p>
                      <div className="space-y-2">
                        {question.options.map((option, optionIndex) => (
                          <label key={optionIndex} className={`flex items-center gap-3 rounded-lg border p-3 ${question.correctIndex === optionIndex ? "border-[#12C6B0] bg-[#E8FFFC]" : "border-[#E5E7EB]"}`}>
                            <input
                              type="radio"
                              checked={question.correctIndex === optionIndex}
                              onChange={() => updateLesson(quizModal.sectionId, quizModal.lessonId, {
                                quiz: activeModalLesson(quizModal).quiz.map((item) => item.id === question.id ? { ...item, correctIndex: optionIndex } : item),
                              })}
                              className="shrink-0 accent-[#12C6B0]"
                            />
                            <input
                              className="w-full min-w-0 bg-transparent text-sm outline-none"
                              value={option}
                              onChange={(event) => updateLesson(quizModal.sectionId, quizModal.lessonId, {
                                quiz: activeModalLesson(quizModal).quiz.map((item) => item.id === question.id ? { ...item, options: item.options.map((value, index) => index === optionIndex ? event.target.value : value) } : item),
                              })}
                              placeholder={`الخيار ${optionIndex + 1}`}
                            />
                          </label>
                        ))}
                      </div>
                      <label className="mt-4 flex flex-wrap items-center justify-end gap-2 text-sm">درجة السؤال
                        <input type="number" min="0" className="h-10 w-24 rounded-lg border border-[#E5E7EB] px-3" value={question.points} onChange={(event) => updateLesson(quizModal.sectionId, quizModal.lessonId, {
                          quiz: activeModalLesson(quizModal).quiz.map((item) => item.id === question.id ? { ...item, points: Number(event.target.value) } : item),
                        })} />
                      </label>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => updateLesson(quizModal.sectionId, quizModal.lessonId, {
                    quiz: [...activeModalLesson(quizModal).quiz, { id: crypto.randomUUID(), text: "", options: ["", "", "", ""], correctIndex: 0, points: 0 }],
                  })}
                  className="mt-4 font-semibold text-[#123C91]"
                ><Plus size={16} className="inline" /> إضافة سؤال</button>
                <div className="mt-6 flex flex-wrap justify-between gap-3">
                  <button onClick={() => setQuizModal(null)} className="rounded-lg border border-[#D0D5DD] px-6 py-3 sm:px-8">إلغاء</button>
                  <button onClick={() => { setQuizModal(null); toast.success("تم حفظ الاختبار"); }} className="rounded-lg bg-[#123C91] px-6 py-3 font-semibold text-white sm:px-10">حفظ الاختبار</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );

  if (!useTeacherLayout) {
    return formContent;
  }

  return isAdminFlow ? (
    <AdminLayout contentClassName="!p-0">{formContent}</AdminLayout>
  ) : (
    <TeacherLayout contentClassName="!p-0">{formContent}</TeacherLayout>
  );
};

export default TeacherCourseFormPage;
