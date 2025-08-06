import { useState, useRef, useEffect } from "react";
import { FaPlay, FaPause, FaCheck, FaTimes, FaEdit, FaSave } from "react-icons/fa";
import { toast } from "react-hot-toast";
import TranscriptSegment from "./TranscriptSegment";

const EditableTranscript = ({ 
  transcript = [], 
  audioUrl, 
  onTranscriptUpdate, 
  isEditable = true,
  showAudioControls = true,
  postId 
}) => {
  const [segments, setSegments] = useState(transcript);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeSegmentId, setActiveSegmentId] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    setSegments(transcript);
  }, [transcript]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      setCurrentTime(audio.currentTime);
      
      // Find active segment based on current time
      const activeSegment = segments.find(
        segment => audio.currentTime >= segment.startTime && audio.currentTime <= segment.endTime
      );
      
      if (activeSegment) {
        setActiveSegmentId(activeSegment.id);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setActiveSegmentId(null);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [segments]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const playSegment = (segment) => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = segment.startTime;
    audio.play();
    setIsPlaying(true);
    setActiveSegmentId(segment.id);

    // Stop at segment end
    const checkEnd = () => {
      if (audio.currentTime >= segment.endTime) {
        audio.pause();
        setIsPlaying(false);
        audio.removeEventListener('timeupdate', checkEnd);
      }
    };
    audio.addEventListener('timeupdate', checkEnd);
  };

  const updateSegmentText = (segmentId, newText) => {
    setSegments(prevSegments => 
      prevSegments.map(segment => 
        segment.id === segmentId 
          ? { ...segment, text: newText, isEdited: true }
          : segment
      )
    );
    setHasUnsavedChanges(true);
  };

  const markSegmentAsCorrect = (segmentId) => {
    setSegments(prevSegments => 
      prevSegments.map(segment => 
        segment.id === segmentId 
          ? { ...segment, isConfirmed: true, isEdited: false }
          : segment
      )
    );
    setHasUnsavedChanges(true);
  };

  const markSegmentAsIncorrect = (segmentId) => {
    setSegments(prevSegments => 
      prevSegments.map(segment => 
        segment.id === segmentId 
          ? { ...segment, isConfirmed: false, needsReview: true }
          : segment
      )
    );
    setHasUnsavedChanges(true);
  };

  const saveTranscript = async () => {
    try {
      if (onTranscriptUpdate) {
        await onTranscriptUpdate(segments);
        setHasUnsavedChanges(false);
        toast.success("Transcript saved successfully!");
      }
    } catch (error) {
      toast.error("Failed to save transcript");
      console.error("Save transcript error:", error);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getSegmentStatus = (segment) => {
    if (segment.isConfirmed) return 'confirmed';
    if (segment.isEdited) return 'edited';
    if (segment.needsReview) return 'needs-review';
    return 'pending';
  };

  return (
    <div className="w-full bg-gray-900 rounded-lg p-4 border border-gray-700">
      {/* Audio Player Controls */}
      {showAudioControls && audioUrl && (
        <div className="mb-4">
          <audio ref={audioRef} src={audioUrl} className="hidden" />
          
          <div className="flex items-center gap-4 bg-gray-800 p-3 rounded-lg">
            <button
              onClick={togglePlayPause}
              className="flex items-center justify-center w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors"
              disabled={!audioUrl}
            >
              {isPlaying ? <FaPause className="text-white" /> : <FaPlay className="text-white ml-1" />}
            </button>
            
            <div className="flex-1">
              <div className="text-sm text-gray-400 mb-1">
                {formatTime(currentTime)} / {formatTime(audioRef.current?.duration || 0)}
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-100"
                  style={{ 
                    width: `${audioRef.current?.duration ? (currentTime / audioRef.current.duration) * 100 : 0}%` 
                  }}
                />
              </div>
            </div>

            {hasUnsavedChanges && isEditable && (
              <button
                onClick={saveTranscript}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition-colors"
              >
                <FaSave />
                Save Changes
              </button>
            )}
          </div>
        </div>
      )}

      {/* Transcript Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">
          Audio Transcript
          {hasUnsavedChanges && <span className="text-yellow-500 ml-2">•</span>}
        </h3>
        
        <div className="flex items-center gap-2 text-sm">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-400">Confirmed</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-gray-400">Edited</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-gray-400">Needs Review</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
            <span className="text-gray-400">Pending</span>
          </div>
        </div>
      </div>

      {/* Transcript Segments */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {segments.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <FaEdit className="mx-auto mb-2 text-3xl" />
            <p>No transcript available</p>
          </div>
        ) : (
          segments.map((segment) => (
            <TranscriptSegment
              key={segment.id}
              segment={segment}
              isActive={activeSegmentId === segment.id}
              isEditable={isEditable}
              status={getSegmentStatus(segment)}
              onPlay={() => playSegment(segment)}
              onTextUpdate={(newText) => updateSegmentText(segment.id, newText)}
              onMarkCorrect={() => markSegmentAsCorrect(segment.id)}
              onMarkIncorrect={() => markSegmentAsIncorrect(segment.id)}
            />
          ))
        )}
      </div>

      {/* Transcript Stats */}
      {segments.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="grid grid-cols-4 gap-4 text-center text-sm">
            <div>
              <div className="text-white font-semibold">
                {segments.length}
              </div>
              <div className="text-gray-400">Total Segments</div>
            </div>
            <div>
              <div className="text-green-500 font-semibold">
                {segments.filter(s => s.isConfirmed).length}
              </div>
              <div className="text-gray-400">Confirmed</div>
            </div>
            <div>
              <div className="text-blue-500 font-semibold">
                {segments.filter(s => s.isEdited && !s.isConfirmed).length}
              </div>
              <div className="text-gray-400">Edited</div>
            </div>
            <div>
              <div className="text-red-500 font-semibold">
                {segments.filter(s => s.needsReview).length}
              </div>
              <div className="text-gray-400">Need Review</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditableTranscript;
