import { useRef } from "react";
import { Plus, X } from "lucide-react";
import { addCircleTags, CIRCLE_TAG_LIMIT } from "./circleTagUtils";

type Props = {
  id: string;
  label: string;
  tags: string[];
  draft: string;
  error?: string;
  onChange: (tags: string[]) => void;
  onDraftChange: (draft: string) => void;
  onError: (error?: string) => void;
};

export default function CircleTagInput({ id, label, tags, draft, error, onChange, onDraftChange, onError }: Props) {
  const composing = useRef(false);
  const commit = (value = draft) => {
    const result = addCircleTags(tags, value);
    onError(result.error);
    if (result.error) return;
    onChange(result.tags);
    onDraftChange("");
  };

  return (
    <div className="ttShareField circleEditFirstField">
      <label className="ttShareFieldLabel" htmlFor={id}>{label}<span className="circleEditOptional">任意</span></label>
      <div className={`circleEditTagBox${error ? " isInvalid" : ""}`}>
        <ul className="circleEditTagList" aria-label={`${label}の一覧`}>
          {tags.map((tag) => <li key={tag}>
            <span>#{tag}</span>
            <button type="button" aria-label={`${label}「${tag}」を削除`} onClick={() => {
              onChange(tags.filter((item) => item !== tag));
              onError(undefined);
            }}><X aria-hidden="true" /></button>
          </li>)}
        </ul>
        <div className="circleEditTagEntry">
          <input id={id} type="text" className="circleEditTagInput" value={draft}
            placeholder="タグを入力" aria-describedby={`${id}Hint ${id}Status${error ? ` ${id}Error` : ""}`}
            aria-invalid={Boolean(error)}
            onChange={(event) => {
              const value = event.target.value;
              onDraftChange(value);
              onError(undefined);
              if (!composing.current && /[\s,、，]/u.test(value)) commit(value);
            }}
            onCompositionStart={() => { composing.current = true; }}
            onCompositionEnd={(event) => {
              composing.current = false;
              if (/[\s,、，]/u.test(event.currentTarget.value)) commit(event.currentTarget.value);
            }}
            onKeyDown={(event) => {
              if (composing.current || event.nativeEvent.isComposing || event.keyCode === 229) return;
              if (["Enter", ",", " "].includes(event.key)) {
                event.preventDefault();
                commit();
              }
            }}
            onBlur={() => { if (!composing.current && draft.trim()) commit(); }} />
          <button type="button" className="classDetailActionBtn" disabled={!draft.trim()}
            onMouseDown={(event) => event.preventDefault()} onClick={() => commit()}>
            <Plus aria-hidden="true" />追加
          </button>
        </div>
      </div>
      <div className="circleEditTagHelp">
        <p id={`${id}Hint`} className="circleEditHint">単語を入力してEnterまたは「追加」で確定。スペース・カンマ区切りでも追加できます。1タグ30文字まで。</p>
        <p id={`${id}Status`} className="circleEditHint" role="status">{tags.length}/{CIRCLE_TAG_LIMIT}個</p>
      </div>
      {error && <p id={`${id}Error`} className="reviewFormError" role="alert">{error}</p>}
    </div>
  );
}
