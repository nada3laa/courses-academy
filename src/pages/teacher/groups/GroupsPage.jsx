import { useState, useEffect, useCallback, useRef, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useLocation } from "react-router-dom";
import { MessageCircle, MoreVertical } from "lucide-react";

import GroupStatsBar from "../../../components/teacher/groups/GroupStatsBar";
import TeacherLayout from "../../../components/teacher/layout/TeacherLayout";
import Pagination from "../../../components/teacher/groups/Pagination";
import LoadingState from "../../../components/shared/LoadingState";
import { AddStudentModal } from "../../../components/admin/groups/Groupstable";
import {
  getMyClassrooms,
  getAllSubjects,
  getAllGrades,
  deleteClassroom,
} from "../../../services/APIService"; // عدّل المسار حسب مكان ملفك

// ⚠️ عدّل القيم دي لو الباك إند بيرجع أسماء status مختلفة
const STATUS_LABELS = {
  active: "نشطة",
  paused: "معلقة",
  pending: "قيد التسجيل",
  full: "مكتملة العدد",
  completed: "منتهية",
};

// اسم الحقل ممكن يكون نص عادي أو object {ar, en}
const resolveName = (val) => {
  if (!val) return "--";
  if (typeof val === "string") return val;
  return val.ar || val.en || "--";
};

