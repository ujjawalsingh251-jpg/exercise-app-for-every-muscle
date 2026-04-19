import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { Html, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Activity,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Info,
  RotateCcw,
  Search,
  ZoomIn,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as THREE from "three";
import TrainingGuide from "./TrainingGuide";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Muscle {
  id: string;
  name: string;
  group: string;
  origin: string;
  insertion: string;
  function: string;
  tips: string;
}

interface MuscleGroup {
  id: string;
  label: string;
  color: string;
  muscles: Muscle[];
}

// ─── Skin tone palette per muscle group (subtle anatomical variation) ─────────
const GROUP_COLORS: Record<string, string> = {
  head_neck: "#D4956A",
  chest: "#C9845A",
  back: "#BF7A50",
  shoulders: "#CC8060",
  arms: "#C47850",
  core: "#CB8058",
  glutes: "#BA7048",
  legs: "#C07855",
};

// UI legend colors (slightly more saturated for UI contrast)
const GROUP_UI_COLORS: Record<string, string> = {
  head_neck: "#e8b4a0",
  chest: "#e8a890",
  back: "#c8d898",
  shoulders: "#d8b0c8",
  arms: "#a8d8c0",
  core: "#e8c098",
  glutes: "#c8e0a8",
  legs: "#a8c8e8",
};

const MUSCLE_GROUPS: MuscleGroup[] = [
  {
    id: "head_neck",
    label: "Head & Neck",
    color: GROUP_UI_COLORS.head_neck,
    muscles: [
      {
        id: "sternocleidomastoid",
        name: "Sternocleidomastoid",
        group: "head_neck",
        origin: "Sternum & clavicle",
        insertion: "Mastoid process",
        function: "Rotates and flexes the head",
        tips: "Stretch by tilting head away from the tight side",
      },
      {
        id: "trapezius_upper",
        name: "Upper Trapezius",
        group: "head_neck",
        origin: "Occipital bone",
        insertion: "Clavicle & scapula",
        function: "Elevates scapula, extends neck",
        tips: "Common tension area — gentle neck rolls help",
      },
      {
        id: "scalenes",
        name: "Scalenes",
        group: "head_neck",
        origin: "Cervical vertebrae",
        insertion: "1st & 2nd ribs",
        function: "Flex and rotate neck, assist breathing",
        tips: "Often tight in desk workers",
      },
    ],
  },
  {
    id: "chest",
    label: "Chest",
    color: GROUP_UI_COLORS.chest,
    muscles: [
      {
        id: "pectoralis_major",
        name: "Pectoralis Major",
        group: "chest",
        origin: "Clavicle, sternum, ribs",
        insertion: "Humerus",
        function: "Adducts and internally rotates arm",
        tips: "Bench press and push-ups are primary builders",
      },
      {
        id: "pectoralis_minor",
        name: "Pectoralis Minor",
        group: "chest",
        origin: "Ribs 3-5",
        insertion: "Coracoid process",
        function: "Protracts and tilts scapula",
        tips: "Often tight; affects posture significantly",
      },
      {
        id: "serratus_anterior",
        name: "Serratus Anterior",
        group: "chest",
        origin: "Ribs 1-8",
        insertion: "Medial border of scapula",
        function: "Protracts and rotates scapula",
        tips: "Called 'boxer's muscle' — key for punching power",
      },
    ],
  },
  {
    id: "back",
    label: "Back",
    color: GROUP_UI_COLORS.back,
    muscles: [
      {
        id: "latissimus_dorsi",
        name: "Latissimus Dorsi",
        group: "back",
        origin: "Lower spine, iliac crest",
        insertion: "Humerus",
        function: "Extends and adducts arm",
        tips: "Pull-ups and lat pulldowns are the gold standard",
      },
      {
        id: "trapezius_mid",
        name: "Middle Trapezius",
        group: "back",
        origin: "Thoracic vertebrae",
        insertion: "Spine of scapula",
        function: "Retracts scapula",
        tips: "Rows are the best exercise",
      },
      {
        id: "rhomboids",
        name: "Rhomboids",
        group: "back",
        origin: "C7-T5 vertebrae",
        insertion: "Medial scapula border",
        function: "Retracts and rotates scapula",
        tips: "Often weak in people who sit a lot",
      },
      {
        id: "erector_spinae",
        name: "Erector Spinae",
        group: "back",
        origin: "Sacrum, iliac crest",
        insertion: "Ribs & vertebrae",
        function: "Extends and stabilizes spine",
        tips: "Deadlifts and good-mornings strengthen this group",
      },
    ],
  },
  {
    id: "shoulders",
    label: "Shoulders",
    color: GROUP_UI_COLORS.shoulders,
    muscles: [
      {
        id: "deltoid_anterior",
        name: "Anterior Deltoid",
        group: "shoulders",
        origin: "Clavicle",
        insertion: "Humerus",
        function: "Flexes and internally rotates arm",
        tips: "Front raises target this head",
      },
      {
        id: "deltoid_medial",
        name: "Medial Deltoid",
        group: "shoulders",
        origin: "Acromion",
        insertion: "Humerus",
        function: "Abducts arm",
        tips: "Lateral raises isolate this head",
      },
      {
        id: "deltoid_posterior",
        name: "Posterior Deltoid",
        group: "shoulders",
        origin: "Scapular spine",
        insertion: "Humerus",
        function: "Extends and externally rotates arm",
        tips: "Rear delt flyes and face pulls",
      },
      {
        id: "rotator_cuff",
        name: "Rotator Cuff",
        group: "shoulders",
        origin: "Scapula",
        insertion: "Humerus",
        function: "Stabilizes shoulder joint",
        tips: "External rotation exercises prevent injury",
      },
    ],
  },
  {
    id: "arms",
    label: "Arms",
    color: GROUP_UI_COLORS.arms,
    muscles: [
      {
        id: "biceps_brachii",
        name: "Biceps Brachii",
        group: "arms",
        origin: "Scapula",
        insertion: "Radius",
        function: "Flexes elbow and supinates forearm",
        tips: "Supinated grip maximizes activation",
      },
      {
        id: "triceps_brachii",
        name: "Triceps Brachii",
        group: "arms",
        origin: "Scapula & humerus",
        insertion: "Olecranon",
        function: "Extends elbow",
        tips: "Makes up ~2/3 of upper arm mass",
      },
      {
        id: "brachialis",
        name: "Brachialis",
        group: "arms",
        origin: "Humerus",
        insertion: "Ulna",
        function: "Flexes elbow",
        tips: "Hammer curls target this muscle",
      },
      {
        id: "forearm_flexors",
        name: "Forearm Flexors",
        group: "arms",
        origin: "Medial epicondyle",
        insertion: "Hand bones",
        function: "Flex wrist and fingers",
        tips: "Wrist curls and grip training",
      },
    ],
  },
  {
    id: "core",
    label: "Core & Abs",
    color: GROUP_UI_COLORS.core,
    muscles: [
      {
        id: "rectus_abdominis",
        name: "Rectus Abdominis",
        group: "core",
        origin: "Pubic crest",
        insertion: "Xiphoid & ribs 5-7",
        function: "Flexes trunk",
        tips: "The '6-pack' muscle; visible at ~10-12% body fat",
      },
      {
        id: "obliques",
        name: "Obliques",
        group: "core",
        origin: "Ribs 5-12",
        insertion: "Iliac crest",
        function: "Rotates and laterally flexes trunk",
        tips: "Russian twists and cable woodchops",
      },
      {
        id: "transverse_abdominis",
        name: "Transverse Abdominis",
        group: "core",
        origin: "Iliac crest, ribs",
        insertion: "Linea alba",
        function: "Compresses abdomen, stabilizes spine",
        tips: "The deepest core muscle; key for back health",
      },
      {
        id: "iliopsoas",
        name: "Iliopsoas",
        group: "core",
        origin: "Lumbar vertebrae, ilium",
        insertion: "Lesser trochanter",
        function: "Flexes hip and trunk",
        tips: "Often tight from prolonged sitting",
      },
    ],
  },
  {
    id: "glutes",
    label: "Glutes",
    color: GROUP_UI_COLORS.glutes,
    muscles: [
      {
        id: "gluteus_maximus",
        name: "Gluteus Maximus",
        group: "glutes",
        origin: "Ilium, sacrum, coccyx",
        insertion: "IT band & femur",
        function: "Extends and externally rotates hip",
        tips: "Largest muscle in the body; hip thrusts are best",
      },
      {
        id: "gluteus_medius",
        name: "Gluteus Medius",
        group: "glutes",
        origin: "Ilium",
        insertion: "Greater trochanter",
        function: "Abducts hip, stabilizes pelvis",
        tips: "Clamshells and lateral walks",
      },
      {
        id: "gluteus_minimus",
        name: "Gluteus Minimus",
        group: "glutes",
        origin: "Ilium",
        insertion: "Greater trochanter",
        function: "Abducts and internally rotates hip",
        tips: "Works alongside medius",
      },
    ],
  },
  {
    id: "legs",
    label: "Legs",
    color: GROUP_UI_COLORS.legs,
    muscles: [
      {
        id: "quadriceps",
        name: "Quadriceps",
        group: "legs",
        origin: "Ilium & femur",
        insertion: "Tibial tuberosity",
        function: "Extends knee",
        tips: "4 muscles; squats and leg presses",
      },
      {
        id: "hamstrings",
        name: "Hamstrings",
        group: "legs",
        origin: "Ischial tuberosity",
        insertion: "Tibia & fibula",
        function: "Flexes knee, extends hip",
        tips: "Romanian deadlifts for strength",
      },
      {
        id: "gastrocnemius",
        name: "Gastrocnemius",
        group: "legs",
        origin: "Femoral condyles",
        insertion: "Calcaneus via Achilles",
        function: "Plantarflexes foot, flexes knee",
        tips: "Calf raises; best done with knee extended",
      },
      {
        id: "soleus",
        name: "Soleus",
        group: "legs",
        origin: "Tibia & fibula",
        insertion: "Calcaneus via Achilles",
        function: "Plantarflexes foot",
        tips: "Seated calf raises target this muscle",
      },
      {
        id: "tibialis_anterior",
        name: "Tibialis Anterior",
        group: "legs",
        origin: "Tibia",
        insertion: "Medial cuneiform",
        function: "Dorsiflexes foot",
        tips: "Toe raises strengthen this",
      },
      {
        id: "adductors",
        name: "Adductors",
        group: "legs",
        origin: "Pubis & ischium",
        insertion: "Femur & tibia",
        function: "Adducts and flexes hip",
        tips: "Sumo squats and cable adductions",
      },
    ],
  },
];

const ALL_MUSCLES: Muscle[] = MUSCLE_GROUPS.flatMap((g) => g.muscles);

// ─── Guide Cards Data ──────────────────────────────────────────────────────────
const GUIDE_CARDS = [
  {
    icon: "💪",
    title: "Progressive Overload",
    desc: "Gradually increase weight, reps, or sets to continuously challenge muscles and stimulate growth.",
    tag: "Training",
    color: GROUP_UI_COLORS.chest,
  },
  {
    icon: "🔄",
    title: "Muscle Recovery",
    desc: "Muscles grow during rest, not during workouts. Aim for 48-72 hours between training the same group.",
    tag: "Recovery",
    color: GROUP_UI_COLORS.back,
  },
  {
    icon: "🧬",
    title: "Mind-Muscle Connection",
    desc: "Consciously contracting the target muscle during exercise increases activation and hypertrophy.",
    tag: "Technique",
    color: GROUP_UI_COLORS.shoulders,
  },
  {
    icon: "⚡",
    title: "Compound vs Isolation",
    desc: "Compound movements (squats, deadlifts) build overall strength; isolation targets specific muscles.",
    tag: "Programming",
    color: GROUP_UI_COLORS.legs,
  },
  {
    icon: "🥩",
    title: "Protein Synthesis",
    desc: "Consume 0.7-1g of protein per lb of bodyweight daily to support muscle repair and growth.",
    tag: "Nutrition",
    color: GROUP_UI_COLORS.core,
  },
  {
    icon: "📐",
    title: "Full Range of Motion",
    desc: "Training through the full ROM increases flexibility, muscle length, and overall strength gains.",
    tag: "Form",
    color: GROUP_UI_COLORS.arms,
  },
];

// ─── Geometry Helpers ─────────────────────────────────────────────────────────

/** Build a lathe profile (x,y pairs) as THREE.Vector2 array */
function lathePoints(profile: [number, number][]): THREE.Vector2[] {
  return profile.map(([x, y]) => new THREE.Vector2(x, y));
}

/** TubeGeometry along a smooth CatmullRom path */
function makeTube(
  pts: [number, number, number][],
  radii: number,
  tubeSeg = 20,
  radSeg = 12,
): THREE.TubeGeometry {
  const curve = new THREE.CatmullRomCurve3(
    pts.map(([x, y, z]) => new THREE.Vector3(x, y, z)),
  );
  return new THREE.TubeGeometry(curve, tubeSeg, radii, radSeg, false);
}

// ─── Scene Background ─────────────────────────────────────────────────────────
function SceneBackground() {
  const { scene } = useThree();
  useEffect(() => {
    scene.background = new THREE.Color("#111111");
    return () => {
      scene.background = null;
    };
  }, [scene]);
  return null;
}

// ─── Organic Skin Material ────────────────────────────────────────────────────
function SkinMaterial({
  color,
  emissiveIntensity,
  isSelected,
}: {
  color: string;
  emissiveIntensity: number;
  isSelected: boolean;
}) {
  const emissiveColor = isSelected ? "#FF4444" : color;
  return (
    <meshPhysicalMaterial
      color={color}
      emissive={emissiveColor}
      emissiveIntensity={emissiveIntensity}
      roughness={0.85}
      metalness={0.0}
      sheen={0.3}
      sheenColor={new THREE.Color(color)}
      clearcoat={0.05}
      clearcoatRoughness={0.9}
    />
  );
}

// ─── SSS Overlay (subsurface scattering sim) ──────────────────────────────────
function SSSOverlay() {
  return (
    <meshPhysicalMaterial
      color="#FF6633"
      transparent
      opacity={0.07}
      roughness={1.0}
      metalness={0.0}
      depthWrite={false}
      side={THREE.BackSide}
    />
  );
}

// ─── Individual Organic Muscle Components ─────────────────────────────────────

/** Organic lathe-based limb segment */
function LatheMesh({
  profile,
  segs,
  position,
  rotation,
  scale,
  color,
  emissiveIntensity,
  isSelected,
  muscleId,
  label,
  showLabel,
  onClick,
  isHighlighted,
}: {
  profile: [number, number][];
  segs?: number;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  color: string;
  emissiveIntensity: number;
  isSelected: boolean;
  isHighlighted: boolean;
  muscleId: string;
  label?: string;
  showLabel?: boolean;
  onClick: (id: string) => void;
}) {
  const geo = useMemo(
    () => new THREE.LatheGeometry(lathePoints(profile), segs ?? 20),
    [profile, segs],
  );
  const [rx, ry, rz] = rotation ?? [0, 0, 0];
  const [sx, sy, sz] = scale ?? [1, 1, 1];
  return (
    <group position={position} rotation={[rx, ry, rz]} scale={[sx, sy, sz]}>
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: Three.js mesh is not a DOM element */}
      <mesh
        geometry={geo}
        castShadow
        onClick={(e) => {
          e.stopPropagation();
          onClick(muscleId);
        }}
      >
        <SkinMaterial
          color={color}
          emissiveIntensity={emissiveIntensity}
          isSelected={isSelected}
        />
      </mesh>
      {label && showLabel && (isSelected || isHighlighted) && (
        <Html position={[0, 0.6, 0.2]} center style={{ pointerEvents: "none" }}>
          <LabelTag text={label} active />
        </Html>
      )}
    </group>
  );
}

