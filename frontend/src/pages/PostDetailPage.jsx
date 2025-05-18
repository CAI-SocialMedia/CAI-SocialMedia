import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import api from "../api/axios";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { toast } from "react-hot-toast";
import FullPostCard from "../components/FullPostCard.jsx";



export default function PostDetailPage() {
    const { postUid } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [isLoading, setIsLoading] = useState(true);
    const [post, setPost] = useState(null);
    const [postOwner, setPostOwner] = useState(null);
    const [comments, setComments] = useState([]);

    const fetchPost = async () => {
        try {
            const response = await api.get(`/post/info/${postUid}`);
            const postData = response.data.Data;

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
            setPostOwner({
                ...data.Data,
                userUid: userUid
            });
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

            <FullPostCard
                post={post}
                postOwner={postOwner}
                currentUser={user}
                comments={comments}
                showComments={true}
                onRefresh={async () => {
                    await fetchPost();
                    await fetchComments();
                }}
            />
        </div>
    );
}