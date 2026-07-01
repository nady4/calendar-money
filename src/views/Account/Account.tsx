import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../util/api";
import { UserType, VisionKeyStatus } from "../../types.d";
import { bulkImportTransactions } from "../../util/transactionApi";
import { downloadBackupCsv, parseBackupCsv } from "../../util/csvTransactions";
import { useStartOnMonday } from "../../util/weekStart";
import { ACCENT_OPTIONS, ThemeMode } from "../../util/theme";
import { useTheme as useThemeContext } from "../../components/themeContext";
import useValidateUser from "../../hooks/useValidateUser";
import useScanQuota from "../../hooks/useScanQuota";
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
  const [visionKey, setVisionKey] = useState("");
  const [showVisionKeyInput, setShowVisionKeyInput] = useState(false);
  const [visionKeyStatus, setVisionKeyStatus] = useState<{
    type: "idle" | "loading" | "success" | "error";
    message: string;
  }>({ type: "idle", message: "" });
  const [hasVisionKey, setHasVisionKey] = useState(false);
  const [startOnMonday, setStartOnMonday] = useStartOnMonday();
  const { themeMode, setThemeMode, accent, setAccent } = useThemeContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { quota, byok, refresh: refreshQuota } = useScanQuota(user.id);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const response = await fetch(`${API_URL}/users/${user.id}/vision-key`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });
        const data = (await response.json().catch(() => ({}))) as {
          status?: VisionKeyStatus;
        };
        if (!cancelled && data?.status) {
          setHasVisionKey(Boolean(data.status.hasKey));
        }
      } catch (err) {
        console.error("Failed to load vision key status:", err);
      }
    };
    if (user.id) load();
    return () => {
      cancelled = true;
    };
  }, [user.id]);

  const handleSaveVisionKey = async () => {
    const trimmed = visionKey.trim();
    if (trimmed.length < 8) {
      setVisionKeyStatus({
        type: "error",
        message: "Key looks too short."
      });
      return;
    }
    setVisionKeyStatus({ type: "loading", message: "Testing key..." });
    try {
      const response = await fetch(`${API_URL}/users/${user.id}/vision-key`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ key: trimmed })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error || "Could not save key.");
      }
      setVisionKey("");
      setShowVisionKeyInput(false);
      setHasVisionKey(true);
      setVisionKeyStatus({
        type: "success",
        message: data?.status?.lastFour
          ? `Key saved (••••${data.status.lastFour.replace(/^••••/, "")}).`
          : "Key saved."
      });
      refreshQuota();
    } catch (err) {
      setVisionKeyStatus({
        type: "error",
        message: err instanceof Error ? err.message : "Could not save key."
      });
    }
  };

  const handleRemoveVisionKey = async () => {
    setVisionKeyStatus({ type: "loading", message: "Removing key..." });
    try {
      const response = await fetch(`${API_URL}/users/${user.id}/vision-key`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error || "Could not remove key.");
      }
      setHasVisionKey(false);
      setVisionKeyStatus({ type: "success", message: "Key removed." });
      refreshQuota();
    } catch (err) {
      setVisionKeyStatus({
        type: "error",
        message: err instanceof Error ? err.message : "Could not remove key."
      });
    }
  };

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
          <h3 className="csv-title">AI receipt scanning</h3>
          <div className="ai-quota">
            <div className="ai-quota-row">
              <span>Today</span>
              <span>
                {quota.usedDay} / {quota.limitDay}
              </span>
            </div>
            <div
              className={`ai-quota-bar ${
                quota.usedDay >= quota.limitDay
                  ? "is-exhausted"
                  : quota.usedDay / Math.max(1, quota.limitDay) >= 0.8
                    ? "is-warning"
                    : ""
              }`}
            >
              <span
                style={{
                  width: `${Math.min(
                    100,
                    (quota.usedDay / Math.max(1, quota.limitDay)) * 100
                  )}%`
                }}
              />
            </div>
            <div className="ai-quota-row">
              <span>This month</span>
              <span>
                {quota.usedMonth} / {quota.limitMonth}
              </span>
            </div>
            <div className="ai-quota-bar">
              <span
                style={{
                  width: `${Math.min(
                    100,
                    (quota.usedMonth / Math.max(1, quota.limitMonth)) * 100
                  )}%`
                }}
              />
            </div>
            {byok && (
              <p className="ai-quota-byok">
                Using your own API key — daily limits are bypassed.
              </p>
            )}
          </div>

          <div className="ai-vision-key">
            <h4 className="ai-vision-key-title">Vision API key (BYOK)</h4>
            <p className="ai-vision-key-help">
              Optional. Add your own OpenAI-compatible vision key to bypass the
              daily scan limit.
            </p>
            <p className="ai-vision-key-status">
              {hasVisionKey ? "Status: key on file" : "Status: no key set"}
            </p>

            {showVisionKeyInput ? (
              <div className="ai-vision-key-form">
                <input
                  type="password"
                  className="ai-vision-key-input"
                  placeholder="sk-…"
                  value={visionKey}
                  autoFocus
                  onChange={(e) => {
                    setVisionKey(e.target.value);
                    setVisionKeyStatus({ type: "idle", message: "" });
                  }}
                />
                <div className="ai-vision-key-buttons">
                  <button
                    type="button"
                    className="csv-button csv-button-primary"
                    disabled={
                      visionKeyStatus.type === "loading" ||
                      visionKey.trim().length < 8
                    }
                    onClick={handleSaveVisionKey}
                  >
                    Test &amp; save
                  </button>
                  <button
                    type="button"
                    className="csv-button"
                    onClick={() => {
                      setShowVisionKeyInput(false);
                      setVisionKey("");
                      setVisionKeyStatus({ type: "idle", message: "" });
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="ai-vision-key-buttons">
                <button
                  type="button"
                  className="csv-button csv-button-primary"
                  onClick={() => {
                    setShowVisionKeyInput(true);
                    setVisionKeyStatus({ type: "idle", message: "" });
                  }}
                >
                  {hasVisionKey ? "Replace key" : "Add key"}
                </button>
                {hasVisionKey && (
                  <button
                    type="button"
                    className="csv-button"
                    onClick={handleRemoveVisionKey}
                    disabled={visionKeyStatus.type === "loading"}
                  >
                    Remove key
                  </button>
                )}
              </div>
            )}

            {visionKeyStatus.type !== "idle" && (
              <p
                className={`csv-status csv-status-${visionKeyStatus.type}`}
                role="status"
              >
                {visionKeyStatus.message}
              </p>
            )}
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
