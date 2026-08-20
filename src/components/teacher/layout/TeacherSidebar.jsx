import { Link, NavLink, useNavigate } from "react-router-dom";
import { useContext } from "react";
import toast from "react-hot-toast";
import { AuthContext } from "../../../context/AuthContext";
import { createInstructorProfile, getMyInstructorProfile } from "../../../services/APIService";
import { useSidebarUnread } from "../../../api/useSidebarUnread";

import logo from "../../../assets/icons/loogo.svg";
import toggleIcon from "../../../assets/icons/sidebar-toggle.png";

import dashboardIcon from "../../../assets/icons/dashboard.png";
import childrenIcon from "../../../assets/icons/children.png";
import scheduleIcon from "../../../assets/icons/schedule.png";
import messagesIcon from "../../../assets/icons/messages.png";
import notificationsIcon from "../../../assets/icons/notifications.png";
import settingsIcon from "../../../assets/icons/settings.png";
import logoutIcon from "../../../assets/icons/logout.png";
// ⚠️ مفيش أيقونة "دورات" مستوردة في الملف الأصلي، فمؤقتاً باستخدم dashboardIcon.
// لو عندك أيقونة مخصصة (زي courses.png) استورديها وحطيها بدل ده.
// ⚠️ نفس الكلام على "الأرباح" - كان في الأصل عامل import لـ subscriptionIcon
// بس مش موجود فعليًا في الملف، فبستخدم dashboardIcon مؤقتًا برضه.
// لو عندك أيقونة مخصصة (earnings.png مثلاً) استورديها وحطيها بدل ده.

