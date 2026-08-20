import { useContext, useState, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Award,
  BookOpen,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  Clock3,
  FileText,
  Globe2,
  Heart,
  LockKeyhole,
  PlayCircle,
  Share2,
  Star,
  Users,
  Video,
} from "lucide-react";
import { AuthContext } from "../../../../context/AuthContext";
import { courses } from "../../../../data/staticData";
import { getCourseContent } from "../../../../data/courseContent";
import { instructors } from "../../../../data/instructorsData";
import { enrollInCourse, isEnrolledInCourse } from "../../../../utils/courseEnrollments";
import StudentLayout from "../../../../components/student/layout/StudentLayout";

const reviews = [
  ["أحمد سامي", "أ.س", "شرح رائع وبسيط جدًا، استفدت من التطبيق العملي."],
  ["سارة علي", "س.ع", "الكورس منظم والمدرب يشرح كل خطوة بوضوح."],
  ["محمد خالد", "م.خ", "أنصح به لكل شخص يريد أن يبدأ البرمجة."],
  ["مريم حسن", "م.ح", "المحتوى ممتاز والتدريبات ساعدتني على الفهم."],
  ["عمر محمود", "ع.م", "أسلوب الشرح واضح والمعلومات مرتبة بشكل ممتاز."],
  ["نور أحمد", "ن.أ", "أحببت الأمثلة العملية وسهولة متابعة المحاضرات."],
  ["يوسف علي", "ي.ع", "دورة مفيدة جدًا وساعدتني في كتابة أول برنامج."],
  ["هدى محمد", "هـ.م", "تجربة ممتازة ومناسبة تمامًا للمبتدئين."],
];