/** Tube mesh along a curved path (for biceps belly, deltoid arc, etc.) */
function TubeMesh({
  pts,
  radius,
  position,
  rotation,
  scale,
  color,
  emissiveIntensity,
  isSelected,
  isHighlighted,
  muscleId,
  label,
  showLabel,
  onClick,
}: {
  pts: [number, number, number][];
  radius: number;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  color: string;
  emissiveIntensity: number;
  isSelected: boolean;
  isHighlighted: boolean;
  muscleId: string;
  label?: string;
  showLabel?: boolean;
  onClick: (id: string) => void;
}) {
  const geo = useMemo(() => makeTube(pts, radius), [pts, radius]);
  const [rx, ry, rz] = rotation ?? [0, 0, 0];
  const [sx, sy, sz] = scale ?? [1, 1, 1];
  return (
    <group position={position} rotation={[rx, ry, rz]} scale={[sx, sy, sz]}>
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: Three.js mesh is not a DOM element */}
      <mesh
        geometry={geo}
        castShadow
        onClick={(e) => {
          e.stopPropagation();
          onClick(muscleId);
        }}
      >
        <SkinMaterial
          color={color}
          emissiveIntensity={emissiveIntensity}
          isSelected={isSelected}
        />
      </mesh>
      {label && showLabel && (isSelected || isHighlighted) && (
        <Html
          position={[0, 0.12, 0.12]}
          center
          style={{ pointerEvents: "none" }}
        >
          <LabelTag text={label} active />
        </Html>
      )}
    </group>
  );
}

