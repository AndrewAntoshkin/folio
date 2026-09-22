import { Button } from "@ds";

export function Task() {
  return (
    <div className="ds-row">
      <Button>Save</Button>
      <Button variant="secondary">Cancel</Button>
      <Button variant="danger">Delete</Button>
    </div>
  );
}
