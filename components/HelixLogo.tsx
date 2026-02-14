export default function HelixLogo({ className = "" }: { className?: string }) {
  /* Original reverse-S helix geometry, pre-scaled ×11 from the icon */
  const L = "M -192.5,-258.5 Q -247.5,-148.5 -203.5,-5.5 Q -159.5,148.5 -247.5,258.5";
  const R = "M  192.5,-258.5 Q  247.5,-148.5  203.5,-5.5 Q  159.5,148.5  247.5,258.5";

  return (
    <svg
      viewBox="0 0 1024 1024"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* ── Gradients ── */}
        <linearGradient id="hlxGradFull" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#4A90E2"/>
          <stop offset="50%"  stopColor="#7B68EE"/>
          <stop offset="100%" stopColor="#9B59B6"/>
        </linearGradient>
        <linearGradient id="hlxGradL" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#4A90E2"/>
          <stop offset="100%" stopColor="#7B68EE"/>
        </linearGradient>
        <linearGradient id="hlxGradR" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#7B68EE"/>
          <stop offset="100%" stopColor="#9B59B6"/>
        </linearGradient>
        <linearGradient id="hlxRung" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#4A90E2" stopOpacity="0.5"/>
          <stop offset="50%"  stopColor="#7B68EE" stopOpacity="0.9"/>
          <stop offset="100%" stopColor="#9B59B6" stopOpacity="0.5"/>
        </linearGradient>

        {/* ── Ambient glow (no filter — radial gradient fades to 0) ── */}
        <radialGradient id="hlxAmbient" cx="50%" cy="50%" r="40%">
          <stop offset="0%"   stopColor="#7B68EE" stopOpacity="0.15"/>
          <stop offset="60%"  stopColor="#4A90E2" stopOpacity="0.05"/>
          <stop offset="100%" stopColor="#4A90E2" stopOpacity="0"/>
        </radialGradient>
      </defs>

      <style>{`
        @keyframes hlxPulse {
          0%, 100% { opacity: 0.15; }
          50%      { opacity: 0.5; }
        }
        @keyframes hlxFlow {
          0%   { stroke-dashoffset: 900; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes hlxRungFade {
          0%, 100% { opacity: 0.35; }
          50%      { opacity: 0.8; }
        }
        @keyframes hlxDotPulse {
          0%, 100% { r: 6; opacity: 0.5; }
          50%      { r: 10; opacity: 1; }
        }
      `}</style>

      {/* Ambient glow background */}
      <circle cx="512" cy="512" r="420" fill="url(#hlxAmbient)"/>

      <g transform="translate(512, 512)">

        {/* ══════ GLOW LAYERS (wide, faded — fake blur without filter) ══════ */}
        <path d={L} stroke="#4A90E2" strokeWidth="70" fill="none" strokeLinecap="round" opacity="0.06"
              style={{ animation: "hlxPulse 4s ease-in-out infinite" }}/>
        <path d={R} stroke="#9B59B6" strokeWidth="70" fill="none" strokeLinecap="round" opacity="0.06"
              style={{ animation: "hlxPulse 4s ease-in-out infinite 2s" }}/>
        <path d={L} stroke="#4A90E2" strokeWidth="48" fill="none" strokeLinecap="round" opacity="0.10"
              style={{ animation: "hlxPulse 4s ease-in-out infinite 0.5s" }}/>
        <path d={R} stroke="#9B59B6" strokeWidth="48" fill="none" strokeLinecap="round" opacity="0.10"
              style={{ animation: "hlxPulse 4s ease-in-out infinite 2.5s" }}/>

        {/* ══════ MAIN STRANDS (the reverse-S curves) ══════ */}
        <path d={L} stroke="url(#hlxGradL)" strokeWidth="30" fill="none"
              strokeLinecap="round" opacity="0.95"/>
        <path d={R} stroke="url(#hlxGradR)" strokeWidth="30" fill="none"
              strokeLinecap="round" opacity="0.95"/>

        {/* ══════ BRIGHT CORE (thin inner highlight) ══════ */}
        <path d={L} stroke="#7EB8FF" strokeWidth="8" fill="none"
              strokeLinecap="round" opacity="0.4"/>
        <path d={R} stroke="#C9A0FF" strokeWidth="8" fill="none"
              strokeLinecap="round" opacity="0.4"/>

        {/* ══════ ENERGY FLOW (animated dash traveling along strands) ══════ */}
        <path d={L} stroke="#FFFFFF" strokeWidth="6" fill="none"
              strokeLinecap="round" opacity="0.35"
              strokeDasharray="40 860"
              style={{ animation: "hlxFlow 3s linear infinite" }}/>
        <path d={R} stroke="#FFFFFF" strokeWidth="6" fill="none"
              strokeLinecap="round" opacity="0.35"
              strokeDasharray="40 860"
              style={{ animation: "hlxFlow 3s linear infinite 1.5s" }}/>

        {/* ══════ DNA RUNGS ══════ */}
        {[
          { y: -195, x: 172, w: 10, d: 0 },
          { y: -100, x: 196, w: 12, d: 0.6 },
          { y:    0, x: 200, w: 14, d: 1.2 },
          { y:  100, x: 196, w: 12, d: 1.8 },
          { y:  195, x: 220, w: 10, d: 2.4 },
        ].map(({ y, x, w, d }) => (
          <line key={y} x1={-x} y1={y} x2={x} y2={y}
                stroke="url(#hlxRung)" strokeWidth={w} strokeLinecap="round"
                style={{ animation: `hlxRungFade 3s ease-in-out infinite ${d}s` }}/>
        ))}

        {/* ══════ NODE DOTS (at rung-strand intersections) ══════ */}
        {[
          { cx: -172, cy: -195, c: "#4A90E2", d: 0 },
          { cx:  172, cy: -195, c: "#9B59B6", d: 0.3 },
          { cx: -196, cy: -100, c: "#4A90E2", d: 0.6 },
          { cx:  196, cy: -100, c: "#9B59B6", d: 0.9 },
          { cx: -200, cy:    0, c: "#7B68EE", d: 1.2 },
          { cx:  200, cy:    0, c: "#7B68EE", d: 1.5 },
          { cx: -196, cy:  100, c: "#4A90E2", d: 1.8 },
          { cx:  196, cy:  100, c: "#9B59B6", d: 2.1 },
          { cx: -220, cy:  195, c: "#4A90E2", d: 2.4 },
          { cx:  220, cy:  195, c: "#9B59B6", d: 2.7 },
        ].map(({ cx, cy, c, d }) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={7} fill={c} opacity="0.7"
                  style={{ animation: `hlxDotPulse 2.5s ease-in-out infinite ${d}s` }}/>
        ))}
      </g>
    </svg>
  );
}
