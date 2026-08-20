import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import {
  getLandingStats,
  LANDING_STATS_EVENT,
  LANDING_STATS_STORAGE_KEY,
} from "../../utils/landingStats";

const Counter = ({ value, label, duration = 2 }) => {
  const nodeRef = useRef(null);
  const isInView = useInView(nodeRef, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!isInView || !nodeRef.current) return undefined;

    const numericValue = parseInt(value.replace(/[^0-9]/g, ""));
    const increment = numericValue / (duration * 60);
    let current = 0;
    nodeRef.current.textContent = "0";

    const timer = window.setInterval(() => {
      current += increment;

      if (current >= numericValue) {
        if (nodeRef.current) nodeRef.current.textContent = value;
        window.clearInterval(timer);
      } else if (nodeRef.current) {
        nodeRef.current.textContent =
          Math.floor(current).toLocaleString() +
          (value.includes("%") ? "%" : "");
      }
    }, 1000 / 60);

    return () => window.clearInterval(timer);
  }, [isInView, value, duration]);

  return (
    <div className="flex flex-col items-center justify-center gap-2 text-center">
      <h3
        ref={nodeRef}
        className="
          font-['IBM_Plex_Sans_Arabic']
          font-bold
          text-[28px] md:text-[48px]
          leading-9 md:leading-14
          text-white
        "
      >
        0
      </h3>

      <p
        className="
          font-['IBM_Plex_Sans_Arabic']
          font-normal
          text-[14px] md:text-[24px]
          leading-5 md:leading-8
          text-white
        "
      >
        {label}
      </p>
    </div>
  );
};

export default function Stats() {
  const [stats, setStats] = useState(getLandingStats);

  useEffect(() => {
    const refresh = (event) => {
      if (!event.key || event.key === LANDING_STATS_STORAGE_KEY) {
        setStats(getLandingStats());
      }
    };
    window.addEventListener("storage", refresh);
    window.addEventListener(LANDING_STATS_EVENT, refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener(LANDING_STATS_EVENT, refresh);
    };
  }, []);

  const formatted = (value) => Number(value || 0).toLocaleString("en-US");

  return (
    <section className="w-full bg-[#1F2937] flex justify-center items-center">
      <div
        className="
          w-full
          px-6 py-8 md:px-12 md:py-10
          grid grid-cols-2 md:grid-cols-4
          gap-6
          items-center
        "
      >
        <Counter value={formatted(stats.teachers)} label="معلم" />
        <Counter value={formatted(stats.students)} label="طالب" />
        <Counter value={formatted(stats.courses)} label="دورة تدريبية" />
        <Counter
          value={`${formatted(stats.satisfaction)}%`}
          label="رضا المعلمين"
        />
      </div>
    </section>
  );
}
