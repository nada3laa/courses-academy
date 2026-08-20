import Navbar from "./Navbar";
import Footer from "./Footer"; 
import { Outlet } from "react-router-dom";
import { ArrowUp } from "lucide-react";
const HomeLayout = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="flex flex-col min-h-screen relative">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />

      <button
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 p-3 bg-[#123C91] text-white [&_svg]:text-white rounded-full shadow-lg hover:bg-[#0F3278] transition-all duration-300 z-50 hover:scale-110"
        aria-label="العودة للأعلى"
      >
        <ArrowUp size={24} />
      </button>
    </div>
  );
};

export default HomeLayout;
