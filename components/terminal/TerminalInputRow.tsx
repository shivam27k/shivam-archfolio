import { FormEvent, KeyboardEvent, RefObject } from "react";
import { Prompt } from "@/components/terminal/Prompt";

type TerminalInputRowProps = {
  value: string;
  promptPath: string;
  inputRef: RefObject<HTMLInputElement | null>;
  onChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
};

export function TerminalInputRow({
  value,
  promptPath,
  inputRef,
  onChange,
  onSubmit,
  onKeyDown,
}: TerminalInputRowProps) {
  return (
    <form className="input-row" onSubmit={onSubmit}>
      <label className="prompt" htmlFor="terminal-input">
        <Prompt path={promptPath} />
      </label>
      <input
        id="terminal-input"
        ref={inputRef}
        className="terminal-input"
        autoComplete="off"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={onKeyDown}
        placeholder="type a command..."
      />
    </form>
  );
}
