import React from 'react';
import { Clock, Users } from 'lucide-react';

const LessonCard = ({ groupName, level, time, duration, status, actionLabel, onAction }) => {
  const isLive = status === 'live';

  const badge =
    status === 'ended'
      ? { label: 'منتهية', cls: 'bg-blue-100 text-[#123C91]' }
      : status === 'live'
      ? { label: 'تبدأ الآن', cls: 'bg-[#00A63E26] text-[#00A63E]' }
      : { label: 'قادمة', cls: 'bg-[#F3F4F6] text-[#6B7280]' };

  const btnCls = isLive
    ? 'bg-[#123C91] text-white [&_svg]:text-white hover:bg-[#0f3278]'
    : 'border border-[#E5E5E5] text-[#1F2937] bg-white hover:bg-gray-50';

  return (
    <div
      dir="rtl"
      className="bg-white border border-[#E5E5E5] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.12)] rounded-2xl p-4 flex flex-col justify-between gap-3 w-full"
      style={{ borderRight: '3px solid rgba(18,60,145,0.5)' }}
    >
      <div className="flex items-center justify-between gap-2">
        <h3
          className="text-[15px] font-semibold text-[#1F2937] leading-6 text-right truncate"
          style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
        >
          {groupName}
        </h3>
        <span className={`shrink-0 px-3 py-0.5 rounded-md text-[11px] font-semibold ${badge.cls}`}>
          {badge.label}
        </span>
      </div>

      <div className="flex items-center justify-start gap-1.5 text-[12px] text-[#1F293780]">
        <Users size={14} className="text-[#9CA3AF]" />
        <span>{level}</span>
      </div>

      <div className="border-t border-[#E5E5E5]" />

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[#8C9198] text-[13px]">
          <Clock size={15} className="text-[#12C6B0]" />
          <span>{time}</span>
          {duration ? <span>{duration} د</span> : null}
        </div>

        <button
          onClick={onAction}
          disabled={!isLive}
          className={`px-4 py-1.5 rounded-lg text-[13px] font-medium transition-colors duration-150 ${btnCls} ${!isLive ? 'opacity-70 cursor-default' : ''}`}
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
};

const LessonsList = ({ lessons = [], loading }) => {
  if (loading) {
    return <div className="text-center py-10 text-[#9CA3AF] text-[13px]">جاري تحميل الدروس...</div>;
  }
  if (lessons.length === 0) {
    return <div className="text-center py-10 text-[#9CA3AF] text-[13px]">لا توجد دروس في هذا اليوم</div>;
  }

  return (
    <div dir="rtl" className="w-full font-['IBM_Plex_Sans_Arabic',sans-serif]">
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(300px,1fr))]">
        {lessons.map((lesson) => (
          <LessonCard key={lesson.id} {...lesson} />
        ))}
      </div>
    </div>
  );
};

export default LessonsList;
