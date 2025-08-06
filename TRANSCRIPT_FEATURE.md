# Editable Transcript Feature

This feature provides a comprehensive solution for audio transcription, editing, and playback within the Blabber application. Users can record audio, generate transcripts, and edit them with interactive playback controls.

## 🎯 Features

### Core Functionality
- **Audio Recording**: Record audio directly in the browser
- **File Upload**: Support for MP3, WAV, OGG, and MP4 files (max 50MB)
- **Interactive Playback**: Click segments to play corresponding audio
- **Real-time Editing**: Edit transcript text inline with instant saving
- **Segment Management**: Mark segments as correct, incorrect, or needing review
- **Export Options**: Export transcripts as TXT, SRT, or JSON

### User Experience
- **Visual Feedback**: Color-coded segments based on status
- **Confidence Scoring**: Shows AI confidence levels for each segment
- **Speaker Detection**: Identifies different speakers in conversations
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Keyboard Shortcuts**: Quick editing with Enter/Escape keys

## 🏗️ Architecture

### Frontend Components

#### 1. EditableTranscript Component
**Location**: `frontend/src/components/common/EditableTranscript.jsx`
- Main container for transcript functionality
- Manages audio playback and transcript state
- Handles segment highlighting and navigation

#### 2. TranscriptSegment Component  
**Location**: `frontend/src/components/common/TranscriptSegment.jsx`
- Individual transcript segment with editing capabilities
- Status indicators and action buttons
- Inline text editing with validation

#### 3. AudioRecorder Component
**Location**: `frontend/src/components/common/AudioRecorder.jsx`
- Audio recording with browser MediaRecorder API
- File upload with validation
- Audio preview with playback controls

#### 4. AudioPost Component
**Location**: `frontend/src/components/common/AudioPost.jsx`
- Complete workflow for creating audio posts
- Step-by-step interface (Record → Generate → Review)
- Integration with post creation system

### Backend Integration

#### 1. Post Model Updates
**Location**: `backend/models/post.model.js`
- Added `audioUrl` field for audio file storage
- Added `transcript` array with segment schema
- Support for confidence scores and editing status

#### 2. API Endpoints
**Location**: `backend/routes/post.route.js`
- `PUT /api/posts/:id/transcript` - Update transcript data
- Validation for transcript format and permissions

#### 3. Controller Methods
**Location**: `backend/controllers/post.controller.js`
- `updateTranscript()` - Handle transcript updates with validation
- User authorization checks
- Proper error handling

### Custom Hooks

#### useTranscript Hook
**Location**: `frontend/src/hooks/useTranscript.jsx`
- Centralized transcript management logic
- File validation and processing
- Export functionality for multiple formats
- Integration with React Query for data management

## 🚀 Usage Examples

### Basic Integration

```jsx
import EditableTranscript from './components/common/EditableTranscript';

function MyComponent() {
  const [transcript, setTranscript] = useState([]);
  
  const handleTranscriptUpdate = async (updatedTranscript) => {
    // Save transcript to backend
    await updateTranscript(updatedTranscript);
    setTranscript(updatedTranscript);
  };

  return (
    <EditableTranscript
      transcript={transcript}
      audioUrl="/path/to/audio.mp3"
      onTranscriptUpdate={handleTranscriptUpdate}
      isEditable={true}
      postId="post123"
    />
  );
}
```

### Recording Audio

```jsx
import AudioRecorder from './components/common/AudioRecorder';

function RecordingComponent() {
  const handleAudioReady = (audioBlob, audioUrl) => {
    console.log('Audio ready for processing:', { audioBlob, audioUrl });
    // Process audio and generate transcript
  };

  return (
    <AudioRecorder 
      onAudioReady={handleAudioReady}
      isProcessing={false}
    />
  );
}
```

### Using the Hook

```jsx
import useTranscript from './hooks/useTranscript';

function TranscriptManager({ postId }) {
  const {
    generateTranscript,
    updateTranscript,
    exportTranscript,
    isGenerating,
    isUpdating
  } = useTranscript(postId);

  const handleFileUpload = async (file) => {
    try {
      const result = await generateTranscript(file);
      console.log('Generated transcript:', result);
    } catch (error) {
      console.error('Failed to generate transcript:', error);
    }
  };

  return (
    <div>
      <input 
        type="file" 
        accept="audio/*" 
        onChange={(e) => handleFileUpload(e.target.files[0])} 
      />
      {isGenerating && <p>Generating transcript...</p>}
    </div>
  );
}
```

## 📊 Data Structure

### Transcript Segment Schema

```javascript
{
  id: "unique-segment-id",
  text: "The transcribed text for this segment",
  startTime: 0.0,           // Start time in seconds
  endTime: 5.2,             // End time in seconds
  speaker: "Speaker 1",     // Speaker identification
  confidence: 0.95,         // AI confidence (0-1)
  isConfirmed: false,       // User confirmed as correct
  isEdited: false,          // Has been edited by user
  needsReview: false        // Flagged for review
}
```

### Post Model Extension

```javascript
{
  // ... existing post fields
  audioUrl: "https://cloudinary.com/audio.mp3",
  transcript: [
    // Array of transcript segments
  ]
}
```

## 🎨 Styling & Theming

### Status Color Coding
- **Green**: Confirmed segments (user approved)
- **Blue**: Edited segments (user modified)
- **Red**: Needs review (flagged by user)
- **Gray**: Pending (not yet reviewed)

### Responsive Breakpoints
- Mobile: Single column layout
- Tablet: Optimized controls and spacing
- Desktop: Full feature set with multi-column layout

## 🔧 Configuration

### Audio Settings
```javascript
const audioConstraints = {
  echoCancellation: true,
  noiseSuppression: true,
  sampleRate: 44100
};
```

### File Validation
```javascript
const validationRules = {
  maxSize: 50 * 1024 * 1024, // 50MB
  allowedTypes: ['audio/mp3', 'audio/wav', 'audio/mpeg', 'audio/ogg', 'audio/mp4']
};
```

## 🔍 Demo

Visit `/demo/transcript` to see the feature in action with:
- Interactive transcript editing
- Audio playback controls
- Export functionality
- Recording capabilities

## 🚀 Future Enhancements

### Planned Features
1. **Real-time Transcription**: Live transcription during recording
2. **Multi-language Support**: Automatic language detection
3. **Voice Commands**: Control playback with voice
4. **Collaboration**: Multiple users editing same transcript
5. **Analytics**: Transcript accuracy metrics

### Integration Opportunities
1. **AI Services**: Integration with Google Speech-to-Text, Azure Cognitive Services
2. **Cloud Storage**: Direct upload to cloud storage services
3. **Search**: Full-text search across all transcripts
4. **Accessibility**: Screen reader optimization

## 🛠️ Development

### Running the Demo
```bash
# Start the frontend development server
cd frontend
npm run dev

# Access the demo at
http://localhost:5173/demo/transcript
```

### Testing
The feature includes comprehensive error handling and validation:
- File type validation
- Size limits
- Permission checks
- Network error handling

### Performance Considerations
- Lazy loading of audio components
- Efficient segment rendering
- Optimized audio playback
- Memory cleanup for audio objects

This implementation provides a solid foundation for audio transcription features and can be extended based on specific requirements.
