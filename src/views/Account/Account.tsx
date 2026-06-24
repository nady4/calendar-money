import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../util/api";
import { UserType } from "../../types.d";
import { bulkImportTransactions } from "../../util/transactionApi";
import { downloadBackupCsv, parseBackupCsv } from "../../util/csvTransactions";
import { useStartOnMonday } from "../../util/weekStart";
import { ACCENT_OPTIONS, ThemeMode } from "../../util/theme";
import { useTheme as useThemeContext } from "../../components/themeContext";
import useValidateUser from "../../hooks/useValidateUser";
import exitButton from "../../assets/whiteExitButton.svg";
import "../../styles/form.scss";

interface AccountProps {
  user: UserType;
  setUser: React.Dispatch<React.SetStateAction<UserType>>;
}

const Account = ({ user, setUser }: AccountProps) => {
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState("");
  const [disableSubmitButton, setDisableSubmitButton] = useState(true);
  const [csvStatus, setCsvStatus] = useState<{
    type: "idle" | "loading" | "success" | "error";
    message: string;
  }>({ type: "idle", message: "" });
  const [startOnMonday, setStartOnMonday] = useStartOnMonday();
  const { themeMode, setThemeMode, accent, setAccent } = useThemeContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useValidateUser({ username, email, password, setDisableSubmitButton });

  const onUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
  };
  const onEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };
  const onPasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const handleUpdateSubmit = async (event: React.FormEvent) => {
    event?.preventDefault();

    const newUser = {
      username,
      email,
      password
    };

    try {
      const response = await fetch(`${API_URL}/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(newUser)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setUser(data);
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteSubmit = async (event: React.FormEvent) => {
    event?.preventDefault();

    try {
      const response = await fetch(`${API_URL}/users/${user.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      setUser({} as UserType);
      localStorage.removeItem("token");
      navigate("/");
    } catch (error) {
      console.error(error);
    }
  };

  const handleExport = () => {
    if (!user.transactions?.length && !user.categories?.length) {
      setCsvStatus({
        type: "error",
        message: "There is nothing to export yet."
      });
      return;
    }
    downloadBackupCsv(user);
    const txCount = user.transactions?.length ?? 0;
    const catCount = user.categories?.length ?? 0;
    setCsvStatus({
      type: "success",
      message: `Exported ${txCount} transactions and ${catCount} categories.`
    });
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setCsvStatus({ type: "loading", message: "Reading backup file..." });

    try {
      const text = await file.text();
      const parsed = parseBackupCsv(text);

      if (!parsed.transactions.length && !parsed.categories.length) {
        setCsvStatus({
          type: "error",
          message:
            "No transactions or categories found in the file. Make sure the file is a Calendar Money backup CSV."
        });
        return;
      }

      setCsvStatus({
        type: "loading",
        message: `Importing ${parsed.transactions.length} transactions and ${parsed.categories.length} categories...`
      });

      const result = await bulkImportTransactions(
        user.id,
        {
          categories: parsed.categories,
          transactions: parsed.transactions.map((t) => ({
            _id: t._id || undefined,
            date: t.date,
            amount: t.amount,
            description: t.description,
            category: t.category,
            group: t.group || undefined
          }))
        },
        localStorage.getItem("token")
      );

      if (result.error) {
        setCsvStatus({ type: "error", message: result.error });
        return;
      }

      if (result.user) setUser(result.user);

      const imported = result.imported;
      setCsvStatus({
        type: "success",
        message: imported
          ? `Imported ${imported.transactions} transactions and ${imported.categories} categories${
              imported.skipped > 0 ? ` (${imported.skipped} skipped)` : ""
            }.`
          : "Import complete."
      });
    } catch (err) {
      console.error(err);
      setCsvStatus({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to read the file."
      });
    }
  };

  return (
    <div className="form">
      <h2>Account</h2>
      <button
        type="button"
        aria-label="Close"
        className="exit-button"
        onClick={() => {
          navigate("/dashboard");
        }}
      >
        <img src={exitButton} alt="" />
      </button>
      <form onSubmit={handleUpdateSubmit}>
        <label htmlFor="username">Username</label>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={onUsernameChange}
        />
        <label htmlFor="email">Email</label>
        <input
          className="email-input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={onEmailChange}
        />
        <label htmlFor="password">Password</label>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={onPasswordChange}
        />
        <div className="submit-button-container">
          <button
            type="button"
            className="submit-button"
            disabled={disableSubmitButton}
            onClick={handleUpdateSubmit}
          >
            Submit
          </button>
        </div>

        <div className="preferences-section">
          <h3 className="csv-title">Preferences</h3>

          <label className="preference-row">
            <span className="preference-label">Start week on Monday</span>
            <input
              type="checkbox"
              className="preference-checkbox"
              checked={startOnMonday}
              onChange={(e) => setStartOnMonday(e.target.checked)}
            />
            <span className="preference-toggle" aria-hidden />
          </label>

          <div className="preference-row">
            <span className="preference-label">Theme</span>
            <div className="theme-options" role="radiogroup" aria-label="Theme">
              {(
                [
                  { value: "dark", label: "Dark" },
                  { value: "light", label: "Light" }
                ] as { value: ThemeMode; label: string }[]
              ).map((opt) => (
                <label
                  key={opt.value}
                  className={`theme-option ${
                    themeMode === opt.value ? "is-active" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="theme-mode"
                    value={opt.value}
                    checked={themeMode === opt.value}
                    onChange={() => setThemeMode(opt.value)}
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="preference-row">
            <span className="preference-label">Accent color</span>
            <div
              className="accent-swatches"
              role="radiogroup"
              aria-label="Accent color"
            >
              {ACCENT_OPTIONS.map((option) => (
                <label
                  key={option.id}
                  className={`accent-swatch ${
                    accent.id === option.id ? "is-active" : ""
                  }`}
                  title={option.label}
                >
                  <input
                    type="radio"
                    name="accent"
                    value={option.id}
                    checked={accent.id === option.id}
                    onChange={() => setAccent(option)}
                  />
                  <span
                    className="accent-dot"
                    style={{ background: option.color }}
                  />
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="csv-section">
          <h3 className="csv-title">Backup &amp; restore data</h3>
          <div className="csv-buttons">
            <button
              type="button"
              className="csv-button csv-button-primary"
              onClick={handleExport}
              disabled={csvStatus.type === "loading"}
            >
              Export CSV
            </button>
            <button
              type="button"
              className="csv-button"
              onClick={handleImportClick}
              disabled={csvStatus.type === "loading"}
            >
              Import CSV
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              style={{ display: "none" }}
              onChange={handleImportFile}
            />
          </div>
          {csvStatus.type !== "idle" && (
            <p
              className={`csv-status csv-status-${csvStatus.type}`}
              role="status"
            >
              {csvStatus.message}
            </p>
          )}
        </div>

        <div className="delete-button" onClick={handleDeleteSubmit}>
          <p className="delete">Delete User</p>
        </div>
      </form>
    </div>
  );
};

export default Account;
