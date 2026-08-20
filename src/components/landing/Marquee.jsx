export default function Ticker() {
  const subjects = [
    "الرياضيات", "الفيزياء", "الكيمياء", "الأحياء",
    "اللغة الإنجليزية", "اللغة الفرنسية", "اللغة الألمانية",
    "الحاسب الآلي", "البرمجة للمبتدئين",
  ];

  return (

    <section className="w-full pt-4 pb-8 bg-white -mt-10 -lg:mt-0 relative z-20 -bottom-2">
      <div className="max-w-7xl mx-auto px-4">
        <p className="text-center text-[#1F293799] text-[16px] leading-6 font-medium mb-12" style={{ fontFamily: "Tajawal, sans-serif" }}>
          موثوق به من آلاف الطلاب والمعلمين
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-4 text-center">
          {subjects.map((subject, index) => (
            <span key={index} className="text-[14px] leading-6 font-medium text-[#1F2937B2]"
              style={{ fontFamily: "IBM Plex Sans Arabic" }}>
              {subject}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}