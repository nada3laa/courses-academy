import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import {
  getTeachers,
  updateClassroomSubstituteTeacher,
} from "../../../services/APIService";

const teacherId = (teacher) =>
  teacher?.teacherId ||
  teacher?.id ||
  teacher?._id ||
  teacher?.user?.id ||
  teacher?.user?._id;

const teacherName = (teacher) =>
  teacher?.user?.fullName ||
  teacher?.fullName ||
  teacher?.name?.ar ||
  teacher?.name?.en ||
  teacher?.name ||
  "معلم";

const teachersFromResponse = (response) => {
  const data = response?.data?.data ?? response?.data ?? [];
  if (Array.isArray(data)) return data;
  return data.teachers || data.results || data.items || [];
};

const isAvailableTeacher = (teacher) => {
  const user = teacher.user || {};
  const isDeleted = teacher.isDeleted ?? user.isDeleted ?? false;
  const isActive = teacher.isActive ?? user.isActive;
  const status = teacher.registrationStatus ?? user.registrationStatus;

  return (
    isDeleted !== true &&
    isActive !== false &&
    status !== "pending" &&
    status !== "rejected"
  );
};

const SubstituteTeacherModal = ({
  groupId,
  primaryTeacherId,
  primaryTeacherName,
  currentTeacherId,
  currentTeacherName,
  onClose,
  onChanged,
}) => {
  const [teachers, setTeachers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState(
    currentTeacherId || "",
  );
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    getTeachers({ limit: 1000 })
      .then((response) => {
        if (!active) return;
        setTeachers(
          teachersFromResponse(response)
            .filter(isAvailableTeacher)
            .filter((teacher) => teacherId(teacher)),
        );
      })
      .catch((requestError) => {
        if (!active) return;
        setError(
          requestError.response?.data?.message ||
            "تعذر تحميل قائمة المعلمين",
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const filteredTeachers = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("ar");
    return teachers.filter((teacher) => {
      if (
        primaryTeacherId &&
        String(teacherId(teacher)) === String(primaryTeacherId)
      ) {
        return false;
      }
      return (
        !query ||
        teacherName(teacher).toLocaleLowerCase("ar").includes(query)
      );
    });
  }, [primaryTeacherId, search, teachers]);

  const saveTeacher = async () => {
    if (!selectedTeacher) {
      setError("اختر المعلم البديل أولاً");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await updateClassroomSubstituteTeacher(groupId, selectedTeacher);
      await onChanged?.();
      onClose();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "تعذر حفظ المعلم البديل",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const removeTeacher = async () => {
    setSubmitting(true);
    setError("");
    try {
      await updateClassroomSubstituteTeacher(groupId, null);
      await onChanged?.();
      onClose();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "تعذر إزالة المعلم البديل",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !submitting) onClose();
      }}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        dir="rtl"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#1F2937]">
            اختيار معلم بديل
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="إغلاق"
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-600 disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {primaryTeacherName && (
          <p className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            المعلم الأساسي: <strong>{primaryTeacherName}</strong>
          </p>
        )}
        {currentTeacherName && (
          <p className="mb-3 text-sm text-gray-600">
            المعلم البديل الحالي: <strong>{currentTeacherName}</strong>
          </p>
        )}

        <label
          htmlFor="teacher-search"
          className="mb-2 block text-sm font-medium text-[#1F2937]"
        >
          ابحث باسم المعلم
        </label>
        <div className="relative mb-3">
          <Search
            size={18}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            id="teacher-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="اكتب اسم المعلم..."
            className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 pr-10 pl-3 text-sm outline-none focus:border-[#123C91]"
            autoFocus
          />
        </div>

        <div className="max-h-64 overflow-y-auto rounded-xl border border-gray-200">
          {loading ? (
            <p className="p-6 text-center text-sm text-gray-500">
              جاري تحميل المعلمين...
            </p>
          ) : filteredTeachers.length ? (
            filteredTeachers.map((teacher) => {
              const id = teacherId(teacher);
              const selected = String(selectedTeacher) === String(id);
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSelectedTeacher(id)}
                  className={`flex w-full items-center gap-3 border-b border-gray-100 px-4 py-3 text-right text-sm last:border-0 ${
                    selected
                      ? "bg-[#EAF4FF] font-semibold text-[#123C91]"
                      : "text-[#1F2937] hover:bg-gray-50"
                  }`}
                >
                  <span
                    className={`h-4 w-4 shrink-0 rounded-full border-2 ${
                      selected
                        ? "border-[#123C91] bg-[#123C91] ring-2 ring-blue-100"
                        : "border-gray-300"
                    }`}
                  />
                  {teacherName(teacher)}
                </button>
              );
            })
          ) : (
            <p className="p-6 text-center text-sm text-gray-500">
              لا يوجد معلمون مطابقون للبحث
            </p>
          )}
        </div>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={saveTeacher}
            disabled={loading || submitting || !selectedTeacher}
            className="flex-1 rounded-xl bg-[#123C91] py-3 text-sm font-medium text-white disabled:opacity-50"
          >
            {submitting ? "جاري الحفظ..." : "حفظ المعلم البديل"}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-medium text-[#123C91] disabled:opacity-50"
          >
            إلغاء
          </button>
        </div>

        {currentTeacherId && (
          <button
            type="button"
            onClick={removeTeacher}
            disabled={submitting}
            className="mt-3 w-full rounded-xl border border-red-200 py-3 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            إزالة المعلم البديل
          </button>
        )}
      </div>
    </div>
  );
};

export default SubstituteTeacherModal;
