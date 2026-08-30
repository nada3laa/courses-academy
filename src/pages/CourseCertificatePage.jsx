import { useEffect, useState } from 'react';
import { Award, Check, Copy, ExternalLink, LoaderCircle, Printer } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import StudentLayout from '../components/student/layout/StudentLayout';
import logo from '../assets/icons/logo.svg';
import { fetchPublicCourse } from '../features/course-management/api/coursesApi';
import { claimCourseCertificate, getCourseCertificateState } from '../services/APIService';

const unwrap = (response) => response?.data?.data ?? response?.data ?? response;
const localizedText = (value, fallback = '') => {
  if (value == null) return fallback;
  if (typeof value === 'string') return value;
  return value.ar || value.en || fallback;
};
const formatDate = (value) => value
  ? new Intl.DateTimeFormat('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(value))
  : '—';

export default function CourseCertificatePage() {
  const { slug } = useParams();
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const loadCertificate = async () => {
      try {
        const course = await fetchPublicCourse(slug);
        let certificateState = unwrap(await getCourseCertificateState(course.id));
        if (certificateState.eligible && !certificateState.issued) {
          const certificate = unwrap(await claimCourseCertificate(course.id));
          certificateState = { ...certificateState, issued: true, certificate };
        }
        if (active) setState({ ...certificateState, course });
      } catch (requestError) {
        if (active) setError(requestError?.response?.data?.message || 'تعذر تحميل الشهادة الآن');
      } finally {
        if (active) setLoading(false);
      }
    };
    loadCertificate();
    return () => { active = false; };
  }, [slug]);

  if (loading) return (
    <StudentLayout><div className='grid min-h-[65vh] place-items-center'><LoaderCircle className='animate-spin text-[#123C91]' size={38} /></div></StudentLayout>
  );

  const certificate = state?.certificate;
  if (error || !state?.issued || !certificate) return (
    <StudentLayout>
      <main dir='rtl' className='grid min-h-[65vh] place-items-center bg-[#F7F9FC] px-4'>
        <div className='max-w-lg rounded-2xl bg-white p-10 text-center shadow-sm'>
          <Award className='mx-auto text-[#AAB4C5]' size={58} />
          <h1 className='mt-5 text-2xl font-extrabold text-[#17213A]'>الشهادة غير متاحة بعد</h1>
          <p className='mt-3 leading-7 text-[#667085]'>{error || state?.reason || 'أكمل جميع الدروس والاختبارات المطلوبة للحصول على الشهادة.'}</p>
          <Link to={`/learn/${slug}`} className='mt-7 inline-flex rounded-lg bg-[#123C91] px-6 py-3 font-bold text-white'>العودة إلى الدورة</Link>
        </div>
      </main>
    </StudentLayout>
  );

  const courseTitle = localizedText(certificate.courseTitle, state.course?.title);
  const completionDate = certificate.completionDate || state.completedAt || certificate.issuedAt;
  const verificationUrl = `https://api.alacademeya.com/api/certificates/verify/${encodeURIComponent(certificate.verificationCode)}`;
  const copyVerification = async () => {
    try {
      await navigator.clipboard.writeText(verificationUrl);
      toast.success('تم نسخ رابط التحقق من الشهادة');
    } catch {
      toast.error('تعذر نسخ الرابط');
    }
  };

  return (
    <StudentLayout>
      <main dir='rtl' className='certificate-page min-h-screen bg-[#F4F7FB] px-4 py-8 sm:px-6'>
        <style>{`@media print { @page { size: A4 landscape; margin: 0; } body * { visibility: hidden; } .certificate-sheet, .certificate-sheet * { visibility: visible; } .certificate-sheet { position: fixed !important; inset: 0 !important; width: 297mm !important; height: 210mm !important; box-shadow: none !important; border-radius: 0 !important; } .certificate-actions, header, aside, nav { display: none !important; } }`}</style>
        <div className='mx-auto max-w-6xl'>
          <div className='certificate-actions mb-6 text-center'>
            <div className='mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#D9F9F4] text-[#079C89]'><Check size={27} strokeWidth={3} /></div>
            <h1 className='mt-3 text-2xl font-extrabold text-[#17213A]'>تهانينا، تم إصدار شهادتك بنجاح</h1>
            <p className='mt-1 text-sm text-[#667085]'>يمكنك طباعتها أو حفظها بصيغة PDF ومشاركة رابط التحقق الرسمي.</p>
          </div>

          <section className='certificate-sheet relative mx-auto aspect-[1.414/1] w-full overflow-hidden rounded-2xl bg-[#FCFBF7] shadow-[0_20px_60px_rgba(18,60,145,.16)]'>
            <div className='absolute inset-3 border border-[#C7A95A]' />
            <div className='absolute inset-5 border-[3px] border-[#123C91]' />
            <div className='absolute inset-7 border border-[#C7A95A]/70' />
            <div aria-hidden className='absolute -left-24 -top-24 h-64 w-64 rotate-45 border-[24px] border-[#123C91]/[.06]' />
            <div aria-hidden className='absolute -bottom-24 -right-24 h-64 w-64 rotate-45 border-[24px] border-[#123C91]/[.06]' />
            <div aria-hidden className='absolute inset-0 grid place-items-center text-[22vw] font-black text-[#123C91]/[.025]'>A</div>

            <div className='relative flex h-full flex-col items-center px-[8%] py-[6%] text-center text-[#17213A]'>
              <img src={logo} alt='الأكاديمية' className='h-12 w-auto sm:h-16' />
              <p className='mt-2 text-[10px] font-bold tracking-[.35em] text-[#68748A] sm:text-xs'>ALACADEMEYA</p>
              <div className='mt-[3%] h-px w-28 bg-[#C7A95A]' />
              <h2 className='mt-[2%] font-serif text-2xl font-bold tracking-[.12em] text-[#123C91] sm:text-5xl'>شهادة إتمام</h2>
              <p className='mt-2 text-xs text-[#68748A] sm:text-base'>تشهد الأكاديمية بأن</p>
              <h3 className='mt-[2%] border-b-2 border-[#C7A95A] px-8 pb-2 text-2xl font-black text-[#17213A] sm:text-5xl'>{certificate.learnerName}</h3>
              <p className='mt-[2%] text-xs text-[#68748A] sm:text-base'>قد أتم بنجاح متطلبات الدورة التدريبية</p>
              <h4 className='mt-2 max-w-3xl text-lg font-extrabold text-[#123C91] sm:text-3xl'>{courseTitle}</h4>

              <div className='mt-auto grid w-full grid-cols-3 items-end gap-3 text-[9px] sm:text-sm'>
                <div className='text-right'>
                  <p className='font-bold text-[#17213A]'>{formatDate(completionDate)}</p>
                  <div className='mt-2 h-px bg-[#AAB4C5]' />
                  <p className='mt-1 text-[#68748A]'>تاريخ إتمام الدورة</p>
                </div>
                <div className='flex flex-col items-center'>
                  <div className='grid h-12 w-12 place-items-center rounded-full border-2 border-[#C7A95A] bg-[#123C91] text-white shadow sm:h-20 sm:w-20'>
                    <Award className='h-7 w-7 sm:h-11 sm:w-11' />
                  </div>
                  <p className='mt-2 font-mono text-[8px] font-bold text-[#68748A] sm:text-xs'>{certificate.certificateNumber}</p>
                </div>
                <div className='text-left'>
                  <p className='font-bold text-[#17213A]'>{certificate.instructorName || 'محاضر الدورة'}</p>
                  <div className='mt-2 h-px bg-[#AAB4C5]' />
                  <p className='mt-1 text-[#68748A]'>محاضر الدورة</p>
                </div>
              </div>
              <p className='mt-[2%] max-w-full truncate font-mono text-[7px] text-[#98A2B3] sm:text-[10px]'>رمز التحقق: {certificate.verificationCode}</p>
            </div>
          </section>

          <div className='certificate-actions mt-6 flex flex-wrap justify-center gap-3'>
            <button onClick={() => window.print()} className='flex items-center gap-2 rounded-xl bg-[#123C91] px-6 py-3 font-bold text-white shadow-sm hover:bg-[#0E3279]'><Printer size={18} />طباعة أو حفظ PDF</button>
            <button onClick={copyVerification} className='flex items-center gap-2 rounded-xl border border-[#D0D5DD] bg-white px-6 py-3 font-bold text-[#344054] hover:bg-[#F9FAFB]'><Copy size={18} />نسخ رابط التحقق</button>
            <a href={verificationUrl} target='_blank' rel='noreferrer' className='flex items-center gap-2 rounded-xl border border-[#D0D5DD] bg-white px-6 py-3 font-bold text-[#344054] hover:bg-[#F9FAFB]'><ExternalLink size={18} />التحقق من الشهادة</a>
          </div>
        </div>
      </main>
    </StudentLayout>
  );
}
