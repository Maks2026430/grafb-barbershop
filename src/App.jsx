import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Home,
  Scissors,
  MessageCircle,
  CalendarCheck,
  ChevronLeft,
  Send,
  Loader2,
  MapPin,
  Award,
  Clock,
  Star,
  Sparkles,
} from "lucide-react";
import imgIgor from "./assets/barber1.jpg";
import imgArtem from "./assets/barber2.jpg";
import imgDenis from "./assets/barber3.jpg";
import imgMikhail from "./assets/barber4.jpg";
import imgOleg from "./assets/oleg.jpg";
import imgKirill from "./assets/kirill.jpg";
import imgHero from "./assets/group2.jpg";
import imgAbout from "./assets/about.jpg";

/* ============================== DATA ============================== */

const SALON = {
  name: "ГРАФЪ",
  city: "Москва",
  address: "ул. Покровка, 18",
  hours: "Пн–Вс · 10:00–22:00",
};

// Интерактивная карта Яндекса. API-ключ не нужен. Координаты салона в формате
// "долгота,широта" (порядок Яндекса). pt=...,pm2rdm — красная метка на адресе.
const MAP_COORDS = "37.646363,55.758630"; // ул. Покровка, 18, Москва
const MAP_QUERY = encodeURIComponent(`${SALON.city}, ${SALON.address}`);
const MAP_SRC = `https://yandex.ru/map-widget/v1/?ll=${MAP_COORDS}&z=17&pt=${MAP_COORDS},pm2rdm`;
const MAP_LINK = `https://yandex.ru/maps/?ll=${MAP_COORDS}&z=17&pt=${MAP_COORDS},pm2rdm&text=${MAP_QUERY}`;

const SERVICES = [
  {
    id: "cut",
    name: "Стрижка машинкой и ножницами",
    price: 1800,
    duration: 40,
    desc: "Базовая стрижка любой сложности под форму головы и густоту волос.",
  },
  {
    id: "cut_beard",
    name: "Стрижка + борода",
    price: 2500,
    duration: 60,
    desc: "Комплекс: голова и борода приводятся к одной форме за один визит.",
  },
  {
    id: "beard",
    name: "Оформление бороды",
    price: 1200,
    duration: 30,
    desc: "Контур, длина и текстура — без машинки наугад.",
  },
  {
    id: "shave",
    name: "Королевское бритьё опасной бритвой",
    price: 1500,
    duration: 45,
    desc: "Горячее полотенце, пена для бритья и сорок пять минут тишины.",
  },
  {
    id: "grey",
    name: "Камуфляж седины",
    price: 900,
    duration: 20,
    desc: "Естественный тон волос без эффекта окрашивания.",
  },
  {
    id: "kids",
    name: "Детская стрижка",
    price: 1300,
    duration: 30,
    desc: "Терпеливо, быстро и без слёз — для клиентов до 10 лет.",
  },
];

const BARBERS = [
  {
    id: "igor",
    name: "Игорь Соколов",
    role: "Старший мастер",
    years: 12,
    tag: "Классические стрижки",
    photo:
      imgIgor,
  },
  {
    id: "artem",
    name: "Артём Волков",
    role: "Барбер-стилист",
    years: 7,
    tag: "Борода и опасная бритва",
    photo:
      imgArtem,
  },
  {
    id: "denis",
    name: "Денис Орлов",
    role: "Мастер фейдов",
    years: 5,
    tag: "Сложные формы",
    photo:
      imgDenis,
  },
  {
    id: "mikhail",
    name: "Михаил Гранин",
    role: "Барбер-стилист",
    years: 4,
    tag: "Текстуры и кроп",
    photo:
      imgMikhail,
  },
  {
    id: "oleg",
    name: "Олег Бергман",
    role: "Мастер классики",
    years: 9,
    tag: "Помадные укладки",
    photo:
      imgOleg,
  },
  {
    id: "kirill",
    name: "Кирилл Завьялов",
    role: "Барбер",
    years: 6,
    tag: "Густые и кудрявые волосы",
    photo:
      imgKirill,
  },
];

// Раздел "Почему выбирают нас" на главной. icon — компонент из lucide-react.
const FEATURES = [
  {
    icon: Award,
    title: "Мастера со стажем",
    text: "Средний опыт в зале — 7 лет, у старшего мастера — 12. Случайных людей за креслом нет.",
  },
  {
    icon: Scissors,
    title: "Классика и опасная бритва",
    text: "Горячее полотенце, королевское бритьё и помадные укладки — ремесло, которое знают не везде.",
  },
  {
    icon: Clock,
    title: "Без спешки",
    text: "Сорок минут тишины вместо конвейера. Мы не загоняем по десять клиентов в час.",
  },
  {
    icon: Star,
    title: "Помним вас",
    text: "Мастер помнит, как вы стриглись в прошлый раз — без расчёски наугад и лишних вопросов.",
  },
  {
    icon: Sparkles,
    title: "Премиальный уход",
    text: "Горячее полотенце, профессиональная косметика и стайлинг — голова и борода в порядке до следующего визита.",
  },
  {
    icon: CalendarCheck,
    title: "Запись в пару касаний",
    text: "Выбрали мастера, день и время прямо в приложении — без звонков и ожидания на линии.",
  },
];

const HERO_IMG =
  imgHero;
const ABOUT_IMG =
  imgAbout;

