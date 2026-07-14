import "./WhatWeBuildVisual.css";

const fragmentProps = (x: number, y: number, rotation = 0) => ({
  "data-build-fragment": "",
  "data-scatter-x": x,
  "data-scatter-y": y,
  "data-scatter-rotation": rotation,
});

export default function WhatWeBuildVisual() {
  return (
    <div className="build-native-visual" aria-hidden="true">
      <div className="build-native-vignette" />

      <svg className="build-native-construction" viewBox="0 0 820 620" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="build-route-gradient" x1="0" x2="1">
            <stop offset="0" stopColor="#ff3d0a" stopOpacity="0" />
            <stop offset=".42" stopColor="#ff5b21" stopOpacity=".9" />
            <stop offset="1" stopColor="#ff8b38" stopOpacity=".18" />
          </linearGradient>
        </defs>
        <g className="build-native-grid">
          {[90, 190, 290, 390, 490, 590, 690, 790].map((x) => (
            <path key={`v-${x}`} className="build-native-grid-line" d={`M${x} 38V584`} />
          ))}
          {[78, 158, 238, 318, 398, 478, 558].map((y) => (
            <path key={`h-${y}`} className="build-native-grid-line" d={`M36 ${y}H804`} />
          ))}
        </g>
        <path className="build-native-route" pathLength="1" d="M68 366 C156 224 236 498 352 314 S596 168 776 252" />
        <path className="build-native-sketch build-native-sketch-one" pathLength="1" d="M118 182 C174 112 244 152 276 208" />
        <path className="build-native-sketch build-native-sketch-two" pathLength="1" d="M536 456 C624 406 697 438 748 512" />
        <g className="build-native-measure build-native-measure-columns">
          <path d="M213 108H618M213 102V114M618 102V114" />
          <text x="405" y="98">12 COL / 64 PX</text>
        </g>
        <g className="build-native-measure build-native-measure-space">
          <path d="M576 294V360M570 294H582M570 360H582" />
          <text x="588" y="330">32</text>
        </g>
        <g className="build-native-anchors">
          <circle className="build-native-anchor" cx="83" cy="363" r="3" />
          <circle className="build-native-anchor" cx="214" cy="108" r="3" />
          <circle className="build-native-anchor" cx="618" cy="108" r="3" />
          <circle className="build-native-anchor" cx="777" cy="251" r="3" />
          <circle className="build-native-anchor" cx="577" cy="360" r="3" />
        </g>
      </svg>

      <span className="build-native-spark" />
      <span className="build-native-idea-label build-native-idea-identity" {...fragmentProps(-76, -96, -4)}>IDENTITY</span>
      <span className="build-native-idea-label build-native-idea-story" {...fragmentProps(118, -54, 3)}>STORY</span>
      <span className="build-native-idea-label build-native-idea-purpose" {...fragmentProps(-112, 84, -3)}>PURPOSE</span>

      <div className="build-native-browser">
        <div className="build-native-browser-top">
          <div className="build-native-brand" {...fragmentProps(-92, -58, -4)}>
            <i />
            <span>PHX</span>
          </div>
          <nav className="build-native-nav" aria-label="Website composition navigation">
            <span {...fragmentProps(82, -78, 3)}>STORY</span>
            <span {...fragmentProps(138, -18, -2)}>SYSTEM</span>
            <span {...fragmentProps(74, 54, 4)}>MOTION</span>
          </nav>
          <span className="build-native-nav-mark" {...fragmentProps(126, -82, 2)}>01—24</span>
        </div>

        <div className="build-native-browser-body">
          <section className="build-native-hero-copy">
            <span className="build-native-kicker" {...fragmentProps(-104, -72, -4)}>CREATIVE ENGINEERING</span>
            <h3 className="build-native-headline">
              <span {...fragmentProps(-116, -24, -5)}>MAKE</span>
              <span {...fragmentProps(-44, 62, 3)}>THE IDEA</span>
              <span {...fragmentProps(56, 92, -2)}>MATTER.</span>
            </h3>
            <div className="build-native-copy-lines" {...fragmentProps(-128, 106, -3)}>
              <i /><i /><i />
            </div>
            <button className="build-native-cta" type="button" tabIndex={-1} {...fragmentProps(-82, 126, 4)}>
              <span>START A PROJECT</span><i />
            </button>
          </section>

          <figure className="build-native-media" {...fragmentProps(122, 24, 3)}>
            <div className="build-native-media-art">
              <span className="build-native-orbit build-native-orbit-one" />
              <span className="build-native-orbit build-native-orbit-two" />
              <span className="build-native-core" />
              <svg viewBox="0 0 260 240" preserveAspectRatio="none">
                <path className="build-native-art-path" pathLength="1" d="M-8 210 C58 145 74 64 143 42 S226 104 274 2" />
                <path className="build-native-art-path build-native-art-path-two" pathLength="1" d="M14 248 C86 186 112 194 154 129 S226 67 270 78" />
              </svg>
            </div>
            <figcaption><span>MOTION / IDENTITY</span><i>24—01</i></figcaption>
          </figure>

          <div className="build-native-modules">
            <article className="build-native-module build-native-module-one" {...fragmentProps(-126, 82, -3)}>
              <span>01</span><strong>STORY</strong><i /><i />
            </article>
            <article className="build-native-module build-native-module-two" {...fragmentProps(28, 128, 4)}>
              <span>02</span><strong>SYSTEM</strong><i /><i />
            </article>
            <article className="build-native-module build-native-module-three" {...fragmentProps(136, 66, -2)}>
              <span>03</span><strong>MOTION</strong><i /><i />
            </article>
          </div>
        </div>
      </div>

      <div className="build-native-selection">
        <span /><span /><span /><span />
      </div>
      <svg className="build-native-cursor" viewBox="0 0 24 28">
        <path d="M3 2.4 20.2 17l-8 .8-4.6 7.5L3 2.4Z" />
      </svg>

      <div className="build-native-mobile" {...fragmentProps(152, 112, 4)}>
        <div className="build-native-mobile-bar"><i /><span /></div>
        <div className="build-native-mobile-copy"><i /><i /><i /></div>
        <div className="build-native-mobile-media"><span /></div>
        <div className="build-native-mobile-cta" />
      </div>
      <div className="build-native-breakpoint"><i /><span>RESPONSIVE / 768</span><i /></div>
    </div>
  );
}
