import { useState } from "react";
import { Button, Input, Label, PageHeader, Switch, Tabs } from "@ds";

export function Task() {
  const [tab, setTab] = useState("Profile");
  return (
    <div className="ds-stack">
      <PageHeader
        title="Settings"
        description="Profile and notification preferences"
        actions={
          <>
            <Button variant="secondary">Cancel</Button>
            <Button>Save</Button>
          </>
        }
      />
      <Tabs tabs={["Profile", "Notifications"]} value={tab} onChange={setTab} />
      {tab === "Profile" ? (
        <div className="ds-stack">
          <Label htmlFor="name">Display name</Label>
          <Input id="name" defaultValue="Ada Lovelace" />
        </div>
      ) : (
        <Switch label="Email digest" checked onChange={() => undefined} />
      )}
    </div>
  );
}
