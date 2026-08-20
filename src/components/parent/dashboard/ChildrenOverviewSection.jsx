const COLOR_POOL = ["bg-[#123C91] text-white [&_svg]:text-white", "bg-[#12C6B0]", "bg-[#7C3AED]", "bg-[#EA580C]"];

const getInitial = (name) => (name?.trim()?.[0] || "؟");

const StatusBadge = ({ status }) => {
  if (status === "pending-contact") {
    return (
      <span className="font-['IBM_Plex_Sans_Arabic'] text-[12px] font-medium text-[#B45309] bg-[#FEF3C7] px-2.5 py-1 rounded-full">
        قيد المراجعة
      </span>
    );
  }
  return null;
};

const ChildrenOverviewSection = ({ children = [] }) => {
  const hasChildren = children.length > 0;

  return (
    <div className="bg-white border border-[#1F293726] rounded-2xl p-6 flex flex-col shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="text-right">
          <h3
            className="font-['Tajawal'] font-medium text-[20px] mb-2 text-[#1F2937]"
            style={{ lineHeight: '16px', letterSpacing: '0px' }}
          >
            نظرة عامة على الأبناء
          </h3>
          <p
            className="font-['IBM_Plex_Sans_Arabic'] font-normal text-[16px] mt-1"
            style={{ color: '#8C9198', lineHeight: '24px', letterSpacing: '0px' }}
          >
            الأداء والتقدم الدراسي
          </p>
        </div>
        <span
          className="font-['IBM_Plex_Sans_Arabic'] font-medium text-[14px] cursor-pointer"
          style={{ color: '#1F2937', lineHeight: '100%', letterSpacing: '0%' }}
        >
          عرض الكل
        </span>
      </div>

      {!hasChildren ? (
        <div className="flex-1 flex flex-col justify-center items-center text-center py-8">
          <p
            className="font-['IBM_Plex_Sans_Arabic'] text-center mb-2"
            style={{ fontWeight: 500, fontSize: '20px', lineHeight: '32px', color: '#1F2937' }}
          >
            لا يوجد أبناء حالياً
          </p>
          <p
            className="font-['IBM_Plex_Sans_Arabic'] text-center"
            style={{ fontWeight: 400, fontSize: '16px', lineHeight: '24px', color: '#1F2937BF' }}
          >
            أضف أبناءك أولاً لعرض الأداء والتقدم الدراسي لأبنائك.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {children.map((child, index) => {
            const name = child.user?.fullName || "بدون اسم";
            const gradeName = child.grade?.name?.ar || child.grade?.name?.en || "—";
            const score = child.averageScore ?? 0;
            const color = COLOR_POOL[index % COLOR_POOL.length];

            return (
              <div
                key={child.id || index}
                className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-2xl p-4 flex flex-col gap-1"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={`${color} text-white w-12 h-12 flex items-center justify-center rounded-full font-['IBM_Plex_Sans_Arabic'] font-normal text-[18px]`}
                    >
                      {getInitial(name)}
                    </div>
                    <div>
                      <h4 className="font-['Tajawal'] font-medium text-[18px] leading-6 text-[#1F2937] text-right mb-1">
                        {name}
                      </h4>
                      <p className="font-['IBM_Plex_Sans_Arabic'] font-normal text-[14px] leading-5 text-[#575F69] text-right">
                        {gradeName}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={child.status} />
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-['IBM_Plex_Sans_Arabic'] font-normal text-[14px] leading-5 tracking-normal text-[#1F2937BF] text-right">
                    المعدل العام
                  </span>
                  <span className="font-['IBM_Plex_Sans_Arabic'] font-semibold text-[14px] leading-6 tracking-normal text-[#1F2937] text-right">
                    {score}%
                  </span>
                </div>
                <div className="w-full bg-[#123C9133] h-2 rounded-full mb-4">
                  <div
                    className="bg-[#123C91] text-white [&_svg]:text-white h-2 rounded-full"
                    style={{ width: `${score}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ChildrenOverviewSection;