import { parseArticleMarkdown } from "../../lib/articleMarkdown";
import ArticleInline from "./ArticleInline";

type ArticleMarkdownProps = {
  source: string;
  skipLeadingImage?: boolean;
};

export default function ArticleMarkdown({
  source,
  skipLeadingImage = false,
}: ArticleMarkdownProps) {
  const parsed = parseArticleMarkdown(source);
  const blocks =
    skipLeadingImage && parsed.blocks[0]?.type === "image"
      ? parsed.blocks.slice(1)
      : parsed.blocks;
  if (blocks.length === 0) return null;

  return (
    <div className="articleMarkdown">
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          const HeadingTag = block.level === 3 ? "h3" : "h2";
          return (
            <HeadingTag id={block.id} key={block.id}>
              {block.text}
            </HeadingTag>
          );
        }
        if (block.type === "image") {
          return (
            <figure className="articleMarkdownFigure" key={`image-${index}`}>
              <img src={block.src} alt={block.alt} />
              {block.alt ? <figcaption>{block.alt}</figcaption> : null}
            </figure>
          );
        }
        if (block.type === "quote") {
          return (
            <blockquote key={`quote-${index}`}>
              <ArticleInline nodes={block.inlines} />
            </blockquote>
          );
        }
        if (block.type === "list") {
          const ListTag = block.ordered ? "ol" : "ul";
          return (
            <ListTag key={`list-${index}`}>
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>
                  <ArticleInline nodes={item} />
                </li>
              ))}
            </ListTag>
          );
        }
        return (
          <p key={`p-${index}`}>
            <ArticleInline nodes={block.inlines} />
          </p>
        );
      })}
    </div>
  );
}