export default function MyCourseDetailsPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const course = courses.find((item) => item.slug === slug) || courses[0];
  const content = useMemo(() => (course ? getCourseContent(course.id) : null), [course]);
  const instructor = instructors.find((item) => item.name === course?.instructor);
  const enrolled = isEnrolledInCourse(user, course.slug);

  const [openSection, setOpenSection] = useState(0);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);

  const toggleSection = (index) => setOpenSection((current) => (current === index ? -1 : index));

  const handleSubscribe = () => {
    if (!user) {
      toast.error("سجّل الدخول أولاً للاشتراك في الدورة");
      navigate("/login", { state: { from: `/my-courses/${course.slug}` } });
      return;
    }

    if (enrolled) {
      navigate(`/learn/${course.slug}`);
      return;
    }

    if (Number(course.price) > 0) {
      navigate(`/payment/courses/${course.slug}`);
      return;
    }

    enrollInCourse(user, course.slug);
    toast.success("تم الاشتراك في الدورة المجانية بنجاح");
    navigate(`/learn/${course.slug}`);
  };

  const handleLessonClick = (lesson) => {
    if (enrolled || lesson.isFree) {
      navigate(`/learn/${course.slug}`);
    } else {
      toast.error("يجب الاشتراك في الدورة لمشاهدة هذا الدرس");
    }
  };

  if (!course || !content) {
    return (
      <StudentLayout>
        <div className="min-h-[60vh] bg-white py-24 text-center font-['Tajawal']" dir="rtl">
          <h1 className="mb-5 text-3xl font-bold text-[#1F2937]">الكورس غير موجود ضمن كورساتك</h1>
          <Link to="/courses" className="font-semibold text-[#123C91] hover:underline">تصفح الدورات</Link>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div dir="rtl" className="min-h-screen  pb-20 text-[#202936] font-['IBM_Plex_Sans_Arabic']">
        <div className="mx-auto w-full px-4 pt-6 sm:px-6 lg:px-8">
          
          {/* Breadcrumb */}
          {/* <nav className="mb-9 flex items-center gap-2.5 text-[14px] text-[#8B94A0] font-['Tajawal']">
            <Link to="/" className="font-semibold text-[#123C91]">الرئيسية</Link>
            <ChevronLeft size={12} />
            <Link to="/student/courses" className="font-semibold text-[#123C91]">كورساتي</Link>
            <ChevronLeft size={12} />
            <span className="text-[#202936] font-medium">{course.title}</span>
          </nav> */}

          <div className="grid items-start gap-11 lg:grid-cols-[minmax(0,1fr)_360px]">
            
            {/* Main Content */}
            <main>
              {/* Interactive Video Container */}
              <div className="overflow-hidden rounded-t-[6px] border border-[#E4E9EF] bg-black relative aspect-video">
                {isPlayingVideo ? (
                  <iframe
                    className="w-full h-full"
                    src={course.videoUrl || "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"}
                    title={course.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <div className="relative w-full h-full flex items-center justify-center bg-[#123C91]">
                    {course.image ? (
                      <img
                        src={course.image}
                        alt={course.title}
                        className="w-full h-full object-cover opacity-60"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-[#123C91] to-[#0F3278]" />
                    )}
                    <button
                      onClick={() => setIsPlayingVideo(true)}
                      className="absolute z-10 flex flex-col items-center justify-center group cursor-pointer"
                    >
                      <div className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center text-[#123C91] shadow-lg group-hover:scale-110 transition-transform">
                        <PlayCircle size={48} className="fill-[#123C91] text-white" />
                      </div>
                      <span className="mt-3 text-white font-bold text-base font-['Tajawal'] bg-black/40 px-4 py-1.5 rounded-full backdrop-blur-sm">
                        معاينة الفيديو التعريفي
                      </span>
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-4 overflow-hidden rounded-b-[6px] border-x border-b border-[#E4E9EF] bg-[#F7FAFC]">
                <Info icon={<CalendarDays size={13} />} label="آخر تحديث" value="8/2024" />
                <Info icon={<Globe2 size={13} />} label="اللغة" value="العربية" />
                <Info icon={<Star size={13} className="fill-[#F5A623] text-[#F5A623]" />} label="التقييم" value={course.rating || "4.7"} />
                <Info icon={<Users size={13} />} label="عدد الطلاب" value={`${course.students || 250} طالبًا`} />
              </div>

              <Section title="تتضمن هذه الدورة ما يأتي:">
                <ul className="space-y-2 text-[15px] leading-7 text-[#657181]">
                  <li>• أكثر من {course.duration || 10} ساعات من الفيديو حسب الطلب</li>
                  <li>• مقالات وموارد قابلة للتحميل</li>
                  <li>• تمارين واختبارات عملية</li>
                  <li>• وصول كامل مدى الحياة وشهادة إتمام معتمدة</li>
                </ul>
              </Section>

              <Section title="محتوى الدورة">
                <div className="mb-4 flex gap-5 text-[13px] text-[#7E8996]">
                  <span>{content.chapters.length} أقسام</span>
                  <span>{course.lessons || 17} محاضرة</span>
                  <span>{course.duration || 5} ساعة</span>
                </div>
                <div className="overflow-hidden rounded-[4px] border border-[#DFE5EB]">
                  {content.chapters.map((chapter, index) => {
                    const isOpen = openSection === index;
                    return (
                      <div key={chapter.id} className={index > 0 ? "border-t border-[#DFE5EB]" : ""}>
                        <button
                          type="button"
                          onClick={() => toggleSection(index)}
                          aria-expanded={isOpen}
                          className="flex w-full items-center justify-between bg-[#F7F8FA] px-4 py-3.5 text-right transition-colors hover:bg-[#F0F4F8]"
                        >
                          <div>
                            <p className="text-[15px] font-bold font-['Tajawal']">القسم {index + 1}: {chapter.title}</p>
                            <p className="mt-1 text-[11px] text-[#89939F]">
                              {chapter.lessons?.length || 0} محاضرات • {chapter.duration || "خلاصة القسم"}
                            </p>
                          </div>
                          <ChevronDown size={18} className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                        </button>
                        
                        {isOpen && (
                          <div className="bg-white">
                            {chapter.lessons && chapter.lessons.length > 0 ? (
                              chapter.lessons.map((lesson, lIdx) => (
                                <div 
                                  key={lIdx} 
                                  onClick={() => handleLessonClick(lesson)}
                                  className="flex items-center justify-between border-t border-[#ECF0F3] px-4 py-3.5 text-[14px] cursor-pointer hover:bg-[#F8FBFF] transition-colors"
                                >
                                  <span className="flex items-center gap-2 text-[#657181]">
                                    {enrolled || lesson.isFree ? (
                                      <Video size={16} className="text-[#123C91]" />
                                    ) : (
                                      <LockKeyhole size={15} className="text-[#8B95A1]" />
                                    )}
                                    {lesson.title || lesson}
                                  </span>
                                  <span className="text-[11px] text-[#89939F]">{lesson.duration || "15 دقيقة"}</span>
                                </div>
                              ))
                            ) : (
                              <div className="px-4 py-4 text-[14px] text-[#687382]">
                                سيتم عرض دروس هذا القسم هنا عند توفرها.
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Section>

              <Section title="المتطلبات">
                <List items={content.requirements || ["لا يشترط وجود خبرة سابقة في البرمجة", "جهاز كمبيوتر واتصال بالإنترنت", "الرغبة في التعلم والتطبيق"]} />
              </Section>

              <Section title="وصف الدورة">
                <p className="text-[15px] leading-8 text-[#687382]">
                  {course.description}
                </p>
              </Section>

              <Section title="لمن هذه الدورة؟">
                <List items={content.audience || ["المبتدئون في مجال البرمجة", "الطلاب الراغبون في التعلم", "كل من يريد دخول مجال تطوير البرمجيات"]} />
              </Section>

              <section className="!py-9">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                  <h2 className="text-[20px] font-extrabold font-['Tajawal']">{course.rating || "4.7"} من تقييمات الدورة • {course.students || 250} من التقييمات</h2>
                  <div className="flex gap-0.5 text-[#F5A623]">{[1, 2, 3, 4, 5].map(n => <Star key={n} size={16} className="fill-current" />)}</div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {(showAllReviews ? reviews : reviews.slice(0, 4)).map(([name, initials, text], idx) => (
                    <article key={idx} className="rounded-[6px] border border-[#E1E6EC] p-5">
                      <div className="flex gap-4">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F2D2B8] text-[12px] font-bold">{initials}</span>
                        <div>
                          <h3 className="text-[14px] font-bold font-['Tajawal']">{name}</h3>
                          <div className="my-1.5 flex text-[#F5A623]">{[1, 2, 3, 4, 5].map(n => <Star key={n} size={11} className="fill-current" />)}</div>
                          <p className="text-[14px] leading-7 text-[#727D8A]">{text}</p>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setShowAllReviews((visible) => !visible)}
                  className="mx-auto mt-5 block rounded-md px-4 py-2 text-[14px] font-bold text-[#123C91] transition-colors hover:bg-[#EEF4FF]"
                >
                  {showAllReviews ? "عرض تقييمات أقل" : "عرض جميع التقييمات"}
                </button>
              </section>
            </main>

            {/* Sidebar Sticky Card */}
            <aside className="order-first border border-[#DDE3E9] bg-white p-7 shadow-[0_3px_14px_rgba(22,44,77,.05)] lg:order-none lg:sticky lg:top-5 rounded-lg">
              <h1 className="text-[22px] font-extrabold leading-9 font-['Tajawal']">{course.title}</h1>
              {instructor && (
                <p className="mt-3 text-[14px] font-semibold text-[#123C91]">
                  المحاضر: <Link to={`/instructor/${instructor.slug}`} className="font-normal hover:underline">{course.instructor}</Link>
                </p>
              )}
              
              <div className="my-6 grid grid-cols-3 border-y border-[#EDF0F3] py-5 text-center">
                <Metric label="عدد الطلاب" value={course.students || "1,200"} />
                <Metric label="مدة الدورة" value={`${course.duration || 17.5} ساعة`} bordered />
                <Metric label="السعر" value={course.price ? `${course.price} ج.م` : "مجاني"} price />
              </div>

              <ul className="space-y-4 text-[#5F6A78]">
                <AsideRow icon={<Clock3 size={14} className="text-[#123C91]" />} text={`${course.duration || 12} ساعة من المحتوى التعليمي`} />
                <AsideRow icon={<Video size={14} className="text-[#123C91]" />} text="فيديوهات عالية الجودة" />
                <AsideRow icon={<FileText size={14} className="text-[#123C91]" />} text="ملفات ومصادر قابلة للتحميل" />
                <AsideRow icon={<BookOpen size={14} className="text-[#123C91]" />} text="وصول كامل مدى الحياة" />
                <AsideRow icon={<Check size={14} className="text-[#123C91]" />} text="شهادة إتمام الدورة" />
              </ul>

              <button
                type="button"
                onClick={handleSubscribe}
                className="mt-7 flex h-12 w-full items-center justify-center rounded-[4px] bg-[#123C91] text-[15px] font-bold text-white hover:bg-[#0F3278] transition-all font-['Tajawal']"
              >
                {enrolled ? "الدخول إلى الدورة" : "اشترك في الدورة الآن"}
              </button>

              <div className="mt-3.5 flex gap-3">
                <button className="flex h-10 flex-1 items-center justify-center gap-2 border border-[#DDE3E9] text-[13px] text-[#65707E] hover:bg-[#F7FAFC]">
                  <Heart size={15} /> المفضلة
                </button>
                <button className="flex h-10 flex-1 items-center justify-center gap-2 border border-[#DDE3E9] text-[13px] text-[#65707E] hover:bg-[#F7FAFC]">
                  <Share2 size={15} /> مشاركة
                </button>
              </div>
            </aside>

          </div>
        </div>
      </div>
    </StudentLayout>
  );
}

function Info({ icon, label, value }) {
  return (
    <div className="flex min-h-16 items-center justify-center gap-2 border-l border-[#E4E9EF] px-2 last:border-0">
      <span className="text-[#123C91]">{icon}</span>
      <span>
        <small className="block text-[11px] text-[#939CA7]">{label}</small>
        <b className="text-[13px] text-[#505A68]">{value}</b>
      </span>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section className="!py-9 border-b border-[#EDF0F3] last:border-0">
      <h2 className="mb-5 text-[22px] font-extrabold leading-8 font-['Tajawal']">{title}</h2>
      {children}
    </section>
  );
}

function List({ items }) {
  return (
    <ul className="space-y-3 text-[16px] leading-7 text-[#687382]">
      {items.map((x) => (
        <li key={x} className="flex items-center gap-2.5">
          <Check size={16} className="shrink-0 text-[#123C91]" />
          <span>{x}</span>
        </li>
      ))}
    </ul>
  );
}

function Metric({ label, value, bordered, price }) {
  return (
    <div className={bordered ? "border-x border-[#EDF0F3]" : ""}>
      <small className="block text-[11px] text-[#8B95A1]">{label}</small>
      <b className={price ? "text-[20px] text-[#123C91]" : "text-[14px]"}>{value}</b>
    </div>
  );
}

function AsideRow({ icon, text }) {
  return (
    <li className="flex items-center gap-2 text-[14px]">
      {icon}
      <span>{text}</span>
    </li>
  );
}