const SUGGESTIONS = [
  "Сколько стоит борода?",
  "Кто лучше делает фейд?",
  "Запишите меня на стрижку",
];

const GREETING =
  "Добрый вечер. Я — цифровой консьерж ГРАФЪ. Расскажу об услугах, мастерах и подберу удобное время. Что вас интересует?";

/* ============================== HELPERS ============================== */

function seededRandom(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  }
  return function () {
    h = Math.imul(h ^ (h >>> 15), h | 1);
    h ^= h + Math.imul(h ^ (h >>> 7), h | 61);
    return ((h ^ (h >>> 14)) >>> 0) / 4294967296;
  };
}

function generateSlots(dateKey, barberId) {
  const rand = seededRandom(dateKey + barberId);
  const slots = [];
  for (let hour = 10; hour < 22; hour++) {
    for (const min of [0, 30]) {
      const time = `${String(hour).padStart(2, "0")}:${min === 0 ? "00" : "30"}`;
      slots.push({ time, occupied: rand() < 0.35 });
    }
  }
  return slots;
}

function nextDays(n) {
  const weekdays = ["вс", "пн", "вт", "ср", "чт", "пт", "сб"];
  const months = [
    "янв", "фев", "мар", "апр", "мая", "июн",
    "июл", "авг", "сен", "окт", "ноя", "дек",
  ];
  const today = new Date();
  const days = [];
  for (let i = 0; i < n; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push({
      key: d.toISOString().slice(0, 10),
      weekday: weekdays[d.getDay()],
      day: d.getDate(),
      month: months[d.getMonth()],
    });
  }
  return days;
}

function buildSystemPrompt() {
  const menu = SERVICES.map(
    (s) => `- ${s.name} — ${s.price}₽, ${s.duration} мин`
  ).join("\n");
  const team = BARBERS.map(
    (b) => `- ${b.name} — ${b.role}, ${b.years} лет опыта, специализация: ${b.tag}`
  ).join("\n");

  return `Ты — цифровой консьерж барбершопа «${SALON.name}» в ${SALON.city} (${SALON.address}, ${SALON.hours}).
Тон: уверенный, лаконичный, по-мужски сдержанный, как хороший мастер за креслом. Без эмодзи и слащавости.

Меню услуг:
${menu}

Мастера:
${team}

Правила:
1. Отвечай только на темы услуг, цен, мастеров, ухода за волосами/бородой и записи в "${SALON.name}". На посторонние вопросы вежливо возвращай к теме барбершопа.
2. Если пользователь явно хочет записаться или спрашивает про свободное время — поставь suggestBooking=true и укажи service: точное название услуги из меню выше, если оно понятно из контекста, иначе null.
3. Отвечай ТОЛЬКО валидным JSON без markdown и кодовых блоков, строго в формате:
{"reply": "string", "suggestBooking": boolean, "service": "string или null"}
4. reply — 1–3 коротких предложения на русском.`;
}

/* ============================== TELEGRAM WEBAPP SDK ============================== */

function getTg() {
  return typeof window !== "undefined" ? window.Telegram?.WebApp : null;
}

function tgHaptic(style = "light") {
  try {
    getTg()?.HapticFeedback?.impactOccurred(style);
  } catch (e) {}
}

function tgNotify(type = "success") {
  try {
    getTg()?.HapticFeedback?.notificationOccurred(type);
  } catch (e) {}
}

function initTelegram(tg) {
  try {
    tg.ready();
    tg.expand();
    tg.setHeaderColor && tg.setHeaderColor("#0B0B0C");
    tg.setBackgroundColor && tg.setBackgroundColor("#0B0B0C");
    tg.disableVerticalSwipes && tg.disableVerticalSwipes();
  } catch (e) {}
}

// Адрес вашего бэкенда-прокси для ИИ-консультанта.
// Задаётся через переменную окружения VITE_AI_ENDPOINT (см. .env.example).
// Бэкенд должен принять { system, messages } и вернуть ответ OpenAI Chat Completions.
// Если переменная не задана — чат работает в демо-режиме (см. mockConsultant ниже).
const AI_ENDPOINT = import.meta.env.VITE_AI_ENDPOINT || "";

// Простой офлайн-ответчик на случай отсутствия бэкенда: ключевые слова -> ответ.
// Это НЕ настоящий ИИ, а заглушка, чтобы демо работало сразу после `npm run dev`.
function mockConsultant(history) {
  const last = (history[history.length - 1]?.content || "").toLowerCase();
  const wantsBooking = /запиш|записать|свобод|время|слот|окошк|когда можно/.test(last);
  let service = null;
  if (/борода|бород/.test(last)) service = "Оформление бороды";
  else if (/бритьё|брить|бритв/.test(last)) service = "Королевское бритьё опасной бритвой";
  else if (/фейд|стрижк/.test(last)) service = "Стрижка машинкой и ножницами";

  let reply;
  if (wantsBooking) {
    reply = "Конечно, подберём удобное время. Нажмите кнопку ниже — откроется выбор мастера, дня и слота.";
  } else if (/цен|стоит|сколько/.test(last)) {
    reply = "Стрижка — от 1800₽, борода — 1200₽, комплекс «стрижка + борода» — 2500₽. Полный прайс на вкладке «Услуги».";
  } else if (/мастер|кто|фейд/.test(last)) {
    reply = "Фейды лучше всех делает Денис Орлов, бороду и опасную бритву ведёт Артём Волков. Всего в зале шесть мастеров.";
  } else {
    reply = "Я подскажу по услугам, ценам и мастерам ГРАФЪ или помогу записаться. Что вас интересует?";
  }
  return { reply, suggestBooking: wantsBooking, service };
}

