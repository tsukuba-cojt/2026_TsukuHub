type ContentCoverProps = {
  variant: "card" | "article";
  imageUrl?: string | null;
  eyebrow: string;
  title: string;
  org?: string;
  meta?: string;
  logoUrl?: string | null;
  logoAlt?: string;
};

export default function ContentCover({
  variant,
  imageUrl,
  eyebrow,
  title,
  org,
  meta,
  logoUrl,
  logoAlt,
}: ContentCoverProps) {
  const root = variant === "article" ? "alumniCover" : "alumniCardCover";
  const imageClass = variant === "article" ? "alumniCoverImage" : "alumniCardCoverImage";

  return (
    <div className={`${root}${imageUrl ? " hasImage" : ""}`}>
      {imageUrl ? <img className={imageClass} src={imageUrl} alt="" /> : null}
      {variant === "article" && logoUrl ? (
        <img className="alumniCoverLogo" src={logoUrl} alt={logoAlt ?? ""} />
      ) : null}
      {variant === "article" ? (
        <>
          <span className="alumniCoverEyebrow">{eyebrow}</span>
          <p className="alumniCoverRole">{title}</p>
          {org ? <p className="alumniCoverOrg">{org}</p> : null}
          {meta ? <p className="alumniCoverMeta">{meta}</p> : null}
        </>
      ) : (
        <>
          <span>{eyebrow}</span>
          <strong>{title}</strong>
          {org ? <small>{org}</small> : null}
        </>
      )}
    </div>
  );
}
