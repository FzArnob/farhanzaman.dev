import { useState } from 'react';

/** One-off hint pointing at the theme toggle. Only rendered on a visitor's first visit. */
export function ThemePopup({ visible }: { visible: boolean }) {
  const [dismissed, setDismissed] = useState(false);

  if (!visible || dismissed) return null;

  return (
    <div id="theme-popup" className="animate-bottom" style={{ display: 'block' }} onClick={() => setDismissed(true)}>
      <div className="popup-box bg2 c2">
        <div className="popup-content">
          <div className="triangle"></div>
          <div className="popup-text">
            You can switch <span className="c-theme">theme</span> here.
          </div>
          <div className="popup-button">
            <span className="ico-gen">F</span>
          </div>
        </div>
      </div>
    </div>
  );
}
