import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import StudentLayout from "../../../components/student/layout/StudentLayout";
import StudentAssignmentStatsBar from "../../../components/student/assignments/StudentAssignmentStatsBar";
import StudentAssignmentsTable from "../../../components/student/assignments/StudentAssignmentsTable";
import AssignmentFilters from "../../../components/teacher/assignments/AssignmentFilters";
import Paginationn from "../../../components/teacher/groups/students/Paginationn";

import { getMyAssignments } from "../../../services/APIService";
import LoadingState from "../../../components/shared/LoadingState";

const PAGE_SIZE = 6;

const StudentAssignmentsPage = () => {
  const [searchParams] = useSearchParams();
  const highlightedAssignmentId = searchParams.get("assignment");

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filterGroup, setFilterGroup] = useState("جميع المجموعات");
  const [filterStatus, setFilterStatus] = useState("جميع الحالات");
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      setLoading(true);

      const res = await getMyAssignments();

      const data = res.data?.data || [];

      const mapped = data.map((a) => ({
        id: a.id,
        title: a.title,
        group: a.classroom?.name || "--",
        subject:
          typeof a.classroom?.subject === "string"
            ? a.classroom?.subject
            : a.classroom?.subject?.name?.ar ||
              a.classroom?.subject?.name?.en ||
              a.classroom?.subject?.name ||
              a.classroom?.subject ||
              "--",
        place:
          a.classroom?.meetingLink ||
          a.classroom?.location ||
          a.classroom?.address ||
          "--",
        lesson: a.session?.title || "--",

        dueDate: a.dueDate
          ? new Date(a.dueDate).toLocaleDateString("ar-EG")
          : "--",

        status: a.submission
          ? "تم التسليم"
          : a.status === "active"
          ? "نشط"
          : "لم يتم التسليم",

        grade:
          a.submission?.score != null
            ? `${a.submission.score}/${a.totalScore}`
            : a.submission
              ? "لم يتم التصحيح"
              : "لم يتم التسليم",

        totalScore: a.totalScore,

        submission: a.submission,

        attachments: a.attachments || [],

        timeRemaining: "",
      }));

      setAssignments(mapped);
    } catch (err) {
      console.error("Error loading assignments", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = assignments.filter(
    (a) =>
      a.title.includes(search) &&
      (filterGroup === "جميع المجموعات" ||
        a.group === filterGroup.replace("مجموعة ", "")) &&
      (filterStatus === "جميع الحالات" || a.status === filterStatus)
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const paginatedAssignments = filtered.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  const stats = {
    notSubmitted: assignments.filter((a) => a.status === "لم يتم التسليم")
      .length,

    submitted: assignments.filter((a) => a.status === "تم التسليم").length,

    active: assignments.filter((a) => a.status === "نشط").length,

    total: assignments.length,
  };

  return (
    <StudentLayout>
      <div
        className="w-full p-2 font-['IBM_Plex_Sans_Arabic'] text-right"
        dir="rtl"
      >
        <div className="mb-4">
          <h3 className="text-xl sm:text-[24px] font-semibold leading-8 text-[#123C91] mb-2 sm:mb-3">
            الواجبات
          </h3>

          <p className="text-sm sm:text-[16px] font-normal leading-6 text-[#575F69]">
            تابع جميع واجباتك وسلّم حلولك في الوقت المحدد.
          </p>
        </div>

        

        <div className="mb-6">
          <StudentAssignmentStatsBar {...stats} />
        </div>

        <div className="bg-white mt-6 border border-[#E5E5E5] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.12)] rounded-2xl p-5 w-full items-center">
          <AssignmentFilters
            search={search}
            onSearchChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            filterGroup={filterGroup}
            onFilterGroupChange={(v) => {
              setFilterGroup(v);
              setPage(1);
            }}
            filterStatus={filterStatus}
            onFilterStatusChange={(v) => {
              setFilterStatus(v);
              setPage(1);
            }}
          />
        </div>

        <Paginationn
          page={page}
          totalPages={totalPages}
          onChange={setPage}
          totalItems={filtered.length}
          displayedCount={paginatedAssignments.length}
          unitLabel="واجب"
        />

        <div className="mt-4">
          {loading ? (
            <LoadingState
              label="جاري تحميل الواجبات..."
              className="rounded-2xl border border-gray-200 bg-white"
            />
          ) : (
            <StudentAssignmentsTable
              assignments={paginatedAssignments}
              initialDetailsId={highlightedAssignmentId}
              onSubmitted={() => loadAssignments()}
            />
          )}
        </div>

      </div>
    </StudentLayout>
  );
};

export default StudentAssignmentsPage;
