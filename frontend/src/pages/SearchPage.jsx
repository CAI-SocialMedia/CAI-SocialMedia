import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import api from "../api/axios";
import LoadingSpinner from "../components/common/LoadingSpinner";
import SearchResultCard from "../components/SearchResultCard";
import UserSearchCard from "../components/UserSearchCard";
import { toast } from "sonner";

export default function SearchPage() {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const query = queryParams.get("q");

    const [posts, setPosts] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const [profilePage, setProfilePage] = useState(1);
    const [postPage, setPostPage] = useState(1);

    const PROFILES_PER_PAGE = 5;
    const POSTS_PER_PAGE = 9;

    const loadMoreProfiles = () => {
        setProfilePage((prev) => prev + 1);
    };

    const loadMorePosts = () => {
        setPostPage((prev) => prev + 1);
    };

    useEffect(() => {
        const fetchResults = async () => {
            setLoading(true);
            try {
                const [postRes, userRes] = await Promise.all([
                    api.get(`/post/search?q=${encodeURIComponent(query)}`),
                    api.get(`/user/search?q=${encodeURIComponent(query)}`)
                ]);
                setPosts(postRes.data.Data || []);
                setUsers(userRes.data.Data || []);
            } catch (err) {
                toast.error("Arama yapılırken hata oluştu.");
                console.error(err);
            } finally {
                setLoading(false);
                // Yeni aramada sayfaları başa sar!
                setProfilePage(1);
                setPostPage(1);
            }
        };

        if (query?.trim()) {
            fetchResults();
        } else {
            setPosts([]);
            setUsers([]);
            setLoading(false);
        }
    }, [query]);

    // Gösterilecek verileri hesapla
    const displayedUsers = users.slice(0, profilePage * PROFILES_PER_PAGE);
    const displayedPosts = posts.slice(0, postPage * POSTS_PER_PAGE);

    return (
        <div className="max-w-6xl mx-auto p-4">
            <h2 className="text-2xl font-semibold mb-6 text-center">"{query}" için arama sonuçları</h2>
            {loading ? (
                <div className="flex justify-center items-center min-h-[40vh]">
                    <LoadingSpinner />
                </div>
            ) : (
                <>
                    {/* Profil Sonuçları */}
                    {users.length > 0 && (
                        <div className="mb-10">
                            <h3 className="text-xl font-semibold mb-3">Profiller</h3>
                            <div className="flex flex-wrap-reverse gap-4">
                                {displayedUsers.map((user) => (
                                    <div key={user.userUid} className="w-full max-w-3xl mx-auto">
                                        <UserSearchCard user={user} />
                                    </div>
                                ))}
                            </div>
                            {displayedUsers.length < users.length && (
                                <div className="flex justify-center mt-4">
                                    <button
                                        onClick={loadMoreProfiles}
                                        className="px-4 py-2 text-sm rounded bg-purple-600 text-white hover:bg-purple-700 transition"
                                    >
                                        Daha fazla profil görüntüle
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Gönderi Sonuçları */}
                    {posts.length > 0 ? (
                        <div>
                            <h3 className="text-xl font-semibold mb-3">Gönderiler</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {displayedPosts.map((post) => (
                                    <SearchResultCard key={post.postUid} post={post} />
                                ))}
                            </div>
                            {displayedPosts.length < posts.length && (
                                <div className="flex justify-center mt-4">
                                    <button
                                        onClick={loadMorePosts}
                                        className="px-4 py-2 text-sm rounded bg-purple-600 text-white hover:bg-purple-700 transition"
                                    >
                                        Daha fazla gönderi görüntüle
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        users.length === 0 && (
                            <p className="text-center text-gray-500">Sonuç bulunamadı.</p>
                        )
                    )}
                </>
            )}
        </div>
    );
}
