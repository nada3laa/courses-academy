import { HiOutlineClipboardList, HiOutlineDownload } from "react-icons/hi";
import { getAssetUrl } from "../../../../services/APIService";

const LessonAssignments = ({ assignments = [], onAdd }) => (
  <div dir="rtl" className="rounded-2xl border border-[#E5E5E5] bg-white p-5">
    <div className="mb-4 flex items-center justify-between"><h3 className="text-xl font-semibold">الواجبات</h3>{!assignments.length && onAdd && <button type="button" onClick={onAdd} className="rounded-lg bg-[#123C91] text-white [&_svg]:text-white px-3 py-2 text-sm text-white">إضافة واجب</button>}</div>
    {!assignments.length ? <p className="py-6 text-center text-sm text-[#9CA3AF]">لا يوجد واجب مرتبط بهذه الحصة</p> : assignments.map((assignment) => (
      <div key={assignment.id || assignment._id} className="mb-3 rounded-xl border p-4">
        <div className="flex items-center gap-2"><HiOutlineClipboardList className="text-[#123C91]" /><p className="font-medium">{assignment.title}</p></div>
        <p className="mt-2 text-xs text-[#575F69]">التسليم: {new Date(assignment.dueDate).toLocaleString("ar-EG")} • الدرجة: {assignment.totalScore}</p>
        {!!assignment.attachments?.length && <div className="mt-3 flex flex-wrap gap-2">{assignment.attachments.map((file) => <a key={file.id || file._id || file.url} href={getAssetUrl(file.url)} target="_blank" rel="noreferrer" download={file.originalName} className="flex items-center gap-1 rounded-lg border px-2 py-1 text-xs"><HiOutlineDownload />{file.originalName || "تحميل المرفق"}</a>)}</div>}
      </div>
    ))}
  </div>
);

export default LessonAssignments;
