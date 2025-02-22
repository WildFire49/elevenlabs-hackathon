
import React from "react";
import { motion } from "framer-motion";
import { FileVideo, Brain, Wand2 } from "lucide-react";

const HowItWorks = () => {
  return (
    <section className="py-16 relative">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
            How it works
          </h2>
          <p className="text-xl text-blue-100/90 max-w-2xl mx-auto">
            Transform your videos in three simple steps
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {[
            {
              step: "01",
              icon: FileVideo,
              title: "Upload Your Video",
              description: "Drop your tutorial video into our editor. We support all major video formats."
            },
            {
              step: "02",
              icon: Brain,
              title: "AI Analysis",
              description: "Our AI analyzes your video content, understanding actions and context to generate a natural script."
            },
            {
              step: "03",
              icon: Wand2,
              title: "Generate & Edit",
              description: "Preview the AI-generated voiceover, make adjustments, and export your enhanced video."
            }
          ].map((item, index) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              className="group relative h-full"
            >
              <div className="backdrop-blur-sm bg-black/30 p-6 rounded-2xl border border-white/5 transition-all duration-300 group-hover:border-white/10 group-hover:bg-white/5 h-full flex flex-col">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-xl bg-blue-500/20">
                    <item.icon className="w-6 h-6 text-blue-200" />
                  </div>
                  <span className="text-sm text-blue-200/70">Step {item.step}</span>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-blue-100">
                  {item.title}
                </h3>
                <p className="text-blue-100/60 text-sm leading-relaxed mt-auto">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
