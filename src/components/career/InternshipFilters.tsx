const internshipFilters = [
  "すべて",
  "エンジニア",
  "営業・ビジネス",
  "マーケティング",
  "企画",
  "デザイン",
  "リモート可",
];

type InternshipFiltersProps = {
  activeFilter: string;
  onChange: (filter: string) => void;
};

export default function InternshipFilters({
  activeFilter,
  onChange,
}: InternshipFiltersProps) {
  return (
    <section className="quickFilter" aria-label="求人の絞り込み">
      <h2>クイックフィルター</h2>
      <div>
        {internshipFilters.map((filter) => (
          <button
            type="button"
            className={activeFilter === filter ? "isActive" : ""}
            onClick={() => onChange(filter)}
            key={filter}
          >
            {filter}
          </button>
        ))}
      </div>
    </section>
  );
}
