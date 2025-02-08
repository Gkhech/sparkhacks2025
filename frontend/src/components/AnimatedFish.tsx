import { useState, useRef } from 'react';

const AnimatedFish = ({ audioUrl }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  return (
    <div className="relative flex flex-col items-center gap-4">
      <div
        className={`transition-transform duration-300 ${isPlaying ? 'animate-[wiggle_1s_ease-in-out_infinite]' : ''
          }`}
        style={{
          '@keyframes wiggle': {
            '0%, 100%': { transform: 'rotate(-2deg)' },
            '50%': { transform: 'rotate(2deg)' }
          }
        }}
      >
        <img
          src="/path-to-your-fish-image.jpg"
          alt="Singing Fish"
          className="w-48 h-auto"
        />
      </div>

      <audio
        ref={audioRef}
        src={audioUrl}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        controls
        className="w-64"
      />
    </div>
  );
};

export default AnimatedFish;
