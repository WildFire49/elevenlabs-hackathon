'use client';
import Features from "@/components/Features";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import MarqueeStrip from "@/components/MarqueeStrip";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { toast } from "sonner";

const Index = () => {
  const [videoFile, setVideoFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showDemoVideo, setShowDemoVideo] = useState(false);


  const descriptions = [
    'Perfect for Tutorials',
    'Ideal for Product Demos',
    'Great for Educational Content',
    'Engaging Marketing Videos',
    'Professional Presentations',
    'Training Materials'
  ];

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0 && files[0].type.startsWith('video/')) {
      setVideoFile(files[0]);
      await processVideo(files[0]);
    } else {
      toast.error("Please upload a valid video file");
    }
  };


  const processVideo = async (file) => {
    try {
      const formData = new FormData();
      formData.append('video', file);
      formData.append('prompt', 'generate');

      const response = await fetch('http://localhost:8000/process-video', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process video');
      }

      const result = await response.json();
      window.location.href = `/editor/${encodeURIComponent(result.result.video_id)}`;
    } catch (error) {
      toast.error("Failed to process video. Please try again.");
      console.error('Error processing video:', error);
    }
  };

    return (
      <main className="relative overflow-x-hidden">
        <div className="fixed inset-0 bg-[#080B13]">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0A1423]/90 via-[#0F1829]/80 to-[#080B13]/95 animated-gradient" />
          <div className="absolute inset-0 grid-pattern opacity-20" />
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="moving-line"
              style={{
                animationDelay: `${i * 3}s`,
                top: `${i * 30}%`,
                opacity: '0.02'
              }}
            />
          ))}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808005_1px,transparent_1px),linear-gradient(to_bottom,#80808005_1px,transparent_1px)] bg-[size:24px_24px]" />
        </div>

        <div className="relative">
          <Hero 
            isDragging={isDragging}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onWatchDemo={() => setShowDemoVideo(true)}
          />
          <div className="mt-32">
            <MarqueeStrip descriptions={descriptions} />
            <div className="-mt-8"> {/* Additional negative margin */}
              <Features />
            </div>
            <div className="-mt-8"> {/* Additional negative margin */}
              <HowItWorks />
            </div>
            
            {/* Ready to Transform section with reduced padding */}
            <section className="py-16 relative overflow-hidden">
              <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto text-center space-y-6">
                  <h2 className="text-4xl md:text-5xl font-bold text-white">
                    Ready to Transform Your Videos?
                  </h2>
                  <p className="text-xl text-blue-200/80">
                    Join thousands of content creators who are already using our platform to create engaging videos
                  </p>
                  <div 
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="inline-flex cursor-pointer items-center px-8 py-4 rounded-xl bg-gradient-to-r from-[#9b87f5] to-[#6E59A5] text-white font-semibold text-lg hover:opacity-90 transition-opacity"
                  >
                    Get Started Now
                  </div>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -left-20 -bottom-20 w-40 h-40 bg-[#9b87f5] rounded-full opacity-20 blur-3xl" />
              <div className="absolute -right-20 -top-20 w-40 h-40 bg-[#6E59A5] rounded-full opacity-20 blur-3xl" />
            </section>
          </div>
        </div>

        <Dialog open={showDemoVideo} onOpenChange={setShowDemoVideo}>
          <DialogContent className="max-w-4xl bg-[#0A1929]/95 border-white/10">
            <DialogHeader>
              <DialogTitle className="text-xl text-white mb-4">
                How it Works
              </DialogTitle>
            </DialogHeader>
            <div className="aspect-video bg-black/50 rounded-lg overflow-hidden">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/xvFZjo5PgG0?autoplay=1"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </DialogContent>
        </Dialog>
      </main>
    );
};

export default Index;
