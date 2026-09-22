export function Task() {
  return (
    <div style={{ padding: 32, background: "#111827" }}>
      <h1 style={{ color: "#F9FAFB" }}>Settings</h1>
      <div>
        <span>Profile</span>
        <span>Notifications</span>
      </div>
      <input placeholder="Name" />
      <button style={{ background: "#2563EB", color: "#fff" }}>Save</button>
    </div>
  );
}
