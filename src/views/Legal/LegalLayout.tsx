import { Link } from "react-router-dom";
import "../../styles/Legal.scss";

type LegalLayoutProps = {
  title: string;
  updated: string;
  children: React.ReactNode;
};

const LegalLayout = ({ title, updated, children }: LegalLayoutProps) => {
  return (
    <div className="legal">
      <header className="legal-nav">
        <Link to="/" className="legal-brand">
          <img src="/favicon.svg" alt="" className="brand-mark" />
          <span className="brand-name">Calendar Money</span>
        </Link>
        <nav className="legal-nav-links">
          <Link to="/">Home</Link>
          <Link to="/terms">Terms</Link>
          <Link to="/privacy">Privacy</Link>
        </nav>
      </header>

      <main className="legal-content">
        <h1>{title}</h1>
        <p className="legal-updated">Last updated: {updated}</p>
        <div className="legal-body">{children}</div>
      </main>

      <footer className="legal-footer">
        <span>© {new Date().getFullYear()} Calendar Money · built by nady4</span>
        <div className="legal-footer-links">
          <Link to="/terms">Terms of Service</Link>
          <Link to="/privacy">Privacy Policy</Link>
          <a
            href="https://github.com/nady4/calendar-money"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
        </div>
      </footer>
    </div>
  );
};

export default LegalLayout;
