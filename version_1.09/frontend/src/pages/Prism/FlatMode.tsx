import { setFlatMode } from '../../lib/quality';
import { HomePage } from '../Home/HomePage';

/**
 * Flat mode.
 *
 * Not a stub and not an apology — it is the 2D site that already exists, rendered
 * whole. Reached by no WebGL, by prefers-reduced-motion, or by the visitor's own
 * choice, and it is the honest answer to "what if WebGL is blocked on their office
 * laptop", which is a real risk for a portfolio recruiters open on managed machines.
 *
 * Lazily loaded: most visitors get the 3D world, so the flat site should not sit in the
 * chunk that has to paint first.
 */
export default function FlatMode() {
  return (
    <>
      <div className="prism-flat-notice">
        <p>
          You are on the flat version — no WebGL, reduced motion, or your own choice.
          Everything is here.
        </p>
        <button
          type="button"
          onClick={() => {
            setFlatMode(false);
            window.location.reload();
          }}
        >
          Try the 3D version
        </button>
      </div>
      <HomePage />
    </>
  );
}
