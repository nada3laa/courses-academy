const DEFAULT_QUESTIONS = [
  {
    id: "goal",
    text: "ما أفضل طريقة للاستفادة من هذه الوحدة؟",
    options: [
      "مشاهدة الدروس بالترتيب ثم التطبيق",
      "تجاوز جميع الدروس",
      "حفظ العناوين فقط",
      "البدء بالاختبار دون دراسة",
    ],
    correctAnswer: 0,
  },
  {
    id: "practice",
    text: "متى يكون التطبيق العملي أكثر فاعلية؟",
    options: [
      "بعد إنهاء الكورس بالكامل فقط",
      "بعد كل درس مباشرة",
      "قبل مشاهدة المحتوى",
      "ليس ضروريًا",
    ],
    correctAnswer: 1,
  },
  {
    id: "review",
    text: "ماذا تفعل إذا أخطأت في سؤال؟",
    options: [
      "أتجاهل الخطأ",
      "أعيد الكورس من البداية دائمًا",
      "أراجع الدرس المرتبط ثم أحاول مجددًا",
      "أتوقف عن التعلم",
    ],
    correctAnswer: 2,
  },
];

export function getExamQuestions(course, chapter, chapterIndex) {
  const lessonTitles = (chapter?.lessons || [])
    .filter((lesson) => lesson.type !== "quiz")
    .map((lesson) => lesson.title || lesson);

  const contentQuestion = lessonTitles.length >= 2
    ? {
        id: "content",
        text: `أي موضوع تمت دراسته في ${chapter?.title || `الوحدة ${chapterIndex + 1}`}؟`,
        options: [
          lessonTitles[0],
          "موضوع غير موجود في الدورة",
          "إدارة المشروعات المتقدمة",
          "التسويق الإلكتروني",
        ],
        correctAnswer: 0,
      }
    : null;

  return [contentQuestion, ...DEFAULT_QUESTIONS]
    .filter(Boolean)
    .map((question, index) => ({
      ...question,
      id: `${course?.id || "course"}-${chapterIndex}-${question.id}-${index}`,
    }));
}
