import { Entry } from "@/lib/terminal/types";
import { Prompt } from "@/components/terminal/Prompt";

type TerminalEntriesProps = {
  history: Entry[];
  promptPath: string;
};

function renderToken(token: string, key: string) {
  const trimmed = token.trim();
  if (!trimmed) {
    return token;
  }

  if (trimmed === "resume_shivam.pdf") {
    return (
      <a
        key={key}
        href="/resume_shivam.pdf"
        target="_blank"
        rel="noreferrer"
        className="inline-link"
      >
        {token}
      </a>
    );
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return (
      <a
        key={key}
        href={trimmed}
        target="_blank"
        rel="noreferrer"
        className="inline-link"
      >
        {token}
      </a>
    );
  }

  return token;
}

function renderLineWithLinks(line: string, entryId: number, lineIndex: number) {
  const parts = line.split(/(\s+)/);
  return parts.map((part, index) => (
    <span key={`${entryId}-${lineIndex}-${index}`}>
      {renderToken(part, `${entryId}-${lineIndex}-t-${index}`)}
    </span>
  ));
}

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
            entry.lines.map((line, index) =>
              line.startsWith("__LS_WRAP__") ? (
                <div
                  key={`${entry.id}-${index}`}
                  className="line output-line ls-wrap"
                >
                  {line
                    .replace("__LS_WRAP__", "")
                    .split("\t")
                    .filter(Boolean)
                    .map((item) => (
                      <span
                        key={`${entry.id}-${index}-${item}`}
                        className="ls-chip"
                      >
                        {renderToken(item, `${entry.id}-${index}-${item}-chip`)}
                      </span>
                    ))}
                </div>
              ) : (
                <p key={`${entry.id}-${index}`} className="line output-line">
                  {line ? (
                    renderLineWithLinks(line, entry.id, index)
                  ) : (
                    <span className="empty-line">&nbsp;</span>
                  )}
                </p>
              ),
            )
          )}
        </div>
      ))}
    </>
  );
}
