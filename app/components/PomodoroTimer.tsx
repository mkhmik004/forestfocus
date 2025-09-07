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
  const [timeLeft, setTimeLeft] = useState(SESSION_DURATIONS.focus);
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [sessionType, setSessionType] = useState<SessionType>('focus');
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<{ play: () => void } | null>(null);

  // Initialize audio for completion sound
  useEffect(() => {
    // Create a simple beep sound using Web Audio API
    const createBeepSound = (): void => {
      try {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
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
        // Fallback: do nothing if Web Audio API is not supported
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
      
      // Auto-switch to break after focus session
      const newSessionsCompleted = sessionsCompleted + 1;
      if (newSessionsCompleted % 4 === 0) {
        setSessionType('longBreak');
        setTimeLeft(SESSION_DURATIONS.longBreak);
      } else {
        setSessionType('shortBreak');
        setTimeLeft(SESSION_DURATIONS.shortBreak);
      }
    } else {
      // After break, switch back to focus
      setSessionType('focus');
      setTimeLeft(SESSION_DURATIONS.focus);
    }

    // Auto-start next session after 3 seconds
    setTimeout(() => {
      setTimerState('idle');
    }, 3000);
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

  const switchSessionType = (type: SessionType) => {
    setSessionType(type);
    setTimeLeft(SESSION_DURATIONS[type]);
    setTimerState('idle');
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = (): number => {
    const totalTime = SESSION_DURATIONS[sessionType];
    return ((totalTime - timeLeft) / totalTime) * 100;
  };

  const getSessionEmoji = (type: SessionType): string => {
    switch (type) {
      case 'focus': return '🍅';
      case 'shortBreak': return '☕';
      case 'longBreak': return '🌴';
    }
  };

  const getSessionColor = (type: SessionType): string => {
    switch (type) {
      case 'focus': return 'text-red-500';
      case 'shortBreak': return 'text-blue-500';
      case 'longBreak': return 'text-green-500';
    }
  };

  const getButtonColor = (): string => {
    switch (sessionType) {
      case 'focus': return 'bg-red-500 hover:bg-red-600';
      case 'shortBreak': return 'bg-blue-500 hover:bg-blue-600';
      case 'longBreak': return 'bg-green-500 hover:bg-green-600';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
      {/* Session Type Selector */}
      <div className="flex justify-center mb-6">
        <div className="bg-gray-100 dark:bg-gray-700 rounded-full p-1 flex space-x-1">
          {(['focus', 'shortBreak', 'longBreak'] as SessionType[]).map((type) => (
            <button
              key={type}
              onClick={() => switchSessionType(type)}
              disabled={timerState === 'running'}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                sessionType === type
                  ? 'bg-white dark:bg-gray-600 shadow-sm'
                  : 'hover:bg-gray-200 dark:hover:bg-gray-600'
              } ${timerState === 'running' ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span className="mr-1">{getSessionEmoji(type)}</span>
              {type === 'shortBreak' ? 'Short Break' : type === 'longBreak' ? 'Long Break' : 'Focus'}
            </button>
          ))}
        </div>
      </div>

      {/* Timer Display */}
      <div className="text-center mb-8">
        <div className={`text-8xl font-mono font-bold mb-4 ${getSessionColor(sessionType)}`}>
          {formatTime(timeLeft)}
        </div>
        
        {/* Progress Ring */}
        <div className="relative w-32 h-32 mx-auto mb-6">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="54"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-gray-200 dark:text-gray-700"
            />
            <circle
              cx="60"
              cy="60"
              r="54"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={`${2 * Math.PI * 54}`}
              strokeDashoffset={`${2 * Math.PI * 54 * (1 - getProgressPercentage() / 100)}`}
              className={getSessionColor(sessionType)}
              style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-2xl ${getSessionColor(sessionType)}`}>
              {getSessionEmoji(sessionType)}
            </span>
          </div>
        </div>

        {/* Session Status */}
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
          {timerState === 'idle' && `Ready to start ${sessionType === 'focus' ? 'focusing' : 'your break'}?`}
          {timerState === 'running' && `${sessionType === 'focus' ? 'Stay focused!' : 'Enjoy your break!'}`}
          {timerState === 'paused' && 'Timer paused'}
          {timerState === 'completed' && `${sessionType === 'focus' ? 'Great work!' : 'Break time over!'} Starting next session...`}
        </p>

        {/* Control Buttons */}
        <div className="flex justify-center space-x-4">
          {timerState === 'idle' || timerState === 'completed' ? (
            <button
              onClick={startTimer}
              className={`${getButtonColor()} text-white px-8 py-4 rounded-full font-semibold text-lg transition-colors`}
            >
              Start {sessionType === 'focus' ? 'Focus' : 'Break'}
            </button>
          ) : timerState === 'running' ? (
            <button
              onClick={pauseTimer}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-4 rounded-full font-semibold text-lg transition-colors"
            >
              Pause
            </button>
          ) : (
            <button
              onClick={startTimer}
              className={`${getButtonColor()} text-white px-8 py-4 rounded-full font-semibold text-lg transition-colors`}
            >
              Resume
            </button>
          )}
          
          {timerState !== 'idle' && timerState !== 'completed' && (
            <button
              onClick={resetTimer}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-4 rounded-full font-semibold text-lg transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Session Stats */}
      <div className="border-t pt-6">
        <h3 className="font-semibold mb-4 text-center">Today&apos;s Progress</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-red-500">{sessionsCompleted}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Focus Sessions</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-500">{Math.floor(sessionsCompleted / 4)}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Cycles Complete</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-500">{sessionsCompleted * 25}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Minutes Focused</div>
          </div>
        </div>
      </div>
    </div>
  );
}