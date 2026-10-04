// The decorative layers of a holographic card (see [data-holo] in globals.css).
export default function HoloLayers() {
  return (
    <span className="holo" aria-hidden="true">
      <span className="holo-sheen" />
      <span className="holo-foil" />
      <span className="holo-glare" />
    </span>
  );
}
