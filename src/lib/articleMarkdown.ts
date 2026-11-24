export type ArticleHeading = {
  id: string;
  level: 2 | 3;
  text: string;
};

export type InlineNode =
  | { type: "text"; value: string }
  | { type: "bold"; value: string }
  | { type: "link"; href: string; value: string }
  | { type: "image"; alt: string; src: string };

export type ArticleBlock =
  | { type: "heading"; id: string; level: 2 | 3; text: string }
  | { type: "paragraph"; inlines: InlineNode[] }
  | { type: "list"; ordered: boolean; items: InlineNode[][] }
  | { type: "quote"; inlines: InlineNode[] }
  | { type: "image"; alt: string; src: string };

export type ParsedArticle = {
  blocks: ArticleBlock[];
  toc: ArticleHeading[];
};

const headingPattern = /^(#{2,3})\s+(.+)$/;
const unorderedPattern = /^[-*]\s+(.+)$/;
const orderedPattern = /^\d+\.\s+(.+)$/;
const quotePattern = /^>\s?(.*)$/;
const imageLinePattern = /^!\[([^\]]*)\]\((.+)\)\s*$/;

export const isSafeUrl = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return false;
  try {
    const url = new URL(trimmed, "https://example.invalid");
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
};

const slugify = (text: string, used: Map<string, number>) => {
  const base =
    text
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\p{L}\p{N}-]+/gu, "") || "section";
  const count = used.get(base) ?? 0;
  used.set(base, count + 1);
  return count === 0 ? base : `${base}-${count + 1}`;
};

export const parseInlines = (text: string): InlineNode[] => {
  const nodes: InlineNode[] = [];
  const token = /\*\*(.+?)\*\*|!\[([^\]]*)\]\(([^)]+)\)|\[([^\]]+)\]\(([^)]+)\)/g;
  let lastIndex = 0;
  let match = token.exec(text);
  while (match) {
    if (match.index > lastIndex) {
      nodes.push({ type: "text", value: text.slice(lastIndex, match.index) });
    }
    if (match[0].startsWith("**") && match[1] !== undefined) {
      nodes.push({ type: "bold", value: match[1] });
    } else if (match[0].startsWith("![")) {
      const src = (match[3] ?? "").trim();
      if (isSafeUrl(src)) nodes.push({ type: "image", alt: match[2] ?? "", src });
    } else {
      const href = (match[5] ?? "").trim();
      if (isSafeUrl(href)) nodes.push({ type: "link", href, value: match[4] ?? "" });
      else nodes.push({ type: "text", value: match[4] ?? "" });
    }
    lastIndex = match.index + match[0].length;
    match = token.exec(text);
  }
  if (lastIndex < text.length) nodes.push({ type: "text", value: text.slice(lastIndex) });
  return nodes.length > 0 ? nodes : [{ type: "text", value: "" }];
};

const flushParagraph = (lines: string[], blocks: ArticleBlock[]) => {
  const text = lines.join(" ").trim();
  if (!text) return;
  blocks.push({ type: "paragraph", inlines: parseInlines(text) });
  lines.length = 0;
};

export const parseArticleMarkdown = (source: string): ParsedArticle => {
  const lines = source.replaceAll("\r\n", "\n").split("\n");
  const blocks: ArticleBlock[] = [];
  const usedIds = new Map<string, number>();
  const paragraph: string[] = [];

  for (let index = 0; index < lines.length; ) {
    const line = lines[index];
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph(paragraph, blocks);
      index += 1;
      continue;
    }

    const heading = trimmed.match(headingPattern);
    if (heading) {
      flushParagraph(paragraph, blocks);
      const level = heading[1].length === 3 ? 3 : 2;
      const text = heading[2].trim();
      blocks.push({ type: "heading", id: slugify(text, usedIds), level, text });
      index += 1;
      continue;
    }

    const imageLine = trimmed.match(imageLinePattern);
    if (imageLine) {
      const src = imageLine[2].trim();
      flushParagraph(paragraph, blocks);
      if (isSafeUrl(src)) blocks.push({ type: "image", alt: imageLine[1], src });
      index += 1;
      continue;
    }

    const quote = trimmed.match(quotePattern);
    if (quote) {
      flushParagraph(paragraph, blocks);
      const quoted: string[] = [];
      while (index < lines.length) {
        const next = lines[index].trim().match(quotePattern);
        if (!next) break;
        quoted.push(next[1]);
        index += 1;
      }
      blocks.push({ type: "quote", inlines: parseInlines(quoted.join(" ").trim()) });
      continue;
    }

    const unordered = trimmed.match(unorderedPattern);
    const ordered = trimmed.match(orderedPattern);
    if (unordered || ordered) {
      flushParagraph(paragraph, blocks);
      const isOrdered = Boolean(ordered);
      const items: InlineNode[][] = [];
      while (index < lines.length) {
        const nextTrimmed = lines[index].trim();
        const next = isOrdered
          ? nextTrimmed.match(orderedPattern)
          : nextTrimmed.match(unorderedPattern);
        if (!next) break;
        items.push(parseInlines(next[1]));
        index += 1;
      }
      blocks.push({ type: "list", ordered: isOrdered, items });
      continue;
    }

    paragraph.push(trimmed);
    index += 1;
  }

  flushParagraph(paragraph, blocks);

  const toc = blocks
    .filter((block): block is Extract<ArticleBlock, { type: "heading" }> => block.type === "heading")
    .map(({ id, level, text }) => ({ id, level, text }));

  return { blocks, toc };
};

export const insertAtCursor = (value: string, start: number, end: number, insertion: string) => {
  const from = Math.max(0, Math.min(start, value.length));
  const to = Math.max(from, Math.min(end, value.length));
  return {
    value: `${value.slice(0, from)}${insertion}${value.slice(to)}`,
    caret: from + insertion.length,
  };
};

export const isInternalCareerArticle = (article: {
  source_type?: "internal" | "external";
  content: string;
}) => article.source_type !== "external" && Boolean(article.content.trim());

export type ArticleCoverImage = {
  alt: string;
  src: string;
};

export const extractArticleCover = (source: string): ArticleCoverImage | null => {
  const { blocks } = parseArticleMarkdown(source);
  const image = blocks.find(
    (block): block is Extract<ArticleBlock, { type: "image" }> => block.type === "image",
  );
  return image ? { alt: image.alt, src: image.src } : null;
};

export const hasLeadingArticleImage = (source: string) =>
  parseArticleMarkdown(source).blocks[0]?.type === "image";
