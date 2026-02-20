type PromptProps = {
  path: string;
};

export function Prompt({ path }: PromptProps) {
  return (
    <span className="prompt-shell" aria-hidden="true">
      <span className="prompt-user">visitor</span>
      <span className="prompt-at">@</span>
      <span className="prompt-host">archfolio</span>
      <span className="prompt-colon">:</span>
      <span className="prompt-path">{path}</span>
      <span className="prompt-symbol">$</span>
    </span>
  );
}
