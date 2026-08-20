import AdminLayout from "../../../components/admin/layout/AdminLayout";
import TeacherCourseFormPage from "./TeacherCourseFormPage";

const AdminCourseFormPage = () => (
  <AdminLayout>
    <div dir="rtl" className="min-h-full p-3 sm:p-5">
      <TeacherCourseFormPage useTeacherLayout={false} />
    </div>
  </AdminLayout>
);

export default AdminCourseFormPage;
