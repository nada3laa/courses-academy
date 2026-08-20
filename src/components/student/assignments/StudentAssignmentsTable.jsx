import { useState, useEffect } from "react";
import {
  Upload,
  X,
  Loader2,
  FileText,
  Paperclip,
} from "lucide-react";
// عدّل هذا المسار حسب مكان ملف الـ api عندك
import {
  getAssignment,
  getAssetUrl,
  getMySubmission,
  submitAssignment,
} from "../../../services/APIService";
import { getAssignmentAttachmentUrl } from "../../../utils/assignmentAttachment";

// ─── Badge Helper ─────────────────────────────────────────────────────────────
const Badge = ({ label, type, subLabel }) => {
  const map = {
    green: "bg-[#00A63E26] text-[#00A63E]",
    blue: "bg-[#EAF4FF] text-[#123C91]",
    red: "bg-[#FB2C3626] text-[#FB2C36]",
    gray: "bg-gray-100 text-[#8C9198]",
  };
  return (
    <div className="inline-flex flex-col items-start gap-1">
      <span
        className={`inline-flex items-center justify-center px-3 py-1 text-[11px] md:text-xs font-semibold rounded-full whitespace-nowrap ${
          map[type] ?? map.gray
        }`}
      >
        {label}
      </span>
      {subLabel && (
        <span className="text-[11px] text-[#8C9198] whitespace-nowrap">{subLabel}</span>
      )}
    </div>
  );
};

// Student-facing assignment status: نشط / تم التسليم / لم يتم التسليم
const statusBadge = (status, timeRemaining) => {
  if (status === "نشط") {
    return <Badge label={status} type="blue" subLabel={timeRemaining ? `الوقت المتبقي ${timeRemaining}` : null} />;
  }
  if (status === "تم التسليم") {
    return <Badge label={status} type="green" />;
  }
  if (status === "لم يتم التسليم") {
    return <Badge label={status} type="red" />;
  }
  return <Badge label={status} type="gray" />;
};

const SubmissionAction = ({ assignment, onSubmit }) =>
  assignment.status === "تم التسليم" ? (
    <Badge label="تم التسليم" type="green" />
  ) : (
    <button
      type="button"
      onClick={() => onSubmit(assignment.id)}
      className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#123C91] px-3 py-2 text-sm font-medium !text-white [&_svg]:!text-white hover:bg-[#0e2f70] transition-colors whitespace-nowrap"
    >
      <Upload size={16} />
      تسليم الواجب
    </button>
  );

// ─── Mobile Row Field ─────────────────────────────────────────────────────────
const MobileField = ({ label, children }) => (
  <div className="flex items-center justify-between gap-3 py-2.5 border-b border-gray-50 last:border-b-0">
    <span className="text-xs font-medium text-[#8C9198] shrink-0">{label}</span>
    <span className="text-sm text-[#575F69] font-medium text-left">{children}</span>
  </div>
);

