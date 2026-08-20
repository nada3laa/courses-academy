import { MdEmail } from "react-icons/md";
import { FaWhatsapp } from "react-icons/fa";
import logo from "../../assets/icons/logo.svg";
import fbIcon from "../../assets/icons/facebook.png";
import useContactSettings, { whatsappLink } from "../../hooks/useContactSettings";

const Footer = () => {
  const { contactSettings } = useContactSettings();
  const handleScroll = (id) => {
    if (id === "top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      const section = document.getElementById(id);
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  return (
    <footer
      dir="rtl"
      className="w-full bg-[#EAF4FF] py-10 px-4 md:px-20 border-t border-[#DBE7F5]"
      style={{ maxWidth: "1440px", margin: "0 auto" }}
    >
      <div className="flex flex-wrap lg:flex-nowrap justify-between items-start gap-6">
        
        <div className="max-w-75">
          <div className="flex items-center gap-3 w-44 h-8 cursor-pointer" onClick={() => handleScroll("top")}>
            <img src={logo} alt="Logo" className="h-full w-auto object-contain" />
          </div>
          <p className="font-normal text-[15px] leading-6 text-right text-[#1F2937] mt-4">
            منصة متكاملة تدير الاشتراكات، الحصص، الامتحانات، حضور وغياب الطلاب، وتضمن تواصلاً آمناً بين الجميع.
          </p>
        </div>

        {/* ================= PLATFORM ================= */}
        <div>
          <h2 className="font-['Tajawal'] font-bold text-[24px] text-[#1F2937] mb-5">المنصة</h2>
          <ul className="space-y-3">
            <li><button onClick={() => handleScroll("top")} className="text-primary hover:text-[#12C6B0] transition-colors duration-300">الرئيسية</button></li>
            <li><button onClick={() => handleScroll("features")} className="text-primary hover:text-[#12C6B0] transition-colors duration-300">المميزات</button></li>
            <li><button onClick={() => handleScroll("pricing")} className="text-primary hover:text-[#12C6B0] transition-colors duration-300">الباقات</button></li>
          </ul>
        </div>

        {/* ================= SUPPORT ================= */}
        <div>
          <h2 className="font-['Tajawal'] font-bold text-[24px] text-[#1F2937] mb-5">الدعم والمعلومات</h2>
          <ul className="space-y-3">
            <li><button onClick={() => handleScroll("features")} className="text-primary hover:text-[#12C6B0] transition-colors duration-300">عن الأكاديمية</button></li>
            <li><button onClick={() => handleScroll("faq")} className="text-primary hover:text-[#12C6B0] transition-colors duration-300">الأسئلة الشائعة</button></li>
          </ul>
        </div>

        {/* ================= SOCIAL ================= */}
        {(contactSettings?.email || contactSettings?.whatsappNumber) && (
          <div>
            <h2 className="font-['Tajawal'] font-bold text-[24px] text-[#1F2937] mb-5">تواصل معنا</h2>
            <div className="space-y-3">
              {contactSettings.email && (
                <a
                  href={`mailto:${contactSettings.email}`}
                  className="flex items-center gap-2 text-[#123C91] hover:text-[#12C6B0]"
                  dir="ltr"
                >
                  <MdEmail size={20} className="shrink-0" />
                  <span>{contactSettings.email}</span>
                </a>
              )}
              {contactSettings.whatsappNumber && (
                <a
                  href={whatsappLink(contactSettings.whatsappNumber)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-[#123C91] hover:text-[#25D366]"
                  dir="ltr"
                >
                  <FaWhatsapp size={20} className="shrink-0 text-[#25D366]" />
                  <span>{contactSettings.whatsappNumber}</span>
                </a>
              )}
            </div>
          </div>
        )}

        {/* ================= SOCIAL ================= */}
        <div>
          <h2 className="font-['Tajawal'] font-bold text-[24px] text-[#1F2937] mb-5">تابعنا</h2>
          <div className="flex gap-4 w-44 h-8">
            <a
              href="https://www.facebook.com/share/1eL4DDQxiF/?mibextid=wwXIfr"
              target="_blank"
              rel="noreferrer"
              aria-label="فيسبوك"
              className="w-8 h-8 flex items-center justify-center hover:scale-110 transition-transform duration-300"
            >
              <img src={fbIcon} alt="فيسبوك" className="w-full h-full object-contain" />
            </a>
          </div>
        </div>
      </div>

      <div className="mt-12 pt-8 text-center border-t border-[#1F293733]">
        <p className="text-[16px] text-[#123C91] font-normal">
          © 2026 الأكاديمية. جميع الحقوق محفوظة.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
