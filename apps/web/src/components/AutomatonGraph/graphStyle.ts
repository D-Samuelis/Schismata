// apps/web/src/components/AutomatonGraph/graphStyle.ts

import type cytoscape from "cytoscape";
import type { ThemeColors } from "../../theme/themes";

const MONO = '"Cascadia Code", "JetBrains Mono", Consolas, monospace';

export function buildGraphStyle(c: ThemeColors): cytoscape.StylesheetJson {
  return [
    {
      selector: "node",
      style: {
        label: "data(id)",
        "text-valign": "center",
        "text-halign": "center",
        color: c.accentForeground,
        "font-family": MONO,
        "font-size": 12,
        width: 38,
        height: 38,
        "background-color": c.accent,
        "border-width": 2,
        "border-color": c.foreground,
        "border-opacity": 0.25,
        "underlay-color": c.warning,
        "underlay-opacity": 0,
        "underlay-padding": 7,
        "transition-property": "background-color, underlay-opacity",
        "transition-duration": 150,
      },
    },
    {
      // double ring = accepting state
      selector: "node.accept",
      style: {
        "border-style": "double",
        "border-width": 6,
        "border-color": c.foreground,
        "border-opacity": 1,
      },
    },
    {
      selector: "node.start",
      style: {
        "border-width": 4,
        "border-color": c.success,
        "border-opacity": 1,
      },
    },
    {
      // currently executing state
      selector: "node.active",
      style: {
        "background-color": c.warning,
        color: "#1b1b1b",
        "underlay-opacity": 0.3,
      },
    },
    {
      selector: "node:selected",
      style: {
        "border-color": c.accent,
        "border-opacity": 1,
        "border-width": 4,
      },
    },
    {
      selector: "edge",
      style: {
        label: "data(label)",
        width: 1.5,
        "line-color": c.mutedForeground,
        "target-arrow-color": c.mutedForeground,
        "target-arrow-shape": "triangle",
        "curve-style": "bezier",
        "control-point-step-size": 40,
        "arrow-scale": 1.1,
        color: c.foreground,
        "font-family": MONO,
        "font-size": 11,
        "text-rotation": "autorotate",
        "text-background-color": c.background,
        "text-background-opacity": 0.9,
        "text-background-padding": 3,
        "text-background-shape": "roundrectangle",
      },
    },
    {
      selector: "edge:selected",
      style: {
        "line-color": c.accent,
        "target-arrow-color": c.accent,
      },
    },

    // cytoscape-edgehandles (replaced stylesheet drops its built-in defaults)
    {
      selector: ".eh-handle",
      style: {
        "background-color": c.accent,
        width: 12,
        height: 12,
        shape: "ellipse",
        "overlay-opacity": 0,
        "border-width": 12,
        "border-opacity": 0,
      },
    },
    {
      selector: ".eh-hover",
      style: { "background-color": c.accent },
    },
    {
      selector: ".eh-source",
      style: {
        "border-width": 2,
        "border-color": c.accent,
        "border-opacity": 1,
      },
    },
    {
      selector: ".eh-target",
      style: {
        "border-width": 2,
        "border-color": c.success,
        "border-opacity": 1,
      },
    },
    {
      selector: ".eh-preview, .eh-ghost-edge",
      style: {
        "background-color": c.accent,
        "line-color": c.accent,
        "target-arrow-color": c.accent,
        "source-arrow-color": c.accent,
        "line-style": "dashed",
      },
    },
    {
      selector: ".eh-ghost-edge.eh-preview-active",
      style: { opacity: 0 },
    },
  ] as cytoscape.StylesheetJson;
}
