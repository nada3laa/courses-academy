import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Plus } from "lucide-react";

import StudentLayout from "../../components/student/layout/StudentLayout";
import SubscriptionFilters from "../../components/parent/subscription/SubscriptionFilters";
import SubscriptionTable from "../../components/parent/subscription/SubscriptionTable";
import SubscriptionOrdersPanel from "../../components/subscription/SubscriptionOrdersPanel";
import { AuthContext } from "../../context/AuthContext";
import { getMyProfile, getMySubscriptions } from "../../services/APIService";
import {
  currencyCodeOf,
  formatEgpEquivalent,
  formatMoney,
} from "../../utils/currencyDisplay";

const STATUS_LABELS = {
  active: "نشطة",
  expired: "منتهية",
  ended: "منتهية",
  completed: "منتهية",
  pending: "قيد المراجعة",
  cancelled: "ملغية",
};

const localizedName = (value) => {
  if (!value) return "—";
  if (typeof value === "string") return value;
  return value.ar || value.en || value.name?.ar || value.name?.en || "—";
};

const formatDate = (value) => {
  if (!value) return "--";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "--" : date.toLocaleDateString("en-GB");
};

const numberOrNull = (value) => {
  const number = Number(value);
  return value != null && Number.isFinite(number) ? number : null;
};

const extractSubscriptions = (response) => {
  const body = response?.data?.data ?? response?.data ?? [];
  if (Array.isArray(body)) return body;
  if (Array.isArray(body.subscriptions)) return body.subscriptions;
  return body && (body.id || body._id) ? [body] : [];
};

const subscriptionRows = (subscription, studentName) => {
  const subscriptionId = subscription.id || subscription._id;
  const items = subscription.items || subscription.subjectSubscriptions || [];
  const groupSize = Math.max(items.length, 1);
  const startDate = formatDate(
    subscription.startDate || subscription.createdAt,
  );
  const endDate = formatDate(subscription.endDate || subscription.expiresAt);

  const mapItem = (item, index) => {
    const subjectId =
      typeof item.subject === "string"
        ? item.subject
        : item.subject?.id || item.subject?._id;
    const subjectName = localizedName(item.subject?.name || item.subject);
    const total = numberOrNull(item.totalSessions ?? item.package?.sessions);
    const explicitUsed = numberOrNull(
      item.usedSessions ?? item.consumedSessions,
    );
    const explicitRemaining = numberOrNull(item.remainingSessions);
    const used =
      explicitUsed ??
      (total != null && explicitRemaining != null
        ? Math.max(total - explicitRemaining, 0)
        : null);
    const remaining =
      explicitRemaining ??
      (total != null && used != null ? Math.max(total - used, 0) : null);
    const status = item.status || subscription.status;

    return {
      id: item.id || item._id || `${subscriptionId}-${index}`,
      groupId: subscriptionId,
      groupSize,
      name: studentName,
      stage: "",
      subjectId,
      subjectName,
      teacherName: item.teacher?.user?.fullName || item.teacher?.fullName || "",
      packageName: localizedName(item.package?.name || item.package),
      totalHours: total != null ? `${total} حصة` : "--",
      consumed: used != null ? `${used} حصة` : "--",
      remaining: remaining != null ? `${remaining} حصة` : "--",
      duration: item.package?.duration || subscription.duration || "شهر",
      startDate,
      endDate,
      amount:
        item.finalPrice != null ? (
          <span className="whitespace-nowrap">
            <span className="block">
              {formatMoney(item.finalPrice, currencyCodeOf(subscription))}
            </span>
            {formatEgpEquivalent(item.finalPrice, subscription) && (
              <small className="block text-[#8C9198]">
                يعادل {formatEgpEquivalent(item.finalPrice, subscription)}
              </small>
            )}
          </span>
        ) : (
          "--"
        ),
      status: STATUS_LABELS[status] || status || "—",
      rawStatus: status,
      totalSessions: total,
      remainingSessions: remaining,
    };
  };

  return items.length
    ? items.map(mapItem)
    : [
        mapItem(
          {
            subject: null,
            package: null,
            status: subscription.status,
          },
          0,
        ),
      ];
};

