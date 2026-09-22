import { Select } from "@ds";

const COUNTRIES = ["Austria","Belgium","Canada","Denmark","Estonia","Finland","Germany","Hungary","Ireland","Japan"];

export function Task() {
  return (
    <Select label="Country" helper="Used for billing" error="Select a country to continue" defaultValue="">
      <option value="">Choose one</option>
      {COUNTRIES.map((name) => (
        <option key={name} value={name}>{name}</option>
      ))}
    </Select>
  );
}
