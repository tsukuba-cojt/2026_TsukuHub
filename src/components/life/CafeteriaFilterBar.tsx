import { Circle, CircleCheck } from "lucide-react";
import { cafeteriaCategories, paymentLabels, paymentMethods } from "./mockCafeterias";
import type {
  CafeteriaCategoryFilter,
  CafeteriaFilters,
  CafeteriaPaymentFilter,
  CafeteriaSortKey,
} from "../../lib/cafeteriaSearch";
import "../../styles/circle/CircleSearchPanel.css";
import "../../styles/life/Cafeteria.css";

const CATEGORY_OPTIONS: { value: CafeteriaCategoryFilter; label: string }[] = [
  { value: "all", label: "すべて" },
  ...cafeteriaCategories.map((category) => ({ value: category, label: category })),
];

const SORT_OPTIONS: { value: CafeteriaSortKey; label: string }[] = [
  { value: "recommended", label: "おすすめ順" },
  { value: "rating", label: "評価が高い順" },
  { value: "reviews", label: "口コミが多い順" },
];

type CafeteriaFilterBarProps = {
  filters: CafeteriaFilters;
  onChange: (filters: CafeteriaFilters) => void;
};

function CafeteriaFilterBar({ filters, onChange }: CafeteriaFilterBarProps) {
  const update = (patch: Partial<CafeteriaFilters>) => onChange({ ...filters, ...patch });

  return (
    <section className="cafeteriaFilterBar" aria-label="絞り込み・並べ替え">
      <div className="cafeteriaFilterChips" role="group" aria-label="カテゴリ">
        {CATEGORY_OPTIONS.map((option) => {
          const selected = filters.category === option.value;
          return (
            <button
              type="button"
              className={`circleTagChip cafeteriaFilterChip${selected ? " isSelected" : ""}`}
              aria-pressed={selected}
              onClick={() => update({ category: option.value })}
              key={option.value}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <span className="cafeteriaFilterDivider" aria-hidden="true" />

      <button
        type="button"
        className={`cafeteriaOpenToggle${filters.openOnly ? " isActive" : ""}`}
        aria-pressed={filters.openOnly}
        onClick={() => update({ openOnly: !filters.openOnly })}
      >
        {filters.openOnly ? <CircleCheck aria-hidden="true" /> : <Circle aria-hidden="true" />}
        営業中のみ表示
      </button>

      <span className="cafeteriaFilterDivider" aria-hidden="true" />

      <label className="cafeteriaFilterSelect">
        <span>決済手段</span>
        <select
          value={filters.payment}
          onChange={(event) => update({ payment: event.target.value as CafeteriaPaymentFilter })}
        >
          <option value="all">すべて</option>
          {paymentMethods.map((method) => (
            <option value={method} key={method}>
              {paymentLabels[method]}
            </option>
          ))}
        </select>
      </label>

      <span className="cafeteriaFilterDivider" aria-hidden="true" />

      <label className="cafeteriaFilterSelect">
        <span>並べ替え</span>
        <select
          value={filters.sort}
          onChange={(event) => update({ sort: event.target.value as CafeteriaSortKey })}
        >
          {SORT_OPTIONS.map((option) => (
            <option value={option.value} key={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </section>
  );
}

export default CafeteriaFilterBar;
