import { useEffect, useState } from "react";
import ParentLayout from "../../components/parent/layout/ParentLayout";
import SubscriptionTable from "../../components/parent/subscription/SubscriptionTable";
import SubscriptionFilters from "../../components/parent/subscription/SubscriptionFilters";
import SubscriptionOrdersPanel from "../../components/subscription/SubscriptionOrdersPanel";

import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import {
  getMyStudentsSubscriptions,
  getMyStudents,
} from "../../services/APIService";
import {
  currencyCodeOf,
  formatEgpEquivalent,
  formatMoney,
} from "../../utils/currencyDisplay";

const STATUS_MAP = {
  active: "نشطة",
  expired: "منتهية",
  ended: "منتهية",
  completed: "منتهية",
  pending: "قيد المراجعة",
  cancelled: "ملغية",
};

const mapStatus = (status) => STATUS_MAP[status] || status;

// Same shape-handling used across the app: `grade` always arrives as an
// already-populated { id, name } object from getMyStudents(), so unlike
// `stage`/`curriculum` it never needs an extra lookup call to resolve.
function nameOf(obj) {
  if (!obj) return "";
  const n = obj.name;
  if (!n) return "";
  if (typeof n === "string") return n;
  return n.ar || n.en || "";
}
function resolveGradeName(gradeValue) {
  if (!gradeValue) return "";
  if (typeof gradeValue === "object") return nameOf(gradeValue) || "";
  // Defensive fallback in case a grade ever arrives as a bare id instead
  // of the usual populated object — nothing to resolve it against here,
  // so it just shows "—" via the card's fallback rather than a raw id.
  return "";
}

const mapSubscriptionToRows = (sub, gradeNameByStudentId) => {
  const groupId = sub.id;
  const studentId = sub.student?.id;
  const studentName = sub.student?.user?.fullName || "--";
  const studentGrade = gradeNameByStudentId[studentId] || "";
  const startDate = sub.createdAt
    ? new Date(sub.createdAt).toLocaleDateString("en-GB")
    : "--";
  const status = mapStatus(sub.status);

  if (!sub.items || sub.items.length === 0) {
    return [
      {
        id: groupId,
        groupId,
        groupSize: 1,
        name: studentName,
        stage: studentGrade,
        subjectName: "--",
        teacherName: "",
        totalHours: "--",
        consumed: "--",
        remaining: "--",
        duration: "شهر",
        startDate,
        endDate: "--",
        amount: "--",
        status,
        studentId,
      },
    ];
  }

  const groupSize = sub.items.length;

  return sub.items.map((item) => {
    const subjectName = item.subject?.name?.ar || "--";
    const packageName =
      item.package?.name?.ar ||
      item.package?.name?.en ||
      item.package?.name ||
      "—";
    const teacherName = item.teacher?.user?.fullName || "";
    const totalSessions = item.totalSessions ?? item.package?.sessions;
    const usedSessions = item.usedSessions ?? item.consumedSessions;
    const remainingSessions =
      item.remainingSessions ??
      (totalSessions != null && usedSessions != null
        ? Math.max(Number(totalSessions) - Number(usedSessions), 0)
        : null);
    const itemEndDate =
      item.endedAt || item.completedAt || sub.endedAt || sub.completedAt;

    return {
      id: item._id,
      groupId,
      groupSize,
      name: studentName,
      stage: studentGrade,
      subjectName,
      packageName,
      subjectId:
        typeof item.subject === "string"
          ? item.subject
          : item.subject?.id || item.subject?._id,
      teacherName,

      totalHours: totalSessions != null ? `${totalSessions} حصة` : "--",
      totalSessions: totalSessions != null ? Number(totalSessions) : null,
      consumed: usedSessions != null ? `${usedSessions} حصة` : "--",
      remaining: remainingSessions != null ? `${remainingSessions} حصة` : "--",
      remainingSessions:
        remainingSessions != null ? Number(remainingSessions) : null,
      duration: "حتى نفاد الحصص",
      startDate,

      endDate: itemEndDate
        ? new Date(itemEndDate).toLocaleDateString("en-GB")
        : "حتى نفاد الحصص",
      amount:
        item.finalPrice != null ? (
          <span className="whitespace-nowrap">
            <span className="block">
              {formatMoney(item.finalPrice, currencyCodeOf(sub))}
            </span>
            {formatEgpEquivalent(item.finalPrice, sub) && (
              <small className="block text-[#8C9198]">
                يعادل {formatEgpEquivalent(item.finalPrice, sub)}
              </small>
            )}
          </span>
        ) : (
          "--"
        ),
      status: mapStatus(item.status || sub.status),
      rawStatus: item.status || sub.status,
      studentId,
    };
  });
};

