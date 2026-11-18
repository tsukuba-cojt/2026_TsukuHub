import type { InlineNode } from "../../lib/articleMarkdown";

type ArticleInlineProps = {
  nodes: InlineNode[];
};

export default function ArticleInline({ nodes }: ArticleInlineProps) {
  return (
    <>
      {nodes.map((node, index) => {
        if (node.type === "bold") return <strong key={index}>{node.value}</strong>;
        if (node.type === "link") {
          return (
            <a href={node.href} target="_blank" rel="noreferrer" key={index}>
              {node.value}
            </a>
          );
        }
        if (node.type === "image") {
          return <img src={node.src} alt={node.alt} key={index} />;
        }
        return <span key={index}>{node.value}</span>;
      })}
    </>
  );
}
