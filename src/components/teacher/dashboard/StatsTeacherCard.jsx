import { useEffect, useState } from "react";
import { Star, DollarSign, Clock3, Users } from "lucide-react";
import {
  getMyClassrooms,
  getClassroomStudents,
  getClassroomSessions,
} from "../../../services/APIService";

// ⚠️ ملحوظة مهمة: مفيش endpoints حاليًا لـ:
//   - إجمالي الأرباح
//   - متوسط التقييم

const getSessionDurationMinutes = (session) => {
  const duration = Number(session.duration);
  if (Number.isFinite(duration) && duration > 0) return duration;

  const start = new Date(session.startAt || session.scheduledDate);
  const end = new Date(session.endAt);
  if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
    const minutes = (end.getTime() - start.getTime()) / 60000;
    return minutes > 0 ? minutes : 0;
  }

  return 0;
};

const formatHours = (minutes) => {
  const hours = minutes / 60;
  return new Intl.NumberFormat("ar-EG", {
    maximumFractionDigits: 1,
  }).format(hours);
};

const StatsTeacherCard = () => {
  const [totalStudents, setTotalStudents] = useState(null);
  const [totalMinutes, setTotalMinutes] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadStudentsCount = async () => {
      setLoading(true);
      try {
        // GET /classrooms/my -> كل مجموعات المعلّم
        const classroomsRes = await getMyClassrooms();
        const classrooms = classroomsRes.data?.data || [];

        if (cancelled) return;

        // بنجيب طلاب كل مجموعة بالتوازي ونجمعهم (طالب ممكن يتكرر في أكتر من مجموعة،
        // لو محتاجين عدد فريد بس، لازم نجمع الـ ids في Set بدل ما نجمع الطول مباشرة)
        const [studentsResults, sessionsResults] = await Promise.all([
          Promise.allSettled(
          classrooms.map((c) => getClassroomStudents(c.id)),
          ),
          Promise.allSettled(
            classrooms.map((c) => getClassroomSessions(c.id)),
          ),
        ]);

        const uniqueStudentIds = new Set();
        studentsResults.forEach((result, idx) => {
          if (result.status === "fulfilled") {
            const students = result.value.data?.data || [];
            students.forEach((s) => {
              if (s.id) uniqueStudentIds.add(s.id);
            });
          } else {
            console.error(
              `getClassroomStudents failed for classroom ${classrooms[idx]?.id}:`,
              result.reason,
            );
          }
        });

        const countedSessionIds = new Set();
        let completedMinutes = 0;
        sessionsResults.forEach((result, idx) => {
          if (result.status === "fulfilled") {
            const sessions = result.value.data?.data || [];
            sessions.forEach((session) => {
              const sessionId = session.id ?? session._id;
              if (
                session.status !== "completed" ||
                (sessionId && countedSessionIds.has(sessionId))
              ) return;

              if (sessionId) countedSessionIds.add(sessionId);
              completedMinutes += getSessionDurationMinutes(session);
            });
          } else {
            console.error(
              `getClassroomSessions failed for classroom ${classrooms[idx]?.id}:`,
              result.reason,
            );
          }
        });

        if (cancelled) return;
        setTotalStudents(uniqueStudentIds.size);
        setTotalMinutes(completedMinutes);
      } catch (err) {
        console.error("Failed to load teacher stats:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadStudentsCount();
    return () => {
      cancelled = true;
    };
  }, []);

  const cards = [
    {
      title: "إجمالي عدد الطلاب",
      value: loading ? "--" : totalStudents,
      icon: Users,
      iconBg: "bg-teal-50",
      iconColor: "text-teal-600",
    },
    {
      title: "عدد الساعات",
      value: loading || totalMinutes === null ? "--" : formatHours(totalMinutes),
      icon: Clock3,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      title: "إجمالي الأرباح",
      // ⚠️ TODO: مفيش endpoint حاليًا للأرباح
      value: "--",
      icon: DollarSign,
      iconBg: "bg-teal-50",
      iconColor: "text-teal-600",
    },
    {
      title: "متوسط التقييم",
      // ⚠️ TODO: مفيش endpoint حاليًا للتقييمات
      value: "--",
      icon: Star,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;

        return (
          <div
            key={index}
            className="bg-white border border-gray-100 rounded-xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all"
          >
            <div className={`p-3 rounded-lg ${card.iconBg}`}>
              <Icon size={24} className={card.iconColor} />
            </div>

            <div className="text-right">
              <h3 className="text-xl font-bold text-gray-800">{card.value}</h3>
              <p className="text-gray-500 text-sm mt-1">{card.title}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsTeacherCard;
