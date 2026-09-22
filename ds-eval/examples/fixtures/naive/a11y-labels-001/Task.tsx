export function Task() {
  return (
    <form>
      <input placeholder="Email" />
      <input placeholder="Password" />
      <div onClick={() => undefined} style={{ background: "#2563EB", color: "#fff" }}>Go</div>
    </form>
  );
}
