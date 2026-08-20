import { useState } from "react";
import { Info, Plus, Search, ChevronDown, Pencil, Trash2 } from "lucide-react";
import CommissionDonut from "../../../components/admin/course-finances/CommissionDonut";
import EditCommissionRateModal from "../../../components/admin/course-finances/EditCommissionRateModal";
import ExceptionModal from "../../../components/admin/course-finances/ExceptionModal";
import AdminLayout from "../../../components/admin/layout/AdminLayout";
import Breadcrumbs from "../../shared/Breadcrumbs";

// ⚠️ بيانات وهمية - المفروض تتجاب من API زي GET /admin/course-finances/exceptions
const INITIAL_EXCEPTIONS = [
  { id: 1, course: { id: 1, name: "مقدمة في البرمجة", instructor: "سالي السيد", currentRate: 20 }, customRate: 15, reason: "تخصيص نسبة زيادة الإقبال" },
  { id: 2, course: { id: 2, name: "شرح ال Python", instructor: "علي ماهر", currentRate: 20 }, customRate: 12, reason: "إقفال إطلاق تمهيدي لمدة شهر" },
  { id: 3, course: { id: 3, name: "شرح البرمجة", instructor: "قادرة محمد", currentRate: 20 }, customRate: 7, reason: "إطلاق تمهيدي لمدة شهر" },
];

