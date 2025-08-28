import React, { createContext, useContext, useState, useEffect } from 'react';

const VoiceContext = createContext();

export const VoiceProvider = ({ children }) => {
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voice, setVoice] = useState(null);
  const [supportedLanguages] = useState({
    en: 'en-US',
    hi: 'hi-IN',
    kn: 'kn-IN',
    ta: 'ta-IN',
    ml: 'ml-IN'
  });

  // Initialize speech synthesis
  useEffect(() => {
    if ('speechSynthesis' in window) {
      const loadVoices = () => {
        const voices = speechSynthesis.getVoices();
        // Try to find a Hindi voice first, fallback to English
        const hindiVoice = voices.find(voice => voice.lang.includes('hi'));
        const englishVoice = voices.find(voice => voice.lang.includes('en-US'));
        setVoice(hindiVoice || englishVoice || voices[0]);
      };

      // Load voices immediately if available
      loadVoices();
      
      // Also listen for voiceschanged event (Chrome needs this)
      speechSynthesis.addEventListener('voiceschanged', loadVoices);

      return () => {
        speechSynthesis.removeEventListener('voiceschanged', loadVoices);
      };
    }
  }, []);

  const speak = (text, language = 'en') => {
    if (!isVoiceEnabled || !text || !('speechSynthesis' in window)) {
      return;
    }

    // Stop any current speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set language-specific voice if available
    const voices = speechSynthesis.getVoices();
    const langCode = supportedLanguages[language] || 'en-US';
    const preferredVoice = voices.find(voice => 
      voice.lang.includes(langCode) || voice.lang.includes(language)
    );
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    } else if (voice) {
      utterance.voice = voice;
    }

    utterance.lang = langCode;
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1;
    utterance.volume = 0.8;

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsSpeaking(false);
    };

    try {
      speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Error speaking text:', error);
      setIsSpeaking(false);
    }
  };

  const stop = () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const toggleVoice = () => {
    if (isSpeaking) {
      stop();
    }
    setIsVoiceEnabled(!isVoiceEnabled);
  };

  // Emergency announcement for critical alerts
  const emergencyAnnouncement = (message, language = 'en') => {
    const urgentMessage = language === 'hi' 
      ? `आपातकाल! ${message}` 
      : language === 'kn' 
      ? `ತುರ್ತು! ${message}`
      : language === 'ta'
      ? `அவசரம்! ${message}`
      : language === 'ml'
      ? `അടിയന്തിരം! ${message}`
      : `Emergency Alert! ${message}`;
    
    speak(urgentMessage, language);
  };

  const announceWeatherAlert = (alertType, villageName, language = 'en') => {
    const messages = {
      en: {
        drought: `Drought alert for ${villageName}. Immediate irrigation required.`,
        flood: `Flood warning for ${villageName}. Prepare evacuation if necessary.`,
        pest: `Pest infestation detected in ${villageName}. Contact agricultural officer.`,
        disease: `Crop disease outbreak in ${villageName}. Take immediate action.`
      },
      hi: {
        drought: `${villageName} में सूखे की चेतावनी। तत्काल सिंचाई की आवश्यकता है।`,
        flood: `${villageName} में बाढ़ की चेतावनी। आवश्यक हो तो निकासी की तैयारी करें।`,
        pest: `${villageName} में कीट प्रकोप का पता चला है। कृषि अधिकारी से संपर्क करें।`,
        disease: `${villageName} में फसल रोग का प्रकोप। तुरंत कार्रवाई करें।`
      }
    };

    const message = messages[language]?.[alertType] || messages.en[alertType] || `Alert for ${villageName}`;
    speak(message, language);
  };

  const value = {
    isVoiceEnabled,
    isSpeaking,
    speak,
    stop,
    toggleVoice,
    emergencyAnnouncement,
    announceWeatherAlert,
    supportedLanguages
  };

  return (
    <VoiceContext.Provider value={value}>
      {children}
    </VoiceContext.Provider>
  );
};

export const useVoice = () => {
  const context = useContext(VoiceContext);
  if (!context) {
    throw new Error('useVoice must be used within a VoiceProvider');
  }
  return context;
};