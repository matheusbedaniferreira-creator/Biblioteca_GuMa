export default function DragonIllustration({ className = 'dragon-svg', variant = 'stage' }) {
  const uid = variant;
  return (
    <svg className={className} viewBox="0 0 820 320" role="img" aria-label="Dragão soprando fogo">
      <defs>
        <linearGradient id={`body-${uid}`} x1="10%" y1="0%" x2="90%" y2="100%">
          <stop offset="0%" stopColor="#357562"/>
          <stop offset="45%" stopColor="#1e4d3f"/>
          <stop offset="85%" stopColor="#123128"/>
          <stop offset="100%" stopColor="#0b1f19"/>
        </linearGradient>
        <linearGradient id={`wing-fg-${uid}`} x1="0%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#2d6655" stopOpacity=".95"/>
          <stop offset="55%" stopColor="#163c31" stopOpacity=".96"/>
          <stop offset="100%" stopColor="#0a1d17" stopOpacity=".98"/>
        </linearGradient>
        <linearGradient id={`wing-bg-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1d493d" stopOpacity=".85"/>
          <stop offset="100%" stopColor="#0a1c16" stopOpacity=".95"/>
        </linearGradient>
        <linearGradient id={`belly-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#e5c38e"/>
          <stop offset="50%" stopColor="#b98e54"/>
          <stop offset="100%" stopColor="#72532b"/>
        </linearGradient>
        <linearGradient id={`horn-${uid}`} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6c5130"/>
          <stop offset="55%" stopColor="#c9a26c"/>
          <stop offset="100%" stopColor="#f2dfb8"/>
        </linearGradient>
        <radialGradient id={`fire-glow-${uid}`} cx="20%" cy="50%" r="75%">
          <stop offset="0%" stopColor="#fef08a" stopOpacity=".9"/>
          <stop offset="30%" stopColor="#fb923c" stopOpacity=".55"/>
          <stop offset="70%" stopColor="#ea580c" stopOpacity=".18"/>
          <stop offset="100%" stopColor="#9a3412" stopOpacity="0"/>
        </radialGradient>
        <linearGradient id={`fire-outer-${uid}`} x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="#fde047"/>
          <stop offset="28%" stopColor="#fb923c"/>
          <stop offset="68%" stopColor="#dc2626" stopOpacity=".85"/>
          <stop offset="100%" stopColor="#7c2d12" stopOpacity="0"/>
        </linearGradient>
        <linearGradient id={`fire-core-${uid}`} x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="#ffffff"/>
          <stop offset="38%" stopColor="#fef08a"/>
          <stop offset="80%" stopColor="#f97316" stopOpacity=".7"/>
          <stop offset="100%" stopColor="#ea580c" stopOpacity="0"/>
        </linearGradient>
        <filter id={`glow-${uid}`} x="-20%" y="-30%" width="140%" height="160%">
          <feGaussianBlur stdDeviation="6" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      <ellipse cx="305" cy="292" rx="220" ry="13" fill="rgba(0,0,0,0.34)"/>

      {/* Back Wing */}
      <g className="dragon-wing-back">
        <path d="M292 142 C255 44, 196 14, 136 22 C172 48, 188 82, 184 114 C208 100, 232 108, 250 132 C266 122, 278 128, 292 142 Z" fill={`url(#wing-bg-${uid})`} stroke="#2b6150" strokeWidth="1.2"/>
        <path d="M292 142 L182 34 M292 142 L222 86 M292 142 L256 118" stroke="#0d261e" strokeWidth="2.4" strokeLinecap="round"/>
      </g>

      {/* Tail with dorsal ridges */}
      <g className="dragon-tail">
        <path d="M214 218 C148 242, 88 248, 42 206 C20 186, 18 156, 38 140 C32 162, 50 186, 80 196 C126 210, 168 196, 214 184 Z" fill={`url(#body-${uid})`}/>
        <path d="M38 140 L16 126 L29 152 Z" fill={`url(#horn-${uid})`}/>
        <polygon points="74,218 66,200 84,206" fill={`url(#horn-${uid})`}/>
        <polygon points="108,228 102,210 120,216" fill={`url(#horn-${uid})`}/>
        <polygon points="146,226 142,208 158,214" fill={`url(#horn-${uid})`}/>
        <polygon points="182,216 178,198 194,206" fill={`url(#horn-${uid})`}/>
      </g>

      {/* Main Muscular Torso & Chest */}
      <path d="M204 190 C222 140, 282 122, 338 140 C376 152, 398 182, 388 216 C378 244, 326 254, 268 248 C220 242, 192 220, 204 190 Z" fill={`url(#body-${uid})`}/>
      {/* Armored Belly Plates */}
      <path d="M236 222 C276 244, 334 244, 370 218 C360 238, 318 250, 274 247 C248 245, 238 234, 236 222 Z" fill={`url(#belly-${uid})`}/>
      <path d="M256 232 L262 246 M280 236 L284 248 M306 236 L308 248 M332 232 L334 243 M354 224 L356 234" stroke="#5c4020" strokeWidth="1.4" opacity=".6"/>

      {/* Hind Leg */}
      <path d="M240 214 C216 224, 206 246, 214 268 L206 286 L236 288 L244 278 L228 274 C228 258, 240 244, 256 238 Z" fill={`url(#body-${uid})`}/>
      <polygon points="206,286 196,292 212,290" fill={`url(#horn-${uid})`}/>
      <polygon points="222,287 215,294 229,291" fill={`url(#horn-${uid})`}/>
      <polygon points="236,286 234,293 245,288" fill={`url(#horn-${uid})`}/>

      {/* Front Leg */}
      <path d="M352 212 C366 232, 370 256, 358 276 L350 288 L382 288 L390 280 L372 276 C378 258, 374 236, 364 214 Z" fill={`url(#body-${uid})`}/>
      <polygon points="382,288 394,293 380,283" fill={`url(#horn-${uid})`}/>
      <polygon points="368,288 377,294 366,284" fill={`url(#horn-${uid})`}/>

      {/* Foreground Detailed Wing */}
      <g className="dragon-wing-group">
        <path d="M268 148 C218 62, 140 24, 68 42 C104 66, 122 98, 118 130 C148 116, 174 124, 190 148 C214 136, 238 140, 268 148 Z" fill={`url(#wing-fg-${uid})`} stroke="#448b75" strokeWidth="1.6"/>
        <path d="M268 148 C238 100, 184 58, 92 46" fill="none" stroke="#3c7d69" strokeWidth="3.5" strokeLinecap="round"/>
        <path d="M268 148 L128 74 M268 148 L166 110 M268 148 L206 134" stroke="#0d251e" strokeWidth="2.8" strokeLinecap="round"/>
        <polygon points="94,46 84,38 96,42" fill={`url(#horn-${uid})`}/>
      </g>

      {/* Dorsal Spines along back & neck */}
      <polygon points="262,134 252,118 272,128" fill={`url(#horn-${uid})`}/>
      <polygon points="292,130 284,112 302,124" fill={`url(#horn-${uid})`}/>
      <polygon points="322,134 316,116 332,130" fill={`url(#horn-${uid})`}/>

      {/* Neck & Sculpted Head */}
      <g className="dragon-head-group">
        {/* Neck */}
        <path d="M356 164 C376 124, 394 94, 424 82 C446 74, 468 78, 480 94 C462 108, 436 126, 414 172 C398 198, 376 190, 356 164 Z" fill={`url(#body-${uid})`}/>
        <path d="M388 172 C406 144, 424 122, 444 112" fill="none" stroke={`url(#belly-${uid})`} strokeWidth="8" strokeLinecap="round" opacity=".85"/>
        {/* Neck Spines */}
        <polygon points="384,122 368,104 392,114" fill={`url(#horn-${uid})`}/>
        <polygon points="398,100 384,84 406,92" fill={`url(#horn-${uid})`}/>

        {/* Upper Jaw & Snout */}
        <path d="M424 84 C446 66, 484 66, 510 80 C524 88, 534 96, 528 106 C508 110, 482 108, 458 112 L434 122 Z" fill={`url(#body-${uid})`}/>
        {/* Nasal Horn */}
        <polygon points="514,82 526,68 522,86" fill={`url(#horn-${uid})`}/>
        {/* Lower Jaw */}
        <path d="M452 118 L514 122 C518 130, 504 138, 482 138 C460 138, 444 132, 452 118 Z" fill="#133329"/>
        {/* Swept Horns */}
        <path d="M440 74 L400 28 L430 64 Z" fill={`url(#horn-${uid})`}/>
        <path d="M456 72 L432 24 L450 64 Z" fill={`url(#horn-${uid})`}/>
        {/* Glowing Eye */}
        <ellipse cx="472" cy="90" rx="5.5" ry="4" fill="#fde047"/>
        <ellipse cx="473" cy="90" rx="1.6" ry="3.6" fill="#1a1008"/>
        {/* Nostril */}
        <circle cx="516" cy="92" r="2" fill="#0a1914"/>
        {/* Fangs */}
        <polygon points="512,107 516,116 520,107" fill="#f7f2e4"/>
        <polygon points="496,108 500,117 504,108" fill="#f7f2e4"/>
        <polygon points="480,109 483,115 486,109" fill="#f7f2e4"/>
      </g>

      {/* Volumetric Fire Breath */}
      <g className="dragon-fire" filter={`url(#glow-${uid})`}>
        <ellipse cx="620" cy="112" rx="140" ry="54" fill={`url(#fire-glow-${uid})`}/>
        <path d="M518 110 C574 88, 662 66, 774 84 C724 104, 762 122, 804 126 C738 144, 682 162, 612 146 C566 136, 538 124, 518 116 Z" fill={`url(#fire-outer-${uid})`}/>
        <path d="M518 112 C564 98, 628 92, 708 106 C666 118, 692 130, 728 132 C668 140, 602 136, 518 116 Z" fill={`url(#fire-core-${uid})`}/>
        <circle cx="660" cy="88" r="3.2" fill="#fef08a" className="ember e1"/>
        <circle cx="728" cy="100" r="2.8" fill="#fb923c" className="ember e2"/>
        <circle cx="696" cy="140" r="3.4" fill="#fde047" className="ember e3"/>
        <circle cx="766" cy="118" r="2.4" fill="#ffffff" className="ember e4"/>
      </g>
    </svg>
  );
}
