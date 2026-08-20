import React from "react";
import visionIcon from "../../assets/icons/vision-icon.png";
import missionIcon from "../../assets/icons/mission-icon.png";

const features = [
  {
    title: "رؤيتنا",
    desc:
      "أن نصبح منصة تعليمية رائدة توفر تجربة تعلم حديثة وآمنة، تربط بين الطلاب والمعلمين وأولياء الأمور في بيئة تعليمية أكثر كفاءة واحترافية.",
    icon: visionIcon,
  },
  {
    title: "رسالتنا",
    desc:
      "نسعى إلى تقديم بيئة تعليمية متكاملة تساعد الطلاب على التطور الأكاديمي من خلال الحصص المباشرة، المتابعة المستمرة، والتواصل المنظم بين المعلمين وأولياء الأمور لضمان تجربة تعليمية فعالة وآمنة.",
    icon: missionIcon,
  },
];

export default function Features() {
  return (
    <section className="-mt-16 bg-white w-full" id="features">
      <div className="w-full px-6 md:px-12 lg:px-20">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-12 h-0.5 bg-(--secondary)"></div>
            <p className="text-(--secondary) font-['Tajawal'] font-medium text-[16px]">
              من نحن
            </p>
            <div className="w-12 h-0.5 bg-(--secondary)"></div>
          </div>

          <h2 className="font-['Tajawal'] font-bold text-[48px] leading-14 text-center text-(--primary)">
            عن الأكاديمية
          </h2>
        </div>

        {/* Banner */}
        <div className="w-full mb-12 flex items-center justify-center">
          <p className="text-[#1F2937] leading-8 text-[18px] text-center max-w-4xl">
            توفر الأكاديمية بيئة تعليمية متكاملة تساعد الطلاب على التعلم والتطور من خلال حصص مباشرة، واجبات، وتقارير متابعة مستمرة، مع نظام تواصل آمن يربط بين المعلمين وأولياء الأمور لضمان تجربة تعليمية أكثر احترافية وفاعلية.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {features.map((item) => (
            <div
              key={item.title}
              className="
                w-full
                bg-white
                rounded-2xl
                p-6 md:p-8
                border border-(--border-light)
                shadow-sm
                hover:shadow-md
                hover:-translate-y-1
                transition-all duration-300
                flex flex-col
              "
            >
              {/* Icon + Title */}
              <div className="flex items-center gap-4 mb-6">
                <img
                  src={item.icon}
                  alt={item.title}
                  className="w-12 h-12 object-contain"
                />
                <h3 className="text-2xl font-bold text-(--primary)">
                  {item.title}
                </h3>
              </div>

              {/* Description */}
              <p className="text-(--text-light) leading-7 text-lg">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
