import { useState } from "react";
import { getAssetUrl } from "../../../services/APIService";

// ─── Badge Helper ─────────────────────────────────────────────────────────────
const Badge = ({ label, type }) => {
  const map = {
    blue: "bg-[#EAF4FF] text-[#123C91]",
    red: "bg-[#FFE9E9] text-[#D32F2F]",
  };
  return (
    <span
      className={`inline-flex items-center justify-center px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs font-semibold rounded-full whitespace-nowrap ${map[type] ?? ""}`}
      style={{ fontFamily: "IBM Plex Sans Arabic, sans-serif" }}
    >
      {label}
    </span>
  );
};

const submissionBadge = (submitted) =>
  submitted ? <Badge label="تم التسليم" type="blue" /> : <Badge label="لم يسلّم" type="red" />;

// ─── Submission Count ─────────────────────────────────────────────────────────
const SubmissionCount = ({ value }) => {
  if (!value) return null;
  const [done, total] = value.split("/");
  return (
    <span style={{ fontFamily: "IBM Plex Sans Arabic, sans-serif", fontSize: "14px" }} className="sm:text-[16px]">
      <span style={{ color: "#123C91", fontWeight: 700 }}>{done}</span>
      <span style={{ color: "#8C9198", fontWeight: 400 }}>/{total}</span>
    </span>
  );
};

