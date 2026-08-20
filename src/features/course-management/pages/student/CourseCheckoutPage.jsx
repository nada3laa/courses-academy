import { useContext, useMemo, useState } from "react";
import { CreditCard, LockKeyhole, ShieldCheck } from "lucide-react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import logo from "../../../../assets/icons/logo.svg";
import { AuthContext } from "../../../../context/AuthContext";
import { courses } from "../../../../data/staticData";
import { enrollInCourse } from "../../../../utils/courseEnrollments";

export default function CoursePaymentPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [paying, setPaying] = useState(false);
  const course = useMemo(() => courses.find((item) => item.slug === slug), [slug]);

  if (!course) return <Navigate to="/courses" replace />;
  if (!course.price) return <Navigate to={`/courses/${slug}`} replace />;

  const handlePayment = (event) => {
    event.preventDefault();
    setPaying(true);

    window.setTimeout(() => {
      enrollInCourse(user, course.slug);
      toast.success("تم الدفع والاشتراك في الدورة بنجاح");
      navigate("/student-dashboard/courses", { replace: true });
    }, 700);
  };

  return (
    <div dir="rtl" className="min-h-screen bg-[#F5F7FB] px-4 py-8 text-[#1F2937] sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-7 flex items-center justify-between gap-4">
          <Link to="/" aria-label="الذهاب إلى الصفحة الرئيسية">
            <img src={logo} alt="الأكاديمية" className="h-9 w-40" />
          </Link>
          <button type="button" onClick={() => navigate(-1)} className="text-sm font-bold text-[#123C91]">العودة إلى الدورة</button>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-extrabold">إتمام الدفع</h1>
          <p className="mt-2 text-sm text-[#6B7280]">أكمل بيانات الدفع للانضمام إلى الدورة.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <form onSubmit={handlePayment} className="rounded-xl border border-[#E1E7EF] bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3 border-b border-[#EDF0F4] pb-5">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#EAF1FF] text-[#123C91]"><CreditCard size={21} /></span>
              <div><h2 className="font-bold">الدفع بالبطاقة</h2><p className="text-xs text-[#7B8490]">بياناتك محمية ومشفرة</p></div>
            </div>

            <label className="mb-4 block text-sm font-semibold text-[#374151]">اسم حامل البطاقة
              <input required className="mt-2 h-12 w-full rounded-lg border border-[#DDE4EC] px-4 outline-none focus:border-[#123C91]" placeholder="الاسم كما هو مكتوب على البطاقة" />
            </label>
            <label className="mb-4 block text-sm font-semibold text-[#374151]">رقم البطاقة
              <input required inputMode="numeric" minLength={16} maxLength={19} className="mt-2 h-12 w-full rounded-lg border border-[#DDE4EC] px-4 text-left outline-none focus:border-[#123C91]" placeholder="0000 0000 0000 0000" dir="ltr" />
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="block text-sm font-semibold text-[#374151]">تاريخ الانتهاء
                <input required className="mt-2 h-12 w-full rounded-lg border border-[#DDE4EC] px-4 text-left outline-none focus:border-[#123C91]" placeholder="MM/YY" dir="ltr" />
              </label>
              <label className="block text-sm font-semibold text-[#374151]">CVV
                <input required inputMode="numeric" minLength={3} maxLength={4} className="mt-2 h-12 w-full rounded-lg border border-[#DDE4EC] px-4 text-left outline-none focus:border-[#123C91]" placeholder="123" dir="ltr" />
              </label>
            </div>
            <button disabled={paying} className="mt-7 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#123C91] font-bold text-white transition hover:bg-[#0F3278] disabled:opacity-60">
              <LockKeyhole size={17} /> {paying ? "جاري تأكيد الدفع..." : `ادفع ${course.price} ج.م`}
            </button>
          </form>

          <aside className="h-fit rounded-xl border border-[#E1E7EF] bg-white p-6 shadow-sm">
            <h2 className="mb-5 font-extrabold">ملخص الطلب</h2>
            <p className="font-bold leading-7 text-[#253142]">{course.title}</p>
            <p className="mt-1 text-sm text-[#7B8490]">بواسطة {course.instructor}</p>
            <div className="my-5 border-y border-[#EDF0F4] py-4 text-sm"><div className="flex justify-between"><span>سعر الدورة</span><b>{course.price} ج.م</b></div></div>
            <div className="flex justify-between text-lg font-extrabold text-[#123C91]"><span>الإجمالي</span><span>{course.price} ج.م</span></div>
            <p className="mt-5 flex items-center gap-2 text-xs text-[#6B7280]"><ShieldCheck size={17} className="text-[#0A9B72]" /> دفع آمن ووصول للدورة بعد التأكيد مباشرة.</p>
          </aside>
        </div>
      </div>
    </div>
  );
}
