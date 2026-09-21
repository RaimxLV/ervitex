import { motion, useReducedMotion } from "framer-motion";

const ARM_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

const ScreenPrintingCarousel = () => {
  const reduceMotion = useReducedMotion();

  return (
    <div className="flex h-full w-full items-center justify-center overflow-hidden" aria-hidden="true">
      <svg
        viewBox="0 0 1200 760"
        className="h-auto w-[150%] max-w-none text-foreground opacity-[0.13] sm:w-[118%] lg:w-[92%]"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <g strokeWidth="2">
          <path d="M530 413 468 675h264l-62-262" />
          <path d="m490 675-35 42h330l-35-42" />
          <path d="M524 520h152M500 610h200" />
          <path d="m542 675 22-107h112l22 107" />
          <circle cx="620" cy="410" r="86" />
          <circle cx="620" cy="410" r="64" />
          <path d="M585 386h70l18 24-18 24h-70l-18-24z" />
        </g>

        <motion.g
          strokeWidth="2.2"
          style={{ transformOrigin: "620px 410px" }}
          animate={reduceMotion ? undefined : { rotate: 360 }}
          transition={{ duration: 34, ease: "linear", repeat: Infinity }}
        >
          <circle cx="620" cy="410" r="146" strokeWidth="3" />
          <circle cx="620" cy="410" r="122" strokeDasharray="4 10" />

          {ARM_ANGLES.map((angle) => (
            <g key={angle} transform={`rotate(${angle} 620 410)`}>
              <path d="M620 264V108" strokeWidth="6" />
              <path d="M602 264 572 128M638 264l30-136" />
              <path d="M568 128h104" strokeWidth="4" />
              <path d="M554 126 532 50h176l-22 76z" />
              <path d="M546 77h148M564 126l-10 32h132l-10-32" />
              <path d="M576 264 550 222h140l-26 42" />
              <rect x="548" y="188" width="144" height="36" rx="3" />
              <path d="M570 188v-18h100v18" />
              <circle cx="620" cy="206" r="7" />
            </g>
          ))}

          <circle cx="620" cy="410" r="52" strokeWidth="5" />
          <circle cx="620" cy="410" r="20" strokeWidth="4" />
          <path d="M620 358v104M568 410h104" />
        </motion.g>

        <g strokeWidth="2.4">
          <path d="M732 396h118v190H732" />
          <path d="M850 420h44v142h-44" />
          <rect x="749" y="418" width="82" height="63" rx="4" />
          <path d="M765 503h50M765 522h50M765 541h34" />
          <circle cx="817" cy="548" r="10" />
          <path d="M752 586h142l24 84H736" />
          <path d="M753 670h-28M902 670h28" />
        </g>

        <g strokeWidth="1.5" opacity="0.75">
          <path d="M96 668h1008" strokeDasharray="8 12" />
          <path d="M132 692h936" />
          <path d="M170 709h860" strokeDasharray="2 9" />
          <path d="M168 172h132M940 172h92" />
          <path d="M168 172v30M1032 172v30" />
        </g>
      </svg>
    </div>
  );
};

export default ScreenPrintingCarousel;