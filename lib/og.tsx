import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { siteName } from "./site";

export const ogSize = { width: 1200, height: 630 };

function titleSize(title: string) {
  if (title.length <= 30) return 76;
  if (title.length <= 60) return 60;
  return 48;
}

export async function ogImage({
  title,
  subtitle,
  label,
  date,
}: {
  title: string;
  subtitle?: string;
  label?: string;
  date?: string;
}) {
  const [regular, bold, photo] = await Promise.all([
    readFile(path.join(process.cwd(), "assets/fonts/SourceCodePro-Regular.ttf")),
    readFile(path.join(process.cwd(), "assets/fonts/SourceCodePro-Bold.ttf")),
    readFile(path.join(process.cwd(), "public/me-small.jpg")),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "white",
          color: "black",
          fontFamily: "Source Code Pro",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 32, color: "#4b5563" }}>
          <span>ilia@home:$</span>
          {label && <span>{label}</span>}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: titleSize(title), fontWeight: 700, lineHeight: 1.15 }}>{title}</div>
          {subtitle && <div style={{ fontSize: 36, color: "#4b5563" }}>{subtitle}</div>}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse renders plain img only. */}
            <img
              src={`data:image/jpeg;base64,${photo.toString("base64")}`}
              width={88}
              height={88}
              style={{ borderRadius: 44 }}
              alt=""
            />
            <span style={{ fontWeight: 700 }}>{siteName}</span>
          </div>
          {date && <span style={{ color: "#4b5563" }}>{date}</span>}
        </div>
      </div>
    ),
    {
      ...ogSize,
      fonts: [
        { name: "Source Code Pro", data: regular, weight: 400, style: "normal" },
        { name: "Source Code Pro", data: bold, weight: 700, style: "normal" },
      ],
    },
  );
}
