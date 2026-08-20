import React from "react";

const steps = [
  { id: 1, name: "المعلومات الأساسية" },
  { id: 2, name: "بناء المحتوى" },
  { id: 3, name: "التسعير" },
  { id: 4, name: "المراجعة والإرسال" },
];

const CourseStepsNavigation = ({ currentStep = 1 }) => (
  <div
    dir="rtl"
    className="w-full rounded-2xl border border-[#E5E5E5] bg-white px-4 pt-3 pb-2 shadow-[0px_0px_2px_-1px_rgba(0,0,0,0.1),0px_0px_3px_0px_rgba(0,0,0,0.1)] sm:px-8"
  >
    <div className="hidden items-center justify-between sm:flex">
      {steps.map((step, index) => {
        const isActive = currentStep === step.id;
        const isCompleted = currentStep > step.id;

        return (
          <React.Fragment key={step.id}>
            <div className="flex shrink-0 items-center gap-1">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "border-2 border-[#123C91] bg-[#123C91CC] text-white"
                    : isCompleted
                      ? "bg-[#1E4FAE] text-white"
                      : "bg-[#F3F4F6] text-[#6B7280]"
                }`}
              >
                {isCompleted ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  step.id
                )}
              </div>
              <span
                className={`rounded-md px-2 py-1 text-right font-['IBM_Plex_Sans_Arabic'] text-[14px] leading-6 font-normal ${
                  isActive ? "text-[#1F2937]" : "text-[#6B7280]"
                }`}
              >
                {step.name}
              </span>
            </div>
            {index !== steps.length - 1 && (
              <div
                className={`mx-2 h-1 min-w-8 flex-1 rounded-full transition-colors ${
                  isCompleted ? "bg-[#1E4FAE]" : "bg-[#E5E5E5]"
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>

    <div className="flex flex-col gap-3 py-2 sm:hidden">
      <div className="flex items-center gap-1">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isActive = currentStep === step.id;
          return (
            <div key={step.id} className="flex flex-1 items-center">
              <div
                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                  isCompleted
                    ? "bg-[#1E4FAE]"
                    : isActive
                      ? "bg-[#123C91CC]"
                      : "bg-[#E5E5E5]"
                }`}
              />
              {index !== steps.length - 1 && <div className="w-1" />}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between">
        <span className="font-['IBM_Plex_Sans_Arabic'] text-[12px] text-[#6B7280]">
          {currentStep} من {steps.length}
        </span>
        <div className="flex items-center gap-2">
          <span className="font-['IBM_Plex_Sans_Arabic'] text-[14px] font-medium text-[#1F2937]">
            {steps[currentStep - 1]?.name}
          </span>
          <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#123C91] bg-[#123C91CC] text-[12px] font-medium text-white">
            {currentStep}
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default CourseStepsNavigation;
