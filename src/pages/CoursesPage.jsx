import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, Filter, Minus, Search, SlidersHorizontal } from "lucide-react";
import CourseCard from "../components/courses/CourseCard";
import { fetchPublicCourses } from "../features/course-management/api/coursesApi";

const classifications = ["تقنية", "تأسيس أطفال", "تربية"];
const subjects = ["لغة عربية", "رياضيات", "فيزياء", "كيمياء"];
const stages = ["ابتدائي", "إعدادي", "ثانوي", "جامعي", "غير ذلك"];
const grades = ["الصف الأول الثانوي", "الصف الثاني", "الصف الثالث"];
const languages = ["عربي", "إنجليزي"];
const levels = ["مبتدئ", "متوسط", "متقدم"];
const prices = [
  { value: "free", label: "مجاني" },
  { value: "paid", label: "مدفوع" },
];
const COURSES_PER_PAGE = 3;

const CheckboxGroup = ({ title, items, selected, onToggle }) => (
  <fieldset className="border-b border-[#EDF0F4] pb-5">
    <legend className="mb-3 w-full text-sm font-bold text-[#1F2937]">{title}</legend>
    <div className="space-y-2.5">
      {items.map((item) => {
        const value = typeof item === "string" ? item : item.value;
        const label = typeof item === "string" ? item : item.label;
        return (
          <label key={value} className="flex cursor-pointer items-center gap-2 text-sm text-[#667180]">
            <input
              type="checkbox"
              checked={selected.includes(value)}
              onChange={() => onToggle(value)}
              className="h-4 w-4 accent-[#123C91]"
            />
            {label}
          </label>
        );
      })}
    </div>
  </fieldset>
);

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("popular");
  const [filterOpen, setFilterOpen] = useState(true);
  const [selectedClassifications, setSelectedClassifications] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [selectedStages, setSelectedStages] = useState([]);
  const [selectedGrades, setSelectedGrades] = useState([]);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [selectedLevels, setSelectedLevels] = useState([]);
  const [selectedPrices, setSelectedPrices] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let active = true;
    fetchPublicCourses()
      .then((items) => active && setCourses(items))
      .catch((error) => active && setLoadError(error?.response?.data?.message || "تعذر تحميل الدورات"))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const toggleValue = (setter) => (value) => {
    setter((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  };

  const resetFilters = () => {
    setSelectedClassifications([]);
    setSelectedSubjects([]);
    setSelectedStages([]);
    setSelectedGrades([]);
    setSelectedLanguages([]);
    setSelectedLevels([]);
    setSelectedPrices([]);
  };

  const activeFilterCount =
    selectedClassifications.length +
    selectedSubjects.length +
    selectedStages.length +
    selectedGrades.length +
    selectedLanguages.length +
    selectedLevels.length +
    selectedPrices.length;

  const filteredCourses = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const result = courses.filter((course) => {
      const matchesQuery =
        !normalizedQuery ||
        course.title.toLowerCase().includes(normalizedQuery) ||
        course.instructor.toLowerCase().includes(normalizedQuery);
      const matchesClassification =
        !selectedClassifications.length || selectedClassifications.includes(course.classification);
      const matchesSubject =
        !selectedSubjects.length ||
        selectedSubjects.includes(course.category) ||
        (selectedSubjects.includes("لغة عربية") && course.category === "لغات");
      const matchesStage = !selectedStages.length || selectedStages.includes(course.stage);
      const matchesGrade = !selectedGrades.length || selectedGrades.includes(course.grade);
      const matchesLanguage = !selectedLanguages.length || selectedLanguages.includes(course.language);
      const matchesLevel = !selectedLevels.length || selectedLevels.includes(course.level);
      const matchesPrice =
        !selectedPrices.length ||
        (selectedPrices.includes("free") && course.price === 0) ||
        (selectedPrices.includes("paid") && course.price > 0);
      return (
        matchesQuery &&
        matchesClassification &&
        matchesSubject &&
        matchesStage &&
        matchesGrade &&
        matchesLanguage &&
        matchesLevel &&
        matchesPrice
      );
    });

    return [...result].sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      if (sortBy === "rating") return b.rating - a.rating;
      return b.students - a.students;
    });
  }, [
    courses,
    query,
    selectedClassifications,
    selectedSubjects,
    selectedStages,
    selectedGrades,
    selectedLanguages,
    selectedLevels,
    selectedPrices,
    sortBy,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredCourses.length / COURSES_PER_PAGE));
  const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * COURSES_PER_PAGE,
    currentPage * COURSES_PER_PAGE,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [
    query,
    selectedClassifications,
    selectedSubjects,
    selectedStages,
    selectedGrades,
    selectedLanguages,
    selectedLevels,
    selectedPrices,
    sortBy,
  ]);

  return (
    <div className="min-h-screen bg-white py-14" dir="rtl">
      <div className="mx-auto w-full max-w-[1500px] px-4 md:px-8">
        <header className="mb-10 text-center">
          <h1 className="mb-3 text-3xl font-bold text-[#123C91] md:text-5xl">
            استكشف الدورات التعليمية
          </h1>
          <p className="mx-auto max-w-2xl text-sm leading-7 text-[#657080] md:text-base">
            اكتسب مهارات جديدة وابدأ رحلتك التعليمية مع دورات متنوعة يقدمها أفضل المدرسين.
          </p>
        </header>

        <div className="mb-7 grid gap-3 md:grid-cols-[1fr_220px]">
          <label className="relative block">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8A94A3]" size={18} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="بحث..."
              className="h-12 w-full rounded-lg border border-[#DDE4EC] bg-white pr-12 pl-4 text-right text-sm outline-none focus:border-[#123C91]"
            />
          </label>

          <label className="relative block">
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="h-12 w-full appearance-none rounded-lg border border-[#DDE4EC] bg-white px-4 pl-10 text-sm text-[#556171] outline-none focus:border-[#123C91]"
            >
              <option value="popular">الأكثر شعبية</option>
              <option value="rating">الأعلى تقييماً</option>
              <option value="price-low">السعر: الأقل أولاً</option>
              <option value="price-high">السعر: الأعلى أولاً</option>
            </select>
            <ChevronDown className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8A94A3]" size={17} />
          </label>
        </div>

        <div className={`grid items-start gap-5 ${
          filterOpen ? "lg:grid-cols-[230px_1fr]" : "lg:grid-cols-[56px_1fr]"
        }`}>
          {filterOpen && (
            <aside className="rounded-lg border border-[#DDE4EC] bg-white p-5 shadow-sm lg:sticky lg:top-5">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-base font-bold text-[#1F2937]">
                  <SlidersHorizontal size={18} /> تصفية النتائج
                </h2>
                <button
                  onClick={() => setFilterOpen(false)}
                  className="flex h-7 w-7 items-center justify-center text-[#657080]"
                  aria-label="إغلاق الفلاتر"
                  title="إغلاق الفلاتر"
                >
                  <Minus size={17} />
                </button>
              </div>

              <div className="space-y-5">
                <CheckboxGroup
                  title="التصنيف"
                  items={classifications}
                  selected={selectedClassifications}
                  onToggle={toggleValue(setSelectedClassifications)}
                />
                <CheckboxGroup
                  title="المادة"
                  items={subjects}
                  selected={selectedSubjects}
                  onToggle={toggleValue(setSelectedSubjects)}
                />
                <CheckboxGroup
                  title="المرحلة"
                  items={stages}
                  selected={selectedStages}
                  onToggle={toggleValue(setSelectedStages)}
                />
                <CheckboxGroup
                  title="الصف"
                  items={grades}
                  selected={selectedGrades}
                  onToggle={toggleValue(setSelectedGrades)}
                />
                <CheckboxGroup
                  title="اللغة"
                  items={languages}
                  selected={selectedLanguages}
                  onToggle={toggleValue(setSelectedLanguages)}
                />
                <CheckboxGroup
                  title="المستوى"
                  items={levels}
                  selected={selectedLevels}
                  onToggle={toggleValue(setSelectedLevels)}
                />
                <CheckboxGroup
                  title="السعر"
                  items={prices}
                  selected={selectedPrices}
                  onToggle={toggleValue(setSelectedPrices)}
                />

              </div>

              <button className="mt-6 h-11 w-full rounded-lg bg-[#123C91] text-sm font-bold text-white">
                تطبيق
              </button>
              <button
                onClick={resetFilters}
                className="mt-2 h-11 w-full rounded-lg border border-[#DDE4EC] text-sm font-semibold text-[#657080]"
              >
                إعادة ضبط
              </button>
            </aside>
          )}

          {!filterOpen && (
            <button
              onClick={() => setFilterOpen(true)}
              className="relative flex h-14 w-14 items-center justify-center rounded-xl border border-[#DDE4EC] bg-white text-[#556171] transition-colors hover:border-[#123C91] hover:text-[#123C91]"
              aria-label="فتح الفلاتر"
              title="فتح الفلاتر"
            >
              <Filter size={19} />
              {activeFilterCount > 0 && (
                <span className="absolute -left-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#12AFA0] px-1 text-[10px] text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>
          )}

          <main>
            {loading ? (
              <div className="rounded-lg border border-[#E1E7EF] bg-[#FAFBFD] py-20 text-center text-[#7B8490]">جاري تحميل الدورات...</div>
            ) : loadError ? (
              <div className="rounded-lg border border-red-200 bg-red-50 py-20 text-center text-red-700">{loadError}</div>
            ) : filteredCourses.length ? (
              <div className={`grid gap-5 sm:grid-cols-2 ${filterOpen ? "xl:grid-cols-3" : "lg:grid-cols-3"}`}>
                {paginatedCourses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-[#E1E7EF] bg-[#FAFBFD] py-20 text-center text-[#7B8490]">
                لا توجد دورات مطابقة للفلاتر المختارة.
              </div>
            )}

            {filteredCourses.length > 0 && totalPages > 1 && (
              <nav className="mt-10 flex items-center justify-center gap-1.5" aria-label="صفحات الدورات" dir="rtl">
                <button
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={currentPage === 1}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#DDE4EC] bg-white text-[#657080] disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="الصفحة السابقة"
                >
                  <ChevronRight size={16} />
                </button>

                {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`h-9 min-w-9 rounded-lg border px-2 text-sm font-semibold transition-colors ${currentPage === page
                        ? "border-[#123C91] bg-[#123C91] text-white"
                        : "border-[#DDE4EC] bg-white text-[#556171] hover:border-[#123C91]"
                      }`}
                    aria-current={currentPage === page ? "page" : undefined}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  disabled={currentPage === totalPages}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#DDE4EC] bg-white text-[#657080] disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="الصفحة التالية"
                >
                  <ChevronLeft size={16} />
                </button>
              </nav>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
