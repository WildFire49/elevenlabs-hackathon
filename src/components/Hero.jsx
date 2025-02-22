import { motion } from "framer-motion";
import { Award, Play, Upload, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

const Hero = ({ isDragging, onDragOver, onDragLeave, onDrop, onWatchDemo }) => {
  const fileInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      }
    }
  };

  const textCharacterVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.8 },
    visible: (custom) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        delay: custom * 0.05,
        duration: 0.8,
        ease: [0.23, 1, 0.32, 1]
      }
    })
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files && files[0]) {
      if (files[0].type.startsWith('video/')) {
        setIsLoading(true);
        // Simulate drop event with the selected file
        const dropEvent = new DragEvent('drop');
        Object.defineProperty(dropEvent, 'dataTransfer', {
          value: {
            files: files
          }
        });
        onDrop(dropEvent);
      } else {
        toast.error("Please select a valid video file");
      }
    }
  };

  return (
    <section className="relative flex flex-col items-center mt-32 px-4">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container mx-auto text-center space-y-12 relative z-10"
      >
        <div className="max-w-4xl mx-auto space-y-8">
          <motion.div
            variants={textCharacterVariants}
            className="inline-flex items-center px-4 py-2 rounded-full border border-blue-200/10 bg-blue-900/10 backdrop-blur-sm"
          >
            <Award className="w-4 h-4 mr-2 text-blue-200" />
            <span className="text-sm text-blue-200">AI-Powered Video Enhancement</span>
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white relative leading-[1.1]">
            <span className="relative inline-block mb-2">
              Transform Boring Videos
            </span>
            <br />
            <span className="bg-gradient-to-r from-[#9b87f5] via-[#D6BCFA] to-[#6E59A5] text-transparent bg-clip-text relative inline-block" style={{ lineHeight: 'normal' }}>
              Into Engaging Content
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-blue-200/80 max-w-2xl mx-auto">
            Add Professional AI Narration That Perfectly Syncs With Your Video Content
          </p>

          <motion.div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <motion.div
              variants={textCharacterVariants}
              whileHover={{ scale: 1.02 }}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={handleClick}
              className={`relative group basis-2/3 ${
                isDragging 
                  ? "scale-105 border-blue-400/40 bg-white/10" 
                  : "hover:bg-white/5"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <motion.div
                animate={{
                  boxShadow: isDragging 
                    ? [
                        "0 0 0 0 rgba(59, 130, 246, 0)",
                        "0 0 0 12px rgba(59, 130, 246, 0.1)",
                        "0 0 0 0 rgba(59, 130, 246, 0)"
                      ]
                    : "none"
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="glass-morphism p-6 rounded-2xl border border-white/10 cursor-pointer shadow-[0_8px_16px_-6px_rgba(0,0,0,0.2)] relative overflow-hidden"
              >
                {isLoading && (
                  <motion.div 
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    >
                      <Loader2 className="w-8 h-8 text-blue-400" />
                    </motion.div>
                  </motion.div>
                )}
                {/* Progressive stroke animation */}
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  initial={false}
                  animate={isDragging ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
                >
                  <svg className="absolute inset-0 w-full h-full">
                    <motion.rect
                      x="0"
                      y="0"
                      width="100%"
                      height="100%"
                      rx="16"
                      fill="none"
                      stroke="rgba(96, 165, 250, 0.5)"
                      strokeWidth="2"
                      initial={{ pathLength: 0 }}
                      animate={{ 
                        pathLength: isDragging ? 1 : 0,
                        opacity: isDragging ? 1 : 0
                      }}
                      transition={{ 
                        duration: 0.8,
                        ease: "easeInOut"
                      }}
                    />
                  </svg>
                </motion.div>

                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-blue-500/20">
                    <Upload className="w-6 h-6 text-blue-200" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-medium text-white mb-1">
                      Drop Your Video
                    </h3>
                    <p className="text-sm text-blue-200/70">
                      Drag & drop or browse files
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            <span className="text-blue-200/50">or</span>

            <motion.div
              variants={textCharacterVariants}
              whileHover={{ scale: 1.02 }}
              className="basis-1/3"
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="glass-morphism p-6 rounded-2xl border border-white/10 cursor-pointer shadow-[0_8px_16px_-6px_rgba(0,0,0,0.2)] hover:bg-white/5"
                onClick={onWatchDemo}
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-blue-500/20">
                    <Play className="w-6 h-6 text-blue-200" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-medium text-white mb-1">
                      Watch Demo
                    </h3>
                    <p className="text-sm text-blue-200/70">
                      See how it works
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;
