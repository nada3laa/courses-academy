import { useContext } from "react";
import studentsImg from "../../../assets/student.svg";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext";

const WelcomeSection = ({ hasChildren = false }) => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const firstName = user?.fullName?.trim()?.split(" ")[0] || "";

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="w-full rounded-lg flex items-center px-2">
        <h2 className="font-['IBM_Plex_Sans_Arabic'] font-semibold text-[24px] leading-8 text-primary w-full text-right">
          مرحباً بك يا {firstName}
        </h2>
      </div>

      <p className="text-gray-500 font-medium -mt-3 px-2">
        هنا يمكنك متابعة رحلة تعلم أبنائك لحظة بلحظة.
      </p>

      {!hasChildren && (
        <div className="bg-white border border-[#1F293726] rounded-2xl p-10 text-center flex flex-col items-center justify-center shadow-[0px_0px_4px_0px_#00000014]">
          <img
            src={studentsImg}
            alt="students"
            className="h-32 object-contain mb-6"
          />

          <h3 className="font-['IBM_Plex_Sans_Arabic'] font-medium text-[20px] leading-8 text-[#000000] text-center">
            لم تقم بإضافة أي أبناء بعد
          </h3>

          <p className="font-['IBM_Plex_Sans_Arabic'] mt-2 font-normal text-[16px] leading-6 text-[#1F2937BF] text-center max-w-md">
            أضف أبناءك لبدء متابعة الحصص والواجبات والتقييمات والجدول الدراسي.
          </p>

          <button
            className="bg-[#123C91] text-white [&_svg]:text-white rounded-lg mt-3 flex items-center justify-center hover:bg-blue-900 transition-colors font-['Tajawal'] font-medium text-[16px]"
            style={{ width: '160px', height: '48px', padding: '0 24px' }}
            onClick={() => navigate("/parent-dashboard/add-child")}
          >
            إضافة ابن
          </button>
        </div>
      )}
    </div>
  );
};

export default WelcomeSection;