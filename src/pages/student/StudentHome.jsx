import React, { useContext, useEffect, useState } from "react";
import WelcomeHeader from "../../components/student/dashboard/WelcomeHeader";
import StatsOverview from "../../components/student/dashboard/StatsOverview";
import SubscriptionsCard from "../../components/student/dashboard/SubscriptionsCard";
import GroupsCard from "../../components/student/dashboard/GroupsCard";
import ScheduleSection from "../../components/student/dashboard/ScheduleSection";
import StudentLayout from "../../components/student/layout/StudentLayout";
import {
  getMyClassrooms,
  getClassroomSessions,
} from "../../services/APIService";
import { AuthContext } from "../../context/AuthContext"; // عدّل المسار لو مختلف عندك

const StudentHome = () => {
  const { user } = useContext(AuthContext);
  const firstName = user?.fullName?.trim()?.split(" ")[0] || "";

  const [stats, setStats] = useState({
    upcomingLessons: 0,
    activeGroups: 0,
    activeAssignments: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadStats = async () => {
      setLoading(true);
      try {
        const classroomsRes = await getMyClassrooms();
        const classrooms = classroomsRes.data?.data || [];

        if (cancelled) return;

        const sessionsResults = await Promise.allSettled(
          classrooms.map((c) => getClassroomSessions(c.id)),
        );

        let upcomingCount = 0;
        sessionsResults.forEach((result, idx) => {
          if (result.status !== "fulfilled") {
            console.error(
              `getClassroomSessions failed for classroom ${classrooms[idx]?.id}:`,
              result.reason,
            );
            return;
          }
          const sessions = result.value.data?.data || [];
          sessions.forEach((s) => {
            if (s.status === "scheduled" || s.status === "upcoming") {
              upcomingCount += 1;
            }
          });
        });

        if (cancelled) return;

        setStats((prev) => ({
          ...prev,
          activeGroups: classrooms.length,
          upcomingLessons: upcomingCount,
        }));
      } catch (err) {
        console.error("Failed to load dashboard stats:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadStats();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <StudentLayout>
      <div
        className="space-y-4 sm:space-y-6 p-2 sm:p-4 max-w-7xl mx-auto"
        dir="rtl"
      >
        <WelcomeHeader studentName={firstName} />

        <StatsOverview
          upcomingLessons={loading ? "--" : stats.upcomingLessons}
          activeGroups={loading ? "--" : stats.activeGroups}
          activeAssignments={stats.activeAssignments ?? "--"}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5 sm:mb-6">
          <div className="lg:col-span-2">
            <GroupsCard showViewAll />
          </div>
          <div className="lg:col-span-1">
            <SubscriptionsCard />
          </div>
        </div>

        <ScheduleSection />
      </div>
    </StudentLayout>
  );
};

export default StudentHome;
