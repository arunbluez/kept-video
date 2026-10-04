import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { PAGES, PageView, type PageId } from "./pages";

/** QA composition: every sample page at once, for a quick visual check. */
export const PageSheet: React.FC = () => {
  const f = useCurrentFrame();
  const ids = Object.keys(PAGES) as PageId[];
  return (
    <AbsoluteFill style={{ background: "#333", display: "flex", flexWrap: "wrap", gap: 12, padding: 12 }}>
      {ids.map((id) => (
        <PageView key={id} id={id} f={f} width={460} />
      ))}
    </AbsoluteFill>
  );
};
