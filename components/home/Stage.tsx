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

export default function Stage({ studioName, narrow, reflSize, tagW, tagT, onFounder }: Props) {
  return (
    <div data-stage className={s.stage}>
      {/* 1 · sky with an eye */}
      <div data-world="1" className={s.world} style={{ zIndex: 1, background: "#0E1014", visibility: "visible" }}>
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
            <canvas data-paint="lid" data-lid aria-hidden className={s.abs} />
          </div>
        </div>
        <div data-skywrap className={s.fill} style={{ filter: "drop-shadow(0 4px 6px rgba(38,20,12,.5)) drop-shadow(0 12px 22px rgba(38,20,12,.26))" }}>
          <canvas data-paint="sky1" data-skyplate aria-hidden className={s.full} />
          <div data-rim className={s.fill} style={{ background: "linear-gradient(140deg,#FDFBF6 0%,#EFE7D8 60%,#E3D8C4 100%)", clipPath: "circle(0px)" }} />
          <canvas data-rimcv aria-hidden className={s.full} />
        </div>
        <div data-navscrim aria-hidden style={{ position: "absolute", left: 0, right: 0, top: 0, height: 170, pointerEvents: "none", background: "linear-gradient(180deg,rgba(20,38,76,.5) 0%,rgba(20,38,76,.3) 45%,rgba(20,38,76,0) 100%)" }} />
        <canvas data-paint="near1" data-near aria-hidden style={plate({ left: "-10%", top: "-10%", width: "120%", height: "120%" })} />
      </div>

      {/* 2 · apple on the board */}
      <div data-world="2" className={s.world} style={{ zIndex: 2, background: "#F2C7A5" }}>
        <div data-cam className={s.cam}>
          <canvas data-paint="shore5" data-plate aria-hidden style={plate({ left: "-8%", top: "-8%", width: "116%", height: "116%", transformOrigin: "50% 50%" })} />
          <div data-3d="apple5" style={plate({ transformOrigin: "50% 78%" })} />
          <canvas data-paint="shells5" data-fg aria-hidden style={plate({ left: "-10%", width: "120%", bottom: "-6%", height: "42%", transformOrigin: "50% 100%" })} />
        </div>
        <div data-glint style={{ position: "absolute", left: 0, top: 0, width: 280, height: 170, margin: "-85px 0 0 -140px", borderRadius: "50%", background: "radial-gradient(closest-side,rgba(255,255,255,.8),rgba(255,255,255,0))", pointerEvents: "none", visibility: "hidden" }} />
      </div>

      {/* 3 · the beach */}
      <div data-world="3" className={s.world} style={{ zIndex: 3, background: "#DAE8EC", overflow: "hidden" }}>
        <div data-cam className={s.cam}>
          <canvas data-paint="b6sky" data-sky6 aria-hidden className={s.abs} style={{ transformOrigin: "0 0" }} />
          <canvas data-paint="b6g0" data-g0 aria-hidden className={s.abs} style={{ transformOrigin: "0 0" }} />
          <canvas data-paint="b6g1" data-g1 aria-hidden className={s.abs} style={{ transformOrigin: "0 0", opacity: 0 }} />
          <canvas data-surf3 aria-hidden className={s.full} />
          <canvas data-paint="b6umb" data-umb aria-hidden className={s.abs} style={{ width: 360, height: 420, transformOrigin: "0 0", visibility: "hidden" }} />
          <canvas data-paint="b6chair" data-chair aria-hidden className={s.abs} style={{ width: 300, height: 220, transformOrigin: "0 0", visibility: "hidden" }} />
        </div>
        {[0, 1, 2].map((g) => (
          <canvas key={g} data-paint="b6gull" data-gull aria-hidden className={s.abs} style={{ width: 90, height: 40, transformOrigin: "45px 20px", visibility: "hidden" }} />
        ))}
      </div>

      {/* 5 · the board in the sand, mapped onto the beach */}
      <div data-w5clip className={s.fill} style={{ zIndex: 5, pointerEvents: "none" }}>
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
      <canvas data-tback aria-hidden className={s.full} style={{ zIndex: 5, visibility: "hidden" }} />

      {/* 6 · the desert arcade */}
      <div data-world="6" className={s.world} style={{ zIndex: 6, background: "#E8A866" }}>
        <div data-cam className={s.cam}>
          <canvas data-paint="desert" data-plate aria-hidden style={plate({ left: "-8%", top: "-8%", width: "116%", height: "116%" })} />
          <div data-train className={s.abs} style={{ display: "flex", alignItems: "flex-end", gap: 2 }}>
            <div style={{ width: 10, height: 9, background: "#4B3A52", borderRadius: "2px 2px 0 0" }} />
            {[0, 1, 2].map((k) => <div key={k} style={{ width: 16, height: 6, background: "#4B3A52" }} />)}
          </div>
          {COMPANIES.map((c, i) => {
            const th = Array.from({ length: 12 }, (_, j) => THOUGHTS[c.v][j % THOUGHTS[c.v].length]);
            return (
              <div key={c.name} style={{ display: "contents" }}>
                <div data-pshadow className={s.abs} style={{ width: 300, height: 40, transformOrigin: "0 0", background: "linear-gradient(90deg,rgba(75,58,82,.62),rgba(75,58,82,0))", clipPath: "polygon(0 30%,100% 0,100% 55%,0 100%)" }} />
                <div data-founder data-hover onMouseEnter={() => onFounder(i, true)} onMouseLeave={() => onFounder(i, false)} className={s.abs} style={{ width: 300, height: 600, transformOrigin: "0 0" }}>
                  {c.stand && <div style={{ position: "absolute", left: 78, width: 144, top: 540, height: 60, background: "linear-gradient(90deg,#F2D2A6,#D9A874 45%,#8E5A40)", boxShadow: "inset 0 4px 0 rgba(255,240,210,.5)" }} />}
                  <canvas data-paint="founder" data-v={c.v} data-body aria-hidden style={plate({ left: 0, top: c.stand ? 140 : 200, width: 300, height: 400, transformOrigin: "50% 100%" })} />
                  <canvas data-paint="head" data-v={c.v} data-head aria-hidden style={plate({ left: 105, top: c.stand ? 44 : 172, width: 90, height: 110, transformOrigin: "50% 88%" })} />
                  {th.map((k, j) => (
                    <canvas key={j} data-paint="thought" data-kind={k} data-th aria-hidden className={s.abs} style={{ width: 56, height: 56, transformOrigin: "28px 28px" }} />
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
                  <div
                    data-panel
                    style={{
                      position: "absolute",
                      top: c.stand ? -150 : -40,
                      left: i % 2 ? "auto" : "calc(100% + 18px)",
                      right: i % 2 ? "calc(100% + 18px)" : "auto",
                      width: 300,
                      padding: 14,
                      background: "#F3EEE4",
                      boxShadow: "0 18px 34px rgba(75,58,82,.3)",
                      display: "grid",
                      gridTemplateColumns: "92px minmax(0,1fr)",
                      gap: 10,
                      opacity: 0,
                      transform: `translateX(${i % 2 ? 20 : -20}px)`,
                      transition: "opacity 700ms ease,transform 900ms cubic-bezier(.2,.7,.2,1)",
                      pointerEvents: "none",
                      color: "#1B1D24",
                    }}
                  >
                    <div style={{ gridRow: "1 / 3", height: 172, borderRadius: 14, background: "#1B1D24", padding: 7 }}>
                      <div style={{ height: "100%", borderRadius: 8, background: "#FBF8F1", display: "flex", flexDirection: "column", gap: 6, padding: 9 }}>
                        <div style={{ height: 6, width: "46%", background: "#A8242A" }} />
                        <div style={{ height: 40, background: "#E6DCCB" }} />
                        <div style={{ height: 4, background: "#C9BCA8" }} />
                        <div style={{ height: 4, width: "70%", background: "#C9BCA8" }} />
                        <div style={{ marginTop: "auto", height: 18, borderRadius: 9, background: "#1B1D24" }} />
                      </div>
                    </div>
                    <div style={{ height: 81, background: "#1B1D24", color: "#F3EEE4", display: "flex", alignItems: "flex-end", padding: 9, fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 22, lineHeight: 1 }}>{c.name}</div>
                    <div style={{ height: 81, border: "1px solid #1B1D24", display: "flex", flexDirection: "column" }}>
                      <div style={{ height: 12, borderBottom: "1px solid #1B1D24", display: "flex", gap: 3, alignItems: "center", padding: "0 5px" }}>
                        <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#1B1D24" }} />
                        <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#1B1D24" }} />
                      </div>
                      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5, padding: 6 }}>
                        <div style={{ background: "#E6DCCB" }} />
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          <div style={{ height: 4, background: "#C9BCA8" }} />
                          <div style={{ height: 4, width: "60%", background: "#C9BCA8" }} />
                        </div>
                      </div>
                    </div>
                    <span style={{ gridColumn: "1 / 3", fontFamily: "var(--mono)", fontSize: 10, letterSpacing: ".06em" }}>PRODUCT SCREENS · BRAND WORK</span>
                  </div>
                </div>
              </div>
            );
          })}
          <div data-door className={s.abs} style={{ width: 220, height: 400, transformOrigin: "0 0" }}>
            <div style={{ position: "absolute", left: 110, top: 386, width: 640, height: 34, background: "linear-gradient(90deg,rgba(75,58,82,.6),rgba(75,58,82,0))", clipPath: "polygon(0 0,100% 40%,100% 100%,0 100%)" }} />
            <div style={{ position: "absolute", right: "100%", top: 0, width: 150, height: 400, background: "linear-gradient(90deg,#4E3222,#7A5236)", boxShadow: "inset 0 0 0 8px #6E4B34", transformOrigin: "right center", transform: "perspective(700px) rotateY(58deg)" }} />
            <div className={s.fill} style={{ border: "16px solid #7A5236", borderBottom: 0, boxShadow: "inset 0 0 0 2px rgba(0,0,0,.25),0 12px 22px rgba(75,58,82,.35)" }} />
          </div>
        </div>
      </div>

      {/* 7 · the quiet room */}
      <div data-world="7" className={s.world} style={{ zIndex: 7, background: "#E6DCCB" }}>
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
          <canvas data-paint="night" data-nightplate aria-hidden className={s.abs} style={{ width: "100%", height: "150%" }} />
          <div data-crim className={s.fill} style={{ background: "linear-gradient(140deg,#FDFBF6,#E3D8C4)", clipPath: "circle(0px)" }} />
          <canvas data-paint="moon" data-moon aria-hidden className={s.abs} />
          <div data-tsh style={{ position: "absolute", left: 0, top: 0, width: 300, height: 300, margin: "-150px 0 0 -150px", borderRadius: "50%", background: "radial-gradient(closest-side,rgba(14,10,12,.9),rgba(14,10,12,.55) 45%,rgba(14,10,12,0))", visibility: "hidden", pointerEvents: "none" }} />
          <canvas data-paint="reach3" data-reach aria-hidden className={s.abs} style={{ width: 360, height: 340, transformOrigin: "0 0", visibility: "hidden" }} />
          <div data-reflect aria-hidden style={{ position: "absolute", left: "-10%", right: "-10%", top: "124%", textAlign: "center", fontFamily: "var(--serif)", fontStyle: "italic", fontWeight: 500, fontSize: reflSize, lineHeight: 0.8, letterSpacing: "-.03em", whiteSpace: "nowrap", color: "rgba(241,230,200,.5)", filter: "url(#ripple)", willChange: "transform" }}>
            {studioName}
          </div>
        </div>
      </div>

      {/* things that travel between worlds */}
      <div data-carry className={s.fill} style={{ zIndex: 20, pointerEvents: "none" }}>
        {[0, 1, 2, 3, 4].map((d) => (
          <div key={d} data-dove style={{ position: "absolute", left: 0, top: 0, width: 120, height: 80, margin: "-40px 0 0 -60px", visibility: "hidden" }}>
            <canvas data-paint="dove" data-up="1" aria-hidden className={s.fill} style={{ width: 120, height: 80 }} />
            <canvas data-paint="dove" data-up="0" aria-hidden className={s.fill} style={{ width: 120, height: 80, visibility: "hidden" }} />
          </div>
        ))}
        <canvas data-tfront aria-hidden className={s.full} style={{ visibility: "hidden" }} />
        <canvas data-sand aria-hidden className={s.full} style={{ visibility: "hidden" }} />
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
