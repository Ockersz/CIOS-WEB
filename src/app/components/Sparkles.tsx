import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import sparkleGreen from 'figma:asset/186fecb6f99dd0a349dab9d69adf47db3588102f.png';
import sparkleYellow from 'figma:asset/5a42da73b29b9b5b7267164be4ac390a51bd5917.png';

interface Sparkle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  image: string;
}

export function Sparkles({ count = 20 }: { count?: number }) {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);

  useEffect(() => {
    const newSparkles = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 30 + 15, // Random size between 15px and 45px
      delay: Math.random() * 2,
      image: Math.random() > 0.5 ? sparkleYellow : sparkleGreen,
    }));
    setSparkles(newSparkles);
  }, [count]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden bg-[#00000000]" style={{ zIndex: 1 }}>
      {sparkles.map((sparkle) => (
        <motion.img
          key={sparkle.id}
          src={sparkle.image}
          alt=""
          className="absolute opacity-40"
          style={{
            left: `${sparkle.x}%`,
            top: `${sparkle.y}%`,
            width: sparkle.size,
            height: sparkle.size,
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2 + sparkle.delay,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: sparkle.delay,
          }}
        />
      ))}
    </div>
  );
}