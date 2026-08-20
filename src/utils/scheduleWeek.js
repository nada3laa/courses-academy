export const WEEK_DAYS = [
  { key: "saturday", name: "السبت" },
  { key: "sunday", name: "الأحد" },
  { key: "monday", name: "الاثنين" },
  { key: "tuesday", name: "الثلاثاء" },
  { key: "wednesday", name: "الأربعاء" },
  { key: "thursday", name: "الخميس" },
  { key: "friday", name: "الجمعة" },
];

// الأسبوع يبدأ يوم السبت
export const getWeekStart = (date) => {
  const d = new Date(date);
  const day = d.getDay(); // Sun=0 ... Sat=6
  const diff = (day - 6 + 7) % 7;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const buildWeekDates = (referenceDate) => {
  const start = getWeekStart(referenceDate);
  return WEEK_DAYS.map((wd, i) => {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    return { ...wd, date, dayNum: date.getDate() };
  });
};

export const formatArabicMonthYear = (date) =>
  date.toLocaleDateString("ar-EG", { month: "long", year: "numeric" });

export const DEFAULT_LESSON_DURATION_MIN = 45;

export const computeLessonStatus = (date, durationMinutes = DEFAULT_LESSON_DURATION_MIN) => {
  const start = new Date(date);
  const end = new Date(start.getTime() + durationMinutes * 60000);
  const now = new Date();

  if (now < start) return "upcoming";
  if (now >= start && now <= end) return "live";
  return "completed";
};

/*
  ✅ مصدر الجدول الحقيقي المؤكد: GET /classrooms/my (وإحنا مسجلين دخول
  كـ parent). كل classroom راجع فيه students (array من IDs بتاعة
  الـ student record، مش user.id) + subject + teacher + schedule.schedule
  (array من { day, startTime }) — كل حاجة مطلوبة موجودة في نداء واحد،
  مفيش داعي لأي نداء تاني لجدول منفصل.

  الدالة دي بتاخد:
   - classrooms: نتيجة getMyClassrooms() (data array)
   - studentMap: { [studentRecordId]: fullName } مبني من getMyStudents()
   - weekStart: تاريخ بداية الأسبوع (getWeekStart)
  وبترجع array من "حصص" حقيقية لأبناء الوالد بس، بتواريخ فعلية للأسبوع ده.
*/
export const buildFamilyLessonInstances = (classrooms = [], studentMap = {}, weekStart) => {
  const instances = [];

  classrooms.forEach((classroom) => {
    const slots = classroom?.schedule?.schedule || [];
    const memberIds = classroom?.students || [];

    // الأبناء بتوع الوالد اللي فعلاً مشتركين في الـ classroom ده
    const myChildrenInClass = memberIds.filter((id) => studentMap[id]);
    if (myChildrenInClass.length === 0) return;

    slots.forEach((slot) => {
      const dayIndex = WEEK_DAYS.findIndex((d) => d.key === slot.day);
      if (dayIndex === -1 || !slot.startTime) return;

      const date = new Date(weekStart);
      date.setDate(date.getDate() + dayIndex);
      const [h, m] = slot.startTime.split(":").map(Number);
      date.setHours(h, m, 0, 0);

      myChildrenInClass.forEach((studentId) => {
        instances.push({
          id: `${slot.id || slot._id}_${studentId}_${date.toISOString().slice(0, 10)}`,
          scheduleSlotId: slot.id || slot._id,
          classroomId: classroom.id,
          classroomName: classroom.name,
          title: classroom?.subject?.name?.ar || classroom?.subject?.name?.en || '—',
          subjectId: classroom?.subject?.id,
          teacherName: classroom?.teacher?.user?.fullName || '—',
          meetingLink: classroom?.meetingLink || null,
          day: slot.day,
          startTime: slot.startTime,
          date,
          duration: DEFAULT_LESSON_DURATION_MIN,
          studentId,
          studentName: studentMap[studentId] || 'ابن/ابنة',
        });
      });
    });
  });

  return instances.sort((a, b) => a.date - b.date);
};