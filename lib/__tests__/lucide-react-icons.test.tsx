import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  BotCheck,
  Cinema,
  Doghouse,
  HandTruck,
  NigerianNaira,
  StrokeWidth,
  WarehouseWaves,
} from "lucide-react";

/**
 * Guards the lucide-react 1.74.0 upgrade: the icon resources added in that
 * release must be exported by the installed package and render as SVGs.
 */
describe("lucide-react 1.74.0 icon resources", () => {
  const addedIcons = {
    BotCheck,
    Cinema,
    Doghouse,
    HandTruck,
    NigerianNaira,
    StrokeWidth,
    WarehouseWaves,
  };

  it("exports the new icons and renders them", () => {
    for (const Icon of Object.values(addedIcons)) {
      expect(Icon).toBeDefined();
      expect(renderToStaticMarkup(<Icon />)).toContain("<svg");
    }
  });
});
