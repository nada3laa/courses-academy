import { useState } from 'react';
import toast from 'react-hot-toast';
import { addStudent } from '../../../services/APIService';

const Row = ({ label, value }) => (
  <div className="flex justify-between items-start py-2.5 border-b border-[#F3F4F6] last:border-0 gap-4">
    <span className="text-[13px] sm:text-[14px] text-[#575F69] shrink-0">{label}</span>
    <span className="text-[13px] sm:text-[14px] font-medium text-[#1F2937] text-right break-all">
      {value || '—'}
    </span>
  </div>
);

const Section = ({ title, children }) => (
  <div className="mb-4">
    <p className="text-[13px] font-medium text-[#1F2937] mb-2 px-1">{title}</p>
    <div className="bg-[#F9FAFA] rounded-xl px-4 py-1 border border-[#E5E5E5]">
      {children}
    </div>
  </div>
);

const SERVER_ERROR_MESSAGES = {
  INVALID_COUNTRY_CODE: 'كود الدولة غير صحيح، يرجى الرجوع للخطوة الأولى وإعادة اختيار الدولة',
  EMAIL_ALREADY_EXISTS: 'هذا البريد الإلكتروني مستخدم من قبل، يرجى استخدام بريد آخر',
  USERNAME_ALREADY_EXISTS: 'اسم المستخدم هذا غير متاح، يرجى اختيار اسم آخر',
  USERNAME_TAKEN: 'اسم المستخدم هذا غير متاح، يرجى اختيار اسم آخر',
  EMAIL_TAKEN: 'هذا البريد الإلكتروني مستخدم من قبل، يرجى استخدام بريد آخر',
  INVALID_CURRICULUM: 'المنهج الدراسي المختار غير صحيح',
  INVALID_STAGE: 'المرحلة الدراسية المختارة غير صحيحة',
  INVALID_GRADE: 'الصف الدراسي المختار غير صحيح',
  VALIDATION_ERROR: 'يوجد خطأ في البيانات المدخلة، يرجى مراجعة الحقول',
  PARENT_PROFILE_NOT_FOUND: 'ملف ولي الأمر غير موجود، يرجى تسجيل الخروج والدخول مرة أخرى أو التواصل مع الدعم',
};

const getServerErrorMessage = (err) => {
  const data = err.response?.data;
  if (!data) return 'حدثت مشكلة أثناء إنشاء الحساب، يرجى المحاولة لاحقاً';
  if (Array.isArray(data.errors) && data.errors.length > 0) {
    return data.errors
      .map((e) => e.message || e.msg || SERVER_ERROR_MESSAGES[e.code] || e.code)
      .filter(Boolean)
      .join(' — ');
  }
  const code = data.message;
  if (code && SERVER_ERROR_MESSAGES[code]) return SERVER_ERROR_MESSAGES[code];
  if (typeof code === 'string' && code.length > 0) return code;
  return 'حدثت مشكلة أثناء إنشاء الحساب، يرجى المحاولة لاحقاً';
};

