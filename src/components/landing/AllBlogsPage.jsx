import { useEffect, useMemo, useState } from "react";
import { Search, ChevronLeft, ChevronRight, ArrowLeft, Megaphone, Sigma, User, GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";
import {
    getBlogCategories,
    getPublicBlogPosts,
    getPublicBlogPostsByCategory,
    getAssetUrl,
} from "../../services/APIService";

const ALL_CATEGORY_LABEL = "كل المقالات";

// الـ variants الأصلية بتتلف بالدور على البوستات اللي معندهاش coverImage من الباك إند
const FALLBACK_VARIANTS = [
    "announcement",
    "math",
    "avatar",
    "pinkAnnouncement",
    "avatarGray",
    "academy",
];

const POSTS_PER_PAGE = 6;

const formatDate = (isoDate) => {
    if (!isoDate) return "";
    try {
        return new Date(isoDate).toLocaleDateString("ar-EG", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    } catch {
        return isoDate;
    }
};

const getPostExcerpt = (post, maxLength = 120) => {
    const source = post?.description || post?.content || "";
    const plainText = source
        .replace(/<[^>]*>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    if (plainText.length <= maxLength) return plainText;
    return `${plainText.slice(0, maxLength).trim()}...`;
};

const VariantCover = ({ variant, small }) => {
    const iconSize = small ? "w-10 h-10" : "w-14 h-14";

    switch (variant) {
        case "academy":
            return (
                <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-[#0F766E] to-[#0C4A6E]">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-9 h-9 rounded-lg bg-white/90 flex items-center justify-center">
                            <GraduationCap className="w-5 h-5 text-[#0F766E]" strokeWidth={2} />
                        </div>
                    </div>
                </div>
            );

        case "math":
            return (
                <div className="w-full h-full relative overflow-hidden bg-[#1F2937]">
                    <svg className="absolute inset-0 w-full h-full opacity-70" viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
                        <rect width="400" height="200" fill="#1F2937" />
                        <text x="20" y="40" fill="#9CA3AF" fontSize="18" fontFamily="serif">(a-b)²</text>
                        <text x="20" y="80" fill="#9CA3AF" fontSize="16" fontFamily="serif">y = ax + b</text>
                        <line x1="20" y1="88" x2="110" y2="88" stroke="#6B7280" strokeWidth="1" />
                        <text x="24" y="108" fill="#9CA3AF" fontSize="14" fontFamily="serif">Δy / Δx</text>
                        <text x="230" y="55" fill="#9CA3AF" fontSize="16" fontFamily="serif">a² + b²</text>
                        <text x="230" y="125" fill="#9CA3AF" fontSize="14" fontFamily="serif">= c²</text>
                        <line x1="0" y1="0" x2="400" y2="200" stroke="#374151" strokeWidth="2" opacity="0.4" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Sigma className={`${iconSize} text-white/20`} strokeWidth={1.5} />
                    </div>
                </div>
            );

        case "pinkAnnouncement":
            return (
                <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-[#9D174D] to-[#6D28D9]">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Megaphone className={`${iconSize} text-white/25`} strokeWidth={1.5} />
                    </div>
                </div>
            );

        case "avatar":
            return (
                <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-white shadow-inner flex items-center justify-center">
                        <User className="w-8 h-8 text-gray-300" strokeWidth={1.5} />
                    </div>
                </div>
            );

        case "avatarGray":
            return (
                <div className="w-full h-full relative overflow-hidden bg-gray-100 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center">
                        <User className="w-8 h-8 text-gray-100" strokeWidth={1.5} />
                    </div>
                </div>
            );

        case "announcement":
        default:
            return (
                <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-[#123C91] to-[#5B21B6]">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Megaphone className={`${iconSize} text-white/25`} strokeWidth={1.5} />
                    </div>
                </div>
            );
    }
};

// بيعرض صورة الغلاف الحقيقية من الباك إند لو موجودة، وإلا يرجع لنفس الـ variants الأصلية
const CoverImage = ({ post, variant, small }) => {
    const url = getAssetUrl(post?.coverImage);
    if (!url) return <VariantCover variant={variant} small={small} />;
    return (
        <div className="w-full h-full relative">
            <img
                key={`${post._id}-${url}`}
                src={url}
                alt={post.title}
                className="w-full h-full object-cover"
                loading="lazy"
            />
        </div>
    );
};

const BlogCard = ({ post, variant }) => (
    <Link
        to={`/blog/${post.slug}`}
        className="block bg-white rounded-2xl border border-gray-200 overflow-hidden cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#123C91]/30"
    >
        <div className="h-40 relative">
            <CoverImage post={post} variant={variant} small />
            <span className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded border border-white/30">
                {post.category?.name}
            </span>
        </div>
        <div className="p-4 text-right">
            <div className="flex items-center justify-between text-[14px] text-gray-400 mb-2">
                <span>{post.readingTime} دقائق</span>
                <span>{formatDate(post.publishedAt)}</span>
            </div>
            <h3 className="font-bold text-[16px] text-[#1F2937] mb-2">{post.title}</h3>
            <p className="text-[14px] leading-6 text-gray-500 mb-4 min-h-12 line-clamp-2">
                {getPostExcerpt(post)}
            </p>
            <span className="text-[#123C91] font-bold text-[14px] flex items-center gap-1 w-fit">
                اقرأ المزيد <ArrowLeft size={16} />
            </span>
        </div>
    </Link>
);

const AllBlogsPage = () => {
    // ─── الجزء اللي تحت، متربط بالـ API ─────────────────────────────────────
    const [categories, setCategories] = useState([{ _id: "all", name: ALL_CATEGORY_LABEL, slug: "all" }]);
    const [activeCategory, setActiveCategory] = useState(ALL_CATEGORY_LABEL);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // تحميل الأقسام مرة واحدة
    useEffect(() => {
        let isMounted = true;
        getBlogCategories()
            .then((res) => {
                if (!isMounted) return;
                const cats = res?.data?.data ?? [];
                setCategories([{ _id: "all", name: ALL_CATEGORY_LABEL, slug: "all" }, ...cats]);
            })
            .catch(() => {
                /* لو فشل تحميل الأقسام هنفضل شغالين بـ "كل المقالات" بس */
            });
        return () => {
            isMounted = false;
        };
    }, []);

    // تحميل المقالات: كل المقالات، أو مقالات القسم المختار
    useEffect(() => {
        let isMounted = true;
        const activeCategoryObj = categories.find((c) => c.name === activeCategory);
        const categorySlug = activeCategoryObj?.slug ?? "all";

        const loadPosts = async () => {
            try {
                setLoading(true);
                const res =
                    categorySlug === "all"
                        ? await getPublicBlogPosts()
                        : await getPublicBlogPostsByCategory(categorySlug);

                const data =
                    categorySlug === "all"
                        ? res?.data?.data ?? []
                        : res?.data?.data?.blogPosts ?? [];

                if (isMounted) {
                    setPosts(data);
                    setError(null);
                }
            } catch {
                if (isMounted) {
                    setPosts([]);
                    setError("تعذر تحميل المقالات حاليًا");
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        loadPosts();
        return () => {
            isMounted = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeCategory, categories.length]);

    const filteredPosts = useMemo(() => {
        const term = searchTerm.trim();
        if (!term) return posts;
        return posts.filter(
            (post) => post.title?.includes(term) || post.description?.includes(term)
        );
    }, [posts, searchTerm]);

    const totalPages = Math.max(1, Math.ceil(filteredPosts.length / POSTS_PER_PAGE));
    const safePage = currentPage > totalPages ? 1 : currentPage;

    const paginatedPosts = filteredPosts.slice(
        (safePage - 1) * POSTS_PER_PAGE,
        safePage * POSTS_PER_PAGE
    );

    const handleCategoryChange = (catName) => {
        setActiveCategory(catName);
        setSearchTerm("");
        setCurrentPage(1);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const goToPage = (page) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
    };
    // ────────────────────────────────────────────────────────────────────────

    return (
        <div className="py-12 bg-gray-50 font-sans" dir="rtl">
            <div className="max-w-6xl mx-auto px-4">
                <nav
                    aria-label="مسار التنقل"
                    className="flex items-center gap-2 text-[15px] md:text-[16px] text-gray-500 mb-8 font-['IBM_Plex_Sans_Arabic']"
                >
                    <Link to="/" className="hover:text-[#123C91] transition-colors">
                        الرئيسية
                    </Link>
                    <span className="text-gray-300">›</span>
                    <span className="text-gray-400">المدونة</span>
                </nav>

                <h1 className="text-center font-bold text-[40px] text-[#123C91] mb-2">المدونة</h1>
                <p className="text-center text-gray-500 mb-10">
                    مقالات ونصائح تعليمية من خبراء تساعدك على تحقيق أعلى النتائج
                </p>

                <div className="mb-10">
                    <div className="relative mb-6">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            placeholder="ابحث في المقالات..."
                            className="w-full bg-gray-50 border border-gray-200 rounded-full py-3 pr-10 pl-11 text-[14px] text-right placeholder:text-gray-400 focus:outline-none focus:border-[#123C91] focus:bg-white transition-colors"
                        />
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    </div>

                    <div className="flex justify-start gap-2 flex-wrap">
                        {categories.map((cat) => (
                            <button
                                key={cat._id}
                                onClick={() => handleCategoryChange(cat.name)}
                                className={`px-5 py-2 rounded-full text-[13px] font-medium transition-colors ${activeCategory === cat.name
                                    ? "bg-[#123C91] text-white"
                                    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-100"
                                    }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>

                {loading && (
                    <div className="grid md:grid-cols-3 gap-6 mb-12">
                        {[0, 1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="h-72 rounded-2xl bg-white border border-gray-200 animate-pulse" />
                        ))}
                    </div>
                )}

                {!loading && error && (
                    <p className="text-center text-red-400 mb-12">{error}</p>
                )}

                {!loading && !error && paginatedPosts.length > 0 && (
                    <div className="grid md:grid-cols-3 gap-6 mb-12">
                        {paginatedPosts.map((post, index) => (
                            <BlogCard
                                key={post._id}
                                post={post}
                                variant={FALLBACK_VARIANTS[index % FALLBACK_VARIANTS.length]}
                            />
                        ))}
                    </div>
                )}

                {!loading && !error && paginatedPosts.length === 0 && (
                    <p className="text-center text-gray-400 mb-12">لا يوجد مقالات مطابقة للبحث</p>
                )}

                {!loading && totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2">
                        <button
                            onClick={() => goToPage(safePage - 1)}
                            disabled={safePage === 1}
                            className="p-2 rounded-lg border bg-white disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <ChevronRight size={18} />
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() => goToPage(page)}
                                className={`w-8 h-8 rounded-lg ${page === safePage ? "bg-[#123C91] text-white" : "bg-white border"
                                    }`}
                            >
                                {page}
                            </button>
                        ))}
                        <button
                            onClick={() => goToPage(safePage + 1)}
                            disabled={safePage === totalPages}
                            className="p-2 rounded-lg border bg-white disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft size={18} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AllBlogsPage;
