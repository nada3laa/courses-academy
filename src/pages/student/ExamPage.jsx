import { useContext, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import toast from "react-hot-toast";
import StudentLayout from "../../components/student/layout/StudentLayout";
import { AuthContext } from "../../context/AuthContext";
import { courses } from "../../data/staticData";
import { getCourseContent } from "../../data/courseContent";
import { getExamQuestions } from "../../data/examQuestions";
import { saveExamAttempt } from "../../utils/courseProgress";

export default function ExamPage() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const chapterIndex = Math.max(0, Number(searchParams.get("chapter")) || 0);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const course = courses.find((item) => item.slug === slug) || courses[0];
  const content = useMemo(() => getCourseContent(course?.id), [course]);
  const chapter = content.chapters[chapterIndex];
  const questions = useMemo(() => getExamQuestions(course, chapter, chapterIndex), [course, chapter, chapterIndex]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});

  const submitExam = () => {
    if (Object.keys(answers).length < questions.length) {
      toast.error("يجب الإجابة عن جميع الأسئلة قبل تسليم الاختبار");
      return;
    }
    const correctCount = questions.reduce((total, question, index) => total + (answers[index] === question.correctAnswer ? 1 : 0), 0);
    const percentage = Math.round((correctCount / questions.length) * 100);
    const passed = percentage >= 60;
    const examId = `exam-${chapter.id}`;
    const nextChapter = content.chapters[chapterIndex + 1];
    const nextLesson = nextChapter?.lessons?.find((lesson) => lesson.type !== "quiz");
    const nextItemId = nextChapter && nextLesson ? `lesson-${nextChapter.id}-${nextLesson.id ?? 0}` : null;
    saveExamAttempt(user, slug, examId, {
      answers, correctCount, percentage, passed, total: questions.length,
      questions: questions.map(({ id, text, options, correctAnswer }) => ({ id, text, options, correctAnswer })),
      completedAt: new Date().toISOString(),
    }, nextItemId);
    navigate(`/exam-result/${slug}?chapter=${chapterIndex}`);
  };

  const question = questions[currentQuestion];
  return <StudentLayout>
    <div dir="rtl" className="min-h-screen bg-[#F8FAFC] pb-20">
      <div className="mx-auto w-full max-w-[1000px] px-4 pt-6">
        <nav className="mb-6 flex items-center justify-between text-sm text-[#8B94A0]">
          <div className="flex items-center gap-2"><Link to={`/learn/${slug}`} className="font-semibold text-[#123C91]">الدورة</Link><ChevronLeft size={14} /><span>{chapter?.title}</span></div>
          <button onClick={submitExam} className="rounded-lg bg-[#123C91] px-5 py-2 text-sm font-bold text-white">تسليم الاختبار</button>
        </nav>
        <div className="space-y-6 rounded-2xl border border-[#DDE3E9] bg-white p-5 shadow-sm sm:p-8">
          <div className="flex items-center justify-between"><div><h1 className="text-xl font-bold">اختبار {chapter?.title}</h1><p className="text-xs text-gray-500">{questions.length} أسئلة · درجة النجاح 60%</p></div><b className="text-[#123C91]">{Object.keys(answers).length}/{questions.length}</b></div>
          <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${questions.length}, minmax(0, 1fr))` }}>{questions.map((item, index) => <button key={item.id} onClick={() => setCurrentQuestion(index)} className={`h-2 rounded-full ${answers[index] !== undefined ? "bg-[#12C6B0]" : index === currentQuestion ? "bg-[#123C91]" : "bg-gray-200"}`} />)}</div>
          <div className="space-y-6 rounded-xl border border-[#DDE3E9] p-5 sm:p-6">
            <span className="rounded-full bg-[#EAF4FF] px-3 py-1 text-xs font-bold text-[#123C91]">السؤال {currentQuestion + 1}</span>
            <h3 className="text-lg font-bold">{question?.text}</h3>
            <div className="space-y-3">{question?.options.map((option, index) => <label key={option} className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 ${answers[currentQuestion] === index ? "border-[#123C91] bg-[#F0F4F8]" : "border-gray-200 hover:bg-gray-50"}`}><span>{option}</span><input type="radio" name={`question-${currentQuestion}`} checked={answers[currentQuestion] === index} onChange={() => setAnswers((current) => ({ ...current, [currentQuestion]: index }))} /></label>)}</div>
          </div>
          <div className="flex justify-between">
            <button disabled={currentQuestion === 0} onClick={() => setCurrentQuestion((value) => value - 1)} className="rounded-xl border px-6 py-2.5 text-sm font-bold disabled:opacity-40">السؤال السابق</button>
            {currentQuestion < questions.length - 1 ? <button onClick={() => setCurrentQuestion((value) => value + 1)} className="rounded-xl bg-[#123C91] px-6 py-2.5 text-sm font-bold text-white">السؤال التالي</button> : <button onClick={submitExam} className="rounded-xl bg-[#12C6B0] px-6 py-2.5 text-sm font-bold text-white">تسليم وحساب النتيجة</button>}
          </div>
        </div>
      </div>
    </div>
  </StudentLayout>;
}