// ─── Correction Modal ─────────────────────────────────────────────────────────
const CorrectionModal = ({ student, type, onClose, onSubmit }) => {
  const [grade, setGrade] = useState(student.score ?? "");
  const [feedback, setFeedback] = useState(student.feedback ?? "");
  const submissionFiles = student.files || [];

  const handleSubmit = () => {
    onSubmit?.({ student, grade, feedback, type });
    onClose();
  };

  const stopPropagation = (e) => e.stopPropagation();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
      onClick={onClose}
    >
      <div
        dir="rtl"
        className="bg-white rounded-2xl w-full overflow-hidden max-h-[90vh] overflow-y-auto"
        style={{ maxWidth: "480px" }}
        onClick={stopPropagation}
      >
        {/* Header — title/icon on the right, close (X) on the left */}
        <div className="flex items-center justify-between px-4 sm:px-6 pt-5 sm:pt-6 pb-2">
          <div className="flex items-center gap-2 min-w-0">
            <h2
              className="truncate"
              style={{
                fontFamily: "Tajawal, sans-serif",
                fontWeight: 700,
                fontSize: "18px",
                color: "#1A1A1A",
              }}
            >
              تصحيح الواجب
            </h2>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#123C91"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0 sm:w-5.5 sm:h-5.5"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 shrink-0"
            aria-label="إغلاق"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Student name */}
        <p
          className="text-right px-4 sm:px-6 pb-4 sm:pb-5"
          style={{
            fontFamily: "Tajawal, sans-serif",
            fontSize: "15px",
            color: "#8C9198",
          }}
        >
          {student.name}
        </p>

        <div className="px-4 sm:px-6 pb-6 space-y-4 sm:space-y-5">
          {/* Submitted files */}
          <div className="space-y-2">
            {submissionFiles.map((file) => {
              const fileUrl = getAssetUrl(file.url);
              return (
                <div key={file.id} className="border border-gray-200 rounded-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-4 py-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-[#EAF4FF] flex items-center justify-center shrink-0">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#123C91" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                    </div>
                    <div className="text-right min-w-0">
                      <p
                        className="mb-1 truncate text-sm font-semibold text-[#1A1A1A]"
                        style={{ direction: "ltr", textAlign: "right" }}
                        title={file.name}
                      >
                        {file.name}
                      </p>
                      {file.size && <p className="text-xs text-[#8C9198]">{file.size}</p>}
                    </div>
                  </div>

                  <a
                    href={fileUrl || undefined}
                    target="_blank"
                    rel="noreferrer"
                    aria-disabled={!fileUrl}
                    onClick={(e) => {
                      if (!fileUrl) e.preventDefault();
                    }}
                    className={`border border-gray-200 rounded-xl px-5 py-2 text-sm font-medium transition-colors shrink-0 w-full sm:w-auto text-center ${
                      fileUrl
                        ? "text-[#575F69] hover:bg-gray-50"
                        : "text-[#9CA3AF] cursor-not-allowed"
                    }`}
                  >
                    عرض
                  </a>
                </div>
              );
            })}
          </div>

          {/* Grade input */}
          <div>
            <label
              className="block text-right mb-2"
              style={{
                fontFamily: "Tajawal, sans-serif",
                fontSize: "14px",
                fontWeight: 500,
                color: "#575F69",
              }}
            >
              الدرجة (من {student.totalScore ?? 20})
            </label>
            <input
              type="number"
              min="0"
              max={student.totalScore ?? 20}
              placeholder={`0 - ${student.totalScore ?? 20}`}
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-right text-[#575F69] bg-gray-50 outline-none focus:border-[#123C91] focus:bg-white transition-colors"
              style={{
                fontFamily: "IBM Plex Sans Arabic, sans-serif",
                fontSize: "14px",
              }}
            />
          </div>

          <div>
            <label
              className="block text-right mb-2"
              style={{
                fontFamily: "Tajawal, sans-serif",
                fontSize: "14px",
                fontWeight: 500,
                color: "#575F69",
              }}
            >
              ملاحظات للطالب
            </label>
            <textarea
              rows={4}
              placeholder="اكتب ملاحظاتك على الحل"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-right text-[#575F69] bg-gray-50 outline-none focus:border-[#123C91] focus:bg-white transition-colors resize-none"
              style={{
                fontFamily: "IBM Plex Sans Arabic, sans-serif",
                fontSize: "14px",
              }}
            />
          </div>

          {/* Info banner */}
          <div className="flex items-start sm:items-center gap-2 rounded-xl px-4 py-3" style={{ backgroundColor: "#EAF4FF" }}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#123C91"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0 mt-0.5 sm:mt-0"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <p
              className="text-right"
              style={{
                fontFamily: "Tajawal, sans-serif",
                fontSize: "13px",
                color: "#123C91",
                lineHeight: "1.5",
              }}
            >
              افتح ملف إجابة الطالب وراجع الحل بعناية قبل إدخال التقييم.
            </p>
          </div>
        </div>

        {/* Footer buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 px-4 sm:px-6 pb-6">
          <button
            onClick={handleSubmit}
            className="order-1 sm:order-1 bg-[#123C91] text-white [&_svg]:text-white rounded-xl py-3.5 font-semibold hover:bg-[#0e2f73] transition-colors"
            style={{ fontFamily: "Tajawal, sans-serif", fontSize: "15px" }}
          >
            حفظ و إرسال
          </button>
          <button
            onClick={onClose}
            className="order-2 sm:order-2 border border-gray-200 rounded-xl py-3.5 text-[#575F69] font-medium hover:bg-gray-50 transition-colors"
            style={{ fontFamily: "Tajawal, sans-serif", fontSize: "15px" }}
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Single Row ───────────────────────────────────────────────────────────────
const StudentRow = ({ student, onCorrect, onEdit }) => {
  const showCorrect = student.submitted && student.correctionStatus !== "تم التصحيح";
  const showEdit = student.submitted && student.correctionStatus === "تم التصحيح";

  return (
    <div
      dir="rtl"
      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm px-4 sm:px-5 py-3.5"
    >
      {/* Student identity */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-7 h-7 rounded-full bg-[#EAF4FF] text-[#123C91] text-xs font-semibold flex items-center justify-center shrink-0">
          {student.initial}
        </div>
        <h2
          className="truncate"
          style={{
            fontFamily: "Tajawal, sans-serif",
            fontWeight: 500,
            fontSize: "15px",
            color: "#575F69",
          }}
        >
          {student.name}
        </h2>
      </div>

      {/* Actions area — wraps gracefully on narrow screens */}
      <div className="flex items-center gap-2 sm:gap-3  flex-wrap sm:flex-nowrap sm:shrink-0">
        {student.submittedCount && <SubmissionCount value={student.submittedCount} />}
        {submissionBadge(student.submitted)}

        {showCorrect && (
          <button
            onClick={() => onCorrect(student)}
            className="bg-[#123C91] text-white [&_svg]:text-white text-xs font-semibold px-3.5 sm:px-4 py-1.5 rounded-lg hover:bg-[#0e2f73] transition-colors whitespace-nowrap"
            style={{ fontFamily: "Tajawal, sans-serif" }}
          >
            تصحيح
          </button>
        )}
        {showEdit && (
          <button
            onClick={() => onEdit?.(student)}
            className="text-[#123C91] text-sm font-semibold px-2 py-1 rounded-lg hover:bg-[#EAF4FF] transition-colors whitespace-nowrap"
            style={{ fontFamily: "Tajawal, sans-serif" }}
          >
            تعديل
          </button>
        )}
      </div>
    </div>
  );
};

// ─── StudentSubmissionsTable ──────────────────────────────────────────────────
/**
 * Props:
 *  students: Array<{
 *    id, name, initial,
 *    submitted: boolean,
 *    submittedCount?: string,      // e.g. "18/20"
 *    correctionStatus?: string,    // "تم التصحيح" -> shows "تعديل", otherwise "تصحيح"
 *    fileName?: string,
 *    fileSize?: string,
 *  }>
 *  onAction: ({ student, type, grade? }) => void
 */
const StudentSubmissionsTable = ({ students = [], onAction }) => {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [modalType, setModalType] = useState("تصحيح");

  const handleCorrect = (student) => {
    setModalType("تصحيح");
    setSelectedStudent(student);
  };

  const handleEdit = (student) => {
    setModalType("تعديل");
    setSelectedStudent(student);
  };

  const handleModalSubmit = ({ student, grade, feedback, type }) => {
    onAction?.({ student, grade, feedback, type });
  };

  if (students.length === 0) {
    return (
      <div
        dir="rtl"
        className="w-full bg-white rounded-2xl border border-gray-200 shadow-sm py-12 px-4 text-center text-sm text-[#575F69]"
      >
        لا يوجد طلاب مطابقون للبحث
      </div>
    );
  }

  return (
    <>
      <div className="w-full space-y-2">
        {students.map((student) => (
          <StudentRow
            key={student.id}
            student={student}
            onCorrect={handleCorrect}
            onEdit={handleEdit}
          />
        ))}
      </div>

      {selectedStudent && (
        <CorrectionModal
          student={selectedStudent}
          type={modalType}
          onClose={() => setSelectedStudent(null)}
          onSubmit={handleModalSubmit}
        />
      )}
    </>
  );
};

export default StudentSubmissionsTable;
