import { useState, useEffect } from 'react';

interface GameHeaderProps {
  score: number;
  streak: number;
  timeLeft: number;
  level: number;
}

export const GameHeader = ({ score, streak, timeLeft, level }: GameHeaderProps) => {
  const [displayScore, setDisplayScore] = useState(score);

  useEffect(() => {
    if (score !== displayScore) {
      setDisplayScore(score);
    }
  }, [score]);

  return (
    <div className="flex justify-between items-center p-6 bg-card/50 border border-primary/30 rounded-lg backdrop-blur-sm">
      <div className="flex items-center gap-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary animate-score-pop" key={score}>
            {displayScore.toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">Score</div>
        </div>
        
        <div className="text-center">
          <div className="text-xl font-bold text-neon-cyan">
            {streak}x
          </div>
          <div className="text-sm text-muted-foreground">Streak</div>
        </div>
        
        <div className="text-center">
          <div className="text-xl font-bold text-neon-yellow">
            Level {level}
          </div>
          <div className="text-sm text-muted-foreground">Current</div>
        </div>
      </div>
      
      <div className="text-center">
        <div className={`text-2xl font-bold ${timeLeft <= 10 ? 'text-destructive animate-pulse' : 'text-foreground'}`}>
          {Math.ceil(timeLeft)}s
        </div>
        <div className="text-sm text-muted-foreground">Time Left</div>
      </div>
    </div>
  );
};