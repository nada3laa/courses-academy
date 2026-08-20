import { Link, NavLink, useNavigate } from "react-router-dom";
import { useContext } from "react";
import {
  LayoutDashboard,
  Users,
  UsersRound,
  CalendarClock,
  ShieldCheck,
  GraduationCap,
  BookOpen,
  Video,
  MessageSquare,
  CreditCard,
  WalletCards,
  Banknote,
  PiggyBank,
  Bell,
  Newspaper,
  Settings,
  LogOut,
} from "lucide-react";
import { AuthContext } from "../../../context/AuthContext";
import { useSidebarUnread } from "../../../api/useSidebarUnread";

import logo from "../../../assets/icons/loogo.svg";
import toggleIcon from "../../../assets/icons/sidebar-toggle.png";

const AdminSidebar = ({ isOpen, setIsOpen }) => {
  const unread = useSidebarUnread();
  const menu = [
    {
      title: "لوحة التحكم",
      icon: LayoutDashboard,
      path: "/admin-dashboard",
    },
    {
      title: "المشرفين",
      icon: ShieldCheck,
      path: "/admin/supervisors",
    },
    {
      title: "المعلمين",
      icon: GraduationCap,
      path: "/admin/teachers",
    },
    {
      title: "المستخدمين",
      icon: Users,
      path: "/admin/users",
    },
    {
      title: "المجموعات",
      icon: UsersRound,
      path: "/admin/groups",
    },
    // ⚠️ المسار "/admin/courses" افتراضي - تأكدي إنه مطابق للراوت الفعلي المعرّف في الراوتر
    {
      title: "الدورات",
      icon: BookOpen,
      path: "/admin/courses",
    },
    {
      title: "جدول الحصص",
      icon: CalendarClock,
      path: "/admin/schedule",
    },
    {
      title: "التسجيلات",
      icon: Video,
      path: "/admin/records",
    },
    {
      title: "الرسائل",
      icon: MessageSquare,
      path: "/admin/messages",
    },
    {
      title: "الإشتراك",
      icon: CreditCard,
      path: "/admin/subscription",
    },
    {
      title: "المدفوعات",
      icon: WalletCards,
      path: "/admin/payments",
    },
    {
      title: "رواتب المعلمين",
      icon: Banknote,
      path: "/admin/teacher-salaries",
    },
    {
      title: "مالية الدورات",
      icon: PiggyBank,
      path: "/admin/course-finances",
    },
    {
      title: "الإشعارات",
      icon: Bell,
      path: "/admin/notifications",
    },
    {
      title: "المدونه",
      icon: Newspaper,
      path: "/admin/blogs",
    },
    {
      title: "الإعدادات",
      icon: Settings,
      path: "/admin/settings",
    },
  ];

  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/", { replace: true });
    logout();
  };

  return (
    <aside
      className={`
        relative
        flex
        flex-col
        h-full
        bg-[#1F2937]
        border-l
        border-white/8
        shadow-[0px_0px_2px_0px_#00000040]
        text-white
        pb-2
        overflow-y-auto
        transition-all
        duration-300
        ${isOpen ? "w-64" : "w-20"}
      `}
    >
      {/* Header */}
      <div className="relative flex shrink-0 items-center justify-between px-5 border-b border-[#FFFFFF14]">
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
            w-14
            h-14
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
      <div className="shrink-0 px-2 mt-2">
        {menu.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path.endsWith("-dashboard")}
              className={({ isActive }) => `
                flex
                items-center
                ${isOpen
                  ? "gap-2 px-3 justify-start"
                  : "justify-center"
                }
                py-1.5
                mb-1
                rounded-lg
                transition-all
                font-['IBM_Plex_Sans_Arabic']
                font-medium
                text-[15px]
                ${isActive
                  ? "bg-[#FFFFFF] text-primary border-r-4 border-[#12C6B0] shadow-sm"
                  : "text-white hover:bg-white/10"
                }
              `}
            >
              {({ isActive }) => (
                <>
                  <span className="relative shrink-0">
                    <Icon
                      size={20}
                      className={isActive ? "text-[#123C91]" : "text-white"}
                    />
                    {((item.path === "/admin/messages" && unread.messages) ||
                      (item.path === "/admin/notifications" && unread.notifications)) && (
                      <span className="absolute -left-1 -top-1 h-3 w-3 rounded-full border-2 border-[#1F2937] bg-red-500" />
                    )}
                  </span>

                  {isOpen && <span>{item.title}</span>}
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Logout */}
      <div className="shrink-0 px-2 pt-2 border-t border-[#FFFFFF14]">
        <button
          onClick={handleLogout}
          className={`flex w-full items-center px-3 py-2 rounded-lg transition-all font-['IBM_Plex_Sans_Arabic'] font-medium text-[15px] leading-4 ${isOpen ? "gap-3 justify-start" : "justify-center"
            }`}
        >
          <LogOut size={20} className="text-white" />

          {isOpen && <span className="text-sm">تسجيل الخروج</span>}
        </button>
      </div>

    </aside>
  );
};

export default AdminSidebar;