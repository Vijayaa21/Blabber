import { useState } from "react";
import { FaPlay, FaUpload, FaDownload, FaTrash, FaMicrophone } from "react-icons/fa";
import EditableTranscript from "../../components/common/EditableTranscript";
import AudioRecorder from "../../components/common/AudioRecorder";
import LiveSpeechRecognition from "../../components/common/LiveSpeechRecognition";
import useTranscript from "../../hooks/useTranscript";
import { useTranscriptStore } from "../../contexts/TranscriptContext";

const TranscriptDemo = () => {
  const [currentDemo, setCurrentDemo] = useState('recordings');
  const [selectedRecording, setSelectedRecording] = useState(null);
  const [showLiveSpeech, setShowLiveSpeech] = useState(false);
  const { 
    userTranscripts: transcripts = [], 
    updateTranscript, 
    deleteTranscript,
    addTranscript 
  } = useTranscriptStore();
  const { exportTranscript, generateTranscript } = useTranscript();

  // Demo transcript for tutorial purposes
  const [demoTranscript] = useState([
    {
      id: "1",
      text: "Welcome to the editable transcript demo. This feature allows you to review and edit AI-generated transcriptions.",
      startTime: 0,
      endTime: 6.5,
      speaker: "Narrator",
      confidence: 0.95,
      isConfirmed: true,
      isEdited: false,
      needsReview: false
    },
    {
      id: "2",
      text: "You can click on any segment to play the corresponding audio section and make corrections as needed.",
      startTime: 6.5,
      endTime: 12.8,
      speaker: "Narrator", 
      confidence: 0.88,
      isConfirmed: false,
      isEdited: false,
      needsReview: false
    },
    {
      id: "3",
      text: "This low confidence segment might need review and correction.",
      startTime: 12.8,
      endTime: 17.2,
      speaker: "Narrator",
      confidence: 0.65,
      isConfirmed: false,
      isEdited: false,
      needsReview: true
    },
    {
      id: "4",
      text: "You can mark segments as correct, edit them, or flag them for review.",
      startTime: 17.2,
      endTime: 22.5,
      speaker: "Narrator",
      confidence: 0.92,
      isConfirmed: false,
      isEdited: true,
      needsReview: false
    }
  ]);

  const handleTranscriptUpdate = async (recordingId, updatedTranscript) => {
    updateTranscript(recordingId, updatedTranscript);
  };

  const handleAudioReady = async (audioBlob, audioUrl) => {
    console.log("TranscriptDemo: Audio ready for processing:", { audioBlob, audioUrl });
    
    try {
      // Generate transcript using the hook
      const result = await generateTranscript({ audioFile: audioBlob, audioUrl });
      console.log("TranscriptDemo: Transcript generated:", result);
      
      // Convert blob to base64 for persistent storage
      const reader = new FileReader();
      const audioDataUrl = await new Promise((resolve) => {
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(audioBlob);
      });
      
      // Save to transcript store with persistent audio data
      const savedTranscript = addTranscript({
        title: `Recording ${new Date().toLocaleString()}`,
        audioUrl: audioDataUrl, // Use data URL instead of blob URL
        transcript: result.transcript,
        audioFileName: audioBlob.name || `recording_${Date.now()}.webm`,
        audioSize: audioBlob.size,
        duration: result.transcript[result.transcript.length - 1]?.endTime || 0
      });
      
      console.log('TranscriptDemo: Transcript saved to store:', savedTranscript);
      
      // Switch to recordings view to show the new transcript
      setCurrentDemo('recordings');
      
    } catch (error) {
      console.error("TranscriptDemo: Error generating transcript:", error);
    }
  };

  const handleLiveTranscriptReady = (transcript, audioUrl, metadata) => {
    console.log("TranscriptDemo: Live transcript ready:", { transcript, audioUrl, metadata });
    
    // Save to transcript store
    const savedTranscript = addTranscript({
      title: metadata.title,
      audioUrl: audioUrl,
      transcript: transcript,
      audioFileName: `live_recording_${Date.now()}.wav`,
      audioSize: 0, // No actual file for live recognition
      duration: metadata.duration,
      method: metadata.method,
      isLiveRecording: true
    });
    
    console.log('TranscriptDemo: Live transcript saved to store:', savedTranscript);
    
    // Switch to recordings view to show the new transcript
    setCurrentDemo('recordings');
  };

  const handleDeleteRecording = (recordingId) => {
    deleteTranscript(recordingId);
    if (selectedRecording?.id === recordingId) {
      setSelectedRecording(null);
    }
  };

  const demoAudioUrl = "/demo-audio.mp3";

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Editable Transcript Demo</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Experience the power of interactive transcript editing. Record audio, generate transcripts, 
            and edit them with ease. Click segments to play corresponding audio and make corrections.
          </p>
        </div>

        {/* Demo Selection */}
        <div className="flex justify-center gap-4">
          <button
            onClick={() => setCurrentDemo('recordings')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              currentDemo === 'recordings' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <FaPlay className="inline mr-2" />
            My Recordings ({transcripts.length})
          </button>
          <button
            onClick={() => setCurrentDemo('live')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              currentDemo === 'live' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <FaMicrophone className="inline mr-2" />
            Live Speech (Free)
          </button>
          <button
            onClick={() => setCurrentDemo('demo')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              currentDemo === 'demo' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <FaPlay className="inline mr-2" />
            Tutorial Demo
          </button>
        </div>

        {/* Demo Content */}
        <div className="grid gap-6">
          {currentDemo === 'live' && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">Live Speech Recognition</h2>
                <p className="text-gray-400">
                  Click the "Live Speech" button above to start real-time speech-to-text transcription.
                </p>
              </div>
              <div className="bg-gray-800 rounded-lg p-8 text-center">
                <div className="text-6xl text-blue-400 mb-4">🎤</div>
                <h3 className="text-lg font-semibold mb-2">Real-time Speech Recognition</h3>
                <p className="text-gray-400 mb-4">
                  Uses your browser's built-in speech recognition (Chrome/Edge recommended).
                </p>
                <button
                  onClick={() => setShowLiveSpeech(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  <FaMicrophone className="inline mr-2" />
                  Start Recording
                </button>
              </div>
            </div>
          )}

          {currentDemo === 'recordings' && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">Your Recordings</h2>
                <p className="text-gray-400">
                  {transcripts.length === 0 
                    ? "No recordings yet. Use the 'Try Recording' tab to create your first transcript."
                    : `You have ${transcripts.length} recording${transcripts.length !== 1 ? 's' : ''} with transcripts.`
                  }
                </p>
              </div>

              {transcripts.length === 0 ? (
                <div className="bg-gray-800 rounded-lg p-8 text-center">
                  <div className="text-6xl text-gray-600 mb-4">🎙️</div>
                  <h3 className="text-lg font-semibold mb-2">No recordings yet</h3>
                  <p className="text-gray-400 mb-4">
                    Start by using the Live Speech Recognition to generate transcripts.
                  </p>
                  <button
                    onClick={() => setCurrentDemo('live')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    Try Live Speech
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Recording List */}
                  <div className="grid gap-4">
                    {transcripts.map((recording) => (
                      <div key={recording.id} className="bg-gray-800 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">
                              {recording.title || `Recording ${recording.id.slice(0, 8)}`}
                            </h3>
                            <p className="text-sm text-gray-400">
                              Created: {new Date(recording.createdAt || Date.now()).toLocaleString()}
                              {recording.transcript && (
                                <span className="ml-4">
                                  • {recording.transcript.length} segments
                                  • Duration: {Math.round(recording.duration || recording.transcript[recording.transcript.length - 1]?.endTime || 0)}s
                                  • Size: {Math.round((recording.audioSize || 0) / 1024)}KB
                                </span>
                              )}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {recording.transcript && (
                              <>
                                <button
                                  onClick={() => setSelectedRecording(recording)}
                                  className={`px-3 py-1 rounded text-sm transition-colors ${
                                    selectedRecording?.id === recording.id
                                      ? 'bg-blue-600 text-white'
                                      : 'bg-gray-600 hover:bg-gray-700 text-white'
                                  }`}
                                >
                                  View Transcript
                                </button>
                                <button
                                  onClick={() => exportTranscript(recording.transcript, 'txt')}
                                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
                                >
                                  <FaDownload className="inline mr-1" />
                                  Export
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => handleDeleteRecording(recording.id)}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                            >
                              <FaTrash className="inline mr-1" />
                              Delete
                            </button>
                          </div>
                        </div>

                        {/* Audio Player */}
                        {recording.audioUrl && (
                          <div className="mb-3">
                            <audio 
                              controls 
                              className="w-full"
                              src={recording.audioUrl}
                              preload="metadata"
                            >
                              Your browser does not support the audio element.
                            </audio>
                          </div>
                        )}

                        {/* Status */}
                        <div className="flex items-center gap-4 text-sm">
                          <span className={`px-2 py-1 rounded ${
                            recording.transcript 
                              ? 'bg-green-900 text-green-300' 
                              : 'bg-yellow-900 text-yellow-300'
                          }`}>
                            {recording.transcript ? 'Transcript Ready' : 'Processing...'}
                          </span>
                          {recording.transcript && (
                            <span className="text-gray-400">
                              Duration: {Math.round(recording.transcript[recording.transcript.length - 1]?.endTime || 0)}s
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Selected Recording Transcript */}
                  {selectedRecording && selectedRecording.transcript && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold">
                          Transcript: {selectedRecording.title || `Recording ${selectedRecording.id.slice(0, 8)}`}
                        </h2>
                        <div className="flex gap-2">
                          <button
                            onClick={() => exportTranscript(selectedRecording.transcript, 'txt')}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm transition-colors"
                          >
                            <FaDownload className="inline mr-1" />
                            TXT
                          </button>
                          <button
                            onClick={() => exportTranscript(selectedRecording.transcript, 'srt')}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm transition-colors"
                          >
                            <FaDownload className="inline mr-1" />
                            SRT
                          </button>
                          <button
                            onClick={() => setSelectedRecording(null)}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                      
                      <EditableTranscript
                        transcript={selectedRecording.transcript}
                        audioUrl={selectedRecording.audioUrl}
                        onTranscriptUpdate={(updatedTranscript) => 
                          handleTranscriptUpdate(selectedRecording.id, updatedTranscript)
                        }
                        isEditable={true}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {currentDemo === 'demo' && (
            <div className="space-y-6">
              {/* Features Overview */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Key Features</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs text-white">✓</span>
                      </div>
                      <div>
                        <h3 className="font-medium">Click to Play</h3>
                        <p className="text-sm text-gray-400">Click any transcript segment to play the corresponding audio</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs text-white">✎</span>
                      </div>
                      <div>
                        <h3 className="font-medium">Edit Transcripts</h3>
                        <p className="text-sm text-gray-400">Correct AI transcription mistakes with inline editing</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs text-white">!</span>
                      </div>
                      <div>
                        <h3 className="font-medium">Review & Approve</h3>
                        <p className="text-sm text-gray-400">Mark segments as correct or flag them for review</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs text-white">⬇</span>
                      </div>
                      <div>
                        <h3 className="font-medium">Export Options</h3>
                        <p className="text-sm text-gray-400">Export as TXT, SRT, or JSON formats</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Demo Transcript */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Interactive Transcript</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => exportTranscript(demoTranscript, 'txt')}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                      <FaDownload className="inline mr-1" />
                      TXT
                    </button>
                    <button
                      onClick={() => exportTranscript(demoTranscript, 'srt')}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                      <FaDownload className="inline mr-1" />
                      SRT
                    </button>
                  </div>
                </div>
                
                <EditableTranscript
                  transcript={demoTranscript}
                  audioUrl={demoAudioUrl}
                  onTranscriptUpdate={(updatedTranscript) => {
                    // Demo mode - just log the changes
                    console.log("Demo transcript updated:", updatedTranscript);
                  }}
                  isEditable={true}
                />
              </div>

              {/* Instructions */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-3">How to Use</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium mb-2 text-blue-400">Playback Controls</h4>
                    <ul className="space-y-1 text-gray-300">
                      <li>• Click the play button to start/pause audio</li>
                      <li>• Click on timestamp to jump to that segment</li>
                      <li>• Audio will highlight the current segment</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2 text-green-400">Editing Features</h4>
                    <ul className="space-y-1 text-gray-300">
                      <li>• Click on text to edit inline</li>
                      <li>• Use checkmark to approve segments</li>
                      <li>• Use X to mark segments for review</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-gray-400 text-sm">
          <p>This demo showcases the editable transcript functionality. 
          Live Speech uses your browser's built-in speech recognition (Chrome/Edge recommended).</p>
        </div>
      </div>

      {/* Live Speech Recognition Modal */}
      {showLiveSpeech && (
        <LiveSpeechRecognition
          onTranscriptReady={handleLiveTranscriptReady}
          onClose={() => setShowLiveSpeech(false)}
        />
      )}
    </div>
  );
};

export default TranscriptDemo;
