import StudentLayout from "../../components/student/layout/StudentLayout";
import MonthlySchedule from "../../components/schedule/MonthlySchedule";

const SchedulePage = () => (
  <StudentLayout>
    <MonthlySchedule role="student" title="جدول حصصك" subtitle="متابعة حصصك خلال الشهر الحالي والتنقل بين الشهور." />
  </StudentLayout>
);

export default SchedulePage;
