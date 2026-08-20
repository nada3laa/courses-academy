import { useNavigate } from "react-router-dom";

// ─── Desktop Table Row ────────────────────────────────────────────────────────
const TableRow = ({ r, navigate }) => {
  const goToGroupLessons = () =>
    navigate(`/admin/groups/${r.groupId}/lessons`, {
      state: { groupName: r.group },
    });

  const goToLesson = () =>
    navigate(`/admin/groups/${r.groupId}/lessons`, {
      state: { groupName: r.group, lessonId: r.lessonId },
    });

  return (
    <tr className="border-b border-[#E5E5E5] last:border-b-0 hover:bg-[#F9FAFA] transition-colors bg-white">
      <td className="px-4 py-4 text-[14px] font-medium text-[#1F2937] max-w-[220px] truncate">{r.title}</td>
      <td className="px-4 py-4 text-[14px] whitespace-nowrap">
        {/* ⚠️ بيفترض وجود r.groupId من الـ API — نفس route اللي في GroupTable: /admin/groups/:groupId/lessons */}
        <button
          type="button"
          onClick={goToGroupLessons}
          className="text-[#123C91] hover:underline text-right"
        >
          {r.group}
        </button>
      </td>
      <td className="px-4 py-4 text-[14px] whitespace-nowrap">
        {/* ⚠️ بيفترض وجود r.groupId و r.lessonId — بيوجّه لنفس صفحة حصص المجموعة مع تمرير lessonId في الـ state لأنه مفيش route منفصل لتفاصيل حصة واحدة عند الأدمن حاليًا */}
        <button
          type="button"
          onClick={goToLesson}
          className="text-[#123C91] hover:underline text-right"
        >
          {r.lesson}
        </button>
      </td>
      <td className="px-4 py-4 text-[14px] text-[#575F69] whitespace-nowrap">{r.teacher}</td>
      <td className="px-4 py-4 text-[14px] text-[#575F69] whitespace-nowrap" dir="ltr" style={{ textAlign: "right" }}>{r.duration}</td>
      <td className="px-4 py-4 text-[14px] text-[#575F69] whitespace-nowrap" dir="ltr" style={{ textAlign: "right" }}>{r.uploadDate}</td>
    </tr>
  );
};

// ─── Mobile Card ──────────────────────────────────────────────────────────────
const MobileCard = ({ r, navigate }) => {
  const goToGroupLessons = () =>
    navigate(`/admin/groups/${r.groupId}/lessons`, {
      state: { groupName: r.group },
    });

  const goToLesson = () =>
    navigate(`/admin/groups/${r.groupId}/lessons`, {
      state: { groupName: r.group, lessonId: r.lessonId },
    });

  return (
    <div className="bg-white border border-[#E5E5E5] rounded-2xl p-4 font-['IBM_Plex_Sans_Arabic'] shadow-sm" dir="rtl">
      {/* Title */}
      <div className="mb-3">
        <p className="text-[14px] font-medium text-[#1F2937] leading-snug flex-1">{r.title}</p>
      </div>

      {/* Details */}
      <div className="divide-y divide-gray-50">
        <div className="flex items-center justify-between py-2">
          <span className="text-xs text-[#9CA3AF]">المجموعة</span>
          <button type="button" onClick={goToGroupLessons} className="text-[13px] text-[#123C91] hover:underline">
            {r.group}
          </button>
        </div>
        <div className="flex items-center justify-between py-2">
          <span className="text-xs text-[#9CA3AF]">الحصة</span>
          <button type="button" onClick={goToLesson} className="text-[13px] text-[#123C91] hover:underline">
            {r.lesson}
          </button>
        </div>
        <div className="flex items-center justify-between py-2">
          <span className="text-xs text-[#9CA3AF]">المعلم</span>
          <span className="text-[13px] text-[#575F69]">{r.teacher}</span>
        </div>
        <div className="flex items-center justify-between py-2">
          <span className="text-xs text-[#9CA3AF]">المدة</span>
          <span className="text-[13px] text-[#575F69]" dir="ltr">{r.duration}</span>
        </div>
        <div className="flex items-center justify-between py-2">
          <span className="text-xs text-[#9CA3AF]">تاريخ الرفع</span>
          <span className="text-[13px] text-[#575F69]" dir="ltr">{r.uploadDate}</span>
        </div>
      </div>
    </div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
const RecordingsTable = ({ recordings = [] }) => {
  const navigate = useNavigate();

  if (recordings.length === 0) {
    return (
      <div dir="rtl" className="w-full bg-white rounded-2xl border border-[#E5E5E5] py-12 text-center text-sm text-[#9CA3AF] font-['IBM_Plex_Sans_Arabic']">
        لا توجد تسجيلات مطابقة
      </div>
    );
  }

  return (
    <div dir="rtl" className="w-full font-['IBM_Plex_Sans_Arabic']">

      {/* Desktop table — sm+ */}
      <div className="hidden sm:block bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden shadow-[0px_0px_4px_0px_rgba(0,0,0,0.08)]">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-right" style={{ minWidth: "700px" }}>
            <thead>
              <tr className="bg-[#F9FAFA] border-b border-[#E5E5E5]">
                {["التسجيل", "المجموعة", "الحصة", "المعلم", "المدة", "تاريخ الرفع"].map((h) => (
                  <th key={h} className="px-4 py-3 text-right text-[13px] font-medium text-[#575F69] whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recordings.map((r) => <TableRow key={r.id} r={r} navigate={navigate} />)}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="flex sm:hidden flex-col gap-3">
        {recordings.map((r) => <MobileCard key={r.id} r={r} navigate={navigate} />)}
      </div>
    </div>
  );
};

export default RecordingsTable;