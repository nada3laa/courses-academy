import ParentLayout from "../../components/parent/layout/ParentLayout";
import StatsCards from "../../components/parent/schedule/StatsCards";
import MonthlySchedule from "../../components/schedule/MonthlySchedule";

const LessonsSchedule = () => (
  <ParentLayout>
    <div className="mx-auto max-w-7xl p-2 text-right font-['IBM_Plex_Sans_Arabic']" dir="rtl">
      <h1 className="mb-2 text-2xl font-semibold text-[#123C91]">جدول حصص ابنائك</h1>
      <p className="mb-6 text-[#575F69]">
        متابعة حصص ابنائك القادمة وسجل حصصهم السابقة.
      </p>

      <StatsCards />

      <MonthlySchedule
        hideHeader
        role="parent"
        title="جدول دروس الأبناء"
        subtitle="متابعة حصص أبنائك خلال الشهر الحالي والتنقل بين الشهور."
      />
    </div>
  </ParentLayout>
);

export default LessonsSchedule;