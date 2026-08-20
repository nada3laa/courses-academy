import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Megaphone, Sigma } from "lucide-react";
import { getPublicBlogPosts, getAssetUrl } from "../../services/APIService"; // ⚠️ عدّل المسار حسب مكان الملف عندك

const FALLBACK_VARIANTS = ["announcement", "math"];

// بيتعرض لما البوست معندوش coverImage جاي من الباك إند
const FallbackCover = ({ variant }) => {
    if (variant === "math") {
        return (
            <div className="w-full h-full relative overflow-hidden bg-[#1F2937]">
                <svg
                    className="absolute inset-0 w-full h-full opacity-70"
                    viewBox="0 0 400 200"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <rect width="400" height="200" fill="#1F2937" />
                    <text x="30" y="45" fill="#9CA3AF" fontSize="22" fontFamily="serif">
                        (a-b)²
                    </text>
                    <text x="30" y="90" fill="#9CA3AF" fontSize="20" fontFamily="serif">
                        y = ax + b
                    </text>
                    <line x1="30" y1="100" x2="130" y2="100" stroke="#6B7280" strokeWidth="1" />
                    <text x="35" y="125" fill="#9CA3AF" fontSize="18" fontFamily="serif">
                        Δy / Δx
                    </text>
                    <text x="220" y="60" fill="#9CA3AF" fontSize="20" fontFamily="serif">
                        a² + b²
                    </text>
                    <text x="220" y="140" fill="#9CA3AF" fontSize="18" fontFamily="serif">
                        = c²
                    </text>
                    <line x1="0" y1="0" x2="400" y2="200" stroke="#374151" strokeWidth="2" opacity="0.4" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <Sigma className="w-14 h-14 text-white/20" strokeWidth={1.5} />
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full relative overflow-hidden bg-linear-to-br from-[#123C91] to-[#5B21B6]">
            <div className="absolute inset-0 flex items-center justify-center">
                <Megaphone className="w-14 h-14 text-white/25" strokeWidth={1.5} />
            </div>
        </div>
    );
};

const CoverImage = ({ post, fallbackVariant }) => {
    const url = getAssetUrl(post.coverImage);

    if (!url) return <FallbackCover variant={fallbackVariant} />;
    
    return (
        <div className="w-full h-full relative">
            <img
                key={`${post._id}-${url}`}
                src={url}
                alt={post.title}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                    e.currentTarget.style.display = "none";
                }}
            />
        </div>
    );
};

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

const getPostExcerpt = (post, maxLength = 150) => {
    const source = post?.description || post?.content || "";
    const plainText = source
        .replace(/<[^>]*>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    if (plainText.length <= maxLength) return plainText;
    return `${plainText.slice(0, maxLength).trim()}...`;
};

const BlogSection = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const loadPosts = async () => {
            try {
                setLoading(true);
                const res = await getPublicBlogPosts({ limit: 3 });
                const data = res?.data?.data ?? [];
                if (isMounted) {
                    setPosts(data.slice(0, 3));
                    setError(null);
                }
            } catch {
                if (isMounted) setError("تعذر تحميل المقالات حاليًا");
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        loadPosts();
        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <section className="py-20 font-sans bg-gray-50" dir="rtl" id="blog">
            <div className="max-w-6xl mx-auto px-4">
                <div className="text-center mb-4 flex items-center justify-center gap-3">
                    <span className="w-8 h-0.5 bg-[#12C6B0]"></span>
                    <span className="font-['IBM_Plex_Sans_Arabic'] text-[14px] text-[#12C6B0] font-semibold">
                        المدونة التعليمية
                    </span>
                    <span className="w-8 h-0.5 bg-[#12C6B0]"></span>
                </div>

                <div className="text-center mb-12">
                    <h2 className="font-['Tajawal'] font-bold text-[48px] text-[#123C91] mb-4">
                        أحدث المقالات
                    </h2>
                    <p className="font-['IBM_Plex_Sans_Arabic'] text-[18px] text-[#1F2937]">
                        نصائح تعليمية، أخبار الأكاديمية، ومحتوى يساعد طلابنا على التفوق
                    </p>
                </div>

                {loading && (
                    <div className="grid md:grid-cols-3 gap-6">
                        {[0, 1, 2].map((i) => (
                            <div
                                key={i}
                                className="h-[380px] rounded-2xl bg-white border border-[#1F293733] animate-pulse"
                            />
                        ))}
                    </div>
                )}

                {!loading && error && (
                    <p className="text-center text-gray-400 font-['IBM_Plex_Sans_Arabic']">{error}</p>
                )}

                {!loading && !error && posts.length === 0 && (
                    <p className="text-center text-gray-400 font-['IBM_Plex_Sans_Arabic']">
                        لا توجد مقالات منشورة حتى الآن
                    </p>
                )}

                {!loading && !error && posts.length > 0 && (
                    <div className="grid md:grid-cols-3 gap-6">
                        {posts.map((post, index) => (
                            <Link
                                key={post._id}
                                to={`/blog/${post.slug}`}
                                className="group bg-white rounded-2xl border border-[#1F293733] overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col"
                            >
                                <div className="h-48 relative">
                                    <CoverImage
                                        post={post}
                                        fallbackVariant={FALLBACK_VARIANTS[index % FALLBACK_VARIANTS.length]}
                                    />
                                    <span className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white text-[12px] px-3 py-1 rounded-full border border-white/30">
                                        {post.category?.name}
                                    </span>
                                </div>

                                <div className="p-6 flex flex-col grow">
                                    <div className="flex items-center justify-between text-[12px] text-gray-500 mb-2 font-['IBM_Plex_Sans_Arabic'] ">
                                        <span className="flex items-center gap-1">
                                            {post.readingTime} دقائق
                                            <svg
                                                className="w-3.5 h-3.5"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                            >
                                                <circle cx="12" cy="12" r="9" />
                                                <path d="M12 7v5l3 3" />
                                            </svg>
                                        </span>
                                        <span>{formatDate(post.publishedAt)}</span>
                                    </div>

                                    <h3 className="font-['Tajawal'] font-bold text-[20px] text-[#1F2937] mb-3 group-hover:text-[#123C91] transition-colors">
                                        {post.title}
                                    </h3>
                                    <p className="font-['IBM_Plex_Sans_Arabic'] text-[14px] leading-7 text-[#1F2937B2] mb-6 grow min-h-[84px] line-clamp-3">
                                        {getPostExcerpt(post)}
                                    </p>

                                    <span className="text-[#123C91] font-bold text-[14px] flex items-center gap-1">
                                        اقرأ المزيد <ArrowLeft size={16} />
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {!loading && !error && posts.length > 0 && (
                    <div className="text-center mt-12">
                        <Link
                            to="/blogs"
                            className="inline-block px-8 py-3 border-2 border-[#E5E5E5] text-[#575F69] rounded-lg font-bold"
                        >
                            عرض كل المقالات
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
};

export default BlogSection;
