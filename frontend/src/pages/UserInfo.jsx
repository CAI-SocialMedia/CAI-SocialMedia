import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import { Avatar } from "../components/Avatar";
import { Calendar, Mail, MapPin } from "lucide-react";
import LoadingSpinner from "../components/common/LoadingSpinner.jsx";

export default function UserInfo() {
    const { user } = useAuth();
    const { userUid } = useParams();
    const [profileUser, setProfileUser] = useState(null);
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);
    const [postCount, setPostCount] = useState(0);
    const [isFollowing, setIsFollowing] = useState(false);
    const [isFollowLoading, setIsFollowLoading] = useState(false);
    const [posts, setPosts] = useState([]);


    const isMyProfile = !userUid || user?.uid === userUid;
    const targetUid = userUid || user?.uid;


    useEffect(() => {
        if (targetUid) {
            fetchProfileUser(targetUid);
            fetchFollowData(targetUid);
            fetchPosts(targetUid);
        }
    }, [targetUid]);


    useEffect(() => {
        if (user && followers.length) {
            setIsFollowing(followers.some(f => f.uid === user.uid));
        }
    }, [followers, user]);

    const fetchProfileUser = async (uid) => {
        try {
            const res = await api.get(`/user/public/${uid}`);
            setProfileUser(res.data.Data);
        } catch (err) {
            console.error("Kullanıcı bilgileri alınamadı", err);
        }
    };

    const fetchFollowData = async (uid) => {
        try {
            const [followersRes, followingRes] = await Promise.all([
                api.get(`/follow/followers/${uid}`),
                api.get(`/follow/following/${uid}`)
            ]);
            setFollowers(followersRes.data.Data);
            setFollowing(followingRes.data.Data);
        } catch (err) {
            console.error("Takip verileri alınamadı", err);
        }
    };

    const fetchPosts = async (uid) => {
        try {
            const res = await api.get(`/post/${uid}`);
            const data = res.data.Data || [];

            const sorted = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            setPosts(sorted);
            setPostCount(sorted.length);
        } catch (err) {
            console.error("Gönderiler alınamadı", err);
        }
    };


    const handleFollowToggle = async () => {
        setIsFollowLoading(true);

        // Optimistic: UI'da anında yansıt
        setIsFollowing(prev => !prev);
        setFollowers(prev => {
            if (isFollowing) {
                // Takipten çıkarılıyorsa takipçiden sil
                return prev.filter(f => f.uid !== user.uid);
            } else {
                // Takip ediliyorsa geçici olarak listeye ekle
                return [...prev, { uid: user.uid }];
            }
        });

        try {
            if (isFollowing) {
                await api.delete(`/follow/${targetUid}`);
            } else {
                await api.post(`/follow/${targetUid}`);
            }
        } catch (err) {
            console.error("Takip işlemi başarısız", err);
            setIsFollowing(prev => !prev);
            setFollowers(prev => {
                if (!isFollowing) {
                    return prev.filter(f => f.uid !== user.uid);
                } else {
                    return [...prev, { uid: user.uid }];
                }
            });
        } finally {
            setIsFollowLoading(false);
        }
    };


    if (!profileUser) {
        return <LoadingSpinner />;
    }

    return (
        <div className="w-full max-w-4xl animate-fadeIn mx-auto space-y-10">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 relative">

                {/* Avatar ve Takip Butonu */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <Avatar user={profileUser} size="xlg" />
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                                {profileUser.displayName || "Anonymous"}
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400">@{profileUser.username}</p>
                        </div>
                    </div>

                    {!isMyProfile && (
                        <button
                            onClick={handleFollowToggle}
                            disabled={isFollowLoading}
                            className={`px-5 py-2 rounded-full font-medium transition-colors text-sm ${
                                isFollowing
                                    ? "bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-white"
                                    : "bg-purple-600 hover:bg-purple-700 text-white"
                            } ${isFollowLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                            {isFollowLoading
                                ? "Yükleniyor..."
                                : isFollowing
                                    ? "Takipten Çıkar"
                                    : "Takip Et"}
                        </button>
                    )}
                </div>

                {/* Ek Bilgiler */}
                <div className="mt-6 flex flex-wrap gap-6 text-sm text-slate-600 dark:text-slate-400">
                    {profileUser.email && (
                        <div className="flex items-center gap-1">
                            <Mail size={16} />
                            <span>{profileUser.email}</span>
                        </div>
                    )}
                    {profileUser.location && (
                        <div className="flex items-center gap-1">
                            <MapPin size={16} />
                            <span>{profileUser.location}</span>
                        </div>
                    )}
                    {profileUser.createdAt && (
                        <div className="flex items-center gap-1">
                            <Calendar size={16} />
                            <span>
                            Katılım:{" "}
                                {new Date(profileUser.createdAt).toLocaleDateString("tr-TR")}
                        </span>
                        </div>
                    )}
                </div>

                {/* İstatistikler */}
                <div className="mt-6 flex justify-around text-center border-t pt-6 dark:border-slate-700 text-slate-800 dark:text-white">
                    <div>
                        <p className="text-xl font-bold">{postCount}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Gönderi</p>
                    </div>
                    <div>
                        <p className="text-xl font-bold">{followers.length}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Takipçi</p>
                    </div>
                    <div>
                        <p className="text-xl font-bold">{following.length}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Takip</p>
                    </div>
                </div>
            </div>

            {/* Post Grid */}
            {posts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {posts.map((post) => (
                        <div
                            key={post.postUid}
                            className="aspect-square overflow-hidden rounded-xl border border-white/10 bg-white/5 cursor-pointer hover:scale-105 transition-transform"
                            onClick={() => window.location.href = `/post-detail/${post.postUid}`}
                        >
                            <img
                                src={post.imageUrl}
                                alt="Post"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-slate-400 mt-8">Henüz gönderi yok</p>
            )}
        </div>
    );

}
