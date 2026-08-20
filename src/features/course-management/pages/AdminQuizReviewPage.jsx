import { BookOpen, Check, ChevronLeft, CircleHelp } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import AdminLayout from "../../../components/admin/layout/AdminLayout";
import { getTeacherCourse } from "../utils/teacherCoursesStorage";

const AdminQuizReviewPage = () => {
  const { courseId, lessonId } = useParams();
  const course = getTeacherCourse(courseId);
  const reviewCurriculum =
    course?.status === "قيد المراجعة" && course?.submittedCurriculum?.length
      ? course.submittedCurriculum
      : course?.curriculum || [];
  const lesson = reviewCurriculum
    ?.flatMap((section) => section.lessons || [])
    .find((item) => String(item.id) === String(lessonId));
  const questions = lesson?.quiz || [];

  if (!course || !lesson) {
    return (
      <AdminLayout>
        <div dir="rtl" className="rounded-xl bg-white p-10 text-center">
          <CircleHelp className="mx-auto mb-3 text-[#98A2B3]" />
          <p className="text-[#667085]">لم يتم العثور على الاختبار المطلوب.</p>
          <Link to={`/admin/courses/${courseId}`} className="mt-4 inline-block font-semibold text-[#123C91]">
            العودة إلى تفاصيل الدورة
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <main
        dir="rtl"
        className="min-h-full rounded-xl bg-[#F7F8FC] px-3 py-5 text-right font-['IBM_Plex_Sans_Arabic'] sm:px-5 md:px-7"
      >
        <nav className="mb-8 flex flex-wrap items-center gap-2 text-xs text-[#667085]">
          <Link to="/admin/courses" className="font-semibold text-[#123C91]">الدورات</Link>
          <ChevronLeft size={13} />
          <Link to={`/admin/courses/${course.id}`} className="font-semibold text-[#123C91]">{course.title}</Link>
          <ChevronLeft size={13} />
          <span>{lesson.title || "مراجعة الاختبار"}</span>
        </nav>

        <header className="mb-5">
          <h1 className="text-xl font-bold text-[#1F2937] sm:text-2xl">{lesson.title || "مراجعة الاختبار"}</h1>
          <p className="mt-1 text-sm text-[#667085]">{questions.length} أسئلة</p>
        </header>

        {questions.length ? (
          <div className="space-y-5">
            {questions.map((question, questionIndex) => (
              <article key={question.id || questionIndex} className="rounded-xl border border-[#E5E7EB] bg-white p-4 sm:p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <span className="rounded-full bg-[#DDF7F4] px-3 py-1.5 text-xs font-semibold text-[#087F72]">
                    السؤال {questionIndex + 1}
                  </span>
                  {Number(question.points) > 0 && (
                    <span className="text-xs text-[#667085]">{question.points} درجة</span>
                  )}
                </div>

                <h2 className="mb-4 text-[14px] font-semibold text-[#344054] sm:text-[15px]">
                  {question.text || `السؤال ${questionIndex + 1}`}
                </h2>

                <div className="space-y-2.5">
                  {(question.options || []).map((option, optionIndex) => {
                    const isCorrect = Number(question.correctIndex) === optionIndex;
                    return (
                      <div
                        key={`${question.id || questionIndex}-${optionIndex}`}
                        className={`flex min-h-11 items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm ${
                          isCorrect
                            ? "border-[#B7EBCB] bg-[#D9FBE6] text-[#176B3A]"
                            : "border-[#E5E7EB] bg-[#FAFAFA] text-[#475467]"
                        }`}
                      >
                        <span>{option || `الاختيار ${optionIndex + 1}`}</span>
                        {isCorrect && <Check size={17} className="shrink-0" aria-label="الإجابة الصحيحة" />}
                      </div>
                    );
                  })}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-[#D0D5DD] bg-white px-5 py-14 text-center">
            <BookOpen className="mx-auto mb-3 text-[#98A2B3]" />
            <h2 className="font-semibold text-[#344054]">لا توجد أسئلة داخل هذا الاختبار</h2>
            <p className="mt-1 text-sm text-[#667085]">يمكن للمحاضر إضافة الأسئلة من صفحة تعديل الدورة.</p>
          </div>
        )}
      </main>
    </AdminLayout>
  );
};

export default AdminQuizReviewPage;
