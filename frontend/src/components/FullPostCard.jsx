import React, { useState } from "react";
import { Heart, MessageCircle, Share2, Trash2, Edit, X, HeartPlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import api from "../api/axios.js";
import { Avatar } from "./Avatar.jsx";
import { useNavigate } from "react-router-dom";
import MiniSpinner from "./common/MiniSpinner.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";

/**
 * FullPostCard Bileşeni
 *
 * @param {object} props
 * @param {object} props.post
 * @param {object} props.postOwner
 * @param {object} props.currentUser
 * @param {Array<object>} props.comments
 * @param {boolean} [props.showComments=true]
 * @param {function} [props.onRefresh]
 */
export default function FullPostCard({
                                         post,
                                         postOwner,
                                         currentUser,
                                         comments = [],
                                         showComments = true,
                                         onRefresh,
                                     }) {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [commentText, setCommentText] = useState("");
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [isLiking, setIsLiking] = useState(false);
    const [isCommentSubmitting, setIsCommentSubmitting] = useState(false);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editedText, setEditedText] = useState("");
    const [deletingCommentId, setDeletingCommentId] = useState(null);
    const [showAllComments, setShowAllComments] = useState(false);

    const [localLiked, setLocalLiked] = useState(post.isLikedByMe);
    const [localLikeCount, setLocalLikeCount] = useState(post.likeCount);

    const handleLike = async () => {
        if (!user) {
            toast.info("Bu gönderiyi beğenmek için giriş yapmalısınız!");
            return;
        }

        const optimisticLike = !localLiked;
        setLocalLiked(optimisticLike);
        setLocalLikeCount((prev) => (optimisticLike ? prev + 1 : prev - 1));
        setIsLiking(true);

        try {
            const endpoint = optimisticLike ? "/like/like" : "/like/unlike";
            await api.post(`${endpoint}/${post.postUid}`);
            onRefresh?.();
        } catch (err) {
            setLocalLiked(!optimisticLike);
            setLocalLikeCount((prev) => (optimisticLike ? prev - 1 : prev + 1));
            toast.error("Beğeni işlemi başarısız oldu.");
            console.error("Like operation failed:", err);
        } finally {
            setIsLiking(false);
        }
    };

    /**
     * Yeni bir yorum ekleme işlemini yönetir.
     * @param {Event} e
     */
    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) {
            toast.error("Yorum boş olamaz.");
            return;
        }

        try {
            setIsCommentSubmitting(true);
            await api.post("/comment/add-comment", {
                postUid: post.postUid,
                comment: commentText.trim(),
            });
            setCommentText("");
            toast.success("Yorum başarıyla eklendi!");
            onRefresh?.();
        } catch (err) {
            toast.error("Yorum eklenemedi.");
            console.error("Add comment failed:", err);
        } finally {
            setIsCommentSubmitting(false);
        }
    };

    /**
     * Bir yorumu düzenleme moduna alır.
     * @param {string} commentUid - Düzenlenecek yorumun UID'si.
     */
    const handleEditComment = (commentUid) => {
        const comment = comments.find((c) => c.commentUid === commentUid);
        if (comment) {
            setEditedText(comment.comment);
            setEditingCommentId(commentUid);
        }
    };

    /**
     * Düzenlenmiş yorumu kaydetme işlemini yönetir.
     * @param {string} commentUid - Kaydedilecek yorumun UID'si.
     */
    const handleSaveEditedComment = async (commentUid) => {
        if (editedText.trim().length < 3) {
            toast.error("Yorum en az 3 karakter olmalı.");
            return;
        }

        try {
            setIsCommentSubmitting(true);
            await api.put(`/comment/${commentUid}`, { comment: editedText.trim() });
            toast.success("Yorum başarıyla güncellendi!");
            setEditingCommentId(null);
            setEditedText("");
            onRefresh?.();
        } catch (err) {
            toast.error("Yorum güncellenemedi.");
            console.error("Save edited comment failed:", err);
        } finally {
            setIsCommentSubmitting(false);
        }
    };

    /**
     * Bir yorumu silme işlemini yönetir.
     * @param {string} commentUid - Silinecek yorumun UID'si.
     */
    const handleDeleteComment = async (commentUid) => {
        try {
            setDeletingCommentId(commentUid);
            await api.post(`/comment/delete/${commentUid}`);
            toast.success("Yorum başarıyla silindi!");
            onRefresh?.();
        } catch (err) {
            toast.error("Yorum silinemedi.");
            console.error("Delete comment failed:", err);
        } finally {
            setDeletingCommentId(null);
        }
    };

    /**
     * Gönderiyi favorilere ekleme veya favorilerden çıkarma işlemini yönetir.
     */
    const handleToggleFavorite = async () => {
        if (!user) {
            toast.info("Bu gönderiyi favorilere eklemek için giriş yapmalısınız!");
            return;
        }
        try {
            await api.post(`/favorite/toggle/${post.postUid}`);
            toast.success("Favori durumu güncellendi!");
            onRefresh?.();
        } catch (err) {
            toast.error("Favori durumu güncellenemedi.");
            console.error("Toggle favorite failed:", err);
        }
    };

    /**
     * Gönderinin bağlantısını panoya kopyalar.
     */
    const handleShare = () => {
        navigator.clipboard.writeText(
            `${window.location.origin}/post-detail/${post.postUid}`
        );
        toast.success("Gönderi bağlantısı panoya kopyalandı!");
    };

    /**
     * Görsel modalının açılıp kapanmasını sağlar.
     */
    const toggleImageModal = () => setIsImageModalOpen((prev) => !prev);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden max-w-4xl mx-auto"
        >
            {/* HEADER: Gönderi Sahibi Bilgileri ve Paylaş Butonu (Sağ Üst) */}
            <div className="p-4 sm:p-6 flex justify-between items-center border-b dark:border-slate-700">
                {/* Gönderi Sahibinin Avatarı ve Adı */}
                <div
                    className="flex items-center gap-4 cursor-pointer"
                    onClick={() => navigate(`/profile/${postOwner.userUid}`)}
                    role="link"
                    aria-label={`${postOwner.displayName} adlı kullanıcının profiline git`}
                >
                    <Avatar user={postOwner} size="md"/>
                    <div>
                        <h2 className="font-bold text-lg text-slate-900 dark:text-white">
                            {postOwner.displayName}
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {new Date(post.createdAt).toLocaleString("tr-TR", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                        </p>
                    </div>
                </div>

                {/* PAYLAŞ BUTONU - Sağda hizalanmış */}
                <button
                    onClick={handleShare}
                    className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                    title="Gönderiyi paylaş"
                    aria-label="Gönderiyi paylaş"
                >
                    <Share2 size={20} className="text-slate-600 dark:text-slate-300"/>
                </button>

            </div>


            {/* GÖRSEL ALANI: Gönderi Görseli ve Favori Butonu (Sağ Alt) */}
            <div className="relative bg-slate-50 dark:bg-slate-900 flex justify-center">
                <button
                    onClick={toggleImageModal}
                    className="p-0 border-0 bg-transparent cursor-pointer"
                    aria-label="Görseli büyütmek için tıkla"
                >
                    <img
                        src={post.imageUrl}
                        alt="Gönderi Görseli"
                        className="max-h-[600px] object-contain w-full"
                    />
                </button>
            </div>

            {/* GÖRSEL MODALI: Gönderi Görselini Tam Ekranda Görüntüleme */}
            <AnimatePresence>
                {isImageModalOpen && post?.imageUrl && (
                    <motion.div
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        exit={{opacity: 0}}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
                        onClick={toggleImageModal}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Görseli büyük boyutta görüntüle"
                    >
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            className="relative max-w-full max-h-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <img
                                src={post.imageUrl}
                                alt="Büyük Gönderi Görseli"
                                className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-2xl"
                            />
                            {/* Modal Kapatma Butonu */}
                            <button
                                onClick={toggleImageModal}
                                className="absolute top-4 left-1/2 -translate-x-1/2 p-1.5 rounded-full bg-white/70 text-slate-800 backdrop-blur-sm"
                                title="Görseli Kapat"
                                aria-label="Büyük görseli kapat"
                            >
                                <X size={20} />
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* FOOTER: Beğeni, Yorum Sayısı ve Gönderi Açıklaması */}
            <div className="p-4 sm:p-6 space-y-4">
                <div className="flex items-center gap-6">
                    {/* BEĞEN BUTONU */}
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
                            {isLiking ? (
                                <MiniSpinner size={4} color="text-red-500" />
                            ) : (
                                <Heart
                                    size={22}
                                    className={post.isLikedByMe ? "text-red-500 fill-red-500" : ""}
                                />
                            )}
                        </motion.div>
                        <span className="font-medium">{post.likeCount}</span>
                    </motion.button>

                    {/* YORUM SAYISI */}
                    <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                        <MessageCircle size={22} />
                        <span className="font-medium">{post.commentCount}</span>
                    </div>

                    {/* FAVORİ BUTONU - SAĞA YASLANMIŞ */}
                    <div className="ml-auto">
                        <button
                            onClick={handleToggleFavorite}
                            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                            title="Favoriye Ekle/Kaldır"
                            aria-label="Gönderiyi favorilere ekle veya kaldır"
                        >
                            <HeartPlus size={20} className="text-slate-600 dark:text-slate-300" />
                        </button>
                    </div>
                </div>

                {/* Gönderi Açıklaması ve Prompt */}
                <div>
                    <p className="text-slate-700 dark:text-slate-200 text-base leading-relaxed">{post.caption}</p>
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 italic">
                        <span className="font-medium">Prompt:</span> {post.prompt}
                    </p>
                </div>

                {/* --- YORUM BÖLÜMÜ --- */}
                {showComments && (
                    <div className="pt-4 border-t dark:border-slate-700">
                        <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
                            Yorumlar {comments.length > 0 && `(${comments.length})`}
                        </h3>

                        {/* Yorum Ekleme Formu */}
                        {user && ( // Sadece giriş yapmış kullanıcılar yorum yapabilir
                            <form onSubmit={handleAddComment} className="mb-6">
                                <div className="flex items-start gap-3">
                                    {/* Current User Avatarı */}
                                    <Avatar user={currentUser} size="sm"/>
                                    <div className="flex-1">
                            <textarea
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder="Yorumunuzu yazın..."
                                className="w-full p-3 bg-slate-50 dark:bg-slate-700 rounded-lg text-slate-800 dark:text-white border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none min-h-[80px]"
                                required
                                aria-label="Yeni yorum metni"
                            />
                                        <button
                                            type="submit"
                                            disabled={isCommentSubmitting || !commentText.trim()}
                                            className="mt-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 rounded-lg text-white transition-colors flex items-center justify-center gap-2"
                                            aria-label="Yorum gönder"
                                        >
                                            {isCommentSubmitting ? (
                                                <>
                                                    <MiniSpinner size={4}/>
                                                    Gönderiliyor...
                                                </>
                                            ) : (
                                                "Yorum Yap"
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        )}

                        {/* Yorumların Listesi */}
                        <div className="space-y-4">
                            <AnimatePresence>
                                {(showAllComments ? comments : comments.slice(0, 1)).map(
                                    (comment) => (
                                        <motion.div
                                            key={comment.commentUid}
                                            initial={{opacity: 0, y: 10}}
                                            animate={{opacity: 1, y: 0}}
                                            exit={{opacity: 0, y: -10}}
                                            className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg"
                                        >
                                            <div className="flex justify-between items-start">
                                                {/* Yorum Sahibi Bilgisi */}
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Avatar
                                                        user={{
                                                            profilePhotoUid: comment.profilePhotoUid,
                                                            displayName: comment.username,
                                                        }}
                                                        size="sm"
                                                    />
                                                    <div>
                                                        <p className="font-bold text-slate-800 dark:text-white">
                                                            {comment.username}
                                                        </p>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                                            {new Date(comment.createdAt).toLocaleString(
                                                                "tr-TR",
                                                                {
                                                                    day: "numeric",
                                                                    month: "short",
                                                                    hour: "2-digit",
                                                                    minute: "2-digit",
                                                                }
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Yorum Düzenleme ve Silme Butonları (Sadece yorum sahibine gösterilir) */}
                                                {comment.userUid === currentUser?.uid && (
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleEditComment(comment.commentUid)}
                                                            className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                                            title="Yorumu Düzenle"
                                                            aria-label="Yorumu düzenle"
                                                        >
                                                            <Edit
                                                                size={16}
                                                                className="text-slate-600 dark:text-slate-300"
                                                            />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteComment(comment.commentUid)}
                                                            className="p-1.5 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                                                            title="Yorumu Sil"
                                                            aria-label="Yorumu sil"
                                                        >
                                                            {deletingCommentId === comment.commentUid ? (
                                                                <MiniSpinner size={4} color="text-red-500"/>
                                                            ) : (
                                                                <Trash2 size={16} className="text-red-500"/>
                                                            )}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Yorum Metni veya Düzenleme Alanı */}
                                            {editingCommentId === comment.commentUid ? (
                                                <div>
                                          <textarea
                                              value={editedText}
                                              onChange={(e) => setEditedText(e.target.value)}
                                              className="w-full p-2 bg-white dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none min-h-[60px]"
                                              aria-label="Yorumu düzenle"
                                          />
                                                    <button
                                                        onClick={() =>
                                                            handleSaveEditedComment(comment.commentUid)
                                                        }
                                                        className="mt-2 px-3 py-1 bg-green-600 text-white rounded flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700 transition-colors"
                                                        disabled={
                                                            editedText.trim().length < 3 || isCommentSubmitting
                                                        }
                                                        aria-label="Düzenlenen yorumu kaydet"
                                                    >
                                                        {isCommentSubmitting ? (
                                                            <>
                                                                <MiniSpinner size={4} color="text-white"/>
                                                                Kaydediliyor...
                                                            </>
                                                        ) : (
                                                            "Kaydet"
                                                        )}
                                                    </button>
                                                </div>
                                            ) : (
                                                <p className="mt-1 text-slate-700 dark:text-slate-200">
                                                    {comment.comment}
                                                </p>
                                            )}
                                        </motion.div>
                                    )
                                )}
                            </AnimatePresence>

                            {/* Tüm yorumları göster/gizle butonu */}
                            {comments.length > 1 && (
                                <button
                                    onClick={() => setShowAllComments(!showAllComments)}
                                    className="w-full py-2 text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 transition-colors"
                                    aria-label={
                                        showAllComments
                                            ? "Daha az yorum göster"
                                            : `${comments.length - 1} yorum daha göster`
                                    }
                                >
                                    {showAllComments
                                        ? "Daha az yorum göster"
                                        : `${comments.length - 1} yorumu daha göster`}
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
