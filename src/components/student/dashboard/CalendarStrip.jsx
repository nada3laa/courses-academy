import React, { useEffect, useMemo, useState, memo, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { WEEK_DAYS } from "../../../utils/scheduleWeek";

const pad2 = (n) => String(n).padStart(2, "0");
const toISODate = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const weekdayIndex = (date) => (date.getDay() - 6 + 7) % 7;

const SHORT_DAY_NAMES = {
  "السبت": "سبت",
  "الأحد": "أحد",
  "الاثنين": "اثنين",
  "الثلاثاء": "ثلاثاء",
  "الأربعاء": "أربعاء",
  "الخميس": "خميس",
  "الجمعة": "جمعة",
};
const shortDayName = (name) => SHORT_DAY_NAMES[name] ?? name;

const buildMonthGrid = (viewDate) => {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstOfMonth = new Date(year, month, 1);
  const lastOfMonth = new Date(year, month + 1, 0);
  const leadingCount = weekdayIndex(firstOfMonth);
  const totalCells = Math.ceil((leadingCount + lastOfMonth.getDate()) / 7) * 7;

  const gridStart = new Date(year, month, 1 - leadingCount);

  return Array.from({ length: totalCells }, (_, i) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + i);
    return { date, isCurrentMonth: date.getMonth() === month };
  });
};

/** Finds the best matching date for a given weekday key within the currently visible month grid. */
const findDateForWeekdayKey = (days, dayKey, fallbackDate) => {
  if (!dayKey) return fallbackDate;
  const targetIndex = WEEK_DAYS.findIndex((d) => d.key === dayKey);
  if (targetIndex === -1) return fallbackDate;

  const inMonthMatch = days.find(
    ({ date, isCurrentMonth }) => isCurrentMonth && weekdayIndex(date) === targetIndex,
  );
  if (inMonthMatch) return inMonthMatch.date;

  const anyMatch = days.find(({ date }) => weekdayIndex(date) === targetIndex);
  return anyMatch ? anyMatch.date : fallbackDate;
};

const DayCell = memo(function DayCell({ date, isCurrentMonth, isToday, isSelected, hasEvent, onPick }) {
  const dayLabel = useMemo(
    () => new Intl.DateTimeFormat("ar-EG", { day: "numeric", month: "long", weekday: "long" }).format(date),
    [date],
  );

  return (
    <button
      type="button"
      onClick={() => onPick(date)}
      aria-pressed={isSelected}
      aria-current={isToday ? "date" : undefined}
      aria-label={dayLabel}
      className="relative flex items-center justify-center py-1 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#123C91] focus-visible:ring-offset-1"
    >
      <span
        className={`
          flex items-center justify-center
          w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11
          rounded-full text-[13px] sm:text-[14px] md:text-[15px]
          transition-colors duration-150
          ${
            isSelected
              ? "bg-[#123C91] text-white [&_svg]:text-white font-semibold shadow-[0_4px_10px_rgba(18,60,145,0.35)]"
              : isCurrentMonth
                ? isToday
                  ? "text-[#123C91] font-semibold border border-[#123C91]/40"
                  : "text-[#1F2937] hover:bg-[#F0F4FF]"
                : "text-[#C7CBD1]"
          }
        `}
        style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
      >
        {date.getDate()}
      </span>

      {hasEvent && (
        <span
          aria-hidden="true"
          className={`absolute bottom-0 w-1 h-1 rounded-full ${isSelected ? "bg-white" : "bg-[#123C91] text-white [&_svg]:text-white"}`}
        />
      )}
    </button>
  );
});