const StudentSubscriptionPage = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [openingAddSubject, setOpeningAddSubject] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const loadSubscriptions = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getMySubscriptions();
        if (!cancelled) setSubscriptions(extractSubscriptions(response));
      } catch (requestError) {
        if (!cancelled) {
          setError(
            requestError.response?.data?.message ||
              "تعذر تحميل بيانات الاشتراك",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadSubscriptions();
    return () => {
      cancelled = true;
    };
  }, []);

  const rows = useMemo(() => {
    const allRows = subscriptions.flatMap((subscription) =>
      subscriptionRows(
        subscription,
        subscription.student?.user?.fullName ||
          subscription.student?.fullName ||
          user?.fullName ||
          "الطالب",
      ),
    );
    const activeSubjects = new Set(
      allRows
        .filter((row) => row.rawStatus === "active")
        .map((row) => String(row.subjectId || row.subjectName)),
    );

    return allRows.filter(
      (row) =>
        !["ended", "expired", "completed"].includes(row.rawStatus) ||
        !activeSubjects.has(String(row.subjectId || row.subjectName)),
    );
  }, [subscriptions, user?.fullName]);

  const statusOptions = [...new Set(rows.map((row) => row.status))];
  const matchingRows = rows.filter((row) => {
    const query = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !query ||
      row.subjectName.toLowerCase().includes(query) ||
      row.packageName.toLowerCase().includes(query) ||
      row.teacherName.toLowerCase().includes(query);
    const matchesStatus =
      selectedStatus === "all" || row.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });
  const visibleGroupSizes = matchingRows.reduce((counts, row) => {
    counts[row.groupId] = (counts[row.groupId] || 0) + 1;
    return counts;
  }, {});
  const filteredRows = matchingRows.map((row) => ({
    ...row,
    groupSize: visibleGroupSizes[row.groupId],
  }));

  const renewSubject = (row) => {
    if (!row.groupId) return;
    navigate(`/student/subscriptions/${row.groupId}/renew`, {
      state: {
        subjectId: row.subjectId,
      },
    });
  };
  const activeSourceSubscription = rows.find(
    (row) => row.rawStatus === "active" && row.groupId,
  );
  const addSubject = async () => {
    if (activeSourceSubscription?.groupId) {
      navigate(
        `/student/subscriptions/${activeSourceSubscription.groupId}/add-subject`,
      );
      return;
    }

    setOpeningAddSubject(true);
    try {
      const response = await getMyProfile();
      const profile = response.data?.data ?? response.data;
      const studentId = profile?.id || profile?._id;
      if (!studentId) throw new Error("STUDENT_PROFILE_ID_MISSING");
      navigate("/register/packages", {
        state: {
          studentId,
          skipProfileCreation: true,
          selectedSubjects: [],
        },
      });
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "تعذر فتح المواد المتاحة للاشتراك",
      );
      setOpeningAddSubject(false);
    }
  };

  return (
    <StudentLayout>
      <main
        className="mx-auto w-full max-w-7xl px-3 py-3 font-['IBM_Plex_Sans_Arabic'] sm:px-5 sm:py-5 lg:px-2"
        dir="rtl"
      >
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-[22px] font-semibold text-[#123C91] sm:text-[26px]">
              الاشتراك والباقات
            </h1>
            <p className="mt-2 text-sm text-[#575F69] sm:text-base">
              تابع وجدّد باقتك لكل مادة بشكل مستقل من حسابك مباشرة.
            </p>
          </div>
          {!loading && !error && (
            <button
              type="button"
              onClick={addSubject}
              disabled={openingAddSubject}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#123C91] px-5 text-sm font-semibold !text-white disabled:opacity-60"
            >
              {openingAddSubject ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <Plus size={17} />
              )}
              {openingAddSubject ? "جارٍ فتح المواد..." : "إضافة مادة"}
            </button>
          )}
        </header>

        {loading && (
          <div className="flex items-center justify-center gap-2 py-16 text-[#575F69]">
            <Loader2 className="animate-spin" size={22} />
            جاري تحميل الاشتراكات...
          </div>
        )}

        {!loading && error && (
          <div className="py-12 text-center text-red-600">{error}</div>
        )}

        {!loading && !error && (
          <>
            <div className="mb-5 rounded-2xl border border-[#E5E5E5] bg-white p-3 shadow-sm sm:p-5">
              <SubscriptionFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                selectedStudent="all"
                onStudentChange={() => {}}
                studentOptions={[]}
                selectedStatus={selectedStatus}
                onStatusChange={setSelectedStatus}
                statusOptions={statusOptions}
                hideStudentFilter
                searchPlaceholder="ابحث عن مادة أو باقة..."
              />
            </div>

            <SubscriptionTable
              data={filteredRows}
              hideOwner
              onRenew={renewSubject}
            />
            <SubscriptionOrdersPanel />
          </>
        )}
      </main>
    </StudentLayout>
  );
};

export default StudentSubscriptionPage;
