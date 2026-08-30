import { useEffect, useState } from 'react';
import { CreditCard, LoaderCircle, ShieldCheck } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import logo from '../../../../assets/icons/logo.svg';
import { fetchPublicCourse } from '../../api/coursesApi';
import { startCoursePurchase } from '../../../../services/APIService';

const unwrap = (response) => response?.data?.data ?? response?.data ?? response;

export default function CoursePaymentPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    fetchPublicCourse(slug)
      .then(setCourse)
      .catch(() => toast.error('تعذر تحميل بيانات الدورة'))
      .finally(() => setLoading(false));
  }, [slug]);

  const checkout = async () => {
    if (!course?.id || paying) return;
    setPaying(true);
    const loadingToast = toast.loading('جاري تجهيز صفحة الدفع الآمنة...');
    try {
      const data = unwrap(await startCoursePurchase(course.id));
      const purchaseUrl = data?.purchaseUrl || data?.checkoutUrl || data?.url;
      if (!purchaseUrl) throw new Error('لم يُرجع الخادم رابط الدفع');
      toast.success('سيتم تحويلك إلى بوابة الدفع', { id: loadingToast });
      window.location.assign(purchaseUrl);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || 'تعذر بدء عملية الدفع', { id: loadingToast });
      setPaying(false);
    }
  };

  if (loading) return <div className='grid min-h-screen place-items-center'><LoaderCircle className='animate-spin text-[#123C91]' /></div>;
  if (!course) return <div className='grid min-h-screen place-items-center'><Link to='/courses'>العودة إلى الدورات</Link></div>;

  return <div dir='rtl' className='min-h-screen bg-[#F5F7FB] px-4 py-8 text-[#1F2937]'>
    <div className='mx-auto max-w-3xl'>
      <div className='mb-8 flex items-center justify-between'><img src={logo} alt='الأكاديمية' className='h-9 w-40' /><button onClick={() => navigate(-1)} className='text-sm font-bold text-[#123C91]'>العودة للدورة</button></div>
      <div className='grid gap-6 md:grid-cols-[1fr_300px]'>
        <section className='rounded-2xl border bg-white p-7 shadow-sm'>
          <span className='mb-5 grid h-12 w-12 place-items-center rounded-xl bg-[#EAF1FF] text-[#123C91]'><CreditCard /></span>
          <h1 className='text-2xl font-extrabold'>إتمام الاشتراك</h1>
          <p className='mt-3 leading-7 text-[#667085]'>سيتم تحويلك إلى بوابة الدفع الرسمية لإكمال العملية بأمان. لا تُدخل بيانات بطاقتك داخل موقع الأكاديمية.</p>
          <button onClick={checkout} disabled={paying} className='mt-7 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#123C91] font-bold text-white disabled:opacity-60'>{paying ? <LoaderCircle className='animate-spin' size={18} /> : <ShieldCheck size={18} />}{paying ? 'جاري التحويل...' : 'الانتقال للدفع الآمن'}</button>
        </section>
        <aside className='rounded-2xl border bg-white p-6 shadow-sm'><h2 className='font-extrabold'>ملخص الطلب</h2><p className='mt-5 font-bold'>{course.title}</p><p className='mt-1 text-sm text-[#667085]'>بواسطة {course.instructor}</p><div className='mt-6 flex justify-between border-t pt-5 text-lg font-extrabold text-[#123C91]'><span>الإجمالي</span><span>{course.effectivePrice || course.price} ج.م</span></div></aside>
      </div>
    </div>
  </div>;
}
