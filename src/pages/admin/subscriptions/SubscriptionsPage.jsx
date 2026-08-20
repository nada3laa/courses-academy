import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PackagesTab from "../../../components/admin/subscriptions/tabs/PackagesTab";
import DiscountCodesTab from "../../../components/admin/subscriptions/tabs/DiscountCodesTab";
import SubscriptionsTab from "../../../components/admin/subscriptions/tabs/SubscriptionsTab";
import AdminLayout from "../../../components/admin/layout/AdminLayout";
import Breadcrumbs from "../../shared/Breadcrumbs";

const TABS = [
  { key: "packages", label: "الباقات" },
  { key: "discounts", label: "أكواد الخصم" },
  { key: "subscriptions", label: "الاشتراكات" },
];

const SubscriptionsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("packages");
  const [showAddPackage, setShowAddPackage] = useState(false);
  const [showAddDiscount, setShowAddDiscount] = useState(false);

  const tabBtnLabel = {
    packages: "إضافة باقة",
    discounts: "إنشاء كود",
  };

  const handleHeaderBtn = () => {
    if (activeTab === "packages") setShowAddPackage(true);
    if (activeTab === "discounts") setShowAddDiscount(true);
  };

  return (
    <AdminLayout>
       <Breadcrumbs homeTo="/admin-dashboard" />
      <div
        dir="rtl"
        className="w-full max-w-full p-3 sm:p-4 md:p-6 font-['IBM_Plex_Sans_Arabic'] overflow-x-hidden"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between mb-5 sm:mb-6 gap-3">
          <div className="text-right min-w-0">
            <h2 className="font-['IBM_Plex_Sans_Arabic'] font-semibold text-[18px] sm:text-[20px] text-[#1F2937] truncate">
              إدارة الاشتراكات
            </h2>
            <p className="text-[#575F69] text-[13px] sm:text-[14px] mt-0.5">
              الباقات ورموز الخصم والاشتراكات
            </p>
          </div>

          {activeTab === "subscriptions" ? (
            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <button
                onClick={() => navigate("/admin/subscriptions/requests")}
                className="flex-1 sm:flex-none px-5 py-2.5 border border-[#E5E7EB] text-[#374151] rounded-xl font-medium text-[14px] hover:bg-gray-50 active:bg-gray-100 transition-colors whitespace-nowrap"
              >
                طلبات الاشتراك
              </button>
              <button
                onClick={() => navigate("/admin/subscriptions/add")}
                className="flex-1 sm:flex-none px-5 py-2.5 bg-[#123C91] text-white [&_svg]:text-white rounded-xl font-medium text-[14px] hover:bg-[#0f3280] active:bg-[#0c285f] transition-colors whitespace-nowrap"
              >
                إضافة اشتراك
              </button>
            </div>
          ) : (
            <button
              onClick={handleHeaderBtn}
              className="w-full sm:w-auto shrink-0 px-5 py-2.5 bg-[#123C91] text-white [&_svg]:text-white rounded-xl font-medium text-[14px] hover:bg-[#0f3280] active:bg-[#0c285f] transition-colors whitespace-nowrap"
            >
              {tabBtnLabel[activeTab]}
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-0.5 bg-[#F3F4F6] rounded-xl p-1 w-full sm:w-fit mb-5 sm:mb-6 overflow-x-auto no-scrollbar">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex-1 sm:flex-none px-3 py-2 rounded-lg text-[12px] font-medium transition-all whitespace-nowrap ${
                activeTab === t.key
                  ? "bg-white text-[#123C91] shadow-sm"
                  : "text-[#6B7280] hover:text-[#374151]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-w-0">
          {activeTab === "packages" && (
            <PackagesTab
              showAdd={showAddPackage}
              onCloseAdd={() => setShowAddPackage(false)}
            />
          )}
          {activeTab === "discounts" && (
            <DiscountCodesTab
              showAdd={showAddDiscount}
              onCloseAdd={() => setShowAddDiscount(false)}
            />
          )}
          {activeTab === "subscriptions" && <SubscriptionsTab />}
        </div>
      </div>
    </AdminLayout>
  );
};

export default SubscriptionsPage;