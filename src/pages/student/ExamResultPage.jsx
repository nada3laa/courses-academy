import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { CheckCircle2, ChevronLeft, RotateCcw, Trophy, XCircle } from 'lucide-react';
import StudentLayout from '../../components/student/layout/StudentLayout';

export default function ExamResultPage() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const quizId = searchParams.get('quiz');
  const navigate = useNavigate();
  let result = null;
  try { result = JSON.parse(sessionStorage.getItem('quiz-result-' + quizId)); } catch { result = null; }
  if (!result) return <Navigate to={'/learn/' + slug} replace />;
  const score = result.score || {};

  return <StudentLayout><div dir={'rtl'} className={'min-h-screen bg-[#F8FAFC] pb-20'}><div className={'mx-auto w-full max-w-[900px] space-y-6 px-4 pt-6'}>
    <nav className={'flex items-center text-sm text-[#8B94A0]'}><Link to={'/learn/' + slug} className={'flex items-center gap-2 font-semibold text-[#123C91]'}>الدورة<ChevronLeft size={14} /></Link><span>نتيجة الاختبار</span></nav>
    <div className={'space-y-3 rounded-2xl border bg-white p-8 text-center shadow-sm'}><div className={'mx-auto flex h-16 w-16 items-center justify-center rounded-full ' + (result.passed ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600')}>{result.passed ? <Trophy size={30} /> : <RotateCcw size={30} />}</div><h2 className={'text-2xl font-extrabold'}>{result.passed ? 'أحسنت، اجتزت الاختبار!' : 'لم تصل إلى درجة النجاح بعد'}</h2><div className={'text-4xl font-extrabold ' + (result.passed ? 'text-emerald-600' : 'text-red-600')}>{Math.round(score.percentage || 0)}%</div><p className={'text-sm text-gray-500'}>أجبت عن {score.correctCount || 0} من {score.totalQuestions || 0} إجابات صحيحة</p><button onClick={() => navigate(result.passed ? '/learn/' + slug : '/exam/' + slug + '?quiz=' + encodeURIComponent(quizId))} className={'mx-auto mt-3 rounded-lg bg-[#123C91] px-7 py-2.5 text-sm font-bold text-white'}>{result.passed ? 'متابعة الدورة' : 'إعادة الاختبار'}</button></div>
    <div className={'space-y-4'}>{(result.questions || []).map((question, index) => <article key={question.id || index} className={'space-y-3 rounded-xl border bg-white p-5'}><div className={'flex items-center gap-2 text-sm font-bold ' + (question.isCorrect ? 'text-emerald-700' : 'text-red-700')}>{question.isCorrect ? <CheckCircle2 size={18} /> : <XCircle size={18} />}{question.isCorrect ? 'إجابة صحيحة' : 'إجابة خاطئة'}</div><h3 className={'font-bold'}>{question.text}</h3>{question.explanation && <p className={'rounded-lg bg-blue-50 p-3 text-sm text-[#344054]'}>{question.explanation}</p>}{result.answerKeyRevealed && question.correctOptionId && <p className={'text-xs text-emerald-700'}>تم إظهار الإجابة الصحيحة بواسطة الخادم.</p>}</article>)}</div>
  </div></div></StudentLayout>;
}
