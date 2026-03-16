import { useState, useRef, useCallback } from 'react';
import { Camera, Upload, X, CheckCircle, AlertTriangle, RefreshCw, Leaf } from 'lucide-react';
import Webcam from 'react-webcam';
import { GoogleGenAI } from '@google/genai';
import { clsx } from 'clsx';
import { usePlants, Plant, Task } from '../context/PlantContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { format, addDays } from 'date-fns';

export default function Scan() {
  const [image, setImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationInput, setLocationInput] = useState('');
  const [weeklyScanAgreed, setWeeklyScanAgreed] = useState(false);
  const webcamRef = useRef<Webcam>(null);
  const { addPlant, addTask } = usePlants();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setImage(imageSrc);
      analyzeImage(imageSrc);
    }
  }, [webcamRef]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImage(base64String);
        analyzeImage(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async (base64Image: string) => {
    setIsScanning(true);
    setResult(null);

    try {
      // Remove the data URL prefix to get just the base64 string
      const base64Data = base64Image.split(',')[1];
      const mimeType = base64Image.split(';')[0].split(':')[1];

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const prompt = `
        Analyze this plant image and provide a JSON response with the following structure:
        {
          "plantType": "Name of the plant",
          "healthScore": number between 0 and 100,
          "diagnosis": "Brief description of its current state (e.g., 'Slight dehydration', 'Healthy', 'Pest infestation')",
          "recommendation": "Specific actionable advice for care",
          "issues": ["List of possible problems, if any"],
          "sunlight": "e.g., Bright indirect",
          "temperature": "e.g., 18-30°C",
          "humidity": "e.g., High (60%+)",
          "wateringFrequencyDays": number (e.g., 7 for every 7 days)
        }
        Only return the JSON object, nothing else.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType,
              },
            },
            { text: prompt },
          ],
        },
        config: {
          responseMimeType: 'application/json',
        }
      });

      const jsonStr = response.text?.trim();
      if (jsonStr) {
        setResult(JSON.parse(jsonStr));
      }
    } catch (error) {
      console.error('Error analyzing image:', error);
      setResult({
        plantType: 'Unknown Plant',
        healthScore: 0,
        diagnosis: 'Failed to analyze image.',
        recommendation: 'Please try again with a clearer photo.',
        issues: ['Analysis error'],
        sunlight: 'Unknown',
        temperature: 'Unknown',
        humidity: 'Unknown',
        wateringFrequencyDays: 7
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleSavePlant = () => {
    if (!result || !locationInput.trim() || !weeklyScanAgreed) return;

    const newPlant: Plant = {
      id: Date.now().toString(),
      name: result.plantType,
      type: result.plantType,
      health: result.healthScore,
      image: image || 'https://picsum.photos/seed/plant/400/400',
      location: locationInput,
      nextWater: 'Tomorrow',
      lastWatered: 'Unknown',
      sunlight: result.sunlight || 'Moderate',
      temperature: result.temperature || 'Room Temp',
      humidity: result.humidity || 'Average',
      history: [{ date: format(new Date(), 'MMM dd'), event: `Health Scan: ${result.healthScore}%`, type: 'scan' }]
    };

    addPlant(newPlant);

    const today = new Date();
    const freq = result.wateringFrequencyDays || 7;
    
    // Generate watering tasks for the next 30 days based on frequency
    for (let i = 1; i <= 30; i += freq) {
      addTask({
        id: Date.now().toString() + 'water' + i,
        plant: newPlant.name,
        time: 'Morning',
        amount: '150ml',
        completed: false,
        date: format(addDays(today, i), 'yyyy-MM-dd'),
        type: 'water'
      });
    }

    // Task 3: Weekly Health Scan (Recurring for next 4 weeks)
    for (let i = 1; i <= 4; i++) {
      addTask({
        id: Date.now().toString() + 'scan' + i,
        plant: newPlant.name,
        time: 'Anytime',
        amount: 'Take a picture',
        completed: false,
        date: format(addDays(today, 7 * i), 'yyyy-MM-dd'),
        type: 'scan'
      });
    }

    setShowLocationModal(false);
    navigate('/plants');
  };

  return (
    <div className="flex flex-col h-full bg-stone-900 text-white relative">
      {/* Header */}
      <div className="absolute top-0 w-full z-10 p-4 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent">
        <h1 className="text-xl font-bold tracking-tight">{t('Plant Scanner')}</h1>
        {image && (
          <button onClick={() => { setImage(null); setResult(null); }} className="p-2 bg-black/40 rounded-full backdrop-blur-sm hover:bg-black/60 transition-colors">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Camera / Image View */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        {!image ? (
          <div className="w-full h-full relative">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={{ facingMode: 'environment' }}
              className="w-full h-full object-cover"
            />
            {/* Scanner Overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-64 h-64 border-2 border-emerald-500/50 rounded-3xl relative">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-500 rounded-tl-3xl"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-500 rounded-tr-3xl"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-500 rounded-bl-3xl"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-500 rounded-br-3xl"></div>
              </div>
            </div>
          </div>
        ) : (
          <img src={image} alt="Captured plant" className="w-full h-full object-cover" />
        )}

        {/* Scanning Animation Overlay */}
        {isScanning && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-20">
            <div className="relative w-24 h-24 mb-6">
              <div className="absolute inset-0 border-4 border-emerald-500/30 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin"></div>
              <Leaf className="absolute inset-0 m-auto w-8 h-8 text-emerald-400 animate-pulse" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">{t('Analyzing Plant...')}</h2>
            <p className="text-stone-300 text-sm">{t('Identifying species and checking health')}</p>
          </div>
        )}
      </div>

      {/* Controls / Results */}
      <div className={clsx(
        "absolute bottom-0 w-full bg-white text-stone-900 rounded-t-3xl transition-transform duration-500 ease-in-out z-30 shadow-[0_-10px_40px_rgba(0,0,0,0.2)]",
        result ? "translate-y-0" : "translate-y-full"
      )}>
        {result && (
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            <div className="w-12 h-1.5 bg-stone-200 rounded-full mx-auto mb-6"></div>
            
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-stone-800">{result.plantType}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className={clsx(
                    "text-sm font-bold px-2 py-1 rounded-md",
                    result.healthScore >= 80 ? "bg-emerald-100 text-emerald-700" :
                    result.healthScore >= 50 ? "bg-yellow-100 text-yellow-700" :
                    "bg-red-100 text-red-700"
                  )}>
                    {t('Health')}: {result.healthScore}%
                  </span>
                </div>
              </div>
              <div className={clsx(
                "w-12 h-12 rounded-full flex items-center justify-center",
                result.healthScore >= 80 ? "bg-emerald-100 text-emerald-600" :
                result.healthScore >= 50 ? "bg-yellow-100 text-yellow-600" :
                "bg-red-100 text-red-600"
              )}>
                {result.healthScore >= 80 ? <CheckCircle className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
                <h3 className="text-sm font-bold text-stone-500 uppercase tracking-wider mb-2">{t('Diagnosis')}</h3>
                <p className="text-stone-800 font-medium">{result.diagnosis}</p>
              </div>

              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                <h3 className="text-sm font-bold text-emerald-600 uppercase tracking-wider mb-2">{t('Recommendation')}</h3>
                <p className="text-emerald-900 font-medium">{result.recommendation}</p>
              </div>

              {result.issues && result.issues.length > 0 && (
                <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
                  <h3 className="text-sm font-bold text-red-600 uppercase tracking-wider mb-2">{t('Possible Issues')}</h3>
                  <ul className="list-disc list-inside text-red-900 font-medium space-y-1">
                    {result.issues.map((issue: string, idx: number) => (
                      <li key={idx}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="mt-8 flex gap-3">
              <button className="flex-1 bg-stone-100 text-stone-800 py-3 rounded-xl font-bold hover:bg-stone-200 transition-colors" onClick={() => { setImage(null); setResult(null); }}>
                {t('Scan Another')}
              </button>
              <button 
                onClick={() => setShowLocationModal(true)}
                className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20"
              >
                {t('Save to My Plants')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Location Modal */}
      {showLocationModal && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md text-stone-900 shadow-2xl">
            <h3 className="text-xl font-bold mb-2">{t('Where is this plant located?')}</h3>
            <p className="text-stone-500 text-sm mb-4">{t('This helps us customize its care schedule based on typical room conditions.')}</p>
            
            <input 
              type="text" 
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              placeholder="e.g., Living Room, Bedroom, Office..." 
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all mb-4"
              autoFocus
            />

            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl mb-6 flex items-start gap-3">
              <input 
                type="checkbox" 
                id="weekly-scan"
                checked={weeklyScanAgreed}
                onChange={(e) => setWeeklyScanAgreed(e.target.checked)}
                className="mt-1 w-5 h-5 text-emerald-600 rounded border-emerald-300 focus:ring-emerald-500 shrink-0"
              />
              <label htmlFor="weekly-scan" className="text-sm text-emerald-900 font-medium cursor-pointer leading-tight">
                {t('I agree to take a picture of this plant each week for its routine Health Scan to ensure it stays healthy.')}
              </label>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setShowLocationModal(false)}
                className="flex-1 bg-stone-100 text-stone-800 py-3 rounded-xl font-bold hover:bg-stone-200 transition-colors"
              >
                {t('Cancel')}
              </button>
              <button 
                onClick={handleSavePlant}
                disabled={!locationInput.trim() || !weeklyScanAgreed}
                className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20 disabled:opacity-50"
              >
                {t('Save Plant')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Capture Controls */}
      {!image && !isScanning && (
        <div className="absolute bottom-0 w-full p-8 flex justify-center items-center gap-8 bg-gradient-to-t from-black/80 via-black/40 to-transparent pb-24 md:pb-8">
          <label className="w-12 h-12 rounded-full bg-stone-800/80 backdrop-blur-md flex items-center justify-center text-white cursor-pointer hover:bg-stone-700 transition-colors">
            <Upload className="w-5 h-5" />
            <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
          </label>
          
          <button 
            onClick={capture}
            className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center focus:outline-none hover:scale-105 transition-transform"
          >
            <div className="w-16 h-16 rounded-full bg-white"></div>
          </button>
          
          <button className="w-12 h-12 rounded-full bg-stone-800/80 backdrop-blur-md flex items-center justify-center text-white hover:bg-stone-700 transition-colors">
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
