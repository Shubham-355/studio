"use client";

import { useEffect, useMemo, useReducer, useRef, useState, useSyncExternalStore, type MouseEvent } from "react";
import Copy, { type Layout } from "./Copy";
import Stage from "./Stage";
import { emailFor } from "./content";
import { HomeEngine, NAMES, NOTES, SPACER_VH } from "./engine";
import s from "./home.module.css";

type State = { loader: boolean; sound: boolean; menu: boolean; copied: boolean; world: number; notes: boolean };
type Target = "home" | "companies" | "how" | "contact";

const NARROW: Layout = { heroB: "104px", t1: "auto", b1: "92px", w1: "100%", w2: "100%", capL: "20px", capR: "auto", capT: "76px", capB: "auto", mL: "20px", mR: "20px", mT: "auto", mB: "92px", tBeach: "84px", linkB: "40px", tRoom: "84px", wRoom: "100%", wC: "100%", tagT: "15px", tagW: "104px", tQuote: "96px", bContact: "92px", cardW: "220px", tFoot: "30vh", refl: "22vw" };
const WIDE: Layout = { heroB: "clamp(56px,10vh,120px)", t1: "clamp(116px,17vh,180px)", b1: "auto", w1: "min(66vw,1080px)", w2: "min(44vw,660px)", capL: "auto", capR: "96px", capT: "auto", capB: "32px", mL: "0px", mR: "auto", mT: "0px", mB: "auto", tBeach: "clamp(116px,17vh,180px)", linkB: "48px", tRoom: "clamp(116px,17vh,180px)", wRoom: "min(34vw,560px)", wC: "min(40vw,620px)", tagT: "18px", tagW: "min(160px,10.5vw)", tQuote: "clamp(120px,18vh,190px)", bContact: "clamp(56px,12vh,130px)", cardW: "320px", tFoot: "46vh", refl: "12vw" };

const onResize = (cb: () => void) => {
  addEventListener("resize", cb);
  return () => removeEventListener("resize", cb);
};
// Server render assumes a desktop viewport; the client corrects it on hydration.
const useViewportWidth = () => useSyncExternalStore(onResize, () => innerWidth, () => 1440);

function Bars() {
  return (
    <span className={s.bars}>
      <span data-bar className={s.bar} />
      <span data-bar className={s.bar} />
      <span data-bar className={s.bar} />
    </span>
  );
}

export default function Homepage({ studioName, motion = true, notes = false }: { studioName: string; motion?: boolean; notes?: boolean }) {
  const [state, setStateRaw] = useState<State>({ loader: true, sound: false, menu: false, copied: false, world: 0, notes });
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);
  const vw = useViewportWidth();
  const narrow = vw < 820;
  const stateRef = useRef(state);
  const engineRef = useRef<HomeEngine | null>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // The engine reads and writes state synchronously, like a class component would.
  const host = useMemo(
    () => ({
      props: { motion, notes },
      getState: () => ({ ...stateRef.current, narrow: innerWidth < 820 }),
      setState: (patch: Partial<State>, cb?: () => void) => {
        stateRef.current = { ...stateRef.current, ...patch };
        setStateRaw(stateRef.current);
        cb?.();
      },
      forceUpdate,
    }),
    [motion, notes],
  );

  useEffect(() => {
    const engine = new HomeEngine(host);
    engineRef.current = engine;
    engine.start();
    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, [host]);

  useEffect(() => {
    engineRef.current?.narrowChanged();
  }, [narrow]);

  const go = (to: Target, e?: MouseEvent) => engineRef.current?.go(to, e);
  const founder = (i: number, on: boolean) => engineRef.current?.founderHover(i, on);
  const toggleSound = () => engineRef.current?.toggleSound();
  const toggleMenu = () => host.setState({ menu: !stateRef.current.menu });
  const email = emailFor(studioName);
  const copyEmail = () => {
    navigator.clipboard?.writeText(email).catch(() => {});
    host.setState({ copied: true });
    clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => host.setState({ copied: false }), 2400);
  };

  const { loader, sound, menu, copied, world } = state;
  const L = narrow ? NARROW : WIDE;

  return (
    <div data-root className={s.root}>
      <div data-grain className={s.grain} />

      {loader && (
        <div data-loader className={s.loader}>
          {(["l", "r"] as const).map((h) => (
            <div key={h} data-lhalf={h} className={s.loaderHalf}>
              <div data-lword className={s.loaderWord}>{studioName}</div>
              <div data-lrim className={s.loaderRim} />
            </div>
          ))}
        </div>
      )}

      <nav data-nav className={s.nav}>
        {narrow ? (
          <div className={s.navBarNarrow}>
            <a href="#top" onClick={(e) => go("home", e)} className={s.brandNarrow}>{studioName}</a>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flex: "none" }}>
              <button onClick={toggleSound} aria-label="Ambient sound" aria-pressed={sound} className={s.roundBtn}><Bars /></button>
              <button onClick={toggleMenu} aria-label="Menu" className={s.roundBtn}>
                <span className={s.burgerLine} />
                <span className={s.burgerLine} />
              </button>
            </div>
          </div>
        ) : (
          <div className={s.navBar}>
            <a href="#top" onClick={(e) => go("home", e)} className={`${s.brand} ${s.focusRing}`}>{studioName}</a>
            <div className={s.navLinks}>
              <a href="#companies" onClick={(e) => go("companies", e)} className={`${s.navLink} ${s.focusRing}`}>Companies</a>
              <a href="#how-we-build" onClick={(e) => go("how", e)} className={`${s.navLink} ${s.focusRing}`}>How we build</a>
              <a href="#studio" className={`${s.navLink} ${s.focusRing}`}>Studio</a>
            </div>
            <div className={s.navEnd}>
              <button onClick={toggleSound} aria-label="Ambient sound" aria-pressed={sound} className={`${s.soundBtn} ${s.focusRing}`}>
                <Bars />
                {vw >= 1120 && <span>{sound ? "Sound on" : "Sound off"}</span>}
              </button>
              <a href="#start" onClick={(e) => go("contact", e)} data-magnet data-navcta className={`${s.pill} ${s.pillSm} ${s.navCta}`}>Start a company</a>
            </div>
          </div>
        )}
      </nav>

      {menu && narrow && (
        <div className={s.menu}>
          <button onClick={toggleMenu} aria-label="Close" className={s.menuClose}>×</button>
          <a href="#companies" onClick={(e) => go("companies", e)} className={s.menuLink}>Companies</a>
          <a href="#how-we-build" onClick={(e) => go("how", e)} className={s.menuLink}>How we build</a>
          <a href="#studio" className={s.menuLink}>Studio</a>
          <a href="#start" onClick={(e) => go("contact", e)} className={`${s.pill} ${s.pillMd} ${s.menuCta}`}>Start a company</a>
          <div className={s.menuFoot}>Oil on canvas, 2026. The way out.</div>
        </div>
      )}

      {narrow && (
        <div className={s.progress}>
          <div data-mprog className={s.progressFill} />
        </div>
      )}

      <Stage studioName={studioName} narrow={narrow} reflSize={L.refl} tagW={L.tagW} tagT={L.tagT} onFounder={founder} />
      <Copy studioName={studioName} email={email} narrow={narrow} heroRow={vw >= 900} L={L} copied={copied} go={go} onFounder={founder} copyEmail={copyEmail} />

      <div data-spacer style={{ height: `${SPACER_VH}vh` }} />

      {state.notes && (
        <div className={s.notes}>
          <b>MOTION · World {world + 1} · {NAMES[world]}</b>
          <br />
          {NOTES[world]}
        </div>
      )}
    </div>
  );
}
