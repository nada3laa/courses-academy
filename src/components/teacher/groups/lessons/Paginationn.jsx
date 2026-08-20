import React from 'react';
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";

const Paginationn = ({ page, totalPages, onChange, totalItems, displayedCount, unitLabel = "حصة", pageSize, onPageSizeChange, pageSizeOptions = [5, 10, 20] }) => {
    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0 px-2 py-6 text-sm text-gray-500 w-full" >

            <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start">
                <span className="font-medium text-gray-500 text-xs sm:text-sm text-center sm:text-right">
                    عرض {displayedCount} من اصل {totalItems} {unitLabel}
                </span>
                {pageSize && onPageSizeChange && (
                    <label className="flex items-center gap-2 text-xs text-gray-500">
                        عدد الصفوف
                        <select
                            value={pageSize}
                            onChange={(event) => onPageSizeChange(Number(event.target.value))}
                            className="h-9 rounded-lg border border-gray-200 bg-white px-2 text-sm text-gray-700 outline-none focus:border-[#123C91]"
                        >
                            {[...new Set([pageSize, ...pageSizeOptions])].sort((a, b) => a - b).map((size) => <option key={size} value={size}>{size}</option>)}
                        </select>
                    </label>
                )}
            </div>

            <div className="flex items-center gap-1 flex-wrap justify-center">
                <button
                    onClick={() => onChange(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 transition-all shrink-0"
                >
                    <HiChevronRight size={18} className="sm:size-5" />
                </button>

                {[...Array(totalPages)].map((_, i) => (
                    <button
                        key={i + 1}
                        onClick={() => onChange(i + 1)}
                        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg text-xs sm:text-sm font-semibold transition-all shrink-0 ${page === i + 1
                                ? "bg-[#123C91] text-white [&_svg]:text-white shadow-sm"
                                : "border border-gray-200 hover:bg-gray-100 text-gray-600"
                            }`}
                    >
                        {i + 1}
                    </button>
                ))}

                <button
                    onClick={() => onChange(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 transition-all shrink-0"
                >
                    <HiChevronLeft size={18} className="sm:size-5" />
                </button>
            </div>


        </div>
    );
};

export default Paginationn;
