export type ImageValue = {
  src: string;
  alt: string;
};

export type CardValue = {
  eyebrow: string;
  title: string;
  description: string;
  image: ImageValue;
};

export type MapPoint = {
  id: string;
  label: string;
  x: number;
  y: number;
  logo?: string;
};

export type SiteConfig = {
  seo: { title: string; description: string; noIndex: boolean };
  brand: { title: string; subtitle: string; logo: ImageValue };
  navigation: Array<{ label: string; href: string }>;
  hero: {
    eyebrow: string;
    title: string;
    accent: string;
    lead: string;
    primaryImage: ImageValue;
    secondaryImage: ImageValue;
    photoLabel: string;
    photoCaption: string;
    statValue: string;
    statLabel: string;
    footerLeft: string;
    footerRight: string;
  };
  intro: string[];
  experience: {
    kicker: string;
    title: string;
    accent: string;
    lead: string;
    facts: Array<{ value: string; label: string }>;
    mapTitle: string;
    mapRegion: string;
    mapDescription: string;
    mapImage: ImageValue;
    points: MapPoint[];
  };
  program: {
    kicker: string;
    title: string;
    accent: string;
    intro: string;
    cards: CardValue[];
  };
  team: {
    kicker: string;
    title: string;
    accent: string;
    intro: string;
    quote: string;
    members: Array<{ title: string; credentials?: string; description: string; image: ImageValue }>;
  };
  equipment: {
    kicker: string;
    title: string;
    accent: string;
    description: string;
    items: string[];
  };
  gallery: {
    kicker: string;
    title: string;
    accent: string;
    note: string;
    items: Array<{ eyebrow: string; title: string; image: ImageValue }>;
    carouselKicker: string;
    carouselTitle: string;
    carouselDescription: string;
    carousel: Array<{ caption: string; image: ImageValue }>;
  };
  closing: { kicker: string; title: string; accent: string; description: string; phone: string; email: string };
  footer: { tagline: string; copyright: string };
};

