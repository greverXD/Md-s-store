import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase";
import { fmt } from "@/lib/format";
import { ACC_CATS, CLOTHING_CATS, COLLECTIONS, DOLL_META, DOLL_TYPES, EYE_COLORS, HAIR_COLORS, HEIGHTS } from "@/data/demo";
import { FilterChip, Notice, Spinner } from "@/components/ui";
import type { DollType, OutfitZone, ProductKind } from "@/lib/types";

interface Row {
  id: string; kind: ProductKind; doll_type: DollType | null; category: string | null; name: string; description: string | null;
  price: number; image_url: string | null; is_new: boolean; in_stock: boolean; active: boolean;
  height: string | null; hair_color: string | null; eye_color: string | null; collection: string | null;
}
const PRODUCT_COLUMNS = "id, kind, doll_type, category, name, description, price, image_url, is_new, in_stock, active, height, hair_color, eye_color, collection";
interface OutfitRow { id: string; doll_type: DollType; category: string; name: string; color: string; price: number; zone: OutfitZone; active: boolean }

const KIND_LABEL: Record<ProductKind, string> = { doll: "Куклы", clothing: "Одежда", accessory: "Аксессуары" };
const ZONE_LABEL: Record<OutfitZone, string> = { head: "Голова", body: "Платье/комбинезон", top: "Верх", bottom: "Низ", feet: "Обувь", hand: "В руке" };

export default function AdminProducts() {
  const [tab, setTab] = useState<ProductKind | "outfit">("doll");
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-6">
        {(Object.keys(KIND_LABEL) as ProductKind[]).map(k => <FilterChip key={k} label={KIND_LABEL[k]} active={tab === k} onClick={() => setTab(k)} />)}
        <FilterChip label="Гардероб конструктора" active={tab === "outfit"} onClick={() => setTab("outfit")} />
      </div>
      {tab === "outfit" ? <OutfitTable /> : <ProductTable kind={tab} />}
    </div>
  );
}

