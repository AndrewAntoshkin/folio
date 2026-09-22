import { Button, Dialog } from "@ds";
export function Settings() {
  const open = () => {};
  return (
    <section>
      <h1>Settings</h1>
      <div style={{ background: "var(--color-accent)", padding: "var(--space-3)" }}>
        <Button onClick={open}>Save</Button>
        <Dialog>
          <h2>Delete account</h2>
          <Button aria-label="Close">×</Button>
        </Dialog>
      </div>
    </section>
  );
}
