import { useSeo } from "../../hooks/useSeo";
import LegalLayout from "./LegalLayout";

const Privacy = () => {
  useSeo({
    title: "Privacy Policy · Calendar Money",
    description:
      "Privacy Policy for Calendar Money. Learn what data the app stores, where it lives, and how it is protected.",
    path: "/privacy",
  });

  return (
    <LegalLayout title="Privacy Policy" updated="August 13, 2026">
      <section>
        <h2>1. Overview</h2>
        <p>
          This Privacy Policy explains what information Calendar Money collects,
          how it is used, and the choices you have. By using the Service you
          agree to the practices described here.
        </p>
      </section>

      <section>
        <h2>2. Data We Store</h2>
        <h3>Account information</h3>
        <p>
          When you register, we store your username, email address, and a
          securely hashed password on our backend so you can log in from any
          device.
        </p>
        <h3>Financial data you enter</h3>
        <p>
          Transactions, categories, budgets, and settings you create are stored
          on our backend database (hosted with MongoDB Atlas) so your data
          follows you across devices and sessions.
        </p>
        <h3>Local browser storage</h3>
        <p>
          We use your browser's localStorage to keep you signed in (session
          token and a cached copy of your user profile) and to remember
          preferences such as the selected theme, week start, and table
          settings. This data never leaves your device.
        </p>
      </section>

      <section>
        <h2>3. Cookies and Tracking</h2>
        <p>
          Calendar Money sets <strong>no tracking cookies</strong> and includes{" "}
          <strong>no third-party analytics or advertising</strong>. We do not
          track you across other websites. The only persistent storage used is
          localStorage, described above. Because no cookies are set, no cookie
          consent banner is required.
        </p>
      </section>

      <section>
        <h2>4. AI Receipt Scanning</h2>
        <p>
          If you use the receipt scanning feature, the receipt image you upload
          is sent to a third-party vision API to extract transaction details.
          Images are processed solely to provide this feature. You can choose to
          supply your own API key (in Account settings) for scanning, in which
          case your key is stored encrypted and used only for your scan
          requests.
        </p>
      </section>

      <section>
        <h2>5. How We Use Your Data</h2>
        <p>
          Your data is used only to operate the Service: storing your entries,
          rendering your calendar, statistics, budgets, and enabling the
          features you use. We do not sell, rent, or share your personal or
          financial data with anyone.
        </p>
      </section>

      <section>
        <h2>6. Data Security</h2>
        <p>
          Passwords are hashed, API keys are encrypted, and all traffic is sent
          over HTTPS. No system is perfectly secure, but we follow standard
          security practices to protect your information.
        </p>
      </section>

      <section>
        <h2>7. Your Choices and Rights</h2>
        <ul>
          <li>
            <strong>Export:</strong> export your transactions from the
            transaction list at any time.
          </li>
          <li>
            <strong>Deletion:</strong> delete your account from the account
            page; this removes your stored profile, categories, transactions,
            and settings from the backend.
          </li>
          <li>
            <strong>Local data:</strong> clear your browser's localStorage to
            remove the cached profile and session on that device.
          </li>
        </ul>
      </section>

      <section>
        <h2>8. Data Retention</h2>
        <p>
          Your data is retained while your account exists. When you delete your
          account, your personal data is removed from the backend.
        </p>
      </section>

      <section>
        <h2>9. Children's Privacy</h2>
        <p>
          The Service is not directed at children under 13, and we do not
          knowingly collect personal information from children.
        </p>
      </section>

      <section>
        <h2>10. Changes to This Policy</h2>
        <p>
          We may update this policy from time to time. Material changes will be
          reflected by an updated "Last updated" date at the top of this page.
        </p>
      </section>

      <section>
        <h2>11. Contact</h2>
        <p>
          Questions about this policy or your data? Contact us at{" "}
          <a href="mailto:dev@nady4.com">dev@nady4.com</a>.
        </p>
      </section>
    </LegalLayout>
  );
};

export default Privacy;
