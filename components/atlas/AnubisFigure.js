// Anubis — guardian of thresholds. A striding Saite-style statue in carved black basalt with restrained
// antique-gold inlays (wesekh collar, eye, inner ear, kilt belt, was-sceptre), lit from the upper left to
// match the Atlas hero. Built in the same layered-gradient + form-shadow + rim-light idiom as the Atlas
// fallback, so no external 3D runtime or unverified asset is needed.
export default function AnubisFigure() {
  return (
    <figure className="anubis-guard" aria-hidden="true">
      <svg viewBox="0 0 360 520" xmlns="http://www.w3.org/2000/svg" focusable="false" aria-hidden="true">
        <defs>
          {/* carved black basalt body with a warm bronze undertone */}
          <linearGradient id="an-stone" x1="70" y1="20" x2="300" y2="500" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#565D69" />
            <stop offset="34%" stopColor="#3A404A" />
            <stop offset="72%" stopColor="#232830" />
            <stop offset="100%" stopColor="#141820" />
          </linearGradient>
          <radialGradient id="an-key" cx="112" cy="100" r="250" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#CFB077" stopOpacity=".34" />
            <stop offset="52%" stopColor="#6E5A36" stopOpacity=".10" />
            <stop offset="100%" stopColor="#000" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="an-shade" cx="296" cy="400" r="250" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#05070A" stopOpacity=".74" />
            <stop offset="100%" stopColor="#05070A" stopOpacity="0" />
          </radialGradient>
          {/* broad cool museum wash from the upper left, lifts the basalt off the navy ground */}
          <radialGradient id="an-key2" cx="104" cy="40" r="340" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#9FB2CB" stopOpacity=".24" />
            <stop offset="58%" stopColor="#93A7C2" stopOpacity=".06" />
            <stop offset="100%" stopColor="#93A7C2" stopOpacity="0" />
          </radialGradient>
          {/* fine basalt speckle */}
          <filter id="an-grain" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="7" stitchTiles="stitch" />
            <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .6 0" />
          </filter>
          <linearGradient id="an-gold" x1="100" y1="80" x2="270" y2="430" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#E3CA92" />
            <stop offset="52%" stopColor="#B99A5B" />
            <stop offset="100%" stopColor="#6E562C" />
          </linearGradient>
          <filter id="an-soft" x="-14%" y="-14%" width="128%" height="128%">
            <feGaussianBlur stdDeviation="2.6" />
          </filter>
          <filter id="an-soft-s" x="-14%" y="-14%" width="128%" height="128%">
            <feGaussianBlur stdDeviation="1.4" />
          </filter>

          {/* complete silhouette, reused so internal shading stays clipped to the stone */}
          <g id="an-sil">
            {/* tall pointed jackal ears */}
            <path d="M149 130 L137 60 C142 57 150 64 157 86 L167 126 Z" />
            <path d="M193 126 L207 58 C213 60 217 71 214 94 L207 130 Z" />
            {/* cranium, brow stop and long canine muzzle in three-quarter profile facing left */}
            <path d="M145 126 C153 112 187 110 209 122 C221 132 227 150 225 172 L219 200 L147 196 L141 174 C127 175 110 172 96 165 C92 162 92 155 98 152 C113 146 130 139 145 126 Z" />
            {/* lower jaw + throat */}
            <path d="M101 167 C119 172 135 173 149 171 L147 183 C129 184 111 179 99 173 Z" />
            {/* neck */}
            <path d="M158 190 L202 190 L206 234 L154 234 Z" />
            {/* nemes headcloth lappets falling over the shoulders */}
            <path d="M136 168 C128 202 122 252 124 308 L152 310 C153 262 156 218 160 186 Z" />
            <path d="M212 158 C226 196 234 246 232 308 L200 310 C200 260 196 218 190 180 Z" />
            {/* torso with the arms carved against it, tapering waist, flared shendyt kilt */}
            <path d="M108 252 C126 232 150 224 180 224 C210 224 234 232 252 252 C258 286 252 320 244 348 L240 366 L252 380 L268 428 L92 428 L108 380 L120 366 L116 348 C108 320 102 286 108 252 Z" />
            {/* striding legs below the kilt hem — left foot advanced */}
            <path d="M128 424 L170 424 C168 442 166 460 166 472 L176 486 L114 486 L120 470 C122 452 126 438 128 424 Z" />
            <path d="M180 424 L222 424 C224 440 227 456 230 468 L240 486 L182 486 L184 468 C182 454 181 438 180 424 Z" />
          </g>
          <clipPath id="an-clip">
            <use href="#an-sil" />
          </clipPath>
        </defs>

        {/* quiet pylon/stele frame behind the figure */}
        <g stroke="url(#an-gold)" fill="none" opacity=".3">
          <path d="M54 496 L68 78 L292 78 L306 496" strokeWidth="1" />
          <path d="M62 78 L298 78" strokeWidth="1.5" />
          <path d="M74 92 L286 92" strokeWidth=".8" strokeDasharray="2 5" />
        </g>

        {/* plinth and contact shadow ground the statue (drawn unmasked so they stay solid) */}
        <ellipse cx="180" cy="504" rx="110" ry="12" fill="#05070A" opacity=".55" filter="url(#an-soft)" />
        <g>
          <rect x="96" y="484" width="168" height="20" fill="#141922" />
          <rect x="96" y="484" width="168" height="2.5" fill="url(#an-gold)" opacity=".45" />
          <rect x="88" y="502" width="184" height="6" fill="#0A0D12" />
          <rect x="88" y="502" width="184" height="1" fill="#333A45" opacity=".7" />
        </g>

        <g>
          {/* drop shadow */}
          <use href="#an-sil" fill="#05070A" opacity=".5" transform="translate(9,10)" filter="url(#an-soft)" />

          {/* stone body + key light + cool museum wash + deep shade */}
          <use href="#an-sil" fill="url(#an-stone)" />
          <use href="#an-sil" fill="url(#an-key)" />
          <use href="#an-sil" fill="url(#an-key2)" />
          <use href="#an-sil" fill="url(#an-shade)" />

          {/* internal sculptural planes, clipped to the silhouette */}
          <g clipPath="url(#an-clip)">
            {/* sunlit left plane of snout, brow, shoulder and chest */}
            <path d="M96 158 C116 150 134 141 146 128 L153 163 C132 167 110 167 96 164 Z" fill="#4E5560" opacity=".62" filter="url(#an-soft)" />
            <path d="M100 246 C120 232 144 226 172 226 L160 372 L104 366 Z" fill="#454C57" opacity=".42" filter="url(#an-soft)" />
            <path d="M112 262 C126 254 142 250 154 252 L150 320 L114 314 Z" fill="#525A66" opacity=".28" filter="url(#an-soft)" />
            {/* lit outer plane of the left arm — reads as a carved cylinder */}
            <path d="M108 254 C104 292 106 340 112 378 L120 376 C114 336 113 292 118 258 Z" fill="#7C8492" opacity=".3" filter="url(#an-soft-s)" />
            <path d="M244 262 C248 306 248 344 244 376 L236 374 C240 342 240 306 236 266 Z" fill="#5A616D" opacity=".18" filter="url(#an-soft-s)" />
            {/* arm grooves — the arms are carved against the torso, not free */}
            <path d="M136 262 C132 306 130 348 132 392" stroke="#080A0E" strokeWidth="3" fill="none" opacity=".45" filter="url(#an-soft-s)" />
            <path d="M226 262 C230 306 232 348 230 392" stroke="#080A0E" strokeWidth="3" fill="none" opacity=".55" filter="url(#an-soft-s)" />
            {/* hands at rest against the kilt */}
            <path d="M116 380 C126 386 138 388 148 386 M212 386 C222 388 234 386 244 380" stroke="#07090D" strokeWidth="2" fill="none" opacity=".5" filter="url(#an-soft-s)" />
            {/* deep shadow under jaw, between lappets, and down the right flank */}
            <path d="M140 178 C158 190 182 193 202 184 L198 220 L146 217 Z" fill="#07090D" opacity=".72" filter="url(#an-soft)" />
            <path d="M216 206 L280 240 L268 496 L206 496 Z" fill="#07090D" opacity=".5" filter="url(#an-soft)" />
            {/* pectorals, sternum, abdomen */}
            <path d="M128 274 C146 286 164 288 176 280 M184 280 C196 288 214 286 232 274" stroke="#080A0E" strokeWidth="2.4" fill="none" opacity=".55" filter="url(#an-soft-s)" />
            <path d="M180 296 L180 366" stroke="#080A0E" strokeWidth="1.8" opacity=".5" />
            <path d="M152 320 C160 326 168 328 176 326 M184 326 C192 328 200 326 208 320" stroke="#080A0E" strokeWidth="1.4" fill="none" opacity=".4" />
            {/* shendyt kilt — pleats and hem shadow */}
            <path d="M110 392 L250 392 L262 396 L272 430 L88 430 L98 396 Z" fill="#0F1319" opacity=".7" />
            <g stroke="#2E343E" strokeWidth="1" opacity=".6">
              <path d="M132 396 L126 430" /><path d="M152 396 L148 430" /><path d="M180 396 L180 430" />
              <path d="M208 396 L212 430" /><path d="M228 396 L236 430" />
            </g>
            <path d="M92 424 L268 424" stroke="#05070A" strokeWidth="5" opacity=".5" filter="url(#an-soft-s)" />
            {/* leg modelling: knee light, inner-thigh shadow, foot shadow */}
            <path d="M126 432 C132 448 134 462 132 476 L120 484" stroke="#4A515C" strokeWidth="2.4" fill="none" opacity=".35" filter="url(#an-soft-s)" />
            <path d="M222 432 C218 448 216 462 218 476 L232 484" stroke="#05070A" strokeWidth="3.4" fill="none" opacity=".5" filter="url(#an-soft-s)" />
            <path d="M174 434 L172 486 M184 434 L186 486" stroke="#05070A" strokeWidth="4" opacity=".5" filter="url(#an-soft-s)" />
            <path d="M116 478 L172 478 M186 478 L238 478" stroke="#05070A" strokeWidth="3" opacity=".45" filter="url(#an-soft-s)" />
          </g>

          {/* carved inner-ear channels */}
          <path d="M146 122 L140 72 L154 94 Z" fill="#0D1016" stroke="url(#an-gold)" strokeWidth=".9" opacity=".8" />
          <path d="M197 120 L208 70 L212 96 Z" fill="#0D1016" stroke="url(#an-gold)" strokeWidth=".8" opacity=".65" />

          {/* wesekh broad collar — restrained antique gold */}
          <g fill="none" stroke="url(#an-gold)">
            <path d="M104 232 C132 258 228 258 256 232" strokeWidth="1.5" opacity=".85" />
            <path d="M98 246 C130 276 230 276 262 246" strokeWidth="1.1" opacity=".62" />
            <path d="M94 260 C130 294 230 294 266 260" strokeWidth="1.2" opacity=".75" />
            <path d="M122 243 L118 256 M142 250 L140 264 M162 254 L161 269 M180 255 L180 270 M198 254 L199 269 M218 250 L220 264 M238 243 L242 256" strokeWidth=".9" opacity=".55" />
          </g>

          {/* nemes striping */}
          <g stroke="url(#an-gold)" strokeWidth=".85" opacity=".46" fill="none">
            <path d="M140 194 L162 198 M134 216 L158 220 M130 238 L156 242 M128 260 L154 264 M127 282 L153 286" />
            <path d="M196 198 L220 194 M202 220 L226 216 M204 242 L230 238 M206 264 L232 260 M207 286 L233 282" />
          </g>

          {/* belt + upper-arm bands */}
          <path d="M112 386 L248 386 M114 394 L246 394" stroke="url(#an-gold)" strokeWidth="1.2" opacity=".7" />
          <rect x="168" y="383" width="24" height="14" fill="#14181F" stroke="url(#an-gold)" strokeWidth="1.1" opacity=".85" />
          <path d="M96 292 L118 296 M242 296 L264 292" stroke="url(#an-gold)" strokeWidth="1.3" opacity=".6" />

          {/* udjat-inspired eye & brow line */}
          <path d="M143 148 C151 144 161 145 168 149" stroke="url(#an-gold)" strokeWidth="1.1" fill="none" opacity=".85" />
          <path d="M146 153 C152 149 160 149 165 153 C159 156 152 156 146 153 Z" fill="#DFC48A" opacity=".9" />
          <path d="M163 153 L176 157 M157 155 C157 163 153 168 148 170" stroke="url(#an-gold)" strokeWidth=".9" fill="none" opacity=".7" />

          {/* basalt speckle + faint cool rim on the shadow edge for separation */}
          <rect x="60" y="0" width="240" height="520" filter="url(#an-grain)" opacity=".07" clipPath="url(#an-clip)" />
          <g fill="none" stroke="#9CB0C8" strokeWidth="1" strokeLinecap="round" opacity=".26">
            <path d="M207 56 L214 94 L207 128 C221 130 227 150 225 172" />
            <path d="M250 250 C258 300 256 350 252 386 L260 396 L270 428" />
            <path d="M234 434 C232 450 230 464 233 476 L238 486" />
          </g>

          {/* gold rim light on the sunward (left) edge — ties the statue to the hero's key light */}
          <g fill="none" stroke="url(#an-gold)" strokeWidth="1.3" strokeLinecap="round" opacity=".85">
            <path d="M138 58 L150 128 C130 140 110 148 97 154 C93 157 93 162 99 165" />
            <path d="M106 250 C100 300 100 350 106 386 L98 396 L89 428" />
            <path d="M126 186 C123 220 122 262 124 306" opacity=".55" />
            <path d="M124 430 C120 450 118 468 110 484" opacity=".6" />
          </g>

          {/* was-sceptre — vertical staff with the forked base and angled head */}
          <g stroke="url(#an-gold)" fill="none" opacity=".8">
            <path d="M62 132 L62 488" strokeWidth="1.7" />
            <path d="M62 134 C62 120 50 112 40 116 C48 122 52 128 54 136" strokeWidth="1.6" />
            <path d="M56 488 L62 472 L68 488" strokeWidth="1.4" />
          </g>
        </g>
      </svg>
      <figcaption className="anubis-caption">
        <span>ANUBIS</span>
        <i>Guardian of thresholds</i>
      </figcaption>
    </figure>
  );
}
