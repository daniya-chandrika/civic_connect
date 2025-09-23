import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIssues } from '../context/IssueContext';
import { Category, Priority } from '../types';
import Header from '../components/Header';
import { categorizeImage, generateSummary, GeminiError } from '../services/geminiService';
import { CameraIcon, LightBulbIcon, MicrophoneIcon } from '@heroicons/react/24/solid';

// Fix: Add types for the Web Speech API to resolve TypeScript errors.
// --- Web Speech API Type Definitions for browsers that support it ---
// These are not included in standard TypeScript DOM typings yet.
interface SpeechRecognitionAlternative {
    readonly transcript: string;
    readonly confidence: number;
}
interface SpeechRecognitionResult {
    readonly isFinal: boolean;
    readonly length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
}
interface SpeechRecognitionResultList {
    readonly length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
}
interface SpeechRecognitionEvent extends Event {
    readonly resultIndex: number;
    readonly results: SpeechRecognitionResultList;
}
interface SpeechRecognitionErrorEvent extends Event {
    readonly error: string;
    readonly message: string;
}
interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    onresult: (event: SpeechRecognitionEvent) => void;
    onerror: (event: SpeechRecognitionErrorEvent) => void;
    onend: () => void;
    start: () => void;
    stop: () => void;
}

declare var SpeechRecognition: {
    new (): SpeechRecognition;
};

// For Web Speech API compatibility
interface CustomWindow extends Window {
  SpeechRecognition: typeof SpeechRecognition;
  webkitSpeechRecognition: typeof SpeechRecognition;
}
declare let window: CustomWindow;

