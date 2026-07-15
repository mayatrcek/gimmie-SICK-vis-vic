// OVERWORLD-styled SST colour scale: ink-framed gradient bar with VT323
// endpoint labels. Gradient stops sampled from ERDDAP's Rainbow palette so
// it matches the map overlay exactly.
export default function SstScale({ min, max }: { min: number; max: number }) {
  return (
    <div className="sstscale" aria-label={`SST colour scale, ${min} to ${max} degrees Celsius`}>
      <span>{min.toFixed(1)}&deg;</span>
      <span className="sstscale-bar" aria-hidden="true" />
      <span>{max.toFixed(1)}&deg;C</span>
    </div>
  );
}
