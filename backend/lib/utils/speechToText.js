import FormData from 'form-data';
import fetch from 'node-fetch';

export const transcribeWithWhisper = async (audioBuffer, fileName = 'audio.webm') => {
  try {
    const formData = new FormData();
    formData.append('file', audioBuffer, {
      filename: fileName,
      contentType: 'audio/webm'
    });
    formData.append('model', 'whisper-1');
    formData.append('response_format', 'verbose_json'); // Get timestamps
    formData.append('timestamp_granularities[]', 'segment');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        ...formData.getHeaders()
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    // Transform to our format
    const segments = result.segments?.map((segment, index) => ({
      id: `segment_${Date.now()}_${index}`,
      text: segment.text.trim(),
      startTime: segment.start,
      endTime: segment.end,
      speaker: "User", // Whisper doesn't do speaker detection in basic mode
      confidence: segment.avg_logprob ? Math.exp(segment.avg_logprob) : 0.9,
      isConfirmed: false,
      isEdited: false,
      needsReview: segment.avg_logprob ? Math.exp(segment.avg_logprob) < 0.7 : false
    })) || [
      {
        id: `segment_${Date.now()}_1`,
        text: result.text,
        startTime: 0,
        endTime: 30, // Estimate if no segments
        speaker: "User",
        confidence: 0.9,
        isConfirmed: false,
        isEdited: false,
        needsReview: false
      }
    ];

    return {
      success: true,
      transcript: segments,
      originalText: result.text,
      language: result.language,
      duration: result.duration
    };

  } catch (error) {
    console.error('Whisper transcription error:', error);
    return {
      success: false,
      error: error.message,
      transcript: []
    };
  }
};

export const transcribeWithBrowserAPI = () => {
  // For real-time browser transcription
  return new Promise((resolve, reject) => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      reject(new Error('Speech recognition not supported'));
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    let finalTranscript = '';
    let segments = [];
    let startTime = Date.now();

    recognition.onresult = (event) => {
      let interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
          segments.push({
            id: `segment_${Date.now()}_${segments.length + 1}`,
            text: transcript.trim(),
            startTime: (Date.now() - startTime) / 1000,
            endTime: (Date.now() - startTime + 3000) / 1000, // Estimate 3s duration
            speaker: "User",
            confidence: event.results[i][0].confidence || 0.9,
            isConfirmed: false,
            isEdited: false,
            needsReview: (event.results[i][0].confidence || 0.9) < 0.7
          });
        } else {
          interimTranscript += transcript;
        }
      }
    };

    recognition.onerror = (event) => {
      reject(new Error(`Speech recognition error: ${event.error}`));
    };

    recognition.onend = () => {
      resolve({
        success: true,
        transcript: segments,
        originalText: finalTranscript,
        language: 'en-US'
      });
    };

    recognition.start();
  });
};
