import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

const useTranscript = (postId) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const queryClient = useQueryClient();

  // Mock transcript generation (you can replace this with actual API call)
  const generateMockTranscript = useCallback((audioFile) => {
    console.log('useTranscript: generateMockTranscript called with audioFile:', audioFile);
    return new Promise((resolve) => {
      console.log('useTranscript: Starting 2-second delay for mock transcript...');
      setTimeout(() => {
        console.log('useTranscript: Mock delay complete, generating transcript...');
        // Generate a more realistic transcript based on audio duration
        const baseTranscript = [
          {
            id: "1",
            text: `Audio recording captured on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}. Duration: ${Math.round(audioFile.size / 1000)}KB.`,
            startTime: 0,
            endTime: 4.2,
            speaker: "User",
            confidence: 0.92,
            isConfirmed: false,
            isEdited: false,
            needsReview: false
          },
          {
            id: "2", 
            text: "This is your recorded audio content. The actual transcript would contain the spoken words from your recording.",
            startTime: 4.2,
            endTime: 8.5,
            speaker: "User",
            confidence: 0.87,
            isConfirmed: false,
            isEdited: false,
            needsReview: false
          },
          {
            id: "3",
            text: "In a production environment, this would be replaced with real speech-to-text transcription from services like OpenAI Whisper, Google Speech-to-Text, or Azure Speech Services.",
            startTime: 8.5,
            endTime: 15.8,
            speaker: "User",
            confidence: 0.94,
            isConfirmed: false,
            isEdited: false,
            needsReview: false
          }
        ];
        
        // Add a timestamp to make each transcript unique
        const timestamp = Date.now();
        const transcriptWithIds = baseTranscript.map((segment, index) => ({
          ...segment,
          id: `${timestamp}_${index + 1}`
        }));
        
        console.log('useTranscript: Mock transcript created:', transcriptWithIds);
        resolve(transcriptWithIds);
      }, 2000);
    });
  }, []);

  // Generate transcript from audio
  const { mutateAsync: generateTranscriptAsync, isPending: isGenerating } = useMutation({
    mutationFn: async ({ audioFile, audioUrl }) => {
      console.log('useTranscript: generateTranscript called with:', { audioFile, audioUrl });
      setIsProcessing(true);
      try {
        // In a real implementation, you would send the audio to a transcription service
        // For demo purposes, we'll use mock data
        console.log('useTranscript: Generating mock transcript...');
        const transcript = await generateMockTranscript(audioFile);
        console.log('useTranscript: Mock transcript generated:', transcript);
        return { transcript, audioUrl };
      } catch (error) {
        console.error('useTranscript: Error in generateTranscript:', error);
        throw new Error("Failed to generate transcript");
      } finally {
        setIsProcessing(false);
      }
    },
    onSuccess: (data) => {
      console.log('useTranscript: Transcript generation successful:', data);
      toast.success("Transcript generated successfully!");
      return data;
    },
    onError: (error) => {
      console.error('useTranscript: Transcript generation failed:', error);
      toast.error(error.message);
      setIsProcessing(false);
    }
  });

  // Update transcript for a post
  const { mutate: updateTranscript, isPending: isUpdating } = useMutation({
    mutationFn: async ({ postId, transcript }) => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/posts/${postId}/transcript`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ transcript }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update transcript");
      }
      return data;
    },
    onSuccess: () => {
      toast.success("Transcript updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  // Validate and process audio file
  const validateAudioFile = useCallback((file) => {
    const maxSize = 50 * 1024 * 1024; // 50MB
    const allowedTypes = ['audio/mp3', 'audio/wav', 'audio/mpeg', 'audio/ogg', 'audio/mp4'];

    if (!file) {
      throw new Error("No file provided");
    }

    if (file.size > maxSize) {
      throw new Error("File size must be less than 50MB");
    }

    if (!allowedTypes.includes(file.type)) {
      throw new Error("File must be an audio file (MP3, WAV, OGG, or MP4)");
    }

    return true;
  }, []);

  // Process audio file for transcription
  const processAudioFile = useCallback(async (file) => {
    try {
      validateAudioFile(file);
      
      // Create audio URL for playback
      const audioUrl = URL.createObjectURL(file);
      
      // Generate transcript using the mutation
      const result = await generateTranscriptAsync({ audioFile: file, audioUrl });
      return result;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  }, [generateTranscriptAsync, validateAudioFile]);

  // Export transcript to different formats
  const exportTranscript = useCallback((transcript, format = 'txt') => {
    let content = '';
    
    switch (format) {
      case 'txt':
        content = transcript.map(segment => 
          `[${formatTime(segment.startTime)} - ${formatTime(segment.endTime)}] ${segment.speaker || 'Speaker'}: ${segment.text}`
        ).join('\n\n');
        break;
        
      case 'srt':
        content = transcript.map((segment, index) => {
          const startTime = formatSRTTime(segment.startTime);
          const endTime = formatSRTTime(segment.endTime);
          return `${index + 1}\n${startTime} --> ${endTime}\n${segment.text}\n`;
        }).join('\n');
        break;
        
      case 'json':
        content = JSON.stringify(transcript, null, 2);
        break;
        
      default:
        throw new Error('Unsupported format');
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success(`Transcript exported as ${format.toUpperCase()}`);
  }, []);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatSRTTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
  };

  return {
    generateTranscript: generateTranscriptAsync,
    updateTranscript: (transcript) => updateTranscript({ postId, transcript }),
    exportTranscript,
    isGenerating,
    isUpdating,
    isProcessing,
    validateAudioFile
  };
};

export default useTranscript;
