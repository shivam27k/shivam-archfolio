type BootSplashProps = {
  onSkip: () => void;
};

const LOGO = [
  "                   /\\",
  "                  /  \\",
  "                 /\\   \\",
  "                /      \\",
  "               /   ,,   \\",
  "              /   |  |  -\\",
  "             /_-''    ''-_\\",
];

export function BootSplash({ onSkip }: BootSplashProps) {
  return (
    <div className="boot-overlay" role="status" aria-live="polite">
      <div className="boot-grid" />
      <div className="boot-card">
        <p className="boot-title">ARCHFOLIO // INIT</p>
        <pre className="boot-logo" aria-hidden="true">
          {LOGO.join("\n")}
        </pre>
        <p className="boot-subtitle">Booting terminal experience...</p>
        <div className="boot-bar">
          <span className="boot-bar-fill" />
        </div>
        <button type="button" className="boot-skip" onClick={onSkip}>
          skip
        </button>
      </div>
    </div>
  );
}
