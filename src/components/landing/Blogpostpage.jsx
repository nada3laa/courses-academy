import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
    ArrowLeft,
    ArrowRight,
    Megaphone,
    Calendar,
    Clock,
    Eye,
    Share2,
    Link2,
    GraduationCap,
    Check,
} from "lucide-react";
import {
    getPublicBlogPostBySlug,
    getPublicBlogPostsByCategory,
    getAssetUrl,
} from "../../services/APIService"; // ⚠️ عدّل المسار حسب مكان الملف عندك

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

const FallbackCover = () => (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-[#123C91] to-[#5B21B6]">
        <div className="absolute inset-0 flex items-center justify-center">
            <Megaphone className="w-16 h-16 text-white/25" strokeWidth={1.5} />
        </div>
    </div>
);

const CoverImage = ({ post, small }) => {
    const url = getAssetUrl(post.coverImage);
    if (!url) return <FallbackCover />;
    return (
        <div className="w-full h-full relative">
            <img
                src={url}
                alt={post.title}
                className="w-full h-full object-cover"
                loading={small ? "lazy" : undefined}
            />
        </div>
    );
};

const RelatedCard = ({ post }) => (
    <Link
        to={`/blog/${post.slug}`}
        className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow flex flex-col"
    >
        <div className="h-32 relative">
            <CoverImage post={post} small />
        </div>
        <div className="p-4 text-right">
            <h4 className="font-bold text-[15px] text-[#1F2937] mb-2 group-hover:text-[#123C91] transition-colors line-clamp-2">
                {post.title}
            </h4>
            <span className="text-[#123C91] font-bold text-[13px] flex items-center gap-1 w-fit">
                اقرأ المزيد <ArrowLeft size={14} />
            </span>
        </div>
    </Link>
);

// const TeamCard = () => (
//     <div className="bg-[#123C91] text-white rounded-3xl p-6 shadow-sm">
//         <div className="flex items-center gap-4">
//             <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
//                 <GraduationCap className="w-6 h-6 text-white" strokeWidth={1.5} />
//             </div>
//             <div>
//                 <p className="font-bold text-[16px] text-white">فريق الأكاديمية</p>
//                 <p className="text-[13px] text-blue-100">أ. محمد مشرف إداري</p>
//             </div>
//         </div>
//     </div>
// );

const ArticleInfoCard = ({ post }) => (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
        <ul className="space-y-4 text-[14px]">
            <li className="flex items-center justify-between text-gray-500">
                <span className="flex items-center gap-2">
                    <Clock size={16} className="text-[#123C91]" />
                    مدة القراءة
                </span>
                <span className="text-[#1F2937] font-medium">{post.readingTime || 10} دقائق</span>
            </li>
            <li className="flex items-center justify-between text-gray-500">
                <span className="flex items-center gap-2">
                    <Calendar size={16} className="text-[#123C91]" />
                    آخر تحديث
                </span>
                <span className="text-[#1F2937] font-medium">{formatDate(post.publishedAt)}</span>
            </li>
            {typeof post.views === "number" && (
                <li className="flex items-center justify-between text-gray-500">
                    <span className="flex items-center gap-2">
                        <Eye size={16} className="text-[#123C91]" />
                        المشاهدات
                    </span>
                    <span className="text-[#1F2937] font-medium">
                        {post.views.toLocaleString("ar-EG")} قارئ
                    </span>
                </li>
            )}
        </ul>

        <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-[14px] font-bold text-[#1F2937] mb-3">تصنيفات المقال</p>
            <div className="flex flex-wrap gap-2">
                <span className="bg-[#E0F2FE] text-[#0369A1] px-3.5 py-1.5 rounded-full text-[12px] font-semibold">
                    {post.category?.name || "تعليمي"}
                </span>
            </div>
        </div>
    </div>
);

const ShareCard = () => {
    const [copied, setCopied] = useState(false);

    const handleShare = async () => {
        const url = window.location.href;
        if (navigator.share) {
            try {
                await navigator.share({ title: document.title, url });
                return;
            } catch {
                /* المستخدم لغى المشاركة */
            }
        }
        handleCopy();
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            /* تجاهل */
        }
    };

    return (
        <div className="bg-white rounded-3xl border border-gray-100 p-4 shadow-sm flex flex-col gap-2">
            <button
                onClick={handleShare}
                className="w-full flex items-center justify-center gap-2 bg-[#123C91] text-white font-bold text-[14px] py-3 rounded-2xl hover:bg-[#0d2e73] transition-colors shadow-sm"
            >
                <Share2 size={16} />
                مشاركة المقال
            </button>
            <button
                onClick={handleCopy}
                className="w-full flex items-center justify-center gap-2 text-gray-600 font-medium text-[13px] py-2.5 rounded-2xl hover:bg-gray-50 transition-colors"
            >
                {copied ? <Check size={14} className="text-green-600" /> : <Link2 size={14} />}
                {copied ? "تم نسخ الرابط" : "نسخ رابط المقال"}
            </button>
        </div>
    );
};

const BlogPostPage = () => {
    const { slug } = useParams();

    const [post, setPost] = useState(null);
    const [relatedPosts, setRelatedPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const loadPost = async () => {
            setLoading(true);
            setNotFound(false);
            setPost(null);

            try {
                const res = await getPublicBlogPostBySlug(slug);
                const data = res?.data?.data?.blogPost;
                if (!data) throw new Error("not found");
                if (isMounted) setPost(data);

                if (data.category?.slug) {
                    try {
                        const relatedRes = await getPublicBlogPostsByCategory(data.category.slug);
                        const relatedData = relatedRes?.data?.data?.blogPosts ?? [];
                        if (isMounted) {
                            setRelatedPosts(relatedData.filter((p) => p.slug !== slug).slice(0, 3));
                        }
                    } catch {
                        if (isMounted) setRelatedPosts([]);
                    }
                }
            } catch {
                if (isMounted) setNotFound(true);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        loadPost();
        window.scrollTo({ top: 0 });
        return () => {
            isMounted = false;
        };
    }, [slug]);

    if (loading) {
        return (
            <div className="py-12 bg-gray-50 font-sans min-h-[60vh]" dir="rtl">
                <div className="max-w-6xl mx-auto px-4 animate-pulse">
                    <div className="h-4 w-48 bg-gray-200 rounded mb-8" />
                    <div className="h-72 bg-gray-200 rounded-3xl mb-8" />
                    <div className="h-8 w-3/4 bg-gray-200 rounded mb-4" />
                    <div className="h-24 w-full bg-gray-200 rounded-3xl" />
                </div>
            </div>
        );
    }

    if (notFound || !post) {
        return (
            <div className="py-24 bg-gray-50 font-sans text-center" dir="rtl">
                <p className="text-[#1F2937] text-[20px] font-bold mb-4">المقال غير موجود</p>
                <Link to="/blogs" className="text-[#123C91] font-bold flex items-center gap-1 justify-center">
                    <ArrowRight size={16} /> ارجع لكل المقالات
                </Link>
            </div>
        );
    }

    return (
        <article className="py-12 bg-gray-50 font-sans" dir="rtl">
            <div className="max-w-6xl mx-auto px-4">
                {/* Breadcrumb المتوافق مع التصميم */}
                <nav className="flex items-center gap-2 text-[15px] md:text-[16px] text-gray-500 mb-8 font-['IBM_Plex_Sans_Arabic']">
                    <Link to="/" className="hover:text-[#123C91] transition-colors">
                        الرئيسية
                    </Link>
                    <span className="text-gray-300">›</span>
                    <Link to="/blogs" className="hover:text-[#123C91] transition-colors">
                        المدونة
                    </Link>
                    <span className="text-gray-300">›</span>
                    <span className="text-gray-400 truncate max-w-[320px] md:max-w-[480px]">{post.title}</span>
                </nav>

                <div className="grid lg:grid-cols-3 gap-8 items-start">
                    {/* محتوى المقال يمتد على عمودين */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* بطاقة ملخص المقال */}
                        {post.description && (
                            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                                <h3 className="font-['Tajawal'] font-bold text-[18px] text-[#1F2937] mb-2">
                                    ملخص المقال
                                </h3>
                                <p className="font-['IBM_Plex_Sans_Arabic'] text-[15px] text-gray-500 leading-relaxed">
                                    {post.description}
                                </p>
                            </div>
                        )}

                        {/* جسم المقال */}
                        <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                            <h1 className="font-['Tajawal'] font-bold text-[24px] md:text-[28px] text-[#1F2937] mb-6 leading-tight">
                                {post.title}
                            </h1>

                            <div
                                className="prose prose-lg max-w-none font-['IBM_Plex_Sans_Arabic'] text-[#374151] leading-loose
                                           prose-headings:font-['Tajawal'] prose-headings:text-[#123C91] prose-headings:font-bold
                                           prose-a:text-[#123C91] prose-img:rounded-2xl space-y-4"
                                dangerouslySetInnerHTML={{ __html: post.content || "" }}
                            />
                        </div>
                    </div>

                    {/* السايدبار الجانبي */}
                    <aside className="lg:sticky lg:top-6 flex flex-col gap-6">
                        {/* <TeamCard /> */}
                        <ArticleInfoCard post={post} />
                        <ShareCard />
                    </aside>
                </div>
            </div>

            {relatedPosts.length > 0 && (
                <div className="max-w-6xl mx-auto px-4 mt-16">
                    <h2 className="font-['Tajawal'] font-bold text-[26px] text-[#123C91] mb-6 text-center">
                        مقالات ذات صلة
                    </h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {relatedPosts.map((rp) => (
                            <RelatedCard key={rp._id} post={rp} />
                        ))}
                    </div>
                </div>
            )}
        </article>
    );
};

export default BlogPostPage;