function ProductTable({ kind }: { kind: ProductKind }) {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Row | "new" | null>(null);
  const [search, setSearch] = useState("");

  const load = () => supabase!.from("products").select(PRODUCT_COLUMNS)
    .eq("kind", kind).order("created_at", { ascending: false })
    .then(({ data, error }) => error ? setError(error.message) : setRows(data as Row[]));

  useEffect(() => { setRows(null); setEditing(null); load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [kind]);

  const patch = async (id: string, values: Partial<Row>) => {
    const { error } = await supabase!.from("products").update(values).eq("id", id);
    if (error) setError(error.message); else load();
  };

  const shown = (rows ?? []).filter(r => !search || r.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <button className="btn-primary" onClick={() => setEditing("new")}>
          + Добавить {kind === "doll" ? "куклу" : "товар"}
        </button>
        <input className="input sm:max-w-xs" placeholder="Поиск по названию" value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      {error && <Notice kind="error">{error}</Notice>}
      {rows === null ? <Spinner /> : shown.length === 0 ? <Notice>Пока пусто.</Notice> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {shown.map(r => (
            <div key={r.id} className={`card p-4 flex gap-4 ${r.active ? "" : "opacity-60"}`}>
              <div className="w-20 h-24 rounded-xl overflow-hidden bg-[#F5EEE6] shrink-0">
                {r.image_url && <img src={r.image_url} alt="" className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0 font-['Jost']">
                <p className="font-['Gilda_Display'] text-[#3A2E27] truncate">{r.name}</p>
                <p className="text-xs text-[#8B7B6E] truncate">
                  {[r.doll_type && kind !== "doll" && DOLL_META[r.doll_type].shortLabel, r.category, r.height, r.collection].filter(Boolean).join(" · ")}
                </p>
                <p className="text-sm text-[#B8975A] mt-1">{fmt(r.price)}</p>
                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs text-[#8B7B6E]">
                  <Toggle label="В наличии" checked={r.in_stock} onChange={v => patch(r.id, { in_stock: v })} />
                  <Toggle label="Новинка" checked={r.is_new} onChange={v => patch(r.id, { is_new: v })} />
                  <Toggle label="На сайте" checked={r.active} onChange={v => patch(r.id, { active: v })} />
                </div>
                <button onClick={() => setEditing(r)} className="text-sm text-[#B8975A] font-medium mt-2">Изменить</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {editing && (
        <ProductEditor kind={kind} row={editing === "new" ? null : editing}
          onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />
      )}
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-1.5 font-normal text-xs cursor-pointer">
      <input type="checkbox" className="accent-[#B8975A]" checked={checked} onChange={e => onChange(e.target.checked)} />
      {label}
    </label>
  );
}

async function uploadPhoto(kind: ProductKind, file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Можно загрузить только изображение");
  if (file.size > 5 * 1024 * 1024) throw new Error("Фото больше 5 МБ, уменьшите его");
  const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${kind}/${crypto.randomUUID()}.${ext}`;
  const up = await supabase!.storage.from("products").upload(path, file, { contentType: file.type, cacheControl: "31536000" });
  if (up.error) throw up.error;
  return supabase!.storage.from("products").getPublicUrl(path).data.publicUrl;
}

function ProductEditor({ kind, row, onClose, onSaved }: { kind: ProductKind; row: Row | null; onClose: () => void; onSaved: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(row?.image_url ?? null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true); setError(null);
    try {
      let image_url = row?.image_url ?? null;
      const file = f.get("image") as File | null;
      if (file && file.size > 0) image_url = await uploadPhoto(kind, file);
      const str = (k: string) => ((f.get(k) as string | null) ?? "").trim() || null;
      const values = {
        kind,
        name: str("name"),
        description: str("description"),
        price: Number(f.get("price")),
        category: str("category"),
        doll_type: kind === "doll" ? "textile" : kind === "clothing" ? str("doll_type") : null,
        height: str("height"), hair_color: str("hair_color"), eye_color: str("eye_color"), collection: str("collection"),
        in_stock: f.get("in_stock") === "on", is_new: f.get("is_new") === "on", active: f.get("active") === "on",
        image_url,
      };
      const { error } = row
        ? await supabase!.from("products").update(values).eq("id", row.id)
        : await supabase!.from("products").insert(values);
      if (error) throw error;
      onSaved();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!row) return;
    setBusy(true);
    // Товар из старых заказов не теряется: в заказе хранится название и цена.
    const { error } = await supabase!.from("products").delete().eq("id", row.id);
    setBusy(false);
    if (error) setError(error.message); else onSaved();
  };

  const field = "flex flex-col gap-1 text-xs font-['Jost'] text-[#8B7B6E] font-normal";
  return (
    <div className="fixed inset-0 z-[60] bg-[#3A2E27]/40 flex items-end sm:items-center justify-center sm:p-6" onClick={onClose}>
      <form onSubmit={submit} onClick={e => e.stopPropagation()}
        className="bg-[#FAF7F2] w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl p-5 sm:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-['Gilda_Display'] text-2xl text-[#3A2E27]">
            {row ? "Изменить" : "Новая"} {kind === "doll" ? "кукла" : "позиция"}
          </h2>
          <button type="button" onClick={onClose} className="text-[#8B7B6E] text-2xl leading-none" aria-label="Закрыть">×</button>
        </div>

        <div className="grid sm:grid-cols-[160px_1fr] gap-5">
          <label className="block cursor-pointer">
            <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-[#F0E8DF] flex items-center justify-center border-2 border-dashed border-[#BAA28A]/40">
              {preview ? <img src={preview} alt="" className="w-full h-full object-cover" />
                : <span className="text-xs font-['Jost'] text-[#8B7B6E] text-center px-3">Нажмите, чтобы добавить фото</span>}
            </div>
            <input name="image" type="file" accept="image/jpeg,image/png,image/webp" className="sr-only"
              onChange={e => { const file = e.target.files?.[0]; if (file) setPreview(URL.createObjectURL(file)); }} />
            <span className="block text-center text-xs text-[#B8975A] mt-2 font-['Jost']">{preview ? "Заменить фото" : "JPG, PNG, WebP до 5 МБ"}</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className={`${field} sm:col-span-2`}>Название<input name="name" className="input" required maxLength={120} defaultValue={row?.name ?? ""} /></label>
            <label className={field}>Цена, ₽<input name="price" className="input" type="number" min={0} required defaultValue={row?.price ?? ""} /></label>
            {kind === "clothing" && (
              <label className={field}>Для какой куклы
                <select name="doll_type" className="input" required defaultValue={row?.doll_type ?? ""}>
                  <option value="" disabled>Выберите</option>
                  {DOLL_TYPES.map(t => <option key={t} value={t}>{DOLL_META[t].shortLabel}</option>)}
                </select>
              </label>
            )}
            {kind !== "doll" && (
              <label className={field}>Категория
                <input name="category" className="input" required list={`cats-${kind}`} defaultValue={row?.category ?? ""} placeholder="Платья, Обувь…" />
                <datalist id={`cats-${kind}`}>{(kind === "accessory" ? ACC_CATS : [...new Set(Object.values(CLOTHING_CATS).flat())]).map(c => <option key={c} value={c} />)}</datalist>
              </label>
            )}
            {kind === "doll" && (
              <>
                <label className={field}>Рост<input name="height" className="input" list="heights" defaultValue={row?.height ?? ""} placeholder="35 см" /></label>
                <label className={field}>Цвет волос<input name="hair_color" className="input" list="hair" defaultValue={row?.hair_color ?? ""} /></label>
                <label className={field}>Цвет глаз<input name="eye_color" className="input" list="eyes" defaultValue={row?.eye_color ?? ""} /></label>
                <label className={field}>Коллекция<input name="collection" className="input" list="colls" defaultValue={row?.collection ?? ""} /></label>
                <datalist id="heights">{HEIGHTS.map(v => <option key={v} value={v} />)}</datalist>
                <datalist id="hair">{HAIR_COLORS.map(v => <option key={v} value={v} />)}</datalist>
                <datalist id="eyes">{EYE_COLORS.map(v => <option key={v} value={v} />)}</datalist>
                <datalist id="colls">{COLLECTIONS.map(v => <option key={v} value={v} />)}</datalist>
              </>
            )}
            <label className={`${field} sm:col-span-2`}>Описание
              <textarea name="description" className="input min-h-24" maxLength={2000} defaultValue={row?.description ?? ""}
                placeholder="Материалы, особенности, история куклы…" />
            </label>
          </div>
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-['Jost']">
          <label className="flex items-center gap-2 font-normal"><input name="in_stock" type="checkbox" defaultChecked={row?.in_stock ?? true} className="accent-[#B8975A]" /> В наличии (иначе «На заказ»)</label>
          <label className="flex items-center gap-2 font-normal"><input name="is_new" type="checkbox" defaultChecked={row?.is_new ?? true} className="accent-[#B8975A]" /> Новинка</label>
          <label className="flex items-center gap-2 font-normal"><input name="active" type="checkbox" defaultChecked={row?.active ?? true} className="accent-[#B8975A]" /> Показывать на сайте</label>
        </div>

        {error && <Notice kind="error">{error}</Notice>}

        <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-between pt-2">
          {row ? (
            confirmDelete
              ? <button type="button" onClick={remove} disabled={busy} className="btn-outline !text-[#C04040] !border-[#C04040]">Точно удалить?</button>
              : <button type="button" onClick={() => setConfirmDelete(true)} className="btn-outline">Удалить</button>
          ) : <span />}
          <div className="flex gap-2">
            <button type="button" className="btn-outline flex-1" onClick={onClose}>Отмена</button>
            <button className="btn-primary flex-1" disabled={busy}>{busy ? "Сохраняем…" : "Сохранить"}</button>
          </div>
        </div>
      </form>
    </div>
  );
}

function OutfitTable() {
  const [dollType, setDollType] = useState<DollType>("textile");
  const [rows, setRows] = useState<OutfitRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = () => supabase!.from("outfit_items").select("id, doll_type, category, name, color, price, zone, active")
    .eq("doll_type", dollType).order("sort")
    .then(({ data, error }) => error ? setError(error.message) : setRows(data as OutfitRow[]));
  useEffect(() => { setRows(null); load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [dollType]);

  const patch = async (id: string, values: Partial<OutfitRow>) => {
    const { error } = await supabase!.from("outfit_items").update(values).eq("id", id);
    if (error) setError(error.message); else load();
  };

  const add = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const { error } = await supabase!.from("outfit_items").insert({
      doll_type: dollType, category: f.get("category"), name: f.get("name"), color: f.get("color"),
      price: Number(f.get("price")), zone: f.get("zone"), sort: 1000,
    });
    if (error) setError(error.message); else { e.currentTarget.reset(); load(); }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {DOLL_TYPES.map(t => <FilterChip key={t} label={DOLL_META[t].shortLabel} active={dollType === t} onClick={() => setDollType(t)} />)}
      </div>
      <form onSubmit={add} className="card p-4 grid sm:grid-cols-3 lg:grid-cols-6 gap-3 items-center">
        <input name="category" className="input" placeholder="Категория" required />
        <input name="name" className="input" placeholder="Название" required />
        <input name="price" type="number" min={0} className="input" placeholder="Цена" required />
        <select name="zone" className="input" required>
          {(Object.keys(ZONE_LABEL) as OutfitZone[]).map(z => <option key={z} value={z}>{ZONE_LABEL[z]}</option>)}
        </select>
        <input name="color" type="color" defaultValue="#D4B8C7" className="h-10 w-full rounded-xl" />
        <button className="btn-primary">Добавить</button>
      </form>
      {error && <Notice kind="error">{error}</Notice>}
      {rows === null ? <Spinner /> : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm font-['Jost']">
            <thead className="text-left text-xs text-[#8B7B6E]"><tr><th className="p-3">Цвет</th><th className="p-3">Вещь</th><th className="p-3">Зона</th><th className="p-3">Цена, ₽</th><th className="p-3">Показывать</th></tr></thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id} className="border-t">
                  <td className="p-3"><span className="inline-block w-6 h-6 rounded-lg" style={{ background: r.color }} /></td>
                  <td className="p-3">{r.name}<span className="block text-xs text-[#8B7B6E]">{r.category}</span></td>
                  <td className="p-3 text-[#8B7B6E]">{ZONE_LABEL[r.zone]}</td>
                  <td className="p-3">
                    <input type="number" min={0} defaultValue={r.price} className="input w-24 py-1.5"
                      onBlur={e => Number(e.target.value) !== r.price && patch(r.id, { price: Number(e.target.value) })} />
                    <span className="sr-only">{fmt(r.price)}</span>
                  </td>
                  <td className="p-3"><input type="checkbox" className="accent-[#B8975A]" checked={r.active} onChange={e => patch(r.id, { active: e.target.checked })} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
