import React, { useEffect, useState } from "react";
import api from "../api/axios";
import LoadingSpinner from "../components/common/LoadingSpinner";
import FullPostCard from "../components/FullPostCard.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";


export function Home() {
    const { user } = useAuth();
    const [feedPosts, setFeedPosts] = useState([]);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        const fetchFeed = async () => {
            try {
                const res = await api.get("/post/feed");
                const posts = res.data.Data || [];

                const enriched = await Promise.all(posts.map(async (post) => {
                    const userRes = await api.get(`/user/public/${post.userUid}`);
                    const commentRes = await api.get(`/comment/post/${post.postUid}`);


                    return {
                        post,
                        postOwner: userRes.data.Data,
                        comments: (commentRes.data.Data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
                    };
                }));

                setFeedPosts(enriched);
            } catch (err) {
                console.error("Feed gönderileri alınamadı", err);
            } finally {
                setLoading(false);
            }
        };

        fetchFeed();
    }, []);

    const handleRefreshPost = async (postUid) => {
        try {
            const postRes = await api.get(`/post/info/${postUid}`);
            const userRes = await api.get(`/user/public/${postRes.data.Data.userUid}`);
            const commentRes = await api.get(`/comment/post/${postUid}`);

            const updatedPost = {
                post: postRes.data.Data,
                postOwner: userRes.data.Data,
                comments: (commentRes.data.Data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
            };

            setFeedPosts((prevPosts) =>
                prevPosts.map((item) =>
                    item.post.postUid === postUid ? updatedPost : item
                )
            );
        } catch (err) {
            console.error("Gönderi güncellenemedi", err);
        }
    };


    return (
        <div className="space-y-10">
            {loading ? (
                <LoadingSpinner />
            ) : feedPosts.length === 0 ? (
                <p className="text-center text-slate-400">Henüz gönderi bulunamadı.</p>
            ) : (
                feedPosts.map(({ post, postOwner, comments }) => (
                    <FullPostCard
                        key={post.postUid}
                        post={post}
                        postOwner={{ ...postOwner, userUid: post.userUid }} // userUid ekleniyor
                        currentUser={user}
                        comments={comments}
                        onRefresh={() => handleRefreshPost(post.postUid)}
                    />
                ))
            )}
        </div>
    );
}
