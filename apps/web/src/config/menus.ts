// apps/web/src/config/menus.ts

/**
 * This file defines the menu structure for the application.
 * Each menu is represented by a MenuDef object, which contains a label and an array of MenuItem objects.
 * MenuItem can be a command, a separator, or a submenu.
 * The buildMenus function constructs the complete menu structure based on the defined commands and themes.
 */

import { AUTOMATON_MODES } from "./automatonModes";
import { THEMES } from "../theme/themes";

export type MenuItem =
  | { type: "command"; id: string; label?: string }
  | { type: "separator" }
  | { type: "submenu"; label: string; items: MenuItem[] };

export interface MenuDef {
  label: string;
  items: MenuItem[];
}

const cmd = (id: string, label?: string): MenuItem => ({
  type: "command",
  id,
  label,
});
const SEP: MenuItem = { type: "separator" };

export function buildMenus(): MenuDef[] {
  return [
    {
      label: "File",
      items: [
        cmd("file.new"),
        cmd("file.import"),
        cmd("file.export"),
        SEP,
        cmd("file.convertToDfa"),
      ],
    },
    { label: "Edit", items: [cmd("edit.undo"), cmd("edit.redo")] },
    {
      label: "Tools",
      items: [
        cmd("tool.select"),
        cmd("tool.addState"),
        cmd("tool.addTransition"),
        cmd("tool.delete"),
      ],
    },
    {
      label: "View",
      items: [
        cmd("view.panel.graph"),
        cmd("view.panel.tape"),
        cmd("view.panel.formalDefinition"),
        cmd("view.panel.transitionTable"),
        SEP,
        cmd("view.regex"),
        SEP,
        cmd("view.resetLayout"),
        SEP,
        {
          type: "submenu",
          label: "Color Theme",
          items: THEMES.map((t) => cmd(`theme.${t.id}`)),
        },
      ],
    },
    /* {
      label: "Go",
      items: Object.keys(AUTOMATON_MODES).map((id) => cmd(`go.${id}`)),
    }, */
    {
      label: "Run",
      items: [
        cmd("run.step"),
        cmd("run.play"),
        cmd("run.pause"),
        cmd("run.reset"),
      ],
    },
    {
      label: "Help",
      items: [cmd("help.shortcuts"), cmd("help.about")],
    },
  ];
}
