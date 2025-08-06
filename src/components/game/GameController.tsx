import { useState, useEffect, useCallback } from 'react';
import { GameHeader } from './GameHeader';
import { RhythmTrack } from './RhythmTrack';
import { CodeChallenge } from './CodeChallenge';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface Beat {
  id: string;
  lane: number;
  time: number;
  type: 'normal' | 'code' | 'special';
}

interface Challenge {
  id: string;
  question: string;
  code: string;
  options: string[];
  correct: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

const sampleChallenges: Challenge[] = [
  {
    id: '1',
    question: 'What will this function return?',
    code: `function mystery(x) {
  return x * 2 + 1;
}
mystery(5);`,
    options: ['10', '11', '6', '9'],
    correct: 1,
    difficulty: 'easy'
  },
  {
    id: '2',
    question: 'What is the output of this loop?',
    code: `let sum = 0;
for(let i = 1; i <= 3; i++) {
  sum += i;
}
console.log(sum);`,
    options: ['3', '6', '5', '4'],
    correct: 1,
    difficulty: 'medium'
  },
  {
    id: '3',
    question: 'What does this array method return?',
    code: `const arr = [1, 2, 3, 4, 5];
const result = arr.filter(x => x % 2 === 0);
result.length;`,
    options: ['2', '3', '1', '4'],
    correct: 0,
    difficulty: 'hard'
  }
];

export const GameController = () => {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'ended'>('menu');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [level, setLevel] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [gameTime, setGameTime] = useState(60); // 60 seconds per level
  const [beats, setBeats] = useState<Beat[]>([]);
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [challengeTimeLimit, setChallengeTimeLimit] = useState(10);

  // Generate beats pattern
  const generateBeats = useCallback((level: number) => {
    const newBeats: Beat[] = [];
    const density = Math.min(level * 0.3 + 0.8, 2.5); // Slower density increase
    const duration = 60;
    
    for (let time = 3; time < duration; time += 60 / (density * 10)) {
      const beatType = Math.random() < 0.3 ? 'code' : Math.random() < 0.1 ? 'special' : 'normal';
      newBeats.push({
        id: `beat-${time}-${Math.random()}`,
        lane: Math.floor(Math.random() * 4),
        time,
        type: beatType
      });
    }
    
    return newBeats;
  }, []);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setStreak(0);
    setLevel(1);
    setCurrentTime(0);
    setGameTime(60);
    setBeats(generateBeats(1));
    setCurrentChallenge(null);
  };

  const pauseGame = () => {
    setGameState(gameState === 'paused' ? 'playing' : 'paused');
  };

  const resetGame = () => {
    setGameState('menu');
    setCurrentChallenge(null);
  };

  // Game timer
  useEffect(() => {
    if (gameState !== 'playing') return;

    const timer = setInterval(() => {
      setCurrentTime(prev => prev + 0.1);
      setGameTime(prev => {
        if (prev <= 0.1) {
          // Level complete
          setLevel(l => l + 1);
          setBeats(generateBeats(level + 1));
          return 60;
        }
        return prev - 0.1;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [gameState, level, generateBeats]);

  const handleBeatHit = (beatId: string, accuracy: number) => {
    const beat = beats.find(b => b.id === beatId);
    if (!beat) return;

    // Remove the hit beat
    setBeats(prev => prev.filter(b => b.id !== beatId));
    
    // Calculate score based on accuracy
    const baseScore = beat.type === 'special' ? 200 : beat.type === 'code' ? 150 : 100;
    const accuracyBonus = Math.floor(accuracy / 10) * 10;
    const streakBonus = Math.min(streak * 5, 100);
    const totalScore = baseScore + accuracyBonus + streakBonus;
    
    setScore(prev => prev + totalScore);
    setStreak(prev => prev + 1);

    // Trigger code challenge for code beats
    if (beat.type === 'code') {
      const randomChallenge = sampleChallenges[Math.floor(Math.random() * sampleChallenges.length)];
      setCurrentChallenge(randomChallenge);
      setChallengeTimeLimit(10 - Math.min(level, 7)); // Faster at higher levels
    }
  };

  const handleBeatMiss = (beatId: string) => {
    setBeats(prev => prev.filter(b => b.id !== beatId));
    setStreak(0);
  };

  const handleChallengeAnswer = (correct: boolean) => {
    if (correct) {
      setScore(prev => prev + 500);
      setStreak(prev => prev + 2);
    } else {
      setStreak(0);
    }
    setCurrentChallenge(null);
  };

  return (
    <div className="min-h-screen p-6 space-y-6">
      {gameState === 'menu' && (
        <div className="text-center space-y-8 py-20">
          <div className="space-y-4">
            <h1 className="text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent animate-neon-glow">
              Rhythm Coder
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Code to the beat! Hit the rhythm notes and solve programming challenges in perfect sync.
            </p>
          </div>
          
          <div className="space-y-4">
            <Button onClick={startGame} size="lg" className="game-button">
              <Play className="mr-2 h-5 w-5" />
              Start Game
            </Button>
            
            <div className="text-sm text-muted-foreground max-w-md mx-auto">
              <div className="mb-2 font-semibold">Controls:</div>
              <div className="grid grid-cols-4 gap-2 text-xs">
                <div className="bg-card p-2 rounded">D</div>
                <div className="bg-card p-2 rounded">F</div>
                <div className="bg-card p-2 rounded">J</div>
                <div className="bg-card p-2 rounded">K</div>
              </div>
              <div className="mt-2">Hit the beats as they reach the bottom line!</div>
            </div>
          </div>
        </div>
      )}

      {(gameState === 'playing' || gameState === 'paused') && (
        <>
          <GameHeader 
            score={score} 
            streak={streak} 
            timeLeft={gameTime} 
            level={level}
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex justify-center gap-4">
                <Button onClick={pauseGame} variant="outline">
                  {gameState === 'paused' ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                </Button>
                <Button onClick={resetGame} variant="outline">
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
              
              <RhythmTrack
                beats={beats}
                currentTime={currentTime}
                onBeatHit={handleBeatHit}
                onBeatMiss={handleBeatMiss}
              />
            </div>
            
            <CodeChallenge
              challenge={currentChallenge}
              onAnswer={handleChallengeAnswer}
              timeLimit={challengeTimeLimit}
            />
          </div>
          
          {gameState === 'paused' && (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold">Game Paused</h2>
                <Button onClick={pauseGame} className="game-button">
                  Resume
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};