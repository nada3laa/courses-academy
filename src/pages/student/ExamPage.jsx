import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ChevronLeft, LoaderCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import StudentLayout from '../../components/student/layout/StudentLayout';
import { fetchPublicCourse } from '../../features/course-management/api/coursesApi';
import { getCourseQuiz, submitCourseQuizAttempt } from '../../services/APIService';

const unwrap = (response) => response?.data?.data ?? response?.data ?? response;

export default function ExamPage() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const quizId = searchParams.get('quiz');
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!quizId) throw new Error('لم يتم تحديد الاختبار');
      const loadedCourse = await fetchPublicCourse(slug);
      const loadedQuiz = unwrap(await getCourseQuiz(loadedCourse.id, quizId));
      if (active) { setCourse(loadedCourse); setQuiz(loadedQuiz); }
    })().catch((error) => toast.error(error?.response?.data?.message || error.message || 'تعذر تحميل الاختبار'))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [quizId, slug]);

  const questions = quiz?.questions || [];
  const submitExam = async () => {
    if (answers && Object.keys(answers).length < questions.length) {
      toast.error('يجب الإجابة عن جميع الأسئلة قبل تسليم الاختبار');
      return;
    }
    setSubmitting(true);
    try {
      const payload = { answers: questions.map((question) => ({
        question: question.id || question._id,
        selectedOption: answers[question.id || question._id],
      })) };
      const result = unwrap(await submitCourseQuizAttempt(course.id, quiz.id || quiz._id, payload));
      sessionStorage.setItem('quiz-result-' + (quiz.id || quiz._id), JSON.stringify(result));
      navigate('/exam-result/' + slug + '?quiz=' + encodeURIComponent(quiz.id || quiz._id));
    } catch (error) {
      toast.error(error?.response?.data?.message || 'تعذر تسليم الاختبار');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <StudentLayout><div className={'grid min-h-[60vh] place-items-center'}><LoaderCircle className={'animate-spin text-[#123C91]'} /></div></StudentLayout>;
  if (!quiz || !questions.length) return <StudentLayout><div dir={'rtl'} className={'p-12 text-center'}>لا توجد أسئلة متاحة في هذا الاختبار.</div></StudentLayout>;
  const question = questions[currentQuestion];
  const questionId = question.id || question._id;

  return <StudentLayout><div dir={'rtl'} className={'min-h-screen bg-[#F8FAFC] pb-20'}><div className={'mx-auto w-full max-w-[1000px] px-4 pt-6'}>
    <nav className={'mb-6 flex items-center justify-between text-sm text-[#8B94A0]'}><div className={'flex items-center gap-2'}><Link to={'/learn/' + slug} className={'font-semibold text-[#123C91]'}>الدورة</Link><ChevronLeft size={14} /><span>{quiz.title}</span></div><button disabled={submitting} onClick={submitExam} className={'rounded-lg bg-[#123C91] px-5 py-2 text-sm font-bold text-white disabled:opacity-60'}>{submitting ? 'جاري التسليم...' : 'تسليم الاختبار'}</button></nav>
    <div className={'space-y-6 rounded-2xl border border-[#DDE3E9] bg-white p-5 shadow-sm sm:p-8'}>
      <div className={'flex items-center justify-between'}><div><h1 className={'text-xl font-bold'}>{quiz.title}</h1><p className={'text-xs text-gray-500'}>{questions.length} أسئلة · درجة النجاح {quiz.passingPercentage}% · المحاولات المتبقية {quiz.attemptsRemaining ?? 'غير محدودة'}</p></div><b className={'text-[#123C91]'}>{Object.keys(answers).length}/{questions.length}</b></div>
      <div className={'grid gap-1.5'} style={{ gridTemplateColumns: 'repeat(' + questions.length + ', minmax(0, 1fr))' }}>{questions.map((item, index) => <button key={item.id || item._id} onClick={() => setCurrentQuestion(index)} className={'h-2 rounded-full ' + (answers[item.id || item._id] ? 'bg-[#12C6B0]' : index === currentQuestion ? 'bg-[#123C91]' : 'bg-gray-200')} />)}</div>
      <div className={'space-y-6 rounded-xl border border-[#DDE3E9] p-5 sm:p-6'}><span className={'rounded-full bg-[#EAF4FF] px-3 py-1 text-xs font-bold text-[#123C91]'}>السؤال {currentQuestion + 1}</span><h3 className={'text-lg font-bold'}>{question.text}</h3><div className={'space-y-3'}>{question.options.map((option) => { const optionId = option.id || option._id; return <label key={optionId} className={'flex cursor-pointer items-center justify-between rounded-xl border p-4 ' + (answers[questionId] === optionId ? 'border-[#123C91] bg-[#F0F4F8]' : 'border-gray-200 hover:bg-gray-50')}><span>{option.text}</span><input type={'radio'} name={'question-' + questionId} checked={answers[questionId] === optionId} onChange={() => setAnswers((current) => ({ ...current, [questionId]: optionId }))} /></label>; })}</div></div>
      <div className={'flex justify-between'}><button disabled={currentQuestion === 0} onClick={() => setCurrentQuestion((value) => value - 1)} className={'rounded-xl border px-6 py-2.5 text-sm font-bold disabled:opacity-40'}>السؤال السابق</button>{currentQuestion < questions.length - 1 ? <button onClick={() => setCurrentQuestion((value) => value + 1)} className={'rounded-xl bg-[#123C91] px-6 py-2.5 text-sm font-bold text-white'}>السؤال التالي</button> : <button disabled={submitting} onClick={submitExam} className={'rounded-xl bg-[#12C6B0] px-6 py-2.5 text-sm font-bold text-white disabled:opacity-60'}>تسليم وحساب النتيجة</button>}</div>
    </div>
  </div></div></StudentLayout>;
}
