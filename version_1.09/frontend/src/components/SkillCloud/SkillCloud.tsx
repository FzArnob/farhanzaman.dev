import type { Expertise } from '../../types/profile';

/**
 * Expertise names, for flat mode.
 *
 * This was a rotating TagCloud sphere. In v1.09 that job belongs to act 03, The
 * Lattice, which shows the same 23 names in 3D *and* the edges between them — so the
 * TagCloud dependency was dropped rather than kept around for one component.
 *
 * What is left here is what flat mode actually needs: the same names, as real links in
 * a list, sized by how long each has been used so the weighting the sphere implied is
 * still legible. No dependency, no canvas, keyboard reachable.
 */
export function SkillCloud({ expertises }: { expertises: Expertise[] }) {
  // 3–48 months across the data; sqrt keeps the long tail from swamping the rest.
  const longest = Math.max(1, ...expertises.map((item) => Number(item.duration) || 0));

  return (
    <ul id="skill-canvas" className="skillTags tagcloud" aria-label="Expertise">
      {expertises.map((item) => {
        const weight = Math.sqrt((Number(item.duration) || 0) / longest);
        return (
          <li
            key={item.expertise_id}
            className="tagcloud--item"
            style={{ fontSize: `${(0.85 + weight * 0.95).toFixed(2)}rem` }}
            title={`${item.level} · ${item.duration} months`}
          >
            {item.name}
          </li>
        );
      })}
    </ul>
  );
}
