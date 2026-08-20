import { Download, ExternalLink } from "lucide-react";
import { getAssetUrl } from "../../../../services/APIService";

const normalizePlayableUrl = (url) => {
  if (!url) return "";

  const absoluteUrl = /^https?:\/\//i.test(url)
    ? typeof window !== "undefined" && window.location.protocol === "https:"
      ? url.replace(/^http:\/\//i, "https://")
      : url
    : getAssetUrl(url);

  return encodeURI(absoluteUrl);
};

const pickRecordingUrl = (recording) =>
  recording?.url ||
  recording?.secureUrl ||
  recording?.secure_url ||
  recording?.path ||
  recording?.fileUrl ||
  recording?.recordingUrl ||
  recording?.videoUrl ||
  (typeof recording?.recording === "string" ? recording.recording : "") ||
  recording?.recording?.url ||
  recording?.recording?.secureUrl ||
  recording?.recording?.secure_url ||
  recording?.recording?.path ||
  recording?.file?.url ||
  recording?.file?.secureUrl ||
  recording?.file?.secure_url ||
  recording?.file?.path ||
  "";

const LessonRecordings = ({ recording }) => {
  const url = normalizePlayableUrl(pickRecordingUrl(recording));

  return (
    <div dir="rtl" className="rounded-2xl border border-[#E5E5E5] bg-white p-5">
      <h3 className="mb-4 text-xl font-semibold">تسجيل الحصة</h3>
      {!recording ? (
        <p className="py-6 text-center text-sm text-[#9CA3AF]">لم يرفع الأدمن تسجيل الحصة بعد</p>
      ) : (
        <div className="flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium">{recording.title}</p>
            <p className="mt-1 text-xs text-[#8C9198]">{recording.createdAt ? new Date(recording.createdAt).toLocaleDateString("ar-EG") : ""}</p>
          </div>
          <div className="flex gap-2">
            {url ? (
              <a href={url} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-lg bg-[#123C91] px-4 py-2 text-sm !text-white [&_svg]:text-white"><ExternalLink size={17} />فتح التسجيل</a>
            ) : (
              <button type="button" disabled className="flex items-center gap-2 rounded-lg bg-[#123C91] px-4 py-2 text-sm !text-white [&_svg]:text-white disabled:cursor-not-allowed disabled:opacity-50"><ExternalLink size={17} />فتح التسجيل</button>
            )}
            {url && <a href={url} download className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"><Download size={17} />تحميل</a>}
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonRecordings;
