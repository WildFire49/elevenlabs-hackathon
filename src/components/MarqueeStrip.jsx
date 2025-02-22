
import React from "react";
import { motion } from "framer-motion";
import { MoreHorizontal } from "lucide-react";

const MarqueeStrip = ({ descriptions }) => {
  return (
    <div className="w-full relative overflow-hidden border-t border-b border-white/5 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-blue-500/5 backdrop-blur-sm">
      <div className="container mx-auto py-6">
        <div className="overflow-hidden">
          <motion.div 
            className="flex items-center justify-start gap-4 text-xl text-blue-200/80"
            animate={{
              x: ["0%", "-100%"]
            }}
            transition={{
              x: {
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              }
            }}
          >
            <div className="flex items-center gap-4 whitespace-nowrap">
              {[...descriptions, ...descriptions].map((desc, index) => (
                <React.Fragment key={index}>
                  {index > 0 && (
                    <div className="text-blue-400/40">
                      <MoreHorizontal className="w-4 h-4" />
                    </div>
                  )}
                  <span>{desc}</span>
                </React.Fragment>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default MarqueeStrip;
