import type { ApplicationFormState } from "./applicationFormState";

type ApplicationFormFieldsProps = {
  form: ApplicationFormState;
  onChange: (key: keyof ApplicationFormState, value: string) => void;
};

export default function ApplicationFormFields({
  form,
  onChange,
}: ApplicationFormFieldsProps) {
  return (
    <>
      <div className="formGrid">
        <label>
          氏名 <span>*</span>
          <input
            required
            autoComplete="name"
            value={form.applicant_name}
            maxLength={100}
            onChange={(event) => onChange("applicant_name", event.target.value)}
          />
        </label>
        <label>
          メールアドレス <span>*</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={form.email}
            maxLength={254}
            onChange={(event) => onChange("email", event.target.value)}
          />
        </label>
        <label>
          所属学群・学類 <span>*</span>
          <input
            required
            value={form.faculty}
            maxLength={100}
            onChange={(event) => onChange("faculty", event.target.value)}
          />
        </label>
        <label>
          卒業予定年 <span>*</span>
          <input
            type="number"
            required
            step="1"
            min="2026"
            max="2100"
            value={form.graduation_year}
            onChange={(event) => onChange("graduation_year", event.target.value)}
          />
        </label>
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
        経験・スキル <span>*</span>
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
