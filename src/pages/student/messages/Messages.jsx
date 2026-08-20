// StudentMessages.jsx
import { useContext, useEffect, useRef, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import ConversationsList from "../../../components/student/messgaes/ConversationsList";
import ChatBox from "../../../components/student/messgaes/ChatBox";
import StudentLayout from "../../../components/student/layout/StudentLayout";
import { useChatRooms } from "../../../api/useChatRooms";
import { AuthContext } from "../../../context/AuthContext";

export default function StudentMessages() {
  const { user } = useContext(AuthContext);
  const currentUserId = user?._id ?? user?.id;

  const {
    conversations,
    activeId,
    loading,
    openConversation,
    leaveConversation,
    sendMessage,
    startSupportConversation,
  } = useChatRooms(currentUserId);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const openedFromLink = useRef(false);

  useEffect(() => {
    if (
      loading ||
      openedFromLink.current ||
      !location.state?.openSupportConversation
    ) {
      return;
    }

    openedFromLink.current = true;
    startSupportConversation().then((roomId) => {
      if (roomId) {
        setActiveFilter("admin");
        setShowChatOnMobile(true);
      } else {
        openedFromLink.current = false;
      }
    });
  }, [loading, location.state, startSupportConversation]);

  useEffect(() => {
    if (loading || openedFromLink.current) return;
    const roomId = location.state?.openRoomId ?? searchParams.get("room");
    const classroomId =
      location.state?.openClassroomId ?? searchParams.get("classroom");
    const groupName = (
      location.state?.openClassroomName ?? searchParams.get("name")
    )?.trim();
    if (!classroomId && !roomId && !groupName) return;

    const conversation =
      conversations.find(
        (item) =>
          (roomId && String(item.id) === String(roomId)) ||
          (classroomId && String(item.classroomId) === String(classroomId)),
      ) ??
      conversations.find((item) => {
        if (
          !groupName ||
          (item.type !== "classroom" && item.category !== "classroom")
        ) {
          return false;
        }

        const roomName = String(item.name || "").trim();
        return roomName === groupName || roomName.includes(groupName);
      });
    if (conversation) {
      openedFromLink.current = true;
      openConversation(conversation.id);
      setShowChatOnMobile(true);
    }
  }, [conversations, loading, location.state, openConversation, searchParams]);

  const handleNewConversation = async () => {
    const newId = await startSupportConversation();
    if (newId) setShowChatOnMobile(true);
  };

  const handleSelect = (id) => {
    openConversation(id);
    setShowChatOnMobile(true);
  };

  const handleBackToList = () => {
    leaveConversation(activeId);
    setShowChatOnMobile(false);
    openConversation(null);
  };

  const activeConversation = conversations.find((c) => c.id === activeId);
  const shouldShowChat = Boolean(activeConversation);

  return (
    <StudentLayout>
      {/* أنيميشن دخول صندوق المحادثة - زي صفحة الوالد بالظبط */}
      <style>{`
        @keyframes chatBoxIn {
          from { opacity: 0; transform: scale(0.97) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-chatBoxIn { animation: chatBoxIn 0.28s ease-out; }
        @media (prefers-reduced-motion: reduce) {
          .animate-chatBoxIn { animation: none; }
        }
      `}</style>

      <div
        className="mx-auto flex h-full w-full max-w-7xl min-w-0 flex-col overflow-x-hidden font-['IBM_Plex_Sans_Arabic'] text-right"
        dir="rtl"
      >
        <div className="shrink-0 pb-3 md:pb-6">
          <h1 className="text-[20px] font-semibold leading-7 text-[#123C91] md:text-[24px] md:leading-8 mb-1 md:mb-2">
            مركز الرسائل
          </h1>
          <p className="hidden text-[16px] font-normal leading-6 text-[#575F69] md:block">
            التواصل مع المعلمين والإدارة حول دراستك
          </p>
        </div>

        {loading ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-7 h-7 border-2 border-blue-900 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-400">جاري تحميل المحادثات...</p>
            </div>
          </div>
        ) : (
          <div className="flex min-h-0 min-w-0 flex-1 gap-0 md:gap-4">
            {/* قائمة المحادثات */}
            <div
              className={`
                ${showChatOnMobile ? "hidden" : "flex"}
                md:flex
                w-full md:w-[320px] lg:w-90
                shrink-0
                min-w-0
                flex-col
                bg-white
                rounded-3xl
                border border-[#E5E5E5]
                min-h-0
              `}
            >
              <ConversationsList
                conversations={conversations}
                activeId={activeId}
                onSelect={handleSelect}
                onNewConversation={handleNewConversation}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
              />
            </div>

            {/* صندوق المحادثة */}
            {shouldShowChat && (
              <div
                key={activeId}
                className={`
                  ${showChatOnMobile ? "flex" : "hidden"}
                  md:flex
                  w-full
                  min-w-0
                  flex-1
                  flex-col
                  bg-white
                  rounded-3xl
                  border border-[#E5E5E5]
                  min-h-0
                  overflow-hidden
                  animate-chatBoxIn
                `}
              >
                <ChatBox
                  conversation={activeConversation}
                  onSend={sendMessage}
                  onBack={handleBackToList}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
