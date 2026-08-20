import { useState } from "react";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
import {
  TABLE_PAGE_SIZE_STORAGE_KEY,
} from "../../../../utils/tablePagination";

const DEFAULT_PAGE_SIZES = [5, 10, 20, 50];

const Paginationn = ({
  page,
  totalPages,
  onChange,
  totalItems,
  displayedCount,
  unitLabel = "حصة",
  pageSize,
  onPageSizeChange,
  pageSizeOptions = DEFAULT_PAGE_SIZES,
}) => {
  const [customSize, setCustomSize] = useState("");
  const sizes = [...new Set([...DEFAULT_PAGE_SIZES, ...pageSizeOptions])].sort(
    (a, b) => a - b,
  );

  const selectPageSize = (size) => {
    if (!Number.isInteger(size) || size < 1) return;
    localStorage.setItem(TABLE_PAGE_SIZE_STORAGE_KEY, String(size));
    onPageSizeChange?.(size);
  };

  const applyCustomSize = () => {
    const size = Number(customSize);
    if (!Number.isInteger(size) || size < 1) return;
    selectPageSize(size);
    setCustomSize("");
  };

  return (
    <div className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-4 text-sm text-gray-500 shadow-sm">
      <div className="flex flex-col items-center justify-between gap-4 lg:flex-row">
        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <span className="font-medium text-gray-600">
            عرض {displayedCount} من أصل {totalItems} {unitLabel}
          </span>

          {pageSize && onPageSizeChange && (
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="ml-1 font-semibold text-gray-700">
                عدد الصفوف:
              </span>
              {sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    selectPageSize(size);
                  }}
                  className={`h-9 min-w-10 rounded-lg px-3 text-sm font-semibold transition-colors ${
                    pageSize === size
                      ? "bg-[#123C91] text-white shadow-sm"
                      : "border border-gray-200 bg-white text-gray-600 hover:border-[#123C91] hover:text-[#123C91]"
                  }`}
                >
                  {size}
                </button>
              ))}
              <div
                className={`flex h-9 overflow-hidden rounded-lg border bg-white ${
                  !sizes.includes(pageSize)
                    ? "border-[#123C91] ring-1 ring-[#123C91]"
                    : "border-gray-200"
                }`}
              >
                <input
                  type="number"
                  min="1"
                  inputMode="numeric"
                  value={customSize}
                  onChange={(event) => setCustomSize(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      applyCustomSize();
                    }
                  }}
                  placeholder={
                    !sizes.includes(pageSize) ? String(pageSize) : "رقم"
                  }
                  aria-label="عدد صفوف مخصص"
                  className="w-16 px-2 text-center text-sm text-gray-700 outline-none"
                />
                <button
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    applyCustomSize();
                  }}
                  disabled={!Number.isInteger(Number(customSize)) || Number(customSize) < 1}
                  className="bg-[#123C91] px-3 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  تطبيق
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-1">
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              onChange(Math.max(1, page - 1));
            }}
            disabled={page === 1}
            aria-label="الصفحة السابقة"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 transition-all hover:bg-gray-50 disabled:opacity-40"
          >
            <HiChevronRight size={20} />
          </button>

          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index + 1}
              type="button"
              onClick={(event) => {
                event.preventDefault();
                onChange(index + 1);
              }}
              className={`h-9 w-9 shrink-0 rounded-lg text-sm font-semibold transition-all ${
                page === index + 1
                  ? "bg-[#123C91] text-white shadow-sm"
                  : "border border-gray-200 text-gray-600 hover:bg-gray-100"
              }`}
            >
              {index + 1}
            </button>
          ))}

          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              onChange(Math.min(totalPages, page + 1));
            }}
            disabled={page === totalPages}
            aria-label="الصفحة التالية"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 transition-all hover:bg-gray-50 disabled:opacity-40"
          >
            <HiChevronLeft size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Paginationn;
