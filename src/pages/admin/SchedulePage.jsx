import AdminLayout from "../../components/admin/layout/AdminLayout";
import MonthlySchedule from "../../components/schedule/MonthlySchedule";
import Breadcrumbs from "../shared/Breadcrumbs";

const SchedulePage = () => (
  <AdminLayout>
    <Breadcrumbs homeTo="/admin-dashboard" />
    <MonthlySchedule role="admin" title="جدول الحصص" subtitle="متابعة جميع حصص الفصول النشطة خلال الشهر." />
  </AdminLayout>
);

export default SchedulePage;
