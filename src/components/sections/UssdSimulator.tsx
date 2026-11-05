"use client";

import { useEffect, useRef, useState } from "react";
import { prototype } from "@/content/site";

// Demo data only: the simulator shows how the service feels, not real balances.
const SAVED = 9500;
const GOAL = 25000;
const pct = Math.round((SAVED / GOAL) * 100);
const bar = "▮".repeat(Math.round(pct / 10)) + "▯".repeat(10 - Math.round(pct / 10));
const rwf = (n: number) => `Rwf ${n.toLocaleString("en-US")}`;

type Screen = {
  text: string;
  options?: Record<string, string>;
  amount?: boolean;
  end?: boolean;
  sms?: string;
};

const screens = (amount: number): Record<string, Screen> => ({
  main: {
    text: "Agaseke k'Ubuzima\n1. My health basket\n2. Save with MoMo\n3. Am I covered?\n4. Gap pot\n0. Exit",
    options: { "1": "basket", "2": "save", "3": "covered", "4": "gap", "0": "exit" },
  },
  basket: {
    text: `Health basket\nSaved: ${rwf(SAVED)} of ${rwf(GOAL)}\nHousehold: 5 people\n${bar} ${pct}%\n\n0. Back`,
    options: { "0": "main" },
  },
  save: { text: "Save with MoMo\nEnter amount (Rwf):", amount: true },
  confirm: {
    text: `Save ${rwf(amount)} from MoMo 078•••412?\n1. Confirm\n2. Cancel`,
    options: { "1": "saved", "2": "main" },
  },
  saved: {
    text: "Request sent.\nApprove the MoMo prompt with your PIN.",
    end: true,
    sms: `AGASEKE: ${rwf(amount)} saved. Your basket is now ${rwf(SAVED + amount)} of ${rwf(GOAL)}. Keep going!`,
  },
  covered: {
    text: `Coverage: NOT YET\nYour basket is ${pct}% full.\nYour Mutuelle premium is paid automatically when it reaches 100%.\n\n0. Back`,
    options: { "0": "main" },
  },
  gap: {
    text: "Gap pot · Twisungane group\nPot balance: Rwf 41,200\n1. Ask for support\n2. How it works\n0. Back",
    options: { "1": "gapAsk", "2": "gapRules", "0": "main" },
  },
  gapRules: {
    text: "Every member adds a little each week. The pot pays for medicines and care Mutuelle doesn't cover.\n\n0. Back",
    options: { "0": "gap" },
  },
  gapAsk: {
    text: "Request sent to your group leader.\nYou'll get an SMS when it's approved.",
    end: true,
    sms: "AGASEKE: Your gap pot request was received by the Twisungane group.",
  },
  exit: { text: "Murakoze! Thank you for saving for your health.", end: true },
  unknown: { text: `Unknown USSD code.\nTry ${prototype.shortCode}`, end: true },
});

const keys = [
  ["1", ""], ["2", "ABC"], ["3", "DEF"],
  ["4", "GHI"], ["5", "JKL"], ["6", "MNO"],
  ["7", "PQRS"], ["8", "TUV"], ["9", "WXYZ"],
  ["*", ""], ["0", "+"], ["#", ""],
];

