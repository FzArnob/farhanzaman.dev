/** The pulsing three-dot marker at the top-left of every timeline entry. */
export function Hotspot() {
  return (
    <div>
      <span className="hotspot main-wrapper">
        <span className="hotspot dots-container">
          <span className="hotspot dot1"></span>
          <span className="hotspot dot2"></span>
          <span className="hotspot dot3"></span>
        </span>
      </span>
    </div>
  );
}