const CommissionSettingsPage = () => {
  const [commissionRate, setCommissionRate] = useState(20);
  const [isEditRateOpen, setIsEditRateOpen] = useState(false);
  const [exceptions, setExceptions] = useState(INITIAL_EXCEPTIONS);
  const [exceptionModal, setExceptionModal] = useState({ open: false, mode: "add", data: null, editId: null });
  const [instructorFilter, setInstructorFilter] = useState("all");
  const [sortFilter, setSortFilter] = useState("newest");
  const [search, setSearch] = useState("");

  const instructors = Array.from(new Set(exceptions.map((e) => e.course.instructor)));

  const filteredExceptions = exceptions.filter((e) => {
    if (instructorFilter !== "all" && e.course.instructor !== instructorFilter) return false;
    if (search.trim() && !e.course.name.includes(search) && !e.course.instructor.includes(search)) return false;
    return true;
  });

  const handleSaveException = (payload) => {
    // ⚠️ لازم تتوصل بـ API فعلي (POST عند الإضافة / PUT عند التعديل)
    if (exceptionModal.mode === "edit" && exceptionModal.editId) {
      setExceptions((prev) =>
        prev.map((e) =>
          e.id === exceptionModal.editId
            ? { ...e, customRate: payload.customRate, reason: payload.reason }
            : e
        )
      );
    } else {
      setExceptions((prev) => [
        ...prev,
        { id: Date.now(), course: payload.course, customRate: payload.customRate, reason: payload.reason },
      ]);
    }
    setExceptionModal({ open: false, mode: "add", data: null, editId: null });
  };

  const handleDeleteException = (id) => {
    // ⚠️ لازم تتوصل بـ API فعلي زي DELETE /admin/course-finances/exceptions/:id
    setExceptions((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <AdminLayout>
      {/* ⚠️ تأكدي من شكل الـ props بتاعة Breadcrumbs عندك (items/crumbs) وعدّليها لو مختلفة */}
      <Breadcrumbs
        homeTo="/admin-dashboard"
        items={[
          { label: "مالية الدورات", to: "/admin/course-finances" },
          { label: "إعدادات العمولة", to: "/admin/course-finances/commission-settings" },
        ]}
      />

      <div dir="rtl" className="p-6 space-y-6 font-['IBM_Plex_Sans_Arabic']">
        <div>
          <h1 className="text-xl font-bold text-gray-800 mb-1">إعدادات العمولة</h1>
          <p className="text-sm text-gray-500">
            تحكم في نسبة عمولة المنصة العامة وخصص نسبة مختلفة لكل دورة عند الحاجة
          </p>
        </div>

        <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 text-[#123C91] text-sm rounded-xl px-4 py-3">
          <Info size={16} className="mt-0.5 shrink-0" />
          <p>أي تغيير في النسبة يُطبق على كل الدورات الجديدة فقط، ولا يؤثر على العمليات المكتملة سابقًا.</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-2">نسبة عمولة المنصة الحالية</p>
            <button
              onClick={() => setIsEditRateOpen(true)}
              className="text-sm font-semibold text-white bg-[#123C91] hover:bg-[#0e2f73] transition-colors rounded-lg px-4 py-2"
            >
              تعديل النسبة
            </button>
          </div>
          <CommissionDonut percentage={commissionRate} />
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-800">نسب مخصصة لدورات محددة</h2>
            <button
              onClick={() => setExceptionModal({ open: true, mode: "add", data: null, editId: null })}
              className="flex items-center gap-1.5 text-sm font-semibold text-white bg-[#123C91] hover:bg-[#0e2f73] transition-colors rounded-lg px-4 py-2"
            >
              <Plus size={16} />
              إضافة استثناء
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="relative">
              <select
                value={instructorFilter}
                onChange={(e) => setInstructorFilter(e.target.value)}
                className="appearance-none text-sm border border-gray-200 rounded-lg py-2 pr-3 pl-8 text-gray-600 focus:outline-none"
              >
                <option value="all">جميع المحاضرين</option>
                {instructors.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative">
              <select
                value={sortFilter}
                onChange={(e) => setSortFilter(e.target.value)}
                className="appearance-none text-sm border border-gray-200 rounded-lg py-2 pr-3 pl-8 text-gray-600 focus:outline-none"
              >
                <option value="newest">الأحدث أولًا</option>
                <option value="oldest">الأقدم أولًا</option>
              </select>
              <ChevronDown size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative flex-1 min-w-[200px]">
              <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث باسم الدورة أو المحاضر..."
                className="w-full text-sm border border-gray-200 rounded-lg py-2 pr-9 pl-3 focus:outline-none focus:ring-1 focus:ring-[#123C91]"
              />
            </div>
          </div>

          <div className="space-y-1">
            {filteredExceptions.map((e) => (
              <div key={e.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{e.course.name}</p>
                  <p className="text-xs text-gray-400">{e.course.instructor} - {e.reason}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-amber-600 bg-amber-50 rounded-full px-2.5 py-1">
                    {e.customRate}%
                  </span>
                  <span className="text-xs text-gray-400 line-through">{e.course.currentRate}%</span>
                  <button
                    onClick={() =>
                      setExceptionModal({
                        open: true,
                        mode: "edit",
                        editId: e.id,
                        data: { course: e.course, customRate: e.customRate, reason: e.reason },
                      })
                    }
                    className="text-gray-400 hover:text-[#123C91] transition-colors"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteException(e.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
            {filteredExceptions.length === 0 && (
              <p className="text-center text-sm text-gray-400 py-6">لا توجد استثناءات مطابقة</p>
            )}
          </div>
        </div>

        <EditCommissionRateModal
          isOpen={isEditRateOpen}
          currentRate={commissionRate}
          onClose={() => setIsEditRateOpen(false)}
          onSave={(newRate) => {
            // ⚠️ لازم تتوصل بـ API فعلي زي PUT /admin/course-finances/commission-rate
            setCommissionRate(newRate);
            setIsEditRateOpen(false);
          }}
        />

        <ExceptionModal
          isOpen={exceptionModal.open}
          mode={exceptionModal.mode}
          initialData={exceptionModal.data}
          onClose={() => setExceptionModal({ open: false, mode: "add", data: null, editId: null })}
          onSave={handleSaveException}
        />
      </div>
    </AdminLayout>
  );
};

export default CommissionSettingsPage;