import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "motion/react";
import { useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ExerciseStep {
  instruction: string;
  svg: React.ReactNode;
}

interface Exercise {
  name: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  targets: string[];
  sets: string;
  reps: string;
  rest: string;
  steps: ExerciseStep[];
}

interface MuscleGuideGroup {
  id: string;
  label: string;
  color: string;
  bgColor: string;
  exercises: Exercise[];
}

// ─── SVG Stick Figure Helpers ─────────────────────────────────────────────────
// Reusable SVG stickman primitives — all built from <circle> and <line> SVG elements
// viewBox is always "0 0 120 140" so figures are consistent

const SV = ({
  children,
  label,
}: { children: React.ReactNode; label?: string }) => (
  <svg
    viewBox="0 0 120 140"
    className="w-full h-full"
    role="img"
    aria-label={label ?? "Exercise illustration"}
    style={{ overflow: "visible" }}
  >
    <title>{label ?? "Exercise illustration"}</title>
    {children}
  </svg>
);

// Head
const Head = ({
  cx = 60,
  cy = 16,
  r = 10,
  fill = "#E8A878",
}: { cx?: number; cy?: number; r?: number; fill?: string }) => (
  <circle
    cx={cx}
    cy={cy}
    r={r}
    fill={fill}
    stroke="#C07840"
    strokeWidth="1.5"
  />
);

// Spine / torso
const Torso = ({
  x1 = 60,
  y1 = 26,
  x2 = 60,
  y2 = 70,
  stroke = "#C07840",
}: { x1?: number; y1?: number; x2?: number; y2?: number; stroke?: string }) => (
  <line
    x1={x1}
    y1={y1}
    x2={x2}
    y2={y2}
    stroke={stroke}
    strokeWidth="3"
    strokeLinecap="round"
  />
);

// Shoulders bar
const Shoulders = ({
  cx = 60,
  y = 38,
  w = 28,
  stroke = "#C07840",
}: { cx?: number; y?: number; w?: number; stroke?: string }) => (
  <line
    x1={cx - w}
    y1={y}
    x2={cx + w}
    y2={y}
    stroke={stroke}
    strokeWidth="3"
    strokeLinecap="round"
  />
);

// Hip bar
const Hips = ({
  cx = 60,
  y = 70,
  w = 18,
  stroke = "#C07840",
}: { cx?: number; y?: number; w?: number; stroke?: string }) => (
  <line
    x1={cx - w}
    y1={y}
    x2={cx + w}
    y2={y}
    stroke={stroke}
    strokeWidth="3"
    strokeLinecap="round"
  />
);

// Arrow for motion direction
const Arrow = ({
  x1,
  y1,
  x2,
  y2,
  color = "#FF7A50",
}: { x1: number; y1: number; x2: number; y2: number; color?: string }) => {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const al = 10;
  const ax1 = x2 - al * Math.cos(angle - 0.5);
  const ay1 = y2 - al * Math.sin(angle - 0.5);
  const ax2 = x2 - al * Math.cos(angle + 0.5);
  const ay2 = y2 - al * Math.sin(angle + 0.5);
  return (
    <g>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="4 2"
      />
      <polyline
        points={`${ax1},${ay1} ${x2},${y2} ${ax2},${ay2}`}
        stroke={color}
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  );
};

// Highlight glow circle
const Highlight = ({
  cx,
  cy,
  r = 18,
  color,
}: { cx: number; cy: number; r?: number; color: string }) => (
  <circle
    cx={cx}
    cy={cy}
    r={r}
    fill={`${color}30`}
    stroke={`${color}80`}
    strokeWidth="1.5"
  />
);

// ─── Bench Press Steps ────────────────────────────────────────────────────────
const BenchPressStep1 = () => (
  <SV label="Lie on bench, bar at chest level">
    {/* Bench */}
    <rect
      x="10"
      y="75"
      width="100"
      height="12"
      rx="4"
      fill="#2a2a2a"
      stroke="#444"
      strokeWidth="1"
    />
    {/* Body lying flat */}
    <ellipse cx="60" cy="68" rx="40" ry="10" fill="#C07840" opacity="0.3" />
    <Head cx={95} cy={64} />
    <line
      x1="90"
      y1="68"
      x2="30"
      y2="68"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    {/* Arms up holding bar */}
    <line
      x1="45"
      y1="68"
      x2="40"
      y2="48"
      stroke="#C07840"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <line
      x1="75"
      y1="68"
      x2="80"
      y2="48"
      stroke="#C07840"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    {/* Bar */}
    <line
      x1="30"
      y1="46"
      x2="90"
      y2="46"
      stroke="#888"
      strokeWidth="4"
      strokeLinecap="round"
    />
    <circle cx="30" cy="46" r="7" fill="#666" />
    <circle cx="90" cy="46" r="7" fill="#666" />
    <Highlight cx={60} cy={68} r={16} color="#E8A8A0" />
    <Arrow x1={60} y1={46} x2={60} y2={34} />
  </SV>
);

const BenchPressStep2 = () => (
  <SV label="Lower bar to chest with control">
    <rect
      x="10"
      y="75"
      width="100"
      height="12"
      rx="4"
      fill="#2a2a2a"
      stroke="#444"
      strokeWidth="1"
    />
    <Head cx={95} cy={64} />
    <line
      x1="90"
      y1="68"
      x2="30"
      y2="68"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <line
      x1="48"
      y1="68"
      x2="38"
      y2="62"
      stroke="#C07840"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <line
      x1="72"
      y1="68"
      x2="82"
      y2="62"
      stroke="#C07840"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <line
      x1="28"
      y1="60"
      x2="92"
      y2="60"
      stroke="#888"
      strokeWidth="4"
      strokeLinecap="round"
    />
    <circle cx="28" cy="60" r="7" fill="#666" />
    <circle cx="92" cy="60" r="7" fill="#666" />
    <Highlight cx={60} cy={65} r={14} color="#E8A8A0" />
    <Arrow x1={60} y1={46} x2={60} y2={58} color="#FF7A50" />
  </SV>
);

const BenchPressStep3 = () => (
  <SV label="Press bar explosively upward">
    <rect
      x="10"
      y="75"
      width="100"
      height="12"
      rx="4"
      fill="#2a2a2a"
      stroke="#444"
      strokeWidth="1"
    />
    <Head cx={95} cy={64} />
    <line
      x1="90"
      y1="68"
      x2="30"
      y2="68"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <line
      x1="45"
      y1="68"
      x2="38"
      y2="50"
      stroke="#C07840"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <line
      x1="75"
      y1="68"
      x2="82"
      y2="50"
      stroke="#C07840"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <line
      x1="28"
      y1="48"
      x2="92"
      y2="48"
      stroke="#888"
      strokeWidth="4"
      strokeLinecap="round"
    />
    <circle cx="28" cy="48" r="7" fill="#666" />
    <circle cx="92" cy="48" r="7" fill="#666" />
    <Highlight cx={60} cy={65} r={14} color="#E8A8A0" />
    <Arrow x1={60} y1={60} x2={60} y2={38} color="#50E8A0" />
  </SV>
);

const BenchPressStep4 = () => (
  <SV label="Lockout arms at top, squeeze chest">
    <rect
      x="10"
      y="75"
      width="100"
      height="12"
      rx="4"
      fill="#2a2a2a"
      stroke="#444"
      strokeWidth="1"
    />
    <Head cx={95} cy={64} />
    <line
      x1="90"
      y1="68"
      x2="30"
      y2="68"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <line
      x1="44"
      y1="68"
      x2="40"
      y2="42"
      stroke="#C07840"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <line
      x1="76"
      y1="68"
      x2="80"
      y2="42"
      stroke="#C07840"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <line
      x1="30"
      y1="40"
      x2="90"
      y2="40"
      stroke="#888"
      strokeWidth="4"
      strokeLinecap="round"
    />
    <circle cx="30" cy="40" r="7" fill="#666" />
    <circle cx="90" cy="40" r="7" fill="#666" />
    <Highlight cx={60} cy={65} r={14} color="#E8A8A0" />
    <circle cx="60" cy="55" r="4" fill="#50E8A0" opacity="0.8" />
  </SV>
);

// ─── Squat Steps ──────────────────────────────────────────────────────────────
const SquatStep1 = () => (
  <SV label="Stand tall, bar on upper back">
    <Head />
    <Torso />
    <Shoulders />
    <Hips />
    {/* Bar across shoulders */}
    <line
      x1="22"
      y1="36"
      x2="98"
      y2="36"
      stroke="#888"
      strokeWidth="4"
      strokeLinecap="round"
    />
    <circle cx="22" cy="36" r="6" fill="#666" />
    <circle cx="98" cy="36" r="6" fill="#666" />
    {/* Legs */}
    <line
      x1="42"
      y1="70"
      x2="38"
      y2="110"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <line
      x1="78"
      y1="70"
      x2="82"
      y2="110"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <line
      x1="38"
      y1="110"
      x2="36"
      y2="128"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <line
      x1="82"
      y1="110"
      x2="84"
      y2="128"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <Arrow x1={60} y1={90} x2={60} y2={108} />
  </SV>
);

const SquatStep2 = () => (
  <SV label="Hinge hips back, bend knees outward">
    <Head cx={60} cy={26} />
    {/* Torso angled forward */}
    <line
      x1="60"
      y1="36"
      x2="55"
      y2="65"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <line
      x1="38"
      y1="42"
      x2="80"
      y2="42"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    {/* Hips */}
    <line
      x1="40"
      y1="65"
      x2="70"
      y2="65"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    {/* Thighs angled out */}
    <line
      x1="40"
      y1="65"
      x2="28"
      y2="100"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <line
      x1="70"
      y1="65"
      x2="82"
      y2="100"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    {/* Shins angled */}
    <line
      x1="28"
      y1="100"
      x2="32"
      y2="125"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <line
      x1="82"
      y1="100"
      x2="78"
      y2="125"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <Highlight cx={55} cy={65} r={15} color="#A8C8E8" />
    <Arrow x1={55} y1={55} x2={50} y2={70} />
  </SV>
);

const SquatStep3 = () => (
  <SV label="Descend until thighs parallel to floor">
    <Head cx={60} cy={35} />
    {/* Torso more forward */}
    <line
      x1="60"
      y1="45"
      x2="52"
      y2="74"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <line
      x1="36"
      y1="52"
      x2="78"
      y2="52"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <line
      x1="36"
      y1="74"
      x2="68"
      y2="74"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    {/* Thighs nearly horizontal */}
    <line
      x1="36"
      y1="74"
      x2="20"
      y2="96"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <line
      x1="68"
      y1="74"
      x2="84"
      y2="96"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <line
      x1="20"
      y1="96"
      x2="24"
      y2="124"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <line
      x1="84"
      y1="96"
      x2="80"
      y2="124"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <Highlight cx={52} cy={74} r={16} color="#A8C8E8" />
    <Highlight cx={52} cy={96} r={12} color="#A8D0A0" />
  </SV>
);

const SquatStep4 = () => (
  <SV label="Drive through heels, stand up explosively">
    <Head />
    <Torso y2={68} />
    <Shoulders />
    <Hips />
    <line
      x1="42"
      y1="70"
      x2="36"
      y2="108"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <line
      x1="78"
      y1="70"
      x2="84"
      y2="108"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <line
      x1="36"
      y1="108"
      x2="34"
      y2="128"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <line
      x1="84"
      y1="108"
      x2="86"
      y2="128"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <Highlight cx={60} cy={70} r={16} color="#A8C8E8" />
    <Arrow x1={60} y1={95} x2={60} y2={72} color="#50E8A0" />
  </SV>
);

// ─── Pull-Up Steps ────────────────────────────────────────────────────────────
const PullUpStep1 = () => (
  <SV label="Hang from bar with overhand grip, arms extended">
    {/* Bar */}
    <line
      x1="15"
      y1="12"
      x2="105"
      y2="12"
      stroke="#888"
      strokeWidth="5"
      strokeLinecap="round"
    />
    {/* Arms extended up */}
    <line
      x1="45"
      y1="12"
      x2="52"
      y2="36"
      stroke="#C07840"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <line
      x1="75"
      y1="12"
      x2="68"
      y2="36"
      stroke="#C07840"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <Head cx={60} cy={46} />
    <Torso x1={60} y1={56} x2={60} y2={96} />
    <Shoulders cx={60} y={66} w={20} />
    <Hips cx={60} y={96} w={12} />
    <line
      x1="48"
      y1="96"
      x2="44"
      y2="122"
      stroke="#C07840"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <line
      x1="72"
      y1="96"
      x2="76"
      y2="122"
      stroke="#C07840"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <Arrow x1={60} y1={90} x2={60} y2={72} />
  </SV>
);

const PullUpStep2 = () => (
  <SV label="Depress shoulders, engage lats">
    <line
      x1="15"
      y1="12"
      x2="105"
      y2="12"
      stroke="#888"
      strokeWidth="5"
      strokeLinecap="round"
    />
    <line
      x1="45"
      y1="12"
      x2="50"
      y2="34"
      stroke="#C07840"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <line
      x1="75"
      y1="12"
      x2="70"
      y2="34"
      stroke="#C07840"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <Head cx={60} cy={44} />
    <Torso x1={60} y1={54} x2={60} y2={92} />
    <Shoulders cx={60} y={60} w={24} />
    <Hips cx={60} y={92} w={12} />
    <line
      x1="48"
      y1="92"
      x2="44"
      y2="118"
      stroke="#C07840"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <line
      x1="72"
      y1="92"
      x2="76"
      y2="118"
      stroke="#C07840"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <Highlight cx={60} cy={68} r={20} color="#D8B8E8" />
  </SV>
);

const PullUpStep3 = () => (
  <SV label="Pull chin above bar, elbows drive down">
    <line
      x1="15"
      y1="12"
      x2="105"
      y2="12"
      stroke="#888"
      strokeWidth="5"
      strokeLinecap="round"
    />
    <line
      x1="40"
      y1="12"
      x2="36"
      y2="36"
      stroke="#C07840"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <line
      x1="80"
      y1="12"
      x2="84"
      y2="36"
      stroke="#C07840"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <Shoulders cx={60} y={36} w={26} />
    <Head cx={60} cy={20} />
    <Torso x1={60} y1={30} x2={60} y2={72} />
    <Hips cx={60} y={72} w={14} />
    <line
      x1="46"
      y1="72"
      x2="42"
      y2="100"
      stroke="#C07840"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <line
      x1="74"
      y1="72"
      x2="78"
      y2="100"
      stroke="#C07840"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <Highlight cx={60} cy={50} r={18} color="#D8B8E8" />
    <Arrow x1={36} y1={40} x2={36} y2={54} />
    <Arrow x1={84} y1={40} x2={84} y2={54} />
  </SV>
);

// ─── Shoulder Press Steps ─────────────────────────────────────────────────────
const ShoulderPressStep1 = () => (
  <SV label="Sit upright, dumbbells at shoulder height">
    <Head />
    <Torso />
    <Shoulders />
    <Hips />
    {/* Seated — legs horizontal */}
    <line
      x1="42"
      y1="70"
      x2="20"
      y2="72"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <line
      x1="78"
      y1="70"
      x2="100"
      y2="72"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    {/* Arms at shoulder level, elbows bent */}
    <line
      x1="32"
      y1="38"
      x2="22"
      y2="55"
      stroke="#C07840"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <line
      x1="88"
      y1="38"
      x2="98"
      y2="55"
      stroke="#C07840"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    {/* Dumbbells */}
    <rect x="14" y="52" width="12" height="6" rx="2" fill="#666" />
    <rect x="95" y="52" width="12" height="6" rx="2" fill="#666" />
    <Highlight cx={60} cy={38} r={22} color="#D8B8E8" />
    <Arrow x1={60} y1={45} x2={60} y2={28} />
  </SV>
);

const ShoulderPressStep2 = () => (
  <SV label="Press dumbbells overhead, arms fully extended">
    <Head />
    <Torso />
    <Shoulders />
    <Hips />
    <line
      x1="42"
      y1="70"
      x2="20"
      y2="72"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <line
      x1="78"
      y1="70"
      x2="100"
      y2="72"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    {/* Arms fully extended up */}
    <line
      x1="32"
      y1="38"
      x2="26"
      y2="14"
      stroke="#C07840"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <line
      x1="88"
      y1="38"
      x2="94"
      y2="14"
      stroke="#C07840"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <rect x="18" y="8" width="12" height="6" rx="2" fill="#666" />
    <rect x="91" y="8" width="12" height="6" rx="2" fill="#666" />
    <Highlight cx={60} cy={36} r={20} color="#D8B8E8" />
    <Arrow x1={60} y1={40} x2={60} y2={22} color="#50E8A0" />
  </SV>
);

// ─── Bicep Curl Steps ─────────────────────────────────────────────────────────
const BicepCurlStep1 = () => (
  <SV label="Stand with dumbbells at sides, palms forward">
    <Head />
    <Torso />
    <Shoulders />
    <Hips />
    <line
      x1="42"
      y1="70"
      x2="38"
      y2="110"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <line
      x1="78"
      y1="70"
      x2="82"
      y2="110"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <line
      x1="38"
      y1="110"
      x2="36"
      y2="128"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <line
      x1="82"
      y1="110"
      x2="84"
      y2="128"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    {/* Arms down */}
    <line
      x1="32"
      y1="38"
      x2="28"
      y2="68"
      stroke="#C07840"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <line
      x1="88"
      y1="38"
      x2="92"
      y2="68"
      stroke="#C07840"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <rect x="20" y="66" width="10" height="6" rx="2" fill="#666" />
    <rect x="90" y="66" width="10" height="6" rx="2" fill="#666" />
    <Arrow x1={28} y1={68} x2={28} y2={50} />
  </SV>
);

const BicepCurlStep2 = () => (
  <SV label="Curl weight up, squeeze bicep at top">
    <Head />
    <Torso />
    <Shoulders />
    <Hips />
    <line
      x1="42"
      y1="70"
      x2="38"
      y2="110"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <line
      x1="78"
      y1="70"
      x2="82"
      y2="110"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <line
      x1="38"
      y1="110"
      x2="36"
      y2="128"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <line
      x1="82"
      y1="110"
      x2="84"
      y2="128"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    {/* Left arm curled */}
    <line
      x1="32"
      y1="38"
      x2="22"
      y2="52"
      stroke="#C07840"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <line
      x1="22"
      y1="52"
      x2="18"
      y2="34"
      stroke="#C07840"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <rect x="10" y="28" width="10" height="6" rx="2" fill="#666" />
    {/* Right arm curled */}
    <line
      x1="88"
      y1="38"
      x2="98"
      y2="52"
      stroke="#C07840"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <line
      x1="98"
      y1="52"
      x2="102"
      y2="34"
      stroke="#C07840"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <rect x="100" y="28" width="10" height="6" rx="2" fill="#666" />
    <Highlight cx={22} cy={44} r={12} color="#B8E8C8" />
    <Highlight cx={98} cy={44} r={12} color="#B8E8C8" />
  </SV>
);

// ─── Plank Steps ──────────────────────────────────────────────────────────────
const PlankStep1 = () => (
  <SV label="Get into push-up position on forearms">
    <Head cx={95} cy={38} />
    <line
      x1="88"
      y1="48"
      x2="20"
      y2="60"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    {/* Forearms on ground */}
    <line
      x1="76"
      y1="54"
      x2="88"
      y2="70"
      stroke="#C07840"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <line
      x1="44"
      y1="62"
      x2="32"
      y2="72"
      stroke="#C07840"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    {/* Legs */}
    <line
      x1="20"
      y1="60"
      x2="16"
      y2="90"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <line
      x1="28"
      y1="58"
      x2="24"
      y2="88"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    {/* Floor */}
    <line x1="8" y1="92" x2="112" y2="92" stroke="#333" strokeWidth="2" />
    <Highlight cx={52} cy={57} r={20} color="#E8C098" />
    <Arrow x1={52} y1={70} x2={52} y2={52} />
  </SV>
);

const PlankStep2 = () => (
  <SV label="Body in straight line from head to heels">
    <Head cx={96} cy={36} />
    <line
      x1="90"
      y1="46"
      x2="16"
      y2="55"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <line
      x1="78"
      y1="52"
      x2="90"
      y2="68"
      stroke="#C07840"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <line
      x1="42"
      y1="58"
      x2="30"
      y2="70"
      stroke="#C07840"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <line
      x1="16"
      y1="55"
      x2="10"
      y2="82"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <line
      x1="22"
      y1="54"
      x2="16"
      y2="81"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <line x1="8" y1="84" x2="112" y2="84" stroke="#333" strokeWidth="2" />
    {/* Alignment line */}
    <line
      x1="14"
      y1="80"
      x2="96"
      y2="36"
      stroke="#50E8A0"
      strokeWidth="1.5"
      strokeDasharray="5 3"
      opacity="0.7"
    />
    <Highlight cx={53} cy={54} r={22} color="#E8C098" />
  </SV>
);

// ─── Hip Thrust Steps ─────────────────────────────────────────────────────────
const HipThrustStep1 = () => (
  <SV label="Upper back on bench, feet flat, bar on hips">
    {/* Bench */}
    <rect
      x="55"
      y="48"
      width="55"
      height="14"
      rx="4"
      fill="#2a2a2a"
      stroke="#444"
      strokeWidth="1"
    />
    {/* Body reclined */}
    <Head cx={100} cy={42} />
    <line
      x1="96"
      y1="50"
      x2="45"
      y2="72"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    {/* Hips low */}
    <line
      x1="38"
      y1="72"
      x2="52"
      y2="72"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    {/* Thighs angled */}
    <line
      x1="38"
      y1="72"
      x2="30"
      y2="96"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <line
      x1="52"
      y1="72"
      x2="62"
      y2="96"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <line
      x1="30"
      y1="96"
      x2="28"
      y2="115"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <line
      x1="62"
      y1="96"
      x2="64"
      y2="115"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    {/* Bar */}
    <line
      x1="18"
      y1="70"
      x2="72"
      y2="70"
      stroke="#888"
      strokeWidth="4"
      strokeLinecap="round"
    />
    <circle cx="18" cy="70" r="6" fill="#666" />
    <circle cx="72" cy="70" r="6" fill="#666" />
    <Arrow x1={45} y1={70} x2={45} y2={52} />
  </SV>
);

const HipThrustStep2 = () => (
  <SV label="Drive hips up, squeeze glutes at top">
    <rect
      x="55"
      y="48"
      width="55"
      height="14"
      rx="4"
      fill="#2a2a2a"
      stroke="#444"
      strokeWidth="1"
    />
    <Head cx={100} cy={42} />
    <line
      x1="96"
      y1="50"
      x2="42"
      y2="57"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    {/* Hips elevated */}
    <line
      x1="35"
      y1="57"
      x2="49"
      y2="57"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <line
      x1="35"
      y1="57"
      x2="26"
      y2="88"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <line
      x1="49"
      y1="57"
      x2="60"
      y2="86"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <line
      x1="26"
      y1="88"
      x2="24"
      y2="115"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <line
      x1="60"
      y1="86"
      x2="62"
      y2="115"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <line
      x1="16"
      y1="55"
      x2="70"
      y2="55"
      stroke="#888"
      strokeWidth="4"
      strokeLinecap="round"
    />
    <circle cx="16" cy="55" r="6" fill="#666" />
    <circle cx="70" cy="55" r="6" fill="#666" />
    <Highlight cx={42} cy={60} r={16} color="#D8E8B8" />
    <Arrow x1={42} y1={74} x2={42} y2={56} color="#50E8A0" />
  </SV>
);

// ─── Deadlift Steps ───────────────────────────────────────────────────────────
const DeadliftStep1 = () => (
  <SV label="Stand over bar, hips hinged, grip just outside legs">
    <Head cx={60} cy={32} />
    <line
      x1="60"
      y1="42"
      x2="52"
      y2="66"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <Shoulders cx={60} y={50} w={22} />
    {/* Hips back */}
    <line
      x1="40"
      y1="66"
      x2="66"
      y2="66"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <line
      x1="40"
      y1="66"
      x2="30"
      y2="100"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <line
      x1="66"
      y1="66"
      x2="72"
      y2="100"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <line
      x1="30"
      y1="100"
      x2="28"
      y2="124"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <line
      x1="72"
      y1="100"
      x2="74"
      y2="124"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    {/* Bar on floor */}
    <line
      x1="10"
      y1="124"
      x2="110"
      y2="124"
      stroke="#888"
      strokeWidth="4"
      strokeLinecap="round"
    />
    <circle cx="10" cy="124" r="7" fill="#666" />
    <circle cx="110" cy="124" r="7" fill="#666" />
    {/* Arms gripping bar */}
    <line
      x1="38"
      y1="50"
      x2="28"
      y2="124"
      stroke="#C07840"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <line
      x1="82"
      y1="50"
      x2="74"
      y2="124"
      stroke="#C07840"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <Highlight cx={52} cy={62} r={18} color="#D8E8B8" />
  </SV>
);

const DeadliftStep2 = () => (
  <SV label="Push floor away, keep bar close, chest up">
    <Head cx={60} cy={22} />
    <line
      x1="60"
      y1="32"
      x2="54"
      y2="64"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <Shoulders cx={60} y={40} w={24} />
    <line
      x1="42"
      y1="64"
      x2="66"
      y2="64"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <line
      x1="42"
      y1="64"
      x2="36"
      y2="100"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <line
      x1="66"
      y1="64"
      x2="68"
      y2="100"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <line
      x1="36"
      y1="100"
      x2="34"
      y2="122"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <line
      x1="68"
      y1="100"
      x2="70"
      y2="122"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <line
      x1="10"
      y1="118"
      x2="110"
      y2="118"
      stroke="#888"
      strokeWidth="4"
      strokeLinecap="round"
    />
    <circle cx="10" cy="118" r="7" fill="#666" />
    <circle cx="110" cy="118" r="7" fill="#666" />
    <line
      x1="38"
      y1="40"
      x2="34"
      y2="118"
      stroke="#C07840"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <line
      x1="82"
      y1="40"
      x2="70"
      y2="118"
      stroke="#C07840"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <Highlight cx={52} cy={62} r={18} color="#D8E8B8" />
    <Arrow x1={52} y1={80} x2={52} y2={55} color="#50E8A0" />
  </SV>
);

const DeadliftStep3 = () => (
  <SV label="Stand tall, lockout hips and knees">
    <Head />
    <Torso />
    <Shoulders />
    <Hips />
    <line
      x1="42"
      y1="70"
      x2="38"
      y2="110"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <line
      x1="78"
      y1="70"
      x2="82"
      y2="110"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <line
      x1="38"
      y1="110"
      x2="36"
      y2="128"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <line
      x1="82"
      y1="110"
      x2="84"
      y2="128"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <line
      x1="32"
      y1="38"
      x2="32"
      y2="68"
      stroke="#C07840"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <line
      x1="88"
      y1="38"
      x2="88"
      y2="68"
      stroke="#C07840"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <line
      x1="10"
      y1="68"
      x2="110"
      y2="68"
      stroke="#888"
      strokeWidth="4"
      strokeLinecap="round"
    />
    <circle cx="10" cy="68" r="7" fill="#666" />
    <circle cx="110" cy="68" r="7" fill="#666" />
    <Highlight cx={60} cy={50} r={22} color="#D8E8B8" />
    <circle cx="60" cy="50" r="5" fill="#50E8A0" opacity="0.8" />
  </SV>
);

// ─── Lateral Raise Step ───────────────────────────────────────────────────────
const LateralRaiseStep1 = () => (
  <SV label="Stand with dumbbells at sides">
    <Head />
    <Torso />
    <Shoulders />
    <Hips />
    <line
      x1="42"
      y1="70"
      x2="38"
      y2="110"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <line
      x1="78"
      y1="70"
      x2="82"
      y2="110"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <line
      x1="38"
      y1="110"
      x2="36"
      y2="128"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <line
      x1="82"
      y1="110"
      x2="84"
      y2="128"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <line
      x1="32"
      y1="38"
      x2="24"
      y2="62"
      stroke="#C07840"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <line
      x1="88"
      y1="38"
      x2="96"
      y2="62"
      stroke="#C07840"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <rect x="16" y="60" width="10" height="5" rx="2" fill="#666" />
    <rect x="94" y="60" width="10" height="5" rx="2" fill="#666" />
    <Arrow x1={22} y1={62} x2={14} y2={46} />
    <Arrow x1={98} y1={62} x2={106} y2={46} />
  </SV>
);

const LateralRaiseStep2 = () => (
  <SV label="Raise arms to shoulder height, slight elbow bend">
    <Head />
    <Torso />
    <Shoulders />
    <Hips />
    <line
      x1="42"
      y1="70"
      x2="38"
      y2="110"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <line
      x1="78"
      y1="70"
      x2="82"
      y2="110"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <line
      x1="38"
      y1="110"
      x2="36"
      y2="128"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <line
      x1="82"
      y1="110"
      x2="84"
      y2="128"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    {/* Arms raised to sides */}
    <line
      x1="32"
      y1="38"
      x2="10"
      y2="40"
      stroke="#C07840"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <line
      x1="88"
      y1="38"
      x2="110"
      y2="40"
      stroke="#C07840"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <rect x="2" y="37" width="10" height="5" rx="2" fill="#666" />
    <rect x="108" y="37" width="10" height="5" rx="2" fill="#666" />
    <Highlight cx={60} cy={38} r={28} color="#D8B8E8" />
    <Arrow x1={22} y1={56} x2={10} y2={42} color="#50E8A0" />
    <Arrow x1={98} y1={56} x2={110} y2={42} color="#50E8A0" />
  </SV>
);

// ─── Tricep Pushdown Steps ────────────────────────────────────────────────────
const TricepPushStep1 = () => (
  <SV label="Stand at cable machine, elbows at sides">
    <Head />
    <Torso />
    <Shoulders />
    <Hips />
    <line
      x1="42"
      y1="70"
      x2="38"
      y2="105"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <line
      x1="78"
      y1="70"
      x2="82"
      y2="105"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <line
      x1="38"
      y1="105"
      x2="36"
      y2="124"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <line
      x1="82"
      y1="105"
      x2="84"
      y2="124"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    {/* Arms elbows tucked */}
    <line
      x1="32"
      y1="38"
      x2="26"
      y2="56"
      stroke="#C07840"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <line
      x1="88"
      y1="38"
      x2="94"
      y2="56"
      stroke="#C07840"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <line
      x1="26"
      y1="56"
      x2="22"
      y2="70"
      stroke="#C07840"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <line
      x1="94"
      y1="56"
      x2="98"
      y2="70"
      stroke="#C07840"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    {/* Cable rope */}
    <line
      x1="60"
      y1="8"
      x2="60"
      y2="38"
      stroke="#888"
      strokeWidth="2"
      strokeDasharray="4 2"
    />
    <Arrow x1={24} y1={56} x2={22} y2={70} />
    <Arrow x1={96} y1={56} x2={98} y2={70} />
  </SV>
);

const TricepPushStep2 = () => (
  <SV label="Push bar down until arms fully extended">
    <Head />
    <Torso />
    <Shoulders />
    <Hips />
    <line
      x1="42"
      y1="70"
      x2="38"
      y2="105"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <line
      x1="78"
      y1="70"
      x2="82"
      y2="105"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <line
      x1="38"
      y1="105"
      x2="36"
      y2="124"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <line
      x1="82"
      y1="105"
      x2="84"
      y2="124"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    {/* Arms extended down */}
    <line
      x1="32"
      y1="38"
      x2="24"
      y2="54"
      stroke="#C07840"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <line
      x1="88"
      y1="38"
      x2="96"
      y2="54"
      stroke="#C07840"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <line
      x1="24"
      y1="54"
      x2="20"
      y2="86"
      stroke="#C07840"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <line
      x1="96"
      y1="54"
      x2="100"
      y2="86"
      stroke="#C07840"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <line
      x1="60"
      y1="8"
      x2="60"
      y2="38"
      stroke="#888"
      strokeWidth="2"
      strokeDasharray="4 2"
    />
    <Highlight cx={24} cy={70} r={12} color="#B8E8C8" />
    <Highlight cx={96} cy={70} r={12} color="#B8E8C8" />
    <Arrow x1={22} y1={60} x2={20} y2={82} color="#50E8A0" />
  </SV>
);

// ─── Calf Raise Steps ─────────────────────────────────────────────────────────
const CalfRaiseStep1 = () => (
  <SV label="Stand on edge of step, heels hanging off">
    {/* Step edge */}
    <rect
      x="20"
      y="100"
      width="80"
      height="14"
      rx="3"
      fill="#2a2a2a"
      stroke="#444"
      strokeWidth="1"
    />
    <Head />
    <Torso />
    <Shoulders />
    <Hips />
    <line
      x1="42"
      y1="70"
      x2="40"
      y2="100"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <line
      x1="78"
      y1="70"
      x2="80"
      y2="100"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    {/* Shins */}
    <line
      x1="40"
      y1="100"
      x2="38"
      y2="114"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <line
      x1="80"
      y1="100"
      x2="82"
      y2="114"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <Arrow x1={60} y1={110} x2={60} y2={96} />
  </SV>
);

const CalfRaiseStep2 = () => (
  <SV label="Rise onto toes as high as possible, hold 1 second">
    <rect
      x="20"
      y="100"
      width="80"
      height="14"
      rx="3"
      fill="#2a2a2a"
      stroke="#444"
      strokeWidth="1"
    />
    <Head cx={60} cy={10} />
    <line
      x1="60"
      y1="20"
      x2="60"
      y2="64"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <Shoulders cx={60} y={32} />
    <Hips cx={60} y={64} w={18} />
    <line
      x1="42"
      y1="64"
      x2="40"
      y2="96"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <line
      x1="78"
      y1="64"
      x2="80"
      y2="96"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    {/* On tiptoes */}
    <line
      x1="40"
      y1="96"
      x2="42"
      y2="108"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <line
      x1="80"
      y1="96"
      x2="78"
      y2="108"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <Highlight cx={41} cy={102} r={10} color="#A8C8E8" />
    <Highlight cx={79} cy={102} r={10} color="#A8C8E8" />
    <Arrow x1={60} y1={90} x2={60} y2={72} color="#50E8A0" />
  </SV>
);

// ─── Stretch SVGs ─────────────────────────────────────────────────────────────
const ChestStretchSVG = () => (
  <SV label="Chest doorway stretch">
    {/* Door frame line */}
    <line x1="20" y1="10" x2="20" y2="120" stroke="#444" strokeWidth="3" />
    <Head cx={60} cy={30} />
    <Torso x1={60} y1={40} x2={60} y2={80} />
    <Shoulders cx={60} y={52} w={30} />
    {/* Left arm against wall */}
    <line
      x1="30"
      y1="52"
      x2="20"
      y2="52"
      stroke="#C07840"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <line
      x1="20"
      y1="52"
      x2="20"
      y2="70"
      stroke="#C07840"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <Hips cx={60} y={80} w={16} />
    <line
      x1="44"
      y1="80"
      x2="42"
      y2="112"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <line
      x1="76"
      y1="80"
      x2="78"
      y2="112"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <Highlight cx={40} cy={58} r={16} color="#E8A8A0" />
    <Arrow x1={60} y1={55} x2={74} y2={55} />
  </SV>
);

const HamStretchSVG = () => (
  <SV label="Seated hamstring stretch">
    {/* Floor */}
    <line x1="8" y1="104" x2="112" y2="104" stroke="#333" strokeWidth="2" />
    <Head cx={28} cy={42} />
    {/* Torso leaning forward */}
    <line
      x1="28"
      y1="52"
      x2="55"
      y2="90"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <line
      x1="14"
      y1="62"
      x2="52"
      y2="68"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    {/* Hips on floor */}
    <line
      x1="44"
      y1="90"
      x2="90"
      y2="88"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    {/* Extended leg */}
    <line
      x1="90"
      y1="88"
      x2="108"
      y2="90"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <line
      x1="108"
      y1="90"
      x2="108"
      y2="104"
      stroke="#C07840"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    {/* Bent leg */}
    <line
      x1="44"
      y1="90"
      x2="40"
      y2="104"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <Highlight cx={90} cy={88} r={22} color="#A8C8E8" />
    <Arrow x1={52} y1={72} x2={65} y2={88} />
  </SV>
);

const QuadStretchSVG = () => (
  <SV label="Standing quad stretch">
    <Head />
    <Torso />
    <Shoulders />
    <Hips />
    {/* Standing leg */}
    <line
      x1="55"
      y1="70"
      x2="52"
      y2="110"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <line
      x1="52"
      y1="110"
      x2="50"
      y2="128"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    {/* Bent leg pulled back */}
    <line
      x1="65"
      y1="70"
      x2="72"
      y2="96"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <line
      x1="72"
      y1="96"
      x2="64"
      y2="80"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    {/* Hand holding foot */}
    <line
      x1="88"
      y1="38"
      x2="80"
      y2="62"
      stroke="#C07840"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <line
      x1="80"
      y1="62"
      x2="72"
      y2="76"
      stroke="#C07840"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <Highlight cx={68} cy={86} r={18} color="#A8C8E8" />
    <Arrow x1={72} y1={86} x2={64} y2={72} />
  </SV>
);

// ─── Foam Roll SVG ────────────────────────────────────────────────────────────
const FoamRollSVG = ({ region }: { region: string }) => (
  <SV label={`Foam rolling ${region}`}>
    {/* Foam roller */}
    <ellipse
      cx="60"
      cy="108"
      rx="44"
      ry="10"
      fill="#444"
      stroke="#666"
      strokeWidth="1.5"
    />
    {/* Body on roller */}
    <Head cx={98} cy={68} />
    <line
      x1="92"
      y1="78"
      x2="22"
      y2="94"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <line
      x1="72"
      y1="86"
      x2="68"
      y2="98"
      stroke="#C07840"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <line
      x1="44"
      y1="92"
      x2="38"
      y2="100"
      stroke="#C07840"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <line
      x1="22"
      y1="94"
      x2="14"
      y2="112"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <line
      x1="28"
      y1="93"
      x2="20"
      y2="110"
      stroke="#C07840"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <Highlight cx={55} cy={90} r={20} color="#E8C098" />
    <Arrow x1={40} y1={95} x2={78} y2={90} color="#FF7A50" />
    <text x="60" y="130" textAnchor="middle" fill="#888" fontSize="9">
      {region}
    </text>
  </SV>
);

// ─── Data ─────────────────────────────────────────────────────────────────────
const MUSCLE_GUIDE_GROUPS: MuscleGuideGroup[] = [
  {
    id: "chest",
    label: "Chest",
    color: "#E8A8A0",
    bgColor: "rgba(232,168,160,0.12)",
    exercises: [
      {
        name: "Barbell Bench Press",
        difficulty: "Intermediate",
        targets: ["Pectoralis Major", "Anterior Deltoid", "Triceps"],
        sets: "4",
        reps: "6–10",
        rest: "90–120 sec",
        steps: [
          {
            instruction:
              "Lie flat on bench. Plant feet on floor. Grip bar slightly wider than shoulder width. Unrack bar and hold at chest level.",
            svg: <BenchPressStep1 />,
          },
          {
            instruction:
              "Slowly lower the bar to mid-chest, keeping elbows at 45–75° angle. Keep tension in pecs throughout.",
            svg: <BenchPressStep2 />,
          },
          {
            instruction:
              "Drive the bar upward explosively while maintaining contact with the bench. Exhale during push phase.",
            svg: <BenchPressStep3 />,
          },
          {
            instruction:
              "Fully extend arms at the top without locking elbows. Squeeze chest muscles hard for 1 second, then repeat.",
            svg: <BenchPressStep4 />,
          },
        ],
      },
      {
        name: "Push-Up",
        difficulty: "Beginner",
        targets: ["Pectoralis Major", "Serratus Anterior", "Triceps"],
        sets: "3",
        reps: "12–20",
        rest: "60 sec",
        steps: [
          {
            instruction:
              "Place hands slightly wider than shoulder width on floor. Arms fully extended, body in plank position — straight line from head to heels.",
            svg: <PlankStep2 />,
          },
          {
            instruction:
              "Lower chest toward floor, elbows track at 45°. Keep core tight and don't let hips sag.",
            svg: <PlankStep1 />,
          },
          {
            instruction:
              "Push through palms to return to start. Protract shoulder blades at top for serratus activation.",
            svg: <BenchPressStep3 />,
          },
        ],
      },
    ],
  },
  {
    id: "back",
    label: "Back",
    color: "#B8DCA8",
    bgColor: "rgba(184,220,168,0.12)",
    exercises: [
      {
        name: "Pull-Up",
        difficulty: "Intermediate",
        targets: ["Latissimus Dorsi", "Biceps Brachii", "Rhomboids"],
        sets: "4",
        reps: "5–10",
        rest: "90 sec",
        steps: [
          {
            instruction:
              "Grip bar slightly wider than shoulder width, overhand grip (palms facing away). Let your body hang fully with arms extended.",
            svg: <PullUpStep1 />,
          },
          {
            instruction:
              "Depress your shoulder blades downward before pulling. This pre-activates your lats and protects the shoulder joint.",
            svg: <PullUpStep2 />,
          },
          {
            instruction:
              "Pull your chin above the bar by driving elbows straight down toward your hips. Think 'put elbows in your back pockets'.",
            svg: <PullUpStep3 />,
          },
        ],
      },
      {
        name: "Deadlift",
        difficulty: "Advanced",
        targets: ["Erector Spinae", "Hamstrings", "Glutes", "Trapezius"],
        sets: "3",
        reps: "4–6",
        rest: "3 min",
        steps: [
          {
            instruction:
              "Stand with mid-foot under bar. Hinge hips back and grip bar just outside legs. Keep back neutral, chest tall, lats braced.",
            svg: <DeadliftStep1 />,
          },
          {
            instruction:
              "Take a deep breath, brace core hard. Initiate lift by pushing the floor away — think leg press, not pulling. Keep bar dragging against shins.",
            svg: <DeadliftStep2 />,
          },
          {
            instruction:
              "Drive hips forward to lockout. Stand tall with knees and hips fully extended. Squeeze glutes at the top. Reverse motion with control.",
            svg: <DeadliftStep3 />,
          },
        ],
      },
    ],
  },
  {
    id: "shoulders",
    label: "Shoulders",
    color: "#D8B8E8",
    bgColor: "rgba(216,184,232,0.12)",
    exercises: [
      {
        name: "Dumbbell Shoulder Press",
        difficulty: "Beginner",
        targets: [
          "Anterior Deltoid",
          "Medial Deltoid",
          "Triceps",
          "Rotator Cuff",
        ],
        sets: "4",
        reps: "10–12",
        rest: "75 sec",
        steps: [
          {
            instruction:
              "Sit upright on bench with back support. Hold dumbbells at shoulder height with elbows at 90°, palms facing forward.",
            svg: <ShoulderPressStep1 />,
          },
          {
            instruction:
              "Press dumbbells overhead in a slight arc, bringing them together above your head. Keep core braced to prevent lower back arching.",
            svg: <ShoulderPressStep2 />,
          },
        ],
      },
      {
        name: "Lateral Raise",
        difficulty: "Beginner",
        targets: ["Medial Deltoid", "Supraspinatus"],
        sets: "3",
        reps: "15–20",
        rest: "45 sec",
        steps: [
          {
            instruction:
              "Stand with dumbbells at sides. Slight bend in elbows throughout. Keep torso upright and still — no swinging.",
            svg: <LateralRaiseStep1 />,
          },
          {
            instruction:
              "Raise arms to shoulder height, leading with elbows slightly ahead of hands. Pause at top, slow return. Pour water from wrist angle.",
            svg: <LateralRaiseStep2 />,
          },
        ],
      },
    ],
  },
  {
    id: "arms",
    label: "Arms",
    color: "#A8D8C0",
    bgColor: "rgba(168,216,192,0.12)",
    exercises: [
      {
        name: "Dumbbell Bicep Curl",
        difficulty: "Beginner",
        targets: ["Biceps Brachii", "Brachialis", "Brachioradialis"],
        sets: "3",
        reps: "10–15",
        rest: "60 sec",
        steps: [
          {
            instruction:
              "Stand tall with dumbbells at sides, palms facing forward (supinated grip). Keep elbows pinned against your sides — they must not swing.",
            svg: <BicepCurlStep1 />,
          },
          {
            instruction:
              "Curl both dumbbells simultaneously, twisting palms up at the top. Squeeze bicep hard at peak contraction. Lower with control over 3 seconds.",
            svg: <BicepCurlStep2 />,
          },
        ],
      },
      {
        name: "Cable Tricep Pushdown",
        difficulty: "Beginner",
        targets: ["Triceps Brachii (all 3 heads)"],
        sets: "3",
        reps: "12–15",
        rest: "60 sec",
        steps: [
          {
            instruction:
              "Stand at cable machine, overhand grip on bar. Keep elbows tucked against sides at 90°. Lean forward slightly from hips for stability.",
            svg: <TricepPushStep1 />,
          },
          {
            instruction:
              "Push bar down until arms fully extended. Lock wrists neutral. Squeeze tricep at lockout. Return slowly to starting position — don't let elbows flare.",
            svg: <TricepPushStep2 />,
          },
        ],
      },
    ],
  },
  {
    id: "core",
    label: "Core & Abs",
    color: "#E8C098",
    bgColor: "rgba(232,192,152,0.12)",
    exercises: [
      {
        name: "Forearm Plank",
        difficulty: "Beginner",
        targets: [
          "Transverse Abdominis",
          "Rectus Abdominis",
          "Obliques",
          "Erector Spinae",
        ],
        sets: "3",
        reps: "30–60 sec hold",
        rest: "45 sec",
        steps: [
          {
            instruction:
              "Forearms on floor, elbows under shoulders. Rise onto toes, keeping body in a straight line. Don't let hips pike up or sag down.",
            svg: <PlankStep1 />,
          },
          {
            instruction:
              "Squeeze everything — glutes, abs, thighs. Breathe normally. Focus on posterior pelvic tilt (tuck tailbone). Hold for time.",
            svg: <PlankStep2 />,
          },
        ],
      },
      {
        name: "Hanging Leg Raise",
        difficulty: "Intermediate",
        targets: ["Rectus Abdominis (lower)", "Iliopsoas", "Obliques"],
        sets: "3",
        reps: "10–15",
        rest: "60 sec",
        steps: [
          {
            instruction:
              "Hang from pull-up bar with overhand grip. Arms fully extended, shoulders depressed. Legs together, core braced.",
            svg: <PullUpStep1 />,
          },
          {
            instruction:
              "Raise legs to 90° by curling pelvis under — not just swinging legs. Tilt your pelvis backward to engage lower abs. Lower with control.",
            svg: <PullUpStep3 />,
          },
        ],
      },
    ],
  },
  {
    id: "glutes",
    label: "Glutes",
    color: "#C8E0A8",
    bgColor: "rgba(200,224,168,0.12)",
    exercises: [
      {
        name: "Barbell Hip Thrust",
        difficulty: "Intermediate",
        targets: ["Gluteus Maximus", "Hamstrings", "Gluteus Medius"],
        sets: "4",
        reps: "8–12",
        rest: "90 sec",
        steps: [
          {
            instruction:
              "Sit against bench with upper back resting on its edge. Bar across hip crease, padded. Feet flat at hip width, toes slightly out.",
            svg: <HipThrustStep1 />,
          },
          {
            instruction:
              "Drive hips upward by squeezing glutes hard. Push through heels. Upper body stays parallel to floor at top. Hold 2 seconds and squeeze.",
            svg: <HipThrustStep2 />,
          },
        ],
      },
      {
        name: "Bulgarian Split Squat",
        difficulty: "Intermediate",
        targets: ["Gluteus Maximus", "Quadriceps", "Hip Flexors"],
        sets: "3",
        reps: "8–10 per side",
        rest: "90 sec",
        steps: [
          {
            instruction:
              "Stand 2 feet in front of a bench. Place rear foot on bench, laces down. Front foot far enough that knee tracks over toes but not beyond.",
            svg: <SquatStep1 />,
          },
          {
            instruction:
              "Lower straight down by bending front knee. Let rear knee drop toward floor. Keep torso upright and front shin vertical.",
            svg: <SquatStep2 />,
          },
          {
            instruction:
              "Drive through front heel to return to start. Push glute of front leg hard at top. Complete all reps, then switch sides.",
            svg: <SquatStep4 />,
          },
        ],
      },
    ],
  },
  {
    id: "legs",
    label: "Legs",
    color: "#A8C8E8",
    bgColor: "rgba(168,200,232,0.12)",
    exercises: [
      {
        name: "Barbell Back Squat",
        difficulty: "Advanced",
        targets: ["Quadriceps", "Glutes", "Hamstrings", "Erector Spinae"],
        sets: "4",
        reps: "5–8",
        rest: "2–3 min",
        steps: [
          {
            instruction:
              "Set bar on upper traps, not on neck. Stand at hip width, toes slightly angled out (30°). Brace core and create full-body tension.",
            svg: <SquatStep1 />,
          },
          {
            instruction:
              "Push knees out in direction of toes as you hinge hips back. Descend with control — chest up, neutral spine.",
            svg: <SquatStep2 />,
          },
          {
            instruction:
              "Reach parallel (thighs at 90° to torso) or below. At the bottom, knees stay wide, heels planted, torso as upright as possible.",
            svg: <SquatStep3 />,
          },
          {
            instruction:
              "Drive through full foot, elbows forward, hips and shoulders rise together. Stand fully, engage glutes at top.",
            svg: <SquatStep4 />,
          },
        ],
      },
      {
        name: "Standing Calf Raise",
        difficulty: "Beginner",
        targets: ["Gastrocnemius", "Soleus"],
        sets: "4",
        reps: "15–25",
        rest: "45 sec",
        steps: [
          {
            instruction:
              "Stand on edge of step or elevated surface. Hold for balance. Let heels drop below step level to get full stretch in calf.",
            svg: <CalfRaiseStep1 />,
          },
          {
            instruction:
              "Rise up on toes as high as possible. Pause for 2 seconds at peak. Lower slowly over 4 seconds for maximum stretch at bottom.",
            svg: <CalfRaiseStep2 />,
          },
        ],
      },
    ],
  },
  {
    id: "head_neck",
    label: "Head & Neck",
    color: "#C8C8D8",
    bgColor: "rgba(200,200,216,0.12)",
    exercises: [
      {
        name: "Neck Lateral Flexion Stretch",
        difficulty: "Beginner",
        targets: ["Sternocleidomastoid", "Scalenes", "Upper Trapezius"],
        sets: "2",
        reps: "30 sec per side",
        rest: "15 sec",
        steps: [
          {
            instruction:
              "Sit or stand tall. Gently tilt head toward right shoulder, bringing ear to shoulder. Use right hand for gentle overpressure. Breathe deeply.",
            svg: <LateralRaiseStep1 />,
          },
          {
            instruction:
              "Hold stretch 30 seconds, feeling pull on left side of neck. Slowly return to center and repeat on opposite side. Never force or bounce.",
            svg: <LateralRaiseStep2 />,
          },
        ],
      },
      {
        name: "Chin Tuck",
        difficulty: "Beginner",
        targets: ["Deep Cervical Flexors", "Sternocleidomastoid"],
        sets: "3",
        reps: "10–15 reps",
        rest: "30 sec",
        steps: [
          {
            instruction:
              "Sit with back against wall. Look straight ahead. Gently draw chin back (double chin motion) — not tilting head, just translating backward.",
            svg: <BicepCurlStep1 />,
          },
          {
            instruction:
              "Hold 5 seconds at maximum retraction. Feel stretch at base of skull and strengthening in deep neck flexors. Release slowly.",
            svg: <BicepCurlStep2 />,
          },
        ],
      },
    ],
  },
];

const DIFFICULTY_COLORS: Record<string, string> = {
  Beginner: "#50E8A0",
  Intermediate: "#E8C050",
  Advanced: "#E85050",
};

const NUTRITION_MACROS = [
  {
    macro: "Protein",
    amount: "1.6–2.2g",
    unit: "per kg BW",
    color: "#E8A8A0",
    icon: "🥩",
    note: "The #1 muscle-building nutrient. Aim for leucine-rich sources: chicken, eggs, Greek yogurt, whey protein.",
  },
  {
    macro: "Carbs",
    amount: "4–7g",
    unit: "per kg BW",
    color: "#E8D090",
    icon: "🍚",
    note: "Primary fuel for lifting. Eat higher-carb on training days. Oats, rice, sweet potato, fruit.",
  },
  {
    macro: "Fats",
    amount: "0.5–1.5g",
    unit: "per kg BW",
    color: "#B8D8A0",
    icon: "🥑",
    note: "Hormone production and joint health. Prioritize omega-3s: salmon, walnuts, olive oil, flaxseeds.",
  },
  {
    macro: "Water",
    amount: "3–4L",
    unit: "per day",
    color: "#A8C8E8",
    icon: "💧",
    note: "Performance drops 10% with just 2% dehydration. Add electrolytes post-workout for muscle cramps.",
  },
];

const TOP_FOODS = [
  { name: "Chicken Breast", protein: "31g / 100g", icon: "🍗" },
  { name: "Eggs (whole)", protein: "13g / 2 eggs", icon: "🥚" },
  { name: "Greek Yogurt", protein: "17g / 170g", icon: "🥛" },
  { name: "Salmon", protein: "25g / 100g", icon: "🐟" },
  { name: "Lean Beef", protein: "26g / 100g", icon: "🥩" },
  { name: "Cottage Cheese", protein: "25g / 220g", icon: "🧀" },
];

const RECOVERY_ITEMS = [
  {
    title: "Sleep 7–9 Hours",
    icon: "😴",
    description:
      "Growth Hormone is released in pulses during deep sleep — 60–70% of daily secretion happens during stage 3 sleep between 10pm–2am. Sleep debt destroys gains.",
    color: "#D8B8E8",
  },
  {
    title: "Foam Rolling",
    icon: "🔄",
    description:
      "Self-myofascial release breaks up adhesions and improves blood flow. Roll slowly — 1 inch per second. Pause and breathe on tender spots for 30–60 seconds. Do daily.",
    color: "#E8C098",
    svg: <FoamRollSVG region="IT Band / Quads" />,
  },
  {
    title: "Contrast Therapy",
    icon: "🌡️",
    description:
      "Alternate cold (10 min cold shower or ice bath at 10–15°C) and heat (15 min sauna at 80–100°C). The vascular pump flushes metabolic waste from muscles.",
    color: "#A8C8E8",
  },
  {
    title: "Active Recovery",
    icon: "🚶",
    description:
      "Light walking, swimming, or cycling at 50–60% max heart rate on rest days. Increases blood flow without causing additional muscle damage.",
    color: "#B8DCA8",
  },
];

const STATIC_STRETCHES = [
  {
    muscle: "Chest",
    duration: "30–60 sec",
    color: "#E8A8A0",
    svg: <ChestStretchSVG />,
  },
  {
    muscle: "Hamstrings",
    duration: "45–60 sec",
    color: "#A8C8E8",
    svg: <HamStretchSVG />,
  },
  {
    muscle: "Quadriceps",
    duration: "30–45 sec",
    color: "#A8C8E8",
    svg: <QuadStretchSVG />,
  },
];

const TRAINING_PRINCIPLES = [
  {
    title: "Progressive Overload",
    icon: "📈",
    color: "#E8A8A0",
    points: [
      "Add 2.5–5kg when you hit the top rep range (e.g., 3×12 → add weight)",
      "Volume overload: add 1 set per week over 4–6 weeks",
      "Track every session — what gets measured gets improved",
    ],
  },
  {
    title: "Training Frequency",
    icon: "📅",
    color: "#D8B8E8",
    points: [
      "Each muscle needs 10–20 sets per week for hypertrophy",
      "Train each group 2–3× per week for optimal protein synthesis",
      "Full body 3×/week or Upper/Lower 4×/week are evidence-based splits",
    ],
  },
  {
    title: "Mind-Muscle Connection",
    icon: "🧠",
    color: "#B8DCA8",
    points: [
      "Slow down the eccentric (lowering) phase to 3–4 seconds",
      "Use lighter weight to focus on the squeeze, not the weight",
      "Pre-activate with 15–20 rep isolation warmup before compounds",
    ],
  },
  {
    title: "Rep Ranges & Goals",
    icon: "🎯",
    color: "#E8C098",
    points: [
      "Strength: 1–5 reps at 85–100% 1RM — neural adaptations",
      "Hypertrophy: 6–15 reps at 65–85% 1RM — muscle size growth",
      "Endurance: 15–30 reps at 40–65% 1RM — capillary density",
    ],
  },
  {
    title: "Rest & Periodization",
    icon: "⏰",
    color: "#A8C8E8",
    points: [
      "Compound lifts: 2–4 min rest | Isolation: 45–90 sec",
      "Deload every 4–8 weeks: 50% volume at normal intensity",
      "Muscles grow during recovery — not in the gym",
    ],
  },
  {
    title: "Form Over Weight",
    icon: "🏗️",
    color: "#C8C8D8",
    points: [
      "Ego lifting leads to injury and compensatory movement patterns",
      "Use the heaviest load you can control through full ROM",
      "Film side-angle to check squat depth, hinge mechanics, spine position",
    ],
  },
];

// ─── ExerciseCard Component ───────────────────────────────────────────────────
function ExerciseCard({
  exercise,
  groupColor,
}: { exercise: Exercise; groupColor: string }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="rounded-2xl overflow-hidden border transition-all"
      style={{
        background: "#1c1c1c",
        borderColor: expanded ? `${groupColor}60` : "#2a2a2a",
      }}
    >
      <button
        type="button"
        className="w-full text-left px-5 py-4"
        onClick={() => setExpanded((v) => !v)}
        data-ocid={`exercise.${exercise.name.toLowerCase().replace(/\s+/g, "_")}.toggle`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="font-bold text-white text-base">
                {exercise.name}
              </h3>
              <Badge
                className="text-xs px-2 py-0.5 border-0 font-medium"
                style={{
                  background: `${DIFFICULTY_COLORS[exercise.difficulty]}22`,
                  color: DIFFICULTY_COLORS[exercise.difficulty],
                }}
              >
                {exercise.difficulty}
              </Badge>
            </div>
            <p className="text-xs text-white/50">
              {exercise.targets.join(" · ")}
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0 text-xs text-white/60 pt-0.5">
            <span>
              {exercise.sets} sets × {exercise.reps}
            </span>
            <span style={{ color: groupColor }}>Rest: {exercise.rest}</span>
          </div>
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5" style={{ borderTop: "1px solid #2a2a2a" }}>
          <div
            className="grid gap-4 mt-4"
            style={{
              gridTemplateColumns: `repeat(${Math.min(exercise.steps.length, 2)}, 1fr)`,
            }}
          >
            {exercise.steps.map((step, i) => (
              <motion.div
                key={`step-${step.instruction.slice(0, 20)}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="flex flex-col gap-2"
                data-ocid={`exercise.step.${i + 1}`}
              >
                <div
                  className="rounded-xl overflow-hidden flex items-center justify-center"
                  style={{
                    background: "#111111",
                    aspectRatio: "4/3",
                    padding: "12px",
                  }}
                >
                  <div className="w-full h-full max-h-36">{step.svg}</div>
                </div>
                <div className="flex gap-2 items-start">
                  <span
                    className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mt-0.5"
                    style={{ background: groupColor, color: "#1a1a1a" }}
                  >
                    {i + 1}
                  </span>
                  <p className="text-sm text-white/70 leading-snug">
                    {step.instruction}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main TrainingGuide Component ─────────────────────────────────────────────
export default function TrainingGuide() {
  const [activeSection, setActiveSection] = useState<string>("chest");
  const [mainTab, setMainTab] = useState<
    "exercises" | "nutrition" | "recovery" | "principles"
  >("exercises");
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const scrollToGroup = (id: string) => {
    setActiveSection(id);
    setMainTab("exercises");
    setTimeout(() => {
      sectionRefs.current[id]?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  };

  const mainTabs = [
    { id: "exercises" as const, label: "Exercises", icon: "💪" },
    { id: "nutrition" as const, label: "Nutrition", icon: "🥗" },
    { id: "recovery" as const, label: "Recovery", icon: "🧊" },
    { id: "principles" as const, label: "Principles", icon: "📐" },
  ];

  return (
    <div
      className="flex flex-col lg:flex-row gap-0 flex-1"
      style={{ minHeight: "72vh" }}
    >
      {/* Sidebar: Muscle Groups */}
      <aside
        className="lg:w-64 xl:w-72 flex-shrink-0 flex flex-col"
        style={{ background: "#161b22", borderRight: "1px solid #2a2a2a" }}
        data-ocid="training_guide.sidebar"
      >
        <div
          className="px-5 py-4"
          style={{ borderBottom: "1px solid #2a2a2a" }}
        >
          <h2
            className="text-white font-bold text-base"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            Muscle Groups
          </h2>
          <p className="text-white/40 text-xs mt-0.5">
            Click to jump to exercises
          </p>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-3 flex flex-col gap-1">
            {MUSCLE_GUIDE_GROUPS.map((g) => (
              <button
                key={g.id}
                type="button"
                data-ocid={`training_guide.group.${g.id}.link`}
                onClick={() => scrollToGroup(g.id)}
                className="w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-center gap-3"
                style={{
                  background:
                    activeSection === g.id ? g.bgColor : "transparent",
                  borderLeft:
                    activeSection === g.id
                      ? `3px solid ${g.color}`
                      : "3px solid transparent",
                }}
              >
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ background: g.color }}
                />
                <span
                  className="text-sm font-medium"
                  style={{
                    color:
                      activeSection === g.id
                        ? g.color
                        : "rgba(255,255,255,0.65)",
                  }}
                >
                  {g.label}
                </span>
                <span
                  className="ml-auto text-xs"
                  style={{ color: "rgba(255,255,255,0.3)" }}
                >
                  {g.exercises.length} ex
                </span>
              </button>
            ))}
          </div>
        </ScrollArea>

        {/* Section nav for smaller content */}
        <div
          className="p-3 pt-0 flex flex-col gap-1"
          style={{ borderTop: "1px solid #2a2a2a" }}
        >
          {mainTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              data-ocid={`training_guide.${tab.id}.tab`}
              onClick={() => setMainTab(tab.id)}
              className="w-full text-left px-3 py-2 rounded-lg transition-all flex items-center gap-2.5"
              style={{
                background:
                  mainTab === tab.id ? "rgba(255,255,255,0.08)" : "transparent",
                color:
                  mainTab === tab.id
                    ? "rgba(255,255,255,0.9)"
                    : "rgba(255,255,255,0.45)",
              }}
            >
              <span>{tab.icon}</span>
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-auto" style={{ background: "#111" }}>
        {/* Tab bar */}
        <div
          className="sticky top-0 z-10 flex items-center gap-1 px-6 py-3"
          style={{
            background: "rgba(17,17,17,0.95)",
            backdropFilter: "blur(8px)",
            borderBottom: "1px solid #2a2a2a",
          }}
        >
          {mainTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              data-ocid={`training_guide.${tab.id}.tab_top`}
              onClick={() => setMainTab(tab.id)}
              className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5"
              style={{
                background:
                  mainTab === tab.id ? "rgba(255,255,255,0.1)" : "transparent",
                color: mainTab === tab.id ? "white" : "rgba(255,255,255,0.45)",
                borderBottom:
                  mainTab === tab.id
                    ? "2px solid #E8A878"
                    : "2px solid transparent",
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        <div className="px-6 py-6 max-w-4xl">
          {/* ── EXERCISES TAB ── */}
          {mainTab === "exercises" && (
            <div className="flex flex-col gap-10">
              {MUSCLE_GUIDE_GROUPS.map((group) => (
                <section
                  key={group.id}
                  ref={(el) => {
                    sectionRefs.current[group.id] = el;
                  }}
                  data-ocid={`training_guide.${group.id}.section`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span
                      className="w-4 h-4 rounded-full"
                      style={{ background: group.color }}
                    />
                    <h2
                      className="text-xl font-bold text-white"
                      style={{
                        fontFamily: "'Bricolage Grotesque', sans-serif",
                      }}
                    >
                      {group.label}
                    </h2>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        background: group.bgColor,
                        color: group.color,
                        border: `1px solid ${group.color}40`,
                      }}
                    >
                      {group.exercises.length} exercises
                    </span>
                  </div>
                  <div className="flex flex-col gap-3">
                    {group.exercises.map((exercise, idx) => (
                      <div
                        key={exercise.name}
                        data-ocid={`exercise.item.${idx + 1}`}
                      >
                        <ExerciseCard
                          exercise={exercise}
                          groupColor={group.color}
                        />
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}

          {/* ── NUTRITION TAB ── */}
          {mainTab === "nutrition" && (
            <div className="flex flex-col gap-8">
              <div>
                <h2
                  className="text-2xl font-bold text-white mb-1"
                  style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                >
                  Muscle Building Nutrition
                </h2>
                <p className="text-white/50 text-sm">
                  Evidence-based macro targets for muscle hypertrophy and
                  recovery.
                </p>
              </div>

              {/* Macro Cards */}
              <div
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                data-ocid="nutrition.macros.section"
              >
                {NUTRITION_MACROS.map((macro, i) => (
                  <motion.div
                    key={macro.macro}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className="rounded-2xl p-5 border"
                    style={{
                      background: "#1c1c1c",
                      borderColor: `${macro.color}40`,
                    }}
                    data-ocid={`nutrition.macro.${i + 1}`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">{macro.icon}</span>
                      <div>
                        <div className="text-xs text-white/40 uppercase tracking-wide font-semibold">
                          {macro.macro}
                        </div>
                        <div
                          className="text-2xl font-bold"
                          style={{
                            fontFamily: "'Bricolage Grotesque', sans-serif",
                            color: macro.color,
                          }}
                        >
                          {macro.amount}
                          <span className="text-sm font-normal text-white/40 ml-1">
                            {macro.unit}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-white/55 leading-relaxed">
                      {macro.note}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* Top Protein Foods */}
              <div data-ocid="nutrition.foods.section">
                <h3
                  className="text-lg font-bold text-white mb-3"
                  style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                >
                  Top Muscle-Building Foods
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {TOP_FOODS.map((food, i) => (
                    <div
                      key={food.name}
                      className="rounded-xl p-4 border flex flex-col gap-1"
                      style={{ background: "#1c1c1c", borderColor: "#2a2a2a" }}
                      data-ocid={`nutrition.food.${i + 1}`}
                    >
                      <span className="text-2xl">{food.icon}</span>
                      <div className="text-sm font-semibold text-white/90">
                        {food.name}
                      </div>
                      <div className="text-xs text-white/40">
                        {food.protein} protein
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Meal Timing */}
              <div
                className="rounded-2xl p-5 border"
                style={{ background: "#1c1c1c", borderColor: "#2a2a2a" }}
                data-ocid="nutrition.timing.section"
              >
                <h3
                  className="text-lg font-bold text-white mb-3"
                  style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                >
                  ⏱️ Meal Timing Strategy
                </h3>
                <div className="grid sm:grid-cols-3 gap-4">
                  {[
                    {
                      time: "Pre-Workout (1–2h)",
                      icon: "🕐",
                      advice:
                        "Complex carbs + protein. Example: oats + protein powder. Avoid high fat/fiber that slows digestion.",
                    },
                    {
                      time: "Post-Workout (within 2h)",
                      icon: "🕑",
                      advice:
                        "Fast carbs + protein. 0.3–0.4g protein per kg BW. Banana + Greek yogurt or a protein shake + rice cake.",
                    },
                    {
                      time: "Before Bed",
                      icon: "🌙",
                      advice:
                        "Casein protein is absorbed slowly over night. Cottage cheese, Greek yogurt, or casein powder supports overnight muscle protein synthesis.",
                    },
                  ].map((item) => (
                    <div
                      key={item.time}
                      className="flex flex-col gap-2"
                      data-ocid={`nutrition.timing.${["pre", "post", "bed"].indexOf(item.time.includes("Pre") ? "pre" : item.time.includes("Post") ? "post" : "bed") + 1}`}
                    >
                      <div className="text-base font-bold text-white/80 flex items-center gap-2">
                        <span>{item.icon}</span> {item.time}
                      </div>
                      <p className="text-sm text-white/50 leading-relaxed">
                        {item.advice}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── RECOVERY TAB ── */}
          {mainTab === "recovery" && (
            <div className="flex flex-col gap-8">
              <div>
                <h2
                  className="text-2xl font-bold text-white mb-1"
                  style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                >
                  Recovery Methods
                </h2>
                <p className="text-white/50 text-sm">
                  Muscle growth happens during recovery. Optimize it like you
                  optimize training.
                </p>
              </div>

              {/* Recovery Cards */}
              <div
                className="grid sm:grid-cols-2 gap-4"
                data-ocid="recovery.methods.section"
              >
                {RECOVERY_ITEMS.map((item, i) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className="rounded-2xl p-5 border"
                    style={{
                      background: "#1c1c1c",
                      borderColor: `${item.color}40`,
                    }}
                    data-ocid={`recovery.method.${i + 1}`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{item.icon}</span>
                      <h3 className="font-bold text-white text-base">
                        {item.title}
                      </h3>
                    </div>
                    <p className="text-sm text-white/60 leading-relaxed mb-3">
                      {item.description}
                    </p>
                    {item.svg && (
                      <div
                        className="rounded-xl overflow-hidden flex items-center justify-center"
                        style={{
                          background: "#111",
                          height: "120px",
                          padding: "12px",
                        }}
                      >
                        <div className="w-full h-full">{item.svg}</div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Static Stretches */}
              <div data-ocid="recovery.stretches.section">
                <h3
                  className="text-lg font-bold text-white mb-4"
                  style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                >
                  Static Stretching Protocol
                </h3>
                <p className="text-white/50 text-sm mb-4">
                  Perform after workouts only. Hold each stretch still — no
                  bouncing. Breathe deeply into the stretch.
                </p>
                <div className="grid sm:grid-cols-3 gap-4">
                  {STATIC_STRETCHES.map((stretch, i) => (
                    <div
                      key={stretch.muscle}
                      className="rounded-2xl overflow-hidden border"
                      style={{
                        background: "#1c1c1c",
                        borderColor: `${stretch.color}40`,
                      }}
                      data-ocid={`recovery.stretch.${i + 1}`}
                    >
                      <div
                        className="flex items-center justify-center"
                        style={{
                          background: "#111",
                          height: "140px",
                          padding: "12px",
                        }}
                      >
                        <div className="w-full h-full">{stretch.svg}</div>
                      </div>
                      <div className="p-3">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-sm text-white">
                            {stretch.muscle}
                          </span>
                          <span className="text-xs text-white/40">
                            {stretch.duration}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recovery timeline */}
              <div
                className="rounded-2xl p-5 border"
                style={{ background: "#1c1c1c", borderColor: "#2a2a2a" }}
                data-ocid="recovery.timeline.section"
              >
                <h3
                  className="text-lg font-bold text-white mb-4"
                  style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                >
                  📅 Muscle Recovery Timeline
                </h3>
                <div className="flex flex-col gap-3">
                  {[
                    {
                      time: "0–6h",
                      phase: "Inflammatory Phase",
                      color: "#E85050",
                      note: "Satellite cells activated. Protein synthesis spikes. Eat protein + carbs NOW.",
                    },
                    {
                      time: "6–48h",
                      phase: "Proliferation Phase",
                      color: "#E8C050",
                      note: "New muscle fibers form. Sleep is critical. DOMS peaks at 24–48h — this is normal.",
                    },
                    {
                      time: "48–72h",
                      phase: "Remodeling Phase",
                      color: "#50E8A0",
                      note: "Myofibrils thicken and reorganize. Muscle is now stronger. Safe to train again.",
                    },
                  ].map((phase) => (
                    <div
                      key={phase.time}
                      className="flex gap-4 items-start"
                      data-ocid={`recovery.phase.${["0–6h", "6–48h", "48–72h"].indexOf(phase.time) + 1}`}
                    >
                      <div
                        className="text-sm font-bold rounded-lg px-2 py-1 flex-shrink-0 w-16 text-center"
                        style={{
                          background: `${phase.color}22`,
                          color: phase.color,
                        }}
                      >
                        {phase.time}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white/80">
                          {phase.phase}
                        </div>
                        <div className="text-xs text-white/50 mt-0.5">
                          {phase.note}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── PRINCIPLES TAB ── */}
          {mainTab === "principles" && (
            <div className="flex flex-col gap-8">
              <div>
                <h2
                  className="text-2xl font-bold text-white mb-1"
                  style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                >
                  Training Principles
                </h2>
                <p className="text-white/50 text-sm">
                  Evidence-based rules that separate consistent gains from
                  spinning your wheels.
                </p>
              </div>

              <div
                className="grid sm:grid-cols-2 gap-4"
                data-ocid="principles.section"
              >
                {TRAINING_PRINCIPLES.map((principle, i) => (
                  <motion.div
                    key={principle.title}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className="rounded-2xl p-5 border"
                    style={{
                      background: "#1c1c1c",
                      borderColor: `${principle.color}40`,
                    }}
                    data-ocid={`principle.item.${i + 1}`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                        style={{ background: `${principle.color}22` }}
                      >
                        {principle.icon}
                      </div>
                      <h3
                        className="font-bold text-white text-base"
                        style={{
                          fontFamily: "'Bricolage Grotesque', sans-serif",
                        }}
                      >
                        {principle.title}
                      </h3>
                    </div>
                    <ul className="flex flex-col gap-2">
                      {principle.points.map((point) => (
                        <li
                          key={point.slice(0, 30)}
                          className="flex gap-2 items-start text-sm text-white/60"
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                            style={{ background: principle.color }}
                          />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>

              {/* Weekly Program Template */}
              <div
                className="rounded-2xl p-5 border"
                style={{ background: "#1c1c1c", borderColor: "#2a2a2a" }}
                data-ocid="principles.program.section"
              >
                <h3
                  className="text-lg font-bold text-white mb-4"
                  style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                >
                  📋 Sample Weekly Program (4-Day Upper/Lower)
                </h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    {
                      day: "Mon",
                      label: "Upper A (Strength)",
                      color: "#E8A8A0",
                      focus: "Bench Press 4×5, Row 4×5, OHP 3×6, Chin-Up 3×6",
                    },
                    {
                      day: "Tue",
                      label: "Lower A (Strength)",
                      color: "#A8C8E8",
                      focus: "Squat 4×5, Romanian DL 3×8, Leg Press 3×10",
                    },
                    {
                      day: "Thu",
                      label: "Upper B (Hypertrophy)",
                      color: "#D8B8E8",
                      focus:
                        "Incline DB Press 4×10, Cable Row 4×12, Lateral Raise 3×15",
                    },
                    {
                      day: "Fri",
                      label: "Lower B (Hypertrophy)",
                      color: "#C8E0A8",
                      focus:
                        "Hip Thrust 4×10, Leg Curl 4×12, Bulgarian Split Squat 3×10",
                    },
                    {
                      day: "Wed",
                      label: "Active Recovery",
                      color: "#E8C098",
                      focus:
                        "30 min walk + foam rolling + full body stretch circuit",
                    },
                    {
                      day: "Sat/Sun",
                      label: "Full Rest",
                      color: "#888",
                      focus:
                        "Sleep 8–9 hours. Eat at maintenance calories. Recharge CNS.",
                    },
                  ].map((item, i) => (
                    <div
                      key={item.day}
                      className="flex gap-3 items-start rounded-xl p-3"
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid #2a2a2a",
                      }}
                      data-ocid={`program.day.${i + 1}`}
                    >
                      <div
                        className="text-xs font-bold rounded-lg px-2 py-1 flex-shrink-0 w-10 text-center"
                        style={{
                          background: `${item.color}22`,
                          color: item.color,
                        }}
                      >
                        {item.day}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white/80">
                          {item.label}
                        </div>
                        <div className="text-xs text-white/40 mt-0.5">
                          {item.focus}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
