import { useEffect, useState } from 'react';
import { Award, Check, Copy, LoaderCircle, Printer } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import StudentLayout from '../../../../components/student/layout/StudentLayout';
import { fetchPublicCourse } from '../../api/coursesApi';
import { claimCourseCertificate, getCourseCertificateState } from '../../../../services/APIService';

const unwrap = (response) => response?.data?.data ?? response?.data ?? response;
const text = (value) => value?.ar || value?.en || value || '';

export default function CertificatePage() {
  const { slug } = useParams();
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const course = await fetchPublicCourse(slug);
      let certificateState = unwrap(await getCourseCertificateState(course.id));
      if (certificateState.eligible && !certificateState.issued) {
        const certificate = unwrap(await claimCourseCertificate(course.id));
        certificateState = { ...certificateState, issued: true, certificate };
      }
      setState({ ...certificateState, course });
    })().catch((error) => toast.error(error?.response?.data?.message || 'الشهادة غير متاحة بعد')).finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <StudentLayout><div className='grid min-h-[60vh] place-items-center'><LoaderCircle className='animate-spin text-[#123C91]' /></div></StudentLayout>;
  const certificate = state?.certificate;
  if (!state?.issued || !certificate) return <StudentLayout><div dir='rtl' className='mx-auto max-w-xl p-10 text-center'><Award className='mx-auto text-gray-300' size={52} /><h1 className='mt-4 text-xl font-extrabold'>الشهادة غير متاحة بعد</h1><p className='mt-2 text-gray-500'>أكمل جميع الدروس والاختبارات المطلوبة أولاً.</p><Link to={`/learn/${slug}`} className='mt-6 inline-block font-bold text-[#123C91]'>العودة إلى الدورة</Link></div></StudentLayout>;

  const verificationUrl = 'https://api.alacademeya.com/api/certificates/verify/' + certificate.verificationCode;
  const copy = async () => { await navigator.clipboard.writeText(verificationUrl); toast.success('تم نسخ رابط التحقق'); };

  return <StudentLayout><div dir='rtl' className='min-h-screen bg-[#F7F7FC] px-4 py-10'>
    <div className='mx-auto max-w-4xl text-center'>
      <div className='mx-auto mb-5 grid h-14 w-14 place-items-center rounded-full bg-[#12C6B0] text-white'><Check size={32} /></div>
      <h1 className='text-2xl font-extrabold'>تهانينا، تم إصدار شهادتك</h1>
      <section className='mt-8 border-[10px] border-double border-[#123C91] bg-white px-8 py-14 shadow-xl print:shadow-none'>
        <Award className='mx-auto text-[#123C91]' size={58} />
        <p className='mt-5 tracking-[.3em] text-[#667085]'>CERTIFICATE OF COMPLETION</p>
        <h2 className='mt-8 text-4xl font-extrabold text-[#123C91]'>{certificate.learnerName}</h2>
        <p className='mt-6 text-gray-500'>أتم بنجاح دورة</p>
        <h3 className='mt-3 text-2xl font-bold'>{text(certificate.courseTitle) || state.course.title}</h3>
        <p className='mt-6'>بإشراف: <b>{certificate.instructorName}</b></p>
        <div className='mt-10 flex flex-wrap justify-center gap-8 text-sm text-gray-500'><span>رقم الشهادة: {certificate.certificateNumber}</span><span>تاريخ الإكمال: {new Date(certificate.completionDate || certificate.issuedAt).toLocaleDateString('ar-EG')}</span></div>
      </section>
      <div className='mt-6 flex flex-wrap justify-center gap-3'><button onClick={() => window.print()} className='flex items-center gap-2 rounded-lg bg-[#123C91] px-6 py-3 font-bold text-white'><Printer size={18} />طباعة أو حفظ PDF</button><button onClick={copy} className='flex items-center gap-2 rounded-lg border bg-white px-6 py-3 font-bold'><Copy size={18} />نسخ رابط التحقق</button></div>
    </div>
  </div></StudentLayout>;
}
