'use client';
import { useState } from "react";
import { motion } from "framer-motion";

export default function Home() {
    const [video, setVideo] = useState(null);
    const [prompt, setPrompt] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [fileName, setFileName] = useState('');

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('video/')) {
            setVideo(file);
            setFileName(file.name);
        }
    };

    const handleFileInput = (e) => {
        const file = e.target.files[0];
        if (file) {
            setVideo(file);
            setFileName(file.name);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
            <main className="container mx-auto px-4 py-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                        Video Enhancer AI
                    </h1>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                        Transform your videos with AI-powered enhancements. Upload your video and describe how you want to improve it.
                    </p>
                </motion.div>

                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="bg-gray-800/50 p-8 rounded-2xl backdrop-blur-sm shadow-xl"
                    >
                        <div
                            onDragOver={(e) => {
                                e.preventDefault();
                                setIsDragging(true);
                            }}
                            onDragLeave={(e) => {
                                e.preventDefault();
                                setIsDragging(false);
                            }}
                            onDrop={handleDrop}
                            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                                isDragging
                                    ? 'border-purple-500 bg-purple-500/10'
                                    : 'border-gray-600 hover:border-purple-500/50'
                            }`}
                        >
                            <div className="space-y-4">
                                <div className="flex items-center justify-center">
                                    <label className="cursor-pointer">
                                        <input
                                            type="file"
                                            accept="video/*"
                                            onChange={handleFileInput}
                                            className="hidden"
                                        />
                                        <div className="flex flex-col items-center gap-2">
                                            <svg
                                                className="w-12 h-12 text-gray-400"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                                />
                                            </svg>
                                            <span className="text-gray-300">
                                                {fileName || 'Drop your video here or click to browse'}
                                            </span>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 space-y-4">
                            <input
                                type="text"
                                placeholder="Describe how you want to enhance your video..."
                                onChange={(e) => setPrompt(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg bg-gray-700/50 border border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                            />

                            <button
                                onClick={async () => {
                                    const formData = new FormData();
                                    formData.append('video', video);
                                    formData.append('prompt', prompt);
                                    
                                    const response = await fetch('http://localhost:8000/process-video', {
                                        method: 'POST',
                                        body: formData,
                                    });
                                    
                                    if (response.ok) {
                                        const data = await response.json();
                                        window.location.href = `/editor/${encodeURIComponent(data.result.video_id)}`;
                                    }
                                }}
                                disabled={!video || !prompt}
                                className="w-full py-3 px-6 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                            >
                                Enhance Video
                            </button>
                        </div>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
                >
                    {[
                        {
                            title: 'AI-Powered',
                            description: 'Advanced AI algorithms to enhance your videos',
                            icon: '🤖'
                        },
                        {
                            title: 'Fast Processing',
                            description: 'Quick and efficient video enhancement',
                            icon: '⚡'
                        },
                        {
                            title: 'High Quality',
                            description: 'Professional-grade output every time',
                            icon: '✨'
                        }
                    ].map((feature, index) => (
                        <div key={index} className="p-6 rounded-xl bg-gray-800/30 backdrop-blur-sm">
                            <div className="text-4xl mb-4">{feature.icon}</div>
                            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                            <p className="text-gray-400">{feature.description}</p>
                        </div>
                    ))}
                </motion.div>
            </main>
        </div>
    );
}