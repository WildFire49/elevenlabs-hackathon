
import React from "react";
import { motion } from "framer-motion";
import { Bot, AudioLines, Wand2, Brain, Shield, Zap } from "lucide-react";

const Features = () => {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
            Intelligent Video Enhancement
          </h2>
          <p className="text-xl text-blue-100/90 max-w-2xl mx-auto">
            Everything you need to create professional videos
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            {
              icon: Bot,
              title: "AI Voice Generation",
              description: "Generate natural-sounding voiceovers in multiple languages and accents"
            },
            {
              icon: AudioLines,
              title: "Voice Sync",
              description: "Perfect synchronization between video content and AI-generated narration"
            },
            {
              icon: Wand2,
              title: "Smart Editing",
              description: "Intelligent scene detection and automatic content analysis"
            },
            {
              icon: Brain,
              title: "Content Understanding",
              description: "AI analyzes your video to generate contextually relevant scripts"
            },
            {
              icon: Shield,
              title: "Secure Processing",
              description: "Your content is processed privately and securely on our servers"
            },
            {
              icon: Zap,
              title: "Lightning Fast",
              description: "Process and enhance your videos in minutes, not hours"
            }
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              className="group relative"
            >
              <div className="backdrop-blur-sm bg-black/30 p-6 rounded-2xl border border-white/5 transition-all duration-300 group-hover:border-white/10 group-hover:bg-white/5 h-full">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-xl bg-blue-500/20 transition-colors duration-300 group-hover:bg-blue-500/30">
                    <feature.icon className="w-6 h-6 text-blue-200" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-blue-100">
                  {feature.title}
                </h3>
                <p className="text-blue-100/60 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
