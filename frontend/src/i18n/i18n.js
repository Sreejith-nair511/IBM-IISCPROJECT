import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // Navigation
      'Digital Sarpanch': 'Digital Sarpanch',
      'Dashboard': 'Dashboard',
      'Village Map': 'Village Map',
      'Alerts': 'Alerts',
      
      // Dashboard
      'Total Villages': 'Total Villages',
      'Active Alerts': 'Active Alerts',
      'Critical Alerts': 'Critical Alerts',
      'Villages at Risk': 'Villages at Risk',
      'Select Village': 'Select Village',
      'Village Details': 'Village Details',
      'Soil Moisture Trend': 'Soil Moisture Trend',
      'Temperature & Humidity': 'Temperature & Humidity',
      'Recent Alerts': 'Recent Alerts',
      'Trigger Simulation': 'Trigger Simulation',
      'Drought Simulation': 'Drought Simulation',
      'Flood Simulation': 'Flood Simulation',
      'Pest Alert': 'Pest Alert',
      'Disease Warning': 'Disease Warning',
      
      // Village Info
      'Population': 'Population',
      'Area': 'Area',
      'Crop': 'Crop',
      'Soil Type': 'Soil Type',
      'Irrigation': 'Irrigation',
      'Last Updated': 'Last Updated',
      
      // Chart Labels
      'Soil Moisture (%)': 'Soil Moisture (%)',
      'Temperature (°C)': 'Temperature (°C)',
      'Humidity (%)': 'Humidity (%)',
      'pH Level': 'pH Level',
      'Day': 'Day',
      
      // Alerts
      'Severity': 'Severity',
      'Message': 'Message',
      'Timestamp': 'Timestamp',
      'Dismiss': 'Dismiss',
      'No active alerts': 'No active alerts',
      
      // Severity levels
      'low': 'Low',
      'medium': 'Medium',
      'high': 'High',
      'critical': 'Critical',
      
      // States
      'Karnataka': 'Karnataka',
      'Tamil Nadu': 'Tamil Nadu',
      'Maharashtra': 'Maharashtra',
      'Kerala': 'Kerala',
      
      // Misc
      'Loading...': 'Loading...',
      'Error': 'Error',
      'Success': 'Success',
      'hectares': 'hectares'
    }
  },
  hi: {
    translation: {
      // Navigation
      'Digital Sarpanch': 'डिजिटल सरपंच',
      'Dashboard': 'डैशबोर्ड',
      'Village Map': 'गाँव का नक्शा',
      'Alerts': 'चेतावनी',
      
      // Dashboard
      'Total Villages': 'कुल गाँव',
      'Active Alerts': 'सक्रिय अलर्ट',
      'Critical Alerts': 'गंभीर अलर्ट',
      'Villages at Risk': 'खतरे में गाँव',
      'Select Village': 'गाँव चुनें',
      'Village Details': 'गाँव विवरण',
      'Soil Moisture Trend': 'मिट्टी नमी ट्रेंड',
      'Temperature & Humidity': 'तापमान और आर्द्रता',
      'Recent Alerts': 'हाल की चेतावनी',
      'Trigger Simulation': 'सिमुलेशन ट्रिगर',
      'Drought Simulation': 'सूखा सिमुलेशन',
      'Flood Simulation': 'बाढ़ सिमुलेशन',
      'Pest Alert': 'कीट चेतावनी',
      'Disease Warning': 'रोग चेतावनी',
      
      // Village Info
      'Population': 'जनसंख्या',
      'Area': 'क्षेत्र',
      'Crop': 'फसल',
      'Soil Type': 'मिट्टी प्रकार',
      'Irrigation': 'सिंचाई',
      'Last Updated': 'अंतिम अपडेट',
      
      // States
      'Karnataka': 'कर्नाटक',
      'Tamil Nadu': 'तमिल नाडु',
      'Maharashtra': 'महाराष्ट्र',
      'Kerala': 'केरल'
    }
  },
  kn: {
    translation: {
      // Navigation
      'Digital Sarpanch': 'ಡಿಜಿಟಲ್ ಸರ್ಪಂಚ್',
      'Dashboard': 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
      'Village Map': 'ಗ್ರಾಮ ನಕ್ಷೆ',
      'Alerts': 'ಎಚ್ಚರಿಕೆಗಳು',
      
      // Dashboard
      'Total Villages': 'ಒಟ್ಟು ಗ್ರಾಮಗಳು',
      'Active Alerts': 'ಸಕ್ರಿಯ ಎಚ್ಚರಿಕೆಗಳು',
      'Critical Alerts': 'ಗಂಭೀರ ಎಚ್ಚರಿಕೆಗಳು',
      'Villages at Risk': 'ಅಪಾಯದಲ್ಲಿರುವ ಗ್ರಾಮಗಳು',
      'Select Village': 'ಗ್ರಾಮ ಆಯ್ಕೆ',
      'Village Details': 'ಗ್ರಾಮ ವಿವರಗಳು',
      'Soil Moisture Trend': 'ಮಣ್ಣಿನ ತೇವಾಂಶ ಪ್ರವೃತ್ತಿ',
      'Temperature & Humidity': 'ತಾಪಮಾನ ಮತ್ತು ಆರ್ದ್ರತೆ',
      'Recent Alerts': 'ಇತ್ತೀಚಿನ ಎಚ್ಚರಿಕೆಗಳು',
      
      // Village Info
      'Population': 'ಜನಸಂಖ್ಯೆ',
      'Area': 'ವಿಸ್ತೀರ್ಣ',
      'Crop': 'ಬೆಳೆ',
      'Soil Type': 'ಮಣ್ಣಿನ ಪ್ರಕಾರ',
      'Irrigation': 'ನೀರಾವರಿ'
    }
  },
  ta: {
    translation: {
      // Navigation
      'Digital Sarpanch': 'டிஜிட்டல் சர்பஞ்ச்',
      'Dashboard': 'டாஷ்போர்டு',
      'Village Map': 'கிராம வரைபடம்',
      'Alerts': 'எச்சரிக்கைகள்',
      
      // Dashboard
      'Total Villages': 'மொத்த கிராமங்கள்',
      'Active Alerts': 'செயலில் உள்ள எச்சரிக்கைகள்',
      'Critical Alerts': 'முக்கியமான எச்சரிக்கைகள்',
      'Villages at Risk': 'ஆபத்தில் உள்ள கிராமங்கள்',
      'Select Village': 'கிராமத்தை தேர்ந்தெடுக்கவும்',
      'Village Details': 'கிராம விவரங்கள்',
      'Soil Moisture Trend': 'மண் ஈரப்பதம் போக்கு',
      'Temperature & Humidity': 'வெப்பநிலை மற்றும் ஈரப்பதம்',
      'Recent Alerts': 'சமீபத்திய எச்சரிக்கைகள்',
      
      // Village Info
      'Population': 'மக்கள்தொகை',
      'Area': 'பரப்பளவு',
      'Crop': 'பயிர்',
      'Soil Type': 'மண் வகை',
      'Irrigation': 'நீர்ப்பாசனம்'
    }
  },
  ml: {
    translation: {
      // Navigation
      'Digital Sarpanch': 'ഡിജിറ്റൽ സർപഞ്ച്',
      'Dashboard': 'ഡാഷ്ബോർഡ്',
      'Village Map': 'ഗ്രാമ ഭൂപടം',
      'Alerts': 'മുന്നറിയിപ്പുകൾ',
      
      // Dashboard
      'Total Villages': 'മൊത്തം ഗ്രാമങ്ങൾ',
      'Active Alerts': 'സജീവ മുന്നറിയിപ്പുകൾ',
      'Critical Alerts': 'ഗുരുതരമായ മുന്നറിയിപ്പുകൾ',
      'Villages at Risk': 'അപകടത്തിലുള്ള ഗ്രാമങ്ങൾ',
      'Select Village': 'ഗ്രാമം തിരഞ്ഞെടുക്കുക',
      'Village Details': 'ഗ്രാമ വിശദാംശങ്ങൾ',
      'Soil Moisture Trend': 'മണ്ണിന്റെ ഈർപ്പം ട്രെന്റ്',
      'Temperature & Humidity': 'താപനിലയും ഈർപ്പവും',
      'Recent Alerts': 'സമീപകാല മുന്നറിയിപ്പുകൾ',
      
      // Village Info
      'Population': 'ജനസംഖ്യ',
      'Area': 'വിസ്തൃതി',
      'Crop': 'വിള',
      'Soil Type': 'മണ്ണിന്റെ തരം',
      'Irrigation': 'ജലസേചനം'
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n;