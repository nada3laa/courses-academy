import { useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, Award, CheckCircle2, ChevronDown, ChevronLeft,
  HelpCircle, LockKeyhole, PlayCircle, Star,
} from "lucide-react";
import StudentLayout from "../../../../components/student/layout/StudentLayout";
import { AuthContext } from "../../../../context/AuthContext";
import { courses } from "../../../../data/staticData";
import { getCourseContent } from "../../../../data/courseContent";
import {
  completeCourseItem, getCourseProgress, isCourseItemUnlocked, updateCourseProgress,
} from "../../../../utils/courseProgress";

const flattenContent = (content) => {
  const items = [];
  content?.chapters?.forEach((chapter, chapterIndex) => {
    chapter.lessons?.filter((lesson) => lesson.type !== "quiz").forEach((lesson, lessonIndex) => {
      items.push({
        id: `lesson-${chapter.id}-${lesson.id ?? lessonIndex}`,
        chapterIndex,
        title: lesson.title || lesson,
        duration: lesson.duration || "10:00",
        type: "lesson",
      });
    });
    const quiz = chapter.lessons?.find((lesson) => lesson.type === "quiz");
    items.push({
      id: `exam-${chapter.id}`,
      chapterIndex,
      title: quiz?.title || `اختبار ${chapter.title}`,
      duration: quiz?.duration || "15 دقيقة",
      type: "exam",
    });
  });
  return items;
};