export function UssdSimulator() {
  const [dialed, setDialed] = useState("");
  const [screen, setScreen] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [reply, setReply] = useState("");
  const [amount, setAmount] = useState(1000);
  const [sms, setSms] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const timers = useRef<number[]>([]);

  const all = screens(amount);
  const current = screen ? all[screen] : null;

  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  useEffect(() => {
    if (current && !current.end) input.current?.focus({ preventScroll: true });
  }, [current]);

  const show = (id: string) => {
    setReply("");
    setError(false);
    setLoading(true);
    later(() => {
      setLoading(false);
      setScreen(id);
      const s = screens(amount)[id];
      if (s.sms) later(() => setSms(s.sms!), 1400);
    }, 650);
  };

  const call = (code = dialed) => {
    if (!code) return;
    show(code === prototype.shortCode ? "main" : "unknown");
  };

  const send = () => {
    if (!current) return;
    if (current.amount) {
      const n = parseInt(reply, 10);
      if (!n || n < 100) return setError(true);
      setAmount(n);
      return show("confirm");
    }
    const next = current.options?.[reply.trim()];
    if (next) show(next);
    else setError(true);
  };

  const dismiss = () => {
    setScreen(null);
    setReply("");
    setDialed("");
  };

  const press = (k: string) => setDialed((d) => (d + k).slice(0, 14));

  const autoDial = () => {
    dismiss();
    setSms(null);
    [...prototype.shortCode].forEach((k, i) => later(() => press(k), 140 * (i + 1)));
    later(() => call(prototype.shortCode), 140 * (prototype.shortCode.length + 2));
  };

  return (
    <div className="relative flex h-full flex-col bg-[#f6f5f2] font-sans text-ink">
      {/* Status bar */}
      <div className="flex items-center justify-between px-7 pt-3.5 text-[0.7rem] font-semibold">
        <span>9:41</span>
        <span className="tracking-tight">4G ▮▮▮</span>
      </div>

      {/* SMS notification */}
      <button
        type="button"
        onClick={() => setSms(null)}
        className={`absolute inset-x-3 top-10 z-30 rounded-2xl bg-white/95 p-3 text-left shadow-xl backdrop-blur transition-all duration-700 ease-gallery ${
          sms ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-6 opacity-0"
        }`}
        aria-live="polite"
        aria-label="Dismiss message"
      >
        <span className="flex items-center justify-between text-[0.62rem] uppercase tracking-wide text-mute">
          <span>Messages · AGASEKE</span>
          <span>now</span>
        </span>
        <span className="mt-1 block text-[0.75rem] leading-snug">{sms}</span>
      </button>

      {/* Dialer */}
      <div className="flex flex-1 flex-col justify-end px-6 pb-8">
        <output className="mb-4 block min-h-10 text-center text-3xl font-light tracking-wider" aria-label="Dialed number">
          {dialed}
        </output>
        <div className="grid grid-cols-3 gap-x-5 gap-y-3 justify-items-center">
          {keys.map(([k, sub]) => (
            <button
              key={k}
              type="button"
              onClick={() => press(k)}
              className="flex aspect-square w-[3.6rem] flex-col items-center justify-center rounded-full bg-black/[0.07] transition-colors active:bg-black/20 hover:bg-black/[0.12]"
              aria-label={k}
            >
              <span className="text-2xl leading-none">{k}</span>
              {sub && <span className="text-[0.5rem] font-semibold tracking-[0.2em] text-mute">{sub}</span>}
            </button>
          ))}
          <span />
          <button
            type="button"
            onClick={() => call()}
            className="flex aspect-square w-[3.6rem] items-center justify-center rounded-full bg-[#34c759] text-white transition-transform active:scale-95"
            aria-label="Call"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setDialed((d) => d.slice(0, -1))}
            className={`flex aspect-square w-[3.6rem] items-center justify-center text-mute ${dialed ? "" : "invisible"}`}
            aria-label="Delete"
          >
            ⌫
          </button>
        </div>
        {!dialed && !current && (
          <button type="button" onClick={autoDial} className="mx-auto mt-4 rounded-full bg-ink px-4 py-2 text-[0.65rem] font-semibold uppercase tracking-widest text-cream">
            Dial {prototype.shortCode} for me
          </button>
        )}
      </div>

      {/* USSD session */}
      {(loading || current) && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 px-6 backdrop-blur-[2px]">
          <div className="w-full overflow-hidden rounded-2xl bg-[#fbfbfa] text-center shadow-2xl" role="dialog" aria-label="USSD session">
            {loading ? (
              <p className="px-5 py-8 text-sm text-mute">USSD code running…</p>
            ) : (
              current && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (current.end) dismiss();
                    else send();
                  }}
                >
                  <p className="whitespace-pre-line px-5 pt-5 pb-3 text-left text-[0.82rem] leading-snug" aria-live="polite">
                    {current.text}
                  </p>
                  {!current.end && (
                    <div className="px-4 pb-4">
                      <input
                        ref={input}
                        value={reply}
                        onChange={(e) => {
                          setError(false);
                          setReply(e.target.value.replace(/[^0-9]/g, ""));
                        }}
                        inputMode="numeric"
                        aria-label="Reply"
                        className={`w-full rounded-md border bg-white px-3 py-2 text-sm outline-none ${error ? "border-red-500" : "border-black/15 focus:border-black/40"}`}
                      />
                    </div>
                  )}
                  <div className="flex border-t border-black/10 text-[0.9rem] text-[#0a72e8]">
                    {current.end ? (
                      <button type="submit" className="flex-1 py-3 font-semibold">
                        OK
                      </button>
                    ) : (
                      <>
                        <button type="button" onClick={dismiss} className="flex-1 border-r border-black/10 py-3">
                          Cancel
                        </button>
                        <button type="submit" className="flex-1 py-3 font-semibold">
                          Send
                        </button>
                      </>
                    )}
                  </div>
                </form>
              )
            )}
          </div>
        </div>
      )}
      <div className="absolute bottom-2 left-1/2 h-1 w-28 -translate-x-1/2 rounded-full bg-ink/80" aria-hidden />
    </div>
  );
}
