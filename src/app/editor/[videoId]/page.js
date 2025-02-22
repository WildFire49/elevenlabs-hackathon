'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { HiOutlinePencilAlt, HiOutlineTrash, HiPlus, HiCheck, HiX } from 'react-icons/hi';

const VideoEditor = () => {
  const { videoId } = useParams();
  const [video, setVideo] = useState(null);
  const [transcripts, setTranscripts] = useState([]);
  const [videoKey, setVideoKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [bgPosition, setBgPosition] = useState({ x: 50, y: 50 });
  const [voiceModels, setVoiceModels] = useState([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState("AZnzlk1XvdvUeBnXmlld");

  useEffect(() => {
    fetchVideo();
    fetchVoiceModels();

    const handleMouseMove = (e) => {
      // Reduce movement by dividing by a larger number (makes it more subtle)
      const x = 45 + ((e.clientX / window.innerWidth) * 10);
      const y = 45 + ((e.clientY / window.innerHeight) * 10);
      setBgPosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const fetchVideo = async () => {
    try {
      const response = await fetch(`http://localhost:8000/video/${decodeURIComponent(videoId).replace("files/", "")}/detail`);
      const data = await response.json();
      if (data.success) {
        setVideo({
          title: 'Video Editor',
          url: data.video_url
        });
        setTranscripts(data.transcripts || []);
      }
    } catch (error) {
      console.error('Error fetching video:', error);
    }
  };

  const fetchVoiceModels = async () => {
    try {
      const response = await fetch('http://localhost:8000/tts-models');
      const data = await response.json();
      setVoiceModels(data.models);
    } catch (error) {
      console.error('Error fetching voice models:', error);
    }
  };

  const handleAddTranscript = () => {
    setTranscripts([
      { text: '', start: '00:00', end: '00:00' },
      ...transcripts
    ]);
  };

  const handleUpdateTranscript = (index, field, value) => {
    const updatedTranscripts = [...transcripts];
    updatedTranscripts[index] = {
      ...updatedTranscripts[index],
      [field]: value
    };
    setTranscripts(updatedTranscripts);
  };

  const handleDeleteTranscript = (index) => {
    const updatedTranscripts = transcripts.filter((_, i) => i !== index);
    setTranscripts(updatedTranscripts);
  };

  const handleSave = async () => {
    setIsLoading(true);
    setSaveStatus('Saving...');
    try {
      const response = await fetch(`http://localhost:8000/video/${decodeURIComponent(videoId).replace("files/", "")}/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          video_id: decodeURIComponent(videoId).replace("files/", ""),
          transcripts: transcripts,
          voice_id: selectedVoiceId
        }),
      });
      
      const data = await response.json();
      if (!data.success) throw new Error('Failed to save');
      
      setSaveStatus('success');
      setVideoKey(prev => prev + 1);
      setTimeout(() => setSaveStatus(''), 2000);
    } catch (error) {
      console.error('Error saving:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(''), 2000);
    }
    setIsLoading(false);
  };

  if (!video) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
      <div className="animate-pulse text-white text-xl font-light">Loading...</div>
    </div>
  );

  return (
    <div 
      className="min-h-screen relative overflow-hidden text-white p-8"
      style={{
        background: `radial-gradient(circle at ${bgPosition.x}% ${bgPosition.y}%, rgb(17, 24, 39), rgb(0, 0, 0))`,
        transition: 'background 0.8s ease'
      }}
    >
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-8 shadow-2xl border border-white/10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Video Section */}
            <div className="space-y-6">
              <h1 className="text-3xl font-light tracking-tight">
                {video.title || 'Untitled Video'}
              </h1>
              <div className="relative rounded-xl overflow-hidden shadow-2xl bg-black/40">
                <video
                  key={videoKey}
                  className="w-full aspect-video"
                  src={video.url}
                  controls
                />
              </div>
            </div>

            {/* Transcripts Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-light">Transcripts</h2>
                <div className="flex items-center gap-4">
                  <select
                    className="bg-gray-800/50 backdrop-blur-lg text-white rounded-lg px-4 py-2.5 border border-white/10 hover:border-white/20 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/20 appearance-none cursor-pointer min-w-[200px]"
                    value={selectedVoiceId}
                    onChange={(e) => setSelectedVoiceId(e.target.value)}
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 12px center',
                      backgroundSize: '16px',
                      paddingRight: '40px'
                    }}
                  >
                    {voiceModels.map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleAddTranscript}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-300"
                  >
                    <HiPlus className="w-4 h-4" />
                    <span>Add Transcript</span>
                  </button>
                </div>
              </div>

              <div className="space-y-4 max-h-[calc(100vh-24rem)] overflow-y-auto pr-4 custom-scrollbar">
                {transcripts.map((transcript, index) => (
                  <div
                    key={index}
                    className="group backdrop-blur-lg bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all duration-300 border border-white/5 hover:border-white/10"
                  >
                    <div className="flex gap-4 items-center">
                      <input
                        type="text"
                        value={transcript.start}
                        onChange={(e) => handleUpdateTranscript(index, 'start', e.target.value)}
                        placeholder="00:00"
                        className="w-20 bg-black/20 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-300"
                      />
                      <input
                        type="text"
                        value={transcript.end}
                        onChange={(e) => handleUpdateTranscript(index, 'end', e.target.value)}
                        placeholder="00:00"
                        className="w-20 bg-black/20 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-300"
                      />
                      <button
                        onClick={() => handleDeleteTranscript(index)}
                        className="ml-auto p-2 hover:bg-red-500/20 rounded-lg transition-all duration-300"
                        title="Delete transcript"
                      >
                        <HiOutlineTrash className="w-5 h-5 text-red-400/70" />
                      </button>
                    </div>
                    <textarea
                      value={transcript.text}
                      onChange={(e) => handleUpdateTranscript(index, 'text', e.target.value)}
                      placeholder="Enter transcript text..."
                      className="mt-3 w-full bg-black/20 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white/20 resize-none h-24 transition-all duration-300"
                    />
                  </div>
                ))}
              </div>

              <div className="sticky bottom-0 pt-4">
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all duration-300 ${
                    saveStatus === 'success' ? 'bg-green-500' :
                    saveStatus === 'error' ? 'bg-red-500' :
                    saveStatus === 'saving' ? 'bg-white/20' :
                    'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  {saveStatus === 'success' ? (
                    <><HiCheck className="w-5 h-5" /> Saved!</>
                  ) : saveStatus === 'error' ? (
                    <><HiX className="w-5 h-5" /> Error Saving</>
                  ) : saveStatus === 'saving' ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Saving...
                    </div>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
};

export default VideoEditor;