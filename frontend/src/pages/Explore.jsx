import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { Heart, User } from "lucide-react";
import LoadingSpinner from "../components/common/LoadingSpinner.jsx";

export default function ExplorePage() {
    const [posts, setPosts] = useState([]);
    const [weeklyPosts, setWeeklyPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchExploreAndWeeklyPosts = async () => {
            try {
                const [exploreRes, weeklyRes] = await Promise.all([
                    api.get("/post/explore"),
                    api.get("/post/week-top")
                ]);

                const exploreData = exploreRes.data.Data;
                const weeklyData = weeklyRes.data.Data;

                setPosts(Array.isArray(exploreData) ? exploreData : []);
                setWeeklyPosts(Array.isArray(weeklyData) ? weeklyData : []);
            } catch (error) {
                console.error("Veriler alınırken hata:", error);
                toast.error("Gönderiler yüklenemedi.");
            } finally {
                setLoading(false);
            }
        };

        fetchExploreAndWeeklyPosts();
    }, []);


    return (
        <div className="space-y-10">
            {loading ? (
                    <LoadingSpinner />
                ) :
                <div className="max-w-6xl mx-auto p-4">
                    {/* Keşfet Başlığı */}
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent animate-gradient">
                        Keşfet
                    </h2>

                    {/* En Çok Beğenilen 5 Görsel */}
                    <h3 className="text-lg font-semibold mb-2 italic text-left text-slate-800 dark:text-slate-100">
                        En Çok Beğenilen 5 Görsel
                    </h3>
                    {posts.length > 0 ? (
                        <div className="flex justify-center gap-4 mb-8">
                            {posts.map(post => (
                                <Link
                                    to={`/post-detail/${post.postUid}`}
                                    key={post.postUid}
                                    className="flex flex-col rounded overflow-hidden shadow hover:shadow-lg transition-shadow duration-200 bg-white dark:bg-slate-800 w-1/5"
                                >
                                    <div className="relative w-full aspect-square bg-slate-200 rounded overflow-hidden">
                                        {post.imageUrl ? (
                                            <img
                                                src={post.imageUrl}
                                                alt={post.prompt || "Gönderi"}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex justify-center items-center h-full text-gray-500">
                                                Görsel Yok
                                            </div>
                                        )}

                                        {/* Profil overlay */}
                                        <div className="absolute top-2 left-2 flex items-center gap-2 bg-black/50 dark:bg-black/50 px-2 py-1 rounded-full">
                                            {post.profilePhotoUid ? (
                                                <img
                                                    src={post.profilePhotoUid}
                                                    alt={post.username || "Kullanıcı"}
                                                    className="w-4 h-4 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-4 h-4 flex items-center justify-center rounded-full bg-white/20 text-white">
                                                    <User size={10} />
                                                </div>
                                            )}
                                            <span className="text-xs font-medium text-white dark:text-slate-100">
                                                @{post.username || "kullanıcı"}
                                            </span>
                                        </div>

                                        {/* Like sayacı */}
                                        <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-white/80 dark:bg-slate-700/80 px-2 py-1 rounded-full text-xs text-slate-700 dark:text-slate-100">
                                            <Heart size={14} className="fill-red-500 text-red-500" />
                                            {post.likeCount}
                                        </div>
                                    </div>

                                    <div className="p-2 flex-1 flex items-center justify-center">
                                        <p className="text-xs text-gray-600 dark:text-gray-300 text-center line-clamp-2">
                                            {post.prompt || "Prompt yok"}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 italic text-center">Gönderi bulunamadı.</p>
                    )}


                    {/* Haftanın En Çok Beğenilen Görselleri */}
                    <h3 className="text-lg font-semibold mb-2 italic text-left text-slate-800 dark:text-slate-100">
                        Haftanın En Çok Beğenilen Görselleri
                    </h3>
                    {weeklyPosts.length > 0 ? (
                        <div className="flex justify-center gap-4 mb-8">
                            {weeklyPosts.map(post => (
                                <Link
                                    to={`/post-detail/${post.postUid}`}
                                    key={post.postUid}
                                    className="flex flex-col rounded overflow-hidden shadow hover:shadow-lg transition-shadow duration-200 bg-white dark:bg-slate-800 w-1/5"
                                >
                                    <div className="relative w-full aspect-square bg-slate-200 rounded overflow-hidden">
                                        {post.imageUrl ? (
                                            <img
                                                src={post.imageUrl}
                                                alt={post.prompt || "Gönderi"}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex justify-center items-center h-full text-gray-500">
                                                Görsel Yok
                                            </div>
                                        )}

                                        {/* Profil overlay */}
                                        <div className="absolute top-2 left-2 flex items-center gap-2 bg-black/50 dark:bg-black/50 px-2 py-1 rounded-full">
                                            {post.profilePhotoUid ? (
                                                <img
                                                    src={post.profilePhotoUid}
                                                    alt={post.username || "Kullanıcı"}
                                                    className="w-4 h-4 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-4 h-4 flex items-center justify-center rounded-full bg-white/20 text-white">
                                                    <User size={10} />
                                                </div>
                                            )}
                                            <span className="text-xs font-medium text-white dark:text-slate-100">
                                                @{post.username || "kullanıcı"}
                                            </span>
                                        </div>

                                        <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-white/80 dark:bg-slate-700/80 px-2 py-1 rounded-full text-xs text-slate-700 dark:text-slate-100">
                                            <Heart size={14} className="fill-red-500 text-red-500" />
                                            {post.likeCount}
                                        </div>
                                    </div>
                                    <div className="p-2 flex-1 flex items-center justify-center">
                                        <p className="text-xs text-gray-600 dark:text-gray-300 text-center line-clamp-2">
                                            {post.prompt || "Prompt yok"}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 italic text-center">Bu hafta gönderi yok.</p>
                    )}
                </div>
            }
        </div>
    );
}