import { useEffect, useRef, useState } from "react";
import { CloudUpload, Loader2, X } from "lucide-react";
import { createRecording, getClassroomSessions } from "../../../services/APIService";

const AddRecordingModal = ({ open, onClose, groups = [], onSuccess }) => {
  const inputRef = useRef(null);
  const [form, setForm] = useState({ title: "", classroom: "", session: "", file: null });
  const [sessions, setSessions] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!form.classroom) return;
    getClassroomSessions(form.classroom)
      .then((res) => setSessions(res.data?.data || []))
      .catch(() => setSessions([]));
  }, [form.classroom]);

  if (!open) return null;

  const submit = async () => {
    if (!form.title.trim() || !form.classroom || !form.session || !form.file) {
      setError("يرجى استكمال العنوان والمجموعة والحصة وملف التسجيل");
      return;
    }
    if (form.file.size > 500 * 1024 * 1024) { setError("الحد الأقصى لحجم التسجيل 500 MB"); return; }
    const allowed = ["video/mp4", "video/quicktime", "video/x-matroska", "video/x-msvideo"];
    if (!allowed.includes(form.file.type)) { setError("الصيغ المسموحة MP4 أو MOV أو MKV أو AVI"); return; }

    const data = new FormData();
    data.append("title", form.title.trim());
    data.append("classroom", form.classroom);
    data.append("session", form.session);
    data.append("recording", form.file);
    setSaving(true);
    setError("");
    try {
      await createRecording(data);
      setForm({ title: "", classroom: "", session: "", file: null });
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "تعذر رفع التسجيل");
    } finally { setSaving(false); }
  };

  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={(e) => e.target === e.currentTarget && onClose()}><div className="w-full max-w-lg rounded-2xl bg-white p-6" dir="rtl">
    <div className="mb-5 flex justify-between"><h3 className="text-lg font-semibold">إضافة تسجيل جديد</h3><button onClick={onClose}><X /></button></div>
    <div className="space-y-4">
      <input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="عنوان التسجيل" className="h-12 w-full rounded-lg border px-4" />
      <select value={form.classroom} onChange={(e) => { setSessions([]); setForm((p) => ({ ...p, classroom: e.target.value, session: "" })); }} className="h-12 w-full rounded-lg border px-4"><option value="">اختر المجموعة</option>{groups.map((g) => <option key={g.id || g._id} value={g.id || g._id}>{g.name}</option>)}</select>
      <select value={form.session} onChange={(e) => setForm((p) => ({ ...p, session: e.target.value }))} disabled={!form.classroom} className="h-12 w-full rounded-lg border px-4"><option value="">اختر الحصة</option>{sessions.map((s) => <option key={s.id || s._id} value={s.id || s._id}>{s.title}</option>)}</select>
      <button type="button" onClick={() => inputRef.current?.click()} className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed py-8 text-[#575F69]"><CloudUpload />{form.file?.name || "اختر ملف الفيديو (حتى 500 MB)"}</button>
      <input ref={inputRef} type="file" accept=".mp4,.mov,.mkv,.avi,video/*" className="hidden" onChange={(e) => setForm((p) => ({ ...p, file: e.target.files?.[0] || null }))} />
    </div>
    {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
    <button onClick={submit} disabled={saving} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#123C91] text-white [&_svg]:text-white py-3 text-white disabled:opacity-60">{saving && <Loader2 className="animate-spin" size={17} />}{saving ? "جارٍ الرفع..." : "رفع التسجيل"}</button>
  </div></div>;
};

export default AddRecordingModal;
