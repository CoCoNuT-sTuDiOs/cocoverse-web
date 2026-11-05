import "./phone.css";

/** A floating gold orb, standing in for the live effect for now. */
export function PreviewPlaceholder({ label = "live preview" }: { label?: string }) {
  return (
    <div className="cvp-ph">
      <div className="cvp-orb" />
      <div className="cvp-ghost">{label}</div>
    </div>
  );
}