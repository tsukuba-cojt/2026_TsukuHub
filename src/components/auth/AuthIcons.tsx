import { LockKeyhole, Mail } from "lucide-react";

// Figma: Login #970:3648 → 22×17px, NeutralGray #B6BFD4
export function MailIcon({
  width = 22,
  height = 17,
  color = "#B6BFD4",
}: {
  width?: number;
  height?: number;
  color?: string;
}) {
  return (
    <span
      style={{ display: "inline-flex", alignItems: "center", flexShrink: 0 }}
      aria-hidden="true"
    >
      <Mail width={width} height={height} color={color} />
    </span>
  );
}

// Figma: Login #970:3656 → 19×21px, NeutralGray #B6BFD4
export function LockIcon({
  width = 19,
  height = 21,
  color = "#B6BFD4",
}: {
  width?: number;
  height?: number;
  color?: string;
}) {
  return (
    <span
      style={{ display: "inline-flex", alignItems: "center", flexShrink: 0 }}
      aria-hidden="true"
    >
      <LockKeyhole width={width} height={height} color={color} />
    </span>
  );
}
