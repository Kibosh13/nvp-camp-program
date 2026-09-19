"use client";

import { useId, useRef, useState } from "react";
import { ExternalLink, Grip, ImageUp, MapPin, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { ImageValue, MapPoint, SiteConfig } from "@/lib/site-config";

type PathPart = string | number;

export function AdminEditor({ initialConfig, userName }: { initialConfig: SiteConfig; userName: string }) {
  const [config, setConfig] = useState(initialConfig);
  const [status, setStatus] = useState("Все изменения сохраняются только после нажатия кнопки «Сохранить». ");
  const [saving, setSaving] = useState(false);

  const setValue = (path: PathPart[], value: unknown) => {
    setConfig((current) => {
      const next = structuredClone(current) as unknown as Record<string, unknown>;
      let cursor: unknown = next;
      for (let index = 0; index < path.length - 1; index += 1) {
        const part = path[index];
        if (Array.isArray(cursor) && typeof part === "number") cursor = cursor[part];
        else if (cursor && typeof cursor === "object") cursor = (cursor as Record<string, unknown>)[String(part)];
        else return current;
      }
      const finalPart = path[path.length - 1];
      if (Array.isArray(cursor) && typeof finalPart === "number") cursor[finalPart] = value;
      else if (cursor && typeof cursor === "object") (cursor as Record<string, unknown>)[String(finalPart)] = value;
      else return current;
      return next as unknown as SiteConfig;
    });
  };

  const save = async () => {
    setSaving(true);
    setStatus("Сохраняем изменения…");
    try {
      const response = await fetch("/api/admin/config", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ config }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Не удалось сохранить");
      setConfig(result.config);
      setStatus("Изменения сохранены и уже отображаются на сайте.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Не удалось сохранить изменения");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f4f3ef] text-[#171717]">
      <header className="sticky top-0 z-40 border-b border-black/10 bg-[#f4f3ef]/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-4 py-4 sm:px-8">
          <div><p className="text-[11px] font-bold uppercase tracking-[.16em] text-[#b51c26]">Панель управления</p><h1 className="text-xl font-bold sm:text-2xl">НВП для детских лагерей</h1><p className="text-xs text-neutral-500">{userName}</p></div>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild><a href="/" target="_blank" rel="noreferrer"><ExternalLink />Сайт</a></Button>
            <Button onClick={save} disabled={saving} className="bg-[#b51c26] text-white hover:bg-[#94171f]"><Save />{saving ? "Сохраняем…" : "Сохранить"}</Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-8">
        <div className="mb-6 rounded-lg border border-black/10 bg-white px-4 py-3 text-sm" aria-live="polite">{status}</div>
        <Tabs defaultValue="general" orientation="vertical" className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
          <TabsList className="h-auto w-full justify-start overflow-x-auto rounded-none border-b border-black/10 bg-transparent p-0 lg:sticky lg:top-[105px] lg:flex-col lg:items-stretch lg:self-start lg:border-b-0 lg:border-r lg:pr-5" variant="line">
            {[["general","Общее и SEO"],["program","Направления"],["team","Команда"],["equipment","Оснащение"],["gallery","Галерея"],["map","Карта"]].map(([value,label]) => <TabsTrigger key={value} value={value} className="justify-start px-3 py-3">{label}</TabsTrigger>)}
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Section title="SEO" description="Заголовок и описание страницы для поисковых систем.">
              <Field label="SEO-заголовок" value={config.seo.title} onChange={(v) => setValue(["seo","title"], v)} />
              <Field label="SEO-описание" value={config.seo.description} multiline onChange={(v) => setValue(["seo","description"], v)} />
              <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={config.seo.noIndex} onChange={(e) => setValue(["seo","noIndex"], e.target.checked)} /> Закрыть сайт от индексации</label>
            </Section>
            <Section title="Бренд и меню" description="Название, логотип и пункты верхней навигации.">
              <div className="grid gap-4 md:grid-cols-2"><Field label="Название" value={config.brand.title} onChange={(v) => setValue(["brand","title"], v)} /><Field label="Подпись" value={config.brand.subtitle} onChange={(v) => setValue(["brand","subtitle"], v)} /></div>
              <ImageField label="Логотип" image={config.brand.logo} onChange={(v) => setValue(["brand","logo"], v)} />
              <div className="grid gap-4 md:grid-cols-2">{config.navigation.map((item,index) => <div className="grid gap-3 rounded-lg border p-4" key={index}><Field label={`Пункт меню ${index + 1}`} value={item.label} onChange={(v) => setValue(["navigation",index,"label"], v)} /><Field label="Ссылка" value={item.href} onChange={(v) => setValue(["navigation",index,"href"], v)} /></div>)}</div>
            </Section>
            <Section title="Кратко о проекте" description="Три тезиса под главным экраном.">
              <div className="grid gap-4 md:grid-cols-3">{config.intro.map((item,index) => <Field key={index} label={`Тезис ${index + 1}`} value={item} onChange={(v) => setValue(["intro",index], v)} />)}</div>
            </Section>
            <Section title="Главный экран" description="Первый экран сайта и его фотографии.">
              <Field label="Надзаголовок" value={config.hero.eyebrow} onChange={(v) => setValue(["hero","eyebrow"], v)} />
              <div className="grid gap-4 md:grid-cols-2"><Field label="Заголовок" value={config.hero.title} onChange={(v) => setValue(["hero","title"], v)} /><Field label="Красная строка" value={config.hero.accent} onChange={(v) => setValue(["hero","accent"], v)} /></div>
              <Field label="Описание" value={config.hero.lead} multiline onChange={(v) => setValue(["hero","lead"], v)} />
              <div className="grid gap-4 xl:grid-cols-2"><ImageField label="Главная фотография" image={config.hero.primaryImage} onChange={(v) => setValue(["hero","primaryImage"], v)} /><ImageField label="Дополнительная фотография" image={config.hero.secondaryImage} onChange={(v) => setValue(["hero","secondaryImage"], v)} /></div>
              <div className="grid gap-4 md:grid-cols-2"><Field label="Метка на фотографии" value={config.hero.photoLabel} onChange={(v) => setValue(["hero","photoLabel"], v)} /><Field label="Подпись на фотографии" value={config.hero.photoCaption} onChange={(v) => setValue(["hero","photoCaption"], v)} /></div>
              <div className="grid gap-4 md:grid-cols-2"><Field label="Значение статистики" value={config.hero.statValue} onChange={(v) => setValue(["hero","statValue"], v)} /><Field label="Подпись статистики" value={config.hero.statLabel} onChange={(v) => setValue(["hero","statLabel"], v)} /></div>
              <div className="grid gap-4 md:grid-cols-2"><Field label="Нижняя подпись слева" value={config.hero.footerLeft} onChange={(v) => setValue(["hero","footerLeft"], v)} /><Field label="Нижняя подпись справа" value={config.hero.footerRight} onChange={(v) => setValue(["hero","footerRight"], v)} /></div>
            </Section>
            <Section title="Опыт" description="Заголовки, описание и три ключевых показателя.">
              <Field label="Рубрика" value={config.experience.kicker} onChange={(v) => setValue(["experience","kicker"], v)} />
              <div className="grid gap-4 md:grid-cols-2"><Field label="Заголовок" value={config.experience.title} onChange={(v) => setValue(["experience","title"], v)} /><Field label="Красная часть" value={config.experience.accent} onChange={(v) => setValue(["experience","accent"], v)} /></div>
              <Field label="Описание" value={config.experience.lead} multiline onChange={(v) => setValue(["experience","lead"], v)} />
              <div className="grid gap-4 md:grid-cols-3">{config.experience.facts.map((fact,index) => <div className="rounded-lg border p-4" key={index}><Field label="Значение" value={fact.value} onChange={(v) => setValue(["experience","facts",index,"value"], v)} /><Field label="Подпись" value={fact.label} onChange={(v) => setValue(["experience","facts",index,"label"], v)} /></div>)}</div>
            </Section>
            <Section title="Финальный блок и подвал">
              <Field label="Рубрика" value={config.closing.kicker} onChange={(v) => setValue(["closing","kicker"], v)} />
              <div className="grid gap-4 md:grid-cols-2"><Field label="Заголовок" value={config.closing.title} onChange={(v) => setValue(["closing","title"], v)} /><Field label="Красная часть" value={config.closing.accent} onChange={(v) => setValue(["closing","accent"], v)} /></div>
              <Field label="Описание" value={config.closing.description} multiline onChange={(v) => setValue(["closing","description"], v)} />
              <div className="grid gap-4 md:grid-cols-2"><Field label="Подпись в подвале" value={config.footer.tagline} onChange={(v) => setValue(["footer","tagline"], v)} /><Field label="Копирайт" value={config.footer.copyright} onChange={(v) => setValue(["footer","copyright"], v)} /></div>
            </Section>
          </TabsContent>

          <TabsContent value="program" className="space-y-6">
            <Section title="Направления подготовки" description="Все тексты и фотографии двенадцати карточек.">
              <Field label="Рубрика" value={config.program.kicker} onChange={(v) => setValue(["program","kicker"], v)} />
              <div className="grid gap-4 md:grid-cols-2"><Field label="Заголовок" value={config.program.title} onChange={(v) => setValue(["program","title"], v)} /><Field label="Красная часть" value={config.program.accent} onChange={(v) => setValue(["program","accent"], v)} /></div>
              <Field label="Описание блока" value={config.program.intro} multiline onChange={(v) => setValue(["program","intro"], v)} />
            </Section>
            <div className="grid gap-5 xl:grid-cols-2">{config.program.cards.map((card,index) => <Section key={index} title={`${String(index + 1).padStart(2,"0")} · ${card.title}`}><Field label="Метка" value={card.eyebrow} onChange={(v) => setValue(["program","cards",index,"eyebrow"], v)} /><Field label="Название" value={card.title} onChange={(v) => setValue(["program","cards",index,"title"], v)} /><Field label="Описание" value={card.description} multiline onChange={(v) => setValue(["program","cards",index,"description"], v)} /><ImageField label="Фотография" image={card.image} onChange={(v) => setValue(["program","cards",index,"image"], v)} /></Section>)}</div>
          </TabsContent>

          <TabsContent value="team" className="space-y-6">
            <Section title="Инструкторский состав"><Field label="Рубрика" value={config.team.kicker} onChange={(v) => setValue(["team","kicker"], v)} /><div className="grid gap-4 md:grid-cols-2"><Field label="Заголовок" value={config.team.title} onChange={(v) => setValue(["team","title"], v)} /><Field label="Красная часть" value={config.team.accent} onChange={(v) => setValue(["team","accent"], v)} /></div><Field label="Описание" value={config.team.intro} multiline onChange={(v) => setValue(["team","intro"], v)} /><Field label="Цитата" value={config.team.quote} onChange={(v) => setValue(["team","quote"], v)} /></Section>
            <div className="grid gap-5 xl:grid-cols-2">{config.team.members.map((member,index) => <Section key={index} title={`${String(index + 1).padStart(2,"0")} · ${member.title}`}><Field label="Роль" value={member.title} onChange={(v) => setValue(["team","members",index,"title"], v)} /><Field label="Описание" value={member.description} multiline onChange={(v) => setValue(["team","members",index,"description"], v)} /><ImageField label="Фото сотрудника" image={member.image} onChange={(v) => setValue(["team","members",index,"image"], v)} /></Section>)}</div>
          </TabsContent>

          <TabsContent value="equipment"><Section title="Материально-техническое обеспечение"><Field label="Рубрика" value={config.equipment.kicker} onChange={(v) => setValue(["equipment","kicker"], v)} /><div className="grid gap-4 md:grid-cols-2"><Field label="Заголовок" value={config.equipment.title} onChange={(v) => setValue(["equipment","title"], v)} /><Field label="Красная часть" value={config.equipment.accent} onChange={(v) => setValue(["equipment","accent"], v)} /></div><Field label="Описание" value={config.equipment.description} multiline onChange={(v) => setValue(["equipment","description"], v)} /><div className="grid gap-4 md:grid-cols-2">{config.equipment.items.map((item,index) => <Field key={index} label={`Пункт ${index + 1}`} value={item} onChange={(v) => setValue(["equipment","items",index], v)} />)}</div></Section></TabsContent>

          <TabsContent value="gallery" className="space-y-6"><Section title="Галерея"><Field label="Рубрика" value={config.gallery.kicker} onChange={(v) => setValue(["gallery","kicker"], v)} /><div className="grid gap-4 md:grid-cols-2"><Field label="Заголовок" value={config.gallery.title} onChange={(v) => setValue(["gallery","title"], v)} /><Field label="Красная часть" value={config.gallery.accent} onChange={(v) => setValue(["gallery","accent"], v)} /></div><Field label="Подпись" value={config.gallery.note} onChange={(v) => setValue(["gallery","note"], v)} /></Section><div className="grid gap-5 xl:grid-cols-2">{config.gallery.items.map((item,index) => <Section key={index} title={`Основная галерея · ${index + 1}`}><Field label="Метка" value={item.eyebrow} onChange={(v) => setValue(["gallery","items",index,"eyebrow"], v)} /><Field label="Подпись" value={item.title} onChange={(v) => setValue(["gallery","items",index,"title"], v)} /><ImageField label="Фотография" image={item.image} onChange={(v) => setValue(["gallery","items",index,"image"], v)} /></Section>)}</div><Section title="Галерея «Не только занятия»"><Field label="Рубрика" value={config.gallery.carouselKicker} onChange={(v) => setValue(["gallery","carouselKicker"], v)} /><Field label="Заголовок" value={config.gallery.carouselTitle} onChange={(v) => setValue(["gallery","carouselTitle"], v)} /><Field label="Описание" value={config.gallery.carouselDescription} multiline onChange={(v) => setValue(["gallery","carouselDescription"], v)} /><div className="grid gap-5 xl:grid-cols-2">{config.gallery.carousel.map((item,index) => <div className="rounded-lg border p-4" key={index}><Field label="Подпись" value={item.caption} onChange={(v) => setValue(["gallery","carousel",index,"caption"], v)} /><ImageField label="Фотография" image={item.image} onChange={(v) => setValue(["gallery","carousel",index,"image"], v)} /></div>)}</div></Section></TabsContent>

          <TabsContent value="map"><MapEditor points={config.experience.points} onChange={(points) => setValue(["experience","points"], points)} title={config.experience.mapTitle} region={config.experience.mapRegion} description={config.experience.mapDescription} mapImage={config.experience.mapImage} setValue={setValue} /></TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return <Card className="gap-5 rounded-none border-black/10 bg-white shadow-none"><CardHeader><CardTitle>{title}</CardTitle>{description ? <CardDescription>{description}</CardDescription> : null}</CardHeader><CardContent className="space-y-4">{children}</CardContent></Card>;
}

function Field({ label, value, onChange, multiline = false }: { label: string; value: string; onChange: (value: string) => void; multiline?: boolean }) {
  const id = useId();
  return <div className="space-y-2"><Label htmlFor={id}>{label}</Label>{multiline ? <Textarea id={id} value={value} onChange={(e) => onChange(e.target.value)} rows={3} /> : <Input id={id} value={value} onChange={(e) => onChange(e.target.value)} />}</div>;
}

function ImageField({ label, image, onChange }: { label: string; image: ImageValue; onChange: (value: ImageValue) => void }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const upload = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const form = new FormData(); form.append("file", file);
      const response = await fetch("/api/admin/media", { method: "POST", body: form });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Ошибка загрузки");
      onChange({ ...image, src: result.url });
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Не удалось загрузить изображение");
    } finally { setUploading(false); }
  };
  return <div className="space-y-3 rounded-lg border border-black/10 p-3"><Label>{label}</Label><div className="flex gap-3">{image.src ? <img src={image.src} alt="" className="h-24 w-32 rounded-md bg-neutral-100 object-cover" /> : <div className="grid h-24 w-32 place-items-center rounded-md bg-neutral-100 text-neutral-400"><ImageUp /></div>}<div className="flex min-w-0 flex-1 flex-col gap-2"><label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium hover:bg-neutral-50"><ImageUp className="size-4" />{uploading ? "Загрузка…" : "Заменить фото"}<input className="sr-only" type="file" accept="image/*" disabled={uploading} onChange={(e) => upload(e.target.files?.[0])} /></label><Input value={image.alt} aria-label="Альтернативное описание" placeholder="Описание изображения" onChange={(e) => onChange({ ...image, alt: e.target.value })} /></div></div>{error ? <p className="text-sm text-red-700" role="alert">{error}</p> : null}</div>;
}

function MapEditor({ points, onChange, title, region, description, mapImage, setValue }: { points: MapPoint[]; onChange: (points: MapPoint[]) => void; title: string; region: string; description: string; mapImage: ImageValue; setValue: (path: PathPart[], value: unknown) => void }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const movePoint = (event: React.PointerEvent) => {
    if (!dragging || !mapRef.current) return;
    const rect = mapRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((event.clientY - rect.top) / rect.height) * 100));
    onChange(points.map((point) => point.id === dragging ? { ...point, x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 } : point));
  };
  const addPoint = () => onChange([...points, { id: crypto.randomUUID(), label: `Новая точка ${points.length + 1}`, x: 50, y: 50 }]);
  const updateCoordinate = (pointId: string, key: "x" | "y", rawValue: string) => {
    const value = Math.max(0, Math.min(100, Number(rawValue) || 0));
    onChange(points.map((point) => point.id === pointId ? { ...point, [key]: value } : point));
  };
  return <div className="space-y-6"><Section title="Карта проектов" description="Перетаскивайте маркеры мышью или пальцем. Точки можно добавлять и удалять."><div className="grid gap-4 md:grid-cols-2"><Field label="Заголовок карты" value={title} onChange={(v) => setValue(["experience","mapTitle"], v)} /><Field label="Регион" value={region} onChange={(v) => setValue(["experience","mapRegion"], v)} /></div><Field label="Описание" value={description} multiline onChange={(v) => setValue(["experience","mapDescription"], v)} /><ImageField label="Подложка карты" image={mapImage} onChange={(image) => setValue(["experience","mapImage"], image)} /><Button type="button" onClick={addPoint} className="bg-[#b51c26] text-white hover:bg-[#94171f]"><Plus />Добавить точку</Button><div ref={mapRef} onPointerMove={movePoint} onPointerUp={() => setDragging(null)} onPointerCancel={() => setDragging(null)} className="relative touch-none overflow-hidden rounded-lg border bg-[#f4f3ef] p-3"><img src={mapImage.src} alt={mapImage.alt} className="w-full opacity-75" />{points.map((point) => <button key={point.id} type="button" title={point.label} onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); setDragging(point.id); }} className="absolute grid size-7 -translate-x-1/2 -translate-y-1/2 cursor-grab place-items-center overflow-hidden rounded-full border-4 border-[#b51c26] bg-white shadow-[0_0_0_6px_rgba(181,28,38,.14)] active:cursor-grabbing" style={{ left:`${point.x}%`, top:`${point.y}%` }}>{point.logo ? <img src={point.logo} alt="" className="h-full w-full object-contain" /> : <MapPin className="size-3 text-[#b51c26]" />}</button>)}</div></Section><Section title={`Точки на карте · ${points.length}`}><div className="grid gap-3">{points.map((point,index) => <div className="space-y-3 rounded-lg border p-3" key={point.id}><div className="grid items-end gap-3 sm:grid-cols-[auto_1fr_100px_100px_auto]"><Grip className="mb-2 text-neutral-400" /><Field label={`Название ${index + 1}`} value={point.label} onChange={(v) => onChange(points.map((p) => p.id === point.id ? {...p,label:v}:p))} /><Field label="X, %" value={String(point.x)} onChange={(v) => updateCoordinate(point.id, "x", v)} /><Field label="Y, %" value={String(point.y)} onChange={(v) => updateCoordinate(point.id, "y", v)} /><AlertDialog><AlertDialogTrigger asChild><Button variant="outline" size="icon" aria-label={`Удалить ${point.label}`}><Trash2 /></Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Удалить точку «{point.label}»?</AlertDialogTitle><AlertDialogDescription>Она исчезнет с карты после сохранения изменений.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Отмена</AlertDialogCancel><AlertDialogAction variant="destructive" onClick={() => onChange(points.filter((p) => p.id !== point.id))}>Удалить</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></div><ImageField label="Логотип лагеря" image={{src:point.logo ?? "", alt:""}} onChange={(image) => onChange(points.map((p) => p.id === point.id ? {...p,logo:image.src}:p))} /></div>)}</div></Section></div>;
}
