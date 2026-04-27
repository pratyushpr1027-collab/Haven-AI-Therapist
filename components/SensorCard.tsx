import React, { useState, useRef, useEffect } from 'react';
import { Mood, Recommendation, MentalHealthData } from '../types';
import { moodMapping } from '../hooks/useIotData';
import { analyzeFacialExpression } from '../services/geminiService';

interface SensorCardProps {
  onLogMood: (mood: Mood, insight?: string, recommendation?: Recommendation) => void;
  data: MentalHealthData;
}

const SensorCard: React.FC<SensorCardProps> = ({ onLogMood, data }) => {
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [isCameraStarting, setIsCameraStarting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{ mood: Mood; insight: string; recommendation: Recommendation; } | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [analyzingMood, setAnalyzingMood] = useState<Mood>('Neutral');
  const analysisIntervalRef = useRef<number | null>(null);

  const stopStream = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const startAnalysisAnimation = () => {
    const moods = Object.keys(moodMapping) as Mood[];
    analysisIntervalRef.current = window.setInterval(() => {
      const randomMood = moods[Math.floor(Math.random() * moods.length)];
      setAnalyzingMood(randomMood);
    }, 200);
  };

  const stopAnalysisAnimation = () => {
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
      analysisIntervalRef.current = null;
    }
  };

  const handleOpenCameraModal = async () => {
    if (isCameraStarting || isCameraModalOpen) return;
    setIsCameraStarting(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      setIsCameraModalOpen(true);
    } catch (err) {
      console.error("Camera access denied:", err);
      setError("Camera access is required. Please enable it in your browser settings.");
    } finally {
      setIsCameraStarting(false);
    }
  };

  const handleCloseCameraModal = () => {
    stopStream();
    stopAnalysisAnimation();
    setIsCameraModalOpen(false);
    setIsProcessing(false);
  };

  const handleCloseResultModal = () => {
    setIsResultModalOpen(false);
    setAnalysisResult(null);
  };

  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setIsProcessing(true);
    setError(null);
    startAnalysisAnimation();

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

    const base64ImageData = canvas.toDataURL('image/jpeg').split(',')[1];

    try {
      const result = await analyzeFacialExpression(base64ImageData, data);
      if (result && moodMapping[result.mood]) {
        setAnalysisResult(result);
        onLogMood(result.mood, result.insight, result.recommendation);
        handleCloseCameraModal();
        setIsResultModalOpen(true);
      } else {
        throw new Error('Received an invalid mood from the analysis.');
      }
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred during analysis.';
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
      stopAnalysisAnimation();
    }
  };

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => {
    return () => {
      stopStream();
      stopAnalysisAnimation();
    };
  }, []);

  const currentMoodData = analysisResult ? moodMapping[analysisResult.mood] : null;

  return (
    <>
      <div className="glass-card p-5 h-full flex flex-col">
        <h3 className="font-semibold text-gray-300 mb-4 text-center font-heading">How are you feeling?</h3>

        <div className="flex-grow flex items-center justify-center my-2">
          <button
            onClick={handleOpenCameraModal}
            disabled={isCameraStarting}
            className="w-40 h-40 lg:w-48 lg:h-48 rounded-full border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-gray-400 hover:bg-white/5 hover:border-teal-400/50 hover:text-white transition-all duration-500 animate-[subtle-pulse_2.5s_ease-out_infinite] focus:outline-none focus:ring-2 focus:ring-teal-400/30 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:cursor-wait disabled:animate-none group"
            aria-label="Scan face to detect mood"
          >
            {isCameraStarting ? (
              <>
                <i className="fas fa-spinner fa-spin text-3xl mb-3"></i>
                <span className="font-semibold text-sm">Starting...</span>
              </>
            ) : (
              <>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                  <i className="fas fa-camera text-2xl text-teal-300"></i>
                </div>
                <span className="font-semibold text-sm">Scan Face</span>
                <span className="text-[10px] text-gray-600 mt-1">AI-powered mood detection</span>
              </>
            )}
          </button>
        </div>

        <div className="relative my-4 flex-shrink-0">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-white/5" />
          </div>
          <div className="relative flex justify-center">
            <span className="glass-card-static px-3 py-1 text-[10px] text-gray-500 uppercase tracking-wider">Or Log Manually</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 flex-shrink-0">
          {(Object.keys(moodMapping) as Mood[]).map((mood) => (
            <button
              key={mood}
              onClick={() => onLogMood(mood as Mood)}
              className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-teal-400/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-400/30 group ripple"
              aria-label={`Log mood as ${mood}`}
              title={mood}
            >
              <i className={`fas ${moodMapping[mood as Mood].icon} text-lg transition-transform duration-200 group-hover:scale-110`} style={{ color: moodMapping[mood as Mood].color }}></i>
              <span className="text-[10px] mt-1.5 text-gray-500 group-hover:text-gray-300 transition-colors">{mood}</span>
            </button>
          ))}
        </div>
        {error && <p className="text-red-400 text-xs text-center mt-2 flex-shrink-0">{error}</p>}
      </div>
      
      <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>

      {/* Camera Modal */}
      {isCameraModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-[fadeIn_0.2s_ease-out]">
          <div className="glass-card-static p-6 shadow-2xl max-w-3xl w-full relative animate-[scaleIn_0.3s_ease-out]" style={{ background: 'rgba(15, 23, 42, 0.95)' }}>
            <h3 className="text-xl font-bold mb-4 text-center font-heading">
              {isProcessing ? (
                <span className="gradient-text">Analyzing Expression...</span>
              ) : "Facial Scan"}
            </h3>
            <div className="relative bg-black rounded-xl overflow-hidden aspect-video">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
              {isProcessing && (
                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white">
                  <i className={`fas ${moodMapping[analyzingMood].icon} text-5xl mb-4 animate-pulse`} style={{ color: moodMapping[analyzingMood].color }}></i>
                  <span className="font-semibold text-lg">{analyzingMood}</span>
                  <span className="text-xs text-gray-400 mt-1">Processing with Gemini AI...</span>
                </div>
              )}
            </div>
            
            {error && !isCameraStarting && (
              <p className="text-red-400 text-sm text-center my-2">{error}</p>
            )}

            <div className="mt-5 flex justify-between items-center">
              <button
                onClick={handleCloseCameraModal}
                disabled={isProcessing}
                className="bg-white/5 hover:bg-white/10 text-gray-300 font-semibold py-2.5 px-5 rounded-xl transition-all border border-white/5 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCapture}
                disabled={isProcessing}
                className="glow-button text-white font-semibold py-2.5 px-5 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-wait ripple"
              >
                {isProcessing ? (
                  <> <i className="fas fa-spinner fa-spin relative z-10"></i> <span className="relative z-10">Processing</span> </>
                ) : (
                  <> <i className="fas fa-camera-retro relative z-10"></i> <span className="relative z-10">Capture</span> </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Result Modal */}
      {isResultModalOpen && analysisResult && currentMoodData && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-[fadeIn_0.2s_ease-out]">
          <div className="glass-card-static p-6 shadow-2xl max-w-3xl w-full relative animate-[scaleIn_0.3s_ease-out]" style={{ background: 'rgba(15, 23, 42, 0.95)' }}>
            <h3 
              className="text-xl font-bold mb-4 text-center font-heading"
              style={{ color: currentMoodData.color }}
            >
              <i className="fas fa-check-circle mr-2"></i>
              Analysis Complete: {analysisResult.mood}
            </h3>
            
            <div className="w-full glass-card-static p-6 overflow-y-auto" style={{ maxHeight: '75vh' }}>
              <div className="w-full grid md:grid-cols-2 gap-8 items-center">
                {/* Left Column: Icon and Insight */}
                <div className="text-center animate-[slideInUp_0.5s_ease-out]">
                  <div className="w-32 h-32 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: `${currentMoodData.color}15`, border: `2px solid ${currentMoodData.color}30` }}>
                    <i className={`fas ${currentMoodData.icon} text-7xl`} style={{ color: currentMoodData.color }}></i>
                  </div>
                  <p className="text-base text-gray-300 italic leading-relaxed">"{analysisResult.insight}"</p>
                </div>

                {/* Right Column: Recommendations */}
                <div className="space-y-3 animate-[slideInUp_0.5s_ease-out] opacity-0" style={{animationDelay: '100ms', animationFillMode: 'forwards'}}>
                  <h4 className="text-lg font-semibold text-white mb-3 text-center md:text-left font-heading">Your Recommendations</h4>
                  {[
                    { icon: 'fa-music', color: '#2DD4BF', label: 'Listen', value: `${analysisResult.recommendation.song.title} by ${analysisResult.recommendation.song.artist}` },
                    { icon: 'fa-podcast', color: '#818CF8', label: 'Podcast', value: `${analysisResult.recommendation.podcast.title} on ${analysisResult.recommendation.podcast.show}` },
                    { icon: 'fa-dumbbell', color: '#38BDF8', label: 'Move', value: analysisResult.recommendation.exercise },
                    { icon: 'fa-hand-holding-heart', color: '#FB7185', label: 'Do', value: analysisResult.recommendation.activity },
                  ].map((rec, idx) => (
                    <div key={idx} className="glass-card-static p-3 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${rec.color}15` }}>
                        <i className={`fas ${rec.icon} text-sm`} style={{ color: rec.color }}></i>
                      </div>
                      <div>
                        <h5 className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: rec.color }}>{rec.label}</h5>
                        <p className="text-gray-300 text-sm">{rec.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-teal-400 text-xs mt-6 text-center animate-[fadeIn_0.5s_ease-out]" style={{ animationDelay: '300ms' }}>
                <i className="fas fa-check mr-1"></i> Mood and insight logged
              </p>
            </div>

            <div className="mt-5 flex justify-center">
              <button onClick={handleCloseResultModal} className="bg-white/5 hover:bg-white/10 text-gray-300 font-semibold py-2.5 px-8 rounded-xl transition-all border border-white/5">
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SensorCard;