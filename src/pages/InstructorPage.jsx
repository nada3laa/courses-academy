import React from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronLeft, Users } from "lucide-react";
import CourseCard from "../components/courses/CourseCard";
import { courses } from "../data/staticData";

export default function InstructorPage() {
  const { id } = useParams();

  const instructorName = id ? decodeURIComponent(id).replace(/-/g, " ") : "";

  // فلترة الكورسات الخاصة بهذا المعلم
  const instructorCourses = courses.filter(
    (course) => course.instructor.trim() === instructorName.trim()
  );

  const totalStudents = instructorCourses.reduce((sum, course) => sum + course.students, 0);
  const totalCourses = instructorCourses.length;

  const instructor = {
    name: instructorName || "محمد أحمد",
    role: instructorCourses.length > 0 ? `معلم ${instructorCourses[0].category}` : "معلم معتمد",
    experienceYears: 9,
    studentsCount: totalStudents > 0 ? totalStudents.toLocaleString() : "1,250",
    coursesCount: totalCourses > 0 ? totalCourses : 1,
    interactiveGroupsCount: instructorCourses.length > 0 ? instructorCourses.length : 3,
  };

  return (
    <div className="min-h-screen bg-[#F8FBFF] py-10" dir="rtl">
      <div className="container-custom">
        
        {/* زر الرجوع */}
        <div className="mb-6 flex justify-start">
          <Link
            to={-1}
            className="flex items-center gap-1 text-sm font-medium text-[#657080] transition-colors hover:text-[#123C91]"
          >
            <ChevronLeft size={16} className="rotate-180" />
            <span>الرجوع لتفاصيل الدورة</span>
          </Link>
        </div>

        {/* كارت البروفايل الرئيسي */}
        <div className="mb-12 rounded-2xl border border-[#DDE4EC] bg-white p-6 shadow-sm">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            
            {/* تفاصيل الاسم والحروف الأولى */}
            <div className="flex items-center gap-4 text-right">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#12C6B0] to-[#123C91] text-2xl font-bold text-white shadow-md">
                {instructor.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#1F2937]">{instructor.name}</h1>
                <p className="text-sm text-[#7B8490]">{instructor.role}</p>
              </div>
            </div>

            {/* الإحصائيات */}
            <div className="flex items-center gap-6 md:gap-10 text-center">
              <div>
                <div className="text-xl font-bold text-[#1F2937]">{instructor.interactiveGroupsCount}</div>
                <div className="text-xs text-[#7B8490]">مجموعات تفاعلية</div>
              </div>
              <div className="h-8 w-[1px] bg-[#E5E4E7]"></div>
              <div>
                <div className="text-xl font-bold text-[#1F2937]">{instructor.coursesCount}</div>
                <div className="text-xs text-[#7B8490]">دورات</div>
              </div>
              <div className="h-8 w-[1px] bg-[#E5E4E7]"></div>
              <div>
                <div className="text-xl font-bold text-[#1F2937]">{instructor.studentsCount}</div>
                <div className="text-xs text-[#7B8490]">طالب</div>
              </div>
              <div className="h-8 w-[1px] bg-[#E5E4E7]"></div>
              <div>
                <div className="text-xl font-bold text-[#1F2937]">{instructor.experienceYears}</div>
                <div className="text-xs text-[#7B8490]">سنوات الخبرة</div>
              </div>
            </div>

          </div>
        </div>

        {/* قسم المجموعات التفاعلية (مبنية على اسم ومادة الكورسات الخاصة بالمعلم وبنفس الديزاين المطلوب) */}
        <section className="mb-12 !py-0">
          <h2 className="mb-6 text-xl font-bold text-[#123C91] text-right">المجموعات التفاعلية</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {instructorCourses.length > 0 ? (
              instructorCourses.map((course, idx) => (
                <div 
                  key={course.id || idx} 
                  className="flex flex-col justify-between rounded-[16px] border border-[#E5E5E5] bg-white p-[24px] gap-[16px] text-right shadow-xs"
                >
                  <div className="flex flex-col gap-[12px]">
                    <div className="flex items-center justify-start">
                      <span className="rounded-md bg-[#E8F8F2] px-2.5 py-0.5 text-xs font-semibold text-[#0A9B72]">
                        نشط
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold text-[#1F2937] text-base mb-1">مجموعة {course.title}</h3>
                      <p className="text-xs text-[#7B8490]">{course.grade || course.category} - {course.classification || "متابعة مباشرة"}</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-[16px]">
                    <div className="flex items-center justify-start text-xs text-[#7B8490] border-t border-[#EDF0F4] pt-3">
                      <span className="flex items-center gap-1"><Users size={14} /> 22 / 30 طالباً</span>
                    </div>
                    <button className="w-full rounded-lg border border-[#123C91] py-2 text-sm font-bold text-[#123C91] transition-colors hover:bg-[#123C91] hover:text-white">
                      حجز مقعد
                    </button>
                  </div>
                </div>
              ))
            ) : (
              // مجموعة افتراضية في حال لم تكن هناك كورسات مرتبطة برقم كافي
              [1, 2, 3].map((_, idx) => (
                <div 
                  key={idx} 
                  className="flex flex-col justify-between rounded-[16px] border border-[#E5E5E5] bg-white p-[24px] gap-[16px] text-right shadow-xs"
                >
                  <div className="flex flex-col gap-[12px]">
                    <div className="flex items-center justify-start">
                      <span className="rounded-md bg-[#E8F8F2] px-2.5 py-0.5 text-xs font-semibold text-[#0A9B72]">
                        نشط
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold text-[#1F2937] text-base mb-1">مجموعة {instructor.name} A</h3>
                      <p className="text-xs text-[#7B8490]">متابعة مباشرة وحل تدريبات</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-[16px]">
                    <div className="flex items-center justify-start text-xs text-[#7B8490] border-t border-[#EDF0F4] pt-3">
                      <span className="flex items-center gap-1"><Users size={14} /> 22 / 30 طالباً</span>
                    </div>
                    <button className="w-full rounded-lg border border-[#123C91] py-2 text-sm font-bold text-[#123C91] transition-colors hover:bg-[#123C91] hover:text-white">
                      حجز مقعد
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* قسم الكورسات المنشورة */}
        <section className="py-0!">
          <h2 className="mb-6 text-xl font-bold text-[#123C91] text-right">
            الكورسات المنشورة لـ {instructor.name}
          </h2>
          
          {instructorCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {instructorCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-[#DDE4EC] bg-white p-8 text-center text-[#7B8490]">
              لا توجد كورسات منشورة لهذا المحاضر حالياً.
            </div>
          )}
        </section>

      </div>
    </div>
  );
}