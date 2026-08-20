import { Link, NavLink, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { useSidebarUnread } from "../../../api/useSidebarUnread";

import logo from "../../../assets/icons/loogo.svg";
import toggleIcon from "../../../assets/icons/sidebar-toggle.png";

import dashboardIcon from "../../../assets/icons/dashboard.png";
import childrenIcon from "../../../assets/icons/children.png";
import scheduleIcon from "../../../assets/icons/schedule.png";
import messagesIcon from "../../../assets/icons/messages.png";
import subscriptionIcon from "../../../assets/icons/subscription.png";
import notificationsIcon from "../../../assets/icons/notifications.png";
import settingsIcon from "../../../assets/icons/settings.png";
import logoutIcon from "../../../assets/icons/logout.png";

const ParentSidebar = ({ isOpen, setIsOpen }) => {
  const unread = useSidebarUnread();
  const menu = [
    {
      title: "لوحة التحكم",
      icon: dashboardIcon,
      path: "/parent-dashboard",
    },
    {
      title: "الأبناء",
      icon: childrenIcon,
      path: "/parent/children",
    },
    {
      title: "الجدول",
      icon: scheduleIcon,
      path: "/parent/schedule",
    },
    {
      title: "الرسائل",
      icon: messagesIcon,
      path: "/parent/messages",
    },
    {
      title: "الخطط التعليمية",
      icon: subscriptionIcon,
      path: "/parent/subscription",
    },
    {
      title: "الإشعارات",
      icon: notificationsIcon,
      path: "/parent/notifications",
    },
    {
      title: "الإعدادات",
      icon: settingsIcon,
      path: "/parent/settings",
    },
  ];

  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const openAdminChat = () => {
    navigate("/parent/messages", {
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
      <div className="relative flex items-center justify-between  px-6 border-b border-[#FFFFFF14]">
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
      <div className="flex-1 px-3 mt-4">
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
                  {((item.path === "/parent/messages" && unread.messages) ||
                    (item.path === "/parent/notifications" &&
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

      {/* Footer Links */}
      {/* {isOpen && (
        <div className="px-4 py-3 mx-3 mb-3 space-y-2 rounded-lg">
          <p className="text-[#FFFFFF] font-['IBM_Plex_Sans_Arabic'] text-[14px] font-normal text-right cursor-pointer hover:text-[#12C6B0]">
            روابط مهمة
          </p>

          <p className="text-[#FFFFFF] font-['IBM_Plex_Sans_Arabic'] text-[14px] font-normal text-right cursor-pointer hover:text-[#12C6B0]">
            المدرسة الرئيسية
          </p>

          <p className="text-[#FFFFFF] font-['IBM_Plex_Sans_Arabic'] text-[14px] font-normal text-right cursor-pointer hover:text-[#12C6B0]">
            المجموعات
          </p>
        </div>
      )} */}

      {/* Logout */}
      <div className="p-3 border-t border-[#FFFFFF14]">
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

export default ParentSidebar;
