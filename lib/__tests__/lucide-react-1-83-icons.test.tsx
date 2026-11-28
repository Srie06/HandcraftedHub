import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  Balcony,
  BoxingGlove,
  ChevronsDownUpOffset,
  ChevronsRightLeftOffset,
  MailSend,
  SquareTextAlignBottomCenter,
  SquareTextAlignBottomLeft,
  SquareTextAlignBottomRight,
  StairsArrowDownLeft,
  StairsArrowUpRight,
} from "lucide-react";

/**
 * Guards the lucide-react 1.83.0 upgrade: the icon resources added in that
 * release must be exported by the installed package and render as SVGs.
 * None of these names exist in 1.74.0, so this test fails before the bump.
 */
describe("lucide-react 1.83.0 icon resources", () => {
  const addedIcons = {
    Balcony,
    BoxingGlove,
    ChevronsDownUpOffset,
    ChevronsRightLeftOffset,
    MailSend,
    SquareTextAlignBottomCenter,
    SquareTextAlignBottomLeft,
    SquareTextAlignBottomRight,
    StairsArrowDownLeft,
    StairsArrowUpRight,
  };

  it("exports the new icons and renders them", () => {
    for (const Icon of Object.values(addedIcons)) {
      expect(Icon).toBeDefined();
      expect(renderToStaticMarkup(<Icon />)).toContain("<svg");
    }
  });
});