async function askConsultant(history) {
  // Демо-режим: бэкенд не настроен — отвечаем заглушкой.
  if (!AI_ENDPOINT) {
    await new Promise((r) => setTimeout(r, 500));
    return mockConsultant(history);
  }

  const res = await fetch(AI_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      max_tokens: 1000,
      system: buildSystemPrompt(),
      messages: history,
    }),
  });
  // Ошибку HTTP (нет ключа, 401, 429 и т.п.) пробрасываем — ChatView покажет
  // сообщение об ошибке вместо пустого пузыря.
  if (!res.ok) {
    throw new Error(`AI endpoint вернул статус ${res.status}`);
  }
  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content;
  if (!raw) {
    throw new Error("Пустой ответ от AI endpoint");
  }
  const cleaned = raw.replace(/```json|```/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    // Модель ответила не-JSON — показываем текст как обычный ответ.
    return { reply: cleaned, suggestBooking: false, service: null };
  }
}

/* ============================== ATOMS ============================== */

function WaxSeal({ size = 40, stamped = false }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={stamped ? "seal-stamp" : ""}
    >
      <defs>
        <radialGradient id="sealGrad" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#E8C766" />
          <stop offset="55%" stopColor="#C9A227" />
          <stop offset="100%" stopColor="#8a6f1a" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="46" fill="url(#sealGrad)" stroke="#3a2f12" strokeWidth="1.5" />
      <circle cx="50" cy="50" r="38" fill="none" stroke="#0B0B0C" strokeWidth="1" opacity="0.35" />
      <text
        x="50"
        y="64"
        textAnchor="middle"
        fontFamily="Playfair Display, Georgia, serif"
        fontSize="46"
        fontWeight="700"
        fill="#0B0B0C"
      >
        Г
      </text>
    </svg>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="summary-row">
      <span className="summary-label">{label}</span>
      <span className="summary-value">{value}</span>
    </div>
  );
}

function MainButton({ label, onClick, disabled }) {
  return (
    <div className="mainbutton-wrap">
      <button className="mainbutton" disabled={disabled} onClick={onClick}>
        {label}
      </button>
    </div>
  );
}

/* ============================== HEADER / TABBAR ============================== */

const TAB_TITLES = {
  home: "Главная",
  services: "Услуги",
  chat: "ИИ-консьерж",
  booking: "Запись",
};

function AppHeader({ tab }) {
  return (
    <div className="app-header">
      <div className="header-left">
        <WaxSeal size={22} />
        <span className="header-brand">{SALON.name}</span>
      </div>
      <span className="header-section">{TAB_TITLES[tab]}</span>
    </div>
  );
}

