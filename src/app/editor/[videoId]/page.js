'use client';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const timeStringToSeconds = (timeStr) => {
  const [minutes, seconds] = timeStr.split(':').map(Number);
  return minutes * 60 + seconds;
};

const secondsToTimeString = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
};

export default function VideoEditor() {
  const params = useParams();
  const videoId = params?.videoId;
  const [videoData, setVideoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [updatedTranscripts, setUpdatedTranscripts] = useState([]);
  const [saving, setSaving] = useState(false);
  const [videoKey, setVideoKey] = useState(0); 

  const fetchVideoData = async () => {
    if (!videoId) return;

    try {
      const response = await fetch(`http://localhost:8000/video/${encodeURIComponent(videoId)}/detail`);
      if (!response.ok) throw new Error('Video not found');
      const data = await response.json();
      if (!data.success) throw new Error('Failed to load video data');
      setVideoData(data);
      setUpdatedTranscripts(data.transcripts || []);
    } catch (error) {
      console.error('Failed to load video:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideoData();
  }, [videoId]);

  const handleUpdateTranscript = (index, field, value) => {
    const newTranscripts = [...updatedTranscripts];
    if (field === 'start' || field === 'end') {
      value = secondsToTimeString(value);
    }
    newTranscripts[index] = { ...newTranscripts[index], [field]: value };
    setUpdatedTranscripts(newTranscripts);
  };

  const handleAddTranscript = () => {
    const lastTranscript = updatedTranscripts[updatedTranscripts.length - 1];
    const newStartTime = lastTranscript ? lastTranscript.end : "00:00";
    const newEndTime = secondsToTimeString(timeStringToSeconds(newStartTime) + 2);
    setUpdatedTranscripts([...updatedTranscripts, {
      start: newStartTime,
      end: newEndTime,
      text: 'New transcript'
    }]);
  };

  const handleDeleteTranscript = (index) => {
    const newTranscripts = updatedTranscripts.filter((_, i) => i !== index);
    setUpdatedTranscripts(newTranscripts);
  };

  const handleSaveTranscripts = async () => {
    setSaving(true);
    try {
      const response = await fetch(`http://localhost:8000/video/${encodeURIComponent(videoId)}/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          video_id: videoId,
          transcripts: updatedTranscripts
        }),
      });
      
      if (!response.ok) throw new Error('Failed to update transcripts');
      
      // Refresh video data and force video reload
      await fetchVideoData();
      setVideoKey(prevKey => prevKey + 1); 
    } catch (error) {
      console.error('Failed to save transcripts:', error);
      alert('Failed to save transcripts');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center">Loading video...</div>;
  if (error) return <div className="h-screen flex items-center justify-center text-red-500">Error: {error}</div>;
  if (!videoData) return <div className="h-screen flex items-center justify-center">No video data found</div>;

  const hasUnsavedChanges = JSON.stringify(videoData.transcripts) !== JSON.stringify(updatedTranscripts);

  return (
    <div className="editor-container h-screen flex bg-gray-100">
      {/* Video Player Section */}
      <div className="flex-1 p-4">
        <div className="bg-white rounded-lg shadow-lg p-4">
          <video
            key={videoKey} 
            src={videoData.video_url}
            controls
            className="w-full aspect-video rounded-lg"
          />
        </div>
      </div>

      {/* Transcripts Panel */}
      <div className="w-96 bg-white border-l border-gray-200 overflow-y-auto flex flex-col">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-lg font-semibold">Transcripts</h2>
          <button
            onClick={handleAddTranscript}
            className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
          >
            Add Transcript
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {updatedTranscripts.map((transcript, index) => (
            <div
              key={index}
              className="p-4 border-b border-gray-200 hover:bg-gray-50"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={timeStringToSeconds(transcript.start)}
                    onChange={(e) => handleUpdateTranscript(index, 'start', parseFloat(e.target.value))}
                    className="w-20 px-2 py-1 border rounded"
                    step="1"
                  />
                  <span className="px-2">to</span>
                  <input
                    type="number"
                    value={timeStringToSeconds(transcript.end)}
                    onChange={(e) => handleUpdateTranscript(index, 'end', parseFloat(e.target.value))}
                    className="w-20 px-2 py-1 border rounded"
                    step="1"
                  />
                </div>
                <button
                  onClick={() => handleDeleteTranscript(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
              <div className="text-xs text-gray-500 mb-1">
                {transcript.start} - {transcript.end}
              </div>
              <textarea
                value={transcript.text}
                onChange={(e) => handleUpdateTranscript(index, 'text', e.target.value)}
                className="w-full px-2 py-1 border rounded resize-y min-h-[60px]"
              />
            </div>
          ))}
        </div>

        {hasUnsavedChanges && (
          <div className="p-4 border-t border-gray-200 sticky bottom-0 bg-white">
            <button
              onClick={handleSaveTranscripts}
              disabled={saving}
              className="w-full py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-400"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}