export default function CoursePlayerPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const course = courses.find((item) => item.slug === slug) || courses[0];
  const content = useMemo(() => getCourseContent(course?.id), [course]);
  const items = useMemo(() => flattenContent(content), [content]);
  const [completedIds, setCompletedIds] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [openSection, setOpenSection] = useState(0);

  useEffect(() => {
    const progress = getCourseProgress(user, slug);
    setCompletedIds(progress.completedItemIds);
    const savedIndex = items.findIndex((item) => item.id === progress.currentItemId);
    setCurrentIndex(savedIndex >= 0 ? savedIndex : 0);
  }, [items, slug, user]);

  const currentItem = items[currentIndex];
  const progressPercentage = Math.round((completedIds.length / (items.length || 1)) * 100);
  const unlocked = (index) => isCourseItemUnlocked(items, completedIds, index);

  const selectItem = (index) => {
    if (index < 0 || index >= items.length || !unlocked(index)) return;
    setCurrentIndex(index);
    updateCourseProgress(user, slug, (progress) => ({ ...progress, currentItemId: items[index].id }));
  };

  const handleNext = () => {
    if (currentItem?.type === "exam") {
      navigate(`/exam/${slug}?chapter=${currentItem.chapterIndex}`);
      return;
    }
    const nextItem = items[currentIndex + 1];
    const progress = completeCourseItem(user, slug, currentItem.id, nextItem?.id || null);
    setCompletedIds(progress.completedItemIds);
    if (nextItem) setCurrentIndex(currentIndex + 1);
  };

  return (
    <StudentLayout>
      <div dir="rtl" className="min-h-screen bg-white pb-20 text-[#202936]">
        <div className="mx-auto w-full max-w-[1400px] px-4 pt-6 sm:px-6 lg:px-8">
          <nav className="mb-6 flex items-center justify-between border-b border-[#EDF0F3] pb-4 text-sm text-[#8B94A0]">
            <div className="flex items-center gap-2">
              <Link to="/student-dashboard/courses" className="font-semibold text-[#123C91]">دوراتي</Link>
              <ChevronLeft size={14} /><span className="text-[#202936]">{course.title}</span>
            </div>
            <button className="flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-bold text-[#123C91]"><Star size={14} /> تقييم</button>
          </nav>

          <div className="grid items-start gap-8 lg:grid-cols-[400px_minmax(0,1fr)]">
            <aside className="space-y-4 rounded-lg border border-[#DDE3E9] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-extrabold">محتوى الدورة</h2>
                <span className="rounded-full bg-[#EAF4FF] px-2.5 py-1 text-xs font-bold text-[#123C91]">{completedIds.length}/{items.length}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[#EDF0F3]"><div className="h-full bg-[#12C6B0] transition-all" style={{ width: `${progressPercentage}%` }} /></div>

              {content.chapters.map((chapter, chapterIndex) => {
                const chapterItems = items.filter((item) => item.chapterIndex === chapterIndex);
                return <div key={chapter.id} className="overflow-hidden rounded-lg border border-[#DFE5EB]">
                  <button onClick={() => setOpenSection(openSection === chapterIndex ? -1 : chapterIndex)} className="flex w-full items-center justify-between bg-[#F7F8FA] px-4 py-3 text-right">
                    <b className="text-sm">{chapter.title}</b><ChevronDown size={16} className={openSection === chapterIndex ? "rotate-180" : ""} />
                  </button>
                  {openSection === chapterIndex && <div className="divide-y divide-[#ECF0F3]">
                    {chapterItems.map((item) => {
                      const index = items.findIndex((candidate) => candidate.id === item.id);
                      const isUnlocked = unlocked(index);
                      const isCompleted = completedIds.includes(item.id);
                      return <button key={item.id} onClick={() => selectItem(index)} disabled={!isUnlocked} className={`flex w-full items-center justify-between px-4 py-3 text-right text-[13px] ${currentIndex === index ? "bg-[#EAF4FF] font-bold text-[#123C91]" : isUnlocked ? "hover:bg-[#F8FBFF]" : "cursor-not-allowed bg-gray-50 text-gray-400"}`}>
                        <span className="flex items-center gap-2.5">
                          {isCompleted ? <CheckCircle2 size={16} className="text-[#12C6B0]" /> : !isUnlocked ? <LockKeyhole size={15} /> : item.type === "exam" ? <HelpCircle size={16} /> : <PlayCircle size={16} />}
                          {item.title}
                        </span><small>{item.duration}</small>
                      </button>;
                    })}
                  </div>}
                </div>;
              })}
            </aside>

            <main className="space-y-6">
              <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-xl border bg-black shadow-sm">
                {currentItem?.type === "exam" ? <div className="text-center text-white"><HelpCircle size={54} className="mx-auto mb-4" /><h2 className="text-xl font-bold">{currentItem.title}</h2><p className="mt-2 text-sm text-white/70">اجتز الاختبار لفتح الوحدة التالية</p></div> :
                  <iframe className="h-full w-full" src="https://www.youtube.com/embed/dQw4w9WgXcQ" title={currentItem?.title} allowFullScreen />}
              </div>
              <div className="flex items-center justify-between rounded-xl border bg-white p-4 shadow-sm">
                <button onClick={() => selectItem(currentIndex - 1)} disabled={currentIndex === 0} className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-bold disabled:opacity-40"><ArrowRight size={16} /> السابق</button>
                <h3 className="px-3 text-center text-sm font-bold">{currentItem?.title}</h3>
                <button onClick={handleNext} className="flex items-center gap-2 rounded-lg bg-[#123C91] px-5 py-2 text-sm font-bold text-white">
                  {currentItem?.type === "exam" ? "بدء الاختبار" : "إتمام والدرس التالي"}<ArrowLeft size={16} />
                </button>
              </div>
              <div className="flex items-center justify-between rounded-xl border bg-[#F7FAFC] p-6">
                <div><h4 className="text-lg font-extrabold">الشهادة</h4><p className="text-sm text-[#657181]">{progressPercentage === 100 ? "تهانينا! يمكنك استلام شهادتك الآن." : "أكمل كل الدروس والاختبارات للحصول على الشهادة."}</p></div>
                <button disabled={progressPercentage < 100} onClick={() => navigate(`/certificate/${slug}`)} className="flex items-center gap-2 rounded-xl bg-[#12C6B0] px-6 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"><Award size={18} /> الشهادة</button>
              </div>
            </main>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
