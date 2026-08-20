import { useState, useEffect } from "react";
import ParentLayout from "../../components/parent/layout/ParentLayout";
import WelcomeSection from "../../components/parent/dashboard/WelcomeSection";
import StatsCards from "../../components/parent/dashboard/StatsCards";
import ChildrenOverviewSection from "../../components/parent/dashboard/ChildrenOverviewSection";
import NotificationsSection from "../../components/parent/dashboard/NotificationsSection";
import {
  getMyStudents,
  getStudentsStatistics,
} from "../../services/APIService";

const Home = () => {
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [studentsRes, statsRes] = await Promise.all([
          getMyStudents(),
          getStudentsStatistics(),
        ]);
        setStudents(studentsRes.data?.data || []);
        setStats(statsRes.data?.data || null);
      } catch (err) {
        console.error("فشل تحميل بيانات لوحة التحكم:", err.response?.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <ParentLayout>
        <div
          className="flex items-center justify-center min-h-[60vh]"
          dir="rtl"
        >
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-[#123C91] border-t-transparent rounded-full animate-spin" />
            <p className="text-[#6B7280] text-sm font-['IBM_Plex_Sans_Arabic']">
              جاري التحميل...
            </p>
          </div>
        </div>
      </ParentLayout>
    );
  }

  return (
    <ParentLayout>
      <div
        className="space-y-4 sm:space-y-6 p-2 sm:p-4 max-w-7xl mx-auto"
        dir="rtl"
      >
        {/* Welcome */}
        <WelcomeSection hasChildren={students.length > 0} />

        {/* Stats */}
        <StatsCards stats={stats} hasChildren={students.length > 0} />

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 sm:gap-6">
          <div className="xl:col-span-2">
            <NotificationsSection />
          </div>
          <div className="xl:col-span-3">
            <ChildrenOverviewSection children={students} />
          </div>
        </div>
      </div>
    </ParentLayout>
  );
};

export default Home;
