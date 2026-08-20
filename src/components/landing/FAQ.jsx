import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

const faqs = [
  {
    q: "كيف يتم التواصل بين الطالب والمدرس؟",
    a: "بالنسبة لطلاب المدارس، يتم التواصل الأساسي بين ولي الأمر والمدرس. يمكن للطالب المشاركة في المحادثة العامة داخل الدرس فقط وفقًا لإعدادات المدرس، مما يضمن بيئة تعليمية آمنة ومنظمة.",
  },
  {
    q: "هل يمكنني اختيار مدرس معين لطفلي؟",
    a: "نعم، يمكن لأولياء الأمور تصفح ملفات المدرسين والبحث عن التخصص المناسب، ثم إرسال طلب تدريس للمدرس المطلوب، وله الحق في قبول الطلب أو رفضه.",
  },
  {
    q: "هل يتم تسجيل الدروس والمحاضرات؟",
    a: "نعم، يمكن تسجيل الدروس بهدف ضمان الجودة، ومراجعة الشكاوى أو الملاحظات، ومساعدة الطلاب على مراجعة المحتوى الدراسي عند الحاجة.",
  },
  {
    q: "ماذا يحدث إذا تغيب الطالب عن الدروس؟",
    a: "في حال تغيب الطالب عن درسين متتاليين دون عذر أو إشعار مسبق من ولي الأمر، قد يتم إيقافه عن الدرس إلى حين معالجة الأمر والتواصل مع الإدارة.",
  },
  {
    q: "كيف يمكنني متابعة مستوى طفلي الدراسي؟",
    a: "يوفر النظام تقارير وإحصائيات تفصيلية تشمل عدد ساعات الدراسة، المواد المسجلة، التقييمات، الدرجات، ومستوى التقدم الأكاديمي لكل طالب.",
  },
  {
    q: "كيف تحمي المنصة خصوصية الطلاب وأولياء الأمور؟",
    a: "تم تصميم المنصة للحفاظ على الخصوصية من خلال الحد من مشاركة المعلومات الشخصية، وعدم إظهار بيانات حساسة مثل الصور الشخصية أو بلد الجنسية، مع مراقبة قنوات التواصل لضمان بيئة آمنة للجميع.",
  },
];

const FAQItem = ({ item }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="
        w-full max-w-7xl
        min-h-16
        border
        transition-all
        duration-300
        overflow-hidden
        rounded-xl md:rounded-2xl
        p-4 md:p-6
        mb-3 md:mb-4
        flex flex-col justify-center
        bg-white
        border-[#1F293714]
        shadow-sm
      "
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-3 text-right"
      >
        <span
          className="
            font-['Tajawal']
            font-bold
            text-[15px] md:text-[18px]
            leading-6
            text-right
            text-[#1F2937]
          "
        >
          {item.q}
        </span>

        <div className="text-[#123C91] shrink-0">
          {isOpen ? <Minus size={20} /> : <Plus size={20} />}
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="
              font-['IBM_Plex_Sans_Arabic']
              font-normal
              text-[14px] md:text-[16px]
              text-[#1F2937CC]
              leading-7
              rounded-lg
              mt-3 md:mt-4
              text-right
            "
          >
            {item.a}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function FAQ() {
  return (
    <section className="py-12 md:py-20 bg-white w-full" id="faq">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h2
          className="
            font-['Tajawal']
            font-bold
            text-[32px] md:text-[48px]
            leading-tight md:leading-14
            text-[#1F2937]
            p-2 md:p-4
            rounded-lg
            text-center
          "
        >
          الأسئلة الشائعة
        </h2>

        <p
          className="
            font-['IBM_Plex_Sans_Arabic']
            font-normal
            text-[15px] md:text-[18px]
            leading-7 md:leading-6
            text-[#1F2937B2]
            px-2 md:p-4
            rounded-lg
            text-center
            mb-6 md:mb-4
            -mt-2 md:-mt-4
          "
        >
          كل ما تحتاج معرفته عن المنصة، الاشتراكات، وآلية الدراسة داخل
          الأكاديمية.
        </p>

        <div className="flex flex-col text-right w-full">
          {faqs.map((item, index) => (
            <FAQItem key={index} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
