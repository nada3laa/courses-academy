import React from "react";
import logo from "../../assets/icons/logoo.png";
import {
  Video,
  ClipboardList,
  BarChart3,
  CreditCard,
  ShieldCheck,
  MessageSquare
} from "lucide-react";

const features = [
  { title: "إدارة مرنة للاشتراكات", desc: "اختيار الباقات التعليمية وإدارة الدروس والاشتراكات بسهولة من خلال المنصة.", icon: CreditCard },
  { title: "واجبات ومتابعة ذكية", desc: "إنشاء واجبات ومتابعة تسليمها لتقييم الطلاب بدقة.", icon: ClipboardList },
  { title: "حصص مباشرة وتفاعلية", desc: "إدارة الحصص المباشرة مع إمكانية مشاركة الشاشة والملفات والتفاعل داخل الدرس بسهولة.", icon: Video },
  { title: "بيئة تعليمية آمنة", desc: "نظام تواصل منظم يحافظ على خصوصية الطلاب ويوفر بيئة تعليمية آمنة تحت إشراف كامل.", icon: ShieldCheck },
  { title: "متابعة مستمرة للأداء", desc: "لوحات متابعة وإحصائيات تساعد أولياء الأمور على متابعة تقدم الأبناء بشكل مستمر.", icon: BarChart3 },
  { title: "تواصل فعال", desc: "نظام تواصل مباشر بين المعلمين وأولياء الأمور لمتابعة التقدم وحل أي استفسار بسهولة.", icon: MessageSquare },
];

export default function Services() {
  return (
    <section
      className="py-20 w-full relative" id="services"
      style={{
        background: "radial-gradient(50% 50% at 50% 50%, rgba(18, 198, 176, 0.2) 0%, rgba(234, 244, 255, 0.2) 100%)"
      }}
    >
      <div className="w-full px-4 md:px-8 lg:px-12">

        <div className="flex flex-col items-center mb-12">
          <div
            className="
            w-30 h-30 
            bg-white rounded-full 
            shadow-md 
            flex flex-col items-center justify-center 
             -mt-12 gap-2.5 
            p-2.5
          "
          >
            <img src={logo} alt="logo" className="w-10 h-10 object-contain" />

            <h2
              className="text-[#123C91] font-['Tajawal'] font-bold text-[24px] leading-[100%] tracking-[0.4px]"
              style={{ fontFamily: 'Tajawal, sans-serif' }}
            >
              مميزاتنا
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {features.map((item, index) => (
            <Card key={index} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Card({ title, desc, icon: Icon }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-start text-right transition-all duration-300 hover:shadow-lg">
      <div className="w-10 h-10 rounded-lg bg-[#EEF4FF] flex items-center justify-center mb-4">
        <Icon size={22} className="text-[#2563EB]" />
      </div>
      <h3 className="text-[24px] leading-none font-bold text-[#1F2937] text-center tracking-[0.4px] mb-2"
        style={{ fontFamily: "Tajawal, sans-serif" }}>{title}</h3>
        
      <p className="text-[16px] leading-6  font-normal text-[#6B7280]"
        style={{ fontFamily: "IBM Plex Sans Arabic" }}
      >{desc}</p>
    </div>
  );
}
