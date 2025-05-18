// "use client";

// import React, { useEffect, useState, useRef, useCallback } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import Image from "next/image";

// interface FlightConfig {
//   id: string;
//   initialX: string;
//   initialY: string;
//   animateX: string[];
//   animateY: string[];
//   initialRotate: number;
//   animateRotate: number[];
//   exitX: string;
//   exitY: string;
//   exitRotate: number;
//   imageSrc: string;
// }

// const AnimatedPaperPlane: React.FC = () => {
//   const [isFlying, setIsFlying] = useState(false);
//   const [flightConfig, setFlightConfig] = useState<FlightConfig | null>(null);
//   const [currentFlightDuration, setCurrentFlightDuration] = useState(7);
//   const flightTimerRef = useRef<NodeJS.Timeout | null>(null);
//   const flightCounterRef = useRef(0);

//   const getFlightDelay = useCallback(() => 2000, []);
//   const getRandomFlightDuration = useCallback(() => Math.random() * 2 + 5, []); // 5-7 seconds for flight

//   const scheduleNextFlight = useCallback(() => {
//     if (flightTimerRef.current) clearTimeout(flightTimerRef.current);

//     flightTimerRef.current = setTimeout(() => {
//       flightCounterRef.current += 1;
//       const newFlightDuration = getRandomFlightDuration();
//       setCurrentFlightDuration(newFlightDuration);

//       const screenHeight =
//         typeof window !== "undefined" ? window.innerHeight : 800;
//       const screenWidth =
//         typeof window !== "undefined" ? window.innerWidth : 1200;

//       let params: FlightConfig;
//       const planeImage1 = "/plane-1.png";
//       const planeImage2 = "/plane-2.png";

//       if (flightCounterRef.current % 2 === 0) {
//         // Path 1: Left to Bottom-Center
//         const startY = `${Math.random() * 15 + 10}vh`; // Start higher: 10vh to 25vh
//         params = {
//           id: `flight-${Date.now()}-L2BC`,
//           initialX: "-10vw",
//           initialY: startY,
//           animateX: [
//             "-10vw",
//             `${screenWidth * 0.25}px`,
//             `${screenWidth * 0.5}px`,
//           ],
//           animateY: [
//             startY,
//             `${screenHeight * 0.75}px`,
//             `${screenHeight * 1.1}px`,
//           ], // Deeper curve
//           initialRotate: 10, // Pointing slightly down-right
//           animateRotate: [10, 60, 110], // Rotate more downwards
//           exitX: `${screenWidth * 0.5}px`,
//           exitY: `${screenHeight * 1.2}px`,
//           exitRotate: 110,
//           imageSrc: planeImage1,
//         };
//       } else {
//         // Path 2: Right to Top-Center
//         const startY = `${Math.random() * 15 + 75}vh`; // Start lower: 75vh to 90vh
//         params = {
//           id: `flight-${Date.now()}-R2TC`,
//           initialX: "110vw",
//           initialY: startY,
//           animateX: [
//             "110vw",
//             `${screenWidth * 0.75}px`,
//             `${screenWidth * 0.5}px`,
//           ],
//           animateY: [
//             startY,
//             `${screenHeight * 0.25}px`,
//             `${screenHeight * -0.1}px`,
//           ], // Higher curve
//           initialRotate: 190, // Pointing slightly up-left
//           animateRotate: [190, 240, 290], // Rotate more upwards
//           exitX: `${screenWidth * 0.5}px`,
//           exitY: `${screenHeight * -0.2}px`,
//           exitRotate: 290,
//           imageSrc: planeImage2,
//         };
//       }
//       setFlightConfig(params);
//       setIsFlying(true);
//     }, getFlightDelay());
//   }, [getFlightDelay, getRandomFlightDuration]);

//   useEffect(() => {
//     scheduleNextFlight(); // Initial flight
//     return () => {
//       if (flightTimerRef.current) clearTimeout(flightTimerRef.current);
//     };
//   }, [scheduleNextFlight]);

