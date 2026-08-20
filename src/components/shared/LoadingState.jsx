import { Loader2 } from "lucide-react";

const LoadingState = ({
  label = "جاري التحميل...",
  className = "",
  compact = false,
}) => (
  <div
    role="status"
    aria-live="polite"
    className={`flex w-full flex-col items-center justify-center gap-3 text-[#123C91] ${
      compact ? "py-8" : "min-h-44 py-12"
    } ${className}`}
  >
    <Loader2 size={compact ? 26 : 34} className="animate-spin" />
    <span className="text-sm font-medium">{label}</span>
  </div>
);

export default LoadingState;
