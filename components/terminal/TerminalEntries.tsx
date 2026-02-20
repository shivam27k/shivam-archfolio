import { Entry } from "@/lib/terminal/types";
import { Prompt } from "@/components/terminal/Prompt";

type TerminalEntriesProps = {
  history: Entry[];
  promptPath: string;
};

export function TerminalEntries({ history, promptPath }: TerminalEntriesProps) {
  return (
    <>
      {history.map((entry) => (
        <div key={entry.id} className={`entry entry-${entry.kind}`}>
          {entry.kind === "command" ? (
            <p className="line">
              <span className="prompt">
                <Prompt path={entry.promptPath ?? promptPath} />
              </span>
              {entry.lines[0]}
            </p>
          ) : (
            entry.lines.map((line, index) => (
              <p key={`${entry.id}-${index}`} className="line output-line">
                {line || <span className="empty-line">&nbsp;</span>}
              </p>
            ))
          )}
        </div>
      ))}
    </>
  );
}