/** Generic organic sphere mesh */
function SphereMesh({
  args,
  position,
  rotation,
  scale,
  color,
  emissiveIntensity,
  isSelected,
  isHighlighted,
  muscleId,
  label,
  showLabel,
  onClick,
}: {
  args: [number, number, number];
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  color: string;
  emissiveIntensity: number;
  isSelected: boolean;
  isHighlighted: boolean;
  muscleId: string;
  label?: string;
  showLabel?: boolean;
  onClick: (id: string) => void;
}) {
  const [rx, ry, rz] = rotation ?? [0, 0, 0];
  const [sx, sy, sz] = scale ?? [1, 1, 1];
  return (
    <group position={position} rotation={[rx, ry, rz]} scale={[sx, sy, sz]}>
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: Three.js mesh is not a DOM element */}
      <mesh
        castShadow
        onClick={(e) => {
          e.stopPropagation();
          onClick(muscleId);
        }}
      >
        <sphereGeometry args={args} />
        <SkinMaterial
          color={color}
          emissiveIntensity={emissiveIntensity}
          isSelected={isSelected}
        />
      </mesh>
      {label && showLabel && (isSelected || isHighlighted) && (
        <Html position={[0, 0.7, 0.4]} center style={{ pointerEvents: "none" }}>
          <LabelTag text={label} active />
        </Html>
      )}
    </group>
  );
}

// ─── Label Tag ────────────────────────────────────────────────────────────────
function LabelTag({ text, active }: { text: string; active: boolean }) {
  return (
    <span
      style={{
        display: "inline-block",
        background: active ? "rgba(0,0,0,0.75)" : "rgba(0,0,0,0.45)",
        color: active ? "#fff" : "rgba(255,255,255,0.55)",
        fontSize: "10px",
        fontWeight: 700,
        fontFamily: "'Figtree', system-ui, sans-serif",
        letterSpacing: "0.05em",
        padding: "2px 6px",
        borderRadius: "4px",
        backdropFilter: "blur(4px)",
        border: active
          ? "1px solid rgba(255,255,255,0.3)"
          : "1px solid rgba(255,255,255,0.1)",
        whiteSpace: "nowrap",
        userSelect: "none",
        transition: "all 0.2s",
      }}
    >
      {text}
    </span>
  );
}

// ─── Static overlay labels ────────────────────────────────────────────────────
const STATIC_LABELS: {
  id: string;
  muscleId: string;
  group: string;
  label: string;
  position: [number, number, number];
}[] = [
  {
    id: "lbl_scm",
    muscleId: "sternocleidomastoid",
    group: "head_neck",
    label: "SCM",
    position: [-0.22, 3.08, 0.18],
  },
  {
    id: "lbl_trap",
    muscleId: "trapezius_upper",
    group: "head_neck",
    label: "TRAP",
    position: [-0.7, 2.72, 0.05],
  },
  {
    id: "lbl_pec_l",
    muscleId: "pectoralis_major",
    group: "chest",
    label: "PM",
    position: [-0.38, 2.05, 0.32],
  },
  {
    id: "lbl_pec_r",
    muscleId: "pectoralis_major",
    group: "chest",
    label: "PM",
    position: [0.38, 2.05, 0.32],
  },
  {
    id: "lbl_delt_l",
    muscleId: "deltoid_medial",
    group: "shoulders",
    label: "DEL",
    position: [-1.05, 2.45, 0.05],
  },
  {
    id: "lbl_delt_r",
    muscleId: "deltoid_medial",
    group: "shoulders",
    label: "DEL",
    position: [1.05, 2.45, 0.05],
  },
  {
    id: "lbl_bic_l",
    muscleId: "biceps_brachii",
    group: "arms",
    label: "BB",
    position: [-1.18, 1.9, 0.16],
  },
  {
    id: "lbl_bic_r",
    muscleId: "biceps_brachii",
    group: "arms",
    label: "BB",
    position: [1.18, 1.9, 0.16],
  },
  {
    id: "lbl_abs",
    muscleId: "rectus_abdominis",
    group: "core",
    label: "RA",
    position: [0, 1.55, 0.3],
  },
  {
    id: "lbl_obl_l",
    muscleId: "obliques",
    group: "core",
    label: "EO",
    position: [-0.52, 1.38, 0.2],
  },
  {
    id: "lbl_obl_r",
    muscleId: "obliques",
    group: "core",
    label: "EO",
    position: [0.52, 1.38, 0.2],
  },
  {
    id: "lbl_fr_l",
    muscleId: "forearm_flexors",
    group: "arms",
    label: "FR",
    position: [-1.28, 1.28, 0.1],
  },
  {
    id: "lbl_fr_r",
    muscleId: "forearm_flexors",
    group: "arms",
    label: "FR",
    position: [1.28, 1.28, 0.1],
  },
  {
    id: "lbl_qd_l",
    muscleId: "quadriceps",
    group: "legs",
    label: "QD",
    position: [-0.32, -0.38, 0.28],
  },
  {
    id: "lbl_qd_r",
    muscleId: "quadriceps",
    group: "legs",
    label: "QD",
    position: [0.32, -0.38, 0.28],
  },
  {
    id: "lbl_ga_l",
    muscleId: "gastrocnemius",
    group: "legs",
    label: "GA",
    position: [-0.28, -1.42, -0.08],
  },
  {
    id: "lbl_lat_l",
    muscleId: "latissimus_dorsi",
    group: "back",
    label: "LD",
    position: [-0.62, 1.55, -0.3],
  },
  {
    id: "lbl_glut",
    muscleId: "gluteus_maximus",
    group: "glutes",
    label: "GLUT",
    position: [0, 0.25, -0.38],
  },
];

function StaticLabels({
  highlightGroup,
  selectedMuscle,
}: { highlightGroup: string | null; selectedMuscle: string | null }) {
  return (
    <>
      {STATIC_LABELS.map((l) => {
        const isActive =
          highlightGroup === l.group || selectedMuscle === l.muscleId;
        return (
          <Html
            key={`lbl-${l.id}`}
            position={l.position}
            center
            style={{ pointerEvents: "none" }}
          >
            <LabelTag text={l.label} active={isActive} />
          </Html>
        );
      })}
    </>
  );
}

// ─── Auto Rotation ─────────────────────────────────────────────────────────────
function AutoRotate({ active }: { active: boolean }) {
  const { scene } = useThree();
  useFrame((_, delta) => {
    if (active) scene.rotation.y += delta * 0.18;
  });
  return null;
}

