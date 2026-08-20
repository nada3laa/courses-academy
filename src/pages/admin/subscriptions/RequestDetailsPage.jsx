import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, BookOpen, Phone, User, GraduationCap, UserCheck, UserX } from "lucide-react";
import AdminLayout from "../../../components/admin/layout/AdminLayout";
import Breadcrumbs from "../../shared/Breadcrumbs";

const MOCK_REQUESTS = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  student: "محمد أحمد",
  guardian: i % 3 === 0 ? "--" : "أحمد علي",
  guardianPhone: i % 3 === 0 ? "--" : "+20 111 987 6543",
  studentPhone: "+20 100 123 4567",
  subjects:
    i % 3 === 0
      ? ["رياضيات", "لغة عربية", "فيزياء"]
      : i % 3 === 1
      ? ["رياضيات"]
      : ["كيمياء", "رياضيات", "لغة عربية", "فيزياء"],
  date: "2024-09-01",
  status: i % 3 === 2 ? "مكتمل" : "قيد الانتظار",
  stage: "ثانوية",
  grade: "الثالث الثانوي",
}));

// ─── Status Stats Bar ─────────────────────────────────────────────────────────
const RequestStatusBar = ({ status, date }) => {
  const isPending = status === "قيد الانتظار";
  const stats = [
    {
      label: "حالة الطلب",
      value: status,
      color: isPending ? "text-[#FF8A00]" : "text-[#00A63E]",
      bg:    isPending ? "bg-[#FF8A001A]" : "bg-[#00A63E1A]",
      icon:  isPending ? UserX : UserCheck,
    },
    {
      label: "تاريخ الطلب",
      value: date,
      color: "text-[#123C91]",
      bg:    "bg-[#EAF4FF]",
      icon:  Calendar,
    },
  ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {stats.map((s) => {
        const Icon = s.icon;
        return (
          <div key={s.label} className="bg-white border border-gray-100 rounded-xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all">
            <div className={`p-3 rounded-lg ${s.bg} shrink-0`}>
              <Icon size={22} className={s.color} />
            </div>
            <div className="text-right flex-1 min-w-0">
              <h3 className={`text-[16px] font-bold font-['Tajawal'] truncate ${s.color}`}>{s.value}</h3>
              <p className="text-gray-500 text-[12px] mt-0.5">{s.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const SubjectTag = ({ label }) => (
  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[12px] font-medium bg-[#EAF4FF] text-[#123C91]">
    {label}
  </span>
);

const DetailRow = ({ label, value, icon: Icon }) => (
  <div className="bg-[#F9FAFA] rounded-xl px-4 py-3 flex items-center justify-between gap-2">
    <span className="text-[12px] text-[#8C9198] shrink-0">{label}</span>
    <div className="flex items-center gap-2 min-w-0">
      {Icon && <Icon size={13} className="text-[#123C91] shrink-0" />}
      <span className="text-[14px] font-medium text-[#1F2937] font-['Tajawal'] truncate">{value ?? "--"}</span>
    </div>
  </div>
);

const SectionCard = ({ title, children }) => (
  <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
    <h4 className="font-['Tajawal'] font-semibold text-[15px] text-[#1F2937] mb-3 text-right">{title}</h4>
    {children}
  </div>
);

const RequestDetailsPage = () => {
  const { id }   = useParams();
  const navigate = useNavigate();
  const request  = MOCK_REQUESTS.find((r) => r.id === Number(id)) ?? MOCK_REQUESTS[0];

  return (
    <AdminLayout>
        <Breadcrumbs homeTo="/admin-dashboard" />
      <div dir="rtl" className="w-full p-2 sm:p-4 font-['IBM_Plex_Sans_Arabic']">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
          <button
            onClick={() => navigate("/admin/subscriptions/requests")}
            className="flex items-center gap-2 text-[#575F69] hover:text-[#123C91] text-[14px] transition-colors"
          >
            <ArrowLeft size={16} />
            <span>طلبات الاشتراك</span>
          </button>
          <div className="text-right">
            <h2 className="font-['IBM_Plex_Sans_Arabic'] font-semibold text-[20px] text-[#123C91]">
              تفاصيل الطلب
            </h2>
          </div>
        </div>

        <div className="space-y-4 max-w-2xl mr-auto">

          <RequestStatusBar status={request.status} date={request.date} />

          <SectionCard title="بيانات الطالب">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <DetailRow label="اسم الطالب"      value={request.student}      icon={User}          />
              <DetailRow label="رقم الهاتف"       value={request.studentPhone} icon={Phone}         />
              <DetailRow label="المرحلة الدراسية" value={request.stage}        icon={GraduationCap} />
              <DetailRow label="الصف الدراسي"     value={request.grade}        icon={BookOpen}      />
            </div>
          </SectionCard>

          <SectionCard title="بيانات ولي الأمر">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <DetailRow label="اسم ولي الأمر" value={request.guardian}      icon={User}  />
              <DetailRow label="رقم الهاتف"    value={request.guardianPhone} icon={Phone} />
            </div>
          </SectionCard>

          <SectionCard title="المواد المطلوبة">
            <div className="flex flex-wrap gap-2">
              {request.subjects.map((s) => <SubjectTag key={s} label={s} />)}
            </div>
          </SectionCard>

          {request.status === "قيد الانتظار" && (
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <button
                onClick={() => navigate(`/admin/subscriptions/requests/${request.id}/activate`)}
                className="flex-1 py-3 bg-[#123C91] text-white [&_svg]:text-white rounded-xl font-medium text-[14px] hover:bg-[#0f3280] transition-colors"
              >
                تفعيل الاشتراك
              </button>
              <button
                onClick={() => navigate("/admin/subscriptions/requests")}
                className="flex-1 py-3 border border-[#E5E5E5] rounded-xl text-[#374151] font-medium text-[14px] hover:border-gray-400 transition-colors"
              >
                إلغاء
              </button>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default RequestDetailsPage;