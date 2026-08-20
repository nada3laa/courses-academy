import React, { useRef } from "react";

export default function OtpModal({ isOpen, onClose, otp, setOtp, onVerify }) {
  const inputRefs = useRef([]);

  if (!isOpen) return null;

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (isNaN(value)) return;

    let newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value !== "" && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1].focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1].focus();
    }
    if (e.key === "Backspace" && index > 0 && otp[index] === "") {
      inputRefs.current[index - 1].focus();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-2xl w-96 text-center">
        <h3 className="text-lg font-bold mb-4">كود التحقق</h3>
        <div className="flex gap-2 justify-center mb-6" dir="ltr">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (inputRefs.current[i] = el)}
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) => handleChange(e, i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              className="w-10 h-12 border rounded text-center text-xl outline-none focus:border-blue-900"
            />
          ))}
        </div>
        <button onClick={onVerify} className="w-full bg-blue-900 text-white p-3 rounded-lg">تأكيد</button>
      </div>
    </div>
  );
}