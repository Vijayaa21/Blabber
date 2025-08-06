import { createContext, useContext, useState, useEffect } from 'react';

const TranscriptContext = createContext();

export const useTranscriptStore = () => {
  const context = useContext(TranscriptContext);
  if (!context) {
    throw new Error('useTranscriptStore must be used within a TranscriptProvider');
  }
  return context;
};

export const TranscriptProvider = ({ children }) => {
  const [userTranscripts, setUserTranscripts] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load transcripts from localStorage on mount
  useEffect(() => {
    console.log('🔄 Loading transcripts from localStorage...');
    const savedTranscripts = localStorage.getItem('userTranscripts');
    console.log('📦 Raw localStorage data:', savedTranscripts);
    
    if (savedTranscripts) {
      try {
        const parsed = JSON.parse(savedTranscripts);
        console.log('✅ Parsed transcripts:', parsed);
        setUserTranscripts(parsed);
      } catch (error) {
        console.error('❌ Failed to parse saved transcripts:', error);
        console.log('🗑️ Clearing corrupted data from localStorage');
        localStorage.removeItem('userTranscripts');
      }
    } else {
      console.log('📭 No saved transcripts found');
    }
    setIsLoaded(true);
  }, []);

  // Save transcripts to localStorage whenever they change
  useEffect(() => {
    // Don't save on initial load when array is empty
    if (!isLoaded) {
      console.log('⏭️ Skipping save - not loaded yet');
      return;
    }
    
    console.log('💾 Saving transcripts to localStorage:', userTranscripts);
    try {
      localStorage.setItem('userTranscripts', JSON.stringify(userTranscripts));
      console.log('✅ Transcripts saved successfully');
    } catch (error) {
      console.error('❌ Failed to save transcripts:', error);
      // If data is too large, try to save without audio data
      try {
        const transcriptsWithoutAudio = userTranscripts.map(t => ({
          ...t,
          audioUrl: t.audioUrl && t.audioUrl.length > 1000 ? null : t.audioUrl
        }));
        localStorage.setItem('userTranscripts', JSON.stringify(transcriptsWithoutAudio));
        console.log('⚠️ Saved transcripts without large audio data');
      } catch (secondError) {
        console.error('❌ Failed to save even without audio data:', secondError);
      }
    }
  }, [userTranscripts, isLoaded]);

  const addTranscript = (transcriptData) => {
    console.log('➕ Adding new transcript:', transcriptData);
    const newTranscript = {
      id: `transcript_${Date.now()}`,
      ...transcriptData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    console.log('🆕 New transcript object:', newTranscript);
    setUserTranscripts(prev => {
      const updated = [newTranscript, ...prev];
      console.log('📋 Updated transcripts array:', updated);
      return updated;
    });
    return newTranscript;
  };

  const updateTranscript = (transcriptId, updates) => {
    setUserTranscripts(prev => 
      prev.map(transcript => 
        transcript.id === transcriptId 
          ? { ...transcript, ...updates, updatedAt: new Date().toISOString() }
          : transcript
      )
    );
  };

  const deleteTranscript = (transcriptId) => {
    setUserTranscripts(prev => prev.filter(transcript => transcript.id !== transcriptId));
  };

  const getTranscript = (transcriptId) => {
    return userTranscripts.find(transcript => transcript.id === transcriptId);
  };

  const clearAllTranscripts = () => {
    setUserTranscripts([]);
  };

  const value = {
    userTranscripts,
    addTranscript,
    updateTranscript,
    deleteTranscript,
    getTranscript,
    clearAllTranscripts
  };

  return (
    <TranscriptContext.Provider value={value}>
      {children}
    </TranscriptContext.Provider>
  );
};
