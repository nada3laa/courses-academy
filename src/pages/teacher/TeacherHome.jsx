import NotificationsSection from "../../components/teacher/dashboard/NotificationsSection";
import StatsTeacherCard from "../../components/teacher/dashboard/StatsTeacherCard";
import UpcomingLessonsSection from "../../components/teacher/dashboard/UpcomingLessonsSection";
import Welcome from "../../components/teacher/dashboard/WelcomeSection";
import TeacherLayout from "../../components/teacher/layout/TeacherLayout";


const TeacherHome = () => {
  return (
    <TeacherLayout>
      <div className="space-y-6 p-1" dir="rtl">
        <Welcome />
        <StatsTeacherCard />


        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          <div className="lg:col-span-2 flex">
            <UpcomingLessonsSection />
          </div>
          <div className="lg:col-span-1 flex">
            <NotificationsSection />
          </div>
        </div>
      </div>

    </TeacherLayout >
  );
};

export default TeacherHome;