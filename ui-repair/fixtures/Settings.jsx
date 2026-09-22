export function Settings() {
  const open = () => {};
  return (
    <section>
      <h1>Settings</h1>
      <div style={{ background: "#8B5CF6", padding: 13 }}>
        <button onClick={open}>Save</button>
        <div className="modal">
          <h2>Delete account</h2>
          <button>×</button>
        </div>
      </div>
    </section>
  );
}
