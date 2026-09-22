import { Button, Card, PageHeader } from "@ds";

export function Task() {
  return (
    <Card>
      <PageHeader title="No members yet" description="Invite a teammate to start collaborating." />
      <Button>Invite member</Button>
    </Card>
  );
}
