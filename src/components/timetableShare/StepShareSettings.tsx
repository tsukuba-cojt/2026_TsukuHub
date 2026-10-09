import { useMemo } from "react";
import { ChevronDown, ListTodo } from "lucide-react";
import {
  findDepartment,
  findMajor,
  listAdmissionYearOptions,
  listDepartmentAdmissionYears,
  listMajorAdmissionYears,
  supportedDepartments,
} from "../../features/graduationCheck";
import type {
  SupportedDepartment,
  SupportedMajor,
} from "../../features/graduationCheck";
import { timetableModuleLabels, timetableModuleOrder } from "../../types/timetable";
import type { TimetableModuleKey } from "../../types/timetable";
import type { ShareProfile, ShareSettings } from "./shareState";
import "../../styles/class/GraduationCheck.css";
import "../../styles/class/TimetableShare.css";

type Props = {
  profile: ShareProfile;
  onProfileChange: (profile: ShareProfile) => void;
  settings: ShareSettings;
  onChange: (settings: ShareSettings) => void;
  isUnsupported: boolean;
  unsupportedNotice: string;
};

type ToggleRowProps = {
  label: string;
  checked: boolean;
  disabled?: boolean;
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

function StepShareSettings({
  profile,
  onProfileChange,
  settings,
  onChange,
  isUnsupported,
  unsupportedNotice,
}: Props) {
  const subDisabled = !settings.shareTimetable;

  const department = useMemo(
    () => findDepartment(profile.departmentKey),
    [profile.departmentKey]
  );
  const major = useMemo(
    () => findMajor(profile.departmentKey, profile.majorKey),
    [profile.departmentKey, profile.majorKey]
  );
  const admissionYearOptions = useMemo(
    () => listAdmissionYearOptions(department, major),
    [department, major]
  );

  const update = (patch: Partial<ShareSettings>) =>
    onChange({ ...settings, ...patch });

  const keepAdmissionYearIfSupported = (
    nextDepartment: SupportedDepartment | undefined,
    nextMajor: SupportedMajor | undefined
  ) => {
    const years = nextMajor
      ? listMajorAdmissionYears(nextMajor)
      : nextDepartment
        ? listDepartmentAdmissionYears(nextDepartment)
        : [];
    return profile.admissionYear !== "" &&
      years.includes(Number(profile.admissionYear))
      ? profile.admissionYear
      : "";
  };

  const handleDepartmentChange = (departmentKey: string) => {
    const nextDepartment = findDepartment(departmentKey);
    const majors = nextDepartment?.majors ?? [];
    const nextMajor = majors.length === 1 ? majors[0] : undefined;
    onProfileChange({
      departmentKey,
      majorKey: nextMajor?.key ?? "",
      admissionYear: keepAdmissionYearIfSupported(nextDepartment, nextMajor),
    });
  };

  const handleMajorChange = (majorKey: string) => {
    onProfileChange({
      ...profile,
      majorKey,
      admissionYear: keepAdmissionYearIfSupported(
        department,
        findMajor(profile.departmentKey, majorKey)
      ),
    });
  };

  const toggleModule = (moduleKey: TimetableModuleKey) => {
    const next = settings.modules.includes(moduleKey)
      ? settings.modules.filter((m) => m !== moduleKey)
      : timetableModuleOrder.filter(
          (m) => settings.modules.includes(m) || m === moduleKey
        );
    update({ modules: next });
  };

  return (
    <section className="ttShareCard">
      <h2 className="ttShareCardTitle">
        <ListTodo aria-hidden="true" />
        共有情報の選択
      </h2>

      <div className="ttShareProfileFields">
        <div className="ttShareField">
          <label className="ttShareFieldLabel" htmlFor="ttShareDepartment">
            学類
          </label>
          <div className="gradCheckSelectWrap">
            <select
              id="ttShareDepartment"
              className={`gradCheckSelect${profile.departmentKey === "" ? " isPlaceholder" : ""}`}
              value={profile.departmentKey}
              onChange={(e) => handleDepartmentChange(e.target.value)}
            >
              <option value="" disabled>
                -- 選択する --
              </option>
              {supportedDepartments.map((d) => (
                <option value={d.key} key={d.key}>
                  {d.label}
                </option>
              ))}
            </select>
            <ChevronDown className="gradCheckSelectChevron" aria-hidden="true" />
          </div>
        </div>

        <div className="ttShareField">
          <label className="ttShareFieldLabel" htmlFor="ttShareMajor">
            専攻
          </label>
          <div className="gradCheckSelectWrap">
            <select
              id="ttShareMajor"
              className={`gradCheckSelect${profile.majorKey === "" ? " isPlaceholder" : ""}`}
              value={profile.majorKey}
              disabled={department === undefined}
              onChange={(e) => handleMajorChange(e.target.value)}
            >
              <option value="" disabled>
                -- 選択する --
              </option>
              {(department?.majors ?? []).map((m) => (
                <option value={m.key} key={m.key}>
                  {m.label}
                </option>
              ))}
            </select>
            <ChevronDown className="gradCheckSelectChevron" aria-hidden="true" />
          </div>
        </div>

        <div className="ttShareField">
          <label className="ttShareFieldLabel" htmlFor="ttShareAdmissionYear">
            入学年度
          </label>
          <div className="gradCheckSelectWrap">
            <select
              id="ttShareAdmissionYear"
              className={`gradCheckSelect${profile.admissionYear === "" ? " isPlaceholder" : ""}`}
              value={profile.admissionYear}
              disabled={admissionYearOptions.length === 0}
              onChange={(e) =>
                onProfileChange({ ...profile, admissionYear: e.target.value })
              }
            >
              <option value="" disabled>
                -- 選択する --
              </option>
              {admissionYearOptions.map((option) => (
                <option value={option.value} key={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="gradCheckSelectChevron" aria-hidden="true" />
          </div>
        </div>
      </div>

      {isUnsupported && (
        <p className="gradCheckFieldError">{unsupportedNotice}</p>
      )}

      <ToggleRow
        label="時間割を匿名で共有する"
        checked={settings.shareTimetable}
        onChange={(checked) => update({ shareTimetable: checked })}
      />
      <p className="ttShareToggleNote">
        共有すると、ほかの学生があなたの時間割を履修計画の参考にできます。
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
          {timetableModuleOrder.map((moduleKey) => {
            const selected = settings.modules.includes(moduleKey);
            return (
              <button
                type="button"
                key={moduleKey}
                className={`ttShareChip${selected ? " isSelected" : ""}`}
                aria-pressed={selected}
                disabled={subDisabled}
                onClick={() => toggleModule(moduleKey)}
              >
                {timetableModuleLabels[moduleKey]}
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
