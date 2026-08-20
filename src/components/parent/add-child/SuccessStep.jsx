import React from 'react';
import { Check, Hourglass, Bell } from 'lucide-react';
import academyLogo from '../../../assets/icons/logo.svg';

const SuccessStep = ({ onStatusClick }) => {
  return (
    <div className=" flex flex-col items-center justify-center py-4 text-center space-y-4 font-['IBM_Plex_Sans_Arabic']">

      <div className="mb-4 ">
        <img src={academyLogo} alt="الأكاديمية" className="h-10 object-contain" />
      </div>


      <div className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-[#12C6B0]">
        <svg className="w-8 h-8 text-[#12C6B0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>


      <div>
        <h2 className="font-['IBM_Plex_Sans_Arabic'] text-[20px] font-bold text-[#1F2937] mb-2 ">تم إنشاء حسابك بنجاح</h2>
        <p className="font-['IBM_Plex_Sans_Arabic'] text-[#1F2937BF] mt-2 text-[14px]">حسابك الآن قيد المراجعة من قبل الإدارة</p>
      </div>


      <div
        className="w-full max-w-130  p-8 rounded-2xl border border-[#E5E5E5] bg-[#1F29371A] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.12)] space-y-4 text-right"
      >

        <div className="flex items-center justify-start gap-3">
          <div className="w-6 h-6 flex items-center justify-center rounded-full bg-[#10B981]">
            <Check size={14} className="text-white" strokeWidth={3} />
          </div>
          <span className="text-[14px] text-[#1F2937]">تم استلام طلبك بنجاح</span>
        </div>

        <div className="flex items-center justify-start gap-3">
          <div className="w-6 h-6 flex items-center justify-center">
            <Hourglass size={20} className="text-[#9CA3AF]" />
          </div>
          <span className="text-[14px] text-[#1F2937]">جاري مراجعة الحساب من الإدارة</span>
        </div>

        <div className="flex items-center justify-start gap-3">
          <div className="w-6 h-6 flex items-center justify-center">
            <Bell size={20} className="text-[#9CA3AF]" />
          </div>
          <span className="text-[14px] text-[#1F2937]">سيتم إشعارك فور القبول</span>
        </div>

      </div>

     
      <button onClick={onStatusClick} className="bg-[#123C91] text-white [&_svg]:text-white py-3 px-12 rounded-xl font-medium mt-6 cursor-pointer">
        عرض حالة الطلب
      </button>
    </div>
  );
};

export default SuccessStep;