import { useState, useRef, useEffect } from "react";
import { FaPlay, FaCheck, FaTimes, FaEdit } from "react-icons/fa";

const TranscriptSegment = ({ 
  segment, 
  isActive, 
  isEditable, 
  status, 
  onPlay, 
  onTextUpdate, 
  onMarkCorrect, 
  onMarkIncorrect 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(segment.text);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const handleStartEdit = () => {
    if (!isEditable) return;
    setIsEditing(true);
    setEditText(segment.text);
  };

  const handleSaveEdit = () => {
    if (editText.trim() !== segment.text) {
      onTextUpdate(editText.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditText(segment.text);
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    }
    if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getStatusColor = () => {
    switch (status) {
      case 'confirmed': return 'border-green-500 bg-green-500/10';
      case 'edited': return 'border-blue-500 bg-blue-500/10';
      case 'needs-review': return 'border-red-500 bg-red-500/10';
      default: return 'border-gray-600 bg-gray-800/50';
    }
  };

  const getStatusIndicator = () => {
    switch (status) {
      case 'confirmed': return <div className="w-2 h-2 bg-green-500 rounded-full" />;
      case 'edited': return <div className="w-2 h-2 bg-blue-500 rounded-full" />;
      case 'needs-review': return <div className="w-2 h-2 bg-red-500 rounded-full" />;
      default: return <div className="w-2 h-2 bg-gray-500 rounded-full" />;
    }
  };

  return (
    <div 
      className={`
        p-3 rounded-lg border transition-all duration-200 
        ${getStatusColor()} 
        ${isActive ? 'ring-2 ring-blue-400 shadow-lg' : ''} 
        hover:shadow-md
      `}
    >
      {/* Segment Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {getStatusIndicator()}
          <button
            onClick={onPlay}
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
          >
            <FaPlay className="text-xs" />
            <span className="text-sm font-mono">
              {formatTime(segment.startTime)} - {formatTime(segment.endTime)}
            </span>
          </button>
          {segment.speaker && (
            <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
              {segment.speaker}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        {isEditable && !isEditing && (
          <div className="flex items-center gap-1">
            <button
              onClick={handleStartEdit}
              className="p-1 text-gray-400 hover:text-white transition-colors"
              title="Edit transcript"
            >
              <FaEdit className="text-xs" />
            </button>
            {status !== 'confirmed' && (
              <button
                onClick={onMarkCorrect}
                className="p-1 text-green-400 hover:text-green-300 transition-colors"
                title="Mark as correct"
              >
                <FaCheck className="text-xs" />
              </button>
            )}
            {status !== 'needs-review' && (
              <button
                onClick={onMarkIncorrect}
                className="p-1 text-red-400 hover:text-red-300 transition-colors"
                title="Mark as incorrect"
              >
                <FaTimes className="text-xs" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Segment Text */}
      <div className="text-sm">
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              ref={textareaRef}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-gray-800 text-white p-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none resize-none"
              rows={2}
              placeholder="Edit transcript text..."
            />
            <div className="flex gap-2">
              <button
                onClick={handleSaveEdit}
                className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs transition-colors"
              >
                <FaCheck />
                Save
              </button>
              <button
                onClick={handleCancelEdit}
                className="flex items-center gap-1 bg-gray-600 hover:bg-gray-700 text-white px-2 py-1 rounded text-xs transition-colors"
              >
                <FaTimes />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p 
            className={`
              text-white leading-relaxed cursor-pointer hover:bg-gray-700/20 p-1 rounded transition-colors
              ${isActive ? 'bg-blue-500/20' : ''}
              ${status === 'needs-review' ? 'text-red-200' : ''}
              ${status === 'confirmed' ? 'text-green-200' : ''}
            `}
            onClick={isEditable ? handleStartEdit : undefined}
          >
            {segment.text}
          </p>
        )}
      </div>

      {/* Confidence Score */}
      {segment.confidence && (
        <div className="mt-2 flex items-center gap-2">
          <span className="text-xs text-gray-400">Confidence:</span>
          <div className="flex-1 bg-gray-700 rounded-full h-1">
            <div 
              className={`h-1 rounded-full ${
                segment.confidence >= 0.8 ? 'bg-green-500' : 
                segment.confidence >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${segment.confidence * 100}%` }}
            />
          </div>
          <span className="text-xs text-gray-400">
            {Math.round(segment.confidence * 100)}%
          </span>
        </div>
      )}
    </div>
  );
};

export default TranscriptSegment;
