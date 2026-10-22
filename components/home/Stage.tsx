import type { CSSProperties } from "react";
import { COMPANIES, KEEP, THOUGHTS, type Keep } from "./content";
import s from "./home.module.css";

type Props = {
  studioName: string;
  narrow: boolean;
  reflSize: string;
  tagW: string;
  tagT: string;
  onFounder: (i: number, on: boolean) => void;
};

const pawnClip = "polygon(50% 0,70% 14%,64% 34%,80% 90%,100% 100%,0 100%,20% 90%,36% 34%,30% 14%)";
const pawnBody = "linear-gradient(90deg,#B8A88E,#F4EDDD 45%,#B8A88E)";

function KeepObject({ kind }: { kind: Keep["kind"] }) {
  const shadow = "5px 8px 12px rgba(40,24,16,.45)";
  switch (kind) {
    case "book":
      return <div style={{ width: 62, height: 80, background: "linear-gradient(90deg,#123A40 0 16%,#2F6F7A 16% 100%)", boxShadow: shadow, transform: "skewY(-5deg)" }} />;
    case "box":
      return <div style={{ width: 86, height: 58, background: "linear-gradient(180deg,#B0654A,#8C4A32)", borderTop: "9px solid #C98E4E", boxShadow: shadow }} />;
    case "screen":
      return (
        <div style={{ width: 78, height: 56, border: "5px solid #1B1D24", background: "linear-gradient(180deg,#FBF6EA,#E6DCCB)", display: "flex", flexDirection: "column", gap: 4, padding: 6, boxShadow: "0 0 24px rgba(243,230,200,.7)" }}>
          <div style={{ height: 5, background: "#A8242A", width: "40%" }} />
          <div style={{ height: 4, background: "#C9BCA8" }} />
          <div style={{ height: 4, background: "#C9BCA8", width: "70%" }} />
        </div>
      );
    case "scroll":
      return <div style={{ width: 96, height: 28, borderRadius: 14, background: "linear-gradient(180deg,#FBF6EA,#C9B797)", boxShadow: "5px 8px 12px rgba(40,24,16,.4)" }} />;
    case "dome":
      return (
        <div style={{ position: "relative", width: 72, height: 86, borderRadius: "36px 36px 4px 4px", border: "1.5px solid rgba(255,255,255,.8)", background: "radial-gradient(circle at 34% 28%,rgba(255,255,255,.55),rgba(255,255,255,.06) 40%)", boxShadow: "0 10px 0 -4px #6E4B34" }}>
          <div style={{ position: "absolute", left: 14, top: 34, width: 44, height: 22, borderRadius: 12, background: "#F6F1E7", boxShadow: "10px -8px 0 -2px #F6F1E7,-6px -4px 0 -4px #F1E3D3" }} />
        </div>
      );
    case "pawns":
      return (
        <div style={{ display: "flex", gap: 6, alignItems: "flex-end" }}>
          <div style={{ width: 20, height: 34, background: `radial-gradient(circle at 50% 22%,#F7F1E5 0 7px,transparent 7.5px),${pawnBody}`, clipPath: pawnClip }} />
          <div style={{ width: 24, height: 40, background: pawnBody, clipPath: pawnClip }} />
          <div style={{ width: 20, height: 34, background: pawnBody, clipPath: pawnClip }} />
        </div>
      );
  }
}

const plate = (st: CSSProperties = {}): CSSProperties => ({ position: "absolute", ...st });
// The beach and the board share one warm grade so they sit in the same sunset as the apple.
const WARM = "sepia(.28) saturate(1.06) hue-rotate(-9deg) brightness(1.02)";

