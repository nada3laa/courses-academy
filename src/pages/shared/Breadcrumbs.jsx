import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { getClassroomSessions } from "../../services/APIService";

// ⚠️ عدّلي المسميات دي حسب اللي عايزاه يتعرض للمستخدم
// المفتاح = segment زي ما هو مكتوب في الـ path
const SEGMENT_LABELS = {
  "parent-dashboard": "الرئيسية",
  "teacher-dashboard": "الرئيسية",
  "student-dashboard": "الرئيسية",
  "admin-dashboard": "الرئيسية",

  parent: "ولي الأمر",
  teacher: "المعلم",
  student: "الطالب",

  "add-child": "إضافة طفل",
  schedule: "الجدول",
  children: "الأبناء",
  notifications: "الإشعارات",
  subscription: "الاشتراك",
  subscriptions: "الاشتراكات",
  messages: "الرسائل",
  settings: "الإعدادات",

  groups: "المجموعات",
  lessons: "الحصص",
  students: "الطلاب",
  new: "إنشاء جديد",
  tasks: "المهام",
  assignments: "الواجبات",
  earnings: "الأرباح",
  attendance: "الحضور",

  users: "المستخدمين",
  supervisors: "المشرفين",
  records: "التسجيلات",
  requests: "الطلبات",
  activate: "تفعيل",
  curriculum: "المنهج",
  create: "إنشاء",
  add: "إضافة",

  classrooms: "الفصول",
  sessions: "الجلسات",
  teachers: "المعلمين",
  completed: "المكتملة",
  missed: "لم تُعقد",
  files: "الملفات",
  blogs: "المدونه", 
  edit:"تعديل",
};

// segments دي بتاعت الـ id الديناميكي (زي :groupId) عايزين نعرض قيمتها الحقيقية
// أو كلمة عامة بدل الـ id لو مفيش اسم متاح
const DYNAMIC_LABELS = {
  groupId: "تفاصيل المجموعة",
  lessonId: "تفاصيل الحصة",
  studentId: "تفاصيل الطالب",
  assignmentId: "تفاصيل الواجب",
  classroomId: "الفصل",
  sessionId: "تفاصيل الحصة",
  id: "التفاصيل",
  productId: "تفاصيل العنصر",
};

// أي segment عايزة تتجاهله تماما من العرض (زي أرقام أو IDs من غير مسمى واضح)
const HIDDEN_SEGMENTS = new Set([
  "admin",
  "curriculum",
  "teacher",
  "parent",
  "student",
  // الـ *-dashboard segments دي بالفعل بتترجم لـ "الرئيسية" في SEGMENT_LABELS،
  // بس الكومبوننت أصلاً بيعرض لينك "الرئيسية" ثابت في الأول (homeTo)، فلو
  // سيبناها هتتكرر ("الرئيسية / الرئيسية"). بنشيلها هنا خالص.
  "parent-dashboard",
  "teacher-dashboard",
  "student-dashboard",
  "admin-dashboard",
]);

// زي HIDDEN_SEGMENTS بس لأجزاء المسار الديناميكية (زي :lessonId)، لأن قيمتها
// بتتغير كل مرة فمينفعش تتحط في HIDDEN_SEGMENTS اللي بتشتغل بالقيمة الثابتة.
// المفتاح هنا = اسم الـ param نفسه.
const HIDDEN_PARAM_KEYS = new Set(["lessonId", "groupId", "classroomId"]);

// ⚠️ مهم: بعض الصفحات مسارها الحقيقي في App.jsx مش نفس شكل الـ URL الحالي
// (مثال: صفحة القايمة الأساسية مسارها /admin/subscription بالمفرد، لكن باقي
// الصفحات التابعة ليها زي /admin/subscriptions/requests بالجمع). في الحالة دي
// الـ breadcrumb المبني تلقائيًا من الـ URL هيولّد لينك غلط (/admin/subscriptions)
// مش موجود في الـ Routes، فبيقع في الـ fallback ويرجّع لـ "/".
// المفتاح هنا = المسار اللي اتبني تلقائيًا (accumulated path)، والقيمة = المسار الصح.
const PATH_OVERRIDES = {
  "/admin/subscriptions": "/admin/subscription",
  "/teacher/assignments": "/teacher/tasks",
};

// بعض الـ id الديناميكي (زي :groupId) فعليًا ليها صفحة "تفاصيل" حقيقية بس مسارها
// محتاج جزء إضافي بعد الـ id (زي /lessons). هنا بنحدد الجزء الإضافي ده لكل
// paramKey عشان يبقى قابل للضغط ويودي لمسار صح، بدل ما يفضل نص غير قابل للضغط.
// المفتاح = اسم الـ param، القيمة = الجزء اللي بيتضاف بعد الـ id في اللينك.
const DYNAMIC_LINK_SUFFIX = {
  groupId: "/lessons",
};

// ⚠️ خاص بصفحة SessionDetailsPage اللي بتتشارك بين الأدمن والـ parent على
// مسار /*/classrooms/:classroomId/sessions/:sessionId. الأدمن أصلاً بيسمي
// المجموعات "المجموعات" مش "الفصول" وبيديرها من /admin/groups مش /admin/classrooms،
// فبنعمل استثناء يبدّل اللابل واللينك بتوع segment "classrooms" و"sessions" لو
// الشخص أدمن، بدل ما نستخدم SEGMENT_LABELS العادي.
const ADMIN_CLASSROOMS_SESSIONS_OVERRIDES = {
  classrooms: { label: "المجموعات", path: () => "/admin/groups" },
  sessions: {
    label: "الحصص",
    path: (params) => `/admin/groups/${params.classroomId}/lessons`,
  },
};

