import MailSvgRaw from "../../assets/Globalnav/MailMono.svg?raw";
import KeySvgRaw from "../../assets/Signup/Key.svg?raw";

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
  const svg = MailSvgRaw
    .replace(/\bwidth="[^"]*"/, `width="${width}"`)
    .replace(/\bheight="[^"]*"/, `height="${height}"`)
    .replace(/fill="(?!none)[^"]*"/g, `fill="${color}"`);
  return (
    <span
      dangerouslySetInnerHTML={{ __html: svg }}
      style={{ display: "inline-flex", alignItems: "center", flexShrink: 0 }}
      aria-hidden="true"
    />
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
  const svg = KeySvgRaw
    .replace(/\bwidth="[^"]*"/, `width="${width}"`)
    .replace(/\bheight="[^"]*"/, `height="${height}"`)
    .replace(/fill="(?!none)[^"]*"/g, `fill="${color}"`);
  return (
    <span
      dangerouslySetInnerHTML={{ __html: svg }}
      style={{ display: "inline-flex", alignItems: "center", flexShrink: 0 }}
      aria-hidden="true"
    />
  );
}
