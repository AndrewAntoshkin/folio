import { useState } from "react";
import { Button, Dialog } from "@ds";

export function Task() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <Button variant="danger" onClick={() => setOpen(true)}>Delete project</Button>
      <Dialog open={open} title="Delete project?" onClose={() => setOpen(false)}>
        <p className="ds-help">This cannot be undone.</p>
        <div className="ds-row">
          <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="danger">Delete</Button>
        </div>
      </Dialog>
    </div>
  );
}
