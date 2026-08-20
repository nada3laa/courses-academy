const statusStyle = (status) => {
  if (status === "نشطة")
    return "bg-[#00A63E26] text-[#00A63E]";

  if (status === "منتهية")
    return "bg-[#D32F2F26] text-[#D32F2F]";

  if (status === "قيد المراجعة")
    return "bg-[#F59E0B26] text-[#F59E0B]";

  if (status === "ملغية")
    return "bg-gray-100 text-gray-600";

  return "bg-gray-100 text-gray-600";
};

const withGroupMeta = (rows) => {
  const seenGroups = new Set();

  return rows.map((row) => {
    const groupId = row.groupId ?? row.id;
    const isFirstInGroup = !seenGroups.has(groupId);
    seenGroups.add(groupId);

    return {
      ...row,
      groupId,
      isFirstInGroup,
      groupSize: row.groupSize ?? 1,
    };
  });
};

const PlanCell = ({ subjectName, packageName, teacherName }) => (
  <div className="flex flex-col items-center leading-tight">
    <span className="text-[#1F2937] font-medium text-[14px]">
      {subjectName || "--"}
    </span>
    {packageName && packageName !== "—" && (
      <span className="mt-1 text-[12px] font-medium text-[#123C91]">
        {packageName}
      </span>
    )}
    {teacherName && (
      <span className="text-[#9CA3AF] text-[12px] mt-0.5" dir="auto">
        {teacherName}
      </span>
    )}
  </div>
);


const MutedOrValue = ({ value, highlight = false }) => {
  if (value === "--" || value == null) {
    return <span className="text-[#C7CBD1] text-[13px]">غير متاح</span>;
  }
  return (
    <span className={highlight ? "text-[#123C91] font-medium" : "text-[#575F69]"}>
      {value}
    </span>
  );
};

const RemainingValue = ({ row }) => {
  if (row.remaining === "--" || row.remaining == null) {
    return <span className="text-[#C7CBD1] text-[13px]">غير متاح</span>;
  }

  const total = Number(row.totalSessions);
  const remaining = Number(row.remainingSessions);
  const ratio =
    Number.isFinite(total) && total > 0 && Number.isFinite(remaining)
      ? remaining / total
      : null;
  const color =
    ratio != null && ratio < 0.25
      ? "bg-red-50 text-red-600"
      : ratio != null && ratio < 0.5
        ? "bg-orange-50 text-orange-600"
        : "bg-blue-50 text-[#123C91]";

  return (
    <span className={`inline-flex rounded-full px-3 py-1 font-semibold ${color}`}>
      {row.remaining}
    </span>
  );
};

const shouldShowRenew = (row) => {
  if (row.status === "منتهية") return true;

  const remaining =
    row.remainingSessions == null ? null : Number(row.remainingSessions);

  if (Number.isFinite(remaining) && remaining <= 2) return true;

  const total =
    row.totalSessions == null ? null : Number(row.totalSessions);
  const consumed = Number.parseFloat(row.consumed);

  return (
    Number.isFinite(total) &&
    total > 0 &&
    Number.isFinite(consumed) &&
    consumed >= total
  );
};

