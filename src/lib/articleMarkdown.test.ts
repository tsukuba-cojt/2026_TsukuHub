import { describe, expect, it } from "vitest";
import {
  extractArticleCover,
  hasLeadingArticleImage,
  insertAtCursor,
  isInternalCareerArticle,
  isSafeUrl,
  parseArticleMarkdown,
} from "./articleMarkdown";

describe("articleMarkdown", () => {
  it("段落の間に画像を置き、見出しidを目次と揃える", () => {
    const parsed = parseArticleMarkdown(`導入の文章です。

![説明](https://example.com/a.png)

## 長期インターンとは

本文です。

### 魅力1

続きです。`);

    expect(parsed.blocks.map((block) => block.type)).toEqual([
      "paragraph",
      "image",
      "heading",
      "paragraph",
      "heading",
      "paragraph",
    ]);
    expect(parsed.blocks[1]).toMatchObject({
      type: "image",
      alt: "説明",
      src: "https://example.com/a.png",
    });
    expect(parsed.toc).toEqual([
      { id: "長期インターンとは", level: 2, text: "長期インターンとは" },
      { id: "魅力1", level: 3, text: "魅力1" },
    ]);
    expect(parsed.blocks[2]).toMatchObject({ id: parsed.toc[0].id, text: "長期インターンとは" });
  });

  it("同じ見出しは連番のidにする", () => {
    const parsed = parseArticleMarkdown("## まとめ\n\n## まとめ");
    expect(parsed.toc.map((item) => item.id)).toEqual(["まとめ", "まとめ-2"]);
  });

  it("javascript URLの画像とリンクを捨てる", () => {
    expect(isSafeUrl("javascript:alert(1)")).toBe(false);
    const parsed = parseArticleMarkdown(
      "![x](javascript:alert(1))\n\n[危険](javascript:foo) と [安全](https://example.com)",
    );
    expect(parsed.blocks.some((block) => block.type === "image")).toBe(false);
    const paragraph = parsed.blocks.find((block) => block.type === "paragraph");
    expect(paragraph?.type === "paragraph" && paragraph.inlines).toEqual([
      { type: "text", value: "危険" },
      { type: "text", value: " と " },
      { type: "link", href: "https://example.com", value: "安全" },
    ]);
  });

  it("カーソル位置にMarkdownを差し込む", () => {
    const insertion = "![図](https://example.com/a.png)";
    expect(insertAtCursor("前あと", 1, 1, insertion)).toEqual({
      value: `前${insertion}あと`,
      caret: 1 + insertion.length,
    });
  });

  it("内部記事かどうかを本文で判定する", () => {
    expect(isInternalCareerArticle({ source_type: "internal", content: "## 見出し" })).toBe(true);
    expect(isInternalCareerArticle({ source_type: "external", content: "" })).toBe(false);
  });

  it("先頭画像をカバーとして取り出す", () => {
    const source = `![見出し画像](https://example.com/cover.png)

## 本文`;
    expect(extractArticleCover(source)).toEqual({
      alt: "見出し画像",
      src: "https://example.com/cover.png",
    });
    expect(hasLeadingArticleImage(source)).toBe(true);
  });

  it("途中の画像もカバー候補にするが先頭扱いにはしない", () => {
    const source = `導入です。

![図](https://example.com/mid.png)`;
    expect(extractArticleCover(source)).toEqual({
      alt: "図",
      src: "https://example.com/mid.png",
    });
    expect(hasLeadingArticleImage(source)).toBe(false);
  });
});
