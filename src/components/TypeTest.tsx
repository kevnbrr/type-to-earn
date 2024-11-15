import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, RefreshCw } from 'lucide-react';
import { TOKENOMICS } from '../lib/solana/tokenomics';
import { useSolanaWallet } from '../hooks/useSolanaWallet';

const sampleTexts = [
  "The art of programming is the skill of controlling complexity. Complex systems are created from simple building blocks arranged in well-understood patterns.",
  "In software development, the hard part isn't solving problems, but deciding what problems to solve. Features are easy to add and hard to remove.",
  "The best code is no code at all. Every new line of code you willingly bring into the world is code that has to be debugged, read, and maintained.",
  "Premature optimization is the root of all evil. Yet we should not pass up our opportunities in that critical 3% of the code where attention to efficiency matters.",
  "Software is like entropy: It is difficult to grasp, weighs nothing, and obeys the Second Law of Thermodynamics; i.e., it always increases.",
  "The function of good software is to make the complex appear to be simple. Good software architecture is essential for managing complexity.",
  "Programming isn't about what you know; it's about what you can figure out. The true measure of a programmer is how they deal with unfamiliar challenges.",
  "The most important property of a program is whether it accomplishes the intention of its user. Code should be written to minimize the time between now and the total completion of the task.",
  "Any fool can write code that a computer can understand. Good programmers write code that humans can understand and maintain over time.",
  "The best way to predict the future is to implement it. In the world of software, the most beautiful code is the code that never had to be written."
];

function TypeTest() {
  const [text, setText] = useState('');
  const [input, setInput] = useState('');
  const [timer, setTimer] = useState(60);
  const [isActive, setIsActive] = useState(false);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [currentWPM, setCurrentWPM] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [errors, setErrors] = useState(0);
  const [reward, setReward] = useState(0);
  const [streak, setStreak] = useState(0);
  const lastCharRef = useRef<number | null>(null);
  const timerRef = useRef<number>();
  
  const { connected, distributeReward } = useSolanaWallet();

  const startTest = useCallback(() => {
    setText(sampleTexts[Math.floor(Math.random() * sampleTexts.length)]);
    setInput('');
    setTimer(60);
    setIsActive(false);
    setWpm(0);
    setAccuracy(100);
    setCurrentWPM(0);
    setStartTime(null);
    setErrors(0);
    setReward(0);
    lastCharRef.current = null;
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  }, []);

  useEffect(() => {
    startTest();
  }, [startTest]);

  useEffect(() => {
    if (isActive && timer > 0 && !lastCharRef.current) {
      timerRef.current = window.setInterval(() => {
        setTimer((time) => time - 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isActive, timer]);

  useEffect(() => {
    if (startTime && isActive && !lastCharRef.current) {
      const timeElapsed = (Date.now() - startTime) / 1000 / 60;
      const words = input.trim().split(' ').length;
      const currentWPM = Math.round(words / timeElapsed);
      setCurrentWPM(currentWPM);
    }
  }, [input, startTime, isActive]);

  const calculateResults = async () => {
    if (!startTime || !lastCharRef.current) return;
    
    const timeElapsed = (lastCharRef.current - startTime) / 1000 / 60;
    const words = text.trim().split(' ').length;
    const newWpm = Math.round(words / timeElapsed);
    setWpm(newWpm);

    const totalChars = text.length;
    const newAccuracy = Math.round(((totalChars - errors) / totalChars) * 100);
    setAccuracy(newAccuracy);

    const earnedReward = TOKENOMICS.calculateReward(newWpm, newAccuracy, streak);
    setReward(earnedReward);

    if (connected && earnedReward > 0) {
      try {
        await distributeReward(newWpm, newAccuracy);
        setStreak(prev => prev + 1);
      } catch (error) {
        console.error('Failed to distribute reward:', error);
        setStreak(0);
      }
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newInput = e.target.value;
    
    if (!isActive && !startTime && newInput.length === 1) {
      setIsActive(true);
      setStartTime(Date.now());
    }

    if (isActive) {
      let newErrors = 0;
      for (let i = 0; i < newInput.length; i++) {
        if (newInput[i] !== text[i]) {
          newErrors++;
        }
      }
      setErrors(newErrors);
      setInput(newInput);
      
      if (newInput === text) {
        lastCharRef.current = Date.now();
        setIsActive(false);
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        calculateResults();
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={startTest}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-full flex items-center transition-colors"
          >
            {!isActive ? (
              <>
                <Play className="w-4 h-4 mr-2" />
                New Test
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Restart
              </>
            )}
          </button>
          <div className="text-purple-200">
            Time: <span className="font-mono">{timer}s</span>
          </div>
          {streak > 0 && (
            <div className="text-purple-200">
              Streak: <span className="font-mono">{streak}x</span>
            </div>
          )}
        </div>
        {isActive && (
          <div className="flex items-center space-x-6">
            <div className="text-purple-200">
              Current Speed: <span className="font-mono">{currentWPM} WPM</span>
            </div>
            <div className="text-purple-200">
              Errors: <span className="font-mono">{errors}</span>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white/10 rounded-lg p-6 font-mono text-lg">
        <p className="text-gray-300 mb-4 leading-relaxed whitespace-pre-wrap">
          {text.split('').map((char, index) => {
            const inputChar = input[index];
            let className = 'text-gray-300';
            if (inputChar !== undefined) {
              className = inputChar === char ? 'text-green-400' : 'text-red-400';
            }
            return <span key={index} className={className}>{char}</span>;
          })}
        </p>
        <textarea
          value={input}
          onChange={handleInput}
          className="w-full bg-transparent border-none outline-none resize-none text-white placeholder-gray-500 leading-relaxed"
          placeholder="Start typing here..."
          rows={3}
        />
      </div>

      {wpm > 0 && !isActive && (
        <div className="bg-purple-600/20 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4">Test Results</h3>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <p className="text-purple-200">Speed</p>
              <p className="text-2xl font-bold text-white">{wpm} WPM</p>
            </div>
            <div>
              <p className="text-purple-200">Accuracy</p>
              <p className="text-2xl font-bold text-white">{accuracy}%</p>
            </div>
            <div>
              <p className="text-purple-200">Errors</p>
              <p className="text-2xl font-bold text-white">{errors}</p>
            </div>
            <div>
              <p className="text-purple-200">Reward</p>
              <p className="text-2xl font-bold text-white">{reward.toFixed(2)} TYPR</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TypeTest;