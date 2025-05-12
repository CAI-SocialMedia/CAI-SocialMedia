/**
 * Verilen string'i güvenli bir username'e dönüştürür
 * @param {string} displayName - Dönüştürülecek isim
 * @returns {string} - Güvenli username
 */
export function generateSafeUsername(displayName) {
    if (!displayName) return 'user';

    // Türkçe karakterleri değiştir
    const turkishToEnglish = {
        'ı': 'i', 'ğ': 'g', 'ü': 'u', 'ş': 's', 'ö': 'o', 'ç': 'c',
        'İ': 'I', 'Ğ': 'G', 'Ü': 'U', 'Ş': 'S', 'Ö': 'O', 'Ç': 'C'
    };

    // Tüm karakterleri küçük harfe çevir
    let username = displayName.toLowerCase();

    // Türkçe karakterleri değiştir
    Object.entries(turkishToEnglish).forEach(([turkish, english]) => {
        username = username.replace(new RegExp(turkish, 'g'), english);
    });

    // Sadece harf, rakam ve alt çizgi karakterlerini tut
    username = username.replace(/[^a-z0-9_]/g, '');

    // Boşlukları alt çizgi ile değiştir
    username = username.replace(/\s+/g, '_');

    // Başında veya sonunda alt çizgi varsa kaldır
    username = username.replace(/^_+|_+$/g, '');

    // Eğer username boşsa veya çok kısaysa
    if (!username || username.length < 4) {
        // Rastgele 6 haneli sayı ekle
        const randomNum = Math.floor(100000 + Math.random() * 900000);
        username = `user_${randomNum}`;
    }

    // Maksimum 20 karakter
    return username.substring(0, 20);
} 