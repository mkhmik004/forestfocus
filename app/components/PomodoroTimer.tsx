'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface PomodoroTimerProps {
  onSessionComplete: () => void;
  onSessionStart: () => void;
}

type TimerState = 'idle' | 'running' | 'paused' | 'completed';
type SessionType = 'focus' | 'shortBreak' | 'longBreak';

const SESSION_DURATIONS = {
  focus: 25 * 60, // 25 minutes
  shortBreak: 5 * 60, // 5 minutes
  longBreak: 15 * 60, // 15 minutes
};

export default function PomodoroTimer({ onSessionComplete, onSessionStart }: PomodoroTimerProps) {
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [sessionType, setSessionType] = useState<SessionType>('focus');
  const [timeLeft, setTimeLeft] = useState(SESSION_DURATIONS.focus);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<{ play: () => void } | null>(null);

  // Initialize audio for completion sound
  useEffect(() => {
    // Create a simple beep sound using Web Audio API
    const createBeepSound = (): void => {
      try {
        const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        const audioContext = new AudioContextClass();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
      } catch {
        console.log('Audio not supported');
      }
    };
    
    audioRef.current = { play: createBeepSound };
  }, []);

  const handleSessionComplete = useCallback(() => {
    setTimerState('completed');
    
    // Play completion sound
    if (audioRef.current) {
      audioRef.current.play();
    }

    if (sessionType === 'focus') {
      setSessionsCompleted(prev => prev + 1);
      onSessionComplete();
      
      // Auto-start break after focus session
      setTimeout(() => {
        const breakType = sessionsCompleted > 0 && (sessionsCompleted + 1) % 4 === 0 ? 'longBreak' : 'shortBreak';
        setSessionType(breakType);
        setTimeLeft(SESSION_DURATIONS[breakType]);
        setTimerState('idle');
      }, 2000);
    } else {
      // After break, go back to focus
      setTimeout(() => {
        setSessionType('focus');
        setTimeLeft(SESSION_DURATIONS.focus);
        setTimerState('idle');
      }, 2000);
    }
  }, [sessionType, sessionsCompleted, onSessionComplete]);

  useEffect(() => {
    if (timerState === 'running' && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timerState, timeLeft, handleSessionComplete]);

  const startTimer = () => {
    if (timerState === 'idle' || timerState === 'completed') {
      onSessionStart();
    }
    setTimerState('running');
  };

  const pauseTimer = () => {
    setTimerState('paused');
  };

  const resetTimer = () => {
    setTimerState('idle');
    setTimeLeft(SESSION_DURATIONS[sessionType]);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getSessionLabel = (): string => {
    switch (sessionType) {
      case 'focus':
        return 'Focus Time';
      case 'shortBreak':
        return 'Short Break';
      case 'longBreak':
        return 'Long Break';
      default:
        return 'Focus Time';
    }
  };

  const getProgressPercentage = (): number => {
    const totalTime = SESSION_DURATIONS[sessionType];
    return ((totalTime - timeLeft) / totalTime) * 100;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{getSessionLabel()}</h2>
        <div className="text-6xl font-mono font-bold text-green-600 mb-4">
          {formatTime(timeLeft)}
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div 
            className="bg-green-500 h-2 rounded-full transition-all duration-1000 ease-linear"
            style={{ width: `${getProgressPercentage()}%` }}
          ></div>
        </div>
        
        {/* Session Counter */}
        <div className="text-sm text-gray-600 mb-4">
          Sessions completed: {sessionsCompleted}
        </div>
      </div>
      
      <div className="flex justify-center space-x-4">
        {timerState === 'idle' || timerState === 'completed' ? (
          <button
            onClick={startTimer}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Start
          </button>
        ) : timerState === 'running' ? (
          <button
            onClick={pauseTimer}
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Pause
          </button>
        ) : (
          <button
            onClick={startTimer}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Resume
          </button>
        )}
        
        <button
          onClick={resetTimer}
          className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          Reset
        </button>
      </div>
      
      {timerState === 'completed' && (
        <div className="mt-4 p-4 bg-green-100 rounded-lg text-center">
          <p className="text-green-800 font-semibold">
            {sessionType === 'focus' ? '🎉 Focus session complete! Time for a break.' : '✨ Break time over! Ready to focus?'}
          </p>
        </div>
      )}
    </div>
  );
}