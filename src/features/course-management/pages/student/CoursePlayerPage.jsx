import { useEffect, useMemo, useRef, useState } from 'react';
import { Award, CheckCircle2, ChevronDown, ChevronLeft, Download, FileText, LoaderCircle, Paperclip, PlayCircle } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import StudentLayout from '../../../../components/student/layout/StudentLayout';
import { fetchPublicCourse } from '../../api/coursesApi';
import { claimCourseCertificate, completeCourseLesson, getCourseLearningView, requestLessonAttachmentAccess, requestLessonMediaAccess, updateCourseLessonProgress } from '../../../../services/APIService';
import { CircleHelp } from 'lucide-react';

const unwrap = (response) => response?.data?.data ?? response?.data ?? response;
const absoluteMediaUrl = (url) => !url ? '' : url.startsWith('http') ? url : 'https://api.alacademeya.com' + (url.startsWith('/') ? '' : '/') + url;
const titleOf = (value) => value?.ar || value?.en || value || 'الدورة';

export default function CoursePlayerPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [view, setView] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [mediaUrl, setMediaUrl] = useState('');
  const [openSection, setOpenSection] = useState(0);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [openingAttachmentId, setOpeningAttachmentId] = useState('');
  const mediaRef = useRef(null);
  const lastSavedPositionRef = useRef(0);
  const mediaRefreshRef = useRef(0);

  const load = async () => {
    const publicCourse = await fetchPublicCourse(slug);
    const data = unwrap(await getCourseLearningView(publicCourse.id));
    setView(data);
    setCurrentLesson((current) => {
      if (current) return data.curriculum?.flatMap((section) => section.lessons || []).find((lesson) => lesson.id === current.id) || current;
      const allLessons = data.curriculum?.flatMap((section) => section.lessons || []) || [];
      return allLessons.find((lesson) => lesson.id === data.progress?.lastLessonId) || allLessons[0] || null;
    });
    return data;
  };

  useEffect(() => {
    load().catch((error) => toast.error(error?.response?.data?.message || 'لا يمكنك فتح محتوى هذه الدورة')).finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    setMediaUrl('');
    mediaRefreshRef.current = 0;
    lastSavedPositionRef.current = Number(currentLesson?.progress?.lastPositionSeconds || 0);
    if (!view?.course?.id || !currentLesson?.id) return;
    requestLessonMediaAccess(view.course.id, currentLesson.id).then((response) => {
      const data = unwrap(response);
      if (data?.url) setMediaUrl(absoluteMediaUrl(data.url));
    }).catch((error) => toast.error(error?.response?.data?.message || 'تعذر تشغيل محتوى الدرس'));
  }, [currentLesson?.id, view?.course?.id]);

  const refreshExpiredMedia = async () => {
    if (!view?.course?.id || !currentLesson?.id || mediaRefreshRef.current >= 1) return;
    mediaRefreshRef.current += 1;
    try {
      const data = unwrap(await requestLessonMediaAccess(view.course.id, currentLesson.id));
      if (data?.url) setMediaUrl(absoluteMediaUrl(data.url));
    } catch (error) {
      toast.error(error?.response?.data?.message || 'تعذر تجديد رابط محتوى الدرس');
    }
  };

  const openAttachment = async (attachment) => {
    const attachmentId = attachment?.id || attachment?._id;
    if (!attachmentId || openingAttachmentId) return;
    const target = window.open('', '_blank');
    setOpeningAttachmentId(attachmentId);
    try {
      const data = unwrap(await requestLessonAttachmentAccess(view.course.id, currentLesson.id, attachmentId));
      if (!data?.url) throw new Error('ATTACHMENT_URL_MISSING');
      if (target) target.location.href = absoluteMediaUrl(data.url);
      else window.location.href = absoluteMediaUrl(data.url);
    } catch (error) {
      if (target) target.close();
      toast.error(error?.response?.data?.message || 'تعذر فتح مرفق الدرس');
    } finally {
      setOpeningAttachmentId('');
    }
  };

  const savePosition = async (position, force = false) => {
    if (!view?.course?.id || !currentLesson?.id || currentLesson.contentType === 'document') return;
    const seconds = Math.max(0, Number(position || 0));
    if (!force && Math.abs(seconds - lastSavedPositionRef.current) < 10) return;
    lastSavedPositionRef.current = seconds;
    try {
      await updateCourseLessonProgress(view.course.id, currentLesson.id, { lastPositionSeconds: seconds });
    } catch {
      // Background resume-position updates must not interrupt playback.
    }
  };

  const restorePosition = (event) => {
    mediaRefreshRef.current = 0;
    const savedPosition = Number(currentLesson?.progress?.lastPositionSeconds || 0);
    const duration = Number(event.currentTarget.duration || currentLesson?.durationSeconds || 0);
    if (savedPosition > 0 && (!duration || savedPosition < duration)) event.currentTarget.currentTime = savedPosition;
  };

  const lessons = useMemo(() => view?.curriculum?.flatMap((section) => section.lessons || []) || [], [view]);
  const progress = Number(view?.progress?.progressPercentage ?? view?.progress?.percentage ?? 0);

  const completeLesson = async () => {
    if (!currentLesson || working) return;
    setWorking(true);
    try {
      await completeCourseLesson(view.course.id, currentLesson.id);
      const updated = await load();
      const all = updated.curriculum?.flatMap((section) => section.lessons || []) || [];
      const index = all.findIndex((lesson) => lesson.id === currentLesson.id);
      if (all[index + 1]) setCurrentLesson(all[index + 1]);
      toast.success('تم إكمال الدرس');
    } catch (error) { toast.error(error?.response?.data?.message || 'تعذر إكمال الدرس'); }
    finally { setWorking(false); }
  };

  const claimCertificate = async () => {
    setWorking(true);
    try { await claimCourseCertificate(view.course.id); navigate(`/certificate/${slug}`); }
    catch (error) { toast.error(error?.response?.data?.message || 'أكمل جميع الدروس والاختبارات أولاً'); }
    finally { setWorking(false); }
  };

  if (loading) return <StudentLayout><div className='grid min-h-[60vh] place-items-center'><LoaderCircle className='animate-spin text-[#123C91]' /></div></StudentLayout>;
  if (!view) return <StudentLayout><div className='p-10 text-center'>تعذر تحميل الدورة</div></StudentLayout>;

  return <StudentLayout><div dir='rtl' className='min-h-screen bg-white p-4 text-[#202936] sm:p-6'>
    <div className='mx-auto max-w-[1400px]'><nav className='mb-6 flex gap-2 border-b pb-4 text-sm'><Link to='/student-dashboard/courses' className='font-bold text-[#123C91]'>دوراتي</Link><ChevronLeft size={15} /><span>{titleOf(view.course.title)}</span></nav>
      <div className='grid items-start gap-7 lg:grid-cols-[360px_1fr]'>
        <aside className='rounded-xl border bg-white p-4 shadow-sm'><div className='mb-4 flex items-center justify-between'><h2 className='font-extrabold'>محتوى الدورة</h2><b className='text-[#123C91]'>{Math.round(progress)}%</b></div>
          <div className='mb-5 h-2 overflow-hidden rounded bg-gray-100'><div className='h-full bg-[#12C6B0]' style={{ width: `${progress}%` }} /></div>
          {view.curriculum?.map((section, index) => <div key={section.id} className='mb-3 overflow-hidden rounded-lg border'><button onClick={() => setOpenSection(openSection === index ? -1 : index)} className='flex w-full justify-between bg-gray-50 p-3 text-right font-bold'>{section.title}<ChevronDown size={17} /></button>{openSection === index && section.lessons?.map((lesson) => <button key={lesson.id} onClick={() => setCurrentLesson(lesson)} className={'flex w-full items-center gap-2 border-t p-3 text-right text-sm ' + (currentLesson?.id === lesson.id ? 'bg-blue-50 text-[#123C91]' : '')}>{lesson.progress?.status === 'completed' ? <CheckCircle2 size={17} className='text-[#12C6B0]' /> : lesson.contentType === 'document' ? <FileText size={17} /> : <PlayCircle size={17} />}{lesson.title}</button>)}</div>)}
          {!!view.quizzes?.length && <div className={'mt-5 border-t pt-4'}><h3 className={'mb-3 font-extrabold'}>الاختبارات</h3>{view.quizzes.map((quiz) => <Link key={quiz.id || quiz._id} to={'/exam/' + slug + '?quiz=' + encodeURIComponent(quiz.id || quiz._id)} className={'mb-2 flex items-center gap-2 rounded-lg border border-[#D7E2F3] bg-[#F4F7FF] p-3 text-sm font-bold text-[#123C91]'}><CircleHelp size={17} />{quiz.title}</Link>)}</div>}
        </aside>
        <main>
          <div className='flex aspect-video items-center justify-center overflow-hidden rounded-xl bg-black text-white'>{!mediaUrl ? <LoaderCircle className='animate-spin' /> : currentLesson?.contentType === 'video' ? <video ref={mediaRef} key={mediaUrl} src={mediaUrl} controls className='h-full w-full' onError={refreshExpiredMedia} onLoadedMetadata={restorePosition} onPlay={(event) => savePosition(event.currentTarget.currentTime, true)} onTimeUpdate={(event) => savePosition(event.currentTarget.currentTime)} onPause={(event) => savePosition(event.currentTarget.currentTime, true)} onEnded={completeLesson} /> : currentLesson?.contentType === 'audio' ? <audio ref={mediaRef} key={mediaUrl} src={mediaUrl} controls onError={refreshExpiredMedia} onLoadedMetadata={restorePosition} onPlay={(event) => savePosition(event.currentTarget.currentTime, true)} onTimeUpdate={(event) => savePosition(event.currentTarget.currentTime)} onPause={(event) => savePosition(event.currentTarget.currentTime, true)} onEnded={completeLesson} /> : <a href={mediaUrl} target='_blank' rel='noreferrer' className='rounded-lg bg-white px-6 py-3 font-bold text-[#123C91]'>فتح ملف الدرس</a>}</div>
          <div className='mt-4 flex items-center justify-between rounded-xl border p-4'><div><h1 className='font-extrabold'>{currentLesson?.title}</h1><p className='mt-1 text-sm text-gray-500'>{currentLesson?.description}</p></div><button onClick={completeLesson} disabled={working || currentLesson?.progress?.status === 'completed'} className='rounded-lg bg-[#123C91] px-5 py-2.5 font-bold text-white disabled:bg-gray-300'>{currentLesson?.progress?.status === 'completed' ? 'مكتمل' : 'إكمال الدرس'}</button></div>
          {!!currentLesson?.attachments?.length && <section className='mt-4 rounded-xl border p-4'><h2 className='mb-3 flex items-center gap-2 font-extrabold'><Paperclip size={18} />مرفقات الدرس</h2><div className='grid gap-2 sm:grid-cols-2'>{currentLesson.attachments.map((attachment) => { const attachmentId = attachment.id || attachment._id; return <button key={attachmentId} type='button' onClick={() => openAttachment(attachment)} disabled={!!openingAttachmentId} className='flex items-center justify-between rounded-lg border bg-gray-50 px-4 py-3 text-right text-sm font-bold hover:border-[#123C91] disabled:opacity-60'><span className='truncate'>{attachment.originalName || attachment.name || 'مرفق الدرس'}</span>{openingAttachmentId === attachmentId ? <LoaderCircle size={17} className='animate-spin' /> : <Download size={17} className='text-[#123C91]' />}</button>; })}</div></section>}
          <div className='mt-5 flex items-center justify-between rounded-xl border bg-[#F7FAFC] p-5'><div><h2 className='font-extrabold'>شهادة إتمام الدورة</h2><p className='mt-1 text-sm text-gray-500'>{view.certificateEligible || progress >= 100 ? 'شهادتك جاهزة' : 'أكمل الدروس والاختبارات للحصول عليها'}</p></div><button onClick={claimCertificate} disabled={working || (!view.certificateEligible && progress < 100)} className='flex items-center gap-2 rounded-lg bg-[#12C6B0] px-5 py-3 font-bold text-white disabled:bg-gray-300'><Award size={18} />الشهادة</button></div>
        </main>
      </div>
    </div>
  </div></StudentLayout>;
}
