// Initial Atlas visual: an inline SVG marble figure with raised arms. Swap this component for a
// licensed 3D model or illustration later; the Orrery positions the sphere from the figure's hands.
export default function AtlasFigure() {
  return (
    <svg viewBox="0 0 400 440" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="at-mb" gradientUnits="userSpaceOnUse" x1="70" y1="0" x2="340" y2="440"><stop offset="0" stopColor="#f7f3ea" /><stop offset=".5" stopColor="#d9d0bb" /><stop offset="1" stopColor="#968c75" /></linearGradient>
        <radialGradient id="at-lit" gradientUnits="userSpaceOnUse" cx="100" cy="120" r="320"><stop offset="0" stopColor="#fff" stopOpacity=".7" /><stop offset=".5" stopColor="#fff" stopOpacity="0" /></radialGradient>
        <radialGradient id="at-shade" gradientUnits="userSpaceOnUse" cx="350" cy="380" r="300"><stop offset="0" stopColor="#5a5240" stopOpacity=".45" /><stop offset="1" stopColor="#5a5240" stopOpacity="0" /></radialGradient>
        <linearGradient id="at-fade" x1="0" y1="0" x2="0" y2="1"><stop offset=".72" stopColor="#fff" /><stop offset="1" stopColor="#000" /></linearGradient>
        <mask id="at-m"><rect width="400" height="440" fill="url(#at-fade)" /></mask>
        <g id="at-fig">
          <path id="at-arm" d="M142 222 C112 210 86 214 62 222 L90 74 C93 56 100 42 114 30 C104 24 88 22 76 29 C62 38 54 54 50 74 L26 220 C20 240 28 258 46 260 C82 268 114 278 144 290Z" />
          <use href="#at-arm" transform="matrix(-1 0 0 1 400 0)" />
          <path d="M34 440 C36 338 62 270 122 236 C150 220 172 214 174 200 L226 200 C228 214 250 220 278 236 C338 270 364 338 366 440Z" />
          <circle cx="132" cy="246" r="34" /><circle cx="268" cy="246" r="34" />
          <path d="M174 168 L226 168 L232 214 C216 226 184 226 168 214Z" />
          <path d="M200 98 C238 98 248 130 240 156 C232 184 216 196 200 196 C184 196 168 184 160 156 C152 130 162 98 200 98Z" />
          <path d="M158 132 C152 98 178 84 204 88 C232 86 250 106 242 134 C238 118 224 108 204 108 C184 108 168 114 158 132Z" fill="#cfc6b0" />
          <path d="M162 150 C164 188 184 204 200 204 C216 204 236 188 238 150 C230 168 218 172 200 172 C182 172 170 168 162 150Z" fill="#d6cdb8" />
        </g>
        <mask id="at-figm"><use href="#at-fig" fill="#fff" /></mask>
      </defs>
      <g mask="url(#at-m)">
        <g mask="url(#at-figm)"><rect width="400" height="440" fill="url(#at-mb)" /><rect width="400" height="440" fill="url(#at-lit)" /><rect width="400" height="440" fill="url(#at-shade)" /></g>
        <g fill="none" stroke="#7a6f58" strokeOpacity=".4" strokeWidth="1.4" strokeLinecap="round">
          <path d="M174 214 C150 222 126 244 108 278" /><path d="M226 214 C250 222 274 244 292 278" />
          <path d="M200 236 L200 316" /><path d="M128 300 C160 322 182 318 200 312 C218 318 240 322 272 300" />
          <path d="M184 150 C190 146 196 148 198 152" /><path d="M216 150 C210 146 204 148 202 152" />
          <path d="M200 152 L197 168 C199 170 201 170 203 168" />
          <path d="M178 182 C190 188 210 188 222 182" />
          <path d="M174 140 C180 134 190 134 196 138" /><path d="M226 140 C220 134 210 134 204 138" />
          <path d="M58 90 C62 130 56 170 44 214" /><path d="M342 90 C338 130 344 170 356 214" />
          <path d="M76 36 C82 44 86 54 86 66M96 32 C100 42 102 52 100 62" strokeWidth="1" />
          <path d="M324 36 C318 44 314 54 314 66M304 32 C300 42 298 52 300 62" strokeWidth="1" />
        </g>
        <g fill="none" stroke="#B9975B" strokeWidth="1.6" strokeLinecap="round" strokeOpacity=".85">
          <path d="M92 44 C54 110 52 190 92 238" /><path d="M124 232 C70 262 44 322 36 420" /><path d="M164 158 C158 132 168 100 200 100" />
        </g>
      </g>
    </svg>
  );
}
