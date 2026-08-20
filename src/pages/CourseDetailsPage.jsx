import { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { BookOpen, Check, ChevronDown, ChevronLeft, FileText, Globe2, LoaderCircle, LockKeyhole, Video } from "lucide-react";
import pythonCover from "../assets/courses/python-course.png";
import { AuthContext } from "../context/AuthContext";
import { fetchPublicCourse } from "../features/course-management/api/coursesApi";
import { enrollInCourse, isEnrolledInCourse } from "../utils/courseEnrollments";

export default function CourseDetailsPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openSection, setOpenSection] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchPublicCourse(slug)
      .then((item) => active && setCourse(item))
      .catch((err) => active && setError(err?.response?.data?.message || "لم يتم العثور على الدورة."))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [slug]);

  if (loading) return <PageState><LoaderCircle className="animate-spin" />جاري تحميل تفاصيل الدورة...</PageState>;
  if (error || !course?.id) return <PageState><BookOpen /><span>{error || "لم يتم العثور على الدورة."}</span><Link to="/courses" className="font-bold text-[#123C91]">العودة إلى الدورات</Link></PageState>;

  const enrolled = isEnrolledInCourse(user, course.slug);
  const sections = course.curriculum || [];
  const lessonsCount = course.lessons || sections.reduce((total, section) => total + section.lessons.length, 0);
  const subscribe = () => {
    if (!user) {
      toast.error("سجّل الدخول أولًا للاشتراك في الدورة");
      navigate("/login", { state: { from: `/courses/${course.slug}` } });
    } else if (enrolled) navigate("/student-dashboard/courses");
    else if (course.price > 0) navigate(`/payment/courses/${course.slug}`);
    else {
      enrollInCourse(user, course.slug);
      toast.success("تم الاشتراك في الدورة بنجاح");
      navigate("/student-dashboard/courses");
    }
  };

  return <div dir="rtl" className="min-h-screen bg-[#F6F8FB] pb-20 text-[#202936]">
    <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6">
      <nav className="mb-7 flex items-center gap-2 text-sm text-[#8B94A0]">
        <Link to="/" className="text-[#123C91]">الرئيسية</Link><ChevronLeft size={14} />
        <Link to="/courses" className="text-[#123C91]">الدورات</Link><ChevronLeft size={14} /><span>{course.title}</span>
      </nav>
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <main className="space-y-6">
          <img src={course.coverImage || pythonCover} alt={course.title} className="aspect-video w-full rounded-xl bg-white object-cover shadow-sm" />
          <Box title="وصف الدورة"><p className="whitespace-pre-line leading-8 text-[#667085]">{course.description || "لا يوجد وصف متاح."}</p></Box>
          <Box title="محتوى الدورة">
            <p className="mb-4 text-sm text-[#667085]">{sections.length} قسم • {lessonsCount} درس</p>
            {sections.length ? <div className="overflow-hidden rounded-lg border">
              {sections.map((section, index) => <div key={section.id || index} className="border-b last:border-0">
                <button type="button" onClick={() => setOpenSection(openSection === index ? -1 : index)} className="flex w-full justify-between bg-[#F7F9FC] px-5 py-4 font-bold">
                  {section.title || `القسم ${index + 1}`}<ChevronDown className={openSection === index ? "rotate-180" : ""} size={18} />
                </button>
                {openSection === index && section.lessons.map((lesson, lessonIndex) => <div key={lesson.id || lessonIndex} className="flex justify-between border-t px-5 py-3 text-sm">
                  <span className="flex gap-2">{lesson.type === "video" ? <Video size={16} /> : <FileText size={16} />}{lesson.title}</span>
                  {lesson.preview ? <span className="text-[#0A9B72]">معاينة</span> : <LockKeyhole size={15} />}
                </div>)}
              </div>)}
            </div> : <p className="text-[#667085]">لا يوجد محتوى متاح حاليًا.</p>}
          </Box>
          {!!course.requirements?.length && <Box title="المتطلبات"><List items={course.requirements} /></Box>}
          {!!course.targetAudience?.length && <Box title="لمن هذه الدورة؟"><List items={course.targetAudience} /></Box>}
        </main>
        <aside className="order-first rounded-xl border bg-white p-7 shadow-sm lg:order-none lg:sticky lg:top-5">
          <h1 className="text-2xl font-extrabold leading-10">{course.title}</h1>
          <p className="mt-2 font-semibold text-[#123C91]">{course.instructor}</p>
          <div className="my-6 border-y py-5 text-center"><small className="block text-[#8B95A1]">السعر</small><strong className="text-2xl text-[#123C91]">{course.price ? `${course.price} ج.م` : "مجاني"}</strong></div>
          <ul className="mb-6 space-y-3 text-sm text-[#5F6A78]"><li className="flex gap-2"><BookOpen size={17} />{lessonsCount} درس</li><li className="flex gap-2"><Globe2 size={17} />{course.language}</li><li className="flex gap-2"><Check size={17} />{course.level}</li></ul>
          <button type="button" onClick={subscribe} className="h-12 w-full rounded-md bg-[#123C91] font-bold text-white">{enrolled ? "اذهب إلى دوراتي" : "اشترك في الدورة الآن"}</button>
        </aside>
      </div>
    </div>
  </div>;
}

function PageState({ children }) { return <div dir="rtl" className="flex min-h-[60vh] flex-col items-center justify-center gap-4 bg-[#F6F8FB] text-[#667085]">{children}</div>; }
function Box({ title, children }) { return <section className="rounded-xl bg-white p-6 shadow-sm"><h2 className="mb-5 text-xl font-extrabold">{title}</h2>{children}</section>; }
function List({ items }) { return <ul className="space-y-3 text-[#667085]">{items.map((item) => <li key={item} className="flex gap-2"><Check size={17} className="shrink-0 text-[#12AFA0]" />{item}</li>)}</ul>; }
