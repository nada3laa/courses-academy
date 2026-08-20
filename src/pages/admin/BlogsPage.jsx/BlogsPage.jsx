import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Loader2, AlertTriangle, X, CheckCircle2 } from "lucide-react";
import AdminLayout from "../../../components/admin/layout/AdminLayout";
import Breadcrumbs from "../../shared/Breadcrumbs";
import BlogsStatsBar from "../../../components/admin/blogs/BlogsStatsBar";
import BlogsFilters from "../../../components/admin/blogs/BlogsFilters";
import BlogCard from "../../../components/admin/blogs/BlogCard";
import Paginationn from "../../../components/teacher/groups/students/Paginationn";
import { getSavedPageSize } from "../../../utils/tablePagination";
import LoadingState from "../../../components/shared/LoadingState";
import {
  getBlogPosts,
  getBlogCategories,
  deleteBlogPost,
  getAssetUrl,
} from "../../../services/APIService";

const PAGE_SIZE = 6;

const mapPost = (p) => {
  return {
    ...p,
    id: p.id || p._id,
    title: p.title,
    description: p.description,
    content: p.content,
    status: p.status,
    categoryName: p.category?.name || "—",
    coverImageUrl: getAssetUrl(p.coverImage),
    readingTime: p.readingTime ?? "—",
    date: p.createdAt ? new Date(p.createdAt).toLocaleDateString("en-CA") : "—",
  };
};

