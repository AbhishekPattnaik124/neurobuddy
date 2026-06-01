export function AuroraBackground() {
  return (
    <>
      {/* Aurora blobs */}
      <div
        className="aurora-blob"
        style={{
          width: '50vw', height: '50vw',
          top: '-10vh', left: '-10vw',
          background: 'radial-gradient(circle, rgba(0,229,255,0.045) 0%, transparent 70%)',
          animation: 'aurora-1 20s ease-in-out infinite alternate',
        }}
      />
      <div
        className="aurora-blob"
        style={{
          width: '45vw', height: '45vw',
          top: '30vh', right: '-15vw',
          background: 'radial-gradient(circle, rgba(0,255,157,0.035) 0%, transparent 70%)',
          animation: 'aurora-2 25s ease-in-out infinite alternate',
          animationDelay: '-8s',
        }}
      />
      <div
        className="aurora-blob"
        style={{
          width: '40vw', height: '40vw',
          bottom: '-10vh', left: '30vw',
          background: 'radial-gradient(circle, rgba(123,97,255,0.04) 0%, transparent 70%)',
          animation: 'aurora-3 18s ease-in-out infinite alternate',
          animationDelay: '-5s',
        }}
      />

      {/* SVG dot grid overlay */}
      <svg
        style={{
          position: 'fixed', inset: 0, width: '100%', height: '100%',
          pointerEvents: 'none', zIndex: 1, opacity: 0.03,
        }}
      >
        <defs>
          <pattern id="dot-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="rgba(0,229,255,1)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dot-grid)" />
      </svg>

      {/* Grain texture using SVG noise */}
      <svg
        style={{
          position: 'fixed', inset: 0, width: '100%', height: '100%',
          pointerEvents: 'none', zIndex: 2, opacity: 0.025,
        }}
      >
        <filter id="grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.75"
            numOctaves="4"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </>
  );
}
