const ChildCard = ({
  name,
  stage,
  plan,
  status,
  date,
  isExpiring,
  sessionsText = "24 ساعة شهرياً",
  onRenew,
}) => {
  const borderColor = isExpiring
    ? "border-l-[#D32F2F]"
    : "border-l-[#12C6B0]";

  const statusBg = isExpiring
    ? "bg-[#D32F2F26] text-[#D32F2F]"
    : "bg-[#ECFDF5] text-[#00A63E]";

  return (
    <div
      dir="rtl"
      className={`
        w-full
        min-h-65
        bg-white
        rounded-2xl
        border
        border-[#E5E5E5]
        border-l-4
        ${borderColor}
        shadow-sm
        hover:shadow-md
        transition-all
        duration-300
        p-4 sm:p-5
        flex
        flex-col
        justify-between
      `}
    >
      {/* Header */}
      <div className="flex justify-between items-start gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="
              w-11
              h-11
              rounded-full
              bg-[#123C91] text-white [&_svg]:text-white
              text-white
              flex
              items-center
              justify-center
              font-bold
              shrink-0
            "
          >
            {name?.charAt(0)}
          </div>

          <div className="min-w-0">
            <h3
              className="
                text-[#151C27]
                text-[15px]
                sm:text-[16px]
                font-medium
                truncate
                mb-1
              "
            >
              {name}
            </h3>

            <p
              className="
                text-[#434751]
                text-[12px]
                sm:text-[13px]
              "
            >
              {stage || "—"}
            </p>
          </div>
        </div>

        <span
          className={`
            px-3
            py-1
            rounded-full
            text-xs
            font-medium
            whitespace-nowrap
            ${statusBg}
          `}
        >
          {status}
        </span>
      </div>

      {/* Plan Box */}
      <div
        className="
          bg-[#EAF4FF]
          rounded-xl
          p-4
          my-4
        "
      >
        <div className="flex justify-between items-center mb-3">
          <span
            className="
              text-[#434751]
              text-[14px]
              sm:text-[15px]
            "
          >
            الباقة الحالية:
          </span>

          <span
            className="
              text-[#123C91]
              text-[15px]
              sm:text-[16px]
              font-medium
            "
          >
            {plan}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span
            className="
              text-[#575F69]
              text-[14px]
              sm:text-[15px]
            "
          >
            التجديد القادم:
          </span>

          <span
            className={`
              text-[13px]
              font-bold
              ${
                isExpiring
                  ? "text-[#E11D48]"
                  : "text-[#151C27]"
              }
            `}
          >
            {date}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div>
        <div
          className="
            flex
            items-center
            gap-2
            text-[14px]
            text-[#151C27]
            mb-4
          "
        >
          <span className="text-[#00A63E] text-lg">
            ✓
          </span>

          <span>{sessionsText}</span>
        </div>

        <button
          type="button"
          onClick={onRenew}
          disabled={onRenew === null}
          className="
            w-full
            h-12
            rounded-xl
            border
            border-[#E5E5E5]
            bg-white
            text-[#123C91]
            font-medium
            text-[15px]
            hover:bg-[#F8FAFC]
            transition-all
            disabled:cursor-not-allowed
            disabled:opacity-60
          "
        >
          تجديد الآن
        </button>
      </div>
    </div>
  );
};

export default ChildCard;