const ActionsMenu = ({ group, onOpenDetails, onAddStudent, onShare, onOpenChat }) => {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  useLayoutEffect(() => {
    if (!open) return;
    const button = buttonRef.current;
    if (!button) return;
    const rect = button.getBoundingClientRect();
    const menuHeight = 44 * 4 + 16;
    let left = rect.right - 190;
    left = Math.max(8, Math.min(left, window.innerWidth - 190 - 8));
    let top = rect.bottom + 8;
    if (top + menuHeight > window.innerHeight - 8) {
      top = rect.top - menuHeight - 8;
    }
    setCoords({ top, left });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleOutside = (event) => {
      if (
        buttonRef.current && !buttonRef.current.contains(event.target) &&
        menuRef.current && !menuRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };
    const handleClose = () => setOpen(false);
    document.addEventListener("mousedown", handleOutside);
    window.addEventListener("resize", handleClose);
    window.addEventListener("scroll", handleClose, true);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      window.removeEventListener("resize", handleClose);
      window.removeEventListener("scroll", handleClose, true);
    };
  }, [open]);

  const handleSelect = (action) => {
    setOpen(false);
    switch (action) {
      case "details":
        onOpenDetails(group);
        break;
      case "add-student":
        onAddStudent(group);
        break;
      case "share":
        onShare(group);
        break;
      case "chat":
        onOpenChat(group);
        break;
      default:
        break;
    }
  };

  return (
    <>
      <button
        type="button"
        ref={buttonRef}
        onClick={() => setOpen((prev) => !prev)}
        className="w-9 h-9 rounded-lg border border-[#E5E5E5] bg-white text-[#475569] hover:bg-[#F8FAFF] transition flex items-center justify-center"
        aria-label="خيارات المجموعة"
      >
        <MoreVertical size={18} />
      </button>
      {open &&
        createPortal(
          <div
            ref={menuRef}
            dir="rtl"
            style={{ position: "fixed", top: coords.top, left: coords.left, width: 190 }}
            className="z-1000 rounded-2xl border border-[#E5E7EB] bg-white shadow-lg overflow-hidden"
          >
            {[
              { key: "details", label: "التفاصيل" },
              // { key: "add-student", label: "إضافة طالب" },
              { key: "share", label: "مشاركة" },
              { key: "chat", label: "شات" },
            ].map((item, index) => (
              <button
                key={item.key}
                type="button"
                onClick={() => handleSelect(item.key)}
                className={`w-full text-right px-4 py-3 text-sm text-[#24324A] transition hover:bg-[#F8FAFF] ${index > 0 ? "border-t border-[#F1F5F9]" : ""}`}
              >
                {item.label}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </>
  );
};

// ─── Page Component ──────────────────────────────────────────────────────────
const STATUS_CLASSES = {
  "نشطة": "bg-[#00A63E26] text-[#00A63E]",
  "معلقة": "bg-[#D32F2F26] text-[#D32F2F]",
  "قيد التسجيل": "bg-[#F59E0B26] text-[#F59E0B]",
};

const GroupsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [toast, setToast] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [selectedGroupForAddStudent, setSelectedGroupForAddStudent] = useState(null);
  const [shareToast, setShareToast] = useState("");

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [classroomsRes, subjectsRes, gradesRes] = await Promise.all([
        getMyClassrooms({ type: "group" }),
        getAllSubjects(),
        getAllGrades(),
      ]);

      const subjects = subjectsRes.data?.data || [];
      const grades = gradesRes.data?.data || [];
      const rawClassrooms = classroomsRes.data?.data || [];

      const subjectMap = Object.fromEntries(
        subjects.map((s) => [s.id, resolveName(s.name)]),
      );
      const gradeMap = Object.fromEntries(
        grades.map((g) => [g.id, resolveName(g.name)]),
      );

      // لو الحقل جه كـ object كامل (populated من الباك إند) نجيب اسمه مباشرة
      // لو جه كـ id string نبحث عنه في الـ map
      const resolveField = (field, map) => {
        if (!field) return "--";
        if (typeof field === "object") return resolveName(field.name) || "--";
        return map[field] || "--";
      };

      const resolveTeacher = (teacher) => {
        if (!teacher) return "—";
        if (typeof teacher === "string") return teacher;
        return (
          resolveName(teacher?.user?.fullName) ||
          resolveName(teacher?.user?.name) ||
          resolveName(teacher?.fullName) ||
          resolveName(teacher?.name) ||
          "—"
        );
      };

      const resolveTeacherId = (teacher) => {
        if (!teacher) return null;
        if (typeof teacher === "string") return teacher;
        return teacher?.id || teacher?._id || teacher?.user?.id || teacher?.user?._id || null;
      };

      const mapped = rawClassrooms.map((c) => {
        const enrolled = c.students?.length || 0;
        const capacity = c.capacity || 0;
        const nextLessonText = c.nextSession?.date
          ? `الحصة القادمة: ${new Date(c.nextSession.date).toLocaleDateString("ar-EG")}`
          : c.status === "paused"
            ? "هذه المجموعة غير نشطة حالياً"
            : c.status === "pending"
              ? "التسجيل مفتوح"
              : "لا توجد حصص قادمة حالياً";
        const teacherName = resolveTeacher(c.teacher);
        const teacherId = resolveTeacherId(c.teacher) || c.teacherId || null;
        const subjectId =
          typeof c.subject === "string"
            ? c.subject
            : c.subject?.id || c.subject?._id || null;
        const classroomType = ["private", "group"].includes(c.type)
          ? c.type
          : "group";

        return {
          id: c.id,
          name: resolveName(c.name),
          grade: resolveField(c.grade, gradeMap),
          subject: resolveField(c.subject, subjectMap),
          status: STATUS_LABELS[c.status] || c.status,
          enrolled,
          max: capacity,
          nextLesson: nextLessonText,
          teacher: teacherName,
          teacherId,
          subjectId,
          classroomType,
        };
      });

      setGroups(mapped);
    } catch (err) {
      console.error(err);
      setError("حدث خطأ أثناء تحميل المجموعات");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  useEffect(() => {
    if (location.state?.showSuccessToast) {
      setToast(true);
      setTimeout(() => setToast(false), 3000);
      window.history.replaceState({}, document.title);
      // بعد إنشاء مجموعة جديدة بنجاح، نعيد تحميل القائمة عشان تظهر فورًا
      fetchGroups();
    }
  }, [location, fetchGroups]);

  const filteredGroups = groups.filter((group) => {
    const search = searchTerm.trim().toLowerCase();
    const matchesStatus = statusFilter === "all" || group.status === statusFilter;
    const matchesSearch =
      !search ||
      group.name.toLowerCase().includes(search) ||
      group.subject.toLowerCase().includes(search) ||
      group.grade.toLowerCase().includes(search);
    return matchesStatus && matchesSearch;
  });

  const paginatedGroups = filteredGroups.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  const handleDelete = async (id) => {
    try {
      await deleteClassroom(id);
      setGroups((prev) => prev.filter((g) => g.id !== id));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "تعذر حذف المجموعة");
    }
  };

  const openAddStudentModal = (group) => {
    setSelectedGroupForAddStudent(group);
    setShowAddStudentModal(true);
  };

  const closeAddStudentModal = () => {
    setShowAddStudentModal(false);
    setSelectedGroupForAddStudent(null);
  };

  const handleShare = async (group) => {
    const url = `${window.location.origin}/teacher/groups/${group.id}/lessons`;
    try {
      if (navigator.share) {
        await navigator.share({ title: group.name, url });
      } else {
        await navigator.clipboard.writeText(url);
      }
      setShareToast("تم نسخ رابط المشاركة بنجاح");
    } catch (err) {
      console.error(err);
      setShareToast("حدث خطأ أثناء مشاركة المجموعة");
    } finally {
      setTimeout(() => setShareToast(""), 3000);
    }
  };

  return (
    <TeacherLayout>
      <div
        className="w-full p-2 font-['IBM_Plex_Sans_Arabic'] text-right"
        dir="rtl"
      >
        {toast && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-4 sm:px-6 py-3 rounded-xl shadow-lg text-xs sm:text-sm font-semibold text-center w-[90%] sm:w-auto">
            ✓ تم إنشاء مجموعتك بنجاح !
          </div>
        )}
        {shareToast && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#123C91] text-white px-4 sm:px-6 py-3 rounded-xl shadow-lg text-xs sm:text-sm font-semibold text-center w-[90%] sm:w-auto">
            {shareToast}
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-xl sm:text-[24px] font-semibold leading-8 text-[#123C91] mb-2 sm:mb-3">
              مجموعاتك التعليمية
            </h1>
            <p className="text-sm sm:text-[16px] font-normal leading-6 text-[#575F69]">
              استعرض جميع مجموعاتك الدراسية، ونظّم الحصص والمهام.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6">
          <GroupStatsBar
            total={groups.length}
            active={groups.filter((g) => g.status === "نشطة").length}
          />
        </div>

        {/* Filters */}
        <div className="mb-4 grid gap-3 md:grid-cols-[260px_180px_1fr] items-center">
          <div className="rounded-2xl border border-[#E5E5E5] bg-white px-4 py-3">
            <label className="text-sm text-[#6B7280]">حالة المجموعات</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="mt-2 w-full rounded-xl border border-[#E5E5E5] bg-white px-4 py-2 text-sm text-[#1F2937] outline-none focus:border-[#123C91]"
            >
              <option value="all">جميع الحالات</option>
              <option value="نشطة">نشطة</option>
              <option value="معلقة">معلقة</option>
              <option value="قيد التسجيل">قيد التسجيل</option>
              <option value="مكتملة العدد">مكتملة العدد</option>
              <option value="منتهية">منتهية</option>
            </select>
          </div>

          <div className="rounded-2xl border border-[#E5E5E5] bg-white px-4 py-3">
            <label className="text-sm text-[#6B7280]">عرض في الصفحة</label>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="mt-2 w-full rounded-xl border border-[#E5E5E5] bg-white px-4 py-2 text-sm text-[#1F2937] outline-none focus:border-[#123C91]"
            >
              <option value={6}>6</option>
              <option value={8}>8</option>
              <option value={12}>12</option>
            </select>
          </div>

          <div className="rounded-2xl border border-[#E5E5E5] bg-white px-4 py-3">
            <label className="text-sm text-[#6B7280]">بحث</label>
            <input
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              placeholder="ابحث باسم المجموعة أو المادة أو الصف"
              className="mt-2 w-full rounded-xl border border-[#E5E5E5] bg-white px-4 py-2 text-sm text-[#1F2937] outline-none focus:border-[#123C91]"
            />
          </div>
        </div>

        {loading ? (
          <LoadingState
            label="جاري تحميل المجموعات..."
            className="rounded-2xl border border-gray-200 bg-white"
          />
        ) : error ? (
          <div className="text-center py-10 text-red-500">{error}</div>
        ) : groups.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border border-gray-200 bg-white px-4 py-10 text-center text-[#575F69]">
            <p>في انتظار إنشاء مجموعة من الإدارة.</p>
            <button
              type="button"
              onClick={() =>
                navigate("/teacher/messages", {
                  state: { openSupportConversation: true },
                })
              }
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-[#123C91] px-5 py-3 text-sm font-semibold text-white hover:bg-[#0f327a]"
            >
              <MessageCircle size={18} />
              تواصل مع الإدارة
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-[#E5E5E5] bg-white shadow-sm">
            <table style={{ minWidth: 900 }} className="w-full text-right table-fixed border-collapse">
              <thead className="bg-[#F8FAFF] text-[#1F2937]">
                <tr>
                  <th className="px-4 py-4 text-sm font-semibold">اسم المجموعة</th>
                  <th className="px-4 py-4 text-sm font-semibold">المادة</th>
                  <th className="px-4 py-4 text-sm font-semibold">الصف</th>
                  <th className="px-4 py-4 text-sm font-semibold">الطلاب</th>
                  <th className="px-4 py-4 text-sm font-semibold">الحالة</th>
                  <th className="px-4 py-4 text-sm font-semibold">أحدث حصة</th>
                  <th className="px-4 py-4 text-sm font-semibold">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {paginatedGroups.map((g) => (
                  <tr key={g.id} className="border-t border-[#E5E7EB] hover:bg-[#F8FAFF]">
                    <td className="px-4 py-4 text-sm text-[#123C91] font-medium">
                      <button
                        type="button"
                        onClick={() =>
                          navigate(`/teacher/groups/${g.id}/lessons`, {
                            state: {
                              groupName: g.name,
                              groupTeacher: g.teacher,
                              groupTeacherId: g.teacherId,
                              groupSubjectId: g.subjectId,
                              classroomType: g.classroomType,
                            },
                          })
                        }
                        className="text-left text-sm font-medium text-[#123C91] hover:underline"
                      >
                        {g.name}
                      </button>
                    </td>
                    <td className="px-4 py-4 text-sm text-[#575F69]">{g.subject}</td>
                    <td className="px-4 py-4 text-sm text-[#575F69]">{g.grade}</td>
                    <td className="px-4 py-4 text-sm text-[#575F69]">{g.enrolled} / {g.max}</td>
                    <td className="px-4 py-4 text-sm">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${STATUS_CLASSES[g.status] ?? "bg-gray-100 text-gray-600"}`}>
                        {g.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-[#575F69]">{g.nextLesson}</td>
                    <td className="px-4 py-4 text-sm text-right">
                      <ActionsMenu
                        group={g}
                        onOpenDetails={(group) =>
                          navigate(`/teacher/groups/${group.id}/lessons`, {
                            state: {
                              groupName: group.name,
                              groupTeacher: group.teacher,
                              groupTeacherId: group.teacherId,
                              groupSubjectId: group.subjectId,
                              classroomType: group.classroomType,
                            },
                          })
                        }
                        onAddStudent={openAddStudentModal}
                        onShare={handleShare}
                        onOpenChat={(group) =>
                          navigate(
                            `/teacher/messages?classroom=${encodeURIComponent(group.id)}&name=${encodeURIComponent(group.name)}`,
                            {
                              state: {
                                openClassroomId: group.id,
                                openClassroomName: group.name,
                              },
                            }
                          )
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && filteredGroups.length > 0 && (
          <div className="mt-4">
            <Pagination
              page={page}
              totalItems={filteredGroups.length}
              itemsPerPage={pageSize}
              onChange={setPage}
            />
          </div>
        )}

        <AddStudentModal
          open={showAddStudentModal}
          onClose={closeAddStudentModal}
          group={selectedGroupForAddStudent}
          onChanged={fetchGroups}
        />
      </div>
    </TeacherLayout>
  );
};

export default GroupsPage;