// ─── Assignment Details Modal ("عرض التفاصيل") ─────────────────────────────
const AssignmentDetailsModal = ({ assignmentId, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [assignment, setAssignment] = useState(null);
  const [submission, setSubmission] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    Promise.all([
      getAssignment(assignmentId),
      getMySubmission(assignmentId).catch(() => null), // ممكن يرجع 404 لو لسه مقدمش
    ])
      .then(([assignmentRes, submissionRes]) => {
        if (!active) return;
        setAssignment(assignmentRes?.data?.data ?? null);
        setSubmission(submissionRes?.data?.data ?? null);
      })
      .catch(() => {
        if (active) setError("تعذر تحميل تفاصيل الواجب، حاول مرة أخرى");
      })
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [assignmentId]);

  return (
    <div
      className="fixed inset-0 z-9999 flex items-center justify-center bg-black/40 p-4"
      dir="rtl"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <h3 className="font-semibold text-[#1A1A1A] text-base">تفاصيل الواجب</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-[#575F69]">
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-4">
          {loading && (
            <div className="flex items-center justify-center py-10 text-[#575F69]">
              <Loader2 className="animate-spin" size={22} />
            </div>
          )}

          {!loading && error && <p className="text-sm text-[#FB2C36] text-center py-6">{error}</p>}

          {!loading && !error && assignment && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-[#1A1A1A] text-[15px] mb-1">{assignment.title}</h4>
                {assignment.description && (
                  <p className="text-sm text-[#575F69] leading-6 whitespace-pre-wrap">
                    {assignment.description}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-[#8C9198] block mb-0.5">موعد التسليم</span>
                  <span className="text-[#575F69] font-medium">{assignment.dueDate ?? "--"}</span>
                </div>
                <div>
                  <span className="text-[#8C9198] block mb-0.5">الدرجة</span>
                  <span className="text-[#575F69] font-medium">{submission?.score ?? "--"}</span>
                </div>
              </div>

              {assignment.attachments?.length > 0 && (
                <div>
                  <span className="text-[#8C9198] text-sm block mb-1.5">مرفقات الواجب</span>
                  <div className="space-y-1.5">
                    {assignment.attachments.map((att, i) => (
                      <a
                        key={i}
                        href={getAssetUrl(att.url ?? att)}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 text-sm text-[#123C91] hover:underline"
                      >
                        <FileText size={15} />
                        {att.name ?? `مرفق ${i + 1}`}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t border-gray-100 pt-3">
                <span className="text-[#8C9198] text-sm block mb-1.5">حالة التسليم</span>
                {submission ? (
                  <div className="space-y-2">
                    <Badge label="تم التسليم" type="green" />
                    {submission.feedback && (
                      <p className="text-sm text-[#575F69]">ملاحظات المعلم: {submission.feedback}</p>
                    )}
                  </div>
                ) : (
                  <Badge label="لم يتم التسليم" type="red" />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Submit Assignment Modal ("تسليم الحل") — متصل فعليًا بالـ API ─────────
const SubmitAssignmentModal = ({ assignmentId, onClose, onSubmitted }) => {
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files || []));
    setError("");
  };

  const handleSubmit = async () => {
    if (files.length === 0) {
      setError("من فضلك أرفق ملف الحل قبل التسليم");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("attachments", file));
      await submitAssignment(assignmentId, formData);
      onSubmitted?.(assignmentId);
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || "حدث خطأ أثناء تسليم الواجب، حاول مرة أخرى");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-9999 flex items-center justify-center bg-black/40 p-4"
      dir="rtl"
      onClick={() => !submitting && onClose()}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-[#1A1A1A] text-base">تسليم الحل</h3>
          <button
            onClick={() => !submitting && onClose()}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-[#575F69]"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-3">
          <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl py-8 cursor-pointer hover:border-[#123C91] transition-colors">
            <Upload size={22} className="text-[#8C9198]" />
            <span className="text-sm text-[#575F69]">اضغط لاختيار ملف الحل</span>
            <input type="file" multiple className="hidden" onChange={handleFileChange} />
          </label>

          {files.length > 0 && (
            <ul className="space-y-1.5">
              {files.map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-[#575F69]">
                  <Paperclip size={14} />
                  {f.name}
                </li>
              ))}
            </ul>
          )}

          {error && <p className="text-sm text-[#FB2C36]">{error}</p>}
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 text-sm rounded-lg text-[#575F69] hover:bg-gray-50 disabled:opacity-50"
          >
            إلغاء
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-4 py-2 text-sm rounded-lg bg-[#123C91] text-white [&_svg]:text-white hover:bg-[#0e2f70] disabled:opacity-60 flex items-center gap-2"
          >
            {submitting && <Loader2 className="animate-spin" size={15} />}
            تسليم
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Table ────────────────────────────────────────────────────────────
const StudentAssignmentsTable = ({
  assignments = [],
  onView,
  onSubmitted,
  initialDetailsId = null,
}) => {
  const [localAssignments, setLocalAssignments] = useState(assignments);
  const [detailsId, setDetailsId] = useState(initialDetailsId);
  const [submitId, setSubmitId] = useState(null);

  useEffect(() => {
    setLocalAssignments(assignments);
  }, [assignments]);

  // لو مررت onView من برة (مثلاً عشان تعمل navigate لصفحة تفاصيل)، هيتستخدم بدل المودال الداخلي
  const handleView = (assignmentId) => {
    if (onView) {
      onView(assignmentId);
    } else {
      setDetailsId(assignmentId);
    }
  };

  const handleOpenSubmit = (assignmentId) => setSubmitId(assignmentId);

  const handleOpenAssignment = (assignment) => {
    const attachmentUrl = getAssignmentAttachmentUrl(assignment);
    if (attachmentUrl) {
      window.open(attachmentUrl, "_blank", "noopener,noreferrer");
      return;
    }
    handleView(assignment.id);
  };

  const handleSubmitted = (assignmentId) => {
    setLocalAssignments((prev) =>
      prev.map((a) =>
        a.id === assignmentId
          ? { ...a, status: "تم التسليم", grade: "لم يتم التصحيح" }
          : a,
      )
    );
    onSubmitted?.(assignmentId); // فرصة للأب يعمل refetch للداتا الحقيقية (الدرجة إلخ)
  };

  if (localAssignments.length === 0) {
    return (
      <div
        dir="rtl"
        className="w-full bg-white rounded-2xl border border-gray-200 shadow-sm py-12 text-center text-sm sm:text-base text-[#575F69]"
      >
        لا توجد واجبات متاحة
      </div>
    );
  }

  return (
    <div dir="rtl" className="w-full">
      <div className="hidden md:block bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-230 text-right">
            <thead>
              <tr
                style={{
                  backgroundColor: "#F9FAFA",
                  fontFamily: "IBM Plex Sans Arabic, sans-serif",
                }}
              >
                {[
                  "عنوان الواجب",
                  "المجموعة",
                  "المادة",
                  "الحصة",
                  "موعد التسليم",
                  "الحالة",
                  "الدرجة",
                  "تسليم الواجب",
                ].map((header) => (
                  <th
                    key={header}
                    className="px-4 lg:px-6 py-3 lg:py-4 text-[#575F69] text-[13px] lg:text-[14px] font-medium text-right uppercase tracking-wider whitespace-nowrap"
                    style={{ fontWeight: 500, lineHeight: "16px" }}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {localAssignments.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50/80 transition-colors">
                  <td
                    className="px-4 lg:px-6 py-3 lg:py-4 text-[#575F69]"
                    style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 500, fontSize: "16px", lineHeight: "20px" }}
                  >
                    <button
                      type="button"
                      onClick={() => handleOpenAssignment(a)}
                      className="text-right text-[#123C91] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#123C91]"
                    >
                      {a.title}
                    </button>
                  </td>

                  {[a.group, a.subject, a.lesson, a.dueDate].map((cellData, index) => (
                    <td
                      key={index}
                      className="px-4 lg:px-6 py-3 lg:py-4 text-[#575F69] whitespace-nowrap"
                      style={{
                        fontFamily: "IBM Plex Sans Arabic, sans-serif",
                        fontWeight: 400,
                        fontSize: "14px",
                        lineHeight: "24px",
                      }}
                    >
                      {cellData}
                    </td>
                  ))}

                  <td className="px-4 lg:px-6 py-3 lg:py-4">{statusBadge(a.status, a.timeRemaining)}</td>

                  <td
                    className="px-4 lg:px-6 py-3 lg:py-4 text-[#575F69] whitespace-nowrap"
                    style={{ fontFamily: "IBM Plex Sans Arabic, sans-serif", fontSize: "14px", lineHeight: "24px" }}
                  >
                    {a.grade ?? "لم يتم التسليم"}
                  </td>

                  <td className="px-4 lg:px-6 py-3 lg:py-4">
                    <SubmissionAction assignment={a} onSubmit={handleOpenSubmit} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="md:hidden space-y-3">
        {localAssignments.map((a) => (
          <div key={a.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <button
                type="button"
                onClick={() => handleOpenAssignment(a)}
                className="min-w-0 text-right text-[#123C91] font-semibold text-[16px] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#123C91]"
                style={{ fontFamily: "Tajawal, sans-serif" }}
              >
                {a.title}
              </button>
              <SubmissionAction assignment={a} onSubmit={handleOpenSubmit} />
            </div>

            <div className="flex items-center gap-2 mb-3">{statusBadge(a.status, a.timeRemaining)}</div>

            <div className="space-y-0.5">
              <MobileField label="المجموعة">{a.group}</MobileField>
              {/* <MobileField label="المادة">{a.subject || "--"}</MobileField>
              <MobileField label="المكان">{a.place || "--"}</MobileField> */}
              <MobileField label="الحصة">{a.lesson}</MobileField>
              <MobileField label="موعد التسليم">{a.dueDate}</MobileField>
              <MobileField label="الدرجة">{a.grade ?? "لم يتم التسليم"}</MobileField>
            </div>
          </div>
        ))}
      </div>

      {detailsId && (
        <AssignmentDetailsModal assignmentId={detailsId} onClose={() => setDetailsId(null)} />
      )}

      {submitId && (
        <SubmitAssignmentModal
          assignmentId={submitId}
          onClose={() => setSubmitId(null)}
          onSubmitted={handleSubmitted}
        />
      )}
    </div>
  );
};

export default StudentAssignmentsTable;
