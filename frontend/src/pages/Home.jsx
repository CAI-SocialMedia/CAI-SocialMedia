
export const Home = () => {

    return (
        <div className="space-y-8">
            {/* Hero section with prompt */}
            <section className="mb-12">
                <div className="flex flex-col lg:flex-row gap-8 items-center">
                    <div className="w-full lg:w-1/2">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent animate-gradient">
                            Turn Your Imagination Into Art
                        </h1>
                        <p className="text-lg text-slate-300 mb-6">
                            Describe your vision and watch as our AI transforms your words into stunning images. From fantastical landscapes to futuristic scenes, anything is possible.
                        </p>

                        <button
                            className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-medium py-3 px-6 rounded-lg transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
                        >
                            Şimdi oluşturun
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
};