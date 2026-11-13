import { Fragment } from "react";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

type BreadcrumbItem = {
  label: string;
  to?: string;
};

type CareerBreadcrumbProps = {
  items: BreadcrumbItem[];
};

export default function CareerBreadcrumb({ items }: CareerBreadcrumbProps) {
  return (
    <nav className="careerBreadcrumb" aria-label="パンくずリスト">
      {items.map((item, index) => (
        <Fragment key={`${item.label}-${index}`}>
          {index > 0 && <ChevronRight aria-hidden="true" />}
          {item.to ? <Link to={item.to}>{item.label}</Link> : <span>{item.label}</span>}
        </Fragment>
      ))}
    </nav>
  );
}
