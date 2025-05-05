export async function fetchUserData(token) {
    const res = await fetch("https://socialmedia-backend-237279331001.europe-west4.run.app/api/user/me", {
        headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) throw new Error("Kullanıcı verisi alınamadı.");
    return res.json();
}
