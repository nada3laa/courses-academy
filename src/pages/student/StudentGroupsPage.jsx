import React from "react";
import GroupsCard from "../../components/student/dashboard/GroupsCard";
import StudentLayout from "../../components/student/layout/StudentLayout";

const StudentGroupsPage = () => {
  return (
    <StudentLayout>
      <div
        className="space-y-4 sm:space-y-6 p-2 sm:p-4 max-w-7xl mx-auto"
        dir="rtl"
      >
        <div>
          <h1
            className="text-[#1F2937] font-semibold text-[22px] sm:text-[26px]"
            style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
          >
            مجموعاتي
          </h1>
          <p
            className="text-[#6B7280] text-[13px] sm:text-[14px] mt-1"
            style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
          >
            كل المواد والمجموعات المشترك بها داخل المنصة.
          </p>
        </div>

        <GroupsCard
          title="مجموعات الطالب"
          subtitle="اختر مجموعة لعرض الحصص والملفات والواجبات الخاصة بها"
          className="min-h-[420px]"
        />
      </div>
    </StudentLayout>
  );
};

export default StudentGroupsPage;
