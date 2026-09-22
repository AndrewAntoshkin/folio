import { Field, Input, Label } from "@ds";

export function Task() {
  return (
    <Field label="Email" helper="Work address" error="This address is invalid">
      <Label htmlFor="email">Email</Label>
      <Input id="email" type="email" invalid defaultValue="not-an-email" />
    </Field>
  );
}
