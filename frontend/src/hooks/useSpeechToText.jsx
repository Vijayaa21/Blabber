import { useState, useCallback, useRef } from "react";
import { toast } from "react-hot-toast";

const useSpeechToText = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [segments, setSegments] = useState([]);
  const [isSupported, setIsSupported] = useState(false);
  
  const recognitionRef = useRef(null);
  const startTimeRef = useRef(null);
  const segmentIdRef = useRef(1);

  // Check if browser supports Speech Recognition
  const checkSupport = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const supported = !!SpeechRecognition;
    setIsSupported(supported);
    
    if (!supported) {
      toast.error("Speech recognition not supported in this browser. Try Chrome or Edge.");
    }
    
    return supported;
  }, []);

  // Initialize speech recognition
  const initializeRecognition = useCallback(() => {
    if (!checkSupport()) return null;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    // Configuration
    recognition.continuous = true;           // Keep listening
    recognition.interimResults = true;       // Get partial results
    recognition.lang = 'en-US';             // Language (you can make this configurable)
    recognition.maxAlternatives = 1;        // Number of alternative transcriptions

    // Event handlers
    recognition.onstart = () => {
      console.log("🎤 Speech recognition started successfully");
      setIsListening(true);
      startTimeRef.current = Date.now();
      toast.success("Listening... Speak now!");
    };

    recognition.onspeechstart = () => {
      console.log("🗣️ Speech detected! Starting to process...");
      toast.success("Speech detected! Keep talking...");
    };

    recognition.onspeechend = () => {
      console.log("🔇 Speech ended");
    };

    recognition.onsoundstart = () => {
      console.log("🔊 Sound detected");
    };

    recognition.onsoundend = () => {
      console.log("🔇 Sound ended");
    };

    recognition.onaudiostart = () => {
      console.log("🎵 Audio input started");
    };

    recognition.onaudioend = () => {
      console.log("🎵 Audio input ended");
    };

    recognition.onresult = (event) => {
      console.log("📝 Speech recognition result received:", event);
      let interimText = '';
      let finalText = '';

      // Process all results
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcriptText = result[0].transcript;
        console.log(`Result ${i}: "${transcriptText}" (final: ${result.isFinal}, confidence: ${result[0].confidence})`);

        if (result.isFinal) {
          finalText += transcriptText + ' ';
          
          // Create a new segment for final results
          const currentTime = Date.now();
          const startTime = (currentTime - startTimeRef.current) / 1000;
          const endTime = startTime + 3; // Estimate 3 seconds per segment
          
          const newSegment = {
            id: `segment_${segmentIdRef.current++}`,
            text: transcriptText.trim(),
            startTime: Math.max(0, startTime - 3),
            endTime: startTime,
            speaker: "User",
            confidence: result[0].confidence || 0.9,
            isConfirmed: false,
            isEdited: false,
            needsReview: result[0].confidence < 0.8
          };

          console.log("📄 New segment created:", newSegment);
          setSegments(prev => [...prev, newSegment]);
        } else {
          interimText += transcriptText;
          console.log("🔄 Interim result:", transcriptText);
        }
      }

      // Update interim transcript
      setInterimTranscript(interimText);

      // Update final transcript
      if (finalText) {
        console.log("✅ Final transcript added:", finalText);
        setTranscript(prev => prev + finalText);
      }
    };

    recognition.onerror = (event) => {
      console.error("🚨 Speech recognition error:", event.error, event);
      setIsListening(false);
      
      switch (event.error) {
        case 'no-speech':
          toast.error("No speech detected. Please speak louder or check your microphone.");
          console.log("💡 Tip: Make sure you're speaking clearly and your microphone is working");
          break;
        case 'audio-capture':
          toast.error("No microphone found. Please check your microphone connection.");
          console.log("💡 Tip: Check if your microphone is connected and not used by another app");
          break;
        case 'not-allowed':
          toast.error("Microphone access denied. Please allow microphone access and try again.");
          console.log("💡 Tip: Click the microphone icon in your browser's address bar to allow access");
          break;
        case 'network':
          toast.error("Network error. Please check your internet connection.");
          console.log("💡 Tip: Speech recognition requires an internet connection in most browsers");
          break;
        case 'service-not-allowed':
          toast.error("Speech service not available. Please try again later.");
          break;
        case 'bad-grammar':
          toast.error("Grammar error in speech recognition.");
          break;
        case 'language-not-supported':
          toast.error("Language not supported. Trying English...");
          break;
        default:
          toast.error(`Speech recognition error: ${event.error}`);
          console.log("💡 Error details:", event);
      }
    };

    recognition.onend = () => {
      console.log("Speech recognition ended");
      setIsListening(false);
    };

    return recognition;
  }, [checkSupport]);

  // Start speech recognition
  const startListening = useCallback(() => {
    if (!checkSupport()) return;

    // Reset state
    setTranscript("");
    setInterimTranscript("");
    setSegments([]);
    segmentIdRef.current = 1;

    const recognition = initializeRecognition();
    if (recognition) {
      recognitionRef.current = recognition;
      try {
        recognition.start();
      } catch (error) {
        console.error("Error starting speech recognition:", error);
        toast.error("Could not start speech recognition. Please try again.");
      }
    }
  }, [initializeRecognition, checkSupport]);

  // Stop speech recognition
  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      toast.success("Speech recognition stopped");
    }
  }, [isListening]);

  // Convert audio file to speech (not directly supported by Web Speech API)
  const transcribeAudioFile = useCallback(async (audioBlob) => {
    toast.error("File transcription not supported with Web Speech API. Please use 'Live Recording' mode instead.");
    return null;
  }, []);

  // Get formatted transcript for saving
  const getFormattedTranscript = useCallback(() => {
    return segments.length > 0 ? segments : [
      {
        id: "1",
        text: transcript.trim() || "No speech detected",
        startTime: 0,
        endTime: 5,
        speaker: "User",
        confidence: 0.9,
        isConfirmed: false,
        isEdited: false,
        needsReview: false
      }
    ];
  }, [segments, transcript]);

  // Check microphone permissions and test audio input
  const checkMicrophone = useCallback(async () => {
    try {
      console.log("🎤 Checking microphone permissions...");
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("✅ Microphone access granted");
      
      // Test audio levels
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      microphone.connect(analyser);
      
      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      // Check audio level for 2 seconds
      let maxLevel = 0;
      const checkLevel = () => {
        analyser.getByteFrequencyData(dataArray);
        const level = Math.max(...dataArray);
        maxLevel = Math.max(maxLevel, level);
      };
      
      const interval = setInterval(checkLevel, 100);
      
      setTimeout(() => {
        clearInterval(interval);
        stream.getTracks().forEach(track => track.stop());
        audioContext.close();
        
        console.log(`🔊 Max audio level detected: ${maxLevel}/255`);
        
        if (maxLevel < 10) {
          toast.warning("Microphone level seems low. Please speak louder or check microphone settings.");
        } else {
          toast.success("Microphone is working! You can start speech recognition.");
        }
      }, 2000);
      
      return true;
    } catch (error) {
      console.error("🚨 Microphone check failed:", error);
      
      if (error.name === 'NotAllowedError') {
        toast.error("Microphone access denied. Please allow microphone access in your browser settings.");
      } else if (error.name === 'NotFoundError') {
        toast.error("No microphone found. Please connect a microphone and try again.");
      } else {
        toast.error("Could not access microphone: " + error.message);
      }
      
      return false;
    }
  }, []);

  return {
    // State
    isListening,
    transcript,
    interimTranscript,
    segments,
    isSupported,
    
    // Actions
    startListening,
    stopListening,
    transcribeAudioFile,
    getFormattedTranscript,
    checkSupport,
    checkMicrophone
  };
};

export default useSpeechToText;
