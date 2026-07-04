import React, { useState, useEffect, useCallback } from 'react';
import { supabase, CASINO_PLAY_URL } from './supabase-client.js';

const COLORS = {
  felt: '#0B3D2E',
  feltDark: '#082B20',
  gold: '#E8B94A',
  goldBright: '#FFD972',
  chalk: '#F1EDE4',
  chalkDim: '#A9C4B8',
  red: '#C4382F',
  panel: '#0F4A38',
  panelBorder: '#1C6B51',
};

const DISPLAY_FONT = "'Bebas Neue', sans-serif";
const BODY_FONT = "'Inter', sans-serif";

function loadFont() {
  if (document.getElementById('cr-fonts')) return;
  const link = document.createElement('link');
  link.id = 'cr-fonts';
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@500;700;800&display=swap';
  document.head.appendChild(link);
}

async function callCasino(payload) {
  const res = await fetch(CASINO_PLAY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Something went wrong.');
  return data;
}

function NameGate({ onDone }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const submit = () => {
    const trimmed = name.trim();
    if (!trimmed) { setError('Enter a name your friends will recognize.'); return; }
    try { localStorage.setItem('casino-name', trimmed); } catch (e) { /* ignore */ }
    onDone(trimmed);
  };

  return (
    <div style={{
      minHeight: '100vh', background: COLORS.feltDark, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: 24, boxSizing: 'border-box',
    }}>
      <div style={{ fontFamily: BODY_FONT, fontSize: 13, letterSpacing: 3, color: COLORS.gold, textTransform: 'uppercase', marginBottom: 6 }}>
        Welcome to
      </div>
      <h1 style={{ fontFamily: DISPLAY_FONT, fontSize: 48, color: COLORS.chalk, margin: '0 0 24px', letterSpacing: 1 }}>
        CASINO ROYALE
      </h1>
      <div style={{ fontFamily: BODY_FONT, fontSize: 13.5, color: COLORS.chalkDim, marginBottom: 20, textAlign: 'center', maxWidth: 280 }}>
        Everyone starts with $100 in fake money. Gamble it with friends — all for bragging rights, never real cash.
      </div>
      <input
        type="text"
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
        maxLength={24}
        style={{
          width: '100%', maxWidth: 280, boxSizing: 'border-box', background: COLORS.panel,
          border: `1px solid ${COLORS.panelBorder}`, borderRadius: 8, color: COLORS.chalk,
          fontFamily: BODY_FONT, fontSize: 15, padding: '12px 14px', marginBottom: 10, outline: 'none',
        }}
      />
      {error && <div style={{ fontFamily: BODY_FONT, fontSize: 12, color: '#FF8A80', marginBottom: 10 }}>{error}</div>}
      <button
        onClick={submit}
        style={{
          width: '100%', maxWidth: 280, background: COLORS.gold, border: 'none', color: '#2B1D00',
          fontFamily: DISPLAY_FONT, fontSize: 20, letterSpacing: 1, padding: '12px 0',
          borderRadius: 10, cursor: 'pointer',
        }}
      >
        ENTER
      </button>
    </div>
  );
}

function Leaderboard({ onClose }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('casino_players')
        .select('name, balance')
        .order('balance', { ascending: false })
        .limit(20);
      setRows(data || []);
      setLoading(false);
    })();
  }, []);

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(4,20,15,0.9)', display: 'flex',
      flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, boxSizing: 'border-box', zIndex: 50,
    }}>
      <div style={{ fontFamily: DISPLAY_FONT, fontSize: 30, color: COLORS.gold, marginBottom: 16, letterSpacing: 1 }}>
        LEADERBOARD
      </div>
      <div style={{ width: '100%', maxWidth: 300, maxHeight: 360, overflowY: 'auto', marginBottom: 20 }}>
        {loading && <div style={{ fontFamily: BODY_FONT, fontSize: 13, color: COLORS.chalkDim, textAlign: 'center' }}>Loading…</div>}
        {!loading && rows.length === 0 && (
          <div style={{ fontFamily: BODY_FONT, fontSize: 13, color: COLORS.chalkDim, textAlign: 'center' }}>Nobody's played yet.</div>
        )}
        {rows.map((row, i) => (
          <div key={i} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '9px 10px', borderBottom: `1px solid ${COLORS.panelBorder}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontFamily: DISPLAY_FONT, fontSize: 16, color: i < 3 ? COLORS.gold : COLORS.chalkDim, minWidth: 22 }}>
                {i + 1}
              </span>
              <span style={{ fontFamily: BODY_FONT, fontSize: 14, color: COLORS.chalk }}>{row.name}</span>
            </div>
            <span style={{ fontFamily: DISPLAY_FONT, fontSize: 18, color: row.balance >= 100 ? COLORS.goldBright : '#FF8A80' }}>
              ${Math.round(row.balance)}
            </span>
          </div>
        ))}
      </div>
      <button
        onClick={onClose}
        style={{
          background: 'transparent', border: `1px solid ${COLORS.chalkDim}`, color: COLORS.chalkDim,
          fontFamily: BODY_FONT, fontWeight: 700, fontSize: 13, letterSpacing: 0.5,
          padding: '9px 28px', borderRadius: 8, cursor: 'pointer',
        }}
      >
        CLOSE
      </button>
    </div>
  );
}

function Coinflip({ name, balance, setBalance, onBack }) {
  const [betAmount, setBetAmount] = useState(10);
  const [choice, setChoice] = useState('heads');
  const [flipping, setFlipping] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [coinRotation, setCoinRotation] = useState(0);

  const play = async () => {
    setError('');
    if (betAmount < 1) { setError('Minimum bet is $1.'); return; }
    if (betAmount > balance) { setError('You don\'t have that much.'); return; }
    setFlipping(true);
    setResult(null);
    try {
      const data = await callCasino({ name, action: 'play', game: 'coinflip', betAmount, choice });
      const extraSpins = 4;
      const landRotation = coinRotation + extraSpins * 360 + (data.outcome.result === 'tails' ? 180 : 0);
      setCoinRotation(landRotation);
      setTimeout(() => {
        setBalance(data.newBalance);
        setResult({ win: data.outcome.win, result: data.outcome.result, payout: data.payout });
        setFlipping(false);
      }, 900);
    } catch (e) {
      setError(e.message);
      setFlipping(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: COLORS.feltDark, display: 'flex', flexDirection: 'column',
      alignItems: 'center', padding: '24px 20px', boxSizing: 'border-box',
    }}>
      <div style={{ width: '100%', maxWidth: 340, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <button onClick={onBack} style={{ background: 'transparent', border: 'none', color: COLORS.chalkDim, fontFamily: BODY_FONT, fontSize: 14, cursor: 'pointer' }}>
          ← Back
        </button>
        <div style={{ fontFamily: DISPLAY_FONT, fontSize: 22, color: COLORS.goldBright }}>${Math.round(balance)}</div>
      </div>

      <h1 style={{ fontFamily: DISPLAY_FONT, fontSize: 36, color: COLORS.chalk, marginBottom: 30, letterSpacing: 1 }}>COINFLIP</h1>

      <div style={{ perspective: 600, marginBottom: 30 }}>
        <div
          style={{
            width: 110, height: 110, borderRadius: '50%',
            background: `linear-gradient(135deg, ${COLORS.gold}, ${COLORS.goldBright})`,
            border: `4px solid ${COLORS.chalk}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: DISPLAY_FONT, fontSize: 20, color: '#2B1D00',
            transform: `rotateY(${coinRotation}deg)`,
            transition: flipping ? 'transform 0.9s cubic-bezier(0.2, 0.8, 0.3, 1)' : 'none',
            boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
          }}
        >
          {Math.round(((coinRotation % 360) + 360) % 360) > 90 && Math.round(((coinRotation % 360) + 360) % 360) < 270 ? 'T' : 'H'}
        </div>
      </div>

      {result && (
        <div style={{
          fontFamily: BODY_FONT, fontSize: 15, marginBottom: 20, textAlign: 'center',
          color: result.win ? COLORS.goldBright : '#FF8A80',
        }}>
          {result.win ? `Landed ${result.result} — you won $${Math.round(result.payout)}!` : `Landed ${result.result} — you lost.`}
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        {['heads', 'tails'].map((c) => (
          <button
            key={c}
            onClick={() => setChoice(c)}
            disabled={flipping}
            style={{
              padding: '10px 26px', borderRadius: 8, cursor: flipping ? 'default' : 'pointer',
              fontFamily: BODY_FONT, fontWeight: 700, fontSize: 14, textTransform: 'uppercase',
              border: `2px solid ${choice === c ? COLORS.gold : COLORS.panelBorder}`,
              background: choice === c ? `${COLORS.gold}22` : 'transparent',
              color: choice === c ? COLORS.goldBright : COLORS.chalkDim,
            }}
          >
            {c}
          </button>
        ))}
      </div>

      <div style={{ width: '100%', maxWidth: 260, marginBottom: 10 }}>
        <div style={{ fontFamily: BODY_FONT, fontSize: 11, letterSpacing: 1, color: COLORS.chalkDim, textTransform: 'uppercase', marginBottom: 6 }}>
          Bet amount
        </div>
        <input
          type="number"
          value={betAmount}
          onChange={(e) => setBetAmount(Math.max(0, Number(e.target.value)))}
          disabled={flipping}
          style={{
            width: '100%', boxSizing: 'border-box', background: COLORS.panel,
            border: `1px solid ${COLORS.panelBorder}`, borderRadius: 8, color: COLORS.chalk,
            fontFamily: BODY_FONT, fontSize: 16, padding: '10px 12px', outline: 'none',
          }}
        />
        <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
          {[10, 25, 50].map((v) => (
            <button key={v} onClick={() => setBetAmount(v)} disabled={flipping} style={{
              flex: 1, background: 'transparent', border: `1px solid ${COLORS.panelBorder}`, color: COLORS.chalkDim,
              fontFamily: BODY_FONT, fontSize: 12, padding: '6px 0', borderRadius: 6, cursor: 'pointer',
            }}>${v}</button>
          ))}
          <button onClick={() => setBetAmount(Math.round(balance))} disabled={flipping} style={{
            flex: 1, background: 'transparent', border: `1px solid ${COLORS.panelBorder}`, color: COLORS.chalkDim,
            fontFamily: BODY_FONT, fontSize: 12, padding: '6px 0', borderRadius: 6, cursor: 'pointer',
          }}>MAX</button>
        </div>
      </div>

      {error && <div style={{ fontFamily: BODY_FONT, fontSize: 12, color: '#FF8A80', marginBottom: 10 }}>{error}</div>}

      <button
        onClick={play}
        disabled={flipping}
        style={{
          width: '100%', maxWidth: 260, background: COLORS.gold, border: 'none', color: '#2B1D00',
          fontFamily: DISPLAY_FONT, fontSize: 22, letterSpacing: 1, padding: '13px 0',
          borderRadius: 10, cursor: flipping ? 'default' : 'pointer', opacity: flipping ? 0.7 : 1,
        }}
      >
        {flipping ? 'FLIPPING…' : 'FLIP'}
      </button>
    </div>
  );
}

function Hub({ name, balance, onOpenGame, onOpenLeaderboard, onSwitchName }) {
  const games = [
    { id: 'coinflip', label: 'Coinflip', ready: true },
    { id: 'plinko', label: 'Plinko', ready: false },
    { id: 'rocketship', label: 'Rocketship', ready: false },
    { id: 'blackjack', label: 'Blackjack', ready: false },
  ];

  return (
    <div style={{ minHeight: '100vh', background: COLORS.feltDark, padding: '28px 20px', boxSizing: 'border-box' }}>
      <div style={{ maxWidth: 420, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <div style={{ fontFamily: BODY_FONT, fontSize: 12, letterSpacing: 2, color: COLORS.gold, textTransform: 'uppercase' }}>
              Casino Royale
            </div>
            <div style={{ fontFamily: BODY_FONT, fontSize: 13, color: COLORS.chalkDim }}>
              Playing as <strong style={{ color: COLORS.chalk }}>{name}</strong>{' '}
              <button onClick={onSwitchName} style={{ background: 'none', border: 'none', color: COLORS.chalkDim, textDecoration: 'underline', fontSize: 12, cursor: 'pointer', padding: 0 }}>switch</button>
            </div>
          </div>
          <div style={{ fontFamily: DISPLAY_FONT, fontSize: 30, color: COLORS.goldBright }}>${Math.round(balance)}</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
          {games.map((g) => (
            <button
              key={g.id}
              onClick={() => g.ready && onOpenGame(g.id)}
              disabled={!g.ready}
              style={{
                aspectRatio: '1.2', borderRadius: 12, border: `2px solid ${g.ready ? COLORS.gold : COLORS.panelBorder}`,
                background: g.ready ? COLORS.panel : 'rgba(255,255,255,0.03)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                cursor: g.ready ? 'pointer' : 'default', gap: 6,
              }}
            >
              <div style={{ fontFamily: DISPLAY_FONT, fontSize: 20, color: g.ready ? COLORS.chalk : COLORS.chalkDim, letterSpacing: 0.5 }}>
                {g.label.toUpperCase()}
              </div>
              {!g.ready && (
                <div style={{ fontFamily: BODY_FONT, fontSize: 10, color: COLORS.chalkDim, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Coming soon
                </div>
              )}
            </button>
          ))}
        </div>

        <button
          onClick={onOpenLeaderboard}
          style={{
            width: '100%', background: 'transparent', border: `1px solid ${COLORS.chalkDim}`, color: COLORS.chalkDim,
            fontFamily: BODY_FONT, fontWeight: 700, fontSize: 13, letterSpacing: 0.5,
            padding: '11px 0', borderRadius: 10, cursor: 'pointer',
          }}
        >
          LEADERBOARD
        </button>

        <div style={{ fontFamily: BODY_FONT, fontSize: 11, color: COLORS.chalkDim, textAlign: 'center', marginTop: 20, lineHeight: 1.6 }}>
          All fake money — for bragging rights only. Nothing here is ever real currency.
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [name, setName] = useState(null);
  const [balance, setBalance] = useState(0);
  const [balanceLoaded, setBalanceLoaded] = useState(false);
  const [screen, setScreen] = useState('hub');
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  useEffect(() => {
    loadFont();
    try {
      const saved = localStorage.getItem('casino-name');
      setName(saved || '');
    } catch (e) {
      setName('');
    }
  }, []);

  const loadBalance = useCallback(async (playerName) => {
    setBalanceLoaded(false);
    try {
      const data = await callCasino({ name: playerName, action: 'getBalance' });
      setBalance(data.balance);
    } catch (e) {
      // leave balance as-is; hub can still render, bets will fail gracefully
    }
    setBalanceLoaded(true);
  }, []);

  useEffect(() => {
    if (name) loadBalance(name);
  }, [name, loadBalance]);

  if (name === null) {
    return (
      <div style={{ minHeight: '100vh', background: COLORS.feltDark, display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.chalkDim, fontFamily: BODY_FONT, fontSize: 14 }}>
        Loading…
      </div>
    );
  }

  if (!name) {
    return <NameGate onDone={(n) => setName(n)} />;
  }

  if (!balanceLoaded) {
    return (
      <div style={{ minHeight: '100vh', background: COLORS.feltDark, display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.chalkDim, fontFamily: BODY_FONT, fontSize: 14 }}>
        Loading your balance…
      </div>
    );
  }

  return (
    <>
      {screen === 'hub' && (
        <Hub
          name={name}
          balance={balance}
          onOpenGame={(g) => setScreen(g)}
          onOpenLeaderboard={() => setShowLeaderboard(true)}
          onSwitchName={() => {
            try { localStorage.removeItem('casino-name'); } catch (e) { /* ignore */ }
            setName('');
          }}
        />
      )}
      {screen === 'coinflip' && (
        <Coinflip name={name} balance={balance} setBalance={setBalance} onBack={() => setScreen('hub')} />
      )}
      {showLeaderboard && <Leaderboard onClose={() => setShowLeaderboard(false)} />}
    </>
  );
}
