import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import { cafeteriaAccountEmail, cafeteriaAccountName } from "../lib/cafeteriaAccount";
import { useAuth } from "../components/auth/authContextValue";
import { japanMenuDate } from "../lib/cafeteriaMenu";
import { cafeteriaKey, listStaffCafeterias, listMenuPhotos, uploadMenuPhoto, publishMenuPhotos, type CafeteriaLocation, type MenuPhoto } from "../services/cafeteriaMenuService";
import MenuCamera from "../components/life/MenuCamera";
import "../styles/life/CafeteriaStaff.css";

function PhotoPreview({ file }: { file: File }) {
  const ref = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const url = URL.createObjectURL(file);
    if (ref.current) ref.current.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);
  return <img ref={ref} className="staffPhoto" alt="登録するメニュー写真" />;
}
export default function CafeteriaStaff() {
  const { user, loading: authLoading } = useAuth();
  const [accountName, setAccountName] = useState("");
  const [password, setPassword] = useState("");
  const [locations, setLocations] = useState<CafeteriaLocation[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [date, setDate] = useState(japanMenuDate);
  const [registered, setRegistered] = useState<MenuPhoto[]>([]);
  const [loadKey, setLoadKey] = useState("");
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [reload, setReload] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const currentKey = `${date}/${reload}`;
  const ready = loadKey === currentKey;
  useEffect(() => {
    if (!user) return;
    let active = true;
    void listStaffCafeterias().then((items) => {
      if (active) { setLocations(items); setSelectedKeys(items[0] ? [cafeteriaKey(items[0])] : []); setChecking(false); }
    }).catch(() => { if (active) { setError("担当学食を取得できませんでした。再読み込みしてください。"); setChecking(false); } });
    return () => { active = false; };
  }, [user]);
  useEffect(() => {
    if (!locations.length) return;
    let active = true;
    void Promise.all([...new Set(locations.map((item) => item.university_id))].map((id) => listMenuPhotos(id, date))).then((groups) => {
      if (active) { setRegistered(groups.flat()); setLoadKey(currentKey); setPhoto(null); setMessage(""); setError(""); }
    }).catch(() => { if (active) setError("登録済み写真を取得できませんでした。再読み込みしてください。"); });
    return () => { active = false; };
  }, [locations, date, currentKey]);
  const login = async (event: React.FormEvent) => {
    event.preventDefault(); if (busy) return; setBusy(true); setError(""); setMessage("");
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: cafeteriaAccountEmail(accountName), password });
      if (error) throw error;
      setPassword("");
    } catch { setError("アカウント名またはパスワードが正しくありません。"); }
    finally { setBusy(false); }
  };
  const save = async () => {
    if (!user || !photo || !selectedKeys.length || !ready || busy) return;
    setBusy(true); setError(""); setMessage("");
    let path: string | null = null;
    let published = false;
    try {
      path = await uploadMenuPhoto(photo, user.id);
      const targets = locations.filter((item) => selectedKeys.includes(cafeteriaKey(item)));
      await publishMenuPhotos(targets, date, path, Object.fromEntries(registered.map((item) => [cafeteriaKey(item), item.updated_at])));
      published = true; setPhoto(null);
      setMessage(`${targets.length}件の学食に写真を登録しました。`);
      const groups = await Promise.all([...new Set(locations.map((item) => item.university_id))].map((id) => listMenuPhotos(id, date)));
      setRegistered(groups.flat());
    } catch (cause) {
      if (path && !published) await supabase.storage.from("cafeteria-menus").remove([path]);
      setError(published ? "写真は登録できましたが、表示を更新できませんでした。再読み込みしてください。" : (cause as Error).message || "写真を登録できませんでした。");
    } finally { setBusy(false); }
  };
  const selectPhoto = (file: File | undefined) => {
    if (!file) return;
    if (file.size > 15 * 1024 * 1024 || !["image/jpeg", "image/png", "image/webp"].includes(file.type)) setError("15MB以下のJPEG・PNG・WebP画像を選んでください。");
    else { setPhoto(file); setError(""); setMessage(""); }
  };
  const shownPhotos = registered.filter((item) => selectedKeys.includes(cafeteriaKey(item)));
  return <main className="cafeteriaStaff">
    <header><p>TsukuHub 学食スタッフ用</p><h1>メニュー写真を更新</h1>{user && <button disabled={busy} onClick={() => void supabase.auth.signOut().then(() => window.location.reload())}>ログアウト</button>}</header>
    {error && <p className="staffError" role="alert">{error}</p>}{message && <p className="staffMessage" role="status">{message}</p>}
    {authLoading ? <p>確認中…</p> : !user || (!checking && !locations.length) ? <form onSubmit={(event) => void login(event)}>
      <h2>スタッフログイン</h2><label>アカウント名<input required autoComplete="username" autoCapitalize="none" autoCorrect="off" spellCheck={false} value={accountName} onChange={(event) => setAccountName(event.target.value)} /></label><label>パスワード<input type="password" required autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} /></label><button className="staffPrimary" disabled={busy}>ログイン</button>
    </form> : checking ? <p>担当学食を確認中…</p> : !locations.length ? <section><h2>担当学食が未登録です</h2><p>管理者に「{cafeteriaAccountName(user.email ?? "")}」の担当学食を登録してもらってください。</p></section> : <>
      <section><fieldset disabled={busy || cameraOpen}><legend>担当学食（複数選択可）</legend>{locations.map((item) => <label className="staffCheck" key={cafeteriaKey(item)}><input type="checkbox" checked={selectedKeys.includes(cafeteriaKey(item))} onChange={(event) => { const key = cafeteriaKey(item); setSelectedKeys((current) => event.target.checked ? [...current, key] : current.filter((value) => value !== key)); }} />{item.name}</label>)}<button type="button" onClick={() => setSelectedKeys(locations.map(cafeteriaKey))}>すべて選択</button><label>メニューの掲載日<input type="date" required value={date} onChange={(event) => { if (event.target.value) setDate(event.target.value); }} /></label><button type="button" onClick={() => { if (!photo || window.confirm("選択中の写真を破棄して再読み込みしますか？")) setReload((value) => value + 1); }}>登録済みの写真を再読み込み</button></fieldset></section>
      {!ready ? <p>写真を取得中…</p> : <section><h2>メニュー写真</h2><div className="staffPhotoActions"><input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" hidden disabled={busy || cameraOpen} onChange={(event) => { selectPhoto(event.target.files?.[0]); event.target.value = ""; }} /><button type="button" disabled={busy || cameraOpen} onClick={() => setCameraOpen(true)}>カメラで撮る</button><button type="button" disabled={busy || cameraOpen} onClick={() => fileRef.current?.click()}>写真を選ぶ</button></div>
        {cameraOpen && <MenuCamera onCapture={(file) => { selectPhoto(file); setCameraOpen(false); }} onClose={() => setCameraOpen(false)} />}
        {photo && <><PhotoPreview file={photo} /><button type="button" disabled={busy} onClick={() => setPhoto(null)}>選択した写真を取り消す</button></>}
        <button type="button" className="staffPrimary" disabled={busy || cameraOpen || !photo || !selectedKeys.length} onClick={() => void save()}>{busy ? "アップロード中…" : "選択した学食に写真を登録する"}</button>
        {!photo && shownPhotos.map((item) => <div key={cafeteriaKey(item)}><h3>{locations.find((location) => cafeteriaKey(location) === cafeteriaKey(item))?.name}</h3><img className="staffPhoto" src={item.url} alt="登録済みのメニュー写真" /></div>)}
      </section>}
    </>}
  </main>;
}
