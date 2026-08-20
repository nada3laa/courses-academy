import { Award, Clock3, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import pythonCover from "../../../../assets/courses/python-course.png";
import mathCover from "../../../../assets/courses/math-course.png";
import skillsCover from "../../../../assets/courses/skills-course.png";

const courseCovers = {
  technology: pythonCover,
  math: mathCover,
  skills: skillsCover,
  language: pythonCover,
  science: mathCover,
  algebra: skillsCover,
};

export default function CoursesGrid({ courses = [], onRate = () => { }, onCancel = null }) {
  const navigate = useNavigate();

  return (
    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {courses.map((course) => {
        const progress = course.progressData?.percentage || 0;
        const completedLessons = course.progressData?.completedLessons || 0;
        const totalLessons = course.progressData?.totalLessons || course.lessons || 0;

        return (
          <article
            key={course.id || course.slug}
            onClick={() => navigate(`/my-courses/${course.slug}`)}
            className="group cursor-pointer overflow-hidden rounded-xl border border-[#DFE5EC] bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="relative aspect-1.85/1 overflow-hidden bg-[#E8EDF2]">
              <img src={course.coverImage || courseCovers[course.cover] || pythonCover} alt={course.title} className="h-full w-full object-cover" />
              <span className={`absolute right-2 top-2 rounded-full px-2 py-1 text-[10px] font-bold ${progress === 100 ? "bg-[#E5F7E9] text-[#18753C]" : "bg-white text-[#123C91]"}`}>
                {progress === 100 ? "مكتملة" : progress === 0 ? "لم تبدأ" : "قيد التعلم"}
              </span>
              {progress === 100 && <span className="absolute left-2 top-0 flex h-9 w-7 items-center justify-center rounded-b-md bg-[#F6C64A] text-white"><Award size={15} /></span>}
            </div>

            <div className="p-4 text-right">
              <div className="mb-3 flex items-center text-[14px]">
                <span className="rounded-full bg-[#EAF4FF] px-2.5 py-1 font-semibold text-[#123C91]">{course.classification || course.category}</span>
                <span className="px-2.5 py-1 text-[#7B8490]">{course.level}</span>
              </div>
              <Link
                to={`/courses/${course.slug}`}
                onClick={(e) => e.stopPropagation()}
                className="mb-3 line-clamp-2 text-[17px] font-bold leading-7 text-[#1F2937] transition-colors group-hover:text-[#123C91]">

                {course.title}
              </Link>
              <div className="mb-4 flex items-center gap-2">
                <Link
                  to={`/instructors/${encodeURIComponent(course.instructor)}`}
                  className="flex items-center gap-2 group/inst"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-linear-to-br from-[#12C6B0] to-[#123C91] text-[13px] font-bold text-white shadow-xs">
                    {course.instructor.charAt(0)}
                  </span>
                  <span className="text-[14px] font-medium text-[#4B5563] underline decoration-transparent underline-offset-4 transition-all duration-300 group-hover/inst:text-[#123C91] group-hover/inst:decoration-[#123C91]">
                    {course.instructor}
                  </span>
                </Link>
              </div>

              <div className="mt-4">
                <div className="mb-1 flex items-center justify-between text-[10px] text-[#89939F]">
                  <span>{progress}%</span>
                  <span className="flex items-center gap-1"><Clock3 size={11} /> {completedLessons} / {totalLessons} درس</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-[#E6E9ED]">
                  <div className={`h-full rounded-full ${progress === 100 ? "bg-[#19804A]" : "bg-[#123C91]"}`} style={{ width: `${progress}%` }} />
                </div>
                <p className="mt-2 text-[14px] text-[#8B95A1]">{progress === 100 ? "أحسنت! لقد أكملت الدورة" : progress === 0 ? "لم تبدأ هذه الدورة بعد" : `آخر ما أكملته: ${course.progressData?.lastCompletedTitle || "أحد دروس الدورة"}`}</p>
              </div>

              {progress === 100 ? (
                <div className="mt-4 flex gap-2">
                  <button type="button" onClick={(e) => { e.stopPropagation(); onRate(course); }} className="h-10 flex-1 rounded-lg border border-[#DDE4EC] text-xs font-bold text-[#556171]">مراجعة الدورة</button>
                  <button type="button" onClick={(e) => { e.stopPropagation(); navigate(`/certificate/${course.slug}`); }} aria-label="عرض الشهادة" className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#DDE4EC] text-[#123C91]"><Award size={15} /></button>
                </div>
              ) : (
                <Link
                  to={`/learn/${course.slug}`}
                  onClick={(e) => e.stopPropagation()}
                  className="mx-auto mt-6 flex h-12 w-[320px] items-center justify-center gap-2 rounded-lg bg-[#123C91] px-4 font-['Tajawal'] text-[16px] font-medium leading-none tracking-normal !text-white"
                >
                  {progress === 0 ? "ابدأ الدورة" : "متابعة التعلم"} <span className="mr-2">←</span>
                </Link>
              )}
              {onCancel && (
                <button type="button" onClick={(e) => { e.stopPropagation(); onCancel(course); }} className="mt-2 flex h-9 w-full items-center justify-center gap-2 rounded-lg text-xs font-semibold text-[#C24141] transition hover:bg-[#FFF1F1]">
                  <LogOut size={14} /> إلغاء الاشتراك في الدورة
                </button>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
