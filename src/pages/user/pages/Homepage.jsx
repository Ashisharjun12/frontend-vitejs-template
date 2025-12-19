import React from 'react';
import { motion } from 'framer-motion';
import { useSession } from '../../../lib/auth-client';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import Typewriter from 'typewriter-effect';
import { 
  SiExpress, 
  SiNodedotjs, 
  SiJavascript, 
  SiGo, 
  SiFastapi, 
  SiVite, 
  SiNextdotjs,
  SiReact,
  SiPython,
  SiTypescript,
  SiDocker,
  SiPostgresql
} from 'react-icons/si';

const Homepage = () => {
  const { data: session } = useSession();
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  // Generate random positions for floating dots
  const generateDots = (count) => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 20 + 15,
      delay: Math.random() * 5,
    }));
  };

  const dots = generateDots(30);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] overflow-hidden">
      {/* Background Grid Effect */}
      <div className="absolute inset-0 opacity-20 dark:opacity-10">
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px),
              linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
        
        {/* Floating Dots */}
        {dots.map((dot) => (
          <motion.div
            key={dot.id}
            className="absolute rounded-full bg-primary/30 dark:bg-primary/20"
            style={{
              width: `${dot.size}px`,
              height: `${dot.size}px`,
              left: `${dot.x}%`,
              top: `${dot.y}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.random() * 20 - 10, 0],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: dot.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: dot.delay,
            }}
          />
        ))}

        {/* Floating Grid Squares */}
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={`square-${i}`}
            className="absolute border border-border/20 rounded-lg"
            style={{
              width: `${Math.random() * 100 + 50}px`,
              height: `${Math.random() * 100 + 50}px`,
              left: `${Math.random() * 80 + 10}%`,
              top: `${Math.random() * 80 + 10}%`,
            }}
            animate={{
              y: [0, -40, 0],
              x: [0, Math.random() * 30 - 15, 0],
              rotate: [0, 180, 360],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: Math.random() * 25 + 20,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      {/* Floating Tech Icons around Heading */}
      <div className="absolute inset-0 pointer-events-none z-10">
        {[
          { icon: SiReact, style: 'top-8 left-12', delay: '0s', color: 'text-blue-500' },
          { icon: SiNodedotjs, style: 'top-8 right-16', delay: '0.2s', color: 'text-green-600' },
          { icon: SiJavascript, style: 'top-1/4 left-24', delay: '0.4s', color: 'text-yellow-400' },
          { icon: SiPython, style: 'top-1/3 right-24', delay: '0.6s', color: 'text-blue-400' },
          { icon: SiGo, style: 'bottom-1/3 left-16', delay: '0.8s', color: 'text-cyan-500' },
          { icon: SiExpress, style: 'bottom-1/4 right-12', delay: '1.0s', color: 'text-foreground' },
          { icon: SiNextdotjs, style: 'top-1/2 left-8', delay: '1.2s', color: 'text-foreground' },
          { icon: SiVite, style: 'top-1/2 right-8', delay: '1.4s', color: 'text-yellow-500' },
          { icon: SiTypescript, style: 'bottom-8 left-1/3', delay: '1.6s', color: 'text-blue-600' },
          { icon: SiFastapi, style: 'bottom-8 right-1/3', delay: '1.8s', color: 'text-green-500' },
        ].map((tech, idx) => (
          <motion.div
            key={idx}
            style={{ animationDelay: tech.delay }}
            className={`absolute z-10 opacity-60 hover:opacity-100 transition-opacity duration-300 ${tech.style}`}
            animate={{
              y: [0, -18, 0],
            }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: parseFloat(tech.delay),
            }}
          >
            <tech.icon className={`w-10 h-10 md:w-12 md:h-12 ${tech.color} transition-transform duration-300 hover:scale-110`} />
          </motion.div>
        ))}
      </div>

      {/* Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-4xl mx-auto text-center space-y-8"
      >
        <motion.div variants={itemVariants} className="space-y-4 relative">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Deploy Your Apps
          </h1>
          <div className="text-5xl md:text-6xl font-bold tracking-tight min-h-[4rem]">
            <span className="text-primary">
              <Typewriter
                options={{
                  strings: [
                    'Frontend & Backend',
                    
                  ],
                  autoStart: true,
                  loop: true,
                  delay: 60,
                  deleteSpeed: 40,
                }}
              />
            </span>
            <span className="text-foreground"> in Seconds</span>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            The simplest way to deploy your frontend and backend applications.
            No configuration needed. Just connect and deploy.
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {session ? (
            <InteractiveHoverButton
              onClick={() => navigate('/workspace')}
             
            >
              Go to Dashboard
            </InteractiveHoverButton>
          ) : (
            <InteractiveHoverButton
              onClick={() => navigate('/login')}
              className="h-12 px-8 text-base font-medium bg-foreground text-background hover:bg-foreground/90 border-foreground"
            >
              Get Started
            </InteractiveHoverButton>
          )}
          <Button
            variant="outline"
            size="lg"
            className="h-12 px-8 rounded-full text-base font-medium"
          >
            Learn More
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Homepage;
