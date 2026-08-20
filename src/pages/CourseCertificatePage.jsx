import { useNavigate, useParams } from "react-router-dom";
import { Download, GraduationCap, CheckCircle2, Link2 } from "lucide-react";
import StudentLayout from "../components/student/layout/StudentLayout";

// ⚠️ لسه محتاجة تتأكدي من شكل الداتا الجاية من الـ API (اسم الطالب، اسم الكورس، اسم
// المحاضر، تاريخ الإتمام، رابط تحميل PDF) وتستبدلي القيم الثابتة تحت دي بيها —
// اتأكدي من الأسماء عن طريق Postman / تبويب Network قبل ما تربطيها.
const CERTIFICATE = {
  studentName: "Mohamed Alaa",
  courseName: "تعلم البرمجة بلغة Python من الصفر",
  courseNameEn: "Python Programming from Scratch",
  instructorName: "Instructor Name",
  date: "06-08-2026",
};

// أيقونات براند (لينكدإن وفيسبوك) — lucide-react شالهم من عندها، فعملتهم SVG محلي بسيط
function LinkedinIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width={14} height={14} {...props}>
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.11 20.45H3.56V9h3.55v11.45z" />
    </svg>
  );
}

function FacebookIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width={14} height={14} {...props}>
      <path d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5H16.7V3.6C16.4 3.55 15.4 3.47 14.24 3.47c-2.4 0-4.05 1.47-4.05 4.16v2.27H7.5V13h2.69v8h3.31z" />
    </svg>
  );
}

