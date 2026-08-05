import { ListTodo } from "lucide-react";
import { MODULE_TABS } from "../class/timetableData";
import type { ShareSettings } from "./shareState";
import "../../styles/class/TimetableShare.css";

type Props = {
  settings: ShareSettings;
  onChange: (settings: ShareSettings) => void;
};

/** トグルスイッチ1行分（見出し＋スイッチ） */
type ToggleRowProps = {
  label: string;
  checked: boolean;
  disabled?: boolean;
  /** 入れ子（下位項目）として一段下げるか */
  nested?: boolean;
  onChange: (checked: boolean) => void;
};

function ToggleRow({
  label,
  checked,
  disabled,
  nested,
  onChange,
}: ToggleRowProps) {
  return (
    <label
      className={`ttShareToggleRow${nested ? " isNested" : ""}${disabled ? " isDisabled" : ""}`}
    >
      <input
        type="checkbox"
        role="switch"
        className="ttShareToggleInput"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="ttShareToggleTrack" aria-hidden="true" />
      <span className="ttShareToggleLabel">{label}</span>
    </label>
  );
}

/** ステップ2：共有情報の選択 */
function StepShareSettings({ settings, onChange }: Props) {
  // 上位トグル（時間割を匿名で共有する）が OFF のときは下位項目をすべて操作不可にする
  const subDisabled = !settings.shareTimetable;

  const update = (patch: Partial<ShareSettings>) =>
    onChange({ ...settings, ...patch });

  const toggleModule = (module: string) => {
    const next = settings.modules.includes(module)
      ? settings.modules.filter((m) => m !== module)
      : // MODULE_TABS の並び順を保ったまま追加する
        MODULE_TABS.filter(
          (m) => settings.modules.includes(m) || m === module
        );
    update({ modules: next });
  };

  return (
    <section className="ttShareCard">
      <h2 className="ttShareCardTitle">
        <ListTodo aria-hidden="true" />
        共有情報の選択
      </h2>

      <ToggleRow
        label="時間割を匿名で共有する"
        checked={settings.shareTimetable}
        onChange={(checked) => update({ shareTimetable: checked })}
      />
      <p className="ttShareToggleNote">
        共有すると、ほかの筑波大生があなたの時間割を履修計画の参考にできます。
        氏名・学籍番号は公開されません。
      </p>

      <ToggleRow
        nested
        label="入学年度を共有する"
        checked={settings.shareEnrollYear}
        disabled={subDisabled}
        onChange={(checked) => update({ shareEnrollYear: checked })}
      />
      <ToggleRow
        nested
        label="専攻・分野を共有する"
        checked={settings.shareMajor}
        disabled={subDisabled}
        onChange={(checked) => update({ shareMajor: checked })}
      />

      <div className={`ttShareField${subDisabled ? " isDisabled" : ""}`}>
        <p className="ttShareFieldLabel">共有するモジュール</p>
        <div className="ttShareChips">
          {MODULE_TABS.map((module) => {
            const selected = settings.modules.includes(module);
            return (
              <button
                type="button"
                key={module}
                className={`ttShareChip${selected ? " isSelected" : ""}`}
                aria-pressed={selected}
                disabled={subDisabled}
                onClick={() => toggleModule(module)}
              >
                {module}
              </button>
            );
          })}
        </div>
      </div>

      <div className="ttShareField">
        <label className="ttShareFieldLabel" htmlFor="ttShareNote">
          備考
        </label>
        <textarea
          id="ttShareNote"
          className="ttShareTextarea"
          rows={3}
          placeholder="時間割に関する情報を書いてください"
          value={settings.note}
          onChange={(e) => update({ note: e.target.value })}
        />
      </div>
    </section>
  );
}

export default StepShareSettings;
