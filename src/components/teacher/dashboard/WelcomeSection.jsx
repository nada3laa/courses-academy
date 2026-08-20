// import studentsImg from "../../../assets/student.svg";
// import { Link } from "react-router-dom";
// import { useNavigate } from "react-router-dom";

import { AuthContext } from "../../../context/AuthContext";
import { useContext } from "react";


  

const Welcome = ({ hasChildren = false }) => {

  const { user } = useContext(AuthContext);

  const firstName = user?.fullName?.trim()?.split(" ")[0] || "";
 

  return (
    <div className="flex flex-col gap-6 w-full">
      <div
        className="w-full  rounded-lg flex items-center px-2"
      >
          <h2 className="font-['IBM_Plex_Sans_Arabic'] font-semibold text-[24px] leading-8 text-primary w-full text-right">
          مرحباً بك يا {firstName}
        </h2>
      </div>

      <p className="text-gray-500 font-medium -mt-3 px-2">
        هنا يمكنك متابعة رحلة تعليمك لحظة بلحظة.
      </p>

  
    </div>
  );
};

export default Welcome;