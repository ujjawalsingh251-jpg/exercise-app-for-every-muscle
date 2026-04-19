# Design Brief

## Visual Direction
Clinical educational fitness guide merging 3D anatomy with training content. Dark clinical background, pastel muscle colors, tabbed navigation separating 3D viewer from exercise/recovery library. Precision, educational authority, premium finish.

## Tone & Differentiation
Minimalist clinical precision extended to exercise education. Pastel anatomy on dark creates "medical reference poster" → training cards inherit this aesthetic with SVG step illustrations and nutrition data. Consistent palette unifies 3D viewer + training guide as single cohesive system.

## Color Palette

| Token                | OKLCH              | RGB           | Purpose                            |
| -------------------- | ------------------ | ------------- | ---------------------------------- |
| background           | 0.17 0 0           | #2a2a2a       | Dark charcoal app background       |
| foreground           | 0.93 0.005 0       | #efefef       | Light text readability             |
| primary (chest)      | 0.82 0.05 345      | #e8b4c8       | Chest exercises, primary CTA       |
| secondary (shoulder) | 0.78 0.065 280     | #d8b8e8       | Shoulder/recovery emphasis         |
| accent (arms/legs)   | 0.85 0.06 165      | #b8e8c8       | Arm/leg exercises, accent UI       |
| chart-4 (nutrition)  | 0.84 0.055 80      | #d8e8b8       | Macro cards, connective elements   |
| chart-5 (beige)      | 0.85 0.058 55      | #e8d8c8       | Recovery section, warmth           |
| sidebar              | 0.15 0.005 220     | #1a1f2e       | Sidebar background (unchanged)     |
| border               | 0.26 0 0           | #434343       | Card and section dividers           |

## Typography
**Display**: Bricolage Grotesque (600 weight, -0.02em tracking) — sectional headings, exercise titles  
**Body**: Figtree (400 weight) — instructions, macro values, recovery descriptions  
**Mono**: System monospace for abbreviation labels in 3D viewer

## Shape Language
`border-radius: 0.375rem` — minimal sharp corners. Card borders use `border` token (0.26 L). Exercise step badges use primary color.

## Structural Zones

| Zone              | Treatment                              | Purpose                         |
| ----------------- | -------------------------------------- | ------------------------------- |
| Tab Navigation    | Foreground text, primary bottom border | Toggle 3D Viewer ↔ Training     |
| Exercise Cards    | bg-card border, pastel muscle accent   | Grouped by muscle (chest, etc)  |
| SVG Illustrations | Inline, max-width constrained          | Step-by-step exercise visuals   |
| Nutrition Cards   | chart-4/chart-5 accent, compact grid   | Macro data, calorie targets     |
| Recovery Section  | chart-5 accent, spacious layout        | Stretching guides + rest tips   |

## Semantic Components
- **Guide cards**: `bg-card border-border` with hover state (`border-primary/50`)
- **Exercise steps**: Numbered badges (primary color), SVG illustrations, text instructions
- **Nutrition data**: `nutrition-card` grid layout, label + value hierarchy
- **Recovery items**: Bordered list, secondary accent dividers
- **Tab bar**: Active tab has primary bottom border, inactive text muted

## Motion & Animation
No entrance animations on cards. Smooth hover state on card borders (`transition-all`). Tab switching instant, no slide animations.

## Constraints
- SVG illustrations inline, no external image files
- Max card width 28rem to prevent sprawl on ultrawide screens
- No decorative gradients, blur, or glass-morphism
- Pastel accent system reused from 3D viewer colors (anatomical consistency)
- All colors use OKLCH CSS variables (except inline SVG fills)

## Signature Detail
Training guide inherits anatomical pastel color system from 3D viewer, creating visual continuity — exercise card for chest muscles uses primary pink, shoulder exercises use secondary purple. SVG step illustrations provide step-by-step procedural clarity without external assets.
