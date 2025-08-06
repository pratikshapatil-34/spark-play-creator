import { useEffect, useState } from 'react';

interface Beat {
  id: string;
  lane: number;
  time: number;
  type: 'normal' | 'code' | 'special';
}

interface RhythmTrackProps {
  beats: Beat[];
  currentTime: number;
  onBeatHit: (beatId: string, accuracy: number) => void;
  onBeatMiss: (beatId: string) => void;
}

export const RhythmTrack = ({ beats, currentTime, onBeatHit, onBeatMiss }: RhythmTrackProps) => {
  const [activeLane, setActiveLane] = useState<number | null>(null);
  const lanes = [0, 1, 2, 3];
  
  const handleKeyPress = (event: KeyboardEvent) => {
    const keyToLane: { [key: string]: number } = {
      'd': 0, 'f': 1, 'j': 2, 'k': 3
    };
    
    const lane = keyToLane[event.key.toLowerCase()];
    if (lane !== undefined) {
      setActiveLane(lane);
      setTimeout(() => setActiveLane(null), 100);
      
      // Check for hits
      const visibleBeats = beats.filter(beat => {
        const beatPosition = (beat.time - currentTime) * 60;
        return beatPosition >= -30 && beatPosition <= 30 && beat.lane === lane;
      });
      
      if (visibleBeats.length > 0) {
        const closestBeat = visibleBeats.reduce((closest, beat) => {
          const beatPos = Math.abs((beat.time - currentTime) * 100);
          const closestPos = Math.abs((closest.time - currentTime) * 100);
          return beatPos < closestPos ? beat : closest;
        });
        
        const accuracy = Math.max(0, 100 - Math.abs((closestBeat.time - currentTime) * 60));
        onBeatHit(closestBeat.id, accuracy);
      }
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [beats, currentTime]);

  // Check for missed beats
  useEffect(() => {
    beats.forEach(beat => {
      if (beat.time < currentTime - 0.8) {
        onBeatMiss(beat.id);
      }
    });
  }, [currentTime, beats]);

  return (
    <div className="relative h-96 bg-card/30 border border-primary/20 rounded-lg overflow-hidden">
      {/* Hit zone */}
      <div className="absolute bottom-16 left-0 right-0 h-12 bg-primary/20 border-y-2 border-primary/50" />
      
      {/* Lanes */}
      {lanes.map(lane => (
        <div
          key={lane}
          className={`absolute top-0 bottom-0 w-1/4 border-r border-primary/20 transition-all duration-100 ${
            activeLane === lane ? 'bg-primary/30' : ''
          }`}
          style={{ left: `${lane * 25}%` }}
        >
          {/* Lane indicator */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full border-2 border-primary bg-primary/20 flex items-center justify-center">
            <span className="text-sm font-bold">
              {['D', 'F', 'J', 'K'][lane]}
            </span>
          </div>
        </div>
      ))}
      
      {/* Beats */}
      {beats.map(beat => {
        const beatPosition = (beat.time - currentTime) * 60;
        const isVisible = beatPosition >= -10 && beatPosition <= 100;
        
        if (!isVisible) return null;
        
        return (
          <div
            key={beat.id}
            className={`absolute w-16 h-16 rounded-full transition-all duration-75 ${
              beat.type === 'code' ? 'rhythm-beat bg-neon-cyan' :
              beat.type === 'special' ? 'rhythm-beat bg-neon-pink' :
              'rhythm-beat bg-primary'
            }`}
            style={{
              left: `${beat.lane * 25 + 12.5}%`,
              bottom: `${beatPosition}%`,
              transform: 'translateX(-50%)'
            }}
          >
            {beat.type === 'code' && (
              <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                {'</>'}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};