const ReportIssuePage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [position, setPosition] = useState<GeolocationPosition | null>(null);
  const [category, setCategory] = useState<Category>(Category.OTHER);
  const [priority, setPriority] = useState<Priority>(Priority.LOW);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Voice Recognition State ---
  const [isListeningFor, setIsListeningFor] = useState<'title' | 'description' | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const initialTextRef = useRef<string>('');
  const isSpeechRecognitionSupported = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;


  const { addIssue } = useIssues();
  const navigate = useNavigate();

  useEffect(() => {
    if (isSpeechRecognitionSupported) {
        const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognitionAPI();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
    }

    // Cleanup function to stop listening if component unmounts
    return () => {
        recognitionRef.current?.stop();
    };
  }, [isSpeechRecognitionSupported]);


  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setError('');
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNextStep = async () => {
    if (!image) {
      setError("A live photo is required to proceed.");
      return;
    }
    setError('');
    setIsProcessing(true);
    setProcessingMessage('Detecting location...');

    // 1. Get Location
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
      });
      setPosition(pos); // Store the full position object
      const coords = `Lat: ${pos.coords.latitude.toFixed(4)}, Lon: ${pos.coords.longitude.toFixed(4)}`;
      setLocation(coords);
    } catch (err) {
      const geoError = err as GeolocationPositionError;
      let errorMessage = 'Could not detect your location.';
      if (geoError.code === geoError.PERMISSION_DENIED) {
        errorMessage = 'Location access denied. Please enable location permissions for this site in your browser settings to proceed.';
      } else if (geoError.code === geoError.POSITION_UNAVAILABLE) {
        errorMessage = 'Location information is unavailable. Please check your GPS or network connection.';
      } else if (geoError.code === geoError.TIMEOUT) {
        errorMessage = 'Location detection timed out. Please try again.';
      }
      setError(errorMessage);
      setIsProcessing(false);
      return;
    }

    // 2. Analyze Image
    setProcessingMessage('Analyzing image...');
    try {
      const base64String = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve((reader.result as string).split(',')[1]);
          reader.onerror = (error) => reject(error);
          reader.readAsDataURL(image);
      });

      const detectedCategory = await categorizeImage(base64String, image.type);
      setCategory(detectedCategory);
      setStep(2);
    } catch (err) {
      console.error("Failed to process image:", err);
      if (err instanceof GeminiError) {
          if (err.message === 'Timeout') {
              setError("Image analysis took too long. Please check your connection and try again with a clearer photo.");
          } else if (err.message === 'UnrecognizedImage') {
              setError("Image not recognized as a civic issue. Please take a clear photo of the problem (e.g., a pothole, graffiti).");
          } else {
              setError("An unknown error occurred during image analysis. Please try again.");
          }
      } else {
        setError("Could not analyze the image. The AI service may be unavailable. Please try again.");
      }
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleGenerateTitle = async () => {
      if (!description) {
          setError("Please provide a description first to generate a title.");
          return;
      }
      setIsSummarizing(true);
      setError('');
      try {
          const summary = await generateSummary(description);
          setTitle(summary);
      } catch(err) {
          console.error("Failed to generate summary:", err);
          setError("Could not generate a title. Please write one manually.");
      } finally {
          setIsSummarizing(false);
      }
  }

  const handleToggleListening = (field: 'title' | 'description') => {
      const recognition = recognitionRef.current;
      if (!recognition) return;

      if (isListeningFor) {
          recognition.stop();
          setIsListeningFor(null);
          return;
      }

      initialTextRef.current = field === 'title' ? title : description;

      recognition.onresult = (event) => {
          const transcript = Array.from(event.results)
              .map(result => result[0])
              .map(result => result.transcript)
              .join('');

          const newText = initialTextRef.current ? `${initialTextRef.current} ${transcript}` : transcript;

          if (field === 'title') {
              setTitle(newText);
          } else {
              setDescription(newText);
          }
      };

      recognition.onerror = (event) => {
          console.error("Speech recognition error", event.error);
          setError(`Voice recognition error: ${event.error}. Please ensure microphone access is granted.`);
          setIsListeningFor(null);
      };

      recognition.onend = () => {
          setIsListeningFor(null);
      };

      recognition.start();
      setIsListeningFor(field);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !location || !position) {
      setError('Please fill in all required fields and ensure location is detected.');
      return;
    }
    setError('');
    setIsProcessing(true);
    setProcessingMessage('Submitting issue...');
    
    try {
      await addIssue({
        title,
        description,
        location,
        category,
        priority,
        imageUrl: imagePreview || undefined,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
      navigate('/citizen');
    } catch (err: any) {
        if (err.message === 'DUPLICATE_REPORT') {
            setError("You've already reported an issue at this location. It won't be submitted again, but its priority will increase if other citizens report it.");
        } else {
            setError('Failed to submit the issue. Please try again.');
        }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-slate-100 dark:bg-slate-900 min-h-screen">
      <Header />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-2xl mx-auto bg-white dark:bg-slate-800 rounded-lg shadow-md p-8 relative">
          
          {isProcessing && (
            <div className="absolute inset-0 bg-white/80 dark:bg-slate-800/80 flex flex-col justify-center items-center z-10 rounded-lg">
                <svg className="animate-spin h-8 w-8 text-sky-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="mt-4 text-slate-600 dark:text-slate-300 font-semibold">{processingMessage}</p>
            </div>
          )}

          {step === 1 && (
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Step 1: Take a Photo</h1>
              <p className="text-slate-600 dark:text-slate-400 mb-6">A live photo is required to verify the issue and its location.</p>
              
              <div
                className="mt-1 flex justify-center px-6 pt-10 pb-12 border-2 border-slate-300 dark:border-slate-600 border-dashed rounded-md cursor-pointer hover:border-sky-500"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="space-y-1 text-center">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Issue preview" className="mx-auto h-48 w-auto rounded-md object-contain" />
                  ) : (
                    <>
                      <CameraIcon className="mx-auto h-12 w-12 text-slate-400" />
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        <span className="font-semibold text-sky-500">Tap to open camera</span>
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-500">A live photo is required</p>
                    </>
                  )}
                </div>
              </div>
              <input
                id="image-upload"
                name="image-upload"
                type="file"
                className="sr-only"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                capture="environment"
              />

              {error && <p className="text-sm text-red-600 mt-2 text-center font-medium">{error}</p>}
              
              <div className="pt-6">
                <button
                  type="button"
                  onClick={handleNextStep}
                  disabled={!image || isProcessing}
                  className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
             <form onSubmit={handleSubmit} className="space-y-6">
               <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Step 2: Provide Details</h1>
                
                {imagePreview && (
                    <div>
                        <img src={imagePreview} alt="Issue preview" className="mx-auto h-48 w-auto rounded-md object-contain" />
                    </div>
                )}
                
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    AI Detected Category
                  </label>
                  <input
                    type="text"
                    name="category"
                    id="category"
                    className="mt-1 block w-full rounded-md border-slate-300 shadow-sm sm:text-sm bg-slate-100 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    value={category}
                    readOnly
                    disabled
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Description
                  </label>
                  <div className="mt-1 relative">
                    <textarea
                        id="description"
                        name="description"
                        rows={4}
                        className="block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400 pr-10"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    />
                    {isSpeechRecognitionSupported && (
                        <button
                            type="button"
                            onClick={() => handleToggleListening('description')}
                            className="absolute top-2 right-2 p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600"
                            aria-label="Use voice for description"
                        >
                            <MicrophoneIcon className={`h-5 w-5 ${isListeningFor === 'description' ? 'text-red-500 animate-pulse' : 'text-slate-500 dark:text-slate-400'}`} />
                        </button>
                    )}
                  </div>
                </div>
                
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Title
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                     <div className="relative flex-grow">
                        <input
                            type="text"
                            name="title"
                            id="title"
                            className="block w-full rounded-none rounded-l-md border-slate-300 focus:border-sky-500 focus:ring-sky-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white pr-10"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                        {isSpeechRecognitionSupported && (
                            <button
                                type="button"
                                onClick={() => handleToggleListening('title')}
                                className="absolute inset-y-0 right-0 flex items-center pr-3"
                                aria-label="Use voice for title"
                            >
                                <MicrophoneIcon className={`h-5 w-5 ${isListeningFor === 'title' ? 'text-red-500 animate-pulse' : 'text-slate-500 dark:text-slate-400'}`} />
                            </button>
                        )}
                     </div>
                      <button
                        type="button"
                        onClick={handleGenerateTitle}
                        disabled={isSummarizing || !description}
                        className="relative -ml-px inline-flex items-center space-x-2 rounded-r-md border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 disabled:opacity-50 dark:bg-slate-600 dark:border-slate-500 dark:text-slate-200 dark:hover:bg-slate-500"
                      >
                        <LightBulbIcon className="h-5 w-5 text-yellow-400" />
                        <span>{isSummarizing ? 'Generating...' : 'Generate with AI'}</span>
                      </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Location (Automatically Detected)
                  </label>
                  <input
                    type="text"
                    name="location"
                    id="location"
                    className="mt-1 block w-full rounded-md border-slate-300 shadow-sm sm:text-sm bg-slate-100 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    value={location}
                    readOnly
                    disabled
                  />
                </div>

                <div>
                  <label htmlFor="priority" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Initial Priority
                  </label>
                  <select
                    id="priority"
                    name="priority"
                    className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                  >
                    {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                
                {error && <p className="text-sm text-red-600 text-center font-medium">{error}</p>}

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50"
                  >
                    Submit Issue
                  </button>
                </div>
              </form>
          )}

        </div>
      </main>
    </div>
  );
};

export default ReportIssuePage;
