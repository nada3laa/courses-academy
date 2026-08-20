import React from "react";

const WelcomeHeader = ({ studentName = "محمد" }) => {
  return (
    <div dir="rtl" className="mb-5 sm:mb-6">
      <h2
        className="text-[#123C91] font-bold text-[18px] sm:text-[20px] lg:text-[22px] mb-1.5 sm:mb-2"
        style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
      >
        مرحباً بك يا {studentName}
      </h2>
      <p
        className="text-[#575F69] text-[12.5px] sm:text-[13px] lg:text-[14px] leading-6 max-w-2xl"
        style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
      >
        هنا يمكنك الوصول إلى محتوى دروسك، متابعة جدول الحصص، تسليم الواجبات،
        ومراقبة تقدمك الدراسي ودرجاتك بسهولة.
      </p>
    </div>
  );
};

export default WelcomeHeader;