//   return (
//     <AnimatePresence
//       onExitComplete={() => {
//         setFlightConfig(null);
//         scheduleNextFlight();
//       }}
//     >
//       {isFlying && flightConfig && (
//         <motion.div
//           key={flightConfig.id}
//           initial={{
//             x: flightConfig.initialX,
//             y: flightConfig.initialY,
//             opacity: 0,
//             rotate: flightConfig.initialRotate,
//           }}
//           animate={{
//             x: flightConfig.animateX,
//             y: flightConfig.animateY,
//             opacity: 1,
//             rotate: flightConfig.animateRotate,
//             transition: {
//               x: { duration: currentFlightDuration, ease: "linear" },
//               y: { duration: currentFlightDuration, ease: [0.45, 0, 0.55, 1] },
//               opacity: { duration: 0.5, ease: "easeOut" },
//               rotate: { duration: currentFlightDuration, ease: "linear" },
//             },
//           }}
//           exit={{
//             x: flightConfig.exitX,
//             y: flightConfig.exitY,
//             opacity: 0,
//             rotate: flightConfig.exitRotate,
//             transition: { duration: 0.5, ease: "easeIn" },
//           }}
//           onAnimationComplete={() => {
//             setIsFlying(false);
//           }}
//           style={{
//             position: "fixed",
//             zIndex: 500,
//             pointerEvents: "none",
//           }}
//         >
//           <Image
//             src={flightConfig.imageSrc}
//             alt="Paper Plane"
//             width={40}
//             height={40}
//             className="drop-shadow-md"
//           />
//         </motion.div>
//       )}
//     </AnimatePresence>
//   );
// };

// export default AnimatedPaperPlane;

"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

interface Point {
  x: number;
  y: number;
}

interface FlightPath {
  id: string;
  points: { x: number; y: number }[];
  imageSrc: string;
}

const AnimatedPaperPlane: React.FC = () => {
  const [flightPath, setFlightPath] = useState<FlightPath | null>(null);
  const [flightIndex, setFlightIndex] = useState(0); // alternate between 0 and 1
  const [isFlying, setIsFlying] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const screenWidth = typeof window !== "undefined" ? window.innerWidth : 1200;
  const screenHeight = typeof window !== "undefined" ? window.innerHeight : 800;

  const planeImage1 = "/plane-1.png"; // left -> bottom-center
  const planeImage2 = "/plane-2.png"; // right -> top-center

  // Calculates angle between two points
  const calculateAngle = (from: Point, to: Point) => {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    return (Math.atan2(dy, dx) * 180) / Math.PI;
  };

  const getFlightPath = useCallback(
    (index: number): FlightPath => {
      if (index % 2 === 0) {
        // Left to Bottom-Center
        return {
          id: `plane-L2BC-${Date.now()}`,
          imageSrc: planeImage1,
          points: [
            { x: -100, y: screenHeight * 0.1 },
            { x: screenWidth * 0.25, y: screenHeight * 0.5 },
            { x: screenWidth * 0.5, y: screenHeight * 1.1 },
          ],
        };
      } else {
        // Right to Top-Center
        return {
          id: `plane-R2TC-${Date.now()}`,
          imageSrc: planeImage2,
          points: [
            { x: screenWidth + 100, y: screenHeight * 0.9 },
            { x: screenWidth * 0.75, y: screenHeight * 0.5 },
            { x: screenWidth * 0.5, y: screenHeight * -0.1 },
          ],
        };
      }
    },
    [screenWidth, screenHeight]
  );

  useEffect(() => {
    const launchPlane = () => {
      const path = getFlightPath(flightIndex);
      setFlightPath(path);
      setIsFlying(true);

      // Stop animation after fixed duration (7s) and schedule next
      timerRef.current = setTimeout(() => {
        setIsFlying(false);
        setFlightIndex((prev) => (prev + 1) % 2);
      }, 7000);
    };

    const interval = setInterval(() => {
      launchPlane();
    }, 9000); // 7s animation + 2s delay

    launchPlane(); // initial

    return () => {
      clearInterval(interval);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [flightIndex, getFlightPath]);

  if (!isFlying || !flightPath) return null;

  const keyframesX = flightPath.points.map((p) => p.x);
  const keyframesY = flightPath.points.map((p) => p.y);
  const rotations = flightPath.points
    .slice(0, -1)
    .map((p, i) => calculateAngle(p, flightPath.points[i + 1]));
  rotations.push(rotations[rotations.length - 1]); // repeat last angle

  const isReversed =
    flightPath.points[0].x > flightPath.points[flightPath.points.length - 1].x;

  return (
    <motion.div
      key={flightPath.id}
      initial={{
        x: keyframesX[0],
        y: keyframesY[0],
        rotate: rotations[0],
        opacity: 0,
      }}
      animate={{
        x: keyframesX,
        y: keyframesY,
        rotate: rotations,
        opacity: 1,
        transition: {
          x: { duration: 7, ease: "linear" },
          y: { duration: 7, ease: "linear" },
          rotate: { duration: 7, ease: "linear" },
          opacity: { duration: 0.5, ease: "easeOut" },
        },
      }}
      exit={{
        opacity: 0,
        transition: { duration: 0.3 },
      }}
      style={{
        position: "fixed",
        zIndex: 500,
        pointerEvents: "none",
      }}
    >
      <Image
        src={flightPath.imageSrc}
        alt="Paper Plane"
        width={80}
        height={80}
        className="drop-shadow-md"
      />
    </motion.div>
  );
};

export default AnimatedPaperPlane;
