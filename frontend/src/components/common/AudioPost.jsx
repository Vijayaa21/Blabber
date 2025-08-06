import { useState } from "react";
import { FaMicrophone, FaFileAudio, FaDownload, FaTimes } from "react-icons/fa";
import { toast } from "react-hot-toast";
import AudioRecorder from "./AudioRecorder";
import EditableTranscript from "./EditableTranscript";
import LoadingSpinner from "./LoadingSpinner";
import useTranscript from "../../hooks/useTranscript";
import { useTranscriptStore } from "../../contexts/TranscriptContext";

const AudioPost = ({ post, onClose }) => {
  const [currentStep, setCurrentStep] = useState('record'); // 'record', 'transcript', 'review'
  const [audioData, setAudioData] = useState(null);
  const [transcript, setTranscript] = useState(post?.transcript || []);
  const { addTranscript, updateTranscript: updateStoredTranscript } = useTranscriptStore();
  
  const {
    generateTranscript,
    updateTranscript,
    exportTranscript,
    isGenerating,
    isUpdating,
    isProcessing
  } = useTranscript(post?._id);

  const handleAudioReady = async (audioBlob, audioUrl) => {
    console.log('AudioPost: handleAudioReady called with:', { audioBlob, audioUrl });
    
    try {
      setCurrentStep('transcript');
      console.log('AudioPost: Step set to transcript, generating...');
      
      // Generate transcript from audio
      const result = await generateTranscript({ audioFile: audioBlob, audioUrl });
      console.log('AudioPost: Transcript generated:', result);
      
      setAudioData({
        blob: audioBlob,
        url: audioUrl,
        transcript: result.transcript
      });
      
      setTranscript(result.transcript);
      console.log('AudioPost: Transcript state updated');
      
      // Save to transcript store
      const savedTranscript = addTranscript({
        title: `Recording ${new Date().toLocaleString()}`,
        audioUrl: audioUrl,
        transcript: result.transcript,
        audioFileName: audioBlob.name || `recording_${Date.now()}.webm`,
        audioSize: audioBlob.size
      });
      
      console.log('AudioPost: Transcript saved to store:', savedTranscript);
      setCurrentStep('review');
      console.log('AudioPost: Step set to review');
    } catch (error) {
      console.error("AudioPost: Error processing audio:", error);
      toast.error("Failed to process audio: " + error.message);
      setCurrentStep('record'); // Go back to record step on error
    }
  };

  const handleTranscriptUpdate = async (updatedTranscript) => {
    try {
      if (post?._id) {
        await updateTranscript(updatedTranscript);
      }
      setTranscript(updatedTranscript);
    } catch (error) {
      console.error("Error updating transcript:", error);
      throw error;
    }
  };

  const handleExport = (format) => {
    exportTranscript(transcript, format);
  };

  const renderStepIndicator = () => {
    const steps = [
      { key: 'record', label: 'Record/Upload', icon: FaMicrophone },
      { key: 'transcript', label: 'Generate', icon: FaFileAudio },
      { key: 'review', label: 'Review & Edit', icon: FaDownload }
    ];

    return (
      <div className="flex justify-center mb-6">
        <div className="flex items-center space-x-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.key;
            const isCompleted = steps.findIndex(s => s.key === currentStep) > index;
            
            return (
              <div key={step.key} className="flex items-center">
                <div
                  className={`
                    flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all
                    ${isActive 
                      ? 'bg-blue-600 border-blue-600 text-white' 
                      : isCompleted 
                        ? 'bg-green-600 border-green-600 text-white'
                        : 'border-gray-600 text-gray-400'
                    }
                  `}
                >
                  <Icon className="text-sm" />
                </div>
                <span className={`ml-2 text-sm ${isActive ? 'text-white' : 'text-gray-400'}`}>
                  {step.label}
                </span>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-0.5 mx-4 ${isCompleted ? 'bg-green-600' : 'bg-gray-600'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (currentStep) {
      case 'record':
        return (
          <AudioRecorder
            onAudioReady={handleAudioReady}
            isProcessing={isGenerating || isProcessing}
          />
        );
        
      case 'transcript':
        return (
          <div className="text-center py-8">
            <LoadingSpinner size="lg" />
            <p className="text-white mt-4">Generating transcript...</p>
            <p className="text-gray-400 text-sm mt-2">This may take a few moments</p>
          </div>
        );
        
      case 'review':
        return (
          <div className="space-y-4">
            {/* Export Options */}
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Review & Edit Transcript</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => handleExport('txt')}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm transition-colors"
                >
                  Export TXT
                </button>
                <button
                  onClick={() => handleExport('srt')}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm transition-colors"
                >
                  Export SRT
                </button>
                <button
                  onClick={() => handleExport('json')}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm transition-colors"
                >
                  Export JSON
                </button>
              </div>
            </div>
            
            {/* Editable Transcript */}
            <EditableTranscript
              transcript={transcript}
              audioUrl={audioData?.url}
              onTranscriptUpdate={handleTranscriptUpdate}
              isEditable={true}
              postId={post?._id}
            />
            
            {/* Navigation */}
            <div className="flex justify-between pt-4">
              <button
                onClick={() => setCurrentStep('record')}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors"
              >
                Record New Audio
              </button>
              <button
                onClick={onClose}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">
            {post ? 'Edit Audio Transcript' : 'Create Audio Post'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {renderStepIndicator()}
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AudioPost;
