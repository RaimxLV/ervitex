import { motion, useReducedMotion } from "framer-motion";

const STATIONS = [0, 45, 90, 135, 180, 225, 270, 315];

const ScreenPrintingCarousel = () => {
  const reduceMotion = useReducedMotion();

  return (
    <div className="flex h-full w-full items-center justify-center overflow-hidden" aria-hidden="true">
      <svg
        viewBox="0 0 1280 780"
        className="h-auto w-[165%] max-w-none text-foreground opacity-[0.16] sm:w-[128%] lg:w-[104%]"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Floor and machine footprint */}
        <g strokeWidth="1.4" opacity="0.42">
          <path d="M82 688h1116M155 720h970" strokeDasharray="7 12" />
          <ellipse cx="635" cy="650" rx="430" ry="63" />
        </g>

        {/* Fixed steel base and central mast */}
        <g strokeWidth="2.6">
          <path d="M472 625 420 686h424l-49-61" />
          <path d="M492 590h285l42 69H448z" />
          <path d="M535 590 558 360h150l27 230" />
          <path d="M558 360h150l-16-47H573z" />
          <path d="M596 590V373M669 590V373" opacity="0.55" />
          <ellipse cx="633" cy="354" rx="94" ry="31" />
          <path d="M539 354v42c0 18 42 32 94 32s94-14 94-32v-42" />
        </g>

        {/* Rotating pallet table: the only moving part in the illustration */}
        <motion.g
          style={{ transformOrigin: "633px 350px" }}
          animate={reduceMotion ? undefined : { rotate: [0, 45, 45, 90, 90, 135, 135, 180] }}
          transition={{ duration: 22, ease: "easeInOut", repeat: Infinity, times: [0, 0.18, 0.28, 0.46, 0.56, 0.74, 0.84, 1] }}
        >
          <g transform="translate(633 350) scale(1 0.38) translate(-633 -350)" strokeWidth="2.2">
            <circle cx="633" cy="350" r="156" strokeWidth="5" />
            <circle cx="633" cy="350" r="127" strokeWidth="2" />
            {STATIONS.map((angle) => (
              <g key={angle} transform={`rotate(${angle} 633 350)`}>
                <path d="M633 224V102" strokeWidth="9" />
                <path d="M615 217 592 116M651 217l23-101" />
                <path d="M592 116h82" strokeWidth="5" />
                {/* Shirt platen, viewed as a long rounded board */}
                <path d="M582 116 568 43c-2-12 7-22 19-22h92c12 0 21 10 19 22l-14 73z" fill="currentColor" fillOpacity="0.055" />
                <path d="M584 72h98" opacity="0.5" />
              </g>
            ))}
            <circle cx="633" cy="350" r="57" strokeWidth="8" />
            <circle cx="633" cy="350" r="19" strokeWidth="5" />
          </g>
        </motion.g>

        {/* Stationary arched gantry carrying the print heads */}
        <g strokeWidth="2.8">
          <path d="M285 414c11-232 143-350 349-350 211 0 344 117 355 350" strokeWidth="8" />
          <path d="M318 414c12-208 129-315 316-315 192 0 309 106 322 315" />
          <path d="M286 414v185h62V414M926 414v185h63V414" />
          <path d="M274 599h87l24 55H251zM914 599h87l24 55h-135z" />
        </g>

        {/* Recognisable rectangular screen-print heads and screen frames */}
        {[332, 482, 632, 782, 932].map((x, index) => {
          const top = index === 2 ? 79 : index === 1 || index === 3 ? 116 : 203;
          return (
            <g key={x} strokeWidth="2.4">
              <path d={`M${x - 48} ${top}h96l17 30-14 58h-102l-14-58z`} fill="currentColor" fillOpacity="0.04" />
              <rect x={x - 39} y={top + 16} width="78" height="31" rx="3" />
              <circle cx={x + 24} cy={top + 31} r="5" />
              <path d={`M${x - 28} ${top + 60}v68M${x + 28} ${top + 60}v68`} />
              <path d={`M${x - 77} ${top + 128}h154l-13 37h-128z`} strokeWidth="4" />
              <path d={`M${x - 58} ${top + 145}h116`} opacity="0.55" />
              <path d={`M${x - 36} ${top + 165}v30h72v-30`} />
            </g>
          );
        })}

        {/* Side drying station and control cabinet */}
        <g strokeWidth="2.5">
          <path d="M1010 376h126v221h-126z" fill="currentColor" fillOpacity="0.035" />
          <path d="M1028 399h90v66h-90z" />
          <path d="M1043 420h60M1043 437h42" opacity="0.65" />
          <circle cx="1097" cy="491" r="10" />
          <circle cx="1067" cy="491" r="6" />
          <path d="M1035 525h75M1035 544h75M1035 563h46" opacity="0.6" />
          <path d="M1028 597v36M1118 597v36" />
          <path d="M190 386h111v164H190zM207 406h77v85h-77z" />
          <path d="M224 550v50M269 550v50M203 600h87" />
          <path d="M219 424h53M219 440h53M219 456h39" opacity="0.6" />
        </g>

        {/* Technical callouts make the outline read as machinery, not decoration */}
        <g strokeWidth="1.3" opacity="0.5">
          <path d="M128 282h136M128 282v30M1134 282h68M1202 282v30" />
          <circle cx="147" cy="333" r="8" />
          <path d="M134 333h26M147 320v26" />
          <circle cx="1159" cy="333" r="8" />
          <path d="M1146 333h26M1159 320v26" />
        </g>
      </svg>
    </div>
  );
};

export default ScreenPrintingCarousel;