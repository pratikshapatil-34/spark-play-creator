import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface CodeChallengeProps {
  challenge: {
    id: string;
    question: string;
    code: string;
    options: string[];
    correct: number;
    difficulty: 'easy' | 'medium' | 'hard';
  } | null;
  onAnswer: (correct: boolean) => void;
  timeLimit: number;
}

export const CodeChallenge = ({ challenge, onAnswer, timeLimit }: CodeChallengeProps) => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [isAnswered, setIsAnswered] = useState(false);

  useEffect(() => {
    if (!challenge) return;
    
    setSelectedAnswer(null);
    setIsAnswered(false);
    setTimeLeft(timeLimit);
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (!isAnswered) {
            onAnswer(false);
            setIsAnswered(true);
          }
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [challenge, timeLimit]);

  const handleAnswer = (answerIndex: number) => {
    if (isAnswered) return;
    
    setSelectedAnswer(answerIndex);
    setIsAnswered(true);
    
    const correct = answerIndex === challenge?.correct;
    setTimeout(() => onAnswer(correct), 500);
  };

  if (!challenge) {
    return (
      <div className="code-terminal h-64 flex items-center justify-center">
        <div className="text-muted-foreground">Get ready for the next challenge...</div>
      </div>
    );
  }

  const difficultyColors = {
    easy: 'text-neon-green',
    medium: 'text-neon-yellow',
    hard: 'text-neon-pink'
  };

  return (
    <div className="code-terminal animate-slide-down">
      <div className="flex justify-between items-center mb-4">
        <div className={`text-sm font-bold ${difficultyColors[challenge.difficulty]}`}>
          {challenge.difficulty.toUpperCase()} CHALLENGE
        </div>
        <div className={`text-sm font-mono ${timeLeft <= 3 ? 'text-destructive' : 'text-foreground'}`}>
          {timeLeft.toFixed(1)}s
        </div>
      </div>
      
      <div className="mb-4">
        <div className="text-sm text-muted-foreground mb-2">{challenge.question}</div>
        <pre className="bg-muted/20 p-3 rounded text-sm font-code overflow-x-auto">
          <code>{challenge.code}</code>
        </pre>
      </div>
      
      <div className="grid grid-cols-1 gap-2">
        {challenge.options.map((option, index) => (
          <Button
            key={index}
            variant="outline"
            className={`justify-start font-code text-left h-auto p-3 transition-all duration-200 ${
              selectedAnswer === index
                ? index === challenge.correct
                  ? 'border-success bg-success/20 text-success'
                  : 'border-destructive bg-destructive/20 text-destructive'
                : 'hover:border-primary hover:bg-primary/10'
            }`}
            onClick={() => handleAnswer(index)}
            disabled={isAnswered}
          >
            <span className="mr-2 font-bold">
              {String.fromCharCode(65 + index)}.
            </span>
            {option}
          </Button>
        ))}
      </div>
      
      {isAnswered && (
        <div className="mt-4 text-center">
          {selectedAnswer === challenge.correct ? (
            <div className="text-success font-bold animate-score-pop">Correct! +100 points</div>
          ) : (
            <div className="text-destructive font-bold">
              Wrong! Correct answer: {String.fromCharCode(65 + challenge.correct)}
            </div>
          )}
        </div>
      )}
    </div>
  );
};