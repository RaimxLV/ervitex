

## Fix Category Filter Icons

### Problem
The category filter uses repetitive icons — many categories share `Shirt`, `Wind`, `Layers`, or fall back to the generic `LayoutGrid` icon. This looks unprofessional, especially on mobile where the horizontal carousel shows the same grid icon repeatedly.

### Solution
Replace the `CATEGORY_ICONS` mapping in `CategoryFilter.tsx` with distinct, semantically appropriate Lucide icons for each category.

### Icon Mapping

| Category Slug | Current Icon | New Icon (Lucide) |
|---|---|---|
| `t-krekli` | Shirt | **Shirt** (keep) |
| `polo-krekli` | Shirt | **Crown** (polo collar distinction) or keep Shirt with different styling |
| `krekli` | Shirt | **Shirt** (keep) |
| `dzemperi-hudiji` | Layers | **Hoodie** — Lucide doesn't have hoodie, use **SwatchBook** or **Pocket** to suggest hoodie/pullover |
| `jakas` | Wind | **JacketIcon** — use **Cloudy** or **Shield** |
| `virsjakas` | Wind | **Mountain** (outdoor jacket) |
| `vestes` | Wind | **Vest** — not in Lucide, use **SquareStack** |
| `softshell` | Wind | **CloudRain** (weather protection) |
| `fleece` | Layers | **Flame** (warmth) |
| `bikses-sorti` | Layers | **Scissors** or **RectangleVertical** — pants silhouette |
| `kleitas-svārki` | Shirt | **Sparkles** or **CircleDot** |
| `cepures` | HardHat | **HardHat** (keep, it's a hat) |
| `šalles-lakati` | Wind | **Ribbon** (scarf-like) |
| `somas` | ShoppingBag | **Backpack** |
| `aksesuari` | ShoppingBag | **Watch** or **Gem** |
| `darba-apgerbi` | HardHat | **Wrench** or **HardHat** with **Hammer** |
| `sportam` | Dumbbell | **Dumbbell** (keep) |
| `berni` | Baby | **Baby** (keep) |
| `lietus-apgerbs` | Umbrella | **Umbrella** (keep) |
| `audumu-maisini` | ShoppingBag | **ShoppingBag** (keep) |
| `dvieli` | Layers | **Droplets** (towels/water) |
| `priekšauti` | Layers | **ChefHat** (apron context) |

**Better approach**: Since many garment-specific icons aren't in Lucide, I'll use the best available distinct icons and ensure no two adjacent categories in the carousel share the same icon. The key changes:

- `polo-krekli` → `Contact` (collar silhouette)
- `dzemperi-hudiji` → `Pocket` (hoodie pocket)  
- `bikses-sorti` → `Footprints` or custom — actually use `RectangleVertical` for pants shape
- `virsjakas` → `ShieldCheck` (protection/outdoor)
- `jakas` → `CloudSnow` (weather jacket)
- `aksesuari` → `Gem`
- `šalles-lakati` → `Ribbon`  
- `dvieli` → `Droplets`
- `priekšauti` → `ChefHat`
- `fleece` → `Flame`
- `softshell` → `Shield`
- `vestes` → `Zap`
- `kleitas-svārki` → `Sparkles`
- `darba-apgerbi` → `Hammer`
- `somas` → `Backpack`

### File Changed
**`src/components/catalog/CategoryFilter.tsx`** — Update imports and `CATEGORY_ICONS` map only. No structural/layout changes needed since the carousel and sidebar already work correctly per the screenshot.

### Styling
No changes needed — active state (red bg, white text/icon) and inactive state (light border, hover red outline) are already implemented correctly as shown in the screenshot.

