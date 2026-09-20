(() => {
  "use strict";

  const boot = window.NVP_ADMIN;
  let config = structuredClone(boot.config);
  let activeTab = "general";
  let dirty = false;

  const tabs = [
    ["general", "Главная и SEO"],
    ["experience", "Опыт и карта"],
    ["program", "Направления"],
    ["team", "Команда"],
    ["equipment", "Оснащение"],
    ["gallery", "Галерея"],
    ["closing", "Финальный блок"],
  ];

  const editor = document.querySelector("#editor");
  const nav = document.querySelector("#admin-nav");
  const status = document.querySelector("#status");
  const saveButton = document.querySelector("#save-button");

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function read(path) {
    return path.reduce((value, key) => value?.[key], config);
  }

  function write(path, value, rerender = false) {
    let target = config;
    path.slice(0, -1).forEach((key) => { target = target[key]; });
    target[path.at(-1)] = value;
    markDirty();
    if (rerender) render();
  }

  function markDirty() {
    dirty = true;
    saveButton.textContent = "Сохранить изменения";
    setStatus("Есть несохранённые изменения.");
  }

  function setStatus(message, kind = "") {
    status.textContent = message;
    status.className = `notice ${kind}`.trim();
  }

  function panel(title, description = "") {
    const node = el("section", "panel");
    const head = el("div", "panel-head");
    const left = el("div");
    left.append(el("h2", "", title));
    if (description) left.append(el("p", "hint", description));
    head.append(left);
    node.append(head);
    node.body = el("div");
    node.append(node.body);
    node.head = head;
    return node;
  }

  function field(label, path, options = {}) {
    const wrap = el("label", `field ${options.className || ""}`.trim());
    wrap.append(el("span", "", label));
    const input = document.createElement(options.multiline ? "textarea" : "input");
    if (!options.multiline) input.type = options.type || "text";
    if (options.min !== undefined) input.min = String(options.min);
    if (options.max !== undefined) input.max = String(options.max);
    const value = read(path);
    input.value = value ?? "";
    input.addEventListener("input", () => {
      const next = options.type === "number" ? Number(input.value) : input.value;
      write(path, next);
    });
    wrap.append(input);
    return wrap;
  }

  function checkbox(label, path) {
    const wrap = el("label", "checkbox");
    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = Boolean(read(path));
    input.addEventListener("change", () => write(path, input.checked));
    wrap.append(input, el("span", "", label));
    return wrap;
  }

  function button(text, action, className = "button small") {
    const node = el("button", className, text);
    node.type = "button";
    node.addEventListener("click", action);
    return node;
  }

  async function uploadImage(file) {
    const form = new FormData();
    form.append("file", file);
    const response = await fetch("/admin/api.php?action=upload", {
      method: "POST",
      headers: { "X-CSRF-Token": boot.csrf },
      body: form,
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Не удалось загрузить изображение.");
    return result.url;
  }

  function imageField(label, path) {
    const current = read(path) || { src: "", alt: "" };
    const wrap = el("div", "image-editor");
    wrap.append(el("strong", "", label));
    const row = el("div", "image-row");
    const src = String(current.src || "");
    if (src) {
      const image = el("img", "image-preview");
      image.src = src;
      image.alt = "";
      row.append(image);
    } else {
      row.append(el("div", "image-placeholder", "Изображение не загружено"));
    }
    const controls = el("div");
    const uploadLabel = el("label", "upload-label", "Загрузить изображение");
    const file = document.createElement("input");
    file.type = "file";
    file.accept = "image/jpeg,image/png,image/webp,image/gif";
    file.addEventListener("change", async () => {
      if (!file.files?.[0]) return;
      uploadLabel.firstChild.textContent = "Загрузка…";
      try {
        const url = await uploadImage(file.files[0]);
        write(path, { ...current, src: url }, true);
        setStatus("Изображение загружено. Нажмите «Сохранить изменения».", "success");
      } catch (error) {
        setStatus(error.message, "error");
      }
    });
    uploadLabel.append(file);
    controls.append(uploadLabel);
    const alt = field("Описание для доступности и SEO", [...path, "alt"]);
    controls.append(alt);
    if (src) controls.append(button("Убрать изображение", () => write(path, { ...current, src: "" }, true), "button small danger"));
    row.append(controls);
    wrap.append(row);
    return wrap;
  }

  function imageUrlField(label, path) {
    const src = String(read(path) || "");
    const wrap = el("div", "image-editor");
    wrap.append(el("strong", "", label));
    const row = el("div", "image-row");
    if (src) {
      const image = el("img", "image-preview");
      image.src = src;
      image.alt = "";
      row.append(image);
    } else row.append(el("div", "image-placeholder", "Логотип не загружен"));
    const controls = el("div");
    const uploadLabel = el("label", "upload-label", "Загрузить логотип");
    const file = document.createElement("input");
    file.type = "file";
    file.accept = "image/jpeg,image/png,image/webp,image/gif";
    file.addEventListener("change", async () => {
      if (!file.files?.[0]) return;
      try {
        const url = await uploadImage(file.files[0]);
        write(path, url, true);
      } catch (error) { setStatus(error.message, "error"); }
    });
    uploadLabel.append(file);
    controls.append(uploadLabel);
    if (src) controls.append(button("Убрать логотип", () => write(path, "", true), "button small danger"));
    row.append(controls);
    wrap.append(row);
    return wrap;
  }

  function collectionCard(title, index, items, path, renderBody) {
    const card = el("article", "card");
    const head = el("div", "card-head");
    head.append(el("strong", "", `${String(index + 1).padStart(2, "0")} · ${title || "Без названия"}`));
    const actions = el("div", "card-actions");
    if (index > 0) actions.append(button("↑", () => moveItem(items, index, -1, path), "button small"));
    if (index < items.length - 1) actions.append(button("↓", () => moveItem(items, index, 1, path), "button small"));
    actions.append(button("Удалить", () => {
      if (confirm(`Удалить «${title || "элемент"}»?`)) {
        items.splice(index, 1); markDirty(); render();
      }
    }, "button small danger"));
    head.append(actions);
    const body = el("div", "card-body");
    renderBody(body);
    card.append(head, body);
    return card;
  }

  function moveItem(items, index, direction, path) {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    [items[index], items[target]] = [items[target], items[index]];
    write(path, items, true);
  }

  function renderGeneral() {
    const seo = panel("SEO", "Заголовок и описание для поисковых систем.");
    const seoGrid = el("div", "grid");
    seoGrid.append(field("Заголовок страницы", ["seo", "title"]), field("Описание", ["seo", "description"], { multiline: true }), checkbox("Закрыть сайт от индексации", ["seo", "noIndex"]));
    seo.body.append(seoGrid);

    const brand = panel("Бренд и шапка");
    const brandGrid = el("div", "grid");
    brandGrid.append(field("Название", ["brand", "title"]), field("Подзаголовок", ["brand", "subtitle"]), imageField("Логотип", ["brand", "logo"]));
    brand.body.append(brandGrid);

    const hero = panel("Первый экран");
    const heroGrid = el("div", "grid");
    heroGrid.append(field("Рубрика", ["hero", "eyebrow"]), field("Заголовок", ["hero", "title"]), field("Акцент", ["hero", "accent"]), field("Описание", ["hero", "lead"], { multiline: true, className: "span-2" }), field("Подпись фото", ["hero", "photoLabel"]), field("Текст под фото", ["hero", "photoCaption"]), field("Значение", ["hero", "statValue"]), field("Подпись значения", ["hero", "statLabel"]), field("Нижняя подпись слева", ["hero", "footerLeft"]), field("Нижняя подпись справа", ["hero", "footerRight"]), imageField("Основная фотография", ["hero", "primaryImage"]), imageField("Дополнительная фотография", ["hero", "secondaryImage"]));
    hero.body.append(heroGrid);

    const intro = panel("Короткие преимущества");
    const introGrid = el("div", "grid three");
    config.intro.forEach((_, index) => introGrid.append(field(`Пункт ${index + 1}`, ["intro", index])));
    intro.body.append(introGrid);

    const navigation = panel("Навигация в шапке");
    const navigationGrid = el("div", "grid");
    config.navigation.forEach((_, index) => navigationGrid.append(field(`Название ${index + 1}`, ["navigation", index, "label"]), field(`Ссылка ${index + 1}`, ["navigation", index, "href"])));
    navigation.body.append(navigationGrid);

    const security = panel("Безопасность", "Смените выданный пароль после первого входа.");
    const form = el("div", "grid");
    const current = el("input"); current.type = "password"; current.autocomplete = "current-password";
    const next = el("input"); next.type = "password"; next.autocomplete = "new-password";
    const repeat = el("input"); repeat.type = "password"; repeat.autocomplete = "new-password";
    const passwordField = (label, input) => { const wrap = el("label", "field"); wrap.append(el("span", "", label), input); return wrap; };
    form.append(passwordField("Текущий пароль", current), passwordField("Новый пароль — не меньше 12 символов", next), passwordField("Повторите новый пароль", repeat));
    form.append(button("Изменить пароль", async () => {
      if (next.value.length < 12) { setStatus("Новый пароль должен содержать не меньше 12 символов.", "error"); return; }
      if (next.value !== repeat.value) { setStatus("Новые пароли не совпадают.", "error"); return; }
      try {
        const response = await fetch("/admin/api.php?action=password", { method: "POST", headers: { "Content-Type": "application/json", "X-CSRF-Token": boot.csrf }, body: JSON.stringify({ currentPassword: current.value, newPassword: next.value }) });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Не удалось изменить пароль.");
        current.value = next.value = repeat.value = "";
        setStatus("Пароль администратора изменён.", "success");
      } catch (error) { setStatus(error.message, "error"); }
    }, "button primary"));
    security.body.append(form);
    return [seo, brand, hero, intro, navigation, security];
  }

  function renderExperience() {
    const copy = panel("Опыт и цифры");
    const grid = el("div", "grid");
    grid.append(field("Рубрика", ["experience", "kicker"]), field("Заголовок", ["experience", "title"]), field("Красная часть", ["experience", "accent"]), field("Описание", ["experience", "lead"], { multiline: true }));
    config.experience.facts.forEach((_, index) => {
      grid.append(field(`Цифра ${index + 1}`, ["experience", "facts", index, "value"]), field(`Подпись ${index + 1}`, ["experience", "facts", index, "label"]));
    });
    copy.body.append(grid);

    const map = panel("Карта проектов", "Перетаскивайте маркеры мышью или пальцем.");
    const mapGrid = el("div", "grid");
    mapGrid.append(field("Заголовок карты", ["experience", "mapTitle"]), field("Регион", ["experience", "mapRegion"]), field("Описание", ["experience", "mapDescription"], { multiline: true, className: "span-2" }), imageField("Подложка карты", ["experience", "mapImage"]));
    map.body.append(mapGrid, renderMapEditor());
    return [copy, map];
  }

  function renderMapEditor() {
    const wrap = el("div");
    const canvas = el("div", "map-canvas");
    const mapImage = el("img");
    mapImage.src = config.experience.mapImage.src;
    mapImage.alt = config.experience.mapImage.alt || "Карта";
    canvas.append(mapImage);
    config.experience.points.forEach((point, index) => {
      const marker = el("button", `map-point ${point.logo ? "has-logo" : ""}`.trim());
      marker.type = "button";
      marker.title = point.label;
      marker.style.left = `${point.x}%`;
      marker.style.top = `${point.y}%`;
      if (point.logo) { const image = el("img"); image.src = point.logo; image.alt = ""; marker.append(image); }
      let dragging = false;
      marker.addEventListener("pointerdown", (event) => { dragging = true; marker.setPointerCapture(event.pointerId); event.preventDefault(); });
      marker.addEventListener("pointermove", (event) => {
        if (!dragging) return;
        const rect = canvas.getBoundingClientRect();
        point.x = Math.max(0, Math.min(100, Math.round(((event.clientX - rect.left) / rect.width) * 1000) / 10));
        point.y = Math.max(0, Math.min(100, Math.round(((event.clientY - rect.top) / rect.height) * 1000) / 10));
        marker.style.left = `${point.x}%`; marker.style.top = `${point.y}%`; markDirty();
      });
      marker.addEventListener("pointerup", () => { dragging = false; render(); });
      marker.addEventListener("pointercancel", () => { dragging = false; });
      canvas.append(marker);
    });
    wrap.append(canvas);

    const controls = el("div", "points-list");
    config.experience.points.forEach((point, index) => {
      const row = el("div", "point-row");
      const fields = el("div", "point-grid");
      fields.append(field(`Название точки ${index + 1}`, ["experience", "points", index, "label"]), field("X, %", ["experience", "points", index, "x"], { type: "number", min: 0, max: 100 }), field("Y, %", ["experience", "points", index, "y"], { type: "number", min: 0, max: 100 }), button("Удалить", () => {
        if (confirm(`Удалить точку «${point.label}»?`)) { config.experience.points.splice(index, 1); markDirty(); render(); }
      }, "button danger"));
      row.append(fields, imageUrlField("Логотип ВДЦ или лагеря", ["experience", "points", index, "logo"]));
      controls.append(row);
    });
    controls.append(button("+ Добавить точку", () => {
      config.experience.points.push({ id: crypto.randomUUID(), label: `Новая точка ${config.experience.points.length + 1}`, x: 50, y: 50, logo: "" });
      markDirty(); render();
    }, "button primary"));
    wrap.append(controls);
    return wrap;
  }

  function renderProgram() {
    const meta = panel("Направления подготовки");
    const grid = el("div", "grid");
    grid.append(field("Рубрика", ["program", "kicker"]), field("Заголовок", ["program", "title"]), field("Красная часть", ["program", "accent"]), field("Описание", ["program", "intro"], { multiline: true }));
    meta.body.append(grid);
    const list = panel(`Дисциплины · ${config.program.cards.length}`, "Карточки можно добавлять, удалять и менять местами.");
    list.head.append(button("+ Добавить", () => { config.program.cards.push({ eyebrow: "Новое направление", title: "Название", description: "Описание", image: { src: "", alt: "" } }); markDirty(); render(); }, "button primary"));
    const collection = el("div", "collection");
    config.program.cards.forEach((card, index) => collection.append(collectionCard(card.title, index, config.program.cards, ["program", "cards"], (body) => {
      body.append(field("Метка", ["program", "cards", index, "eyebrow"]), field("Название", ["program", "cards", index, "title"]), field("Описание", ["program", "cards", index, "description"], { multiline: true }), imageField("Фотография", ["program", "cards", index, "image"]));
    })));
    list.body.append(collection);
    return [meta, list];
  }

  function renderTeam() {
    const meta = panel("Инструкторский состав");
    const grid = el("div", "grid");
    grid.append(field("Рубрика", ["team", "kicker"]), field("Заголовок", ["team", "title"]), field("Красная часть", ["team", "accent"]), field("Описание", ["team", "intro"], { multiline: true }), field("Цитата", ["team", "quote"], { className: "span-2" }));
    meta.body.append(grid);
    const list = panel(`Специалисты · ${config.team.members.length}`);
    list.head.append(button("+ Добавить", () => { config.team.members.push({ title: "Новый специалист", credentials: "", description: "Описание", image: { src: "", alt: "" } }); markDirty(); render(); }, "button primary"));
    const collection = el("div", "collection");
    config.team.members.forEach((member, index) => collection.append(collectionCard(member.title, index, config.team.members, ["team", "members"], (body) => {
      body.append(field("Роль или имя", ["team", "members", index, "title"]), field("Регалии", ["team", "members", index, "credentials"], { multiline: true }), field("Описание", ["team", "members", index, "description"], { multiline: true }), imageField("Фото сотрудника", ["team", "members", index, "image"]));
    })));
    list.body.append(collection);
    return [meta, list];
  }

  function renderEquipment() {
    const meta = panel("Материально-техническое обеспечение");
    const grid = el("div", "grid");
    grid.append(field("Рубрика", ["equipment", "kicker"]), field("Заголовок", ["equipment", "title"]), field("Красная часть", ["equipment", "accent"]), field("Описание", ["equipment", "description"], { multiline: true }));
    meta.body.append(grid);
    const items = panel("Список оснащения");
    items.head.append(button("+ Добавить", () => { config.equipment.items.push("Новый пункт"); markDirty(); render(); }, "button primary"));
    const list = el("div", "points-list");
    config.equipment.items.forEach((item, index) => {
      const row = el("div", "point-grid");
      const f = field(`Пункт ${index + 1}`, ["equipment", "items", index]);
      f.style.gridColumn = "1 / 4";
      row.append(f, button("Удалить", () => { config.equipment.items.splice(index, 1); markDirty(); render(); }, "button danger"));
      list.append(row);
    });
    items.body.append(list);
    return [meta, items];
  }

  function renderGallery() {
    const meta = panel("Атмосфера смены");
    const grid = el("div", "grid");
    grid.append(field("Рубрика", ["gallery", "kicker"]), field("Заголовок", ["gallery", "title"]), field("Красная часть", ["gallery", "accent"]), field("Примечание", ["gallery", "note"], { multiline: true }));
    meta.body.append(grid);
    const main = panel(`Основная галерея · ${config.gallery.items.length}`);
    main.head.append(button("+ Добавить", () => { config.gallery.items.push({ eyebrow: "Метка", title: "Подпись", image: { src: "", alt: "" } }); markDirty(); render(); }, "button primary"));
    const mainCollection = el("div", "collection");
    config.gallery.items.forEach((item, index) => mainCollection.append(collectionCard(item.title, index, config.gallery.items, ["gallery", "items"], (body) => {
      body.append(field("Метка", ["gallery", "items", index, "eyebrow"]), field("Подпись", ["gallery", "items", index, "title"]), imageField("Фотография", ["gallery", "items", index, "image"]));
    })));
    main.body.append(mainCollection);

    const carousel = panel(`Карусель · ${config.gallery.carousel.length}`);
    const carouselMeta = el("div", "grid");
    carouselMeta.append(field("Рубрика", ["gallery", "carouselKicker"]), field("Заголовок", ["gallery", "carouselTitle"]), field("Описание", ["gallery", "carouselDescription"], { multiline: true, className: "span-2" }));
    carousel.body.append(carouselMeta);
    carousel.head.append(button("+ Добавить", () => { config.gallery.carousel.push({ caption: "Новая фотография", image: { src: "", alt: "" } }); markDirty(); render(); }, "button primary"));
    const carouselCollection = el("div", "collection");
    config.gallery.carousel.forEach((item, index) => carouselCollection.append(collectionCard(item.caption, index, config.gallery.carousel, ["gallery", "carousel"], (body) => {
      body.append(field("Подпись", ["gallery", "carousel", index, "caption"]), imageField("Фотография", ["gallery", "carousel", index, "image"]));
    })));
    carousel.body.append(carouselCollection);
    return [meta, main, carousel];
  }

  function renderClosing() {
    const closing = panel("Финальный блок");
    const grid = el("div", "grid");
    grid.append(field("Рубрика", ["closing", "kicker"]), field("Заголовок", ["closing", "title"]), field("Красная часть", ["closing", "accent"]), field("Описание", ["closing", "description"], { multiline: true }), field("Телефон", ["closing", "phone"]), field("E-mail", ["closing", "email"]));
    closing.body.append(grid);
    const footer = panel("Подвал сайта");
    const footerGrid = el("div", "grid");
    footerGrid.append(field("Слоган", ["footer", "tagline"]), field("Копирайт", ["footer", "copyright"]));
    footer.body.append(footerGrid);
    return [closing, footer];
  }

  function render() {
    nav.replaceChildren();
    tabs.forEach(([id, label]) => {
      const item = button(label, () => { activeTab = id; render(); }, id === activeTab ? "active" : "");
      nav.append(item);
    });
    editor.replaceChildren();
    const renderers = { general: renderGeneral, experience: renderExperience, program: renderProgram, team: renderTeam, equipment: renderEquipment, gallery: renderGallery, closing: renderClosing };
    renderers[activeTab]().forEach((node) => editor.append(node));
  }

  saveButton.addEventListener("click", async () => {
    saveButton.disabled = true;
    saveButton.textContent = "Сохраняем…";
    setStatus("Сохраняем изменения…");
    try {
      const response = await fetch("/admin/api.php?action=config", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "X-CSRF-Token": boot.csrf },
        body: JSON.stringify({ config }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Не удалось сохранить изменения.");
      config = result.config;
      dirty = false;
      saveButton.textContent = "Сохранено";
      setStatus("Изменения сохранены и уже отображаются на сайте.", "success");
    } catch (error) {
      saveButton.textContent = "Повторить сохранение";
      setStatus(error.message, "error");
    } finally {
      saveButton.disabled = false;
    }
  });

  window.addEventListener("beforeunload", (event) => {
    if (!dirty) return;
    event.preventDefault();
    event.returnValue = "";
  });

  render();
})();
