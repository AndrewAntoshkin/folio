import { Badge, Card } from "@ds";

const NAME = "A".repeat(180);

export function Task() {
  return (
    <Card>
      <p style={{ overflowWrap: "anywhere" }}>{NAME}</p>
      <Badge>Platform engineering working group with a name that should wrap instead of overflowing the card</Badge>
    </Card>
  );
}
