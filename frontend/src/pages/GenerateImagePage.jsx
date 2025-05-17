import React, { useState } from 'react';
import { Sparkles, Wand2, Share2 } from 'lucide-react';
import { Button } from '../components/ui/Button.jsx';
import api from "../api/axios";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function GenerateImagePage() {
    const [prompt, setPrompt] = useState('');
    const [caption, setCaption] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedImage, setGeneratedImage] = useState(null);
    const navigate = useNavigate();

    const handleGenerate = async () => {
        if (prompt.trim().length < 8) {
            toast.error("Lütfen en az 8 karakter uzunluğunda bir açıklama girin.");
            return;
        }

        try {
            setIsGenerating(true);

            const response = await api.post('/images/generate', { prompt, caption });
            const post = response.data.Data;

            setGeneratedImage({
                url: post.imageUrl,
                prompt: post.prompt,
                postUid: post.postUid,
                isArchived: post.isArchived
            });
        } catch (error) {
            console.error('Görsel oluşturulurken hata:', error);
            toast.error('Görsel oluşturulamadı.');
        } finally {
            setIsGenerating(false);
        }
    };


    const handlePublish = async () => {
        try {
            // Önce caption güncelle
            await api.put(`/post/update-caption`, { caption }, {
                params: { postUid: generatedImage.postUid }
            });

            // Sonra paylaş (isArchived=false yap)
            await api.post(`/post/toggle-post`, null, {
                params: { postUid: generatedImage.postUid },
            });

            toast.success("Gönderi paylaşıldı.");
            navigate("/");
        } catch (err) {
            toast.error("Gönderi paylaşılırken hata oluştu.");
        }
    };

    const handleToggleArchiveLocal = async () => {
        try {
            await api.put(`/post/update-caption`, { caption }, {
                params: { postUid: generatedImage.postUid }
            });

            toast.success("Gönderiniz başarıyla arşivlendi.");
            navigate("/");
        } catch (err) {
            toast.error("Gönderi paylaşılırken hata oluştu.");
        }
    };

    return (
        <div className="space-y-4">
            <section className="mb-6">
                <div className="flex flex-col lg:flex-row gap-8 items-center">
                    <div className="w-full">
                        <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent animate-gradient">
                            Hayalini Resme Dönüştür
                        </h1>
                        <p className="text-lg text-slate-600 dark:text-slate-300 mb-2">
                            Hayal gücünü anlat, yapay zekamız sözcüklerini büyüleyici görsellere dönüştürsün.
                            Fantastik manzaralardan geleceğin dünyalarına kadar her şey mümkün.
                        </p>
                    </div>
                </div>
            </section>

            <div className="bg-slate-800/60 backdrop-blur-md rounded-xl p-8 border border-slate-700 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-purple-400"/>
                        Sen Yaz Biz Oluşturalım!
                    </h2>
                </div>

                <div className="space-y-4">
                    {generatedImage ? (
                        <>
                            <div className="w-full flex justify-center">
                                <img
                                    src={generatedImage.url}
                                    alt={generatedImage.prompt}
                                    className="max-w-[512px] w-full h-auto object-cover rounded-md"
                                />
                            </div>

                            <textarea
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                                placeholder="Gönderinize bir açıklama ekleyin..."
                                className="w-full bg-slate-900/70 text-slate-200 rounded-lg py-2 px-4"
                            />

                            <div className="flex flex-col sm:flex-row gap-2 mt-4">
                                <Button variant="primary" className="flex-1" onClick={handlePublish}>
                                    <Share2 className="h-4 w-4 mr-2" />
                                    Paylaş
                                </Button>

                                <Button variant="outline" className="flex-1" onClick={handleToggleArchiveLocal}>
                                    <Sparkles className="h-4 w-4 mr-2" />
                                    Arşivle
                                </Button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="relative">
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Oluşturmak istediğin görseli anlat..."
                                className="w-full bg-slate-900/70 mb-4 text-slate-200 rounded-lg py-3 px-4 min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                            />
                                {prompt && (
                                    <button
                                        onClick={() => setPrompt('')}
                                        className="absolute right-3 top-3 rounded-full text-slate-400 hover:text-slate-200 hover:bg-slate-700/70"
                                    >
                                    </button>
                                )}
                            </div>

                            <Button
                                variant="primary"
                                className="w-full"
                                isLoading={isGenerating}
                                onClick={handleGenerate}
                                disabled={prompt.trim().length < 8 || isGenerating}
                            >
                                <Wand2 className="h-4 w-4 mr-2" />
                                {isGenerating ? 'Oluşturuluyor...' : 'Oluştur'}
                            </Button>


                            {isGenerating && (
                                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-purple-600 to-pink-500 w-1/3 animate-pulse"></div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
