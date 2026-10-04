import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { site } from "@/content/site";

// The preview card when the site is shared in Slack, iMessage, X or LinkedIn.
export const alt = `${site.name}: ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const star = await readFile(join(process.cwd(), "src/app/og/star.jpg"));
  const src = `data:image/jpeg;base64,${star.toString("base64")}`;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#020306",
          color: "#ededed",
          padding: 72,
          position: "relative",
        }}
      >
        <img src={src} alt="" width={620} height={620} style={{ position: "absolute", right: -20, top: 5 }} />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 640 }}>
          <div style={{ display: "flex", fontSize: 24, letterSpacing: 4, color: "#8c8c8c" }}>
            STUDIO <span style={{ color: "#ff1f1f", marginLeft: 10 }}>DEADZOLT</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 68, lineHeight: 1.05, letterSpacing: -2 }}>{site.tagline}</div>
            <div style={{ fontSize: 28, color: "#8c8c8c", marginTop: 24 }}>
              Launch films, product animation and social content for startups and brands.
            </div>
          </div>
          <div style={{ display: "flex", fontSize: 24, color: "#ededed" }}>
            {site.cta} · deadzolt.studio
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