// ─── The complete organic human body ─────────────────────────────────────────
function OrganicHumanBody({
  selectedMuscle,
  highlightGroup,
  intensity,
  onSelect,
}: {
  selectedMuscle: string | null;
  highlightGroup: string | null;
  intensity: number;
  onSelect: (id: string) => void;
}) {
  function ei(group: string, muscleId: string): number {
    const sel = selectedMuscle === muscleId;
    const hi = highlightGroup === group || selectedMuscle === muscleId;
    return sel ? 0.35 * intensity : hi ? 0.15 * intensity : 0.04;
  }
  function col(group: string): string {
    return GROUP_COLORS[group] ?? "#C08060";
  }
  function isSel(m: string): boolean {
    return selectedMuscle === m;
  }
  function isHi(g: string, m: string): boolean {
    return highlightGroup === g || selectedMuscle === m;
  }

  // Neck lathe profile: wider at base, narrower at top
  const neckProfile: [number, number][] = [
    [0.21, 0],
    [0.2, 0.1],
    [0.19, 0.2],
    [0.18, 0.32],
    [0.17, 0.42],
    [0.175, 0.52],
  ];
  // Limb segment profiles (radius, y)
  const upperArmProfile: [number, number][] = [
    [0.01, 0],
    [0.115, 0.05],
    [0.155, 0.2],
    [0.16, 0.4],
    [0.145, 0.55],
    [0.12, 0.65],
    [0.09, 0.75],
  ];
  const forearmProfile: [number, number][] = [
    [0.01, 0],
    [0.12, 0.05],
    [0.135, 0.15],
    [0.12, 0.28],
    [0.1, 0.42],
    [0.085, 0.5],
  ];
  const thighProfile: [number, number][] = [
    [0.01, 0],
    [0.2, 0.05],
    [0.23, 0.18],
    [0.225, 0.35],
    [0.21, 0.52],
    [0.185, 0.68],
    [0.155, 0.78],
  ];
  const shinProfile: [number, number][] = [
    [0.01, 0],
    [0.115, 0.05],
    [0.13, 0.15],
    [0.12, 0.28],
    [0.1, 0.42],
    [0.09, 0.52],
    [0.075, 0.58],
  ];
  const calfProfile: [number, number][] = [
    [0.01, 0],
    [0.125, 0.04],
    [0.155, 0.12],
    [0.16, 0.22],
    [0.145, 0.35],
    [0.12, 0.46],
    [0.09, 0.55],
  ];

  // Bicep tube: curves forward to show belly
  const bicepPathL: [number, number, number][] = [
    [0, 0, 0],
    [-0.04, 0.14, 0.06],
    [-0.06, 0.28, 0.09],
    [-0.04, 0.42, 0.06],
    [0, 0.52, 0],
  ];
  const bicepPathR: [number, number, number][] = [
    [0, 0, 0],
    [0.04, 0.14, 0.06],
    [0.06, 0.28, 0.09],
    [0.04, 0.42, 0.06],
    [0, 0.52, 0],
  ];

  // Pectoral tube: fan shape
  const pecPathL: [number, number, number][] = [
    [-0.08, 0, 0],
    [-0.2, 0.04, 0.04],
    [-0.32, 0.02, 0.06],
    [-0.4, -0.06, 0.04],
    [-0.44, -0.14, 0],
  ];
  const pecPathR: [number, number, number][] = [
    [0.08, 0, 0],
    [0.2, 0.04, 0.04],
    [0.32, 0.02, 0.06],
    [0.4, -0.06, 0.04],
    [0.44, -0.14, 0],
  ];

  // Deltoid tube arc
  const deltPathL: [number, number, number][] = [
    [0, 0, 0],
    [-0.12, 0.05, 0.06],
    [-0.22, 0.0, -0.02],
    [-0.18, -0.1, -0.08],
  ];
  const deltPathR: [number, number, number][] = [
    [0, 0, 0],
    [0.12, 0.05, 0.06],
    [0.22, 0.0, -0.02],
    [0.18, -0.1, -0.08],
  ];

  // Trapezius: wide flat shape across back
  const trapPathL: [number, number, number][] = [
    [0, 0, 0],
    [-0.18, 0.06, -0.02],
    [-0.38, 0.04, -0.06],
    [-0.52, -0.08, -0.08],
    [-0.58, -0.22, -0.06],
  ];
  const trapPathR: [number, number, number][] = [
    [0, 0, 0],
    [0.18, 0.06, -0.02],
    [0.38, 0.04, -0.06],
    [0.52, -0.08, -0.08],
    [0.58, -0.22, -0.06],
  ];

  // Lat tube: broad fan from spine to underarm
  const latPathL: [number, number, number][] = [
    [0, 0, 0],
    [-0.18, 0.12, -0.04],
    [-0.36, 0.2, -0.06],
    [-0.52, 0.28, -0.02],
    [-0.6, 0.32, 0.06],
  ];
  const latPathR: [number, number, number][] = [
    [0, 0, 0],
    [0.18, 0.12, -0.04],
    [0.36, 0.2, -0.06],
    [0.52, 0.28, -0.02],
    [0.6, 0.32, 0.06],
  ];

  return (
    <group>
      {/* ── TORSO BASE (skin-tone unifying cylinder) ── */}
      <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.62, 0.52, 1.8, 32, 4]} />
        <meshPhysicalMaterial
          color="#C07850"
          roughness={0.9}
          metalness={0}
          sheen={0.2}
          sheenColor={new THREE.Color("#C07850")}
          clearcoat={0.02}
        />
      </mesh>

      {/* ── PELVIS BASE ── */}
      <mesh position={[0, 0.42, 0]} castShadow>
        <cylinderGeometry args={[0.56, 0.5, 0.42, 28, 2]} />
        <meshPhysicalMaterial color="#B87048" roughness={0.9} metalness={0} />
      </mesh>

      {/* ── HEAD ── */}
      <SphereMesh
        args={[0.42, 32, 24]}
        position={[0, 3.62, 0]}
        scale={[1, 1.12, 1]}
        color={col("head_neck")}
        emissiveIntensity={ei("head_neck", "scalenes")}
        isSelected={isSel("scalenes")}
        isHighlighted={isHi("head_neck", "scalenes")}
        muscleId="scalenes"
        label="HEAD"
        showLabel
        onClick={onSelect}
      />

      {/* ── NECK ── */}
      <LatheMesh
        profile={neckProfile}
        segs={18}
        position={[0, 3.05, -0.05]}
        color={col("head_neck")}
        emissiveIntensity={ei("head_neck", "sternocleidomastoid")}
        isSelected={isSel("sternocleidomastoid")}
        isHighlighted={isHi("head_neck", "sternocleidomastoid")}
        muscleId="sternocleidomastoid"
        label="SCM"
        showLabel
        onClick={onSelect}
      />

      {/* ── UPPER TRAPEZIUS (front slope, each side) ── */}
      <TubeMesh
        pts={trapPathL}
        radius={0.11}
        position={[0.02, 2.76, -0.02]}
        color={col("head_neck")}
        emissiveIntensity={ei("head_neck", "trapezius_upper")}
        isSelected={isSel("trapezius_upper")}
        isHighlighted={isHi("head_neck", "trapezius_upper")}
        muscleId="trapezius_upper"
        label="TRAP"
        showLabel
        onClick={onSelect}
      />
      <TubeMesh
        pts={trapPathR}
        radius={0.11}
        position={[-0.02, 2.76, -0.02]}
        color={col("head_neck")}
        emissiveIntensity={ei("head_neck", "trapezius_upper")}
        isSelected={isSel("trapezius_upper")}
        isHighlighted={isHi("head_neck", "trapezius_upper")}
        muscleId="trapezius_upper"
        onClick={onSelect}
      />

      {/* ── MID TRAPEZIUS (posterior) ── */}
      <TubeMesh
        pts={[
          [-0.0, 0, 0],
          [-0.22, 0.04, -0.08],
          [-0.44, 0.02, -0.14],
          [-0.6, -0.12, -0.12],
        ]}
        radius={0.09}
        position={[0.02, 2.22, -0.18]}
        color={col("back")}
        emissiveIntensity={ei("back", "trapezius_mid")}
        isSelected={isSel("trapezius_mid")}
        isHighlighted={isHi("back", "trapezius_mid")}
        muscleId="trapezius_mid"
        label="MTRAP"
        showLabel
        onClick={onSelect}
      />
      <TubeMesh
        pts={[
          [0.0, 0, 0],
          [0.22, 0.04, -0.08],
          [0.44, 0.02, -0.14],
          [0.6, -0.12, -0.12],
        ]}
        radius={0.09}
        position={[-0.02, 2.22, -0.18]}
        color={col("back")}
        emissiveIntensity={ei("back", "trapezius_mid")}
        isSelected={isSel("trapezius_mid")}
        isHighlighted={isHi("back", "trapezius_mid")}
        muscleId="trapezius_mid"
        onClick={onSelect}
      />

      {/* ── PECTORALIS MAJOR (front chest fans) ── */}
      <TubeMesh
        pts={pecPathL}
        radius={0.175}
        position={[-0.02, 2.12, 0.22]}
        color={col("chest")}
        emissiveIntensity={ei("chest", "pectoralis_major")}
        isSelected={isSel("pectoralis_major")}
        isHighlighted={isHi("chest", "pectoralis_major")}
        muscleId="pectoralis_major"
        label="PM"
        showLabel
        onClick={onSelect}
      />
      <TubeMesh
        pts={pecPathR}
        radius={0.175}
        position={[0.02, 2.12, 0.22]}
        color={col("chest")}
        emissiveIntensity={ei("chest", "pectoralis_major")}
        isSelected={isSel("pectoralis_major")}
        isHighlighted={isHi("chest", "pectoralis_major")}
        muscleId="pectoralis_major"
        label="PM"
        showLabel
        onClick={onSelect}
      />

      {/* ── SERRATUS ANTERIOR ── */}
      {([-1, 1] as const).map((side) => (
        // biome-ignore lint/a11y/useKeyWithClickEvents: Three.js mesh is not a DOM element
        <mesh
          key={`ser${side}`}
          position={[side * 0.64, 1.65, 0.08]}
          rotation={[0.1, 0, side * 0.1]}
          castShadow
          onClick={(e) => {
            e.stopPropagation();
            onSelect("serratus_anterior");
          }}
        >
          <cylinderGeometry args={[0.07, 0.06, 0.38, 12]} />
          <SkinMaterial
            color={col("chest")}
            emissiveIntensity={ei("chest", "serratus_anterior")}
            isSelected={isSel("serratus_anterior")}
          />
        </mesh>
      ))}

      {/* ── LATISSIMUS DORSI (posterior fans) ── */}
      <TubeMesh
        pts={latPathL}
        radius={0.14}
        position={[-0.04, 1.82, -0.24]}
        color={col("back")}
        emissiveIntensity={ei("back", "latissimus_dorsi")}
        isSelected={isSel("latissimus_dorsi")}
        isHighlighted={isHi("back", "latissimus_dorsi")}
        muscleId="latissimus_dorsi"
        label="LD"
        showLabel
        onClick={onSelect}
      />
      <TubeMesh
        pts={latPathR}
        radius={0.14}
        position={[0.04, 1.82, -0.24]}
        color={col("back")}
        emissiveIntensity={ei("back", "latissimus_dorsi")}
        isSelected={isSel("latissimus_dorsi")}
        isHighlighted={isHi("back", "latissimus_dorsi")}
        muscleId="latissimus_dorsi"
        onClick={onSelect}
      />

      {/* ── RHOMBOIDS (between scapulae) ── */}
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: Three.js mesh is not a DOM element */}
      <mesh
        position={[-0.22, 1.95, -0.28]}
        rotation={[0.1, 0, 0.12]}
        castShadow
        onClick={(e) => {
          e.stopPropagation();
          onSelect("rhomboids");
        }}
      >
        <boxGeometry args={[0.32, 0.28, 0.1]} />
        <SkinMaterial
          color={col("back")}
          emissiveIntensity={ei("back", "rhomboids")}
          isSelected={isSel("rhomboids")}
        />
      </mesh>
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: Three.js mesh is not a DOM element */}
      <mesh
        position={[0.22, 1.95, -0.28]}
        rotation={[0.1, 0, -0.12]}
        castShadow
        onClick={(e) => {
          e.stopPropagation();
          onSelect("rhomboids");
        }}
      >
        <boxGeometry args={[0.32, 0.28, 0.1]} />
        <SkinMaterial
          color={col("back")}
          emissiveIntensity={ei("back", "rhomboids")}
          isSelected={isSel("rhomboids")}
        />
      </mesh>

      {/* ── ERECTOR SPINAE (posterior, bilateral columns) ── */}
      {([-1, 1] as const).map((side) => (
        <LatheMesh
          key={`erec${side}`}
          profile={[
            [0.01, 0],
            [0.1, 0.05],
            [0.115, 0.3],
            [0.11, 0.6],
            [0.1, 0.9],
            [0.09, 1.1],
          ]}
          segs={16}
          position={[side * 0.19, 0.58, -0.24]}
          scale={[1, 1, 0.85]}
          color={col("back")}
          emissiveIntensity={ei("back", "erector_spinae")}
          isSelected={isSel("erector_spinae")}
          isHighlighted={isHi("back", "erector_spinae")}
          muscleId="erector_spinae"
          onClick={onSelect}
        />
      ))}

      {/* ── DELTOIDS (3-head caps, each shoulder) ── */}
      {([-1, 1] as const).map((side) => (
        <group key={`delt${side}`}>
          {/* Lateral head (round cap) */}
          <SphereMesh
            args={[0.26, 20, 16]}
            position={[side * 0.9, 2.45, 0]}
            scale={[1, 0.92, 0.88]}
            color={col("shoulders")}
            emissiveIntensity={ei("shoulders", "deltoid_medial")}
            isSelected={isSel("deltoid_medial")}
            isHighlighted={isHi("shoulders", "deltoid_medial")}
            muscleId="deltoid_medial"
            label="DEL"
            showLabel
            onClick={onSelect}
          />
          {/* Anterior head */}
          <TubeMesh
            pts={side < 0 ? deltPathL : deltPathR}
            radius={0.1}
            position={[side * 0.7, 2.5, 0.1]}
            color={col("shoulders")}
            emissiveIntensity={ei("shoulders", "deltoid_anterior")}
            isSelected={isSel("deltoid_anterior")}
            isHighlighted={isHi("shoulders", "deltoid_anterior")}
            muscleId="deltoid_anterior"
            onClick={onSelect}
          />
          {/* Posterior head */}
          {/* biome-ignore lint/a11y/useKeyWithClickEvents: Three.js mesh is not a DOM element */}
          <mesh
            position={[side * 0.82, 2.35, -0.18]}
            castShadow
            onClick={(e) => {
              e.stopPropagation();
              onSelect("deltoid_posterior");
            }}
          >
            <sphereGeometry args={[0.17, 16, 12]} />
            <SkinMaterial
              color={col("shoulders")}
              emissiveIntensity={ei("shoulders", "deltoid_posterior")}
              isSelected={isSel("deltoid_posterior")}
            />
          </mesh>
        </group>
      ))}

      {/* ── BICEPS (tube with belly bulge) ── */}
      {([-1, 1] as const).map((side) => (
        <TubeMesh
          key={`bic${side}`}
          pts={side < 0 ? bicepPathL : bicepPathR}
          radius={0.138}
          position={[side < 0 ? -1.04 : 1.04, 2.05, 0.04]}
          rotation={[0, 0, side * 0.17]}
          color={col("arms")}
          emissiveIntensity={ei("arms", "biceps_brachii")}
          isSelected={isSel("biceps_brachii")}
          isHighlighted={isHi("arms", "biceps_brachii")}
          muscleId="biceps_brachii"
          label="BB"
          showLabel
          onClick={onSelect}
        />
      ))}

      {/* ── TRICEPS (posterior upper arm) ── */}
      {([-1, 1] as const).map((side) => (
        <LatheMesh
          key={`tri${side}`}
          profile={upperArmProfile}
          segs={18}
          position={[side < 0 ? -1.06 : 1.06, 1.68, -0.1]}
          rotation={[0.1, 0, side * 0.17]}
          scale={[0.88, 1, 0.88]}
          color={col("arms")}
          emissiveIntensity={ei("arms", "triceps_brachii")}
          isSelected={isSel("triceps_brachii")}
          isHighlighted={isHi("arms", "triceps_brachii")}
          muscleId="triceps_brachii"
          label="TRI"
          showLabel
          onClick={onSelect}
        />
      ))}

      {/* ── BRACHIALIS (between bicep and tricep) ── */}
      {([-1, 1] as const).map((side) => (
        // biome-ignore lint/a11y/useKeyWithClickEvents: Three.js mesh is not a DOM element
        <mesh
          key={`bra${side}`}
          position={[side * 1.08, 1.96, 0]}
          rotation={[0, 0, side * 0.17]}
          castShadow
          onClick={(e) => {
            e.stopPropagation();
            onSelect("brachialis");
          }}
        >
          <cylinderGeometry args={[0.08, 0.09, 0.32, 14]} />
          <SkinMaterial
            color={col("arms")}
            emissiveIntensity={ei("arms", "brachialis")}
            isSelected={isSel("brachialis")}
          />
        </mesh>
      ))}

      {/* ── FOREARMS ── */}
      {([-1, 1] as const).map((side) => (
        <LatheMesh
          key={`fore${side}`}
          profile={forearmProfile}
          segs={16}
          position={[side < 0 ? -1.18 : 1.18, 1.32, 0.04]}
          rotation={[0, 0, side * 0.22]}
          color={col("arms")}
          emissiveIntensity={ei("arms", "forearm_flexors")}
          isSelected={isSel("forearm_flexors")}
          isHighlighted={isHi("arms", "forearm_flexors")}
          muscleId="forearm_flexors"
          label="FR"
          showLabel
          onClick={onSelect}
        />
      ))}

      {/* ── RECTUS ABDOMINIS (segmented ab blocks) ── */}
      {([0, 1, 2] as const).map((i) => (
        // biome-ignore lint/a11y/useKeyWithClickEvents: Three.js mesh is not a DOM element
        <mesh
          key={`abs${i}`}
          position={[0, 1.72 - i * 0.28, 0.26]}
          castShadow
          onClick={(e) => {
            e.stopPropagation();
            onSelect("rectus_abdominis");
          }}
        >
          <boxGeometry args={[0.38, 0.22, 0.12]} />
          <SkinMaterial
            color={col("core")}
            emissiveIntensity={ei("core", "rectus_abdominis")}
            isSelected={isSel("rectus_abdominis")}
          />
        </mesh>
      ))}
      {/* Ab midline groove (darker strip) */}
      <mesh position={[0, 1.44, 0.265]}>
        <boxGeometry args={[0.03, 0.7, 0.02]} />
        <meshStandardMaterial color="#8A5030" roughness={1} />
      </mesh>

      {/* ── OBLIQUES ── */}
      {([-1, 1] as const).map((side) => (
        // biome-ignore lint/a11y/useKeyWithClickEvents: Three.js mesh is not a DOM element
        <mesh
          key={`obl${side}`}
          position={[side * 0.48, 1.38, 0.15]}
          rotation={[0.1, 0, side * 0.18]}
          castShadow
          onClick={(e) => {
            e.stopPropagation();
            onSelect("obliques");
          }}
        >
          <boxGeometry args={[0.24, 0.52, 0.14]} />
          <SkinMaterial
            color={col("core")}
            emissiveIntensity={ei("core", "obliques")}
            isSelected={isSel("obliques")}
          />
        </mesh>
      ))}

      {/* ── GLUTEUS MAXIMUS (large organic spheres) ── */}
      {([-1, 1] as const).map((side) => (
        <SphereMesh
          key={`gmax${side}`}
          args={[0.32, 22, 18]}
          position={[side * 0.29, 0.28, -0.3]}
          scale={[1.1, 1.0, 1.0]}
          color={col("glutes")}
          emissiveIntensity={ei("glutes", "gluteus_maximus")}
          isSelected={isSel("gluteus_maximus")}
          isHighlighted={isHi("glutes", "gluteus_maximus")}
          muscleId="gluteus_maximus"
          label="GLUT"
          showLabel={side < 0}
          onClick={onSelect}
        />
      ))}

      {/* ── GLUTEUS MEDIUS ── */}
      {([-1, 1] as const).map((side) => (
        <SphereMesh
          key={`gmed${side}`}
          args={[0.22, 18, 14]}
          position={[side * 0.5, 0.52, -0.12]}
          scale={[1, 0.88, 0.88]}
          color={col("glutes")}
          emissiveIntensity={ei("glutes", "gluteus_medius")}
          isSelected={isSel("gluteus_medius")}
          isHighlighted={isHi("glutes", "gluteus_medius")}
          muscleId="gluteus_medius"
          label="GM"
          showLabel={side < 0}
          onClick={onSelect}
        />
      ))}

      {/* ── QUADRICEPS (4-head thigh mass front) ── */}
      {([-1, 1] as const).map((side) => (
        <LatheMesh
          key={`quad${side}`}
          profile={thighProfile}
          segs={22}
          position={[side * 0.29, -0.2, 0.1]}
          scale={[1, 1, 1]}
          color={col("legs")}
          emissiveIntensity={ei("legs", "quadriceps")}
          isSelected={isSel("quadriceps")}
          isHighlighted={isHi("legs", "quadriceps")}
          muscleId="quadriceps"
          label="QD"
          showLabel
          onClick={onSelect}
        />
      ))}

      {/* ── HAMSTRINGS (posterior thigh) ── */}
      {([-1, 1] as const).map((side) => (
        <LatheMesh
          key={`ham${side}`}
          profile={[
            [0.01, 0],
            [0.17, 0.05],
            [0.19, 0.2],
            [0.185, 0.42],
            [0.165, 0.6],
            [0.13, 0.72],
          ]}
          segs={18}
          position={[side * 0.29, -0.2, -0.2]}
          scale={[0.9, 1, 0.9]}
          color={col("legs")}
          emissiveIntensity={ei("legs", "hamstrings")}
          isSelected={isSel("hamstrings")}
          isHighlighted={isHi("legs", "hamstrings")}
          muscleId="hamstrings"
          label="HAM"
          showLabel={side < 0}
          onClick={onSelect}
        />
      ))}

      {/* ── ADDUCTORS (inner thigh) ── */}
      {([-1, 1] as const).map((side) => (
        // biome-ignore lint/a11y/useKeyWithClickEvents: Three.js mesh is not a DOM element
        <mesh
          key={`add${side}`}
          position={[side * 0.14, -0.42, 0.0]}
          rotation={[0, 0, side * 0.1]}
          castShadow
          onClick={(e) => {
            e.stopPropagation();
            onSelect("adductors");
          }}
        >
          <cylinderGeometry args={[0.12, 0.1, 0.72, 14]} />
          <SkinMaterial
            color={col("legs")}
            emissiveIntensity={ei("legs", "adductors")}
            isSelected={isSel("adductors")}
          />
        </mesh>
      ))}

      {/* ── SHIN (lower leg anterior) ── */}
      {([-1, 1] as const).map((side) => (
        <LatheMesh
          key={`shin${side}`}
          profile={shinProfile}
          segs={16}
          position={[side * 0.28, -1.1, 0.08]}
          color={col("legs")}
          emissiveIntensity={ei("legs", "tibialis_anterior")}
          isSelected={isSel("tibialis_anterior")}
          isHighlighted={isHi("legs", "tibialis_anterior")}
          muscleId="tibialis_anterior"
          label="TA"
          showLabel={side < 0}
          onClick={onSelect}
        />
      ))}

      {/* ── GASTROCNEMIUS / CALVES (diamond-shaped posterior bulge) ── */}
      {([-1, 1] as const).map((side) => (
        <LatheMesh
          key={`calf${side}`}
          profile={calfProfile}
          segs={18}
          position={[side * 0.28, -1.1, -0.1]}
          scale={[1, 1, 1.15]}
          color={col("legs")}
          emissiveIntensity={ei("legs", "gastrocnemius")}
          isSelected={isSel("gastrocnemius")}
          isHighlighted={isHi("legs", "gastrocnemius")}
          muscleId="gastrocnemius"
          label="GA"
          showLabel={side < 0}
          onClick={onSelect}
        />
      ))}

      {/* ── FEET (base) ── */}
      {([-1, 1] as const).map((side) => (
        <mesh
          key={`foot${side}`}
          position={[side * 0.27, -1.75, 0.06]}
          rotation={[0.15, 0, 0]}
          castShadow
        >
          <boxGeometry args={[0.2, 0.12, 0.38]} />
          <meshPhysicalMaterial
            color="#B87050"
            roughness={0.95}
            metalness={0}
          />
        </mesh>
      ))}

      {/* ── SSS overlay on torso ── */}
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.65, 0.55, 1.85, 32]} />
        <SSSOverlay />
      </mesh>
    </group>
  );
}

