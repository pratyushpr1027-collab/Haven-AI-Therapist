import React, { useState, useEffect, useRef, useCallback } from 'react';

const BREATH_CYCLE = 8000; // 4s in, 4s out
const INHALE_DURATION = 4000;

interface BreathingExerciseProps {
  isDashboardWidget?: boolean;
  onNavigate?: () => void;
}

const ambientSounds = [
    { id: 'rain', name: 'Rain', icon: 'fa-cloud-showers-heavy', url: 'https://cdn.pixabay.com/audio/2022/10/20/audio_29329e5c54.mp3' },
    { id: 'forest', name: 'Forest', icon: 'fa-tree', url: 'https://cdn.pixabay.com/audio/2022/11/17/audio_88c14c5221.mp3' },
    { id: 'waves', name: 'Waves', icon: 'fa-water', url: 'https://cdn.pixabay.com/audio/2023/09/10/audio_1737f7146d.mp3' },
    { id: 'river', name: 'River', icon: 'fa-leaf', url: 'https://cdn.pixabay.com/audio/2022/04/24/audio_323b17c09d.mp3' },
];
const allSoundOptions = [{ id: 'none', name: 'None', icon: 'fa-ban' }, ...ambientSounds];

const BreathingExercise: React.FC<BreathingExerciseProps> = ({ isDashboardWidget = false, onNavigate }) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);
  const [instruction, setInstruction] = useState<string>('Select a duration to begin');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [activeAmbientSound, setActiveAmbientSound] = useState<string>('none');
  const [isSoundMenuOpen, setIsSoundMenuOpen] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(() => {
    const savedVolume = localStorage.getItem('haven-breathing-volume');
    return savedVolume !== null ? parseFloat(savedVolume) : 0.5;
  });

  const audioCtxRef = useRef<AudioContext | null>(null);
  const ambientAudioRef = useRef<HTMLAudioElement | null>(null);
  const sessionActiveRef = useRef(isSessionActive);
  const fadeIntervalRef = useRef<number | null>(null);
  
  useEffect(() => {
    localStorage.setItem('haven-breathing-volume', volume.toString());
  }, [volume]);

  useEffect(() => {
    sessionActiveRef.current = isSessionActive;
  }, [isSessionActive]);

  const playSound = useCallback((type: 'inhale' | 'exhale' | 'complete') => {
    if (isMuted || !audioCtxRef.current || volume === 0) return;

    const audioCtx = audioCtxRef.current;
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.2 * volume, audioCtx.currentTime + 0.05);

    if (type === 'inhale') {
      oscillator.frequency.setValueAtTime(261.63, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.5);
    } else if (type === 'exhale') {
      oscillator.frequency.setValueAtTime(220.00, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.8);
    } else if (type === 'complete') {
      oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1.0);
    }

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 1.2);
  }, [isMuted, volume]);
  
  const endSession = useCallback(() => {
    setIsSessionActive(false);
    setTimeLeft(0);
    playSound('complete');
    setInstruction('Session complete. Well done! ✓');
    setTimeout(() => setInstruction('Select a duration to begin'), 3000);
  }, [playSound]);

  const startSession = (duration: number) => {
    if (!audioCtxRef.current) {
      try {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (e) {
        console.error("Web Audio API is not supported in this browser");
        setIsMuted(true);
        return;
      }
    }
    audioCtxRef.current.resume();
    setTimeLeft(duration);
    setIsSessionActive(true);
  };

  const handleAmbientSoundSelect = (soundId: string) => {
      setActiveAmbientSound(soundId);
      setIsSoundMenuOpen(false);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    } else if (newVolume === 0 && !isMuted) {
      setIsMuted(true);
    }
  };

  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    if (!newMutedState && volume === 0) {
      setVolume(0.5);
    }
  };
  
  useEffect(() => {
    if (!isSessionActive) return;
    const timerId = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          endSession();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    return () => clearInterval(timerId);
  }, [isSessionActive, endSession]);

  useEffect(() => {
    if (!isSessionActive) return;
    const updateInstruction = () => {
      setInstruction('Breathe In...');
      playSound('inhale');
      setTimeout(() => {
        if (sessionActiveRef.current) {
          setInstruction('Breathe Out...');
          playSound('exhale');
        }
      }, INHALE_DURATION);
    };
    updateInstruction();
    const instructionInterval = setInterval(updateInstruction, BREATH_CYCLE);
    return () => clearInterval(instructionInterval);
  }, [isSessionActive, playSound]);

  // Effect for ambient sound
  useEffect(() => {
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
    }

    const audioEl = ambientAudioRef.current;
    const sound = ambientSounds.find(s => s.id === activeAmbientSound);
    const shouldBePlaying = isSessionActive && !!sound && !isMuted && volume > 0;

    if (shouldBePlaying) {
      let currentAudio = audioEl;
      if (!currentAudio || currentAudio.src !== sound.url) {
        if (currentAudio) currentAudio.pause();
        currentAudio = new Audio(sound!.url);
        currentAudio.loop = true;
        ambientAudioRef.current = currentAudio;
      }

      if (currentAudio.paused) {
        currentAudio.volume = 0;
        currentAudio.play().catch(e => console.error("Error playing ambient sound:", e));
        
        fadeIntervalRef.current = window.setInterval(() => {
          if (!ambientAudioRef.current) return;
          const currentVol = ambientAudioRef.current.volume;
          const newVolume = Math.min(currentVol + 0.1, volume);
          ambientAudioRef.current.volume = newVolume;
          if (newVolume >= volume) {
            if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
          }
        }, 100);
      } else {
         currentAudio.volume = volume;
      }
    } else if (audioEl && !audioEl.paused) {
      fadeIntervalRef.current = window.setInterval(() => {
        if (!ambientAudioRef.current) return;
        const newVolume = ambientAudioRef.current.volume - 0.1;
        if (newVolume > 0) {
          ambientAudioRef.current.volume = newVolume;
        } else {
          ambientAudioRef.current.pause();
          if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
        }
      }, 100);
    }

    return () => {
      if (ambientAudioRef.current) {
        ambientAudioRef.current.pause();
      }
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }
    };
  }, [isSessionActive, activeAmbientSound, isMuted, volume]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const containerHeight = isDashboardWidget ? 'h-64' : 'h-[calc(100vh-10rem)]';

  return (
    <div className={`glass-card p-5 flex flex-col ${containerHeight}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-300 font-heading flex items-center gap-2">
          <i className="fas fa-wind text-cyan-400 text-sm"></i>
          Guided Breathing
        </h3>
        <div className="flex items-center gap-3">
            <div className="relative">
                <button onClick={() => setIsSoundMenuOpen(!isSoundMenuOpen)} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all" aria-label="Select ambient sound">
                    <i className="fas fa-music text-sm"></i>
                </button>
                {isSoundMenuOpen && (
                    <div className="absolute right-0 bottom-full mb-2 w-60 glass-card-static p-4 z-20 animate-[scaleIn_0.2s_ease-out]" style={{ background: 'rgba(15, 23, 42, 0.97)' }}>
                        <h4 className="text-[10px] font-semibold text-gray-500 mb-3 text-center uppercase tracking-wider">Ambient Sound</h4>
                        
                        <div className="grid grid-cols-3 gap-2 mb-3">
                            {allSoundOptions.map(sound => (
                                <button
                                    key={sound.id}
                                    onClick={() => handleAmbientSoundSelect(sound.id)}
                                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl aspect-square transition-all duration-200 focus:outline-none ripple
                                        ${activeAmbientSound === sound.id
                                            ? 'bg-gradient-to-br from-teal-600/60 to-teal-500/40 text-white border border-teal-400/30'
                                            : 'bg-white/5 hover:bg-white/10 text-gray-400 border border-white/5'
                                        }`}
                                    aria-label={sound.name}
                                >
                                    <i className={`fas ${sound.icon} text-lg`}></i>
                                    <span className="text-[9px] mt-1 truncate">{sound.name}</span>
                                </button>
                            ))}
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <i className={`fas ${volume === 0 || isMuted ? 'fa-volume-mute' : 'fa-volume-down'} text-gray-500 w-4 text-center text-xs`}></i>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                value={isMuted ? 0 : volume}
                                onChange={handleVolumeChange}
                                className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-teal-400"
                                aria-label="Sound volume"
                            />
                             <i className="fas fa-volume-up text-gray-500 w-4 text-center text-xs"></i>
                        </div>
                    </div>
                )}
            </div>
             <button onClick={toggleMute} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all" aria-label={isMuted ? 'Unmute sounds' : 'Mute sounds'}>
                <i className={`fas ${isMuted ? 'fa-volume-mute' : 'fa-volume-up'} text-sm`}></i>
            </button>
            {isDashboardWidget && (
                <button onClick={onNavigate} className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1">
                    Fullscreen <i className="fas fa-expand-alt"></i>
                </button>
            )}
        </div>
      </div>

      <div className="flex-grow flex flex-col items-center justify-center relative">
        <div className="relative w-48 h-48 md:w-56 md:h-56 flex items-center justify-center overflow-hidden rounded-full">
          {/* Concentric Rings */}
          <div className="absolute inset-0 rounded-full border border-teal-500/10 scale-[1.15]" style={{ animation: 'breatheRing 8s ease-in-out infinite' }}></div>
          <div className="absolute inset-0 rounded-full border border-teal-500/5 scale-[1.3]" style={{ animation: 'breatheRing 8s ease-in-out infinite 0.5s' }}></div>
          <div className="absolute inset-0 rounded-full border border-teal-500/[0.03] scale-[1.5]" style={{ animation: 'breatheRing 8s ease-in-out infinite 1s' }}></div>
          
          {/* Background circle */}
          <div className="absolute inset-0 bg-white/[0.03] rounded-full"></div>
          
          {/* Breathing circle */}
          <div
            className={`absolute inset-0 rounded-full transition-transform duration-[4000ms] ease-in-out ${
              isSessionActive ? (instruction === 'Breathe In...' ? 'scale-100' : 'scale-[0.25]') : 'scale-50'
            }`}
            style={{ background: 'linear-gradient(135deg, rgba(45,212,191,0.6), rgba(6,182,212,0.4))' }}
          ></div>
          
          <div className="z-10 text-center">
            <p key={instruction} className="text-base font-semibold text-white animate-[fadeIn_0.8s] font-heading">{instruction}</p>
            {isSessionActive && <p className="text-2xl font-mono text-gray-300 mt-2 tabular-nums">{formatTime(timeLeft)}</p>}
          </div>
        </div>
      </div>

      <div className="mt-4">
        {isSessionActive ? (
          <button
            onClick={endSession}
            className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-300 font-semibold py-2.5 px-4 rounded-xl transition-all border border-red-500/20 hover:border-red-500/30"
          >
            <i className="fas fa-stop mr-2"></i>End Session
          </button>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {[1, 3, 5].map(min => (
              <button
                key={min}
                onClick={() => startSession(min * 60)}
                className="bg-white/5 hover:bg-white/10 text-gray-300 font-semibold py-2.5 px-4 rounded-xl transition-all border border-white/5 hover:border-teal-400/30 ripple"
              >
                {min} min
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BreathingExercise;