const ReviewStep = ({
  onBack,
  onSuccess,
  data,
  countriesMap,
  curriculumsMap,
  stagesMap,
  gradesMap,
  subjectsMap,
}) => {
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const getLabel = (map, id) => map?.[id] || id || '—';

  const subjectNames =
    (data.subjects || []).map((id) => getLabel(subjectsMap, id)).join(' · ') || '—';

  const languageLabel =
    data.language === 'ar' ? 'العربية' :
    data.language === 'en' ? 'الإنجليزية' :
    data.language === 'fr' ? 'الفرنسية' : '—';

  const countryLabel = data.country?.name || getLabel(countriesMap, data.country?.id);

  const handleSubmit = async () => {
    setSubmitError('');
    setLoading(true);
    try {
      const payload = {
        fullName: data.fullName.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone?.trim(),
        birthDate: data.birthDate
          ? new Date(data.birthDate).toISOString().split('T')[0]
          : undefined,
        countryCode: data.country?.code,
        studyLanguage: data.language,
        curriculum: data.curriculum,
        stage: data.stage,
        grade: data.grade,
        preferredSubjects: data.subjects,
        username: data.username.trim(),
        password: data.password,
        passwordConfirm: data.passwordConfirm,
      };
      const response = await addStudent(payload);
      const studentId =
        response.data?.data?.studentId ||
        response.data?.studentId;
      if (!studentId) {
        throw new Error('STUDENT_ID_MISSING');
      }
      toast.success('تم إنشاء حساب الطالب بنجاح!');
      onSuccess(studentId);
    } catch (err) {
      console.error('addStudent error response:', err.response?.data);
      const message = getServerErrorMessage(err);
      setSubmitError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" className="w-full p-2">

      {/* العنوان */}
      <div className="mb-5 sm:mb-6">
        <h2 className="font-['IBM_Plex_Sans_Arabic'] font-medium text-[18px] sm:text-[20px] text-[#1F2937] text-right mb-1">
          مراجعة وإنشاء
        </h2>
        <p className="font-['IBM_Plex_Sans_Arabic'] text-[#575F69] text-[14px] sm:text-[16px] text-right">
          يرجى مراجعة البيانات قبل تأكيد الإضافة.
        </p>
      </div>

      {/* المعلومات الشخصية */}
      <Section title="المعلومات الشخصية">
        <Row label="الاسم الكامل" value={data.fullName} />
        <Row label="البريد الإلكتروني" value={data.email} />
        <Row
          label="تاريخ الميلاد"
          value={data.birthDate ? new Date(data.birthDate).toLocaleDateString('ar-EG') : '—'}
        />
        <Row label="الدولة" value={countryLabel} />
      </Section>

      {/* المعلومات الأكاديمية */}
      <Section title="المعلومات الأكاديمية">
        <Row label="المرحلة الدراسية" value={getLabel(stagesMap, data.stage)} />
        <Row label="الصف الدراسي" value={getLabel(gradesMap, data.grade)} />
        <Row label="المنهج الدراسي" value={getLabel(curriculumsMap, data.curriculum)} />
        <Row label="لغة التعلم المفضلة" value={languageLabel} />
        <Row label="المواد المفضلة" value={subjectNames} />
      </Section>

      {/* بيانات دخول الطالب */}
      <Section title="بيانات دخول الطالب">
        <Row label="اسم المستخدم" value={data.username} />
        <Row label="رقم الهاتف" value={data.phone} />
        <Row label="كلمة السر" value={data.password ? '••••••••' : '—'} />
      </Section>

      {/* ملاحظة */}
      <div className="mb-4 p-3 sm:p-4 rounded-xl bg-[#F0F4FC] border border-[#DBEAFE] text-[#1E4FAE] text-[13px] sm:text-[14px] text-right leading-relaxed">
        بعد إنشاء الطالب ستنتقل لاختيار الباقات واستكمال الدفع، ثم يُرسل الطلب إلى الإدارة للمراجعة والتفعيل.
      </div>

      {submitError && (
        <div className="mb-4 p-3 sm:p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-[13px] sm:text-[14px] text-right">
          {submitError}
        </div>
      )}

      {/* الأزرار */}
      <div className="flex flex-col-reverse sm:flex-row gap-3 mt-4">
        <button
          onClick={onBack}
          className="flex-1 py-3 border border-[#E5E5E5] rounded-xl font-medium text-[#123C91] cursor-pointer text-[14px] sm:text-[16px]"
        >
          السابق
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex-1 py-3 bg-[#123C91] text-white [&_svg]:text-white rounded-xl font-medium cursor-pointer disabled:opacity-70 transition-opacity text-[14px] sm:text-[16px]"
        >
          {loading ? 'جاري إنشاء الطالب...' : 'إنشاء طالب واستكمال الدفع'}
        </button>
      </div>

    </div>
  );
};

export default ReviewStep;