// ─── Human Body Scene ──────────────────────────────────────────────────────────
function HumanBodyScene({
  selectedMuscle,
  highlightGroup,
  intensity,
  autoRotate,
  onSelect,
  onInteract,
}: {
  selectedMuscle: string | null;
  highlightGroup: string | null;
  intensity: number;
  autoRotate: boolean;
  onSelect: (id: string) => void;
  onInteract: () => void;
}) {
  return (
    <>
      <SceneBackground />
      <AutoRotate active={autoRotate} />

      {/* Studio lighting rig */}
      <ambientLight intensity={0.25} />
      {/* Key light: warm from upper-right front */}
      <directionalLight
        position={[3, 6, 4]}
        intensity={3.5}
        color="#FFF5E0"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.5}
        shadow-camera-far={30}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={8}
        shadow-camera-bottom={-4}
      />
      {/* Fill light: cool from left */}
      <directionalLight position={[-3, 3, 2]} intensity={1.2} color="#E0EEFF" />
      {/* Rim light: from behind — creates dramatic muscle separation */}
      <directionalLight position={[0, 4, -5]} intensity={2.0} color="#FFF8F0" />
      {/* Top-down definition: shoulders, pecs, quads */}
      <spotLight
        position={[0, 8, 0]}
        intensity={1.5}
        angle={0.6}
        penumbra={0.3}
        castShadow={false}
        color="#FFFFFF"
      />
      {/* Under-rim warm bounce */}
      <pointLight position={[0, -1.5, 4]} intensity={0.4} color="#FFD0A0" />

      <OrbitControls
        enableDamping
        dampingFactor={0.08}
        minDistance={3}
        maxDistance={12}
        target={[0, 0.5, 0]}
        onStart={onInteract}
      />

      {/* Ground plane */}
      <mesh
        position={[0, -2.0, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#1a1a1a" roughness={1} metalness={0} />
      </mesh>

      <group onPointerDown={onInteract}>
        <OrganicHumanBody
          selectedMuscle={selectedMuscle}
          highlightGroup={highlightGroup}
          intensity={intensity}
          onSelect={onSelect}
        />
      </group>

      <StaticLabels
        highlightGroup={highlightGroup}
        selectedMuscle={selectedMuscle}
      />
    </>
  );
}

// ─── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
  const [highlightGroup, setHighlightGroup] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(["chest"]),
  );
  const [search, setSearch] = useState("");
  const [intensity, setIntensity] = useState(0.8);
  const [autoRotate, setAutoRotate] = useState(true);
  const [activeNav, setActiveNav] = useState("viewer");
  const autoRotateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedMuscleData =
    ALL_MUSCLES.find((m) => m.id === selectedMuscle) ?? null;

  const handleInteract = useCallback(() => {
    setAutoRotate(false);
    if (autoRotateTimer.current) clearTimeout(autoRotateTimer.current);
    autoRotateTimer.current = setTimeout(() => setAutoRotate(true), 4000);
  }, []);

  useEffect(() => {
    return () => {
      if (autoRotateTimer.current) clearTimeout(autoRotateTimer.current);
    };
  }, []);

  const toggleGroup = (id: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredGroups = MUSCLE_GROUPS.map((g) => ({
    ...g,
    muscles: g.muscles.filter((m) =>
      m.name.toLowerCase().includes(search.toLowerCase()),
    ),
  })).filter((g) => g.muscles.length > 0 || search === "");

  const handleMuscleClick = (id: string) => {
    setSelectedMuscle((prev) => (prev === id ? null : id));
    const group = ALL_MUSCLES.find((m) => m.id === id)?.group ?? null;
    setHighlightGroup(group);
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#111111" }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 shadow-sm"
        style={{ background: "#1a1a1a", borderBottom: "1px solid #2a2a2a" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm"
            style={{ background: "#9B4E2E" }}
          >
            MV
          </div>
          <span
            className="font-bold text-xl tracking-tight text-white"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            MuscleViz
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          {(["viewer", "guide", "muscles", "about"] as const).map((nav) => (
            <button
              type="button"
              key={nav}
              data-ocid={`nav.${nav}.link`}
              onClick={() => setActiveNav(nav)}
              className="px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors"
              style={{
                background: activeNav === nav ? "#2a2a2a" : "transparent",
                color: activeNav === nav ? "#E8A878" : "rgba(255,255,255,0.5)",
              }}
            >
              {nav === "viewer"
                ? "3D Viewer"
                : nav === "guide"
                  ? "Training Guide"
                  : nav === "muscles"
                    ? "Muscle Library"
                    : "About"}
            </button>
          ))}
        </nav>

        <Button
          data-ocid="header.cta.button"
          className="text-white font-semibold px-5"
          style={{ background: "#9B4E2E" }}
          onClick={() => setActiveNav("guide")}
        >
          <Activity className="w-4 h-4 mr-2" />
          Train
        </Button>
      </header>

      <main className="flex-1 flex flex-col">
        {/* ── TRAINING GUIDE TAB ── */}
        {activeNav === "guide" && <TrainingGuide />}
        {/* ── VIEWER / MUSCLES / ABOUT TAB ── */}
        {activeNav !== "guide" && (
          <>
            <section
              className="flex flex-col lg:flex-row gap-4 p-4 lg:p-6"
              style={{ minHeight: "72vh" }}
            >
              {/* Canvas */}
              <div
                className="relative flex-1 rounded-2xl overflow-hidden shadow-xl"
                style={{ background: "#111111", minHeight: "480px" }}
                data-ocid="viewer.canvas_target"
              >
                {/* Controls overlay */}
                <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                  <button
                    type="button"
                    data-ocid="viewer.autorotate.toggle"
                    onClick={() => setAutoRotate((v) => !v)}
                    title={autoRotate ? "Pause rotation" : "Resume rotation"}
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-white/70 hover:text-white transition-colors"
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    <RotateCcw
                      className="w-4 h-4"
                      style={{ opacity: autoRotate ? 1 : 0.4 }}
                    />
                  </button>
                  <button
                    type="button"
                    title="Scroll to zoom"
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-white/50"
                    style={{ background: "rgba(255,255,255,0.06)" }}
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </div>

                {/* Selected muscle badge */}
                <AnimatePresence>
                  {selectedMuscleData && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-4 right-4 z-10 px-3 py-1.5 rounded-full text-sm font-semibold"
                      style={{
                        background:
                          GROUP_UI_COLORS[selectedMuscleData.group] ??
                          "#9B4E2E",
                        color: "#1a1a1a",
                        boxShadow: `0 0 20px ${GROUP_UI_COLORS[selectedMuscleData.group]}80`,
                      }}
                    >
                      {selectedMuscleData.name}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Group color legend */}
                <div className="absolute bottom-4 left-4 z-10 flex flex-wrap gap-1.5">
                  {MUSCLE_GROUPS.map((g) => (
                    <button
                      type="button"
                      key={g.id}
                      data-ocid={`legend.${g.id}.button`}
                      onClick={() => {
                        setHighlightGroup((prev) =>
                          prev === g.id ? null : g.id,
                        );
                        setSelectedMuscle(null);
                      }}
                      className="px-2 py-0.5 rounded-full text-xs font-semibold transition-all"
                      style={{
                        background:
                          highlightGroup === g.id ? g.color : `${g.color}40`,
                        border: `1px solid ${g.color}80`,
                        color: highlightGroup === g.id ? "#1a1a1a" : g.color,
                        boxShadow:
                          highlightGroup === g.id
                            ? `0 0 10px ${g.color}60`
                            : undefined,
                      }}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>

                <Canvas
                  camera={{ position: [2, 1.5, 6], fov: 45 }}
                  shadows
                  gl={{ antialias: true }}
                >
                  <Suspense fallback={null}>
                    <HumanBodyScene
                      selectedMuscle={selectedMuscle}
                      highlightGroup={highlightGroup}
                      intensity={intensity}
                      autoRotate={autoRotate}
                      onSelect={handleMuscleClick}
                      onInteract={handleInteract}
                    />
                  </Suspense>
                </Canvas>
              </div>

              {/* Sidebar */}
              <div
                className="lg:w-80 xl:w-96 rounded-2xl flex flex-col overflow-hidden shadow-xl"
                style={{ background: "#1c1c1c" }}
              >
                <div
                  className="px-5 pt-5 pb-4"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
                >
                  <h2
                    className="text-white font-bold text-lg mb-3"
                    style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                  >
                    Anatomy Explorer
                  </h2>
                  <div className="relative">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                      style={{ color: "rgba(255,255,255,0.4)" }}
                    />
                    <Input
                      data-ocid="sidebar.search_input"
                      placeholder="Search muscles…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9 border-0 text-white placeholder:text-white/30 text-sm"
                      style={{ background: "rgba(255,255,255,0.08)" }}
                    />
                  </div>
                </div>

                <ScrollArea className="flex-1 px-3 py-3">
                  <div className="flex flex-col gap-1">
                    {filteredGroups.map((group) => (
                      <div key={group.id}>
                        <button
                          type="button"
                          data-ocid={`muscle_group.${group.id}.toggle`}
                          onClick={() => toggleGroup(group.id)}
                          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-colors hover:bg-white/5"
                          style={{
                            background:
                              highlightGroup === group.id
                                ? `${group.color}18`
                                : undefined,
                            borderLeft:
                              highlightGroup === group.id
                                ? `3px solid ${group.color}`
                                : "3px solid transparent",
                          }}
                        >
                          <div className="flex items-center gap-2.5">
                            <span
                              className="w-3 h-3 rounded-full flex-shrink-0"
                              style={{ background: group.color }}
                            />
                            <span className="text-sm font-semibold text-white/90">
                              {group.label}
                            </span>
                            <Badge
                              className="text-xs px-1.5 py-0 border-0 text-white/50"
                              style={{ background: "rgba(255,255,255,0.1)" }}
                            >
                              {group.muscles.length}
                            </Badge>
                          </div>
                          {expandedGroups.has(group.id) ? (
                            <ChevronDown className="w-4 h-4 text-white/40" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-white/40" />
                          )}
                        </button>

                        <AnimatePresence>
                          {expandedGroups.has(group.id) && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="pl-6 pr-2 pb-1 flex flex-col gap-0.5">
                                {group.muscles.map((muscle, idx) => (
                                  <button
                                    type="button"
                                    key={muscle.id}
                                    data-ocid={`muscle.item.${idx + 1}`}
                                    onClick={() => handleMuscleClick(muscle.id)}
                                    className="w-full text-left px-3 py-2 rounded-lg text-sm transition-all"
                                    style={{
                                      color:
                                        selectedMuscle === muscle.id
                                          ? group.color
                                          : "rgba(255,255,255,0.65)",
                                      background:
                                        selectedMuscle === muscle.id
                                          ? `${group.color}22`
                                          : "transparent",
                                      fontWeight:
                                        selectedMuscle === muscle.id
                                          ? 600
                                          : 400,
                                    }}
                                  >
                                    {muscle.name}
                                  </button>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {/* Intensity slider */}
                <div
                  className="px-5 py-4"
                  style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-white/50 font-medium">
                      Highlight Intensity
                    </span>
                    <span className="text-xs text-white/50">
                      {Math.round(intensity * 100)}%
                    </span>
                  </div>
                  <Slider
                    data-ocid="sidebar.intensity.slider"
                    min={0}
                    max={1}
                    step={0.05}
                    value={[intensity]}
                    onValueChange={([v]) => setIntensity(v)}
                    className="mb-1"
                  />
                </div>

                {/* Selected Muscle Info */}
                <AnimatePresence>
                  {selectedMuscleData && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="mx-3 mb-3 rounded-xl p-4"
                      style={{
                        background: `${GROUP_UI_COLORS[selectedMuscleData.group]}18`,
                        border: `1px solid ${GROUP_UI_COLORS[selectedMuscleData.group]}44`,
                      }}
                      data-ocid="muscle.info.panel"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{
                            background:
                              GROUP_UI_COLORS[selectedMuscleData.group],
                          }}
                        />
                        <h3 className="text-white font-bold text-sm">
                          {selectedMuscleData.name}
                        </h3>
                      </div>
                      <div className="space-y-1.5 text-xs">
                        <p className="text-white/60">
                          <span className="text-white/40">Origin:</span>{" "}
                          {selectedMuscleData.origin}
                        </p>
                        <p className="text-white/60">
                          <span className="text-white/40">Insertion:</span>{" "}
                          {selectedMuscleData.insertion}
                        </p>
                        <p className="text-white/60">
                          <span className="text-white/40">Function:</span>{" "}
                          {selectedMuscleData.function}
                        </p>
                        <p
                          className="mt-2 px-2 py-1.5 rounded-lg text-white/70 italic"
                          style={{ background: "rgba(255,255,255,0.06)" }}
                        >
                          💡 {selectedMuscleData.tips}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </section>

            {/* Guide Cards */}
            <section className="px-4 lg:px-6 pb-8">
              <div className="flex items-center gap-3 mb-5">
                <BookOpen className="w-5 h-5" style={{ color: "#E8A878" }} />
                <h2
                  className="text-xl font-bold text-white"
                  style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                >
                  Muscle Training Guide
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {GUIDE_CARDS.map((card, i) => (
                  <motion.div
                    key={card.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="rounded-2xl p-5 hover:shadow-md transition-shadow"
                    style={{
                      background: "#1c1c1c",
                      border: "1px solid #2a2a2a",
                    }}
                    data-ocid={`guide.item.${i + 1}`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                        style={{ background: `${card.color}22` }}
                      >
                        {card.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <h3 className="font-bold text-sm text-white/90">
                            {card.title}
                          </h3>
                          <Badge
                            className="text-xs px-2 py-0 font-medium border-0"
                            style={{
                              background: `${card.color}33`,
                              color: card.color,
                            }}
                          >
                            {card.tag}
                          </Badge>
                        </div>
                        <p className="text-sm leading-relaxed text-white/50">
                          {card.desc}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* About section */}
            <AnimatePresence>
              {activeNav === "about" && (
                <motion.section
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mx-4 lg:mx-6 mb-8 rounded-2xl p-8"
                  style={{ background: "#1c1c1c", border: "1px solid #2a2a2a" }}
                  data-ocid="about.panel"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <Info className="w-5 h-5" style={{ color: "#E8A878" }} />
                    <h2
                      className="text-white text-xl font-bold"
                      style={{
                        fontFamily: "'Bricolage Grotesque', sans-serif",
                      }}
                    >
                      About MuscleViz
                    </h2>
                  </div>
                  <p className="text-white/70 leading-relaxed max-w-2xl">
                    MuscleViz is an interactive 3D anatomy explorer designed to
                    help athletes, students, and fitness enthusiasts understand
                    the human muscular system. Click any muscle group in the
                    viewer to highlight it, explore detailed origin/insertion
                    information, and learn science-backed training tips.
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    {[
                      { v: "30+", l: "Muscles" },
                      { v: "8", l: "Muscle Groups" },
                      { v: "3D", l: "Interactive" },
                      { v: "Free", l: "Always" },
                    ].map((s) => (
                      <div
                        key={s.l}
                        className="text-center p-4 rounded-xl"
                        style={{ background: "rgba(255,255,255,0.05)" }}
                      >
                        <div
                          className="text-2xl font-bold"
                          style={{ color: "#E8A878" }}
                        >
                          {s.v}
                        </div>
                        <div className="text-white/50 text-sm mt-0.5">
                          {s.l}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.section>
              )}
            </AnimatePresence>
          </>
        )}{" "}
        {/* end activeNav !== "guide" */}
      </main>

      {/* Footer */}
      <footer
        className="py-5 px-6 text-center text-sm"
        style={{
          background: "#1a1a1a",
          borderTop: "1px solid #2a2a2a",
          color: "rgba(255,255,255,0.35)",
        }}
      >
        © {new Date().getFullYear()}. Built with love using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold"
          style={{ color: "#E8A878" }}
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
