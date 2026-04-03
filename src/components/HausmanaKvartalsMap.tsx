import { motion } from "framer-motion";

const HausmanaKvartalsMap = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="overflow-hidden rounded-sm border border-border"
    >
      <svg
        viewBox="0 0 800 600"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
        style={{ background: "hsl(var(--muted))" }}
      >
        {/* Background */}
        <rect width="800" height="600" fill="hsl(0 0% 15%)" />

        {/* Logo - Hausmaņa Kvartāls */}
        <g transform="translate(80, 30)">
          {/* H house icon */}
          <g fill="none" stroke="hsl(0 0% 85%)" strokeWidth="2.5">
            {/* Roof */}
            <path d="M0 28 L22 8 L44 28" />
            <path d="M6 24 L22 12 L38 24" />
            {/* Walls */}
            <line x1="4" y1="28" x2="4" y2="44" />
            <line x1="40" y1="28" x2="40" y2="44" />
            {/* Door / H vertical lines */}
            <line x1="14" y1="28" x2="14" y2="44" />
            <line x1="30" y1="28" x2="30" y2="44" />
            {/* H horizontal */}
            <line x1="14" y1="36" x2="30" y2="36" />
          </g>
          <text x="54" y="36" fontFamily="Montserrat, sans-serif" fontSize="20" fontWeight="700" fill="hsl(0 0% 85%)" letterSpacing="1">
            Hausmaņa
          </text>
          <text x="54" y="52" fontFamily="Montserrat, sans-serif" fontSize="20" fontWeight="700" fill="hsl(0 0% 85%)" letterSpacing="1">
            Kvartāls
          </text>
        </g>

        {/* Street labels - Top Braslas iela */}
        <rect x="100" y="85" width="520" height="28" fill="hsl(0 0% 25%)" rx="2" />
        <text x="360" y="104" fontFamily="Inter, sans-serif" fontSize="12" fontWeight="600" fill="hsl(0 0% 70%)" textAnchor="middle" letterSpacing="2">
          BRASLAS IELA
        </text>

        {/* Street labels - Bottom Braslas iela */}
        <rect x="100" y="500" width="520" height="28" fill="hsl(0 0% 25%)" rx="2" />
        <text x="360" y="519" fontFamily="Inter, sans-serif" fontSize="12" fontWeight="600" fill="hsl(0 0% 70%)" textAnchor="middle" letterSpacing="2">
          BRASLAS IELA
        </text>

        {/* Street labels - Right Madonas iela (vertical) */}
        <rect x="620" y="113" width="28" height="387" fill="hsl(0 0% 25%)" rx="2" />
        <text x="634" y="320" fontFamily="Inter, sans-serif" fontSize="12" fontWeight="600" fill="hsl(0 0% 70%)" textAnchor="middle" letterSpacing="2" transform="rotate(-90 634 320)">
          MADONAS IELA
        </text>

        {/* Complex ground / courtyard area */}
        <rect x="130" y="113" width="490" height="387" fill="hsl(0 0% 20%)" rx="2" />

        {/* ===== 1. korpuss (Braslas 29) - L-shaped top-left ===== */}
        <g>
          {/* Main horizontal block */}
          <rect x="180" y="130" width="260" height="90" fill="hsl(0 0% 92%)" rx="3" stroke="hsl(0 0% 75%)" strokeWidth="1" />
          {/* Left wing going down */}
          <rect x="180" y="130" width="80" height="180" fill="hsl(0 0% 92%)" rx="3" stroke="hsl(0 0% 75%)" strokeWidth="1" />
          
          {/* Building label */}
          <text x="300" y="170" fontFamily="Inter, sans-serif" fontSize="11" fontWeight="500" fill="hsl(0 0% 35%)" textAnchor="middle">
            1. korpuss
          </text>
          <text x="300" y="186" fontFamily="Inter, sans-serif" fontSize="11" fontWeight="500" fill="hsl(0 0% 35%)" textAnchor="middle">
            Braslas
          </text>
          <text x="300" y="202" fontFamily="Inter, sans-serif" fontSize="14" fontWeight="800" fill="hsl(0 0% 15%)" textAnchor="middle">
            29
          </text>
        </g>

        {/* ===== 2. korpuss (Braslas 29a) - rectangular bottom ===== */}
        <g>
          <rect x="240" y="320" width="280" height="110" fill="hsl(0 0% 92%)" rx="3" stroke="hsl(0 0% 75%)" strokeWidth="1" />
          
          {/* Building label */}
          <text x="380" y="370" fontFamily="Inter, sans-serif" fontSize="11" fontWeight="500" fill="hsl(0 0% 35%)" textAnchor="middle">
            2. korpuss
          </text>
          <text x="380" y="386" fontFamily="Inter, sans-serif" fontSize="11" fontWeight="500" fill="hsl(0 0% 35%)" textAnchor="middle">
            Braslas
          </text>
          <text x="380" y="402" fontFamily="Inter, sans-serif" fontSize="14" fontWeight="800" fill="hsl(0 0% 15%)" textAnchor="middle">
            29a
          </text>
        </g>

        {/* ===== ENTRANCE MARKERS ===== */}
        
        {/* Entrance D - HIGHLIGHTED RED for Ervitex */}
        <g>
          <circle cx="370" cy="130" r="14" fill="hsl(0 85% 50%)" />
          <text x="370" y="135" fontFamily="Inter, sans-serif" fontSize="12" fontWeight="700" fill="white" textAnchor="middle">D</text>
          
          {/* ERVITEX callout label */}
          <line x1="384" y1="125" x2="480" y2="105" stroke="hsl(0 85% 50%)" strokeWidth="1.5" />
          <rect x="480" y="92" width="120" height="30" fill="hsl(0 85% 50%)" rx="3" />
          <text x="540" y="105" fontFamily="Montserrat, sans-serif" fontSize="9" fontWeight="700" fill="white" textAnchor="middle" letterSpacing="1.5">
            ERVITEX
          </text>
          <text x="540" y="116" fontFamily="Inter, sans-serif" fontSize="8" fontWeight="500" fill="hsl(0 85% 70%)" textAnchor="middle">
            (2. stāvs)
          </text>
        </g>

        {/* Entrance E - left side of building 1 */}
        <g>
          <circle cx="168" cy="180" r="13" fill="hsl(0 0% 30%)" />
          <text x="168" y="185" fontFamily="Inter, sans-serif" fontSize="11" fontWeight="700" fill="white" textAnchor="middle">E</text>
        </g>

        {/* Entrance C - between buildings */}
        <g>
          <circle cx="340" cy="295" r="13" fill="hsl(0 0% 30%)" />
          <text x="340" y="300" fontFamily="Inter, sans-serif" fontSize="11" fontWeight="700" fill="white" textAnchor="middle">C</text>
        </g>

        {/* Entrance A - bottom of building 2 */}
        <g>
          <circle cx="350" cy="442" r="13" fill="hsl(0 0% 30%)" />
          <text x="350" y="447" fontFamily="Inter, sans-serif" fontSize="11" fontWeight="700" fill="white" textAnchor="middle">A</text>
        </g>

        {/* Entrance B - right side of building 2 */}
        <g>
          <circle cx="532" cy="415" r="13" fill="hsl(0 0% 30%)" />
          <text x="532" y="420" fontFamily="Inter, sans-serif" fontSize="11" fontWeight="700" fill="white" textAnchor="middle">B</text>
        </g>

        {/* ===== PARKING ZONES ===== */}
        
        {/* P near entrance D (top right of building 1) */}
        <g>
          <rect x="410" y="130" width="30" height="24" fill="hsl(0 0% 35%)" rx="3" />
          <text x="425" y="147" fontFamily="Inter, sans-serif" fontSize="12" fontWeight="700" fill="white" textAnchor="middle">P</text>
        </g>

        {/* P left side (near Piegādes Zona) */}
        <g>
          <rect x="142" y="300" width="30" height="24" fill="hsl(0 0% 35%)" rx="3" />
          <text x="157" y="317" fontFamily="Inter, sans-serif" fontSize="12" fontWeight="700" fill="white" textAnchor="middle">P</text>
        </g>

        {/* P right of building 2 */}
        <g>
          <rect x="540" y="320" width="30" height="24" fill="hsl(0 0% 35%)" rx="3" />
          <text x="555" y="337" fontFamily="Inter, sans-serif" fontSize="12" fontWeight="700" fill="white" textAnchor="middle">P</text>
        </g>

        {/* P bottom center (under entrance A) */}
        <g>
          <rect x="380" y="455" width="30" height="24" fill="hsl(0 0% 35%)" rx="3" />
          <text x="395" y="472" fontFamily="Inter, sans-serif" fontSize="12" fontWeight="700" fill="white" textAnchor="middle">P</text>
        </g>

        {/* P bottom right corner */}
        <g>
          <rect x="570" y="465" width="30" height="24" fill="hsl(0 0% 35%)" rx="3" />
          <text x="585" y="482" fontFamily="Inter, sans-serif" fontSize="12" fontWeight="700" fill="white" textAnchor="middle">P</text>
        </g>

        {/* P far right (outside complex in Madonas iela area) */}
        <g>
          <rect x="665" y="465" width="30" height="24" fill="hsl(0 0% 35%)" rx="3" />
          <text x="680" y="482" fontFamily="Inter, sans-serif" fontSize="12" fontWeight="700" fill="white" textAnchor="middle">P</text>
        </g>

        {/* ===== NUMBERED PARKING LOTS ===== */}
        
        {/* Lot 1 */}
        <g>
          <circle cx="225" cy="400" r="12" fill="hsl(0 0% 10%)" stroke="hsl(0 0% 45%)" strokeWidth="1.5" />
          <text x="225" y="405" fontFamily="Inter, sans-serif" fontSize="11" fontWeight="700" fill="white" textAnchor="middle">1</text>
        </g>

        {/* Lot 2 */}
        <g>
          <circle cx="255" cy="305" r="12" fill="hsl(0 0% 10%)" stroke="hsl(0 0% 45%)" strokeWidth="1.5" />
          <text x="255" y="310" fontFamily="Inter, sans-serif" fontSize="11" fontWeight="700" fill="white" textAnchor="middle">2</text>
        </g>

        {/* Lot 3 */}
        <g>
          <circle cx="265" cy="275" r="12" fill="hsl(0 0% 10%)" stroke="hsl(0 0% 45%)" strokeWidth="1.5" />
          <text x="265" y="280" fontFamily="Inter, sans-serif" fontSize="11" fontWeight="700" fill="white" textAnchor="middle">3</text>
        </g>

        {/* ===== PIEGĀDES ZONA (Delivery Zone) ===== */}
        <text x="140" y="365" fontFamily="Inter, sans-serif" fontSize="9" fontWeight="600" fill="hsl(0 0% 55%)" letterSpacing="1" textAnchor="start">
          PIEGĀDES
        </text>
        <text x="140" y="378" fontFamily="Inter, sans-serif" fontSize="9" fontWeight="600" fill="hsl(0 0% 55%)" letterSpacing="1" textAnchor="start">
          ZONA
        </text>

        {/* Subtle grid lines for premium feel */}
        <line x1="100" y1="113" x2="100" y2="528" stroke="hsl(0 0% 28%)" strokeWidth="0.5" />
        <line x1="648" y1="85" x2="648" y2="528" stroke="hsl(0 0% 28%)" strokeWidth="0.5" />

        {/* Accent line at bottom */}
        <rect x="0" y="595" width="800" height="5" fill="hsl(0 85% 50%)" />
      </svg>
    </motion.div>
  );
};

export default HausmanaKvartalsMap;
