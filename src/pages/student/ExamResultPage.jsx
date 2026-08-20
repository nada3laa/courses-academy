import { useContext, useMemo } from "react";
import { Link, Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { CheckCircle2, ChevronLeft, RotateCcw, Trophy, XCircle } from "lucide-react";
import StudentLayout from "../../components/student/layout/StudentLayout";
import { AuthContext } from "../../context/AuthContext";
import { courses } from "../../data/staticData";
import { getCourseContent } from "../../data/courseContent";
import { getCourseProgress } from "../../utils/courseProgress";

export default function ExamResultPage() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const chapterIndex = Math.max(0, Number(searchParams.get("chapter")) || 0);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const course = courses.find((item) => item.slug === slug) || courses[0];
  const content = useMemo(() => getCourseContent(course?.id), [course]);
  const chapter = content.chapters[chapterIndex];
  const result = getCourseProgress(user, slug).examResults[`exam-${chapter?.id}`];
  if (!result) return <Navigate to={`/exam/${slug}?chapter=${chapterIndex}`} replace />;

  return <StudentLayout>
    <div dir="rtl" className="min-h-screen bg-[#F8FAFC] pb-20">
      <div className="mx-auto w-full max-w-[900px] space-y-6 px-4 pt-6">
        <nav className="flex items-center justify-between text-sm text-[#8B94A0]"><div className="flex items-center gap-2"><Link to={`/learn/${slug}`} className="font-semibold text-[#123C91]">الدورة</Link><ChevronLeft size={14} /><span>نتيجة الاختبار</span></div></nav>
        <div className="space-y-3 rounded-2xl border bg-white p-8 text-center shadow-sm">
          <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${result.passed ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"}`}>{result.passed ? <Trophy size={30} /> : <RotateCcw size={30} />}</div>
          <h2 className="text-2xl font-extrabold">{result.passed ? "أحسنت، اجتزت الاختبار!" : "تحتاج إلى مراجعة الوحدة والمحاولة مرة أخرى"}</h2>
          <div className={`text-4xl font-extrabold ${result.passed ? "text-emerald-600" : "text-red-600"}`}>{result.percentage}%</div>
          <p className="text-sm text-gray-500">أجبت عن {result.correctCount} من {result.total} إجابات صحيحة</p>
          <button onClick={() => navigate(result.passed ? `/learn/${slug}` : `/exam/${slug}?chapter=${chapterIndex}`)} className="mx-auto mt-3 rounded-lg bg-[#123C91] px-7 py-2.5 text-sm font-bold text-white">{result.passed ? "متابعة المستوى التالي" : "إعادة الاختبار"}</button>
        </div>
        <div className="space-y-4">{result.questions.map((question, index) => {
          const selected = Number(result.answers[index]);
          const correct = selected === question.correctAnswer;
          return <article key={question.id} className="space-y-3 rounded-xl border bg-white p-5">
            <div className={`flex items-center gap-2 text-sm font-bold ${correct ? "text-emerald-700" : "text-red-700"}`}>{correct ? <CheckCircle2 size={18} /> : <XCircle size={18} />}{correct ? "إجابة صحيحة" : "إجابة خاطئة"}</div>
            <h3 className="font-bold">{question.text}</h3>
            {!correct && <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm">إجابتك: {question.options[selected]}</div>}
            <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-3 text-sm">الإجابة الصحيحة: {question.options[question.correctAnswer]}</div>
          </article>;
        })}</div>
      </div>
    </div>
  </StudentLayout>;
}
