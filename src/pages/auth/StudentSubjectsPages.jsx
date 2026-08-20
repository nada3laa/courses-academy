import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import logo from "../../assets/icons/logo.svg";
import AuthLayout from "../../components/auth/AuthLayout";
import {
  completeStudentProfile,
  getMyProfile,
  getSubjects,
} from "../../services/APIService";

const normalizeSubjects = (raw) => {
  const list = Array.isArray(raw) ? raw : raw?.data || [];
  return list.map((s) => ({
    id: s.id ?? s._id,
    name: s.name?.ar || s.name?.en || s.name || "—",
  }));
};

const StudentSubjectsPages = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  const {
    curriculumId,
    stageId,
    gradeId,
    studentType,
  } = state || {};

  const [subjects, setSubjects] = useState([]);
  const [selected, setSelected] = useState([]);
  const [birthDate, setBirthDate] = useState("");
  const [studyLanguage, setStudyLanguage] = useState("ar");
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!gradeId || !stageId || !curriculumId) {
      navigate("/select-account-type");
      return;
    }

    const load = async () => {
      setLoadingSubjects(true);
      try {
        const res = await getSubjects({
          curriculum: curriculumId,
          stage: stageId,
          grade: gradeId,
        });
        setSubjects(normalizeSubjects(res.data));
      } catch {
        toast.error("تعذر تحميل المواد، حاول مرة أخرى");
      } finally {
        setLoadingSubjects(false);
      }
    };
    load();
  }, [gradeId, stageId, curriculumId, navigate]);

  const toggle = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  const handleSubmit = async () => {
    if (selected.length === 0) {
      toast.error("يرجى اختيار مادة واحدة على الأقل");
      return;
    }
    if (!birthDate) {
      toast.error("يرجى إدخال تاريخ الميلاد");
      return;
    }

    setSubmitting(true);
    try {
      const profilePayload = {
        birthDate,
        studyLanguage,
        curriculum: curriculumId,
        stage: stageId,
        grade: gradeId,
        preferredSubjects: selected,
        studentType: studentType || "school",
      };

      try {
        const response = await completeStudentProfile(profilePayload);
        const token = response.data?.token;
        if (token) localStorage.setItem("token", token);
      } catch (error) {
        const message = String(error.response?.data?.message || "");
        if (
          !["PROFILE_ALREADY_EXISTS", "PROFILE_ALREADY_COMPLETED"].includes(
            message,
          )
        ) {
          throw error;
        }
      }

      const profileResponse = await getMyProfile();
      const profile =
        profileResponse.data?.data?.student ||
        profileResponse.data?.data;
      const studentId = profile?.id || profile?._id;
      if (!studentId) throw new Error("STUDENT_PROFILE_ID_MISSING");

      const selectedSubjects = subjects.filter((subject) =>
        selected.includes(subject.id),
      );

      navigate("/register/packages", {
        state: {
          ...(state || {}),
          studentId,
          skipProfileCreation: true,
          selectedSubjects,
        },
      });
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "تعذر استكمال ملف الطالب وتحميل خيارات الاشتراك",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <div className="relative w-full max-w-175 mx-auto p-6" dir="rtl">
        <button type="button" onClick={() => navigate(-1)} className="mb-4 inline-flex items-center gap-2 text-[14px] font-medium text-[#123C91] hover:underline">
          <ArrowRight size={17} /> رجوع
        </button>
        <Link to="/">
          <img src={logo} alt="logo" className="w-44 h-8 mb-4 cursor-pointer" />
        </Link>
        <h2 className="text-[24px] font-bold mb-4 text-[#1F2937]">
          مرحباً بك...
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <div>
            <label className="block text-[13px] font-medium text-[#1F2937] mb-1">
              تاريخ الميلاد
            </label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full h-12 px-4 rounded-lg border border-[#1F293733] bg-[#F9FAFA] focus:outline-none focus:border-[#123C91] text-[14px] text-[#1F2937]"
              required
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-[#1F2937] mb-1">
              لغة الدراسة
            </label>
            <div className="grid grid-cols-2 gap-0 border border-[#1F293733] rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => setStudyLanguage("ar")}
                className={`h-12 text-[14px] font-medium transition-colors ${
                  studyLanguage === "ar"
                    ? "bg-[#123C91] text-white [&_svg]:text-white"
                    : "bg-white text-[#6B7280] hover:bg-[#F9FAFA]"
                }`}
              >
                عربي
              </button>
              <button
                type="button"
                onClick={() => setStudyLanguage("en")}
                className={`h-12 text-[14px] font-medium transition-colors border-r border-[#1F293733] ${
                  studyLanguage === "en"
                    ? "bg-[#123C91] text-white [&_svg]:text-white"
                    : "bg-white text-[#6B7280] hover:bg-[#F9FAFA]"
                }`}
              >
                إنجليزي
              </button>
            </div>
          </div>
        </div>

        <label className="block text-[13px] font-medium text-[#1F2937] mb-2">
          المواد التي ترغب في الالتحاق بها
        </label>

        {loadingSubjects ? (
          <div className="flex items-center gap-2 mb-6">
            <div className="w-4 h-4 border-2 border-[#123C91] border-t-transparent rounded-full animate-spin" />
            <p className="text-[14px] text-[#9CA3AF]">جاري تحميل المواد...</p>
          </div>
        ) : subjects.length === 0 ? (
          <p className="text-[14px] text-[#9CA3AF] mb-6">
            لا توجد مواد متاحة لهذا الصف حالياً
          </p>
        ) : (
          <div className="flex flex-wrap gap-2 mb-8">
            {subjects.map((subject) => {
              const isSelected = selected.includes(subject.id);
              return (
                <button
                  key={subject.id}
                  type="button"
                  onClick={() => toggle(subject.id)}
                  className={`px-4 py-2 rounded-full border text-[14px] font-medium transition-colors ${
                    isSelected
                      ? "bg-[#123C91] text-white [&_svg]:text-white border-[#123C91]"
                      : "bg-white text-[#1F2937] border-[#1F293733] hover:border-[#123C91]"
                  }`}
                >
                  {subject.name}
                </button>
              );
            })}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={submitting || loadingSubjects}
          className="w-full h-14 rounded-lg bg-[#123C91] text-white [&_svg]:text-white font-medium text-[16px] flex items-center justify-center disabled:opacity-70 transition-opacity"
          style={{ fontFamily: "Tajawal, sans-serif" }}
        >
          {submitting ? "جاري تجهيز الاشتراك..." : "التالي"}
        </button>

        <div className="flex items-center justify-center gap-1 pt-4">
          <span className="text-[14px] text-[#1F2937]">لديك حساب؟</span>
          <button
            onClick={() => navigate("/login")}
            className="text-[14px] font-medium text-[#123C91] border-b border-[#123C91]"
          >
            تسجيل الدخول
          </button>
        </div>
      </div>
    </AuthLayout>
  );
};

export default StudentSubjectsPages;
