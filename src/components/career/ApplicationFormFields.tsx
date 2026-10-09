import type { ApplicationFormState } from "./applicationFormState";

type ApplicationFormFieldsProps = {
  form: ApplicationFormState;
  facultyOptions?: { value: string; label: string }[];
  onChange: (key: keyof ApplicationFormState, value: string) => void;
};

function IdentityField({
  label,
  value,
  field,
  type = "text",
  maxLength,
  min,
  max,
  className,
  autoComplete,
  onChange,
}: {
  label: string;
  value: string;
  field: keyof ApplicationFormState;
  type?: string;
  maxLength?: number;
  min?: string;
  max?: string;
  className?: string;
  autoComplete?: string;
  onChange: (key: keyof ApplicationFormState, value: string) => void;
}) {
  return (
    <label className={className}>
      {label} <span>*</span>
      <input
        required
        type={type}
        value={value}
        maxLength={maxLength}
        min={min}
        max={max}
        autoComplete={autoComplete}
        onChange={(event) => onChange(field, event.target.value)}
      />
    </label>
  );
}

export default function ApplicationFormFields({
  form,
  facultyOptions = [],
  onChange,
}: ApplicationFormFieldsProps) {
  return (
    <>
      <div className="formGrid">
        <IdentityField
          label="氏名"
          field="applicant_name"
          value={form.applicant_name}
          maxLength={100}
          autoComplete="name"
          onChange={onChange}
        />
        <IdentityField
          label="メールアドレス"
          field="email"
          type="email"
          value={form.email}
          maxLength={254}
          autoComplete="email"
          onChange={onChange}
        />
        <label>
          所属学群・学類 <span>*</span>
          {facultyOptions.length > 0 ? (
            <select
              required
              value={form.faculty}
              onChange={(event) => onChange("faculty", event.target.value)}
            >
              <option value="">－－選択する－－</option>
              {facultyOptions.map((option) => (
                <option value={option.value} key={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              required
              type="text"
              value={form.faculty}
              maxLength={100}
              onChange={(event) => onChange("faculty", event.target.value)}
            />
          )}
        </label>
        <IdentityField
          label="卒業予定年"
          field="graduation_year"
          type="number"
          value={form.graduation_year}
          min="2026"
          max="2100"
          onChange={onChange}
        />
        <IdentityField
          label="電話番号"
          field="phone"
          type="tel"
          value={form.phone}
          maxLength={20}
          className="formGridPhone"
          onChange={onChange}
        />
      </div>
      <label>
        志望理由 <span>*</span>
        <textarea
          required
          placeholder="興味を持った理由や、このインターンで挑戦したいことを書いてください。"
          value={form.motivation}
          maxLength={2000}
          rows={6}
          onChange={(event) => onChange("motivation", event.target.value)}
        />
        <small className="applicationFieldHint">{form.motivation.length} / 2000文字</small>
      </label>
      <label>
        経験・スキル
        <textarea
          required
          placeholder="授業・研究・課外活動などで取り組んだことを書いてください。"
          value={form.skills}
          maxLength={2000}
          rows={5}
          onChange={(event) => onChange("skills", event.target.value)}
        />
        <small className="applicationFieldHint">{form.skills.length} / 2000文字</small>
      </label>
      <label>
        ポートフォリオURL
        <input
          type="url"
          placeholder="https://example.com"
          value={form.portfolio_url}
          maxLength={500}
          onChange={(event) => onChange("portfolio_url", event.target.value)}
        />
      </label>
      <label>
        補足事項
        <textarea
          value={form.additional_notes}
          maxLength={1000}
          rows={4}
          onChange={(event) => onChange("additional_notes", event.target.value)}
        />
      </label>
    </>
  );
}
