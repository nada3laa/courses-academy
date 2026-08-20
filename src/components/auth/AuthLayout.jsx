import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { FaWhatsapp } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import img1 from "../../assets/slide1.png";
import img2 from "../../assets/slide2.png";
import img3 from "../../assets/slide3.png";
import useContactSettings, {
  whatsappLink,
} from "../../hooks/useContactSettings";

const slides = [
  { image: img1, title: "منظومة تعليمية متكاملة", desc: "نجمع بين الطلاب وأولياء الأمور والمعلمين في منصة واحدة لتجربة تعليمية أكثر تنظيماً وفعالية." },
  { image: img2, title: "تابع رحلة أبنائك التعليمية", desc: "راقب الحضور والدرجات وساعات الدراسة، وابق على اطلاع دائم بتقدم أبنائك الأكاديمي." },
  { image: img3, title: "تعلم بثقة وتفاعل", desc: "تابع دروسك، أنجز واجباتك، وشارك في الفصول الافتراضية ضمن بيئة تعليمية آمنة ومنظمة." },
];

const AuthLayout = ({ children }) => {
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);
  const { pathname } = useLocation();
  const { contactSettings } = useContactSettings();
  const whatsappUrl = whatsappLink(contactSettings?.whatsappNumber);
  const emailUrl = contactSettings?.email
    ? `mailto:${contactSettings.email}`
    : "";
  const showWhatsappButton =
    pathname === "/login" ||
    pathname === "/select-account-type" ||
    pathname === "/verify-otp" ||
    pathname === "/register" ||
    pathname.startsWith("/register/");

  useEffect(() => {
    const duration = 4000;
    const intervalTime = 50;
    const step = 100 / (duration / intervalTime);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev + step >= 100) {
          clearInterval(progressInterval);
          setCurrent((c) => (c + 1) % slides.length);
          return 0;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(progressInterval);
  }, [current]);


  return (
    <div className="min-h-screen flex md:h-screen md:overflow-hidden">

      <div className="w-full md:h-screen md:w-1/2 flex items-center justify-center overflow-y-auto overscroll-contain bg-white px-6">
        {children}
      </div>

      <div className="hidden md:flex h-screen w-1/2 shrink-0 relative overflow-hidden order-1 md:order-1">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-700 ${current === index ? "opacity-100" : "opacity-0"}`}
          >
            <img src={slide.image} className="h-screen w-full object-cover" alt={slide.title} />

            <div className="absolute bottom-4 left-10 right-10 z-10 text-right">

              <h1 className="font-['Tajawal'] font-bold text-[32px] leading-10 text-primary p-2  inline-block  rounded">
                {slide.title}
              </h1>

              <p className="font-['IBM_Plex_Sans_Arabic'] -mt-4 font-normal text-[24px] leading-9  p-4 rounded text-[#1F2937]/70 w-full md:w-[80%] ml-auto">
                {slide.desc}
              </p>

            </div>
          </div>
        ))}

        <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col items-center gap-3 z-10">
          {slides.map((_, index) => {
            const distance = (index - current + slides.length) % slides.length;
            let height = "h-5";
            if (distance === 0) height = "h-12";
            else if (distance === 1) height = "h-8";
            else if (distance === 2) height = "h-6";

            return (
              <div key={index} className={`w-3 ${height} rounded-full bg-gray-300/50 overflow-hidden`}>
                {index === current && (
                  <div className="w-full bg-white transition-all duration-100" style={{ height: `${progress}%` }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {showWhatsappButton && (whatsappUrl || emailUrl) && (
        <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-3">
          {emailUrl && (
            <a
              href={emailUrl}
              aria-label="تواصل معنا عبر البريد الإلكتروني"
              title="تواصل معنا عبر البريد الإلكتروني"
              className="flex size-13 items-center justify-center rounded-full bg-[#123C91] text-white shadow-lg transition-all duration-300 hover:scale-110 hover:bg-[#0F3278] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#123C91] [&_svg]:text-white"
            >
              <MdEmail size={28} aria-hidden="true" />
            </a>
          )}
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="تواصل معنا عبر واتساب"
              title="تواصل معنا عبر واتساب"
              className="flex size-13 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-all duration-300 hover:scale-110 hover:bg-[#1ebe5d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366] [&_svg]:text-white"
            >
              <FaWhatsapp size={29} aria-hidden="true" />
            </a>
          )}
        </div>
      )}
    </div>
  );
};

export default AuthLayout;
