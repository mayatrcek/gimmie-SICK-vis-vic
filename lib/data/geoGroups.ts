// Simplified seabed-habitat groups + classifier (ported from app.js).
export type GeoGroup = { col: string; name: string; desc: string };

export const GEO_GROUPS: GeoGroup[] = [
  { col: "#8a3b3b", name: "Reef & rocky bottom", desc: "Hard rock, ledges and boulders — prime reef habitat." },
  { col: "#39b54a", name: "Seagrass meadow", desc: "Underwater grass beds — nurseries for fish, squid & whiting." },
  { col: "#2e7d6b", name: "Kelp & seaweed", desc: "Macroalgae and kelp growing on reef." },
  { col: "#e6a6b8", name: "Sponge gardens & filter feeders", desc: "Sponges, sea squirts and lace corals, often on deeper reef." },
  { col: "#9aa0a8", name: "Shellfish & invertebrates", desc: "Shell beds and mixed bottom-dwelling life." },
  { col: "#6a3d9a", name: "Urchin barren", desc: "Reef grazed bare by sea urchins." },
  { col: "#cdb98c", name: "Sand & mud", desc: "Open soft bottom — sand, mud and shell grit." },
  { col: "#3b6f9e", name: "Other marine life", desc: "Microbial mats and mixed seabed communities." },
];

export function classifyHab(raw: string | null): GeoGroup | null {
  if (!raw) return null;
  const s = ("" + raw).toLowerCase();
  const h = (w: string) => s.indexOf(w) >= 0;
  if (h("seagrass")) return GEO_GROUPS[1];
  if (h("urchin")) return GEO_GROUPS[5];
  if (h("macroalg") || h("kelp") || h("macrophyt") || h("vegetation") || h("algae")) return GEO_GROUPS[2];
  if (h("sponge") || h("bryozoan") || h("ascidian") || h("filter feeder")) return GEO_GROUPS[3];
  if (h("shell") || h("invertebrate") || h("bioturbat")) return GEO_GROUPS[4];
  if (h("reef") || h("hard") || h("rock") || h("bedrock") || h("boulder") || h("consolidat")) return GEO_GROUPS[0];
  if (h("sand") || h("mud") || h("soft") || h("unconsolidat") || h("gravel") || h("sediment")) return GEO_GROUPS[6];
  if (h("coral")) return { col: "#d24dbb", name: "Coral / tropical biota", desc: "Coral community (uncommon this far south)." };
  return GEO_GROUPS[7];
}

// Pull a meaningful habitat label out of a GetFeatureInfo feature list.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function habFromFeatures(feats: any[]): string | null {
  if (!feats || !feats.length) return null;
  const bad = ["habitat map", "statewide", "seamap", "dataset", "source", "survey", "program", "method", "version", "classification scheme"];
  const looksBad = (v: string) => bad.some((b) => v.toLowerCase().indexOf(b) >= 0);
  const bio = ["seagrass", "macroalg", "kelp", "macrophyt", "vegetation", "algae", "sponge", "bryozoan", "ascidian", "filter feeder", "shell", "invertebrate", "urchin", "coral", "bioturbat"];
  const sub = ["reef", "bedrock", "boulder", "rock", "hard substrat", "soft substrat", "substrat", "sand", "mud", "gravel", "sediment", "consolidat"];
  const gen = ["biota"];
  function scan(words: string[]): string | null {
    for (const f of feats) {
      const p = f.properties || {};
      for (const k in p) {
        const v = p[k];
        if (typeof v === "string" && v.length > 1 && !looksBad(v)) {
          const lv = v.toLowerCase();
          for (const w of words) if (lv.indexOf(w) >= 0) return v;
        }
      }
    }
    return null;
  }
  return scan(bio) || scan(sub) || scan(gen);
}
