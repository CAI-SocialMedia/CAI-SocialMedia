import React, {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import { Avatar } from "./Avatar";
import api from "../api/axios";
import { toast } from "sonner";

/**
 * @param {Object} props
 * @param {Object} props.user - Kullanıcı bilgisi
 */
export default function UserSearchCardNoFollow({ user }) {
    const navigate = useNavigate();

    return (
        <div
            className="flex items-center p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow hover:shadow-md transition cursor-pointer"
            onClick={() => navigate(`/profile/${user.userUid}`)}
        >
            <Avatar user={{ profilePhotoUid: user.profilePhotoUid, displayName: user.displayName }} size="sm" />
            <div className="ml-4">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">{user.displayName}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">@{user.username}</p>
            </div>
        </div>
    );
}
