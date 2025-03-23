import React, { useState, useEffect } from 'react';
import { Button, Box, IconButton, Tooltip } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';

interface SpeechToTextProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

const SpeechToText: React.FC<SpeechToTextProps> = ({ onTranscript, disabled = false }) => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  useEffect(() => {
    // Check if browser supports speech recognition
    if ('webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join(' ');
        onTranscript(transcript);
      };

      recognitionInstance.onerror = (event: SpeechRecognitionError) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, [onTranscript]);

  const toggleListening = () => {
    if (!recognition) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Tooltip title={isListening ? "Stop recording" : "Start recording"}>
        <IconButton
          onClick={toggleListening}
          disabled={disabled}
          color={isListening ? "error" : "primary"}
          aria-label={isListening ? "stop recording" : "start recording"}
        >
          {isListening ? <StopIcon /> : <MicIcon />}
        </IconButton>
      </Tooltip>
      {isListening && (
        <Box sx={{ ml: 1, color: 'text.secondary' }}>
          Listening...
        </Box>
      )}
    </Box>
  );
};

export default SpeechToText; 