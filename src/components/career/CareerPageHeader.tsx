import type { ReactNode } from "react";

type CareerPageHeaderProps = {
  eyebrow: string;
  title: string;
  children: ReactNode;
};

export default function CareerPageHeader({
  eyebrow,
  title,
  children,
}: CareerPageHeaderProps) {
  return (
    <header className="careerPageHeader">
      <span>{eyebrow}</span>
      <h1>{title}</h1>
      <p>{children}</p>
    </header>
  );
}
