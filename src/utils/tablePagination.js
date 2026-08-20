export const TABLE_PAGE_SIZE_STORAGE_KEY = "alacademeya_table_page_size";

export const getSavedPageSize = (fallback = 10) => {
  const saved = Number(localStorage.getItem(TABLE_PAGE_SIZE_STORAGE_KEY));
  return Number.isInteger(saved) && saved > 0 ? saved : fallback;
};
