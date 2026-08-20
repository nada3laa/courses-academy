import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { getMySubscriptions } from "../../../services/APIService"; // عدّل المسار حسب مكانه عندك

const resolveName = (val) =>
  typeof val === "string" ? val : val?.ar || val?.en || "";

const numberOrZero = (value) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
};

const buildSubjectsFromSubscriptions = (subscriptions = []) =>
  subscriptions.flatMap((subscription) => {
    const items = subscription.items ?? subscription.subjectSubscriptions ?? [];

    return items.map((item, index) => {
      const total = numberOrZero(
        item.totalSessions ?? item.package?.sessions,
      );
      const hasRemaining = item.remainingSessions != null;
      const explicitDone =
        item.usedSessions ?? item.consumedSessions;
      const done =
        explicitDone != null
          ? numberOrZero(explicitDone)
          : hasRemaining
            ? Math.max(total - numberOrZero(item.remainingSessions), 0)
            : 0;
      const remaining = hasRemaining
        ? numberOrZero(item.remainingSessions)
        : Math.max(total - done, 0);

      return {
        id:
          item.id ??
          item._id ??
          `${subscription.id ?? subscription._id}-${index}`,
        name: resolveName(item.subject?.name) || "مادة غير محددة",
        subjectId:
          typeof item.subject === "string"
            ? item.subject
            : item.subject?.id || item.subject?._id,
        status: item.status || subscription.status,
        done,
        total,
        remaining,
      };
    });
  });

const SubscriptionsCard = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchSubscriptions = async () => {
      try {
        setLoading(true);
        const { data } = await getMySubscriptions();

        const raw = data?.data ?? data;
        const subscriptions = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.subscriptions)
            ? raw.subscriptions
            : raw
              ? [raw]
              : [];

        if (!cancelled) setItems(subscriptions);
      } catch (err) {
        if (!cancelled) setError(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchSubscriptions();
    return () => {
      cancelled = true;
    };
  }, []);

  const allSubjects = buildSubjectsFromSubscriptions(items);
  const activeSubjectKeys = new Set(
    allSubjects
      .filter((subject) => subject.status === "active")
      .map((subject) => String(subject.subjectId || subject.name)),
  );
  const subjects = allSubjects.filter(
    (subject) =>
      !["ended", "expired", "completed"].includes(subject.status) ||
      !activeSubjectKeys.has(String(subject.subjectId || subject.name)),
  );

  return (
    <div
      dir="rtl"
      className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm p-4 sm:p-5 h-full"
    >
      <div className="mb-5">
        <h3
          className="text-[#1F2937] font-semibold text-[15px] sm:text-[16px]"
          style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
        >
          الاشتراكات
        </h3>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8 text-[#9CA3AF] gap-2">
          <Loader2 size={18} className="animate-spin" />
          <span className="text-[13px]">جاري التحميل...</span>
        </div>
      )}

      {!loading && error && (
        <div className="text-center py-8 text-[#E54848] text-[13px]">
          حدث خطأ أثناء تحميل الاشتراكات
        </div>
      )}

      {!loading && !error && subjects.length === 0 && (
        <div className="text-center py-8 text-[#9CA3AF] text-[13px]">
          لا توجد اشتراكات حالياً
        </div>
      )}

      {!loading && !error && subjects.length > 0 && (
        <div className="flex flex-col divide-y divide-[#EEF0F3]">
            {subjects.map((subject) => {
              const percent =
                subject.total > 0
                ? Math.min(
                    100,
                    Math.round((subject.done / subject.total) * 100),
                    )
                  : 0;
              const remainingRatio =
                subject.total > 0
                  ? subject.remaining / subject.total
                  : 0;
              const progressColor =
                remainingRatio <= 0.25
                  ? "bg-[#E54848]"
                  : remainingRatio <= 0.5
                    ? "bg-[#F59E0B]"
                    : "bg-[#12C6B0]";
              return (
              <div key={subject.id} className="py-4 first:pt-0 last:pb-0">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span
                    className="truncate text-[13px] font-semibold text-[#1F2937] sm:text-[14px]"
                    style={{
                      fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                    }}
                  >
                    {subject.name}
                  </span>
                  <span className="shrink-0 text-[12px] font-semibold text-[#123C91]">
                    {subject.done}/{subject.total}
                  </span>
                </div>
                <div className="mb-2.5 h-2 w-full overflow-hidden rounded-full bg-[#E5E7EB]">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
                      style={{ width: `${percent}%` }}
                    />
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#6B7280] sm:text-[12px]">
                  <span>{subject.done} حصة مكتملة</span>
                  <span>{subject.remaining} حصة متبقية</span>
                  <span>{subject.total} إجمالي</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SubscriptionsCard;
