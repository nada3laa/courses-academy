import { useContext, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Check, Download, GraduationCap, Link2 } from "lucide-react";
import { FaFacebookF, FaLinkedinIn } from "react-icons/fa6";
import toast from "react-hot-toast";
import StudentLayout from "../../../../components/student/layout/StudentLayout";
import { AuthContext } from "../../../../context/AuthContext";
import { courses } from "../../../../data/staticData";
import { getCourseProgress } from "../../../../utils/courseProgress";

const xml = (value) => String(value || "")
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

function makeCertificate({ studentName, courseName, instructorName, date }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="760" viewBox="0 0 1200 760">
  <defs>
    <pattern id="lace" width="34" height="34" patternUnits="userSpaceOnUse">
      <path d="M0 17 8 7l9 10L26 7l8 10-8 10-9-10-9 10Z" fill="none" stroke="#4776bd" stroke-width="2"/>
      <circle cx="17" cy="17" r="3" fill="#4776bd" opacity=".55"/>
    </pattern>
    <pattern id="grain" width="28" height="28" patternUnits="userSpaceOnUse"><circle cx="4" cy="5" r="1" fill="#123c91" opacity=".055"/></pattern>
    <linearGradient id="paper" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff"/><stop offset="1" stop-color="#f8fbff"/></linearGradient>
  </defs>
  <rect width="1200" height="760" fill="#fff"/>
  <rect x="12" y="12" width="1176" height="736" fill="none" stroke="#4776bd" stroke-width="12"/>
  <rect x="32" y="32" width="1136" height="696" fill="none" stroke="url(#lace)" stroke-width="28"/>
  <rect x="55" y="55" width="1090" height="650" fill="url(#paper)" stroke="#4776bd" stroke-width="3"/>
  <rect x="67" y="67" width="1066" height="626" fill="url(#grain)" stroke="#9ab2d8" stroke-width="1.5"/>
  <path d="M70 240C250 115 315 300 500 175S805 95 1130 260" fill="none" stroke="#3974b8" stroke-width="38" opacity=".035"/>
  <path d="M70 540C285 410 360 585 560 460S865 385 1130 525" fill="none" stroke="#3974b8" stroke-width="30" opacity=".035"/>
  <circle cx="600" cy="390" r="190" fill="#123c91" opacity=".04"/><circle cx="600" cy="390" r="125" fill="#12c6b0" opacity=".035"/>
  <circle cx="600" cy="110" r="26" fill="#123c91"/><text x="600" y="120" text-anchor="middle" font-family="Arial" font-size="27" font-weight="700" fill="#fff">A</text>
  <text x="600" y="158" text-anchor="middle" direction="rtl" font-family="Arial" font-size="27" font-weight="700" fill="#172942">الأكاديمية</text>
  <text x="600" y="224" text-anchor="middle" font-family="Georgia" font-size="52" font-weight="700" fill="#174b9a">CERTIFICATE</text>
  <text x="600" y="256" text-anchor="middle" font-family="Arial" font-size="15" letter-spacing="3" fill="#707986">OF APPRECIATION</text>
  <text x="600" y="310" text-anchor="middle" font-family="Arial" font-size="17" fill="#6f7782">Proudly presented to:</text>
  <text x="600" y="371" text-anchor="middle" direction="rtl" font-family="Arial" font-size="37" font-weight="700" fill="#174b9a">${xml(studentName)}</text>
  <line x1="415" y1="394" x2="785" y2="394" stroke="#28bfb4" stroke-width="2"/>
  <text x="600" y="450" text-anchor="middle" font-family="Arial" font-size="17" fill="#4f5967">In recognition of successfully completing</text>
  <text x="600" y="500" text-anchor="middle" direction="rtl" font-family="Arial" font-size="26" font-weight="700" fill="#174b9a">${xml(courseName)}</text>
  <line x1="130" y1="610" x2="405" y2="610" stroke="#174b9a" stroke-width="2"/>
  <text x="268" y="645" text-anchor="middle" direction="rtl" font-family="Arial" font-size="20" font-style="italic" fill="#29384d">${xml(instructorName)}</text>
  <text x="268" y="676" text-anchor="middle" font-family="Arial" font-size="17" fill="#687382">Instructor</text>
  <line x1="795" y1="610" x2="1070" y2="610" stroke="#174b9a" stroke-width="2"/>
  <text x="932" y="645" text-anchor="middle" font-family="Arial" font-size="20" font-weight="700" fill="#174b9a">${xml(date)}</text>
  <text x="932" y="676" text-anchor="middle" font-family="Arial" font-size="17" fill="#687382">Date</text>
  </svg>`;
}

export default function CertificatePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const course = useMemo(() => courses.find((item) => item.slug === slug), [slug]);
  const progress = useMemo(() => getCourseProgress(user, slug), [user, slug]);

  const studentName = user?.fullName || user?.name || [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "الطالب";
  const attempts = Object.values(progress.examResults || {}).filter((attempt) => attempt?.completedAt);
  const completedAt = attempts.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))[0]?.completedAt;
  const certificate = {
    studentName,
    courseName: course?.title || "الدورة التدريبية",
    instructorName: course?.instructor || "مدرب الأكاديمية",
    date: new Date(completedAt || Date.now()).toLocaleDateString("en-GB"),
  };
  const svg = useMemo(() => makeCertificate(certificate), [certificate.studentName, certificate.courseName, certificate.instructorName, certificate.date]);
  const imageUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

  const download = () => {
    const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `certificate-${slug}-${studentName.replaceAll(" ", "-")}.svg`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    toast.success("تم تنزيل الشهادة بنجاح");
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    toast.success("تم نسخ رابط الشهادة");
  };
  const shareUrl = encodeURIComponent(window.location.href);

  return <StudentLayout>
    <div dir="rtl" className="min-h-full bg-[#F7F7FC] py-8 sm:py-12">
      <div className="mx-auto w-full max-w-[760px] px-4 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-[#25bdb3] to-[#70e2da] text-white shadow-[0_7px_18px_rgba(18,198,176,.3)]"><Check size={34} strokeWidth={3} /></div>
        <h1 className="mt-6 text-xl font-extrabold text-[#202936] sm:text-2xl">تهانينا {studentName}، لقد أكملت بنجاح:</h1>
        <p className="mt-3 flex items-center justify-center gap-2 text-sm font-bold text-[#687382]"><GraduationCap size={18} className="text-gray-300" />{certificate.courseName}</p>

        <div className="mx-auto mt-8 w-full max-w-[620px] bg-white shadow-sm">
          <img src={imageUrl} alt={`شهادة ${studentName} في ${certificate.courseName}`} className="block h-auto w-full" />
        </div>

        <div className="mx-auto mt-6 grid max-w-[620px] gap-3 sm:grid-cols-[1fr_1.25fr]">
          <button onClick={() => navigate(`/learn/${slug}`)} className="order-2 flex h-12 items-center justify-center rounded-md border border-[#DDE3E9] bg-white text-sm font-bold text-[#687382] hover:bg-gray-50 sm:order-1">مواصلة التعلم ←</button>
          <button onClick={download} className="order-1 flex h-12 items-center justify-center gap-2 rounded-md bg-[#1746A2] text-sm font-bold text-white hover:bg-[#123C91] sm:order-2"><Download size={17} />تنزيل الشهادة</button>
        </div>

        <div className="mt-6 flex items-center justify-center gap-3 text-xs text-[#687382]"><span>شارك إنجازك</span>
          <button onClick={copyLink} aria-label="نسخ رابط الشهادة" className="grid h-8 w-8 place-items-center rounded-full border bg-white hover:text-[#123C91]"><Link2 size={14} /></button>
          <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`} target="_blank" rel="noreferrer" aria-label="مشاركة على لينكد إن" className="grid h-8 w-8 place-items-center rounded-full border bg-white hover:text-[#0A66C2]"><FaLinkedinIn size={13} /></a>
          <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" rel="noreferrer" aria-label="مشاركة على فيسبوك" className="grid h-8 w-8 place-items-center rounded-full border bg-white hover:text-[#1877F2]"><FaFacebookF size={13} /></a>
        </div>
        {!course && <Link to="/student-dashboard/courses" className="mt-5 inline-block text-sm font-bold text-[#123C91]">العودة إلى مكتبتي</Link>}
      </div>
    </div>
  </StudentLayout>;
}