const BlogsPage = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("جميع الحالات");
  const [filterCategory, setFilterCategory] = useState("جميع التصنيفات");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(() => getSavedPageSize(PAGE_SIZE));

  // حالات نافذة تأكيد الحذف
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // نظام الـ Toast الاحترافي
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 4000);
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const [postsRes, categoriesRes] = await Promise.all([
        getBlogPosts(),
        getBlogCategories().catch(() => ({ data: { data: [] } })),
      ]);
      setPosts((postsRes.data?.data || []).map(mapPost));
      setCategories(categoriesRes.data?.data || []);
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || "حدث خطأ أثناء تحميل المقالات");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    loadData(); 

    // التقاط إشعار الـ Toast القادم من صفحات الإضافة والتعديل لو تم توجيهه مع الـ state
    // مثال لاستخدام الـ navigate في صفحة الإضافة: navigate('/admin/blogs', { state: { toastMessage: 'تم إضافة المقال بنجاح' } })
    // لكننا سنعتمد هنا بشكل أساسي على الـ Toast الداخلي والتحكم السلس
  }, [loadData]);

  const handleDeleteClick = (post) => {
    setPostToDelete(post);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!postToDelete) return;
    setIsDeleting(true);
    try {
      await deleteBlogPost(postToDelete.id);
      setPosts((prev) => prev.filter((p) => p.id !== postToDelete.id));
      setDeleteModalOpen(false);
      setPostToDelete(null);
      showToast("تم حذف المقال بنجاح", "success");
    } catch (err) {
      showToast(err?.response?.data?.message || "حدث خطأ أثناء حذف المقال", "error");
      setDeleteModalOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const filtered = posts.filter((p) => {
    const matchesSearch = p.title.includes(search) || p.description?.includes(search);
    const matchesStatus =
      filterStatus === "جميع الحالات" ||
      (filterStatus === "published" && p.status === "published") ||
      (filterStatus === "draft" && p.status === "draft");
    const matchesCategory = filterCategory === "جميع التصنيفات" || p.categoryName === filterCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const stats = {
    draft: posts.filter((p) => p.status === "draft").length,
    published: posts.filter((p) => p.status === "published").length,
    total: posts.length,
  };

  return (
    <AdminLayout>
      <Breadcrumbs homeTo="/admin-dashboard" />
      <div className="w-full p-2 font-['IBM_Plex_Sans_Arabic'] text-right relative" dir="rtl">

        {/* 🌟 Toast Notification Container */}
        {toast.show && (
          <div className="fixed top-6 left-6 z-50 flex items-center gap-3 bg-white border border-gray-100 shadow-2xl rounded-2xl px-5 py-4 transition-all transform animate-bounce-in">
            {toast.type === "success" ? (
              <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 size={20} />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} />
              </div>
            )}
            <div>
              <p className="text-sm font-bold text-gray-800">
                {toast.type === "success" ? "تم بنجاح" : "تنبيه"}
              </p>
              <p className="text-xs text-gray-500 font-medium">{toast.message}</p>
            </div>
            <button 
              onClick={() => setToast((prev) => ({ ...prev, show: false }))} 
              className="mr-3 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div className="order-2 sm:order-1">
            <h3 className="text-xl sm:text-[24px] font-semibold leading-8 text-[#123C91] mb-2 sm:mb-3">
              المدونة التعليمية
            </h3>
            <p className="text-sm sm:text-[16px] font-normal leading-6 text-[#575F69]">
              أنشئ وتحكم في المقالات وأخبار الأكاديمية
            </p>
          </div>
          <button
            onClick={() => navigate("/admin/blogs/add")}
            className="order-1 sm:order-2 w-full sm:w-auto px-5 h-12 rounded-lg bg-[#123C91] text-white [&_svg]:text-white flex items-center justify-center gap-2 font-['Tajawal'] font-medium text-[16px] shrink-0"
          >
            <Plus size={18} />
            إضافة مقال جديد
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 bg-[#FFE9E9] text-[#D32F2F] text-sm rounded-lg px-4 py-3 flex justify-between items-center">
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg("")}><X size={16} /></button>
          </div>
        )}

        <div className="mb-6">
          <BlogsStatsBar {...stats} />
        </div>

        <div className="bg-white border border-[#E5E5E5] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.12)] rounded-2xl p-5 w-full mb-4">
          <BlogsFilters
            search={search}
            onSearchChange={(v) => { setSearch(v); setPage(1); }}
            filterStatus={filterStatus}
            onFilterStatusChange={(v) => { setFilterStatus(v); setPage(1); }}
            filterCategory={filterCategory}
            onFilterCategoryChange={(v) => { setFilterCategory(v); setPage(1); }}
            categoryOptions={["جميع التصنيفات", ...categories.map((c) => c.name)]}
          />
        </div>

        {!loading && filtered.length > 0 && (
          <div className="mb-4">
            <Paginationn
              page={page}
              totalPages={totalPages}
              onChange={setPage}
              totalItems={filtered.length}
              displayedCount={paginated.length}
              unitLabel="مقال"
              pageSize={pageSize}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
            />
          </div>
        )}

        {loading ? (
          <LoadingState
            label="جاري تحميل المقالات..."
            className="rounded-2xl border border-gray-200 bg-white shadow-sm"
          />
        ) : paginated.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            {paginated.map((post) => (
              <BlogCard
                key={post.id}
                post={post}
                onEdit={(id) => navigate(`/admin/blogs/${id}/edit`)}
                onDelete={() => handleDeleteClick(post)}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400 py-12">لا توجد مقالات مطابقة</p>
        )}

        {/* نافذة تأكيد الحذف الاحترافية (Professional Delete Modal) */}
        {deleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 text-right transform transition-all">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#FFE9E9] text-[#D32F2F] mx-auto mb-4">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-lg font-bold text-[#1F2937] text-center mb-2 font-['Tajawal']">
                حذف المقال
              </h3>
              <p className="text-sm text-[#575F69] text-center mb-6">
                هل أنت متأكد من رغبتك في حذف المقال{" "}
                <span className="font-semibold text-gray-800">
                  &ldquo;{postToDelete?.title}&rdquo;
                </span>
                ؟ لا يمكن التراجع عن هذا الإجراء بعد إتمامه.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteModalOpen(false)}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-[#E5E5E5] text-[#575F69] font-medium text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#D32F2F] text-white font-medium text-sm hover:bg-[#b52525] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      جاري الحذف...
                    </>
                  ) : (
                    "نعم، حذف المقال"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};

export default BlogsPage;
