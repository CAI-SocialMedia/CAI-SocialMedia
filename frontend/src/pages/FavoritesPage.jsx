import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { toast } from "sonner";
import { Heart } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function FavoritesPage() {
    const [favorites, setFavorites] = useState([]);
    const { user } = useAuth();

    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                const response = await api.get("/post/favorites");
                setFavorites(response.data.Data);
            } catch (err) {
                const errorMsg =
                    err.response?.data?.Message || "Favoriler alınırken hata oluştu.";
                toast.error(errorMsg);
                console.error("Favoriler alınamadı:", err);
            }
        };

        fetchFavorites();
    }, []);

    return (
        <div className="max-w-6xl mx-auto p-4">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent animate-gradient">
                Favorilerim
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {favorites.map((post) => (
                    <div
                        key={post.postUid}
                        className="rounded shadow hover:shadow-lg transition-shadow duration-200 bg-white dark:bg-slate-900 overflow-hidden"
                    >
                        {/* Görsel + Beğeni sayısı */}
                        <div className="relative w-full aspect-square">
                            {/* Görsele tıklayınca detay sayfasına git */}
                            <Link to={`/post-detail/${post.postUid}`}>
                                <img
                                    src={post.imageUrl}
                                    alt={post.prompt}
                                    className="w-full h-full object-cover"
                                />
                            </Link>

                            {/* Sağ alt köşedeki beğeni */}
                            <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-white/80 dark:bg-slate-700/80 px-2 py-1 rounded-full text-xs text-slate-700 dark:text-slate-100 z-10">
                                <Heart size={14} className="fill-red-500 text-red-500" />
                                {post.likeCount}
                            </div>
                        </div>

                        {/* Prompt */}
                        <div className="p-2">
                            <p className="text-xs text-gray-600 dark:text-gray-300 truncate">
                                {post.prompt}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
