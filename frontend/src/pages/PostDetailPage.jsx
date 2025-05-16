import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, MessageCircle, Trash2, Edit, Share2 } from "lucide-react";
import { Avatar } from "../components/Avatar";
import { useAuth } from "../contexts/AuthContext";
import api from "../api/axios";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function PostDetailPage() {
    const { postUid } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [isLoading, setIsLoading] = useState(true);
    const [post, setPost] = useState(null);
    const [postOwner, setPostOwner] = useState(null);
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState("");
    const [showAllComments, setShowAllComments] = useState(false);
    const [isLiking, setIsLiking] = useState(false);
    const [isCommentSubmitting, setIsCommentSubmitting] = useState(false);

    const fetchPost = async () => {
        try {
            console.log("Gönderi çekiliyor:", postUid);
            const response = await api.get(`/post/info/${postUid}`);
            console.log("API yanıtı:", response);

            const postData = response.data.Data;
            console.log("Post verisi:", postData);

            if (!postData) {
                toast.error("Gönderi bulunamadı veya silinmiş olabilir.");
                setIsLoading(false);
                return;
            }

            setPost(postData);
            await fetchPostOwner(postData.userUid);
        } catch (err) {
            console.error("Post yükleme hatası:", err.response?.data || err.message || err);

            // Daha detaylı hata mesajı gösterelim
            if (err.response?.status === 401) {
                toast.error("Oturum süresi dolmuş olabilir. Lütfen tekrar giriş yapın.");
            } else if (err.response?.status === 404) {
                toast.error("Gönderi bulunamadı veya silinmiş olabilir.");
            } else {
                toast.error(`Gönderi yüklenemedi: ${err.response?.data?.Message || err.message || "Bilinmeyen hata"}`);
            }
        } finally {
            setIsLoading(false);
        }
    };


    const fetchPostOwner = async (userUid) => {
        try {
            const { data } = await api.get(`/user/public/${userUid}`);
            setPostOwner(data.Data);
        } catch (err) {
            console.error("Kullanıcı bilgisi yüklenemedi", err);
            toast.error("Kullanıcı bilgisi alınamadı");
        }
    };


    const fetchComments = async () => {
        try {
            const { data } = await api.get(`/comment/post/${postUid}`);
            const sorted = data.Data.sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );
            setComments(sorted);
        } catch (err) {
            console.error("Yorumlar yüklenemedi", err);
            toast.error("Yorumlar yüklenemedi");
        }
    };


    const handleLike = async () => {
        if (!user) return;

        try {
            setIsLiking(true);
            if (post.isLikedByMe) {
                await api.post(`/like/unlike/${postUid}`);
                toast.success("Beğeni kaldırıldı");
            } else {
                await api.post(`/like/like/${postUid}`);
                toast.success("Gönderi beğenildi");
            }
            await fetchPost();
        } catch (err) {
            console.error("Beğeni işlemi başarısız", err);
            toast.error("Beğeni işlemi başarısız oldu");
        } finally {
            setIsLiking(false);
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();

        if (commentText.trim()) {
            try {
                setIsCommentSubmitting(true);
                await api.post(`/comment/add-comment`, {
                    postUid,
                    comment: commentText
                });
                setCommentText("");
                toast.success("Yorum eklendi");
                await fetchComments();
                await fetchPost();
            } catch (err) {
                console.error("Yorum eklenemedi", err);
                toast.error("Yorum eklenemedi");
            } finally {
                setIsCommentSubmitting(false);
            }
        }
    };

    const handleDeleteComment = async (commentUid) => {
        try {
            await api.post(`/comment/delete/${commentUid}`);
            toast.success("Yorum silindi");
            await fetchComments();
            await fetchPost();
        } catch (err) {
            console.error("Yorum silinemedi", err);
            toast.error("Yorum silinemedi");
        }
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success("Bağlantı kopyalandı!");
    };

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchPost();
        fetchComments();
    }, [postUid]);

    if (isLoading) return (
        <div className="flex justify-center items-center min-h-[calc(100vh-5rem)]">
            <LoadingSpinner />
        </div>
    );

    if (!post || !postOwner) return (
        <div className="flex flex-col justify-center items-center min-h-[calc(100vh-5rem)]">
            <h2 className="text-xl font-semibold mb-2">Gönderi bulunamadı</h2>
            <button
                onClick={() => navigate("/")}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white mt-4"
            >
                Ana Sayfaya Dön
            </button>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6">
            <button
                onClick={() => navigate(-1)}
                className="mb-6 flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            >
                <ArrowLeft size={18} /> Geri
            </button>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden"
            >
                <div className="p-4 sm:p-6 flex items-center gap-4 border-b dark:border-slate-700">
                    <Avatar user={postOwner} size="md" />
                    <div className="flex-1">
                        <h2 className="font-bold text-lg text-slate-900 dark:text-white">{postOwner.displayName}</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{new Date(post.createdAt).toLocaleString("tr-TR")}</p>
                    </div>
                    <button
                        onClick={handleShare}
                        className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        aria-label="Paylaş"
                    >
                        <Share2 size={20} className="text-slate-600 dark:text-slate-300" />
                    </button>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900 flex justify-center">
                    <img
                        src={post.imageUrl}
                        alt="Gönderi"
                        className="max-h-[600px] object-contain"
                        loading="lazy"
                    />
                </div>

                <div className="p-4 sm:p-6 space-y-4">
                    <div className="flex items-center gap-4">
                        <motion.button
                            onClick={handleLike}
                            className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300"
                            whileTap={{ scale: 0.95 }}
                            disabled={isLiking}
                        >
                            <motion.div
                                animate={post.isLikedByMe ? { scale: [1, 1.3, 1] } : {}}
                                transition={{ duration: 0.3 }}
                            >
                                <Heart
                                    size={22}
                                    className={post.isLikedByMe ? "text-red-500 fill-red-500" : ""}
                                />
                            </motion.div>
                            <span className="font-medium">{post.likeCount}</span>
                        </motion.button>

                        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <MessageCircle size={22} />
                            <span className="font-medium">{post.commentCount}</span>
                        </div>
                    </div>

                    <div>
                        <p className="text-slate-700 dark:text-slate-200 text-base leading-relaxed">{post.caption}</p>
                        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 italic">
                            <span className="font-medium">Prompt:</span> {post.prompt}
                        </p>
                    </div>

                    <div className="pt-4 border-t dark:border-slate-700">
                        <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
                            Yorumlar {comments.length > 0 && `(${comments.length})`}
                        </h3>

                        <form onSubmit={handleAddComment} className="mb-6">
                            <div className="flex items-start gap-3">
                                <Avatar user={user} size="sm" />
                                <div className="flex-1">
                                    <textarea
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        placeholder="Yorumunuzu yazın..."
                                        className="w-full p-3 bg-slate-50 dark:bg-slate-700 rounded-lg text-slate-800 dark:text-white border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none min-h-[80px]"
                                        required
                                    />
                                    <button
                                        type="submit"
                                        disabled={isCommentSubmitting || !commentText.trim()}
                                        className="mt-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 rounded-lg text-white transition-colors"
                                    >
                                        {isCommentSubmitting ? "Gönderiliyor..." : "Yorum Yap"}
                                    </button>
                                </div>
                            </div>
                        </form>

                        {comments.length === 0 ? (
                            <p className="text-slate-500 dark:text-slate-400 text-center py-6">
                                Henüz yorum yok. İlk yorumu sen yap!
                            </p>
                        ) : (
                            <div className="space-y-4">
                                <AnimatePresence>
                                    {(showAllComments ? comments : comments.slice(0, 3)).map(comment => (
                                        <motion.div
                                            key={comment.commentUid}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg"
                                        >
                                            <div className="flex justify-between">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Avatar
                                                        user={{
                                                            profilePhotoUid: comment.profilePhotoUid,
                                                            displayName: comment.username
                                                        }}
                                                        size="sm"
                                                    />
                                                    <div>
                                                        <p className="font-bold text-slate-800 dark:text-white">{comment.username}</p>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                                            {new Date(comment.createdAt).toLocaleString("tr-TR", {
                                                                day: "numeric",
                                                                month: "short",
                                                                hour: "2-digit",
                                                                minute: "2-digit"
                                                            })}
                                                        </p>
                                                    </div>
                                                </div>

                                                {comment.userUid === user?.uid && (
                                                    <div className="flex gap-2">
                                                        <button className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                                                            <Edit size={16} className="text-slate-600 dark:text-slate-300" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteComment(comment.commentUid)}
                                                            className="p-1.5 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                                                        >
                                                            <Trash2 size={16} className="text-red-500" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                            <p className="mt-1 text-slate-700 dark:text-slate-200">{comment.comment}</p>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                {comments.length > 3 && (
                                    <button
                                        onClick={() => setShowAllComments(!showAllComments)}
                                        className="w-full py-2 text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 transition-colors"
                                    >
                                        {showAllComments
                                            ? "Daha az yorum göster"
                                            : `${comments.length - 3} yorum daha göster`}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}