const CalendarStrip = ({
  selectedDayKey,
  onSelectDay,
  title = "جدول الحصص",
  eventDates = [],
  children, // ✅ محتوى إضافي بيتعرض جوه نفس الكارت تحت الكالندر (زي قسم الحصص)
}) => {
  const today = useMemo(() => new Date(), []);
  const [viewDate, setViewDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  const days = useMemo(() => buildMonthGrid(viewDate), [viewDate]);
  const eventDateSet = useMemo(() => new Set(eventDates), [eventDates]);

  // Keep the internal selection in sync if the parent drives selectedDayKey externally.
  useEffect(() => {
    if (!selectedDayKey) return;
    const currentKey = WEEK_DAYS[weekdayIndex(selectedDate)]?.key;
    if (currentKey === selectedDayKey) return;
    const nextDate = findDateForWeekdayKey(days, selectedDayKey, selectedDate);
    setSelectedDate(nextDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDayKey, days]);

  const monthYearLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("ar-EG", { month: "long", year: "numeric" }).format(viewDate),
    [viewDate],
  );

  const selectedDateLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("ar-EG", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(selectedDate),
    [selectedDate],
  );

  const goToPrevMonth = useCallback(
    () => setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)),
    [],
  );

  const goToNextMonth = useCallback(
    () => setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)),
    [],
  );

  const handlePick = useCallback(
    (date) => {
      setSelectedDate(date);
      const key = WEEK_DAYS[weekdayIndex(date)]?.key;
      if (key) onSelectDay?.(key);
    },
    [onSelectDay],
  );

  return (
    <div
      dir="rtl"
      role="region"
      aria-label={title}
      className="bg-white border border-[#E5E5E5] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.12)] rounded-2xl p-4 sm:p-5 mb-6 sm:mb-8 lg:mb-10"
    >
      {/* Mobile header: stacked so title, nav, and date each get their own row and never overlap */}
      <div className="flex sm:hidden flex-col gap-2 mb-4">
        <div className="flex items-center justify-between gap-2">
          <h3
            className="text-[14px] font-semibold text-[#1F2937] truncate min-w-0"
            style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
          >
            {title}
          </h3>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={goToPrevMonth}
              aria-label="الشهر السابق"
              className="p-1.5 rounded-lg text-[#8C9198] hover:text-[#123C91] hover:bg-[#F0F4FF] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#123C91]"
            >
              <ChevronRight size={18} />
            </button>

            <span
              className="text-[13px] font-medium text-[#1F2937] whitespace-nowrap"
              style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
              aria-live="polite"
            >
              {monthYearLabel}
            </span>

            <button
              type="button"
              onClick={goToNextMonth}
              aria-label="الشهر التالي"
              className="p-1.5 rounded-lg text-[#8C9198] hover:text-[#123C91] hover:bg-[#F0F4FF] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#123C91]"
            >
              <ChevronLeft size={18} />
            </button>
          </div>
        </div>

        <span
          className="text-[14px] font-semibold text-[#1F2937] text-center truncate"
          style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
          aria-live="polite"
        >
          {selectedDateLabel}
        </span>
      </div>

      {/* sm+ header: original single-row, 3-column layout */}
      <div className="hidden sm:grid sm:grid-cols-3 sm:items-center gap-2 mb-5">
        <h3
          className="text-[16px] font-semibold text-[#1F2937] justify-self-start truncate min-w-0"
          style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
        >
          {title}
        </h3>

        <span
          className="text-[16px] font-semibold text-[#1F2937] justify-self-center text-center truncate min-w-0"
          style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
          aria-live="polite"
        >
          {selectedDateLabel}
        </span>

        <div className="flex items-center gap-2 justify-self-end">
          <button
            type="button"
            onClick={goToPrevMonth}
            aria-label="الشهر السابق"
            className="p-1.5 rounded-lg text-[#8C9198] hover:text-[#123C91] hover:bg-[#F0F4FF] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#123C91]"
          >
            <ChevronRight size={18} />
          </button>

          <span
            className="text-[14px] font-medium text-[#1F2937] whitespace-nowrap"
            style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
            aria-live="polite"
          >
            {monthYearLabel}
          </span>

          <button
            type="button"
            onClick={goToNextMonth}
            aria-label="الشهر التالي"
            className="p-1.5 rounded-lg text-[#8C9198] hover:text-[#123C91] hover:bg-[#F0F4FF] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#123C91]"
          >
            <ChevronLeft size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-1 sm:mb-2" role="row">
        {WEEK_DAYS.map((d) => (
          <span
            key={d.key}
            className="text-center text-[11px] sm:text-[13px] font-medium text-[#8C9198] py-1 sm:py-2 truncate"
            style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
          >
            <span className="sm:hidden">{shortDayName(d.name)}</span>
            <span className="hidden sm:inline">{d.name}</span>
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-2" role="grid">
        {days.map(({ date, isCurrentMonth }) => (
          <DayCell
            key={toISODate(date)}
            date={date}
            isCurrentMonth={isCurrentMonth}
            isToday={isSameDay(date, today)}
            isSelected={isSameDay(date, selectedDate)}
            hasEvent={eventDateSet.has(toISODate(date))}
            onPick={handlePick}
          />
        ))}
      </div>

      {children && (
        <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-[#F1F1F1]">{children}</div>
      )}
    </div>
  );
};

export default memo(CalendarStrip);