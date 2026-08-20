import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import heroImage from "../../assets/small dashbord.svg";
import heroBg from "../../assets/hero.png";
import { AuthContext } from "../../context/AuthContext";

export default function Hero() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleExplore = () => {
    const aboutSection = document.getElementById("features");
    aboutSection?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(null, "", "/#features");
  };

  return (
    <section className="relative w-full overflow-hidden" id="home">
      <img
        src={heroBg}
        alt="Hero Background"
        className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none"
      />

      <div className="container-custom mx-auto relative z-10 pt-16 pb-4 lg:pb-8 flex flex-col lg:flex-row items-center justify-center min-h-[60vh]">

        {/* TEXT SIDE */}
        <div className="flex-1 text-center lg:text-right lg:mr-10 px-4 -translate-y-4 lg:-translate-y-18">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight" style={{ fontFamily: "Tajawal, sans-serif" }}>
            <span className="text-[#1F2937]">منصة واحدة</span><br />
            <span className="text-(--primary)">لإدارة تعليمية متكاملة</span>
          </h1>
          <p className="mt-5 text-base sm:text-lg lg:text-[20px] text-[#1F2937] max-w-xl mx-auto lg:mx-0">
            منصة متكاملة تدير الاشتراكات، الحصص، الامتحانات، حضور وغياب الطلاب，
            وتضمن تواصلًا آمنًا بين الجميع في نظام ذكي ومحمي بالكامل.
          </p>
          {!user && (
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <button
                type="button"
                onClick={() => navigate("/select-account-type")}
                className="w-full sm:w-50 h-14 bg-[#123C91] text-white [&_svg]:text-white rounded-lg font-medium text-lg"
              >
                ابدأ الآن
              </button>
              <button
                type="button"
                onClick={handleExplore}
                className="w-full sm:w-50 h-14 border border-[#1F2937]/20 bg-white text-[#123C91] rounded-lg font-medium text-lg"
              >
                استكشف المنصة
              </button>
            </div>
          )}
        </div>

        {/* IMAGE SIDE */}
        <div className="flex-1 flex justify-center items-center overflow-hidden mt-10 lg:mt-0 px-4 -translate-y-8 lg:translate-y-0">
          <img
            src={heroImage}
            alt="Hero Dashboard"
            className="

              max-w-[320px]
              sm:max-w-95
              lg:max-w-120
              xl:max-w-130
              2xl:max-w-140
              object-contain
              rotate-0 sm:rotate-2
              hover:rotate-6
              transition-transform duration-500
            "
          />
        </div>
      </div>
    </section>
  );
}
