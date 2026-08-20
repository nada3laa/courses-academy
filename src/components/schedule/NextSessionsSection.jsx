import { useEffect, useState } from "react";
import { CalendarDays, Clock, ExternalLink, Users, Video } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getNextSessions } from "../../services/APIService";

const normalizeSessions = (response) => {
  const data = response?.data?.data;
  const sessions = Array.isArray(data)
    ? data
    : Array.isArray(data?.sessions)
      ? data.sessions
      : data
        ? [data]
        : [];

  return sessions.filter(
    (session) => !["completed", "cancelled"].includes(session?.status),
  );
};

const classroomIdOf = (session) =>
  session.classroom?.id || session.classroom?._id || session.classroom;

const classroomNameOf = (session) =>
  session.classroom?.name || session.classroomName || "المجموعة";

const NextSessionsSection = ({ role, subtitle = "الحصص القادمة حسب جدولك" }) => {
  const navigate = useNavigate();
  const [now] = useState(() => Date.now());
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getNextSessions()
      .then((response) => active && setSessions(normalizeSessions(response)))
      .catch((err) => active && setError(err.response?.data?.message || "تعذر تحميل الحصص القادمة"))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const openSession = (session) => {
    const sessionId = session.id || session._id;
    const classroomId = classroomIdOf(session);
    if (role === "teacher") navigate(`/teacher/groups/${classroomId}/lessons/${sessionId}`);
    else if (role === "student") navigate(`/student/groups/${classroomId}/lessons/${sessionId}`);
    else if (session.meetingLink) window.open(session.meetingLink, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="h-full w-full rounded-2xl border border-[#1F293726] bg-white p-4 font-['Tajawal'] sm:p-6" dir="rtl">
      <div className="mb-5"><h3 className="text-lg font-medium text-[#1F2937]">الحصص القادمة</h3><p className="mt-1 text-sm text-[#8C9198]">{subtitle}</p></div>
      {loading ? <p className="py-10 text-center text-sm text-[#8C9198]">جاري تحميل الحصص...</p> : error ? <p className="py-10 text-center text-sm text-red-500">{error}</p> : !sessions.length ? (
        <div className="py-10 text-center"><CalendarDays className="mx-auto mb-3 text-[#B8C4D8]" size={48} /><p className="font-medium text-[#1F2937]">لا توجد حصص قادمة</p></div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => {
            const start = new Date(session.scheduledDate || session.startAt);
            const isLive = session.status === "live";
            const isMissed =
              role === "teacher" &&
              !Number.isNaN(start.getTime()) &&
              start.getTime() < now &&
              ["scheduled", "upcoming"].includes(session.status);
            const students = session.classroom?.students?.length ?? session.studentsCount;
            return <div key={session.id || session._id} className="flex flex-col gap-3 rounded-xl border border-[#1F29371A] p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3"><div className={`rounded-lg p-3 ${isMissed ? "bg-red-50 text-red-500" : "bg-[#EAF4FF] text-[#123C91]"}`}><Video size={22} /></div><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h4 className="truncate text-lg font-bold text-[#1F2937]">{session.title || "حصة قادمة"}</h4><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${isMissed ? "bg-red-50 text-red-500" : "bg-[#EAF4FF] text-[#123C91]"}`}>{isMissed ? "لم تُعقد" : "مجدولة — لم تبدأ بعد"}</span></div><p className="text-base font-bold text-[#123C91]">{classroomNameOf(session)}</p><div className="mt-1 flex flex-wrap gap-3 text-sm font-semibold text-[#575F69]"><span className="flex items-center gap-1 font-bold"><Clock size={15} />{Number.isNaN(start.getTime()) ? "—" : start.toLocaleString("ar-EG", { weekday: "short", hour: "numeric", minute: "2-digit", hour12: true })}</span>{students != null && <span className="flex items-center gap-1"><Users size={15} />{students} طالب</span>}</div></div></div>
              {(role === "teacher" || role === "student" || session.meetingLink) && <button type="button" onClick={() => openSession(session)} className={`flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium text-white ${isLive ? "bg-green-600" : "bg-[#123C91] text-white [&_svg]:text-white"}`}>{isLive && session.meetingLink ? <ExternalLink size={15} /> : null}{isLive && session.meetingLink && role !== "teacher" && role !== "student" ? "دخول الحصة" : "عرض التفاصيل"}</button>}
            </div>;
          })}
        </div>
      )}
    </div>
  );
};

export default NextSessionsSection;
