import { Link } from "react-router-dom";
import "../../styles/Landing.scss";
import { useState } from "react";
import { UserType } from "../../types";

const features = [
  {
    id: "calendar",
    title: "See your money before it happens",
    description:
      "Every day shows its projected balance. Add income and expenses to the dates they happen, then open any day to see exactly what moves your balance.",
    image: "/assets/docs/dashboard.png",
    alt: "Calendar Money dashboard view"
  },
  {
    id: "stats",
    title: "Understand where your money goes",
    description:
      "See your cash flow at a glance with key metrics, category breakdowns and net worth over time. Switch between monthly and yearly views to spot the bigger picture.",
    image: "/assets/docs/stats1.png",
    alt: "Statistics view with cash flow chart"
  },
  {
    id: "budgets",
    title: "Know how much you can spend",
    description:
      "Set spending limits for each category and track them as you go. Live progress bars and over-budget alerts keep you aware before small expenses become a problem.",
    image: "/assets/docs/budgets.png",
    alt: "Budgets view with progress bars"
  },
  {
    id: "categories",
    title: "Make your money easy to read",
    description:
      "Organize income and expenses with custom categories, colors and labels. Your categories stay consistent across the calendar, statistics and budgets.",
    image: "/assets/docs/categories.png",
    alt: "Categories list with color tags"
  }
];

const Landing = ({ user }: { user: UserType }) => {
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
          {user.loggedIn ? (
            <>
              <Link to="/dashboard" className="btn btn-ghost">
                Dashboard
              </Link>
              <button
                className="btn btn-primary"
                onClick={() => {
                  localStorage.removeItem("token");
                  localStorage.removeItem("user");
                  window.location.reload();
                }}
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost">
                Log in
              </Link>
              <Link to="/register" className="btn btn-primary">
                Get started
              </Link>
            </>
          )}
        </div>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <span className="eyebrow">Know before you spend</span>
          <h1>
            Your <span className="grad">money</span> has a{" "}
            <span className="grad">calendar</span>
          </h1>
          <p className="hero-sub">
            A personal finance app that turns your income and expenses into a
            calendar, so you can plan your life.
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
          <div className="screenshot-frame screenshot-frame-hero">
            <img
              src="/assets/docs/dashboard.png"
              alt="Calendar Money dashboard"
              className="screenshot-img"
            />
          </div>
        </div>
      </section>

      <section className="features" id="features">
        <h2 className="section-title">Your life happens on a calendar</h2>
        <p className="section-lead">
          See income, expenses, and balances exactly when they happen. No
          spreadsheets, no scattered numbers, just a clear view of what your
          money is doing over time.
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
                <div className="screenshot-frame">
                  <img
                    src={f.image}
                    alt={f.alt}
                    className="screenshot-img"
                    loading="lazy"
                  />
                </div>
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
        <h2 className="section-title">See your money in context</h2>
        <div className="preview-grid">
          <div className="preview-item preview-item-tall">
            <div className="screenshot-frame">
              <img
                src="/assets/docs/dashboard.png"
                alt="Full calendar dashboard"
                className="screenshot-img"
                loading="lazy"
              />
            </div>
            <div className="preview-caption">
              <span className="preview-tag">Calendar</span>
              <p>
                Your whole month at a glance, with every balance, income, and
                expense exactly where it happens.
              </p>
            </div>
          </div>
          <div className="preview-item">
            <div className="screenshot-frame">
              <img
                src="/assets/docs/stats2.png"
                alt="Stats with category breakdown"
                className="screenshot-img"
                loading="lazy"
              />
            </div>
            <div className="preview-caption">
              <span className="preview-tag preview-tag-stats">Stats</span>
              <p>
                See the patterns behind your spending and understand where your
                money actually goes.
              </p>
            </div>
          </div>
          <div className="preview-item">
            <div className="screenshot-frame">
              <img
                src="/assets/docs/budgets.png"
                alt="Budgets with progress meters"
                className="screenshot-img"
                loading="lazy"
              />
            </div>
            <div className="preview-caption">
              <span className="preview-tag preview-tag-budgets">Budgets</span>
              <p>
                Set boundaries for your spending and know when you're getting
                close before you go over.
              </p>
            </div>
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
              Your account, categories and transactions live on a remote backend
              so you can log in from any device.
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
              No. It runs in your browser. Bookmark it, and your calendar is one
              tap away.
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

export default Landing;