export default function CertificatePage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  return (
    <StudentLayout>
      <div dir="rtl" className="min-h-screen bg-[#F8FAFC] pb-10 sm:pb-12 font-['IBM_Plex_Sans_Arabic']">
        <div className="mx-auto w-full max-w-[820px] px-4 sm:px-6 pt-4 sm:pt-6 text-center space-y-3 sm:space-y-4">

          {/* أيقونة النجاح */}
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[#D1FAE5] text-[#10B981] rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={22} strokeWidth={2.5} />
          </div>

          {/* العنوان */}
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-[#1F2937] font-['Tajawal'] leading-snug">
              تهانينا محمد، لقد أكملتِ بنجاح :
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 flex items-center justify-center gap-1.5">
              <GraduationCap size={15} className="text-[#123C91]" />
              {CERTIFICATE.courseName}
            </p>
          </div>

          {/* ===== إطار الشهادة الزخرفي ===== */}
          <div className="rounded-2xl p-2 sm:p-2.5 shadow-lg mx-auto"
            style={{
              backgroundColor: "#EEF2F9",
              backgroundImage:
                "repeating-linear-gradient(45deg, #123C9126 0, #123C9126 1.2px, transparent 1.2px, transparent 9px), repeating-linear-gradient(-45deg, #123C9126 0, #123C9126 1.2px, transparent 1.2px, transparent 9px)",
            }}
          >
            <div className="rounded-xl border-2 border-[#123C91] bg-white p-1 sm:p-1.5">
              <div dir="ltr" className="relative overflow-hidden rounded-lg bg-white px-5 py-5 sm:px-10 sm:py-7">

                {/* العلامة المائية */}
                <span
                  aria-hidden
                  className="pointer-events-none select-none absolute inset-0 flex items-center justify-center font-serif font-black text-[#123C91]"
                  style={{ fontSize: "clamp(110px, 26vw, 200px)", opacity: 0.035, lineHeight: 1 }}
                >
                  A
                </span>

                {/* زوايا زخرفية */}
                <span className="pointer-events-none absolute top-2.5 left-2.5 w-5 h-5 sm:w-7 sm:h-7 border-t-2 border-l-2 border-[#123C91]/40 rounded-tl-md" />
                <span className="pointer-events-none absolute top-2.5 right-2.5 w-5 h-5 sm:w-7 sm:h-7 border-t-2 border-r-2 border-[#123C91]/40 rounded-tr-md" />
                <span className="pointer-events-none absolute bottom-2.5 left-2.5 w-5 h-5 sm:w-7 sm:h-7 border-b-2 border-l-2 border-[#123C91]/40 rounded-bl-md" />
                <span className="pointer-events-none absolute bottom-2.5 right-2.5 w-5 h-5 sm:w-7 sm:h-7 border-b-2 border-r-2 border-[#123C91]/40 rounded-br-md" />

                {/* المحتوى */}
                <div className="relative space-y-1.5 sm:space-y-2">
                  <div className="flex items-center justify-center gap-1.5 text-[12px] sm:text-[13px] font-extrabold text-[#123C91]">
                    <span className="rounded-full bg-[#123C91] text-white flex items-center justify-center text-[9px] w-[18px] h-[18px]">A</span>
                    الأكاديمية
                  </div>

                  <h2 className="font-serif font-bold text-[#1F2937] tracking-wide" style={{ fontSize: "clamp(18px, 4vw, 26px)" }}>
                    CERTIFICATE
                  </h2>
                  <p className="text-[9px] sm:text-[10px] tracking-[0.25em] text-gray-400">OF APPRECIATION</p>

                  <p className="text-xs sm:text-sm text-gray-600 pt-1">Proudly presented to:</p>

                  <h3 className="inline-block font-serif italic font-bold text-[#123C91] bg-[#ECFDF5]/70 px-5 sm:px-8 border-b-2 border-dashed border-[#123C91]/50 pb-1.5"
                    style={{ fontSize: "clamp(17px, 4vw, 23px)" }}
                  >
                    {CERTIFICATE.studentName}
                  </h3>

                  <p className="text-[10px] sm:text-[11px] text-gray-500 max-w-xs mx-auto pt-0.5">
                    In recognition of successfully completing
                  </p>
                  <p className="font-bold text-[#123C91] text-xs sm:text-sm">
                    {CERTIFICATE.courseNameEn}
                  </p>

                  <div className="flex justify-between items-end pt-4 sm:pt-6 text-[10px] sm:text-[11px] text-gray-500">
                    <div className="text-left">
                      <div className="w-20 sm:w-28 border-t border-gray-300 mb-1" />
                      <p className="italic text-gray-700">{CERTIFICATE.instructorName}</p>
                      <p>Instructor</p>
                    </div>
                    <div className="text-right">
                      <div className="w-20 sm:w-28 border-t border-gray-300 mb-1 ml-auto" />
                      <p className="font-bold text-[#123C91]">{CERTIFICATE.date}</p>
                      <p>Date</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* ===== نهاية إطار الشهادة ===== */}

          {/* الأزرار */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3 pt-1">
            <button
              onClick={() => navigate(`/learn/${slug}`)}
              className="w-full sm:w-auto px-6 py-2.5 border border-[#DDE3E9] bg-white text-sm font-bold rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
            >
              ← مواصلة التعلم
            </button>
            <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-2.5 bg-[#123C91] text-white text-sm font-bold rounded-xl hover:bg-[#0F3278] shadow-md transition-colors">
              <Download size={16} /> تنزيل الشهادة
            </button>
          </div>

          {/* مشاركة الإنجاز */}
          <div className="flex flex-col items-center gap-1.5 pt-0.5">
            <p className="text-xs text-gray-500">شارك إنجازك</p>
            <div className="flex items-center gap-3">
              <button className="w-7 h-7 rounded-full border border-[#DDE3E9] bg-white flex items-center justify-center text-gray-500 hover:text-[#123C91] hover:border-[#123C91] transition-colors">
                <Link2 size={14} />
              </button>
              <button className="w-7 h-7 rounded-full border border-[#DDE3E9] bg-white flex items-center justify-center text-gray-500 hover:text-[#0A66C2] hover:border-[#0A66C2] transition-colors">
                <LinkedinIcon />
              </button>
              <button className="w-7 h-7 rounded-full border border-[#DDE3E9] bg-white flex items-center justify-center text-gray-500 hover:text-[#1877F2] hover:border-[#1877F2] transition-colors">
                <FacebookIcon />
              </button>
            </div>
          </div>

        </div>
      </div>
    </StudentLayout>
  );
}