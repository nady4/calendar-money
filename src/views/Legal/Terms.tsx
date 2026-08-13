import { useSeo } from "../../hooks/useSeo";
import LegalLayout from "./LegalLayout";

const Terms = () => {
  useSeo({
    title: "Terms of Service · Calendar Money",
    description:
      "Terms of Service for Calendar Money, the personal finance app that puts your money on a calendar.",
    path: "/terms",
  });

  return (
    <LegalLayout title="Terms of Service" updated="August 13, 2026">
      <section>
        <h2>1. Agreement to Terms</h2>
        <p>
          By accessing or using Calendar Money ("the Service"), you agree to be
          bound by these Terms of Service. If you do not agree with any part of
          these terms, please do not use the Service.
        </p>
      </section>

      <section>
        <h2>2. Description of the Service</h2>
        <p>
          Calendar Money is a personal finance application that lets you record
          income and expenses on a calendar, see projected balances, track
          budgets, review statistics, and optionally scan receipts with AI
          assistance. The Service is provided free of charge and as a personal
          project.
        </p>
      </section>

      <section>
        <h2>3. Accounts</h2>
        <p>
          You are responsible for maintaining the confidentiality of your
          credentials and for all activity that occurs under your account. You
          agree to provide accurate information when creating an account and to
          keep it up to date.
        </p>
        <p>
          You may delete your account and its data at any time. We may suspend
          or terminate accounts that violate these Terms or that compromise the
          security of the Service.
        </p>
      </section>

      <section>
        <h2>4. Acceptable Use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Use the Service for any unlawful purpose.</li>
          <li>
            Attempt to gain unauthorized access to other users' accounts or the
            Service's infrastructure.
          </li>
          <li>
            Abuse, overload, or disrupt the Service, including automated
            scraping or excessive API usage.
          </li>
          <li>
            Upload content that is illegal, infringing, or harmful.
          </li>
        </ul>
      </section>

      <section>
        <h2>5. Your Data</h2>
        <p>
          You retain all rights to the data you enter (transactions, categories,
          and settings). You may export or delete your data at any time from the
          account page. See the Privacy Policy for details on how your data is
          handled.
        </p>
      </section>

      <section>
        <h2>6. Disclaimer of Warranties</h2>
        <p>
          The Service is provided "as is" and "as available," without warranties
          of any kind, express or implied. We do not warrant that the Service
          will be uninterrupted, error-free, or that any financial information
          or projections it displays will be accurate or suitable for your
          purposes.
        </p>
      </section>

      <section>
        <h2>7. Not Financial Advice</h2>
        <p>
          Calendar Money is a tool for tracking and planning your personal
          finances. It does not provide financial, investment, or legal advice.
          Decisions you make based on the data shown in the Service are your own
          responsibility.
        </p>
      </section>

      <section>
        <h2>8. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by law, we shall not be liable for any
          indirect, incidental, special, consequential, or punitive damages, or
          for any loss of data, arising out of or in connection with your use of
          the Service.
        </p>
      </section>

      <section>
        <h2>9. Changes to the Service and Terms</h2>
        <p>
          We may modify, suspend, or discontinue the Service, or update these
          Terms, at any time. Material changes to the Terms will be reflected by
          an updated "Last updated" date at the top of this page.
        </p>
      </section>

      <section>
        <h2>10. Contact</h2>
        <p>
          Questions about these Terms? Contact us at{" "}
          <a href="mailto:dev@nady4.com">dev@nady4.com</a>.
        </p>
      </section>
    </LegalLayout>
  );
};

export default Terms;
