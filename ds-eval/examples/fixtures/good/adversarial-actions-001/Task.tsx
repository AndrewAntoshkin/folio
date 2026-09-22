import { Button, Dialog } from "@ds";

export function Task() {
  return (
    <Dialog open title="Unsaved changes" onClose={() => undefined}>
      <p className="ds-help">Save this draft before leaving.</p>
      <div className="ds-row">
        <Button variant="secondary">Cancel</Button>
        <Button>Save</Button>
      </div>
    </Dialog>
  );
}
