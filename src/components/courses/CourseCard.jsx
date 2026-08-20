import { Link } from "react-router-dom";
import { Clock } from "lucide-react";
import pythonCover from "../../assets/courses/python-course.png";
import mathCover from "../../assets/courses/math-course.png";
import skillsCover from "../../assets/courses/skills-course.png";

const courseCovers = {
  technology: pythonCover,
  math: mathCover,
  skills: skillsCover,
  language: pythonCover,
  science: mathCover,
  algebra: skillsCover,
};

export default function CourseCard({ course }) {
  return (
    <article className="group flex min-w-0 flex-col overflow-hidden rounded-xl border border-[#DDE4EC] bg-white text-right transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <Link to={`/courses/${course.slug}`} className="block">
        <div className="relative aspect-1.5/1 overflow-hidden bg-[#EEF1F4]">
          <img
            src={course.coverImage || courseCovers[course.cover] || pythonCover}
            alt={course.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
          <span className={`absolute right-3 top-3 rounded-md bg-white px-2.5 py-1 text-[12px] font-bold ${course.price ? "text-[#123C91]" : "text-[#0A9B72]"}`}>
            {course.price ? "مدفوع" : "مجاني"}
          </span>
          <span className="absolute bottom-3 left-3 flex items-center gap-1 rounded-md bg-black/60 px-2.5 py-1 text-xs text-white">
            <Clock size={13} /> {course.duration} ساعة
          </span>
        </div>
      </Link>

      <div className="flex min-h-48 grow flex-col px-5 py-4" dir="rtl">
        <div className="mb-3 flex items-center text-[14px]">
          <span className="rounded-full bg-[#EAF4FF] px-2.5 py-1 font-semibold text-[#123C91]">
            {course.category}
          </span>
          <span className="rounded-full bg-[#F0F4F8] px-2.5 py-1 font-semibold text-[#7B8490]">
            {course.level}
          </span>
        </div>

        <Link to={`/courses/${course.slug}`} className="mb-3 line-clamp-2 text-[17px] font-bold leading-7 text-[#1F2937] transition-colors group-hover:text-[#123C91]">
          {course.title}
        </Link>

        {/* تعديل اسم وصورة المحاضر ليصبح رابطاً لصفحته الشخصية */}
      {/* اسم وصورة المحاضر بشكل مميز وواضح */}
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

        <div className="mt-auto flex items-end justify-between border-t border-[#EDF0F4] pt-4">
          <strong className="text-lg text-[#123C91]">
            {course.price ? `${course.price} ج.م` : "مجاني"}
          </strong>
          <span className="text-xs text-[#7B8490]">{course.students} طالب</span>
        </div>
      </div>
    </article>
  );
}