function TabBar({ tab, setTab }) {
  const items = [
    { id: "home", label: "Главная", icon: Home },
    { id: "services", label: "Услуги", icon: Scissors },
    { id: "chat", label: "ИИ-чат", icon: MessageCircle },
    { id: "booking", label: "Запись", icon: CalendarCheck },
  ];
  return (
    <div className="tabbar">
      {items.map((it) => {
        const Icon = it.icon;
        const active = tab === it.id;
        return (
          <button
            key={it.id}
            className="tabbtn"
            onClick={() => setTab(it.id)}
            style={{ color: active ? "var(--gold-bright)" : "var(--text-muted)" }}
          >
            <Icon size={20} strokeWidth={active ? 2.2 : 1.7} />
            <span className="tabbtn-label">{it.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ============================== HOME ============================== */

function HomeView({ goBooking, setTab }) {
  return (
    <div>
      <div className="hero">
        <img src={HERO_IMG} alt="Интерьер ГРАФЪ" className="hero-img" />
        <div className="hero-overlay" />
        <div className="hero-content">
          <span className="eyebrow">Барбершоп · {SALON.city}</span>
          <h1 className="hero-title">{SALON.name}</h1>
          <p className="hero-sub">
            Машинка, опасная бритва и сорок минут тишины — то, что нужно мужчине
            раз в три недели.
          </p>
          <div className="cta-row">
            <button className="btn-primary" onClick={() => goBooking(null)}>
              Записаться
            </button>
            <button className="btn-secondary" onClick={() => setTab("chat")}>
              Спросить ИИ-консультанта
            </button>
          </div>
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">О ГРАФЪ</h2>
        <div className="about-block">
          <img src={ABOUT_IMG} alt="Зал ГРАФЪ" className="about-img" />
          <p className="about-text">
            Здесь не спешат. Кожаные кресла, опасная бритва и мастера, которые
            помнят, как вы стриглись в прошлый раз — без расчёски на бегу и
            конвейера из десяти клиентов в час.
          </p>
        </div>
        <div className="info-line">
          <MapPin size={14} />
          <span>{SALON.address} · {SALON.hours}</span>
        </div>
      </div>

      <div className="section">
        <div className="section-head-row">
          <h2 className="section-title">Услуги</h2>
          <button className="link-more" onClick={() => setTab("services")}>
            Все услуги →
          </button>
        </div>
        <div className="stack">
          {SERVICES.slice(0, 3).map((s) => (
            <button
              key={s.id}
              className="service-card"
              onClick={() => goBooking(s.name)}
            >
              <div>
                <div className="service-name">{s.name}</div>
                <div className="service-meta">{s.duration} мин</div>
              </div>
              <div className="service-price">{s.price} ₽</div>
            </button>
          ))}
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">Мастера</h2>
        <div className="team-grid">
          {BARBERS.map((b) => (
            <div key={b.id} className="team-card">
              <img src={b.photo} alt={b.name} className="team-photo" />
              <div className="team-name">{b.name}</div>
              <div className="team-role">{b.role}</div>
              <div className="team-years">{b.years} лет опыта</div>
            </div>
          ))}
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">Почему выбирают нас</h2>
        <div className="features">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="feature-card">
                <div className="feature-icon">
                  <Icon size={18} />
                </div>
                <div className="feature-title">{f.title}</div>
                <div className="feature-text">{f.text}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">Как нас найти</h2>
        <div className="map-wrap">
          <iframe
            className="map-frame"
            src={MAP_SRC}
            title={`${SALON.name} на карте`}
            loading="lazy"
            allowFullScreen
          />
        </div>
        <a
          className="map-link"
          href={MAP_LINK}
          target="_blank"
          rel="noopener noreferrer"
        >
          <MapPin size={14} />
          <span>{SALON.address} · открыть в Яндекс.Картах</span>
        </a>
      </div>

      <div className="footer">
        <WaxSeal size={28} />
        <div className="footer-name">{SALON.name}</div>
        <div className="footer-line">{SALON.address}</div>
        <div className="footer-line">{SALON.hours}</div>
      </div>

      <MainButton label="Записаться" onClick={() => goBooking(null)} />
    </div>
  );
}

/* ============================== SERVICES ============================== */

function ServicesView({ goBooking }) {
  return (
    <div className="section">
      <h2 className="section-title">Все услуги</h2>
      <div className="stack">
        {SERVICES.map((s) => (
          <div key={s.id} className="service-card-full">
            <div className="service-top">
              <div className="service-name">{s.name}</div>
              <div className="service-price">{s.price} ₽</div>
            </div>
            <p className="service-desc">{s.desc}</p>
            <div className="service-bottom">
              <span className="service-meta">{s.duration} мин</span>
              <button className="btn-small" onClick={() => goBooking(s.name)}>
                Записаться
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================== CHAT ============================== */

function ChatView({ goBooking }) {
  const [messages, setMessages] = useState([
    { role: "assistant", content: GREETING, seed: true },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(text) {
    const clean = text.trim();
    if (!clean || loading) return;
    tgHaptic("light");
    const next = [...messages, { role: "user", content: clean }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const apiHistory = next
        .filter((m) => !m.seed)
        .map(({ role, content }) => ({ role, content }));
      const result = await askConsultant(apiHistory);
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: result.reply,
          suggestBooking: result.suggestBooking,
          service: result.service,
        },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            "Не получилось связаться с консультантом. Проверьте соединение и попробуйте снова.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="chat-wrap">
      <div className="chat-area">
        {messages.map((m, i) => (
          <div key={i} className={"msg-row " + (m.role === "user" ? "msg-user" : "msg-assistant")}>
            {m.role === "assistant" && <WaxSeal size={26} />}
            <div className="msg-bubble">
              {m.content}
              {m.suggestBooking && (
                <button
                  className="btn-chip"
                  onClick={() => goBooking(m.service || null)}
                >
                  Записаться{m.service ? ` на «${m.service}»` : ""}
                </button>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="msg-row msg-assistant">
            <WaxSeal size={26} />
            <div className="msg-bubble typing-bubble">
              <Loader2 size={14} className="spin" />
              <span>печатает…</span>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {messages.length <= 1 && (
        <div className="chat-suggestions">
          {SUGGESTIONS.map((s) => (
            <button key={s} className="chip" onClick={() => send(s)}>
              {s}
            </button>
          ))}
        </div>
      )}

      <form
        className="chat-input-row"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <input
          className="chat-input"
          placeholder="Спросите об услугах или мастерах…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit" className="chat-send" disabled={loading || !input.trim()}>
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}

/* ============================== BOOKING ============================== */

function BookingSuccess({ booking, reset }) {
  const code = useMemo(
    () => "ГР-" + Math.random().toString(36).slice(2, 7).toUpperCase(),
    []
  );
  const service = SERVICES.find((s) => s.name === booking.service);
  return (
    <div className="success-wrap">
      <WaxSeal size={88} stamped />
      <h2 className="success-title">Запись подтверждена</h2>
      <p className="success-sub">Ждём вас — мастер уже знает, что вы придёте.</p>
      <div className="ticket">
        <SummaryRow label="Услуга" value={booking.service} />
        <SummaryRow label="Мастер" value={booking.barber?.name} />
        <SummaryRow
          label="Когда"
          value={`${booking.date?.day} ${booking.date?.month}, ${booking.time}`}
        />
        <SummaryRow label="Стоимость" value={service ? `${service.price} ₽` : "—"} />
        <SummaryRow label="Код брони" value={code} />
      </div>
      <button className="ghost-btn" onClick={reset}>
        Записать ещё раз
      </button>
    </div>
  );
}

function BookingView({ booking, setBooking, goHome, onConfirm }) {
  const steps = ["Услуга", "Мастер", "Дата", "Время", "Подтверждение"];
  const step = booking.step;

  const days = useMemo(() => nextDays(14), []);
  const slots = useMemo(
    () =>
      booking.barber && booking.date
        ? generateSlots(booking.date.key, booking.barber.id)
        : [],
    [booking.barber, booking.date]
  );

  function selectService(s) {
    tgHaptic("light");
    setBooking((b) => ({ ...b, service: s.name, step: 2 }));
  }
  function selectBarber(b2) {
    tgHaptic("light");
    setBooking((b) => ({ ...b, barber: b2, step: 3 }));
  }
  function selectDate(d) {
    tgHaptic("light");
    setBooking((b) => ({ ...b, date: d, time: null, step: 4 }));
  }
  function selectTime(t) {
    tgHaptic("light");
    setBooking((b) => ({ ...b, time: t, step: 5 }));
  }
  function reset() {
    setBooking({
      step: 1,
      service: null,
      barber: null,
      date: null,
      time: null,
      confirmed: false,
    });
  }
  function backStep() {
    if (step === 1) {
      goHome();
      return;
    }
    tgHaptic("light");
    setBooking((b) => ({ ...b, step: b.step - 1 }));
  }

  if (booking.confirmed) {
    return <BookingSuccess booking={booking} reset={reset} />;
  }

  return (
    <div>
      <div className="step-row">
        <button className="back-btn" onClick={backStep}>
          <ChevronLeft size={18} />
        </button>
        <div className="step-dots">
          {steps.map((s, i) => (
            <span key={s} className={"dot" + (i + 1 <= step ? " dot-active" : "")} />
          ))}
        </div>
      </div>

      <h2 className="section-title step-title">{steps[step - 1]}</h2>

      {step === 1 && (
        <div className="stack">
          {SERVICES.map((s) => (
            <button
              key={s.id}
              className={"pick-card" + (booking.service === s.name ? " pick-active" : "")}
              onClick={() => selectService(s)}
            >
              <div>
                <div className="pick-title">{s.name}</div>
                <div className="pick-sub">{s.duration} мин</div>
              </div>
              <div className="pick-price">{s.price} ₽</div>
            </button>
          ))}
        </div>
      )}

      {step === 2 && (
        <div className="stack">
          {BARBERS.map((b) => (
            <button
              key={b.id}
              className={"barber-pick" + (booking.barber?.id === b.id ? " pick-active" : "")}
              onClick={() => selectBarber(b)}
            >
              <img src={b.photo} alt={b.name} className="barber-pick-img" />
              <div>
                <div className="pick-title">{b.name}</div>
                <div className="pick-sub">{b.role} · {b.tag}</div>
              </div>
            </button>
          ))}
        </div>
      )}

      {step === 3 && (
        <div className="date-scroll">
          {days.map((d) => (
            <button
              key={d.key}
              className={"date-chip" + (booking.date?.key === d.key ? " pick-active" : "")}
              onClick={() => selectDate(d)}
            >
              <span className="date-weekday">{d.weekday}</span>
              <span className="date-day">{d.day}</span>
              <span className="date-month">{d.month}</span>
            </button>
          ))}
        </div>
      )}

      {step === 4 && (
        <div className="slot-grid">
          {slots.map((s) => (
            <button
              key={s.time}
              disabled={s.occupied}
              className={
                "slot" +
                (s.occupied ? " slot-off" : "") +
                (booking.time === s.time ? " pick-active" : "")
              }
              onClick={() => selectTime(s.time)}
            >
              {s.time}
            </button>
          ))}
        </div>
      )}

      {step === 5 && (
        <div className="summary-card">
          <SummaryRow label="Услуга" value={booking.service} />
          <SummaryRow label="Мастер" value={booking.barber?.name} />
          <SummaryRow
            label="Дата"
            value={`${booking.date?.day} ${booking.date?.month}, ${booking.date?.weekday}`}
          />
          <SummaryRow label="Время" value={booking.time} />
          <SummaryRow
            label="Стоимость"
            value={`${SERVICES.find((s) => s.name === booking.service)?.price ?? "—"} ₽`}
          />
        </div>
      )}

      {step < 5 && <div className="hint-text">Шаг {step} из 5</div>}

      {step === 5 && <MainButton label="Подтвердить запись" onClick={onConfirm} />}
    </div>
  );
}

/* ============================== APP ============================== */

export default function App() {
  const [tab, setTab] = useState("home");
  const [booking, setBooking] = useState({
    step: 1,
    service: null,
    barber: null,
    date: null,
    time: null,
    confirmed: false,
  });

  function goBooking(serviceName) {
    tgHaptic("light");
    setBooking((b) => ({
      step: 1,
      service: serviceName,
      barber: null,
      date: null,
      time: null,
      confirmed: false,
      ...(serviceName ? { service: serviceName, step: 2 } : {}),
    }));
    setTab("booking");
  }

  function confirmBooking() {
    setBooking((b) => ({ ...b, confirmed: true }));
    tgNotify("success");
  }

  // SDK подключён через тег <script> в index.html. Внутри Telegram объект
  // window.Telegram.WebApp уже доступен; вне Telegram — undefined, и весь
  // Telegram-код ниже тихо ничего не делает (приложение работает как обычный сайт).
  useEffect(() => {
    const tg = getTg();
    if (tg) initTelegram(tg);
  }, []);

  // Нативная кнопка "Назад" Telegram вместо/вместе с системной навигацией
  useEffect(() => {
    const tg = getTg();
    if (!tg || !tg.BackButton) return;
    function handleBack() {
      tgHaptic("light");
      if (tab === "booking" && booking.step > 1 && !booking.confirmed) {
        setBooking((b) => ({ ...b, step: b.step - 1 }));
      } else {
        setTab("home");
      }
    }
    if (tab === "home") {
      tg.BackButton.hide();
    } else {
      tg.BackButton.show();
    }
    tg.BackButton.onClick(handleBack);
    return () => {
      try {
        tg.BackButton.offClick(handleBack);
      } catch (e) {}
    };
  }, [tab, booking.step, booking.confirmed]);

  // Нативная MainButton Telegram дублирует основное действие экрана
  useEffect(() => {
    const tg = getTg();
    if (!tg || !tg.MainButton) return;
    let action = null;
    if (tab === "home") {
      tg.MainButton.setText("ЗАПИСАТЬСЯ");
      action = () => goBooking(null);
    } else if (tab === "booking" && booking.step === 5 && !booking.confirmed) {
      tg.MainButton.setText("ПОДТВЕРДИТЬ ЗАПИСЬ");
      action = () => confirmBooking();
    }
    if (action) {
      tg.MainButton.show();
      tg.MainButton.onClick(action);
    } else {
      tg.MainButton.hide();
    }
    return () => {
      if (action) {
        try {
          tg.MainButton.offClick(action);
        } catch (e) {}
      }
    };
  }, [tab, booking.step, booking.confirmed]);

  function changeTab(next) {
    tgHaptic("light");
    setTab(next);
  }

  return (
    <div className="grafb-root">
      <style>{CSS}</style>
      <div className="phone">
        <AppHeader tab={tab} />
        <div className="scroll-area">
          {tab === "home" && <HomeView goBooking={goBooking} setTab={changeTab} />}
          {tab === "services" && <ServicesView goBooking={goBooking} />}
          {tab === "chat" && <ChatView goBooking={goBooking} />}
          {tab === "booking" && (
            <BookingView
              booking={booking}
              setBooking={setBooking}
              goHome={() => setTab("home")}
              onConfirm={confirmBooking}
            />
          )}
        </div>
        <TabBar tab={tab} setTab={changeTab} />
      </div>
    </div>
  );
}

/* ============================== STYLES ============================== */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=Manrope:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

.grafb-root {
  --bg: #0B0B0C;
  --bg-elev: #16151A;
  --bg-elev2: #1D1B1F;
  --gold: #C9A227;
  --gold-bright: #E8C766;
  --ink: #0B0B0C;
  --text: #F2EFE9;
  --text-muted: #948B7C;
  --hairline: #2A2620;
  --font-display: 'Playfair Display', Georgia, 'Times New Roman', serif;
  --font-body: 'Manrope', -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif;
  --font-mono: 'JetBrains Mono', 'SF Mono', Consolas, monospace;

  width: 100%;
  display: flex;
  justify-content: center;
  background: #050505;
  font-family: var(--font-body);
  color: var(--text);
  padding: 0;
}

.grafb-root * { box-sizing: border-box; }

.phone {
  width: 100%;
  max-width: 420px;
  height: 100dvh;
  background: var(--bg);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

@media (min-width: 540px) {
  .grafb-root { padding: 28px 12px; }
  .phone {
    height: 840px;
    border-radius: 32px;
    border: 1px solid #2a2620;
    box-shadow: 0 30px 80px rgba(0,0,0,0.55);
  }
}

/* header */
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-bottom: 1px solid var(--hairline);
  background: var(--bg);
  flex-shrink: 0;
}
.header-left { display: flex; align-items: center; gap: 8px; }
.header-brand {
  font-family: var(--font-display);
  font-size: 16px;
  letter-spacing: 0.08em;
  font-weight: 700;
}
.header-section {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-muted);
}

.scroll-area {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

/* hero */
.hero { position: relative; height: 360px; overflow: hidden; }
.hero-img { width: 100%; height: 100%; object-fit: cover; display: block; filter: grayscale(35%) brightness(0.7); }
.hero-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(180deg, rgba(11,11,12,0.15) 0%, rgba(11,11,12,0.55) 55%, var(--bg) 100%);
}
.hero-content { position: absolute; left: 0; right: 0; bottom: 0; padding: 0 20px 22px; }
.eyebrow {
  font-size: 11px; text-transform: uppercase; letter-spacing: 0.16em;
  color: var(--gold-bright); font-weight: 600;
}
.hero-title {
  font-family: var(--font-display); font-size: 44px; line-height: 1;
  margin: 8px 0 10px; font-weight: 700; letter-spacing: 0.01em;
}
.hero-sub { font-size: 14px; line-height: 1.5; color: var(--text); max-width: 320px; opacity: 0.92; margin: 0 0 16px; }
.cta-row { display: flex; flex-direction: column; gap: 8px; }

.btn-primary {
  background: linear-gradient(180deg, var(--gold-bright), var(--gold));
  color: var(--ink); border: none; font-family: var(--font-body);
  font-weight: 700; font-size: 14px; padding: 13px 18px; border-radius: 3px;
  cursor: pointer;
}
.btn-secondary {
  background: transparent; color: var(--text); border: 1px solid rgba(242,239,233,0.35);
  font-family: var(--font-body); font-weight: 600; font-size: 13px;
  padding: 12px 18px; border-radius: 3px; cursor: pointer;
}

/* sections */
.section { padding: 30px 20px 6px; }
.section-head-row { display: flex; align-items: baseline; justify-content: space-between; }
.section-title {
  font-family: var(--font-display); font-size: 13px; text-transform: uppercase;
  letter-spacing: 0.16em; color: var(--gold-bright); font-weight: 600; margin: 0 0 14px;
}
.link-more { background: none; border: none; color: var(--text-muted); font-size: 12px; cursor: pointer; }

.about-block { display: flex; flex-direction: column; gap: 12px; }
.about-img { width: 100%; height: 170px; object-fit: cover; border-radius: 4px; filter: saturate(0.85); }
.about-text { font-size: 14px; line-height: 1.6; color: var(--text); opacity: 0.9; margin: 0; }
.info-line {
  display: flex; align-items: center; gap: 6px; margin-top: 14px;
  font-size: 12px; color: var(--text-muted); font-family: var(--font-mono);
}

.stack { display: flex; flex-direction: column; gap: 8px; }

.service-card, .service-card-full {
  background: var(--bg-elev); border: 1px solid var(--hairline); border-radius: 3px;
  padding: 14px 16px; text-align: left; cursor: pointer; color: var(--text);
}
.service-card { display: flex; align-items: center; justify-content: space-between; width: 100%; }
.service-name { font-size: 14px; font-weight: 600; }
.service-meta { font-size: 11px; color: var(--text-muted); margin-top: 3px; font-family: var(--font-mono); }
.service-price { font-family: var(--font-mono); color: var(--gold-bright); font-size: 14px; white-space: nowrap; }
.service-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; }
.service-desc { font-size: 12.5px; color: var(--text-muted); line-height: 1.5; margin: 8px 0 12px; }
.service-bottom { display: flex; align-items: center; justify-content: space-between; }
.btn-small {
  background: transparent; border: 1px solid var(--gold); color: var(--gold-bright);
  font-size: 12px; font-weight: 600; padding: 7px 12px; border-radius: 3px; cursor: pointer;
}

.team-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.team-card { text-align: center; }
.team-photo { width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: 4px; filter: grayscale(20%); margin-bottom: 8px; }
.team-name { font-size: 11.5px; font-weight: 700; line-height: 1.25; }
.team-role { font-size: 10px; color: var(--gold-bright); margin-top: 2px; }
.team-years { font-size: 10px; color: var(--text-muted); margin-top: 1px; }

.features { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
.feature-card {
  background: var(--bg-elev); border: 1px solid var(--hairline); border-radius: 4px;
  padding: 16px 14px;
}
.feature-icon {
  display: inline-flex; align-items: center; justify-content: center;
  width: 36px; height: 36px; border-radius: 3px; margin-bottom: 12px;
  color: var(--gold-bright); border: 1px solid var(--gold);
}
.feature-title { font-size: 13.5px; font-weight: 700; line-height: 1.3; margin-bottom: 6px; }
.feature-text { font-size: 12px; color: var(--text-muted); line-height: 1.55; }

.map-wrap {
  border: 1px solid var(--hairline); border-radius: 4px; overflow: hidden;
  background: var(--bg-elev);
}
.map-frame { width: 100%; height: 320px; border: 0; display: block; filter: grayscale(20%); }
.map-link {
  display: flex; align-items: center; gap: 6px; margin-top: 12px;
  font-size: 12px; color: var(--gold-bright); font-family: var(--font-mono);
  text-decoration: none;
}

.footer { padding: 40px 20px; text-align: center; border-top: 1px solid var(--hairline); margin-top: 14px; display: flex; flex-direction: column; align-items: center; gap: 4px; }
.footer-name { font-family: var(--font-display); font-size: 18px; margin-top: 8px; letter-spacing: 0.05em; }
.footer-line { font-size: 12px; color: var(--text-muted); font-family: var(--font-mono); }

.mainbutton-wrap { padding: 14px 20px 22px; }
.mainbutton {
  width: 100%; background: linear-gradient(180deg, var(--gold-bright), var(--gold));
  color: var(--ink); border: none; font-family: var(--font-body); font-weight: 700;
  font-size: 15px; padding: 15px; border-radius: 3px; cursor: pointer;
}
.mainbutton:disabled { opacity: 0.35; cursor: not-allowed; }

/* tabbar */
.tabbar {
  display: flex; border-top: 1px solid var(--hairline); background: var(--bg);
  flex-shrink: 0; padding-bottom: env(safe-area-inset-bottom, 0);
}
.tabbtn {
  flex: 1; background: none; border: none; display: flex; flex-direction: column;
  align-items: center; gap: 3px; padding: 10px 0 8px; cursor: pointer;
}
.tabbtn-label { font-size: 10px; letter-spacing: 0.02em; }

/* chat */
.chat-wrap { display: flex; flex-direction: column; height: 100%; }
.chat-area { flex: 1; padding: 18px; display: flex; flex-direction: column; gap: 12px; overflow-y: auto; }
.msg-row { display: flex; gap: 8px; align-items: flex-end; }
.msg-assistant { justify-content: flex-start; }
.msg-user { justify-content: flex-end; }
.msg-bubble {
  max-width: 78%; padding: 10px 13px; border-radius: 4px; font-size: 13.5px; line-height: 1.5;
  background: var(--bg-elev); border: 1px solid var(--hairline);
}
.msg-user .msg-bubble { background: var(--gold); color: var(--ink); border: none; font-weight: 500; }
.msg-user { flex-direction: row-reverse; }
.typing-bubble { display: flex; align-items: center; gap: 6px; color: var(--text-muted); }
.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.btn-chip {
  display: block; margin-top: 8px; background: transparent; border: 1px solid var(--gold);
  color: var(--gold-bright); font-size: 12px; font-weight: 600; padding: 7px 10px;
  border-radius: 3px; cursor: pointer;
}

.chat-suggestions { display: flex; flex-wrap: wrap; gap: 6px; padding: 0 18px 12px; }
.chip {
  background: var(--bg-elev2); border: 1px solid var(--hairline); color: var(--text);
  font-size: 11.5px; padding: 7px 11px; border-radius: 20px; cursor: pointer;
}

.chat-input-row { display: flex; gap: 8px; padding: 12px 18px calc(16px + env(safe-area-inset-bottom, 0)); border-top: 1px solid var(--hairline); }
.chat-input {
  flex: 1; background: var(--bg-elev2); border: 1px solid var(--hairline); color: var(--text);
  font-family: var(--font-body); font-size: 13.5px; padding: 11px 14px; border-radius: 20px; outline: none;
}
.chat-input::placeholder { color: var(--text-muted); }
.chat-send {
  width: 40px; height: 40px; border-radius: 50%; border: none;
  background: var(--gold); color: var(--ink); display: flex; align-items: center;
  justify-content: center; cursor: pointer; flex-shrink: 0;
}
.chat-send:disabled { opacity: 0.4; cursor: not-allowed; }

/* booking */
.step-row { display: flex; align-items: center; gap: 12px; padding: 14px 20px 0; }
.back-btn { background: var(--bg-elev); border: 1px solid var(--hairline); color: var(--text); width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; }
.step-dots { display: flex; gap: 6px; }
.dot { width: 6px; height: 6px; border-radius: 50%; background: var(--hairline); }
.dot-active { background: var(--gold-bright); }
.step-title { padding: 18px 20px 0; }

.pick-card, .barber-pick {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  background: var(--bg-elev); border: 1px solid var(--hairline); border-radius: 3px;
  padding: 13px 15px; cursor: pointer; color: var(--text); text-align: left; width: calc(100% - 40px); margin: 0 20px;
}
.barber-pick { justify-content: flex-start; }
.barber-pick-img { width: 44px; height: 44px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }
.pick-active { border-color: var(--gold); background: var(--bg-elev2); }
.pick-title { font-size: 13.5px; font-weight: 600; }
.pick-sub { font-size: 11px; color: var(--text-muted); margin-top: 2px; }
.pick-price { font-family: var(--font-mono); color: var(--gold-bright); font-size: 13px; }
.stack .pick-card, .stack .barber-pick { width: 100%; margin: 0; }
.stack { padding: 0 20px 20px; }

.date-scroll { display: flex; gap: 8px; overflow-x: auto; padding: 0 20px 20px; }
.date-chip {
  flex-shrink: 0; display: flex; flex-direction: column; align-items: center; gap: 2px;
  background: var(--bg-elev); border: 1px solid var(--hairline); border-radius: 3px;
  padding: 10px 13px; cursor: pointer; color: var(--text);
}
.date-weekday { font-size: 9px; text-transform: uppercase; color: var(--text-muted); }
.date-day { font-family: var(--font-mono); font-size: 16px; font-weight: 600; }
.date-month { font-size: 9px; color: var(--text-muted); }

.slot-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; padding: 0 20px 20px; }
.slot {
  background: var(--bg-elev); border: 1px solid var(--hairline); color: var(--text);
  font-family: var(--font-mono); font-size: 12px; padding: 10px 0; border-radius: 3px; cursor: pointer;
}
.slot-off { opacity: 0.3; text-decoration: line-through; cursor: not-allowed; }

.summary-card { margin: 0 20px 20px; background: var(--bg-elev); border: 1px solid var(--hairline); border-radius: 4px; padding: 16px; display: flex; flex-direction: column; gap: 11px; }
.summary-row { display: flex; justify-content: space-between; font-size: 13px; }
.summary-label { color: var(--text-muted); }
.summary-value { font-weight: 600; text-align: right; }

.hint-text { text-align: center; font-size: 11px; color: var(--text-muted); padding-bottom: 10px; }

.success-wrap { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 50px 26px; }
.seal-stamp { animation: sealDrop 0.6s cubic-bezier(.2,.8,.2,1) both; }
@keyframes sealDrop {
  0% { transform: scale(2.2) rotate(-10deg); opacity: 0; }
  60% { transform: scale(0.92) rotate(2deg); opacity: 1; }
  80% { transform: scale(1.06) rotate(-1deg); }
  100% { transform: scale(1) rotate(0); }
}
.success-title { font-family: var(--font-display); font-size: 22px; margin: 18px 0 6px; }
.success-sub { font-size: 13px; color: var(--text-muted); margin: 0 0 22px; }
.ticket { width: 100%; background: var(--bg-elev); border: 1px solid var(--hairline); border-radius: 4px; padding: 18px; display: flex; flex-direction: column; gap: 11px; margin-bottom: 22px; }
.ghost-btn { background: transparent; border: 1px solid var(--gold); color: var(--gold-bright); font-weight: 600; font-size: 13px; padding: 12px 20px; border-radius: 3px; cursor: pointer; }
`;
