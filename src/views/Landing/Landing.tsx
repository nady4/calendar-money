import { Link } from "react-router-dom";
import "../../styles/Landing.scss";
import { useState } from "react";

const features = [
  {
    id: "calendar",
    title: "A calendar that thinks in money",
    description:
      "Every day carries its own balance. Add income and expenses on the right date, with a colour-coded category. Click a day to drill into every transaction that touched it."
  },
  {
    id: "stats",
    title: "See the story behind the numbers",
    description:
      "Headline KPIs, period-over-period deltas, doughnut breakdowns and an all-time net worth trajectory. Switch between month and year scope in a tap."
  },
  {
    id: "budgets",
    title: "Set limits, watch the meter",
    description:
      "Define monthly or yearly limits per category. A live progress bar tells you when you're burning too fast, with over-budget alerts the moment you cross the line."
  },
  {
    id: "drag",
    title: "Drag a transaction to any day",
    description:
      "Forgot to log something on Tuesday? Pick it up, drop it on Friday. The date moves with it, no edit page, no retyping."
  }
];

const Landing = () => {
  const [hoveredFeature, setHoveredFeature] = useState<string>("calendar");

  return (
    <div className="landing">
      <header className="landing-nav">
        <a href="#top" className="landing-brand">
          <img src="/favicon.svg" alt="" className="brand-mark" />
          <span className="brand-name">Calendar Money</span>
        </a>
        <nav className="landing-nav-links">
          <a href="#features">Features</a>
          <a href="#preview">Preview</a>
          <a href="#faq">FAQ</a>
        </nav>
        <div className="landing-nav-cta">
          <Link to="/login" className="btn btn-ghost">
            Log in
          </Link>
          <Link to="/register" className="btn btn-primary">
            Get started
          </Link>
        </div>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <span className="eyebrow">A new home for personal finance</span>
          <h1>
            Your money, <span className="grad">on your calendar.</span>
          </h1>
          <p className="hero-sub">
            Track income and expenses the way you actually live them, day by
            day. Set budgets, visualise patterns, and move transactions with a
            single drag.
          </p>
          <div className="hero-cta">
            <Link to="/register" className="btn btn-primary btn-lg">
              Create your account
            </Link>
            <Link to="/login" className="btn btn-ghost btn-lg">
              I already have one
            </Link>
          </div>
          <ul className="hero-pills">
            <li>📅 Daily calendar view</li>
            <li>📈 Smart statistics</li>
            <li>🎯 Category budgets</li>
            <li>🖱️ Drag &amp; drop edits</li>
            <li>🔍 Global search</li>
            <li>🌙 Dark mode</li>
          </ul>
        </div>

        <div className="hero-visual" aria-hidden>
          <DashboardMockup active={hoveredFeature} />
        </div>
      </section>

      <section className="features" id="features">
        <h2 className="section-title">Built for the way you spend</h2>
        <p className="section-lead">
          Every screen is a thin layer on top of a single timeline of
          transactions. No spreadsheets, no juggling tabs.
        </p>

        <div className="feature-grid">
          {features.map((f) => (
            <article
              key={f.id}
              className={`feature-card ${
                hoveredFeature === f.id ? "is-active" : ""
              }`}
              onMouseEnter={() => setHoveredFeature(f.id)}
              onFocus={() => setHoveredFeature(f.id)}
              tabIndex={0}
            >
              <div className="feature-visual">
                {f.id === "calendar" && <DashboardMockup compact />}
                {f.id === "stats" && <StatsMockup />}
                {f.id === "budgets" && <BudgetMockup />}
                {f.id === "drag" && <DragMockup />}
              </div>
              <div className="feature-text">
                <h3>{f.title}</h3>
                <p>{f.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="preview" id="preview">
        <h2 className="section-title">A closer look</h2>
        <div className="preview-grid">
          <div className="preview-item preview-item-tall">
            <DashboardMockup compact showDateChanger />
          </div>
          <div className="preview-item">
            <StatsMockup />
          </div>
          <div className="preview-item">
            <BudgetMockup />
          </div>
        </div>
      </section>

      <section className="cta-banner">
        <div className="cta-banner-inner">
          <h2>Ready to put your money on the calendar?</h2>
          <p>Free, no credit card, takes about 30 seconds.</p>
          <Link to="/register" className="btn btn-primary btn-lg">
            Get started
          </Link>
        </div>
      </section>

      <section className="faq" id="faq">
        <h2 className="section-title">FAQ</h2>
        <div className="faq-grid">
          <div>
            <h3>Is it free?</h3>
            <p>
              Yes. Calendar Money is a personal project, so you can sign up and
              start tracking today at no cost.
            </p>
          </div>
          <div>
            <h3>Where is my data stored?</h3>
            <p>
              Your account, categories and transactions live on a remote
              backend so you can log in from any device.
            </p>
          </div>
          <div>
            <h3>Can I move a transaction to a different day?</h3>
            <p>
              Yes. Pick up any transaction in the calendar and drop it on the
              day you want, and the date updates instantly.
            </p>
          </div>
          <div>
            <h3>Do I need to install anything?</h3>
            <p>
              No. It runs in your browser. Bookmark it, and your calendar is
              one tap away.
            </p>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <span>© Calendar Money · built by nady4</span>
        <a
          href="https://github.com/nady4/calendar-money"
          target="_blank"
          rel="noreferrer"
        >
          GitHub
        </a>
      </footer>
    </div>
  );
};

const DashboardMockup = ({
  compact = false,
  showDateChanger = false
}: {
  compact?: boolean;
  showDateChanger?: boolean;
  active?: string;
}) => {
  // June 2026 starts on a Monday → Sunday(0) before it
  const days = [
    [0, 1, 2, 3, 4, 5, 6],
    [7, 8, 9, 10, 11, 12, 13],
    [14, 15, 16, 17, 18, 19, 20],
    [21, 22, 23, 24, 25, 26, 27],
    [28, 29, 30, 1, 2, 3, 4]
  ];

  const dayData: {
    [k: number]: {
      bal?: string;
      dim?: boolean;
      isToday?: boolean;
      items?: { c: string; t: string; amt: string }[];
    };
  } = {
    2: {
      items: [{ c: "var(--negative)", t: "Coffee", amt: "-$4" }]
    },
    3: {
      items: [
        { c: "var(--negative)", t: "Groceries", amt: "-$48" },
        { c: "var(--negative)", t: "Lunch", amt: "-$12" }
      ]
    },
    5: {
      items: [{ c: "var(--positive)", t: "Salary", amt: "+$1,240" }]
    },
    8: {
      items: [{ c: "var(--negative)", t: "Books", amt: "-$22" }]
    },
    10: {
      items: [{ c: "var(--negative)", t: "Coffee", amt: "-$4" }]
    },
    12: {
      items: [
        { c: "var(--positive)", t: "Freelance", amt: "+$60" },
        { c: "var(--negative)", t: "Dinner", amt: "-$30" }
      ]
    },
    14: {
      isToday: true,
      items: [{ c: "var(--negative)", t: "Lunch", amt: "-$15" }]
    },
    16: {
      items: [{ c: "var(--negative)", t: "Tickets", amt: "-$45" }]
    },
    18: {
      items: [{ c: "var(--negative)", t: "Coffee", amt: "-$4" }]
    },
    20: {
      items: [{ c: "var(--negative)", t: "Restaurant", amt: "-$90" }]
    },
    22: {
      items: [{ c: "var(--positive)", t: "Refund", amt: "+$25" }]
    },
    24: {
      items: [{ c: "var(--negative)", t: "Coffee", amt: "-$4" }]
    },
    26: {
      items: [
        { c: "var(--negative)", t: "Snacks", amt: "-$8" },
        { c: "var(--negative)", t: "Uber", amt: "-$18" }
      ]
    },
    28: {
      items: [{ c: "var(--positive)", t: "Bonus", amt: "+$200" }]
    },
    30: {
      items: [{ c: "var(--negative)", t: "Groceries", amt: "-$60" }]
    }
    // dim trailing days from July (1-4) are detected by position in the grid
  };

  const isFirstMock = !showDateChanger;

  return (
    <div className={`mockup mockup-dashboard ${compact ? "is-compact" : ""}`}>
      <div className="mockup-nav">
        <button className="mockup-menu" aria-label="Menu">
          <span />
          <span />
          <span />
        </button>
        <div className="mockup-money">
          <span className="mockup-money-item balance">+$628</span>
          <span className="mockup-money-item income">+$1,240</span>
          <span className="mockup-money-item expenses">-$612</span>
        </div>
        <div className="mockup-date">
          <span className="mockup-arrow">‹</span>
          <span className="mockup-date-text">
            <span className="mockup-date-month">June</span>
            <span className="mockup-date-year"> 2026</span>
          </span>
          <span className="mockup-arrow">›</span>
        </div>
        <div className="mockup-search">
          <svg
            viewBox="0 0 24 24"
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <span>Search transactions</span>
        </div>
        <div className="mockup-nav-icons">
          <span className="mockup-icon" title="Stats" />
          <span className="mockup-icon" title="Categories" />
          <span className="mockup-icon" title="Account" />
        </div>
        <button className="mockup-logout" aria-label="Logout">
          <svg
            viewBox="0 0 24 24"
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>
      <div className="mockup-body">
        <div className="mockup-weekdays">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <span key={i}>{d}</span>
          ))}
        </div>
        <div className="mockup-grid">
          {days.flat().map((d, i) => {
            const data = dayData[d] || {};
            const isToday = data.isToday === true;
            // last row contains July trailing days 1-4 (indices 28-34 in flat grid)
            const isDim = i >= 28;
            const balance = data.items?.reduce((acc, it) => {
              const v = parseFloat(it.amt.replace(/[$,+]/g, ""));
              return acc + (it.amt.startsWith("-") ? -v : v);
            }, 0);
            const balStr =
              balance === undefined
                ? null
                : `${balance >= 0 ? "+" : "-"}$${Math.abs(balance).toFixed(0)}`;
            return (
              <div
                key={i}
                className={`mockup-day ${isToday ? "is-today" : ""} ${
                  isDim ? "is-dim" : ""
                } ${balance !== undefined && balance < 0 ? "is-neg" : ""}`}
              >
                <div className="mockup-day-header">
                  {balStr && !isDim && (
                    <span
                      className={`mockup-day-bal ${
                        balance! >= 0 ? "positive" : "negative"
                      }`}
                    >
                      ${Math.abs(balance!).toFixed(0)}
                    </span>
                  )}
                  <span className="mockup-day-num">{d}</span>
                </div>
                {!isDim &&
                  data.items?.map((it, j) => (
                    <span
                      key={j}
                      className="mockup-day-item"
                      style={{ ["--c" as string]: it.c }}
                    >
                      <span className="mockup-day-item-dot" />
                      <span className="mockup-day-item-amt">{it.amt}</span>
                      <span className="mockup-day-item-desc">{it.t}</span>
                    </span>
                  ))}
              </div>
            );
          })}
        </div>
      </div>
      {isFirstMock && (
        <div className="mockup-shadow" aria-hidden />
      )}
    </div>
  );
};

const StatsMockup = () => {
  return (
    <div className="mockup mockup-stats">
      <div className="mockup-stats-head">
        <h4>June 2026</h4>
        <div className="mockup-stats-toggle">
          <span className="is-on">Month</span>
          <span>Year</span>
        </div>
      </div>
      <div className="mockup-kpis">
        <div className="mockup-kpi">
          <span className="kpi-label">Net</span>
          <span className="kpi-val positive">+$628</span>
        </div>
        <div className="mockup-kpi">
          <span className="kpi-label">Income</span>
          <span className="kpi-val positive">+$1,240</span>
        </div>
        <div className="mockup-kpi">
          <span className="kpi-label">Expenses</span>
          <span className="kpi-val negative">-$612</span>
        </div>
        <div className="mockup-kpi">
          <span className="kpi-label">Save rate</span>
          <span className="kpi-val">50.6%</span>
        </div>
      </div>
      <div className="mockup-donuts">
        <div className="mockup-donut">
          <svg viewBox="0 0 42 42">
            <circle
              cx="21"
              cy="21"
              r="15.915"
              fill="transparent"
              stroke="#22c55e"
              strokeWidth="6"
              strokeDasharray="40 60"
              strokeDashoffset="25"
            />
            <circle
              cx="21"
              cy="21"
              r="15.915"
              fill="transparent"
              stroke="#ef4444"
              strokeWidth="6"
              strokeDasharray="25 75"
              strokeDashoffset="-15"
            />
            <circle
              cx="21"
              cy="21"
              r="15.915"
              fill="transparent"
              stroke="#5b8cff"
              strokeWidth="6"
              strokeDasharray="15 85"
              strokeDashoffset="-40"
            />
          </svg>
          <span>Expenses</span>
        </div>
        <ul className="mockup-legend">
          <li>
            <span className="dot" style={{ background: "#22c55e" }} /> Food
            <em>38%</em>
          </li>
          <li>
            <span className="dot" style={{ background: "#ef4444" }} /> Transport
            <em>24%</em>
          </li>
          <li>
            <span className="dot" style={{ background: "#5b8cff" }} /> Fun
            <em>15%</em>
          </li>
        </ul>
      </div>
    </div>
  );
};

const BudgetMockup = () => {
  return (
    <div className="mockup mockup-budget">
      <div className="mockup-budget-head">
        <h4>June 2026</h4>
        <span className="mockup-pill">Monthly</span>
      </div>
      <div className="mockup-budget-list">
        {[
          { name: "Food", spent: 320, limit: 500, color: "#ef4444", over: false },
          { name: "Transport", spent: 90, limit: 120, color: "#f59e0b", over: false },
          { name: "Fun", spent: 180, limit: 150, color: "#5b8cff", over: true },
          { name: "Bills", spent: 410, limit: 600, color: "#22c55e", over: false }
        ].map((b) => {
          const pct = Math.min((b.spent / b.limit) * 100, 100);
          return (
            <div key={b.name} className="mockup-budget-row">
              <div className="row-top">
                <span
                  className="row-dot"
                  style={{ background: b.color }}
                />
                <span className="row-name">{b.name}</span>
                <span className="row-num">
                  ${b.spent} <em>/ ${b.limit}</em>
                </span>
              </div>
              <div className="row-track">
                <div
                  className={`row-fill ${b.over ? "is-over" : ""}`}
                  style={{ width: `${pct}%`, background: b.color }}
                />
              </div>
              <div className="row-meta">
                {b.over ? (
                  <span className="over">Over by ${b.spent - b.limit}</span>
                ) : (
                  <span>${b.limit - b.spent} left</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const DragMockup = () => {
  return (
    <div className="mockup mockup-drag">
      <div className="mockup-drag-grid">
        {[
          { d: 1, items: [] },
          { d: 2, items: [{ t: "Salary", c: "var(--positive)" }] },
          { d: 3, items: [] },
          { d: 4, items: [{ t: "Coffee", c: "var(--negative)" }] },
          { d: 5, items: [] },
          { d: 6, items: [{ t: "Groceries", c: "var(--negative)" }] },
          { d: 7, items: [] }
        ].map((c) => (
          <div
            key={c.d}
            className={`mockup-drag-cell ${
              c.d === 6 ? "is-target" : ""
            } ${c.d === 4 ? "is-source" : ""}`}
          >
            <span className="mockup-drag-num">{c.d}</span>
            {c.items.map((it, i) => (
              <span
                key={i}
                className="mockup-drag-chip"
                style={{ ["--c" as string]: it.c }}
              >
                {it.t}
              </span>
            ))}
            {c.d === 4 && (
              <span
                className="mockup-drag-chip is-ghost"
                style={{ ["--c" as string]: "var(--negative)" }}
              >
                Coffee
              </span>
            )}
            {c.d === 6 && <span className="mockup-drag-target-hint" />}
          </div>
        ))}
      </div>
      <div className="mockup-drag-cursor">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#5b8cff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 3l7 18 2-8 8-2z" />
        </svg>
      </div>
    </div>
  );
};

export default Landing;