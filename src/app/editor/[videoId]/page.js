'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function VideoEditor() {
  const params = useParams();
  const videoId = params?.videoId;
  const [videoData, setVideoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVideoData = async () => {
      if (!videoId) return;

      try {
        const response = await fetch(`http://localhost:8000/video/${encodeURIComponent(videoId)}/detail`);
        if (!response.ok) throw new Error('Video not found');
        const data = await response.json();
        setVideoData(data);
      } catch (error) {
        console.error('Failed to load video:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVideoData();
  }, [videoId]);

  if (loading) return <div>Loading video...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!videoData) return <div>No video data found</div>;
  console.log(videoData)
  return (
    <div className="editor-container">
      <video controls src={videoData.video_url} className="w-full" />
      <div className="transcripts mt-4">
        <h3 className="text-xl font-semibold mb-2">Transcripts</h3>
        <p className="whitespace-pre-wrap">{JSON.stringify(videoData.transcripts)}</p>
      </div>
    </div>
  );
}
