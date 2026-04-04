const ScreenPressLineart = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 800 600"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {/* Central carousel hub */}
    <circle cx="400" cy="300" r="60" stroke="currentColor" strokeWidth="0.8" />
    <circle cx="400" cy="300" r="45" stroke="currentColor" strokeWidth="0.5" />
    <circle cx="400" cy="300" r="8" stroke="currentColor" strokeWidth="1" />
    
    {/* Carousel arms - 6 arms radiating out */}
    {[0, 60, 120, 180, 240, 300].map((angle) => {
      const rad = (angle * Math.PI) / 180;
      const x1 = 400 + 60 * Math.cos(rad);
      const y1 = 300 + 60 * Math.sin(rad);
      const x2 = 400 + 180 * Math.cos(rad);
      const y2 = 300 + 180 * Math.sin(rad);
      return (
        <g key={angle}>
          {/* Arm line */}
          <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="0.7" />
          {/* Screen frame at end of arm */}
          <rect
            x={x2 - 30}
            y={y2 - 20}
            width="60"
            height="40"
            stroke="currentColor"
            strokeWidth="0.6"
            transform={`rotate(${angle}, ${x2}, ${y2})`}
          />
          {/* Inner screen mesh hint */}
          <rect
            x={x2 - 24}
            y={y2 - 14}
            width="48"
            height="28"
            stroke="currentColor"
            strokeWidth="0.3"
            strokeDasharray="2 3"
            transform={`rotate(${angle}, ${x2}, ${y2})`}
          />
          {/* Hinge joint */}
          <circle cx={x2} cy={y2} r="4" stroke="currentColor" strokeWidth="0.5" />
        </g>
      );
    })}

    {/* Base/stand */}
    <line x1="400" y1="360" x2="400" y2="520" stroke="currentColor" strokeWidth="0.8" />
    <line x1="340" y1="520" x2="460" y2="520" stroke="currentColor" strokeWidth="0.8" />
    <line x1="350" y1="520" x2="330" y2="560" stroke="currentColor" strokeWidth="0.6" />
    <line x1="450" y1="520" x2="470" y2="560" stroke="currentColor" strokeWidth="0.6" />
    <line x1="310" y1="560" x2="490" y2="560" stroke="currentColor" strokeWidth="0.8" />

    {/* Squeegee detail on one arm */}
    <line x1="540" y1="275" x2="540" y2="325" stroke="currentColor" strokeWidth="1" />
    <line x1="530" y1="325" x2="550" y2="325" stroke="currentColor" strokeWidth="0.8" />

    {/* Registration marks / crosshairs */}
    <g opacity="0.5">
      <line x1="150" y1="140" x2="170" y2="140" stroke="currentColor" strokeWidth="0.4" />
      <line x1="160" y1="130" x2="160" y2="150" stroke="currentColor" strokeWidth="0.4" />
      <circle cx="160" cy="140" r="6" stroke="currentColor" strokeWidth="0.3" />
    </g>
    <g opacity="0.5">
      <line x1="640" y1="460" x2="660" y2="460" stroke="currentColor" strokeWidth="0.4" />
      <line x1="650" y1="450" x2="650" y2="470" stroke="currentColor" strokeWidth="0.4" />
      <circle cx="650" cy="460" r="6" stroke="currentColor" strokeWidth="0.3" />
    </g>

    {/* Technical dimension lines */}
    <g opacity="0.3">
      <line x1="100" y1="80" x2="700" y2="80" stroke="currentColor" strokeWidth="0.3" strokeDasharray="4 6" />
      <line x1="100" y1="75" x2="100" y2="85" stroke="currentColor" strokeWidth="0.3" />
      <line x1="700" y1="75" x2="700" y2="85" stroke="currentColor" strokeWidth="0.3" />
    </g>
  </svg>
);

export default ScreenPressLineart;
