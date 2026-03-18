import { motion } from 'motion/react';
import { useState } from 'react';
import { Sparkles, Hand, LayoutGrid, Droplets } from 'lucide-react';
import backgroundPattern from '../../assets/581d7eb1b818206890303d2b3a76c5414cdbbf5d.png';
import beforeImage from '../../assets/373cecb1e82884e5333e7b3f0bbc95be03484f17.png';
import afterImage from '../../assets/11216e21214150f3e7991c8dc0ef75882077e7c7.png';

export function BeforeAfter() {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const handleMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging && e.type !== 'click') return;

    const container = e.currentTarget.getBoundingClientRect();
    let clientX: number;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
    } else {
      clientX = e.clientX;
    }

    const x = clientX - container.left;
    const percentage = (x / container.width) * 100;
    setSliderPosition(Math.min(Math.max(percentage, 0), 100));
  };

  const features = [
    {
      icon: Sparkles,
      title: 'Deep Cleaning Magic',
      color: '#F4C430',
    },
    {
      icon: LayoutGrid,
      title: 'Tailored Solutions',
      color: '#F4C430',
    },
    {
      icon: Droplets,
      title: 'Sustainable Cleanliness',
      color: '#F4C430',
    },
    {
      icon: Hand,
      title: 'Quick and Efficient',
      color: '#F4C430',
    },
  ];

  return (
    <section 
      className="py-20 relative overflow-hidden"
      style={{
        backgroundImage: `url(${backgroundPattern})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-[#F4C430]" />
            <span className="text-[#F4C430] uppercase tracking-wide text-sm font-medium">
              DARE TO DAZZLING
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl text-gray-900 mb-4">
            Amazing Evolution of
            <br />
            Your Office & Your Home
          </h2>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-center">
          {/* Left Features */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            {features.slice(0, 2).map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col items-center lg:items-end text-center lg:text-right"
              >
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center mb-3"
                  style={{ backgroundColor: `${feature.color}20` }}
                >
                  <feature.icon className="w-8 h-8" style={{ color: feature.color }} />
                </div>
                <h3 className="text-lg font-semibold text-[#3D1810]">
                  {feature.title}
                </h3>
              </motion.div>
            ))}
          </motion.div>

          {/* Center - Before/After Slider */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div
              className="relative w-full aspect-square max-w-md mx-auto rounded-2xl overflow-hidden shadow-2xl cursor-ew-resize select-none"
              onMouseMove={handleMove}
              onMouseDown={(e) => {
                setIsDragging(true);
                handleMove(e);
              }}
              onMouseUp={() => setIsDragging(false)}
              onMouseLeave={() => setIsDragging(false)}
              onTouchMove={handleMove}
              onTouchStart={() => setIsDragging(true)}
              onTouchEnd={() => setIsDragging(false)}
              onClick={handleMove}
            >
              {/* After Image (Full) */}
              <img
                src={afterImage}
                alt="After cleaning"
                className="absolute inset-0 w-full h-full object-cover"
                draggable={false}
              />

              {/* Before Image (Clipped) */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
              >
                <img
                  src={beforeImage}
                  alt="Before cleaning"
                  className="absolute inset-0 w-full h-full object-cover"
                  draggable={false}
                />
              </div>

              {/* Slider Line */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-white shadow-lg"
                style={{ left: `${sliderPosition}%` }}
              >
                {/* Slider Handle */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center">
                  <div className="flex gap-1">
                    <div className="w-0.5 h-6 bg-gray-400 rounded-full"></div>
                    <div className="w-0.5 h-6 bg-gray-400 rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* Labels */}
              <div className="absolute top-4 left-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-medium">
                Before
              </div>
              <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-medium">
                After
              </div>
            </div>

            {/* Drag Instruction */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-center mt-4 text-gray-600 text-sm"
            >
              Drag to compare
            </motion.div>
          </motion.div>

          {/* Right Features */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            {features.slice(2, 4).map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col items-center lg:items-start text-center lg:text-left"
              >
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center mb-3"
                  style={{ backgroundColor: `${feature.color}20` }}
                >
                  <feature.icon className="w-8 h-8" style={{ color: feature.color }} />
                </div>
                <h3 className="text-lg font-semibold text-[#3D1810]">
                  {feature.title}
                </h3>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
