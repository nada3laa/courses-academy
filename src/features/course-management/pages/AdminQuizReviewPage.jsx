import { useEffect, useState } from 'react';
import { BookOpen, Check, ChevronLeft, CircleHelp, LoaderCircle } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import AdminLayout from '../../../components/admin/layout/AdminLayout';
import { fetchAdminCourse } from '../api/coursesApi';

export default function AdminQuizReviewPage() {
  const { courseId, lessonId: quizId } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchAdminCourse(courseId).then(setCourse).finally(() => setLoading(false));
  }, [courseId]);
  if (loading) return <AdminLayout><div className={'grid min-h-[50vh] place-items-center'}><LoaderCircle className={'animate-spin text-[#123C91]'} /></div></AdminLayout>;
  const quiz = (course?.quizzes || []).find((item) => String(item._id || item.id) === String(quizId));
  const questions = quiz?.questions || [];
  if (!course || !quiz) return <AdminLayout><div dir={'rtl'} className={'rounded-xl bg-white p-10 text-center'}><CircleHelp className={'mx-auto mb-3 text-[#98A2B3]'} /><p className={'text-[#667085]'}>لم يتم العثور على الاختبار المطلوب.</p><Link to={'/admin/courses/' + courseId} className={'mt-4 inline-block font-semibold text-[#123C91]'}>العودة إلى تفاصيل الدورة</Link></div></AdminLayout>;
  return <AdminLayout><main dir={'rtl'} className={'min-h-full rounded-xl bg-[#F7F8FC] px-3 py-5 text-right sm:px-5 md:px-7'}>
    <nav className={'mb-8 flex flex-wrap items-center gap-2 text-xs text-[#667085]'}><Link to={'/admin/courses'} className={'font-semibold text-[#123C91]'}>الدورات</Link><ChevronLeft size={13} /><Link to={'/admin/courses/' + course.id} className={'font-semibold text-[#123C91]'}>{course.title}</Link><ChevronLeft size={13} /><span>{quiz.title}</span></nav>
    <header className={'mb-5'}><h1 className={'text-xl font-bold text-[#1F2937] sm:text-2xl'}>{quiz.title}</h1><p className={'mt-1 text-sm text-[#667085]'}>{questions.length} أسئلة · النجاح من {quiz.passingPercentage}%</p></header>
    {questions.length ? <div className={'space-y-5'}>{questions.map((question, questionIndex) => <article key={question._id || question.id || questionIndex} className={'rounded-xl border border-[#E5E7EB] bg-white p-4 sm:p-5'}><span className={'rounded-full bg-[#DDF7F4] px-3 py-1.5 text-xs font-semibold text-[#087F72]'}>السؤال {questionIndex + 1}</span><h2 className={'my-4 font-semibold text-[#344054]'}>{question.text}</h2><div className={'space-y-2.5'}>{(question.options || []).map((option, optionIndex) => <div key={option._id || option.id || optionIndex} className={'flex min-h-11 items-center justify-between rounded-lg border px-4 py-3 text-sm ' + (option.isCorrect ? 'border-[#B7EBCB] bg-[#D9FBE6] text-[#176B3A]' : 'border-[#E5E7EB] bg-[#FAFAFA] text-[#475467]')}><span>{option.text || option}</span>{option.isCorrect && <Check size={17} />}</div>)}</div>{question.explanation && <p className={'mt-4 rounded-lg bg-blue-50 p-3 text-sm'}>{question.explanation}</p>}</article>)}</div> : <div className={'rounded-xl border border-dashed bg-white px-5 py-14 text-center'}><BookOpen className={'mx-auto mb-3 text-[#98A2B3]'} /><h2 className={'font-semibold'}>لا توجد أسئلة داخل هذا الاختبار</h2></div>}
  </main></AdminLayout>;
}
