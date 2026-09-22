import { type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes, useId, useState } from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

export function Button({
  variant = "primary",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return (
    <button className={`ds-btn ds-btn-${variant}`} {...props}>
      {children}
    </button>
  );
}

export function Label({ htmlFor, children }: { htmlFor?: string; children: ReactNode }) {
  return (
    <label className="ds-label" htmlFor={htmlFor}>
      {children}
    </label>
  );
}

export function HelperText({ error, children }: { error?: boolean; children: ReactNode }) {
  return <p className={error ? "ds-help ds-help-error" : "ds-help"}>{children}</p>;
}

export function Input({ invalid, id, ...props }: InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return <input id={id} className={invalid ? "ds-input is-invalid" : "ds-input"} aria-invalid={invalid} {...props} />;
}

export function Textarea({ invalid, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
  return <textarea className={invalid ? "ds-input is-invalid" : "ds-input"} aria-invalid={invalid} {...props} />;
}

export function Select({
  label,
  helper,
  error,
  children,
  id,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { label: string; helper?: string; error?: string }) {
  const autoId = useId();
  const selectId = id ?? autoId;
  return (
    <div className="ds-field">
      <Label htmlFor={selectId}>{label}</Label>
      <select id={selectId} className={error ? "ds-input is-invalid" : "ds-input"} aria-invalid={Boolean(error)} {...props}>
        {children}
      </select>
      {error ? <HelperText error>{error}</HelperText> : helper ? <HelperText>{helper}</HelperText> : null}
    </div>
  );
}

export function Checkbox({ label, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const id = useId();
  return (
    <label className="ds-choice" htmlFor={id}>
      <input id={id} type="checkbox" {...props} />
      <span>{label}</span>
    </label>
  );
}

export function Radio({ label, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const id = useId();
  return (
    <label className="ds-choice" htmlFor={id}>
      <input id={id} type="radio" {...props} />
      <span>{label}</span>
    </label>
  );
}

export function Switch({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  const id = useId();
  return (
    <label className="ds-choice" htmlFor={id}>
      <input id={id} type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

export function Tabs({ tabs, value, onChange }: { tabs: string[]; value: string; onChange: (value: string) => void }) {
  return (
    <div className="ds-tabs" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          role="tab"
          aria-selected={tab === value}
          className={tab === value ? "is-active" : undefined}
          onClick={() => onChange(tab)}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

export function Dialog({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="ds-dialog-root" role="presentation">
      <button className="ds-backdrop" aria-label="Close" onClick={onClose} />
      <div className="ds-dialog" role="dialog" aria-modal="true" aria-labelledby="ds-dialog-title">
        <h2 id="ds-dialog-title">{title}</h2>
        {children}
      </div>
    </div>
  );
}

export function Badge({ children }: { children: ReactNode }) {
  return <span className="ds-badge">{children}</span>;
}

export function Card({ children }: { children: ReactNode }) {
  return <section className="ds-card">{children}</section>;
}

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <header className="ds-page-header">
      <div>
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
      </div>
      {actions ? <div className="ds-page-actions">{actions}</div> : null}
    </header>
  );
}

export function Field({
  label,
  helper,
  error,
  children,
}: {
  label: string;
  helper?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="ds-field">
      <Label>{label}</Label>
      {children}
      {error ? <HelperText error>{error}</HelperText> : helper ? <HelperText>{helper}</HelperText> : null}
    </div>
  );
}

export function useDialog() {
  const [open, setOpen] = useState(false);
  return { open, openDialog: () => setOpen(true), close: () => setOpen(false) };
}
