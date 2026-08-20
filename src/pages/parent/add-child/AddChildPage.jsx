import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StepsNavigation from "../../../components/parent/add-child/StepsNavigation";
import PersonalInfoStep from "../../../components/parent/add-child/PersonalInfoStep";
import AcademicInfoStep from "../../../components/parent/add-child/AcademicInfoStep";
import AccountSetupStep from "../../../components/parent/add-child/AccountSetupStep";
import ReviewStep from "../../../components/parent/add-child/ReviewStep";
import ParentLayout from "../../../components/parent/layout/ParentLayout";
import {
  getCountries,
  getCurriculums,
  getCurriculumStages,
  getStageGrades,
  getAllSubjects,
} from "../../../services/APIService";
import { getArabicCountryName } from "../../../utils/countryName";

const getName = (item) => {
  if (!item) return "";
  if (typeof item.name === "string") return item.name;
  if (typeof item.name === "object")
    return item.name?.ar || item.name?.en || "";
  return "";
};

const stepTitles = {
  1: "المعلومات الشخصية",
  2: "المعلومات الأكاديمية",
  3: "بيانات دخول الطالب",
  4: "المراجعة والإنشاء",
};

const AddChildPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    birthDate: null,
    country: null, // ⬅️ الآن object: { id, code, name } بدل string id
    curriculum: "",
    stage: "",
    grade: "",
    language: "",
    subjects: [],
    username: "",
    password: "",
    passwordConfirm: "",
  });

  const [countriesMap, setCountriesMap] = useState({});
  const [curriculumsMap, setCurriculumsMap] = useState({});
  const [stagesMap, setStagesMap] = useState({});
  const [gradesMap, setGradesMap] = useState({});
  const [subjectsMap, setSubjectsMap] = useState({});

  const handleChange = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleStudentCreated = (studentId) => {
    const selectedSubjects = formData.subjects.map((id) => ({
      id,
      name: subjectsMap[id] || "مادة",
    }));

    navigate(`/parent/students/${studentId}/subscription/packages`, {
      state: {
        parentFlow: true,
        skipProfileCreation: true,
        studentId,
        selectedSubjects,
      },
    });
  };

  const countryId = formData.country?.id;

  useEffect(() => {
    getCountries()
      .then((res) => {
        const list = res.data?.data || res.data || [];
        setCountriesMap(
          Object.fromEntries(list.map((c) => [c.id, getArabicCountryName(c)])),
        );
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!countryId) return;
    getCurriculums(countryId)
      .then((res) => {
        const list = res.data?.data || res.data || [];
        setCurriculumsMap(
          Object.fromEntries(list.map((c) => [c.id, getName(c)])),
        );
      })
      .catch(() => {});
  }, [countryId]);

  useEffect(() => {
    if (!formData.curriculum) return;
    getCurriculumStages(formData.curriculum)
      .then((res) => {
        const list = res.data?.data || res.data || [];
        setStagesMap(Object.fromEntries(list.map((s) => [s.id, getName(s)])));
      })
      .catch(() => {});
  }, [formData.curriculum]);

  useEffect(() => {
    if (!formData.stage) return;
    getStageGrades(formData.stage)
      .then((res) => {
        const list = res.data?.data || res.data || [];
        setGradesMap(Object.fromEntries(list.map((g) => [g.id, getName(g)])));
      })
      .catch(() => {});
  }, [formData.stage]);

  useEffect(() => {
    if (!formData.grade) return;
    getAllSubjects({ grade: formData.grade })
      .then((res) => {
        const list = res.data?.data || res.data || [];
        setSubjectsMap(Object.fromEntries(list.map((s) => [s.id, getName(s)])));
      })
      .catch(() => {});
  }, [formData.grade]);

  return (
    <ParentLayout>
      <div className="max-w-7xl mx-auto px-1 sm:px-6 lg:px-8 py-4 sm:py-6 font-['IBM_Plex_Sans_Arabic']">
        {/* Header */}
        <div className="text-right mb-4 sm:mb-8">
          <h1 className="font-semibold text-[22px] sm:text-[26px] lg:text-[30px] text-[#123C91]">
            إضافة ابن جديد
          </h1>

          <p className="text-[14px] sm:text-[16px] text-[#575F69] mt-2">
            الخطوة {currentStep} من 4 — {stepTitles[currentStep]}
          </p>
        </div>

        <StepsNavigation currentStep={currentStep} />

        <div
          className="
      mt-3 sm:mt-8
      bg-white
      p-3 sm:p-6 lg:p-8
      rounded-xl sm:rounded-2xl lg:rounded-3xl
      border border-[#E5E7EB]
      shadow-sm
    "
        >
          {currentStep === 1 && (
            <PersonalInfoStep
              data={formData}
              onChange={handleChange}
              onNext={() => setCurrentStep(2)}
            />
          )}

          {currentStep === 2 && (
            <AcademicInfoStep
              data={formData}
              onChange={handleChange}
              countryId={countryId}
              onNext={() => setCurrentStep(3)}
              onBack={() => setCurrentStep(1)}
            />
          )}

          {currentStep === 3 && (
            <AccountSetupStep
              data={formData}
              onChange={handleChange}
              onNext={() => setCurrentStep(4)}
              onBack={() => setCurrentStep(2)}
            />
          )}

          {currentStep === 4 && (
            <ReviewStep
              data={formData}
              onBack={() => setCurrentStep(3)}
              onSuccess={handleStudentCreated}
              countriesMap={countriesMap}
              curriculumsMap={curriculumsMap}
              stagesMap={stagesMap}
              gradesMap={gradesMap}
              subjectsMap={subjectsMap}
            />
          )}
        </div>
      </div>
    </ParentLayout>
  );
};

export default AddChildPage;
