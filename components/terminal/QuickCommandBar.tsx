type QuickCommandBarProps = {
  commands: string[];
  onSelect: (command: string) => void;
};

export function QuickCommandBar({ commands, onSelect }: QuickCommandBarProps) {
  return (
    <div className="terminal-hint" aria-label="Quick commands">
      <span className="hint-label">try:</span>
      <div className="quick-cmds">
        {commands.map((cmd) => (
          <button
            key={cmd}
            type="button"
            className="inline-cmd"
            onClick={() => onSelect(cmd)}
          >
            {cmd}
          </button>
        ))}
      </div>
    </div>
  );
}
