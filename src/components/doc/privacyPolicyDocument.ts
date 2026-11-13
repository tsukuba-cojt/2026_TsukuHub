const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const formatInline = (value: string) =>
  escapeHtml(value).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

const markdownToBody = (source: string) => {
  const lines = source.replaceAll("\r\n", "\n").split("\n");
  const blocks: string[] = [];

  for (let index = 0; index < lines.length;) {
    const line = lines[index];
    const trimmed = line.trim();

    if (!trimmed) {
      index += 1;
      continue;
    }

    const documentTitle = trimmed.match(/^#\s+(.+)$/);
    if (documentTitle) {
      blocks.push(`<h1>${formatInline(documentTitle[1])}</h1>`);
      index += 1;
      continue;
    }

    const heading = trimmed.match(/^##\s+(.+)$/);
    if (heading) {
      blocks.push(`<h2>${formatInline(heading[1])}</h2>`);
      index += 1;
      continue;
    }

    const orderedItem = trimmed.match(/^\d+\.\s+(.+)$/);
    if (orderedItem) {
      const items: string[] = [];

      while (index < lines.length) {
        const current = lines[index].trim().match(/^\d+\.\s+(.+)$/);
        if (!current) break;

        const nestedItems: string[] = [];
        index += 1;
        while (index < lines.length) {
          const nested = lines[index].match(/^\s+[-*]\s+(.+)$/);
          if (!nested) break;
          nestedItems.push(`<li>${formatInline(nested[1])}</li>`);
          index += 1;
        }

        items.push(
          `<li>${formatInline(current[1])}${
            nestedItems.length ? `<ul>${nestedItems.join("")}</ul>` : ""
          }</li>`,
        );
      }

      blocks.push(`<ol>${items.join("")}</ol>`);
      continue;
    }

    blocks.push(`<p>${formatInline(trimmed)}</p>`);
    index += 1;
  }

  return blocks.join("\n");
};

export const buildPrivacyPolicyDocument = (source: string) => {
  if (/^\s*(?:<!doctype\s+html|<html[\s>])/i.test(source)) return source;

  return `<!doctype html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    :root { color-scheme: light; }
    * { box-sizing: border-box; }
    body {
      max-width: 760px;
      margin: 0 auto;
      padding: 32px 34px 48px;
      color: #102033;
      background: #fff;
      font-family: "Noto Sans JP", "Yu Gothic", "Meiryo", sans-serif;
      font-size: 14px;
      line-height: 1.9;
    }
    h1 {
      margin: 0 0 24px;
      color: #0d2e61;
      font-size: 25px;
      line-height: 1.45;
    }
    h2 {
      margin: 34px 0 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid #dce6f4;
      color: #0d2e61;
      font-size: 19px;
      line-height: 1.5;
    }
    h2:first-of-type { margin-top: 28px; }
    p { margin: 0 0 14px; }
    ol, ul { margin: 0 0 18px; padding-left: 1.8em; }
    li { margin: 5px 0; }
    li ul { margin: 7px 0 10px; }
    strong { font-weight: 700; }
    @media (max-width: 600px) {
      body { padding: 24px 20px 40px; font-size: 13px; }
      h1 { font-size: 21px; }
      h2 { margin-top: 28px; font-size: 17px; }
    }
  </style>
</head>
<body>
${markdownToBody(source)}
</body>
</html>`;
};
