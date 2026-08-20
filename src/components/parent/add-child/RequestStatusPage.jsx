import React, { useEffect, useRef, useState } from 'react';
import { Check, Hourglass, XCircle, RotateCcw } from 'lucide-react';
import { getMyStudents } from '../../../services/APIService';

// ⚠️ افتراضات عن شكل الـ response من GET /parents/students (لحد ما تتأكد من Postman):
// كل عنصر في القايمة فيه: { id, fullName, status: 'pending' | 'approved' | 'rejected', rejectionReason, createdAt }
// لو أسماء الحقول عندك مختلفة، عدّل الدالة دي بس.
const mapStudentToStatus = (student) => ({
  status: student?.status || student?.accountStatus || 'pending',
  studentName: student?.fullName || student?.name || '',
  reason: student?.rejectionReason || student?.reason || '',
});

const fetchLatestRequestStatus = async () => {
  const res = await getMyStudents();
  const list = res.data?.data || res.data || [];

  if (!list.length) return null;

  // نختار آخر طالب متضاف (الأحدث) بناءً على تاريخ الإنشاء لو موجود، وإلا آخر عنصر في القايمة
  const sorted = [...list].sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateB - dateA;
  });

  return mapStudentToStatus(sorted[0]);
};

// كل قد إيه (بالمللي ثانية) نعيد السؤال عن الحالة طول ما الطلب لسه "معلق"
const POLL_INTERVAL_MS = 15000;

const STATUS_CONFIG = {
  pending: {
    icon: Hourglass,
    color: '#F59E0B',
    bg: '#FEF3C7',
    title: 'الطلب قيد المراجعة',
    description: 'فريق الإدارة بيراجع طلبك الآن، هيتم إشعارك فور اتخاذ القرار.',
  },
  approved: {
    icon: Check,
    color: '#10B981',
    bg: '#D1FAE5',
    title: 'تم قبول الطلب',
    description: 'تم تفعيل حساب الطالب بنجاح، يمكنه الآن تسجيل الدخول.',
  },
  rejected: {
    icon: XCircle,
    color: '#EF4444',
    bg: '#FEE2E2',
    title: 'تم رفض الطلب',
    description: 'لم يتم قبول الطلب، يمكنك مراجعة السبب أدناه أو التواصل مع الدعم.',
  },
};

const RequestStatusPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusData, setStatusData] = useState(null);
  const pollRef = useRef(null);

  const load = async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    setError('');
    try {
      const data = await fetchLatestRequestStatus();
      setStatusData(data);
    } catch (err) {
      setError('تعذر تحميل حالة الطلب، يرجى المحاولة مرة أخرى');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // التحميل الأول
  useEffect(() => {
    load();
  }, []);

  // Polling تلقائي: طول ما الحالة "pending"، نعيد السؤال كل فترة من غير ما نظهر لودينج
  // كامل الصفحة، ونوقف تلقائيًا لو الحالة اتغيرت (قُبل/اتّرفض) أو الصفحة اتقفلت.
  useEffect(() => {
    if (statusData?.status !== 'pending') {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
      return;
    }

    pollRef.current = setInterval(() => {
      load({ silent: true });
    }, POLL_INTERVAL_MS);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusData?.status]);

  if (loading) {
    return (
      <div dir="rtl" className="flex flex-col items-center justify-center py-16 text-center font-['IBM_Plex_Sans_Arabic']">
        <div className="w-8 h-8 border-3 border-[#123C91] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-[#575F69] text-[14px]">جاري تحميل حالة الطلب...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div dir="rtl" className="flex flex-col items-center justify-center py-16 text-center font-['IBM_Plex_Sans_Arabic']">
        <p className="text-red-500 text-[14px] mb-4">{error}</p>
        <button
          onClick={() => load()}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#123C91] text-white [&_svg]:text-white rounded-xl text-[14px] font-medium cursor-pointer"
        >
          <RotateCcw size={16} />
          إعادة المحاولة
        </button>
      </div>
    );
  }

  if (!statusData) {
    return (
      <div dir="rtl" className="flex flex-col items-center justify-center py-16 text-center font-['IBM_Plex_Sans_Arabic']">
        <p className="text-[#575F69] text-[14px] mb-4">لا يوجد طلب مسجل حتى الآن</p>
        <button
          onClick={() => load()}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#123C91] text-white [&_svg]:text-white rounded-xl text-[14px] font-medium cursor-pointer"
        >
          <RotateCcw size={16} />
          تحديث
        </button>
      </div>
    );
  }

  const config = STATUS_CONFIG[statusData?.status] || STATUS_CONFIG.pending;
  const Icon = config.icon;

  return (
    <div dir="rtl" className="flex flex-col items-center justify-center py-4 text-center space-y-4 font-['IBM_Plex_Sans_Arabic']">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center"
        style={{ backgroundColor: config.bg }}
      >
        <Icon size={28} style={{ color: config.color }} />
      </div>

      <div>
        <h2 className="text-[20px] font-bold text-[#1F2937] mb-2">{config.title}</h2>
        <p className="text-[#1F2937BF] mt-2 text-[14px] max-w-md mx-auto">
          {config.description}
        </p>
      </div>

      {statusData?.status === 'rejected' && statusData?.reason && (
        <div className="w-full max-w-130 p-4 rounded-xl border border-red-200 bg-red-50 text-right">
          <p className="text-[13px] font-medium text-red-600 mb-1">سبب الرفض:</p>
          <p className="text-[14px] text-[#1F2937]">{statusData.reason}</p>
        </div>
      )}

      <div className="w-full max-w-130 p-8 rounded-2xl border border-[#E5E5E5] bg-[#1F29371A] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.12)] space-y-4 text-right">
        <div className="flex items-center justify-start gap-3">
          <div className="w-6 h-6 flex items-center justify-center rounded-full bg-[#10B981]">
            <Check size={14} className="text-white" strokeWidth={3} />
          </div>
          <span className="text-[14px] text-[#1F2937]">تم استلام طلبك بنجاح</span>
        </div>

        <div className="flex items-center justify-start gap-3">
          <div className="w-6 h-6 flex items-center justify-center">
            <Hourglass
              size={20}
              className={statusData?.status === 'pending' ? 'text-[#F59E0B] animate-pulse' : 'text-[#9CA3AF]'}
            />
          </div>
          <span className="text-[14px] text-[#1F2937]">
            {statusData?.status === 'pending' ? 'جاري مراجعة الحساب من الإدارة' : 'تمت مراجعة الحساب من الإدارة'}
          </span>
        </div>

        <div className="flex items-center justify-start gap-3">
          <div className="w-6 h-6 flex items-center justify-center rounded-full" style={{ backgroundColor: statusData?.status !== 'pending' ? config.bg : 'transparent' }}>
            <Icon size={statusData?.status !== 'pending' ? 14 : 20} style={{ color: statusData?.status !== 'pending' ? config.color : '#9CA3AF' }} />
          </div>
          <span className="text-[14px] text-[#1F2937]">
            {statusData?.status === 'approved' && 'تم قبول الطلب وتفعيل الحساب'}
            {statusData?.status === 'rejected' && 'تم رفض الطلب'}
            {statusData?.status === 'pending' && 'سيتم إشعارك فور اتخاذ القرار'}
          </span>
        </div>
      </div>

      {statusData?.status === 'pending' && (
        <p className="text-[12px] text-[#9CA3AF]">
          الصفحة بتتحدث تلقائيًا كل شوية، مفيش داعي تعمل رفريش يدوي.
        </p>
      )}

      <button
        onClick={() => load()}
        className="flex items-center gap-2 bg-white border border-[#E5E5E5] text-[#123C91] py-2.5 px-8 rounded-xl font-medium mt-4 cursor-pointer"
      >
        <RotateCcw size={16} />
        تحديث الحالة
      </button>
    </div>
  );
};

export default RequestStatusPage;