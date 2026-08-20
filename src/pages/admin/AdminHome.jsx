import AcademicStructureSection from "../../components/admin/curriculum/AcademicStructureSection";
import NotificationsSection from "../../components/admin/dashboard/NotificationsSection";
import UpcomingLessonsSection from "../../components/admin/dashboard/UpcomingLessonsSection";
import Welcome from "../../components/admin/dashboard/Welcome";
import AdminLayout from "../../components/admin/layout/AdminLayout";



const AdminHome = () => {
  return (
    <AdminLayout>
      <div className="space-y-6 p-1" dir="rtl">
        <Welcome />
        {/* <StatsTeacherCard /> */}


        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
          <div className="lg:col-span-2 flex">
            <UpcomingLessonsSection />
          </div>
          <div className="lg:col-span-1 flex">
            <NotificationsSection />
          </div>
        </div>

        <AcademicStructureSection />
      </div>

    </AdminLayout >
  );
};

export default AdminHome;
