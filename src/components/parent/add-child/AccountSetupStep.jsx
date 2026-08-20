import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const AccountSetupStep = ({ onNext, onBack, data, onChange }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const handleField = (field, value) => {
    onChange(field, value);
    if (errors[field]) setErrors((p) => ({ ...p, [field]: null }));
  };

  const validate = () => {
    const next = {};
    if (!data.username?.trim()) {
      next.username = 'اسم المستخدم مطلوب';
    } else if (data.username.trim().length < 3) {
      next.username = 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل';
    }

    if (!data.password) {
      next.password = 'كلمة المرور مطلوبة';
    } else if (data.password.length < 8) {
      next.password = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';
    }

    if (!data.passwordConfirm) {
      next.passwordConfirm = 'تأكيد كلمة المرور مطلوب';
    } else if (data.password !== data.passwordConfirm) {
      next.passwordConfirm = 'كلمتا المرور غير متطابقتين';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleNext = () => {
    if (validate()) onNext();
  };

  const inputClass = (hasError) =>
    'w-full h-12 px-4 border rounded-lg bg-[#F9FAFA] ' +
    'font-["IBM_Plex_Sans_Arabic"] text-[14px] focus:outline-none focus:ring-2 ' +
    'placeholder:text-[#8C9198] ' +
    (hasError ? 'border-red-400 focus:ring-red-300' : 'border-[#E5E5E5] focus:ring-[#123C91]');

  return (
    <div dir="rtl" className="w-full p-2 space-y-4">
      <div>
        <h2 className="font-['IBM_Plex_Sans_Arabic'] font-medium text-[20px] text-[#1F2937] text-right mb-2">
          بيانات دخول الطالب
        </h2>
        <p className="font-['IBM_Plex_Sans_Arabic'] text-[#575F69] text-[16px]">
          سيتم استخدام هذه البيانات لتسجيل دخول الطالب إلى المنصة.
        </p>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block font-['Tajawal'] font-medium text-[17px] text-right text-[#1F2937] p-2">
            اسم المستخدم
          </label>
          <input
            className={inputClass(!!errors.username)}
            placeholder="ادخل اسم المستخدم"
            value={data.username || ''}
            onChange={(e) => handleField('username', e.target.value)}
          />
          {errors.username && (
            <p className="text-red-500 text-[13px] mt-1 text-right">{errors.username}</p>
          )}
        </div>

        <div>
          <label className="block font-['Tajawal'] font-medium text-[17px] text-right text-[#1F2937] p-2">
            كلمة المرور
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              className={inputClass(!!errors.password)}
              placeholder="********"
              value={data.password || ''}
              onChange={(e) => handleField('password', e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#123C91]"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-[13px] mt-1 text-right">{errors.password}</p>
          )}
        </div>

        <div>
          <label className="block font-['Tajawal'] font-medium text-[17px] text-right text-[#1F2937] p-2">
            تأكيد كلمة المرور
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              className={inputClass(!!errors.passwordConfirm)}
              placeholder="********"
              value={data.passwordConfirm || ''}
              onChange={(e) => handleField('passwordConfirm', e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#123C91]"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.passwordConfirm && (
            <p className="text-red-500 text-[13px] mt-1 text-right">{errors.passwordConfirm}</p>
          )}
        </div>
      </div>

      <div className="bg-[#EAF4FF] border border-[#E5E5E5] p-4 rounded-xl text-center text-[#575F69] text-sm">
        سيستخدم الطالب هذه البيانات لتسجيل الدخول إلى المنصة.
      </div>

      <div className="flex gap-4 mt-6">
        <button
          onClick={handleNext}
          className="flex-1 py-3 bg-[#123C91] text-white [&_svg]:text-white rounded-xl font-medium cursor-pointer"
        >
          التالي
        </button>
        <button
          onClick={onBack}
          className="flex-1 py-3 border border-[#E5E5E5] rounded-xl font-medium text-[#123C91] cursor-pointer"
        >
          السابق
        </button>
      </div>
    </div>
  );
};

export default AccountSetupStep;