export default function Breadcrumbs({
  homeTo = "/",
  dynamicLabels = {},
  currentPageLabel = "",
  linkState,
  nonClickableSegments = [],
}) {
  const location = useLocation();
  const params = useParams();
  const [resolvedLessonTitle, setResolvedLessonTitle] = useState("");
  const lessonParamKey = params.lessonId ? "lessonId" : params.sessionId ? "sessionId" : "";
  const lessonId = params.lessonId || params.sessionId;
  const classroomId = params.groupId || params.classroomId;
  const providedLessonTitle = lessonParamKey ? dynamicLabels[lessonParamKey] : "";

  useEffect(() => {
    if (!lessonId || !classroomId || providedLessonTitle) {
      setResolvedLessonTitle("");
      return;
    }

    let active = true;
    getClassroomSessions(classroomId)
      .then((response) => {
        if (!active) return;
        const sessions = response.data?.data || [];
        const session = sessions.find(
          (item) => String(item.id || item._id) === String(lessonId)
        );
        setResolvedLessonTitle(session?.title || "");
      })
      .catch(() => {
        if (active) setResolvedLessonTitle("");
      });

    return () => {
      active = false;
    };
  }, [classroomId, lessonId, providedLessonTitle]);

  const breadcrumbLabels = lessonParamKey && resolvedLessonTitle
    ? { ...dynamicLabels, [lessonParamKey]: resolvedLessonTitle }
    : dynamicLabels;

  // نبني set من قيم الـ params عشان نقدر نميز أي segment هو فعليا قيمة id ديناميكي
  const paramValues = new Set(Object.values(params).filter(Boolean));
  const paramKeysByValue = Object.fromEntries(
    Object.entries(params).map(([key, value]) => [value, key])
  );

  const segments = location.pathname.split("/").filter(Boolean);
  const nonClickableSet = new Set(nonClickableSegments);

  if (segments.length === 0) return null; // في الصفحة الرئيسية مفيش داعي لبريدكرمب

  let accumulatedPath = "";
  const crumbs = segments
    .map((segment) => {
      accumulatedPath += `/${segment}`;
      if (HIDDEN_SEGMENTS.has(segment)) return null;
      // "schedule" segment: بيتشال بس لما يكون جوه lessons/schedule/new (مسار إنشاء/تعديل
      // الجدول بتاع مجموعة)، وبيفضل ظاهر لو هو نفسه صفحة مستقلة زي /parent/schedule
      if (segment === "schedule" && accumulatedPath.endsWith("/lessons/schedule")) {
        return null;
      }

      let label;
      let isDynamic = false;
      let linkPath = accumulatedPath;
      if (paramValues.has(segment)) {
        const paramKey = paramKeysByValue[segment];
        const dynamicLabel = breadcrumbLabels[paramKey];
        if (HIDDEN_PARAM_KEYS.has(paramKey) && !dynamicLabel) return null;
        label = dynamicLabel || DYNAMIC_LABELS[paramKey] || segment;
        isDynamic = true;

        const suffix = DYNAMIC_LINK_SUFFIX[paramKey];
        if (suffix) {
          linkPath = `${accumulatedPath}${suffix}`;
          isDynamic = false; // بقى ليه مسار صح ومعروف، يبقى قابل للضغط
        }
      } else {
        label = SEGMENT_LABELS[segment] || segment;

        const isAdminPath = location.pathname.startsWith("/admin/");
        const override = isAdminPath && ADMIN_CLASSROOMS_SESSIONS_OVERRIDES[segment];
        if (override) {
          label = override.label;
          linkPath = override.path(params);
        }
      }

      return {
        path: PATH_OVERRIDES[linkPath] || linkPath,
        label,
        // الـ id لوحده غالبًا مش صفحة موجودة فعليًا (زي /admin/groups/:groupId من
        // غير /lessons بعده)، فمنخليهوش قابل للضغط عشان مايرجعش لمسار غلط
        clickable: !isDynamic && !nonClickableSet.has(segment),
      };
    })
    .filter(Boolean);

  if (
    currentPageLabel &&
    crumbs[crumbs.length - 1]?.label !== currentPageLabel
  ) {
    crumbs.push({
      path: `${location.pathname}#current`,
      label: currentPageLabel,
      clickable: false,
    });
  }

  return (
    <nav aria-label="Breadcrumb" dir="rtl" className="mb-4">
      <ol className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
        <li>
          <Link to={homeTo} className="hover:text-[#123C91] transition-colors">
            الرئيسية
          </Link>
        </li>

        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          return (
            <li key={crumb.path} className="flex items-center gap-2">
              <span className="text-gray-400">/</span>
              {isLast || !crumb.clickable ? (
                <span
                  className={
                    isLast
                      ? "font-medium text-[#123C91]"
                      : "text-gray-500 cursor-default"
                  }
                  aria-current={isLast ? "page" : undefined}
                >
                  {crumb.label}
                </span>
              ) : (
                <Link
                  to={crumb.path}
                  state={linkState || location.state}
                  className="hover:text-[#123C91] transition-colors"
                >
                  {crumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
