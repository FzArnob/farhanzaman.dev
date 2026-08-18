import type { Expertise } from '../../types/profile';

export function ExpertiseCards({ expertises }: { expertises: Expertise[] }) {
  return (
    <div
      className="row card-container"
      id="expertise-items"
      data-reveal="stagger"
      data-reveal-step="35"
    >
      {expertises.map((card) => (
        <div className="card bg2 c1" key={card.expertise_id}>
          <h2 className="heading c1">{card.name}</h2>
          <h3 className="subheading mono">{`${card.level} · ${card.duration} months`}</h3>
          <p className="details c3">{card.description}</p>
        </div>
      ))}
    </div>
  );
}
