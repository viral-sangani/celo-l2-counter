import { useEffect, useRef, useState } from "react";
import ReactConfetti from "react-confetti";
import celoLogoUrl from "../static/images/celo-logo.webp";
import comingHomeUrl from "../static/images/coming-home.png";
import ethereumLogoUrl from "../static/images/ethereum-logo.png";

interface ConfettiProps {
  isActive: boolean;
  duration?: number;
}

interface LogoParticle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  rotation: number;
  rotationSpeed: number;
  imageIndex: number;
}

// Colors for the react-confetti
const COLORS = [
  "#FECC23",
  "#5CD0ED",
  "#476520",
  "#FE5A23",
  "#3AA03A",
  "#FCF6F1",
];

export const Confetti = ({ isActive, duration = 10000 }: ConfettiProps) => {
  // State for both confetti types
  const [windowDimension, setWindowDimension] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [showConfetti, setShowConfetti] = useState(false);

  // For custom logo animation
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logosRef = useRef<LogoParticle[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Image references
  const celoLogoRef = useRef<HTMLImageElement | null>(null);
  const ethereumLogoRef = useRef<HTMLImageElement | null>(null);
  const comingHomeRef = useRef<HTMLImageElement | null>(null);
  const imagesLoadedRef = useRef<boolean>(false);

  // Preload images
  useEffect(() => {
    const celoLogo = new Image();
    celoLogo.src = celoLogoUrl;
    celoLogo.onload = () => {
      celoLogoRef.current = celoLogo;
      checkAllImagesLoaded();
    };

    const ethereumLogo = new Image();
    ethereumLogo.src = ethereumLogoUrl;
    ethereumLogo.onload = () => {
      ethereumLogoRef.current = ethereumLogo;
      checkAllImagesLoaded();
    };

    const comingHome = new Image();
    comingHome.src = comingHomeUrl;
    comingHome.onload = () => {
      comingHomeRef.current = comingHome;
      checkAllImagesLoaded();
    };

    const checkAllImagesLoaded = () => {
      if (
        celoLogoRef.current &&
        ethereumLogoRef.current &&
        comingHomeRef.current
      ) {
        imagesLoadedRef.current = true;
      }
    };
  }, []);

  // Initialize logo particles
  const initializeLogoParticles = () => {
    if (!canvasRef.current || !imagesLoadedRef.current) return;

    const canvas = canvasRef.current;
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    const logoParticles: LogoParticle[] = [];
    const particleCount = 30; // Fewer logo particles to not overwhelm

    for (let i = 0; i < particleCount; i++) {
      const size = Math.random() * 40 + 30; // 30-70px logos
      const particle: LogoParticle = {
        x: Math.random() * width,
        y: -size - Math.random() * 500, // Start above screen with random offset for staggered entry
        size,
        speedY: Math.random() * 1 + 0.5, // 0.5 to 1.5 - slow fall
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 0.3, // Very slow rotation
        imageIndex: Math.floor(Math.random() * 3),
      };

      logoParticles.push(particle);
    }

    logosRef.current = logoParticles;
  };

  // Draw logo particles
  const drawLogoParticles = () => {
    if (!canvasRef.current || !imagesLoadedRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw each logo particle
    logosRef.current.forEach((particle) => {
      ctx.save();

      // Translate to particle position and rotate
      ctx.translate(particle.x, particle.y);
      ctx.rotate((particle.rotation * Math.PI) / 180);

      // Draw the appropriate image
      let img = null;

      if (particle.imageIndex === 0 && celoLogoRef.current) {
        img = celoLogoRef.current;
      } else if (particle.imageIndex === 1 && ethereumLogoRef.current) {
        img = ethereumLogoRef.current;
      } else if (comingHomeRef.current) {
        img = comingHomeRef.current;
      }

      if (img) {
        ctx.drawImage(
          img,
          -particle.size / 2,
          -particle.size / 2,
          particle.size,
          particle.size
        );
      }

      ctx.restore();
    });
  };

  // Update logo particle positions
  const updateLogoParticles = () => {
    const height = window.innerHeight;

    logosRef.current = logosRef.current.map((particle) => {
      // Update position
      particle.y += particle.speedY;

      // Update rotation (slowly)
      particle.rotation += particle.rotationSpeed;

      // If logo has moved off screen, reset from top
      if (particle.y > height + particle.size) {
        particle.y = -particle.size;
        particle.x = Math.random() * window.innerWidth;
      }

      return particle;
    });
  };

  // Animation loop for logos
  const animate = () => {
    updateLogoParticles();
    drawLogoParticles();

    // Continue animation if active
    if (showConfetti) {
      animationFrameRef.current = requestAnimationFrame(animate);
    }
  };

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowDimension({
        width: window.innerWidth,
        height: window.innerHeight,
      });

      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Start/stop animation based on isActive
  useEffect(() => {
    // Clean up any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (isActive) {
      setShowConfetti(true);

      // Initialize and start logo animation
      if (imagesLoadedRef.current) {
        initializeLogoParticles();

        // Start animation
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        animationFrameRef.current = requestAnimationFrame(animate);
      }

      // Set timer to stop both confetti types
      timerRef.current = setTimeout(() => {
        setShowConfetti(false);
        timerRef.current = null;
      }, duration);
    } else {
      setShowConfetti(false);
    }

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isActive, duration]);

  if (!showConfetti) return null;

  return (
    <>
      {/* React Confetti for regular confetti */}
      <ReactConfetti
        width={windowDimension.width}
        height={windowDimension.height}
        recycle={false}
        numberOfPieces={1500}
        gravity={0.05}
        tweenDuration={8000}
        run={showConfetti}
        initialVelocityX={2}
        initialVelocityY={5}
        colors={COLORS}
      />

      {/* Custom canvas for logo images */}
      <canvas
        ref={canvasRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 10000, // Higher than react-confetti
        }}
      />
    </>
  );
};