const SubscriptionPage = () => {
  const navigate = useNavigate();

  const [subscriptions, setSubscriptions] = useState([]);
  // id -> resolved Arabic grade name, built once from getMyStudents()
  // (the subscriptions endpoint only ever returns { user: { fullName, id } }
  // for `student`, never the academic fields, so grade has to come from
  // here instead). Unlike stage/curriculum, grade arrives pre-populated
  // with its name, so no extra lookup call is needed.
  const [gradeNameByStudentId, setGradeNameByStudentId] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [subsRes, studentsRes] = await Promise.all([
          getMyStudentsSubscriptions(),
          getMyStudents(),
        ]);

        setSubscriptions(subsRes.data?.data || []);

        const students = studentsRes.data?.data || [];

        const gradeMap = {};
        students.forEach((s) => {
          gradeMap[s.id] = resolveGradeName(s.grade);
        });
        setGradeNameByStudentId(gradeMap);
      } catch (err) {
        console.error("Failed to fetch subscriptions:", err);
        setError("حدث خطأ أثناء تحميل الاشتراكات، حاول مرة أخرى.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const allTableRows = subscriptions.flatMap((sub) =>
    mapSubscriptionToRows(sub, gradeNameByStudentId),
  );
  const activeStudentSubjects = new Set(
    allTableRows
      .filter((row) => row.rawStatus === "active")
      .map(
        (row) =>
          `${row.studentId || row.name}:${row.subjectId || row.subjectName}`,
      ),
  );
  const tableRows = allTableRows.filter(
    (row) =>
      !["ended", "expired", "completed"].includes(row.rawStatus) ||
      !activeStudentSubjects.has(
        `${row.studentId || row.name}:${row.subjectId || row.subjectName}`,
      ),
  );

  const studentOptions = [...new Set(tableRows.map((row) => row.name))];
  const statusOptions = [...new Set(tableRows.map((row) => row.status))];

  const filteredTableRows = tableRows.filter((row) => {
    const matchesSearch =
      searchTerm.trim() === "" ||
      row.name.toLowerCase().includes(searchTerm.trim().toLowerCase()) ||
      row.subjectName
        ?.toLowerCase()
        .includes(searchTerm.trim().toLowerCase()) ||
      row.teacherName?.toLowerCase().includes(searchTerm.trim().toLowerCase());

    const matchesStudent =
      selectedStudent === "all" || row.name === selectedStudent;
    const matchesStatus =
      selectedStatus === "all" || row.status === selectedStatus;

    return matchesSearch && matchesStudent && matchesStatus;
  });

  const groupedSubscriptions = Object.values(
    filteredTableRows.reduce((groups, row) => {
      const key = String(row.studentId || row.name);
      if (!groups[key]) {
        groups[key] = {
          id: key,
          name: row.name,
          stage: row.stage,
          rows: [],
        };
      }
      groups[key].rows.push(row);
      return groups;
    }, {}),
  );

  const renewSubject = (row) => {
    if (!row.groupId) return;
    navigate(`/parent/subscriptions/${row.groupId}/renew`, {
      state: {
        subjectId: row.subjectId,
      },
    });
  };
  const addSubject = (group) => {
    const sourceRow = group.rows.find(
      (row) => row.rawStatus === "active" && row.groupId,
    );
    if (!sourceRow?.groupId) return;
    navigate(`/parent/subscriptions/${sourceRow.groupId}/add-subject`);
  };

  return (
    <ParentLayout>
      <div
        dir="rtl"
        className="
          max-w-7xl
          mx-auto
          px-3
          sm:px-5
          lg:px-2
          py-3
          sm:py-5
          font-['IBM_Plex_Sans_Arabic']
        "
      >
        {/* Header */}
        <div
          className="
            flex
            flex-col
            sm:flex-row
            sm:items-center
            sm:justify-between
            gap-4
            mb-6
          "
        >
          <div>
            <h1
              className="
                text-[#123C91]
                font-semibold
                text-[22px]
                sm:text-[26px]
                leading-8
                mb-2
              "
            >
              الاشتراك والباقات
            </h1>

            <p
              className="
                text-[#575F69]
                text-[14px]
                sm:text-[16px]
                leading-6
              "
            >
              قم بمتابعة وتجديد باقات تعليم أبنائك في مكان واحد
            </p>
          </div>

          <button
            onClick={() => navigate("/parent-dashboard/add-child")}
            className="
              w-full
              sm:w-auto
              h-12
              px-6
              rounded-xl
              bg-[#123C91] text-white [&_svg]:text-white
              text-white
              flex
              items-center
              justify-center
              gap-2
              hover:bg-[#0E3178]
              transition-all
              shadow-sm
            "
          >
            <Plus size={18} />
            <span className="font-medium">إضافة ابن</span>
          </button>
        </div>

        {isLoading && (
          <div className="text-center py-10 text-[#575F69]">
            جاري تحميل الاشتراكات...
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div className="text-center py-10 text-[#D32F2F]">{error}</div>
        )}

        {!isLoading && !error && (
          <>
            {/* Filters */}
            <div
              className="
                bg-white
                border
                border-[#E5E5E5]
                rounded-2xl
                p-3
                sm:p-5
                shadow-sm
                mb-5
              "
            >
              <SubscriptionFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                selectedStudent={selectedStudent}
                onStudentChange={setSelectedStudent}
                studentOptions={studentOptions}
                selectedStatus={selectedStatus}
                onStatusChange={setSelectedStatus}
                statusOptions={statusOptions}
              />
            </div>

            {groupedSubscriptions.length === 0 ? (
              <div className="rounded-2xl border border-[#E5E5E5] bg-white py-12 text-center text-[#575F69]">
                لا توجد اشتراكات حالياً
              </div>
            ) : (
              <div className="space-y-6">
                {groupedSubscriptions.map((group) => (
                  <section
                    key={group.id}
                    className="rounded-3xl border border-[#DCE8F7] bg-[#F8FBFF] p-4 shadow-sm sm:p-6"
                  >
                    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#123C91] text-lg font-bold text-white">
                          {group.name?.trim()?.[0] || "ط"}
                        </div>
                        <div>
                          <h2 className="font-['Tajawal'] text-lg font-semibold text-[#1F2937]">
                            {group.name}
                          </h2>
                          <p className="mt-1 text-xs text-[#6B7280]">
                            {group.stage || "الصف غير محدد"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-[#123C91] shadow-sm">
                          {group.rows.length} مادة
                        </span>
                        {group.rows.some(
                          (row) => row.rawStatus === "active" && row.groupId,
                        ) && (
                          <button
                            type="button"
                            onClick={() => addSubject(group)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-[#123C91] px-4 py-2 text-sm font-semibold text-white"
                          >
                            <Plus size={16} />
                            إضافة مادة
                          </button>
                        )}
                      </div>
                    </div>

                    <SubscriptionTable
                      data={group.rows}
                      hideOwner
                      onRenew={renewSubject}
                    />
                  </section>
                ))}
              </div>
            )}
            <SubscriptionOrdersPanel />
          </>
        )}
      </div>
    </ParentLayout>
  );
};

export default SubscriptionPage;
