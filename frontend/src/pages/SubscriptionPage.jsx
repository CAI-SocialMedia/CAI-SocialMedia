import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import api from "../api/axios";
import { Check, X } from "lucide-react";

export default function SubscriptionPage() {
    const [currentPlan, setCurrentPlan] = useState("");
    const plans = [
        {
            type: "FREE",
            name: "Free Plan",
            dailyQuota: 1,
            features: [
                { name: "Günde 1 görsel oluşturma hakkı", available: true },
                { name: "Standart topluluk erişimi", available: true },
                { name: "Profil özelleştirme (fotoğraf, kullanıcı adı)", available: true },
                { name: "Arşivleme özelliği", available: true },
                { name: "Favorilere ekleme", available: true },
                { name: "Premium görseller için erişim", available: false },
                { name: "Özel içerik önerileri", available: false },
                { name: "Yüksek çözünürlüklü görseller", available: false },
            ],
        },
        {
            type: "PRO",
            name: "Pro Plan",
            dailyQuota: 3,
            features: [
                { name: "Günde 3 görsel oluşturma hakkı", available: true },
                { name: "Standart topluluk erişimi", available: true },
                { name: "Profil özelleştirme (fotoğraf, kullanıcı adı)", available: true },
                { name: "Arşivleme özelliği", available: true },
                { name: "Favorilere ekleme", available: true },
                { name: "Premium görseller için erişim", available: true },
                { name: "Özel içerik önerileri", available: true },
                { name: "Yüksek çözünürlüklü görseller", available: false },
            ],
        },
        {
            type: "PROPLUS",
            name: "Pro+ Plan",
            dailyQuota: 5,
            features: [
                { name: "Günde 5 görsel oluşturma hakkı", available: true },
                { name: "Standart topluluk erişimi", available: true },
                { name: "Profil özelleştirme (fotoğraf, kullanıcı adı)", available: true },
                { name: "Arşivleme özelliği", available: true },
                { name: "Favorilere ekleme", available: true },
                { name: "Premium görseller için erişim", available: true },
                { name: "Özel içerik önerileri", available: true },
                { name: "Yüksek çözünürlüklü görseller", available: true },
            ],
        },
    ];

    useEffect(() => {
        const fetchCurrentPlan = async () => {
            try {
                const response = await api.get("/user/subscription");
                setCurrentPlan(response.data.Data);
            } catch (err) {
                const errorMsg =
                    err.response?.data?.Message ||
                    "Abonelik bilgileri alınırken hata oluştu.";
                toast.error(errorMsg);
                console.error("Abonelik bilgileri alınamadı:", err);
            }
        };

        fetchCurrentPlan();
    }, []);

    const handleUpgrade = async (newPlan) => {
        try {
            await api.post("/user/subscription/update", {
                subscriptionType: newPlan,
            });
            setCurrentPlan(newPlan);
            toast.success("Abonelik planı başarıyla güncellendi!");
        } catch (err) {
            const errorMsg =
                err.response?.data?.Message ||
                "Abonelik güncellenirken hata oluştu.";
            toast.error(errorMsg);
            console.error("Abonelik güncelleme hatası:", err);
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-4">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent animate-gradient">
                Abonelik Planlarım
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {plans.map((plan) => (
                    <div
                        key={plan.type}
                        className={`rounded shadow hover:shadow-lg transition-shadow duration-200 bg-white dark:bg-slate-900 overflow-hidden p-6 flex flex-col items-center ${
                            currentPlan === plan.type
                                ? "border-2 border-green-500"
                                : "border border-slate-300 dark:border-slate-700"
                        }`}
                    >
                        {currentPlan === plan.type && (
                            <p className="text-green-500 font-semibold mb-2 text-sm">
                                Şu an bu planı kullanıyorsunuz
                            </p>
                        )}

                        <h3 className="text-xl font-bold mb-4">{plan.name}</h3>

                        <p className="text-sm mb-4">
                            Günlük görsel oluşturma hakkı:{" "}
                            <span className="font-semibold text-green-500">
                {plan.dailyQuota}
              </span>
                        </p>

                        <ul className="w-full text-sm mb-4">
                            {plan.features.map((feature, index) => (
                                <li
                                    key={index}
                                    className={`flex items-center gap-2 py-1 ${
                                        !feature.available ? "opacity-40" : ""
                                    }`}
                                >
                                    {feature.available ? (
                                        <Check className="w-4 h-4 text-green-500" />
                                    ) : (
                                        <X className="w-4 h-4 text-red-500" />
                                    )}
                                    {feature.name}
                                </li>
                            ))}
                        </ul>

                        {currentPlan !== plan.type && (
                            <button
                                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors duration-200"
                                onClick={() => handleUpgrade(plan.type)}
                            >
                                Güncelle
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