export default function Stage({ studioName, narrow, reflSize, tagW, tagT, onFounder }: Props) {
  return (
    <div data-stage className={s.stage}>
      {/* 1 · sky with an eye */}
      <div data-world="1" className={s.world} style={{ inset: "0 0 -60px 0", zIndex: 2, background: "#0E1014", visibility: "visible", overflow: "hidden", WebkitMaskImage: "linear-gradient(180deg,#000 calc(100% - 52px),transparent)", maskImage: "linear-gradient(180deg,#000 calc(100% - 52px),transparent)" }}>
        <div data-face className={s.abs} style={{ willChange: "transform" }}>
          <div data-eyeball className={s.abs}>
            <canvas data-paint="eyeball" aria-hidden className={s.abs} />
            <canvas data-paint="iris" data-iris aria-hidden className={s.abs} />
            <div data-pupil style={{ position: "absolute", borderRadius: "50%", background: "radial-gradient(circle,#0B0D10 0%,#0C0E11 70%,rgba(10,12,14,.92) 84%,rgba(12,14,16,.5) 93%,rgba(12,14,16,0) 100%)" }} />
          </div>
          <div data-shadewin className={s.abs}>
            <canvas data-paint="eyeshade" aria-hidden className={s.abs} />
            <canvas data-paint="eyeglint" data-glint aria-hidden className={s.abs} />
          </div>
          <canvas data-paint="skin" aria-hidden className={s.abs} style={{ width: "100%", height: "100%" }} />
          <canvas data-paint="face" data-facecv aria-hidden className={s.abs} />
          <div data-lidwin className={s.abs}>
            <canvas data-lid aria-hidden className={s.abs} />
          </div>
        </div>
        {/* the torn sky's shadow on the face, painted once instead of a live drop-shadow */}
        <canvas data-tearsh aria-hidden className={s.full} style={{ pointerEvents: "none" }} />
        <div data-skywrap className={s.fill}>
          <canvas data-paint="sky1" data-skyplate aria-hidden className={s.full} />
          <div data-rim className={s.fill} style={{ background: "linear-gradient(140deg,#FDFBF6 0%,#EFE7D8 60%,#E3D8C4 100%)", clipPath: "circle(0px)" }} />
          <canvas data-rimcv aria-hidden className={s.abs} style={{ width: "100%", height: "calc(100% - 60px)" }} />
        </div>
        <div data-navscrim aria-hidden style={{ position: "absolute", left: 0, right: 0, top: 0, height: 170, pointerEvents: "none", background: "linear-gradient(180deg,rgba(20,38,76,.5) 0%,rgba(20,38,76,.3) 45%,rgba(20,38,76,0) 100%)" }} />
      </div>

      {/* one cloud deck over the whole tilt, from the torn sky down to the horizon (horizon and mid layers; the near one sits above the apple) */}
      <div data-skycl aria-hidden className={s.full} style={{ zIndex: 2, pointerEvents: "none", willChange: "transform" }}>
        {[0, 1].map((l) => (
          <canvas key={l} data-paint="sk1" data-l={l} data-skyl aria-hidden className={s.abs} style={{ willChange: "transform" }} />
        ))}
      </div>

      {/* 2 · apple on the board, by the sea at sunset */}
      <div data-world="2" className={s.world} style={{ zIndex: 1, background: "#3E78C4" }}>
        <canvas data-paint="a8sky" data-plate aria-hidden className={s.abs} style={{ transformOrigin: "0 0" }} />
        <canvas data-a8sea aria-hidden className={s.abs} />
        {[0, 1, 2].map((g) => (
          <canvas key={g} data-paint="b6gull" data-gull2 aria-hidden className={s.abs} style={{ width: 90, height: 40, transformOrigin: "45px 20px" }} />
        ))}
      </div>

      {/* 3 · the beach */}
      <div data-world="3" className={s.world} style={{ zIndex: 3, background: "#DAE8EC", overflow: "hidden", filter: WARM }}>
        <div data-cam className={s.cam}>
          <canvas data-paint="b6sky" data-sky6 aria-hidden className={s.abs} style={{ transformOrigin: "0 0" }} />
          {[0, 2].map((l) => (
            <canvas key={l} data-paint="b3c" data-l={l} data-b3c aria-hidden className={s.abs} style={{ transformOrigin: "0 0" }} />
          ))}
          <canvas data-paint="b6g0" data-g0 aria-hidden className={s.abs} style={{ transformOrigin: "0 0" }} />
          <canvas data-paint="b6g1" data-g1 aria-hidden className={s.abs} style={{ transformOrigin: "0 0", opacity: 0 }} />
          <canvas data-surf3 aria-hidden className={s.full} />
        </div>
        {[0, 1, 2].map((g) => (
          <canvas key={g} data-paint="b6gull" data-gull aria-hidden className={s.abs} style={{ width: 90, height: 40, transformOrigin: "45px 20px", visibility: "hidden" }} />
        ))}
      </div>

      {/* 5 · the board in the sand, mapped onto the beach */}
      <div data-w5clip className={s.fill} style={{ zIndex: 5, pointerEvents: "none", filter: WARM }}>
        <div data-w5cam className={s.cam}>
          <div data-world="5" className={s.world} style={{ background: "#E0CCA4", transformOrigin: "0 0" }}>
            <div data-cam className={s.fill}>
              <div data-tall className={s.abs} style={{ width: "100%", height: "220%", transformOrigin: "50% 0" }}>
                <canvas data-paint="b6tall" aria-hidden style={plate({ left: "-6%", top: 0, width: "112%", height: "100%" })} />
                <div data-3d="sandboard" style={plate({ left: 0, width: "100%", top: "54.5454%", height: "45.4546%" })} />
                <canvas data-surf5 aria-hidden style={plate({ left: 0, width: "100%", top: "54.5454%", height: "45.4546%" })} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <canvas data-ball6 aria-hidden className={s.full} style={{ zIndex: 5, pointerEvents: "none", visibility: "hidden" }} />
      <div data-applelayer className={s.fill} style={{ zIndex: 5, pointerEvents: "none", visibility: "hidden" }}>
        <div data-3d="apple8" className={s.fill} />
      </div>
      <canvas data-paint="near1" data-near aria-hidden className={s.abs} style={{ zIndex: 5, pointerEvents: "none", willChange: "transform" }} />

      {/* 6 · the desert arcade */}
      <div data-world="6" className={s.world} style={{ zIndex: 6, background: "#E8A866" }}>
        <div data-cam className={s.cam}>
          <canvas data-paint="desert" data-plate aria-hidden style={plate({ left: "-8%", top: "-8%", width: "116%", height: "116%", visibility: "hidden" })} />
          <div data-3d="arcade8" className={s.fill} />
          <div data-train className={s.abs} style={{ display: "none", alignItems: "flex-end", gap: 2 }}>
            <div style={{ width: 10, height: 9, background: "#4B3A52", borderRadius: "2px 2px 0 0" }} />
            {[0, 1, 2].map((k) => <div key={k} style={{ width: 16, height: 6, background: "#4B3A52" }} />)}
          </div>
          {COMPANIES.map((c, i) => {
            const th = Array.from({ length: 12 }, (_, j) => THOUGHTS[c.v][j % THOUGHTS[c.v].length]);
            return (
              <div key={c.name} style={{ display: "contents" }}>
                <div data-founder data-hover onMouseEnter={() => onFounder(i, true)} onMouseLeave={() => onFounder(i, false)} className={s.abs} style={{ width: 300, height: 600, transformOrigin: "0 0" }}>
                  {c.stand && <div style={{ position: "absolute", left: 78, width: 144, top: 540, height: 60, background: "linear-gradient(90deg,#F2D2A6,#D9A874 45%,#8E5A40)", boxShadow: "inset 0 4px 0 rgba(255,240,210,.5)" }} />}
                  <canvas data-paint="founder" data-v={c.v} data-body aria-hidden style={plate({ left: 0, top: c.stand ? 140 : 200, width: 300, height: 400, transformOrigin: "50% 100%" })} />
                  <canvas data-paint="head" data-v={c.v} data-head aria-hidden style={plate({ left: 105, top: c.stand ? 44 : 172, width: 90, height: 110, transformOrigin: "50% 88%" })} />
                  {th.map((k, j) => (
                    <canvas key={j} data-paint="thought" data-kind={k} data-th aria-hidden className={s.abs} style={{ width: 92, height: 92, transformOrigin: "46px 46px" }} />
                  ))}
                  <div data-res style={plate({ left: 60, top: c.stand ? -116 : 12, width: 180, height: 180, opacity: 0, perspective: 600 })}>
                    <div data-turn className={s.fill} style={{ transformStyle: "preserve-3d" }}>
                      <div style={{ position: "absolute", inset: -34, borderRadius: "50%", background: "radial-gradient(closest-side,rgba(255,236,190,.6),rgba(255,236,190,0))" }} />
                      <canvas data-paint="resolved" data-v={c.v} aria-hidden className={s.fill} style={{ width: 180, height: 180 }} />
                      {c.v === 3 &&
                        ["#3E78C4", "#A8242A", "#2F6F7A"].map((col) => (
                          <canvas key={col} data-paint="planet" data-col={col} data-orb aria-hidden className={s.abs} style={{ width: 24, height: 24 }} />
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {/* the door at the end of the hall: the doorway shows the room's colour, and a painted wood leaf is perspective-mapped onto the 3D hinge (frame, step and light are 3D) */}
          <svg data-door aria-hidden width="100%" height="100%" style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "100%", overflow: "visible", pointerEvents: "none", visibility: "hidden" }}>
            <polygon data-dk="room" fill="#EFE6D6" points="0,0" />
          </svg>
          <div data-leafw aria-hidden className={s.fill} style={{ pointerEvents: "none", visibility: "hidden", transformOrigin: "0 0" }}>
            <div data-leaf style={{ position: "absolute", left: 0, top: 0, width: 480, height: 944, transformOrigin: "0 0", backfaceVisibility: "hidden" }}>
              <canvas data-leafcv width={480} height={944} className={s.abs} style={{ width: 480, height: 944 }} />
              <div data-lsh className={s.fill} style={{ background: "linear-gradient(90deg,rgba(26,16,24,.5) 0,rgba(26,16,24,.5) 76%,rgba(26,16,24,0) 81%)" }} />
              <div data-lsh2 style={{ position: "absolute", left: "76%", right: 0, top: 0, height: "27%", background: "linear-gradient(180deg,rgba(26,16,24,.5) 0,rgba(26,16,24,.5) 80%,rgba(26,16,24,0) 100%)" }} />
              <div data-ldk className={s.fill} style={{ background: "#140B07", opacity: 0 }} />
            </div>
          </div>
        </div>
      </div>

      <div data-qlayer className={s.fill} style={{ zIndex: 6, pointerEvents: "none", visibility: "hidden" }} />

      {/* 7 · the quiet room */}
      <div data-world="7" className={s.world} style={{ zIndex: 7, background: "#E6DCCB" }}>
        {/* the open leaf seen from inside the room once the camera has walked through */}
        <div data-leafbw aria-hidden className={s.fill} style={{ pointerEvents: "none", visibility: "hidden", zIndex: 2, transformOrigin: "0 0" }}>
          <div data-leafb style={{ position: "absolute", left: 0, top: 0, width: 480, height: 944, transformOrigin: "0 0", backfaceVisibility: "hidden" }}>
            <canvas data-leafcv width={480} height={944} className={s.abs} style={{ width: 480, height: 944 }} />
            <div data-lsh className={s.fill} style={{ background: "linear-gradient(90deg,rgba(26,16,24,.5) 0,rgba(26,16,24,.5) 76%,rgba(26,16,24,0) 81%)" }} />
            <div data-lsh2 style={{ position: "absolute", left: "76%", right: 0, top: 0, height: "27%", background: "linear-gradient(180deg,rgba(26,16,24,.5) 0,rgba(26,16,24,.5) 80%,rgba(26,16,24,0) 100%)" }} />
            <div data-ldk className={s.fill} style={{ background: "#140B07", opacity: 0 }} />
          </div>
        </div>
        <div data-cam className={s.cam}>
          <canvas data-paint="room" data-plate aria-hidden className={s.full} />
          <div data-table style={{ position: "absolute", width: 150, height: 70, transform: "translate(-50%,0)" }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 10, background: "linear-gradient(180deg,#8A5E3E,#5A3A26)" }} />
            <div style={{ position: "absolute", left: 10, top: 10, width: 8, height: 60, background: "#5A3A26" }} />
            <div style={{ position: "absolute", right: 10, top: 10, width: 8, height: 60, background: "#5A3A26" }} />
          </div>
          <div data-3d="roomqueen" style={{ position: "absolute" }} />
          {KEEP.map((k, i) => {
            const p = narrow ? k.pn : k.p;
            return (
              <div key={k.n} data-keep style={{ position: "absolute", left: `${p[0] * 100}%`, top: `${p[1] * 100}%`, transform: "translate(-50%,-100%)", display: "flex", flexDirection: "column-reverse", alignItems: "center", gap: 8 }}>
                <div data-kscale style={{ display: "flex", flexDirection: "column", alignItems: "center", filter: "url(#brushy)" }}>
                  <KeepObject kind={k.kind} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", transform: `rotate(${i % 2 ? 2 : -2.5}deg)` }}>
                  <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 3, maxWidth: tagW, padding: "9px 12px 10px 20px", background: "#F6F0E2", boxShadow: "0 6px 14px rgba(40,24,16,.28)", clipPath: "polygon(12px 0,100% 0,100% 100%,12px 100%,0 50%)", color: "#1B1D24" }}>
                    <div style={{ position: "absolute", left: 8, top: "50%", width: 6, height: 6, marginTop: -3, borderRadius: "50%", background: "#C9B797", boxShadow: "inset 0 1px 1px rgba(0,0,0,.35)" }} />
                    <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".2em" }}>No. {k.n}</span>
                    <span style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: tagT, lineHeight: 1.05, textWrap: "balance" }}>{k.t}</span>
                    {!narrow && <span style={{ fontSize: 11.5, lineHeight: 1.35, textWrap: "pretty" }}>{k.d}</span>}
                  </div>
                  <div style={{ width: 1, height: 14, background: "rgba(60,40,30,.55)" }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 8 · the night sea */}
      <div data-world="8" className={s.world} style={{ zIndex: 8, background: "#141B33" }}>
        <div data-cam className={s.cam}>
          <canvas data-paint="morning" aria-hidden className={s.full} />
          {/* the sleeve sits behind the night plate, so the arm reaches out of the tear */}
          <div data-armback aria-hidden style={{ position: "absolute", left: 0, top: 0, width: 0, height: 0, visibility: "hidden", willChange: "transform", transformOrigin: "0 0", pointerEvents: "none" }}>
            <svg data-armsvg="back" width="1" height="1" style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} />
          </div>
          <canvas data-paint="night" data-nightplate aria-hidden className={s.abs} style={{ width: "100%", height: "150%" }} />
          {/* moonlit cloud cards, cut by the same tear as the night plate */}
          <div data-ncl className={s.abs} style={{ width: "100%", height: "150%", overflow: "hidden", pointerEvents: "none" }}>
            {[0, 1, 2].map((l) => (
              <canvas key={l} data-paint="n8c" data-l={l} data-n8c aria-hidden className={s.abs} />
            ))}
          </div>
          <div data-crim className={s.fill} style={{ background: "linear-gradient(140deg,#FDFBF6,#E3D8C4)", clipPath: "circle(0px)" }} />
          <canvas data-paint="moon" data-moon aria-hidden className={s.abs} />
          <canvas data-crimcv aria-hidden className={s.full} style={{ visibility: "hidden", pointerEvents: "none", filter: "drop-shadow(0 5px 8px rgba(6,10,24,.55)) drop-shadow(0 14px 26px rgba(6,10,24,.3))" }} />
          <div data-reflect aria-hidden style={{ position: "absolute", left: "-10%", right: "-10%", top: "124%", textAlign: "center", fontFamily: "var(--serif)", fontStyle: "italic", fontWeight: 500, fontSize: reflSize, lineHeight: 0.8, letterSpacing: "-.03em", whiteSpace: "nowrap", color: "rgba(241,230,200,.5)", filter: "url(#ripple)", willChange: "transform" }}>
            {studioName}
          </div>
        </div>
      </div>

      {/* things that travel between worlds */}
      <div data-carry className={s.fill} style={{ zIndex: 20, pointerEvents: "none" }}>
        <div data-winclip className={s.fill}>
          <div data-wincam className={s.cam} style={{ visibility: "hidden" }}>
            <div data-winframe style={{ position: "absolute", border: "14px solid #EFE6D6", boxShadow: "0 0 0 2px rgba(60,40,30,.25),inset 0 0 0 2px rgba(60,40,30,.25),0 14px 30px rgba(40,24,16,.25)" }}>
              <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 10, marginLeft: -5, background: "#EFE6D6", boxShadow: "0 0 0 1px rgba(60,40,30,.2)" }} />
              <div style={{ position: "absolute", top: "44%", left: 0, right: 0, height: 10, marginTop: -5, background: "#EFE6D6", boxShadow: "0 0 0 1px rgba(60,40,30,.2)" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
