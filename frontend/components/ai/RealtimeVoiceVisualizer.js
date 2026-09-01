"use client";

import React, { useRef, useEffect } from "react";

/**
 * Realtime Audio Waveform & Glowing Voice Orb Visualizer
 * Reacts dynamically to live audio frequency data and conversation states.
 */
export function RealtimeVoiceVisualizer({
  state = "IDLE", // 'IDLE' | 'CONNECTING' | 'LISTENING' | 'THINKING' | 'SPEAKING' | 'ERROR'
  audioLevel = 0,
  frequencies = [],
  className = "",
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId;
    let phase = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Colors based on state
      let primaryColor = "rgba(13, 148, 136, 0.85)"; // Teal 600
      let glowColor = "rgba(45, 212, 191, 0.4)"; // Teal 400
      let ringColor = "rgba(13, 148, 136, 0.25)";

      if (state === "SPEAKING") {
        primaryColor = "rgba(37, 99, 235, 0.9)"; // Blue 600
        glowColor = "rgba(96, 165, 250, 0.5)"; // Blue 400
        ringColor = "rgba(59, 130, 246, 0.3)";
      } else if (state === "THINKING") {
        primaryColor = "rgba(147, 51, 234, 0.85)"; // Purple 600
        glowColor = "rgba(192, 132, 252, 0.4)";
        ringColor = "rgba(168, 85, 247, 0.25)";
      } else if (state === "ERROR") {
        primaryColor = "rgba(225, 29, 72, 0.9)"; // Rose 600
        glowColor = "rgba(251, 113, 133, 0.4)";
        ringColor = "rgba(244, 63, 94, 0.25)";
      } else if (state === "CONNECTING") {
        primaryColor = "rgba(234, 179, 8, 0.85)"; // Amber 500
        glowColor = "rgba(250, 204, 21, 0.4)";
        ringColor = "rgba(234, 179, 8, 0.25)";
      }

      // Base radius + modulation
      const baseRadius = 38;
      const dynamicBoost = (audioLevel || 0) * 28;
      const pulse = Math.sin(phase) * 4;
      const radius = baseRadius + dynamicBoost + (state === "SPEAKING" || state === "LISTENING" ? pulse : 0);

      // 1. Draw outer ambient glowing rings
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius + 22, 0, Math.PI * 2);
      ctx.fillStyle = ringColor;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius + 10, 0, Math.PI * 2);
      ctx.fillStyle = glowColor;
      ctx.fill();

      // 2. Draw central energy orb
      const gradient = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, radius);
      gradient.addColorStop(0, "#ffffff");
      gradient.addColorStop(0.4, primaryColor);
      gradient.addColorStop(1, glowColor);

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.shadowColor = primaryColor;
      ctx.shadowBlur = 24;
      ctx.fill();
      ctx.shadowBlur = 0; // reset

      // 3. Draw animated wave bars around the orb when active
      if (frequencies && frequencies.length > 0 && (state === "LISTENING" || state === "SPEAKING")) {
        const numBars = 24;
        const barAngleStep = (Math.PI * 2) / numBars;

        for (let i = 0; i < numBars; i++) {
          const freqIndex = i % frequencies.length;
          const freqValue = frequencies[freqIndex] || 0;
          const barHeight = Math.max(4, (freqValue / 255) * 32);

          const angle = i * barAngleStep + phase * 0.5;
          const startX = centerX + Math.cos(angle) * (radius + 6);
          const startY = centerY + Math.sin(angle) * (radius + 6);
          const endX = centerX + Math.cos(angle) * (radius + 6 + barHeight);
          const endY = centerY + Math.sin(angle) * (radius + 6 + barHeight);

          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, endY);
          ctx.strokeStyle = primaryColor;
          ctx.lineWidth = 3;
          ctx.lineCap = "round";
          ctx.stroke();
        }
      }

      phase += 0.04;
      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [state, audioLevel, frequencies]);

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <canvas
        ref={canvasRef}
        width={220}
        height={220}
        className="w-[200px] h-[200px] sm:w-[220px] sm:h-[220px] drop-shadow-md"
        aria-label="Realtime Voice Activity Visualizer"
      />
    </div>
  );
}
export default RealtimeVoiceVisualizer;
