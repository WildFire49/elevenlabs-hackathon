'use client';
import { useRouter } from 'next/navigation';
import { useState } from "react";

export default function Home() {
    const router = useRouter();
    const [video, setVideo] = useState(null);
    const [prompt, setPrompt] = useState('');

    const handleVideoOpen = async (videoId) => {
        try {
          const response = await fetch(`/video/${videoId}`);
          if (!response.ok) throw new Error('Video not found');
          const data = await response.json();
          router.push(`/editor/${videoId}`);
        } catch (error) {
          console.error('Video load error:', error);
          // Add error state handling here
        }
    };

    return (
        <div>
<input type="file" onChange={(e) => setVideo(e.target.files[0])} />
<input type="text" onChange={(e) => setPrompt(e.target.value)} />
<button onClick={async () => {
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
}}>Process Video</button>
            
        </div>
    );
}