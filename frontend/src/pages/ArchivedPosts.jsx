import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";

export default function ArchivedPosts() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArchivedPosts = async () => {
            try {
                const response = await api.get("/post/get-archived-posts");
                setPosts(response.data.Data);
            } catch (error) {
                console.error("Arşivlenmiş postlar alınırken hata:", error);
                toast.error("Arşivlenmiş postlar yüklenemedi.");
            } finally {
                setLoading(false);
            }
        };

        fetchArchivedPosts();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <p className="text-gray-500">Yükleniyor...</p>
            </div>
        );
    }

    if (posts.length === 0) {
        return (
            <div className="flex justify-center items-center h-96">
                <p className="text-gray-500">Hiç arşivlenmiş post bulunamadı.</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-4">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent animate-gradient">
                Arşivlenmiş Postlar
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {posts.map(post => (
                    <Link
                        to={`/post-detail/${post.postUid}`}
                        key={post.postUid}
                        className="rounded overflow-hidden shadow hover:shadow-lg transition-shadow duration-200 bg-white dark:bg-slate-800 block"
                    >
                        {/* GÖRSEL ALANI */}
                        <div className="relative w-full aspect-square bg-slate-200 rounded overflow-hidden">
                            <img
                                src={post.imageUrl}
                                alt={post.prompt}
                                className="w-full h-full object-cover"
                            />

                            {/* LIKE COUNT - sağ alt köşe */}
                            <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-white/80 dark:bg-slate-700/80 px-2 py-1 rounded-full text-xs text-slate-700 dark:text-slate-100">
                                <Heart size={14} className="fill-red-500 text-red-500" />
                                {post.likeCount}
                            </div>
                        </div>

                        {/* PROMPT */}
                        <div className="p-2">
                            <p className="text-xs text-gray-600 dark:text-gray-300 truncate">{post.prompt}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
