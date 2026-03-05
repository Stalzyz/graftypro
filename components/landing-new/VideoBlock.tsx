"use client";
import React, { useState } from "react";
import { Play } from "lucide-react";

export default function VideoBlock({ title, subtitle, videoUrl, thumbnailUrl, sectionImage }: any) {
    const [isPlaying, setIsPlaying] = useState(false);

    if (!videoUrl) return null;

    return (
        <section className="py-28 px-6 bg-white relative">
            {sectionImage && (
                <div className="absolute inset-0 bg-cover bg-center opacity-5" style={{ backgroundImage: `url(${sectionImage})` }} />
            )}
            <div className="max-w-5xl mx-auto relative z-10">
                <div className="text-center mb-16">
                    {title && <h2 className="text-4xl font-black text-slate-900 leading-tight mb-4" dangerouslySetInnerHTML={{ __html: title }} />}
                    {subtitle && <p className="text-slate-500 text-lg max-w-2xl mx-auto">{subtitle}</p>}
                </div>

                <div className="relative rounded-[2rem] overflow-hidden border border-slate-200 shadow-2xl bg-black aspect-video flex items-center justify-center">
                    {isPlaying ? (
                        <iframe
                            src={`${videoUrl}?autoplay=1`}
                            className="w-full h-full border-0 absolute inset-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    ) : (
                        <div className="absolute inset-0 cursor-pointer group" onClick={() => setIsPlaying(true)}>
                            {thumbnailUrl ? (
                                <img src={thumbnailUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-90 transition-opacity" alt="Video thumbnail" />
                            ) : (
                                <div className="w-full h-full bg-slate-900 absolute inset-0 group-hover:bg-slate-800 transition-colors" />
                            )}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xl border border-white/30">
                                    <Play size={32} className="text-white fill-white ml-2" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
