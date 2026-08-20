import bellIcon from "../../../assets/icons/bell-icon.svg";

const notifications = [
  {
    title: "درس الفيزياء يبدأ بعد 30 دقيقة",
    time: "منذ 5 دقائق",
  },
  {
    title: "تم تحديث الجدول الدراسي",
    time: "منذ ساعتين",
  },
];

const RecentNotificationsSection = () => {
  return (
    <div className="bg-white border border-[#1F293726] rounded-2xl p-6 flex flex-col shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-['Tajawal'] font-medium text-[20px] text-[#1F2937]">
          الإشعارات الأخيرة
        </h3>
        <span className="font-['IBM_Plex_Sans_Arabic'] font-medium text-[14px] text-[#1F2937] cursor-pointer">
          عرض الكل
        </span>
      </div>

      <div className="space-y-3">
        {notifications.map((n, i) => (
          <div
            key={i}
            className="flex items-start justify-between gap-3 bg-[#F0F4FC] border border-[#E5E5E5] rounded-xl p-3"
          >
            <div className="text-right flex-1">
              <p className="font-['IBM_Plex_Sans_Arabic'] font-medium text-[14px] leading-5 text-[#1F2937]">
                {n.title}
              </p>
              <p className="font-['IBM_Plex_Sans_Arabic'] font-normal text-[12px] leading-5 text-[#8C9198] mt-1">
                {n.time}
              </p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-[#123C91] text-white [&_svg]:text-white flex items-center justify-center shrink-0">
              <img src={bellIcon} alt="" className="w-4 h-4 invert" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentNotificationsSection;