const TeacherSidebar = ({ isOpen, setIsOpen }) => {
  const unread = useSidebarUnread();
  const { user, logout, updateUser } = useContext(AuthContext);
  const isInstructor = user?.accountType === "instructor" && user?.instructorStatus !== "suspended";
  const menu = [
    { title: "لوحة التحكم", icon: dashboardIcon, path: "/teacher-dashboard" },
    // ⚠️ المسار "/teacher/courses" افتراضي - تأكدي إنه مطابق للراوت المعرّف
    // فعلياً في الراوتر بتاعك (ممكن يكون /teacher/my-courses أو غيره).
    ...(isInstructor ? [{ title: "الدورات", icon: dashboardIcon, path: "/teacher/courses" }] : []),
    { title: "المجموعات", icon: childrenIcon, path: "/teacher/groups" },
    { title: "الجدول", icon: scheduleIcon, path: "/teacher/schedule" },
    { title: "الواجبات", icon: messagesIcon, path: "/teacher/tasks" },
    { title: "الرسائل", icon: messagesIcon, path: "/teacher/messages" },
    {
      title: "الإشعارات",
      icon: notificationsIcon,
      path: "/teacher/notifications",
    },
    // ⚠️ اتفعّلت هنا (كانت متعمول عليها comment) - بتظهر بس للمحاضرين لأنها مرتبطة بأرباح دوراتهم
    ...(isInstructor ? [{ title: "الأرباح", icon: dashboardIcon, path: "/teacher/earnings" }] : []),
    { title: "الإعدادات", icon: settingsIcon, path: "/teacher/settings" },
  ];

  const navigate = useNavigate();

  const becomeInstructor = async () => {
    try {
      const response = await createInstructorProfile({
        agreementAccepted: true,
        agreementVersion: "1.0",
        headline: `محاضر في الأكاديمية - ${user?.fullName || user?.name || "معلم"}`,
        bio: "محاضر يقدم دورات تعليمية متخصصة عبر منصة الأكاديمية.",
      });
      const profile = response.data?.data || response.data;
      updateUser({
        ...user,
        accountType: "instructor",
        instructorId: profile?._id || profile?.id,
        instructorStatus: profile?.status || "active",
      });
      toast.success("تم تفعيل حساب المحاضر ويمكنك الآن إضافة الدورات");
      navigate("/teacher/courses");
    } catch (error) {
      if (error?.response?.status === 409) {
        try {
          const response = await getMyInstructorProfile();
          const profile = response.data?.data || response.data;
          updateUser({ ...user, accountType: "instructor", instructorId: profile?._id || profile?.id, instructorStatus: profile?.status || "active" });
          navigate("/teacher/courses");
          return;
        } catch {
          // Display the original backend error below.
        }
      }
      toast.error(error?.response?.data?.message || "تعذر تفعيل حساب المحاضر");
    }
  };

  // Note: the initial open/closed state is decided once in the parent
  // (TeacherLayout) via a lazy useState initializer, based on screen
  // width at first render. That avoids a flash of the sidebar being
  // open-then-closing on mobile. From here on, isOpen is just controlled
  // by the toggle button below.

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const openAdminChat = () => {
    navigate("/teacher/messages", {
      state: { openSupportConversation: true },
    });
  };

  return (
    <aside
      className={`
        relative
        flex
        flex-col
        h-full
        justify-between
        bg-[#1F2937]
        border-l
        border-white/8
        shadow-[0px_0px_2px_0px_#00000040]
        text-white
        pb-6
        transition-all
        duration-300
        ${isOpen ? "w-64" : "w-20"}
      `}
    >
      {/* Header */}
      <div className="relative flex items-center justify-between px-6 border-b border-[#FFFFFF14]">
        {isOpen && (
          <Link to="/" aria-label="الذهاب إلى الصفحة الرئيسية">
            <img
              src={logo}
              alt="الأكاديمية"
              className="object-contain w-36 h-8"
            />
          </Link>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="
            w-16
            h-16
            -ml-5
            flex
            items-center
            justify-center
            rounded-full
            transition
          "
        >
          <img
            src={toggleIcon}
            alt="toggle"
            className="object-contain w-7 h-7"
          />
        </button>
      </div>

      {/* Menu */}
      <div className="flex-1 px-3 mt-4 overflow-y-auto">
        {menu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path.endsWith("-dashboard")}
            className={({ isActive }) => `
              flex
              items-center
              ${isOpen ? "gap-2 px-3 justify-start" : "justify-center"}
              py-2
              mb-1
              rounded-xl
              transition-all
              font-['IBM_Plex_Sans_Arabic']
              font-medium
              text-[16px]
              ${
                isActive
                  ? "bg-[#FFFFFF] text-primary border-r-4 border-[#12C6B0] shadow-sm"
                  : "text-white hover:bg-white/10"
              }
            `}
          >
            {({ isActive }) => (
              <>
                <span className="relative shrink-0">
                  <img
                    src={item.icon}
                    alt={item.title}
                    className={`block w-5 h-5 transition-all duration-200 ${
                      isActive
                        ? "brightness-0 invert-20 sepia-90 saturate-5000 hue-rotate-200"
                        : ""
                    }`}
                    style={
                      isActive
                        ? {
                            filter:
                              "brightness(0) saturate(100%) invert(14%) sepia(87%) saturate(2768%) hue-rotate(218deg) brightness(93%) contrast(97%)",
                          }
                        : {}
                    }
                  />
                  {((item.path === "/teacher/messages" && unread.messages) ||
                    (item.path === "/teacher/notifications" &&
                      unread.notifications)) && (
                    <span className="absolute -left-1 -top-1 h-3 w-3 rounded-full border-2 border-[#1F2937] bg-red-500" />
                  )}
                </span>

                {isOpen && <span>{item.title}</span>}
              </>
            )}
          </NavLink>
        ))}
      </div>

      {/* Logout */}
      <div className="p-3 border-t border-[#FFFFFF14]">
        {!isInstructor && (
          <button
            type="button"
            onClick={becomeInstructor}
            className={`mb-2 flex w-full items-center rounded-lg bg-[#12AFA0] px-3 py-2.5 text-sm font-semibold text-white hover:bg-[#0E9589] ${isOpen ? "gap-3 justify-start" : "justify-center"}`}
            title="كن محاضرًا"
          >
            <img src={dashboardIcon} alt="" className="h-5 w-5" />
            {isOpen && <span>كن محاضرًا</span>}
          </button>
        )}
        <button
          type="button"
          onClick={openAdminChat}
          title="تواصل مع الإدارة"
          className={`mb-2 flex w-full items-center rounded-lg bg-[#123C91] px-3 py-2.5 font-['IBM_Plex_Sans_Arabic'] text-sm font-semibold text-white transition-colors hover:bg-[#1649A8] ${isOpen ? "gap-3 justify-start" : "justify-center"}`}
        >
          <img src={messagesIcon} alt="" className="h-5 w-5" />
          {isOpen && <span>تواصل مع الإدارة</span>}
        </button>
        <button
          onClick={handleLogout}
          className={`flex items-center mx-3 py-2 rounded-lg transition-all font-['IBM_Plex_Sans_Arabic'] font-medium text-[16px] leading-4 ${
            isOpen ? "gap-3 justify-start" : "justify-center"
          }`}
        >
          <img src={logoutIcon} alt="logout" className="w-5 h-5" />

          {isOpen && <span className="text-sm">تسجيل الخروج</span>}
        </button>
      </div>
    </aside>
  );
};

export default TeacherSidebar;