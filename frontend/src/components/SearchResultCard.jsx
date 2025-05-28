import React from "react";
import { useNavigate } from "react-router-dom";
import { Avatar } from "./Avatar";
import { Heart, MessageCircle } from "lucide-react";

export default function SearchResultCard({ post }) {
    const navigate = useNavigate();

    return (
        <div
            className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate(`/post-detail/${post.postUid}`)}
        >
            <img
                src={post.imageUrl}
                alt="Arama Sonucu Görseli"
                className="w-full h-48 object-cover"
            />

            <div className="p-4 space-y-1">
                <div className="flex items-center gap-2">
                    <Avatar user={post} size="sm" />
                    <div>
                        <p className="font-medium text-sm text-slate-800 dark:text-white">{post.displayName}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">@{post.username}</p>
                    </div>
                </div>

                <p className="text-slate-700 dark:text-slate-200 text-sm line-clamp-2">{post.caption}</p>

                <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-2">
                    <div className="flex items-center gap-1">
                        <Heart size={14} />
                        <span>{post.likeCount}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <MessageCircle size={14} />
                        <span>{post.commentCount}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
