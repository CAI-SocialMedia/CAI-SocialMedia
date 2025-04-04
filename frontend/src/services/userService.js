export async function fetchUserData(token) {
    const res = await fetch("http://localhost:8042/api/user/me", {
        headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) throw new Error("Kullanıcı verisi alınamadı.");
    return res.json();
}