const SubscriptionTable = ({
  data,
  ownerHeader = "الابن",
  hideOwner = false,
  onRenew,
}) => {
  const rows = withGroupMeta(data ?? []);

  const headers = [
    ...(!hideOwner ? [ownerHeader] : []),
    "الباقة",
    "إجمالي الحصص",
    "المستهلك",
    "المتبقي",
    "مدة الاشتراك",
    "تاريخ البدء",
    "المبلغ",
    "الحالة",
    ...(onRenew ? ["الإجراء"] : []),
  ];

  return (
    <>
      {/* Desktop Table */}
      <div
        className="
          hidden
          lg:block
          bg-white
          border
          border-[#E5E5E5]
          rounded-2xl
          overflow-hidden
          shadow-sm
        "
      >
        <table
          className="w-full border-collapse"
          dir="rtl"
        >
          <thead>
            <tr className="bg-[#F9FAFA] border-b border-[#E5E5E5]">
              {headers.map((header) => (
                <th
                  key={header}
                  className="
                    px-4
                    py-4
                    text-right
                    text-[14px]
                    font-medium
                    text-[#575F69]
                    whitespace-nowrap
                  "
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={headers.length}
                  className="px-4 py-8 text-center text-[#575F69]"
                >
                  لا توجد اشتراكات حالياً
                </td>
              </tr>
            )}

            {rows.map((row, index) => (
              <tr
                key={row.id ?? index}
                className={`
                  border-b
                  border-[#E5E5E5]
                  hover:bg-[#FAFAFA]
                  transition-colors
                  ${row.isFirstInGroup && index !== 0 ? "border-t-2 border-t-[#E5E5E5]" : ""}
                `}
              >
                
                {!hideOwner && row.isFirstInGroup && (
                  <td
                    rowSpan={row.groupSize}
                    className="
                      px-4
                      py-5
                      font-medium
                      text-[#1F2937]
                      align-middle
                      border-l
                      border-[#F1F1F1]
                    "
                  >
                    {row.name}
                  </td>
                )}

                <td className="px-4 py-5 text-center">
                  <PlanCell
                    subjectName={row.subjectName}
                    packageName={row.packageName}
                    teacherName={row.teacherName}
                  />
                </td>

                <td className="px-4 py-5 text-center text-[#575F69]">
                  {row.totalHours}
                </td>

                <td className="px-4 py-5 text-center">
                  <MutedOrValue value={row.consumed} />
                </td>

                <td className="px-4 py-5 text-center">
                  <RemainingValue row={row} />
                </td>

                <td className="px-4 py-5 text-center text-[#575F69]">
                  {row.duration}
                </td>

                <td className="px-4 py-5 text-center text-[#575F69]">
                  {row.startDate}
                </td>

                <td className="px-4 py-5 text-center text-[#575F69]">
                  {row.amount}
                </td>

                <td className="px-4 py-5">
                  <span
                    className={`
                      inline-flex
                      items-center
                      justify-center
                      px-4
                      py-2
                      rounded-full
                      text-xs
                      font-medium
                      ${statusStyle(row.status)}
                    `}
                  >
                    {row.status}
                  </span>
                </td>
                {onRenew && (
                  <td className="px-4 py-5 text-center">
                    {shouldShowRenew(row) ? (
                      <button
                        type="button"
                        disabled={!row.groupId || !row.subjectId}
                        onClick={() => onRenew(row)}
                        className="whitespace-nowrap rounded-lg border border-[#123C91] px-3 py-2 text-xs font-semibold text-[#123C91] transition-colors hover:bg-[#EAF4FF] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        تجديد
                      </button>
                    ) : (
                      <span className="text-[#C7CBD1]">—</span>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    
      <div className="lg:hidden space-y-4">
        {rows.length === 0 && (
          <p className="text-center text-[#575F69] py-8">
            لا توجد اشتراكات حالياً
          </p>
        )}

        {(() => {
        
          const groups = [];
          const groupIndexById = new Map();

          rows.forEach((row) => {
            if (!groupIndexById.has(row.groupId)) {
              groupIndexById.set(row.groupId, groups.length);
              groups.push({ ...row, items: [row] });
            } else {
              groups[groupIndexById.get(row.groupId)].items.push(row);
            }
          });

          return groups.map((group) => (
            <div
              key={group.groupId}
              className="
                bg-white
                border
                border-[#E5E5E5]
                rounded-2xl
                p-6
                shadow-sm
              "
              dir="rtl"
            >
              <div className="flex items-center justify-between mb-4">
                {!hideOwner && (
                  <h3 className="font-semibold text-[#1F2937]">
                    {group.name}
                  </h3>
                )}

                <span
                  className={`
                    px-3
                    py-1
                    rounded-full
                    text-xs
                    font-medium
                    ${statusStyle(group.status)}
                  `}
                >
                  {group.status}
                </span>
              </div>

              <div className="space-y-5">
                {group.items.map((item, itemIndex) => (
                  <div
                    key={item.id ?? itemIndex}
                    className={
                      itemIndex !== 0
                        ? "pt-4 border-t border-[#F1F1F1] space-y-3"
                        : "space-y-3"
                    }
                  >
                    <InfoRow
                      label="الباقة"
                      value={
                        <PlanCell
                          subjectName={item.subjectName}
                          packageName={item.packageName}
                          teacherName={item.teacherName}
                        />
                      }
                    />
                    <InfoRow label="إجمالي الحصص" value={item.totalHours} />
                    <InfoRow
                      label="المستهلك"
                      value={<MutedOrValue value={item.consumed} />}
                    />
                    <InfoRow
                      label="المتبقي"
                      value={<RemainingValue row={item} />}
                    />
                    <InfoRow label="مدة الاشتراك" value={item.duration} />
                    <InfoRow label="تاريخ البدء" value={item.startDate} />
                    <InfoRow label="المبلغ" value={item.amount} />
                    {onRenew && shouldShowRenew(item) && (
                      <button
                        type="button"
                        disabled={!item.groupId || !item.subjectId}
                        onClick={() => onRenew(item)}
                        className="mt-2 w-full rounded-xl border border-[#123C91] py-2.5 text-sm font-semibold text-[#123C91] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        تجديد الاشتراك
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ));
        })()}
      </div>
    </>
  );
};

const InfoRow = ({
  label,
  value,
  highlight = false,
}) => (
  <div className="flex items-center justify-between">
    <span className="text-[#575F69] text-sm">
      {label}
    </span>

    <span
      className={`text-sm font-medium ${
        highlight && typeof value === "string"
          ? "text-[#123C91]"
          : "text-[#1F2937]"
      }`}
    >
      {value}
    </span>
  </div>
);

export default SubscriptionTable;
