"use client";

export function InteractiveBackground() {
  return (
    <div 
      className="pointer-events-none -z-10"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        overflow: "hidden"
      }}
    >
      {/* Base Background Color */}
      <div className="absolute inset-0 bg-background" />

      {/* 4-Point alternating mesh gradient (more white) */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(circle at 10% 20%, var(--bg-gradient-1) 0%, transparent 25%),
            radial-gradient(circle at 90% 10%, var(--bg-gradient-2) 0%, transparent 35%),
            radial-gradient(circle at 80% 90%, var(--bg-gradient-1) 0%, transparent 25%),
            radial-gradient(circle at 15% 85%, var(--bg-gradient-2) 0%, transparent 35%)
          `
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.02'/%3E%3C/svg%3E")`
        }}
      />
    </div>
  );
}
