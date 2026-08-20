import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Clock } from "lucide-react";
import TeacherLayout from "../../layout/TeacherLayout";
import AdminLayout from "../../../admin/layout/AdminLayout";

import {
  createOrUpdateClassroomSchedule,
  getClassroom,
  getClassroomSchedule,
} from "../../../../services/APIService";

const DAYS = [
  { key: "saturday", label: "السبت" },
  { key: "sunday", label: "الأحد" },
  { key: "monday", label: "الاثنين" },
  { key: "tuesday", label: "الثلاثاء" },
  { key: "wednesday", label: "الأربعاء" },
  { key: "thursday", label: "الخميس" },
  { key: "friday", label: "الجمعة" },
];

const CreateSchedulePage = ({ role = "teacher" }) => {
  const Layout = role === "admin" ? AdminLayout : TeacherLayout;
  const navigate = useNavigate();
  const { groupId } = useParams();

  const [groupName, setGroupName] = useState("مجموعة");
  const [selectedDays, setSelectedDays] = useState([]);
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getClassroomSchedule(groupId)
      .then((response) => {
        if (!active) return;
        const schedule = response.data?.data?.schedule;
        if (Array.isArray(schedule) && schedule.length) {
          setEditing(true);
          setSelectedDays(schedule.map((item) => item.day));
          setTime(schedule[0].startTime || "");
        }
      })
      .catch((err) => {
        if (err.response?.status !== 404 && active) {
          setError(err.response?.data?.message || "تعذر تحميل الجدول الحالي");
        }
      })
      .finally(() => active && setInitialLoading(false));

    return () => {
      active = false;
    };
  }, [groupId]);

  useEffect(() => {
    let active = true;
    getClassroom(groupId)
      .then((response) => {
        if (!active) return;
        const name = response.data?.data?.name;
        const resolvedName =
          typeof name === "string" ? name : name?.ar || name?.en || "مجموعة";
        setGroupName(resolvedName);
      })
      .catch(() => {
        if (active) setGroupName("مجموعة");
      });
    return () => {
      active = false;
    };
  }, [groupId]);

  const toggleDay = (key) => {
    setSelectedDays((prev) =>
      prev.includes(key) ? prev.filter((d) => d !== key) : [...prev, key],
    );
  };

  const handleSubmit = async () => {
    if (selectedDays.length === 0) {
      setError("من فضلك اختر يوم دراسة واحد على الأقل");
      return;
    }
    if (!time) {
      setError("من فضلك اختر وقت الحصص");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      // ✅ تم التأكيد من الـ Postman collection: شكل الـ body الصحيح هو
      // { schedule: [ { day, startTime }, ... ] }
      const schedule = selectedDays.map((day) => ({ day, startTime: time }));

      await createOrUpdateClassroomSchedule(groupId, { schedule });
      navigate(
        role === "admin"
          ? `/admin/groups/${groupId}/lessons`
          : `/teacher/groups/${groupId}/lessons`,
        {
          state: {
            showSuccessToast: true,
            successMessage: editing
              ? "تم تعديل جدول الحصص بنجاح"
              : "تم إنشاء جدول الحصص بنجاح",
            groupName,
          },
        },
      );
    } catch (err) {
      console.error(
        "createOrUpdateClassroomSchedule failed:",
        err.response?.data || err,
      );
      setError(err.response?.data?.message || "حدث خطأ أثناء إنشاء الجدول");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <h2 className="font-[IBM_Plex_Sans_Arabic] text-xl sm:text-2xl font-bold text-[#123C91]">
        {editing ? "تعديل الجدول" : "إنشاء جدول"}
      </h2>

      {initialLoading ? (
        <p className="py-16 text-center text-[#575F69]">جاري تحميل الجدول...</p>
      ) : (
        <div
          className="mx-auto p-4 sm:p-6 bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm mt-6 sm:mt-8"
          dir="rtl"
        >
          <div className="space-y-5 sm:space-y-6">
            {/* أيام الدراسة */}
            <div>
              <p className="text-sm font-semibold text-[#1A1A1A] mb-3">
                أيام الدراسة
              </p>
              <div className="space-y-3">
                {DAYS.map((day) => (
                  <label
                    key={day.key}
                    className="flex items-center gap-3 cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      checked={selectedDays.includes(day.key)}
                      onChange={() => toggleDay(day.key)}
                      className="w-4 h-4 rounded border-[#8C9198] text-[#123C91] focus:ring-[#123C91] accent-[#123C91]"
                    />
                    <span className="text-sm text-[#1A1A1A]">{day.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* الوقت */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                الوقت
              </label>
              <div className="relative">
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full h-12 border border-[#E5E5E5] rounded-[8px] px-4 py-3 text-sm text-[#1A1A1A] focus:border-[#123C91] focus:ring-1 focus:ring-[#123C91] outline-none transition-all bg-[#F9FAFA] appearance-none placeholder:text-[#8C9198] pl-10 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:left-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                />
                <Clock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8C9198] pointer-events-none"
                  size={16}
                />
              </div>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          {/* أزرار التحكم */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-6 mt-6 border-t border-gray-100">
            <button
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto sm:px-16 lg:px-40 h-12 sm:h-12.5 text-[#575F69] bg-white border border-[#E5E5E5] font-semibold rounded-lg order-2 sm:order-1"
            >
              إلغاء
            </button>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full sm:flex-1 h-12 sm:h-12.5 bg-[#123C91] text-white [&_svg]:text-white rounded-lg font-bold text-sm sm:text-[16px] flex items-center justify-center gap-2 shadow-sm order-1 sm:order-2 disabled:opacity-60"
            >
              {loading
                ? "جاري الحفظ..."
                : editing
                  ? "حفظ تعديلات الجدول"
                  : "إنشاء جدول الحصص"}
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default CreateSchedulePage;
