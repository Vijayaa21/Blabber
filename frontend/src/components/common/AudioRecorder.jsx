import { useState, useRef, useEffect } from "react";
import { FaMicrophone, FaStop, FaPlay, FaPause, FaUpload, FaTrash } from "react-icons/fa";
import { toast } from "react-hot-toast";
import LoadingSpinner from "./LoadingSpinner";

const AudioRecorder = ({ onAudioReady, isProcessing = false }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  
  const mediaRecorderRef = useRef(null);
  const audioRef = useRef(null);
  const timerRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      toast.success("Recording started");
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast.error("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      toast.success("Recording stopped");
    }
  };

  const playRecording = () => {
    if (audioRef.current && audioUrl) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const pauseRecording = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const deleteRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setIsPlaying(false);
    setRecordingTime(0);
    toast.success("Recording deleted");
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['audio/mp3', 'audio/wav', 'audio/mpeg', 'audio/ogg', 'audio/mp4', 'audio/webm'];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Please upload a valid audio file (MP3, WAV, OGG, or MP4)");
        return;
      }

      // Validate file size (50MB max)
      const maxSize = 50 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error("File size must be less than 50MB");
        return;
      }

      const url = URL.createObjectURL(file);
      setAudioBlob(file);
      setAudioUrl(url);
      toast.success("Audio file uploaded");
    }
  };

  const processAudio = () => {
    console.log('AudioRecorder: processAudio called', { 
      audioBlob, 
      audioUrl, 
      onAudioReady: typeof onAudioReady,
      hasBoth: !!(audioBlob && onAudioReady)
    });
    
    if (audioBlob && onAudioReady) {
      console.log('AudioRecorder: Calling onAudioReady with:', { audioBlob, audioUrl });
      onAudioReady(audioBlob, audioUrl);
    } else {
      console.log('AudioRecorder: Cannot process - missing audioBlob or onAudioReady');
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4">Audio Recording</h3>
      
      {/* Recording Controls */}
      <div className="space-y-4">
        {!audioBlob && (
          <div className="flex flex-col items-center space-y-4">
            {/* Record Button */}
            <div className="flex items-center gap-4">
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isProcessing}
                className={`
                  flex items-center justify-center w-16 h-16 rounded-full transition-all duration-200
                  ${isRecording 
                    ? 'bg-red-600 hover:bg-red-700 animate-pulse' 
                    : 'bg-blue-600 hover:bg-blue-700'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                {isRecording ? (
                  <FaStop className="text-white text-xl" />
                ) : (
                  <FaMicrophone className="text-white text-xl" />
                )}
              </button>
              
              {isRecording && (
                <div className="text-center">
                  <div className="text-red-500 font-mono text-xl">
                    {formatTime(recordingTime)}
                  </div>
                  <div className="text-gray-400 text-sm">Recording...</div>
                </div>
              )}
            </div>

            {/* File Upload Option */}
            <div className="w-full">
              <div className="text-center text-gray-400 mb-2">or</div>
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer hover:bg-gray-700 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <FaUpload className="text-gray-400 text-2xl mb-2" />
                  <p className="text-sm text-gray-400">
                    <span className="font-semibold">Click to upload</span> an audio file
                  </p>
                  <p className="text-xs text-gray-500">MP3, WAV, OGG, or MP4 (max 50MB)</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  disabled={isProcessing}
                />
              </label>
            </div>
          </div>
        )}

        {/* Audio Preview */}
        {audioUrl && (
          <div className="space-y-4">
            <audio
              ref={audioRef}
              src={audioUrl}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
            
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white font-medium">Audio Preview</span>
                <div className="flex gap-2">
                  <button
                    onClick={isPlaying ? pauseRecording : playRecording}
                    className="flex items-center justify-center w-8 h-8 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors"
                  >
                    {isPlaying ? (
                      <FaPause className="text-white text-sm" />
                    ) : (
                      <FaPlay className="text-white text-sm ml-0.5" />
                    )}
                  </button>
                  <button
                    onClick={deleteRecording}
                    className="flex items-center justify-center w-8 h-8 bg-red-600 hover:bg-red-700 rounded-full transition-colors"
                  >
                    <FaTrash className="text-white text-sm" />
                  </button>
                </div>
              </div>
              
              <div className="text-sm text-gray-300 mb-3">
                Duration: {recordingTime > 0 ? formatTime(recordingTime) : "Unknown"}
              </div>
              
              <button
                onClick={processAudio}
                disabled={isProcessing}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Processing...
                  </>
                ) : (
                  <>
                    <FaUpload />
                    Generate Transcript
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Recording Tips */}
      <div className="mt-4 p-3 bg-gray-700 rounded-lg">
        <h4 className="text-sm font-medium text-white mb-2">Tips for better transcription:</h4>
        <ul className="text-xs text-gray-300 space-y-1">
          <li>• Speak clearly and at a moderate pace</li>
          <li>• Minimize background noise</li>
          <li>• Keep the microphone at a consistent distance</li>
          <li>• Pause between speakers in conversations</li>
        </ul>
      </div>
    </div>
  );
};

export default AudioRecorder;
