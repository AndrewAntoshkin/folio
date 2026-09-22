import { Button, Input, Label } from "@ds";

export function Task() {
  return (
    <form className="ds-stack">
      <div className="ds-field">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" invalid defaultValue="a@" />
      </div>
      <div className="ds-field">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" />
      </div>
      <Button type="submit">Sign in</Button>
    </form>
  );
}
