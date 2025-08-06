import { useState, useEffect } from "react";
import { FaMicrophone, FaStop, FaSave, FaTrash } from "react-icons/fa";
import { toast } from "react-hot-toast";
import useSpeechToText from "../../hooks/useSpeechToText";
import EditableTranscript from "./EditableTranscript";

const LiveSpeechRecognition = ({ onTranscriptReady, onClose }) => {
  const [mode, setMode] = useState('ready'); // ready, recording, review
  const [finalTranscript, setFinalTranscript] = useState([]);
  
  const {
    isListening,
    transcript,
    interimTranscript,
    segments,
    isSupported,
    startListening,
    stopListening,
    getFormattedTranscript,
    checkSupport,
    checkMicrophone
  } = useSpeechToText();

  useEffect(() => {
    checkSupport();
  }, [checkSupport]);

  const handleStartRecording = () => {
    setMode('recording');
    startListening();
  };

  const handleStopRecording = () => {
    stopListening();
    setMode('review');
    
    // Get the final formatted transcript
    const formatted = getFormattedTranscript();
    setFinalTranscript(formatted);
  };

  const handleSaveTranscript = () => {
    if (finalTranscript.length > 0) {
      // For live speech, we don't have actual audio, so we'll store null
      // This prevents issues with invalid audio URLs
      const audioUrl = null;
      
      onTranscriptReady(finalTranscript, audioUrl, {
        title: `Live Recording ${new Date().toLocaleString()}`,
        duration: finalTranscript[finalTranscript.length - 1]?.endTime || 0,
        method: 'live-speech'
      });
      
      toast.success("Live transcript saved!");
      onClose();
    } else {
      toast.error("No transcript to save");
    }
  };

  const handleDiscardTranscript = () => {
    setFinalTranscript([]);
    setMode('ready');
  };

  const handleTranscriptUpdate = (updatedTranscript) => {
    setFinalTranscript(updatedTranscript);
  };

  if (!isSupported) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
          <h3 className="text-xl font-semibold mb-4 text-white">Browser Not Supported</h3>
          <div className="space-y-4">
            <p className="text-gray-300">
              Live speech recognition requires a modern browser with Web Speech API support.
            </p>
            <div className="bg-gray-700 p-3 rounded">
              <h4 className="font-medium text-white mb-2">Supported Browsers:</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Google Chrome (recommended)</li>
                <li>• Microsoft Edge</li>
                <li>• Safari (limited support)</li>
              </ul>
            </div>
            <p className="text-sm text-gray-400">
              For file upload transcription, please use the regular recording mode.
            </p>
            <button
              onClick={onClose}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-white">Live Speech Recognition</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Mode: Ready to Record */}
        {mode === 'ready' && (
          <div className="text-center space-y-6">
            <div className="text-6xl text-blue-500 mb-4">🎤</div>
            <h4 className="text-lg font-semibold text-white">Ready to Start Live Recognition</h4>
            <p className="text-gray-300 max-w-md mx-auto">
              Click the microphone to start live speech recognition. 
              Make sure your microphone is connected and permissions are granted.
            </p>
            
            <div className="bg-gray-700 p-4 rounded-lg max-w-md mx-auto">
              <h5 className="font-medium text-white mb-2">Tips for Best Results:</h5>
              <ul className="text-sm text-gray-300 space-y-1 text-left">
                <li>• Speak clearly and at moderate pace</li>
                <li>• Use a quiet environment</li>
                <li>• Stay close to your microphone</li>
                <li>• Pause briefly between sentences</li>
              </ul>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={checkMicrophone}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                🎤 Test Microphone
              </button>
              <button
                onClick={handleStartRecording}
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg transition-colors flex items-center gap-2"
              >
                <FaMicrophone />
                Start Live Recognition
              </button>
            </div>
          </div>
        )}

        {/* Mode: Recording */}
        {mode === 'recording' && (
          <div className="text-center space-y-6">
            <div className="text-6xl text-red-500 animate-pulse mb-4">🔴</div>
            <h4 className="text-lg font-semibold text-white">Listening...</h4>
            <p className="text-gray-300">Speak now! Your speech is being converted to text in real-time.</p>
            
            {/* Live Transcript Display */}
            <div className="bg-gray-700 p-4 rounded-lg max-h-40 overflow-y-auto">
              <h5 className="font-medium text-white mb-2">Live Transcript:</h5>
              <div className="text-left text-gray-300 min-h-[60px]">
                <div className="mb-2">
                  <strong>Final:</strong> {transcript || "No final text yet..."}
                </div>
                <div className="text-yellow-300">
                  <strong>Speaking:</strong> {interimTranscript || "Waiting for speech..."}
                </div>
              </div>
            </div>

            {/* Segments Display */}
            {segments.length > 0 && (
              <div className="bg-gray-700 p-4 rounded-lg max-h-40 overflow-y-auto">
                <h5 className="font-medium text-white mb-2">Completed Segments:</h5>
                <div className="text-left space-y-1">
                  {segments.map((segment, index) => (
                    <div key={segment.id} className="text-sm text-gray-300">
                      <span className="text-blue-400">[{index + 1}]</span> {segment.text}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleStopRecording}
              className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg transition-colors flex items-center gap-2 mx-auto"
            >
              <FaStop />
              Stop Recognition
            </button>
          </div>
        )}

        {/* Mode: Review */}
        {mode === 'review' && (
          <div className="space-y-6">
            <div className="text-center">
              <h4 className="text-lg font-semibold text-white mb-2">Review Your Transcript</h4>
              <p className="text-gray-300">Review and edit your transcript before saving.</p>
            </div>

            {finalTranscript.length > 0 ? (
              <div className="space-y-4">
                <EditableTranscript
                  transcript={finalTranscript}
                  audioUrl={null} // No audio file for live recognition
                  onTranscriptUpdate={handleTranscriptUpdate}
                  isEditable={true}
                  showAudioControls={false}
                />
                
                <div className="flex justify-center gap-4">
                  <button
                    onClick={handleSaveTranscript}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <FaSave />
                    Save Transcript
                  </button>
                  <button
                    onClick={handleDiscardTranscript}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <FaTrash />
                    Discard & Try Again
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <p className="text-gray-300">No speech was detected. Please try again.</p>
                <button
                  onClick={handleDiscardTranscript}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveSpeechRecognition;