const image = (src: string, alt: string): ImageValue => ({ src, alt });

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  seo: {
    title: "Начальная военная подготовка для детских лагерей",
    description:
      "Начальная военная подготовка для детских лагерей: безопасные практические занятия, опытные инструкторы и собственное оснащение.",
    noIndex: true,
  },
  brand: {
    title: "НВП",
    subtitle: "для детских лагерей",
    logo: image("/assets/logo-transparent.png", "Эмблема проекта"),
  },
  navigation: [
    { label: "Опыт", href: "#experience" },
    { label: "Направления", href: "#program" },
    { label: "Команда", href: "#team" },
    { label: "Галерея", href: "#gallery" },
  ],
  hero: {
    eyebrow: "Практика. Дисциплина. Команда.",
    title: "Начальная военная",
    accent: "подготовка",
    lead: "Проводим образовательные военно-прикладные смены в детских лагерях — безопасно, содержательно и с настоящим командным духом.",
    primaryImage: image("/assets/photos/ocean-lineup.webp", "Отряд на построении вместе с инструктором"),
    secondaryImage: image("/assets/photos/ocean-marching.webp", "Отряд на строевой подготовке"),
    photoLabel: "Реальные смены",
    photoCaption: "Практика · дисциплина · команда",
    statValue: "50+",
    statLabel: "смен по всей России",
    footerLeft: "Работаем по всей России",
    footerRight: "Листайте, чтобы узнать больше ↓",
  },
  intro: [
    "Выездная программа для лагерей",
    "Опытный педагогический состав",
    "Собственное оснащение",
  ],
  experience: {
    kicker: "02 / Опыт, которому доверяют",
    title: "Более 50 реализованных смен",
    accent: "по всей стране",
    lead: "Встраиваем программу в жизнь лагеря: учитываем возраст участников, расписание, инфраструктуру площадки и задачи конкретной смены.",
    facts: [
      { value: "50+", label: "проведённых смен" },
      { value: "РФ", label: "география проектов" },
      { value: "360°", label: "организация под ключ" },
    ],
    mapTitle: "География смен",
    mapRegion: "Россия",
    mapDescription: "Каждая точка — новый лагерь, новая команда и программа, настроенная под площадку.",
    mapImage: image("/assets/russia-outline.svg", "Контурная карта России"),
    points: [
      ["moscow", "Москва", 14, 60], ["voronezh", "Воронеж", 22, 55],
      ["kazan", "Казань", 31, 58], ["perm", "Пермь", 39, 48],
      ["omsk", "Омск", 48, 51], ["krasnoyarsk", "Красноярск", 57, 43],
      ["irkutsk", "Иркутск", 66, 54], ["yakutsk", "Якутск", 74, 47],
      ["khabarovsk", "Хабаровск", 82, 53], ["vladivostok", "Владивосток", 89, 57],
    ].map(([id, label, x, y]) => ({ id: String(id), label: String(label), x: Number(x), y: Number(y) })),
  },
  program: {
    kicker: "03 / Направления подготовки",
    title: "Навыки,",
    accent: "которые работают",
    intro: "Содержание строится вокруг практики, командного взаимодействия и понятных сценариев. Нагрузка адаптируется под возраст участников.",
    cards: [
      ["Полевая практика", "Тактическая подготовка", "Командные задачи, безопасное движение на местности и работа в группе.", "/assets/photos/ocean-field-training.webp"],
      ["Точность и контроль", "Огневая подготовка", "Правила безопасности, устройство учебных макетов и основы меткости.", "/assets/photos/ocean-aiming.webp"],
      ["Первая помощь", "Тактическая медицина", "Алгоритмы первой помощи, эвакуация и практика на учебных сценариях.", "/assets/photos/orlyonok-first-aid.webp"],
      ["Радиообмен", "Связь", "Дисциплина радиообмена, передача координат и постановка задач.", "/assets/photos/ocean-lineup.webp"],
      ["Маршрут и ориентир", "Топография", "Карта, компас, построение маршрута и ориентирование на местности.", "/assets/photos/carousel/orlyonok-equipment.webp"],
      ["Полевые задачи", "Инженерная подготовка", "Основы полевого быта, маскировка и решение прикладных задач.", "/assets/photos/carousel/orlyonok-forest-team.webp"],
      ["Технологии", "Основы БПЛА", "Устройство, безопасное пилотирование и работа экипажа.", "/assets/photos/carousel/orlyonok-instructor-talk.webp"],
      ["Слаженность", "Строевая подготовка", "Дисциплина, ответственность, взаимовыручка и слаженность.", "/assets/photos/ocean-marching.webp"],
      ["Сила и выносливость", "Физическая подготовка", "Развитие выносливости, координации и привычки работать на общий результат.", "/assets/photos/carousel/orlyonok-basketball.webp"],
      ["Уверенность на воде", "Водная безопасность", "Безопасное поведение на воде, взаимопомощь и практические навыки.", "/assets/photos/carousel/orlyonok-swimming.webp"],
      ["Общий результат", "Командные тренинги", "Лидерство, распределение ролей и решение задач вместе с отрядом.", "/assets/photos/carousel/orlyonok-morning-exercise.webp"],
      ["Учебные технологии", "Цифровые тренажёры", "Практика на современных симуляторах и разбор учебных ситуаций.", "/assets/photos/carousel/orlyonok-vr-lab.webp"],
    ].map(([eyebrow, title, description, src]) => ({ eyebrow, title, description, image: image(src, title) })),
  },
  team: {
    kicker: "04 / Инструкторский состав",
    title: "Рядом —",
    accent: "опытные наставники",
    intro: "Инструктор — не просто специалист по своему направлению. Это педагог, который умеет объяснить сложное, вовлечь группу и удерживать высокий стандарт безопасности.",
    quote: "«Строго к задаче. Бережно к ребёнку. Ответственно к результату.»",
    members: [
      ["Военные инструкторы", "Прикладная подготовка и безопасность занятий."],
      ["Специалисты первой помощи", "Алгоритмы помощи и учебные сценарии."],
      ["Педагоги-наставники", "Работа с группой и поддержка участников."],
      ["Инструкторы связи", "Радиообмен и координация команды."],
      ["Инструкторы БПЛА", "Техника и безопасное пилотирование."],
      ["Инструкторы по топографии", "Навигация, карты и ориентирование."],
      ["Инженерная подготовка", "Полевые задачи и оборудование."],
      ["Строевая подготовка", "Дисциплина и командная слаженность."],
      ["Физическая подготовка", "Выносливость и координация."],
      ["Водная безопасность", "Практические занятия у воды."],
      ["Командные тренеры", "Лидерство и распределение ролей."],
      ["Руководители программы", "Сценарий смены и контроль качества."],
    ].map(([title, description]) => ({ title, credentials: "", description, image: image("", `Фотография: ${title}`) })),
  },
  equipment: {
    kicker: "05 / Материально-техническое обеспечение",
    title: "Всё необходимое",
    accent: "привозим с собой",
    description: "Большой комплект оборудования позволяет развернуть насыщенную программу на площадке лагеря и проводить занятия параллельно для нескольких групп.",
    items: ["Учебные макеты и средства защиты", "Медицинские тренажёры и аптечки", "Радиостанции и средства связи", "Навигация и топографические комплекты", "Полевое и тренировочное оборудование", "Комплекты для командных сценариев"],
  },
  gallery: {
    kicker: "06 / Атмосфера смены",
    title: "Когда теория",
    accent: "становится действием",
    note: "В галерее — реальные фотографии из архива программы, смена во ВДЦ «Океан».",
    items: [
      ["Полевая практика", "Научиться действовать", "/assets/photos/ocean-field-training.webp"],
      ["Точность", "Контроль и безопасность", "/assets/photos/ocean-aiming.webp"],
      ["Наставничество", "Строго к задаче", "/assets/photos/ocean-lineup.webp"],
      ["Дисциплина", "Двигаться как команда", "/assets/photos/ocean-marching.webp"],
      ["Характер", "Держать слово", "/assets/photos/ocean-cadets.webp"],
      ["Команда", "Побеждать вместе", "/assets/photos/ocean-team.webp"],
    ].map(([eyebrow, title, src]) => ({ eyebrow, title, image: image(src, title) })),
    carouselKicker: "Галерея / Жизнь лагеря",
    carouselTitle: "Не только занятия",
    carouselDescription: "Спорт, новые технологии, отдых, общение и моменты, из которых складывается настоящая смена.",
    carousel: [
      ["Общее движение", "/assets/photos/carousel/orlyonok-morning-exercise.webp"],
      ["Командный спорт", "/assets/photos/carousel/orlyonok-basketball.webp"],
      ["Бассейн", "/assets/photos/carousel/orlyonok-swimming.webp"],
      ["Лица смены", "/assets/photos/carousel/orlyonok-portrait.webp"],
      ["Игровая площадка", "/assets/photos/carousel/orlyonok-volleyball.webp"],
      ["Новые технологии", "/assets/photos/carousel/orlyonok-vr-lab.webp"],
      ["Между занятиями", "/assets/photos/carousel/orlyonok-camp-rest.webp"],
      ["Живой разговор", "/assets/photos/carousel/orlyonok-instructor-talk.webp"],
      ["Лесная трасса", "/assets/photos/carousel/orlyonok-forest-team.webp"],
      ["Материальная база", "/assets/photos/carousel/orlyonok-equipment.webp"],
    ].map(([caption, src]) => ({ caption, image: image(src, caption) })),
  },
  closing: {
    kicker: "Выездная программа для лагерей",
    title: "Смена, после которой",
    accent: "становятся командой",
    description: "Подготовим содержание под возраст, длительность смены и возможности площадки.",
    phone: "+79774840365",
    email: "Dhdjdh@mail.ru",
  },
  footer: { tagline: "Практика · дисциплина · команда", copyright: "© 2026" },
};

export function normalizeSiteConfig(value: unknown): SiteConfig {
  if (!value || typeof value !== "object") return structuredClone(DEFAULT_SITE_CONFIG);
  return deepMerge(structuredClone(DEFAULT_SITE_CONFIG), value as Record<string, unknown>) as SiteConfig;
}

function deepMerge(target: unknown, source: unknown): unknown {
  if (Array.isArray(target)) return Array.isArray(source) ? source : target;
  if (!target || typeof target !== "object" || !source || typeof source !== "object") return source ?? target;
  const output = target as Record<string, unknown>;
  for (const [key, value] of Object.entries(source as Record<string, unknown>)) {
    output[key] = key in output ? deepMerge(output[key], value) : value;
  }
  return output;
}
