import { useEffect, useRef, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useCurrentRound } from '../hooks/useCurrentRound';
import { useEstimate } from '../hooks/useEstimate';
import PrizeTicker from '../components/PrizeTicker';
import GeneralBallGrid from '../components/GeneralBallGrid';
import PowerballGrid from '../components/PowerballGrid';
import PowerUpToggle from '../components/PowerUpToggle';
import SavedNumberPanel from '../components/SavedNumberPanel';
import PurchaseConfirmModal from '../components/PurchaseConfirmModal';
import PurchaseSuccessModal from '../components/PurchaseSuccessModal';
import { formatRs } from '../utils/format';

function randomGeneralBalls() {
  const pool = [1, 2, 3, 4, 5, 6, 7];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, 5).sort((a, b) => a - b);
}

function randomPowerball() {
  return Math.floor(Math.random() * 10);
}

export default function GamePage() {
  const { user, refreshMe, logout } = useAuth();
  const [generalBalls, setGeneralBalls] = useState([]);
  const [powerballs, setPowerballs] = useState([]);
  const [powerUp, setPowerUp] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(() => localStorage.getItem('cenlottery.reduceMotion') === '1');
  const [pageError, setPageError] = useState(null);

  const [quote, setQuote] = useState(null);
  const [quoting, setQuoting] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState(null);
  const [successPurchase, setSuccessPurchase] = useState(null);
  const idempotencyKeyRef = useRef(null);

  const resetSelection = () => {
    setGeneralBalls([]);
    setPowerballs([]);
    setPowerUp(false);
  };

  const { round } = useCurrentRound((newRound) => {
    // Requirement section 3: on round change, clear in-progress selection/PowerUp/unconfirmed
    // purchase info, but keep saved numbers, purchase history, and balance untouched.
    resetSelection();
    if (quote) {
      setQuote(null);
      setPageError('회차가 변경되어 이전 화면의 구매가 취소되었습니다. 번호를 다시 선택해 주세요.');
    }
  });
  const { estimate, stale: estimateStale, refresh: refreshEstimate } = useEstimate(round?.roundNumber);

  useEffect(() => {
    document.body.classList.toggle('reduce-motion', reduceMotion);
    localStorage.setItem('cenlottery.reduceMotion', reduceMotion ? '1' : '0');
  }, [reduceMotion]);

  const allSelected = powerballs.length === 10;
  const gameCount = powerballs.length;
  const pricePerGame = powerUp ? 60 : 40;
  const totalAmount = gameCount * pricePerGame;
  const canBuy = round?.saleOpen && generalBalls.length === 5 && gameCount >= 1 && !quoting;

  const handleAutoSelect = () => {
    const hasSelection = generalBalls.length > 0 || powerballs.length > 0;
    const doIt = () => {
      setGeneralBalls(randomGeneralBalls());
      setPowerballs([randomPowerball()]);
    };
    if (hasSelection) {
      if (window.confirm('선택한 숫자를 초기화하고 자동선택을 진행하시겠습니까?')) doIt();
    } else {
      doIt();
    }
  };

  const handleLoadSaved = (saved) => {
    setGeneralBalls(saved.generalBalls);
    setPowerballs(saved.powerballs);
  };

  const openPurchaseConfirm = async () => {
    setPageError(null);
    setQuoting(true);
    try {
      const q = await api.post('/purchase/quote', { generalBalls, powerballs, allSelected, powerUp });
      setQuote(q);
      idempotencyKeyRef.current = crypto.randomUUID();
      setConfirmError(null);
    } catch (e) {
      if (e.status === 401) return logout('expired');
      setPageError(e.message);
    } finally {
      setQuoting(false);
    }
  };

  const handleConfirmPurchase = async () => {
    if (!quote) return;
    setConfirming(true);
    setConfirmError(null);
    try {
      const purchase = await api.post('/purchase/confirm', {
        generalBalls: quote.generalBalls,
        powerballs: quote.powerballs,
        allSelected: quote.allSelected,
        powerUp: quote.powerUp,
        roundNumber: quote.roundNumber,
        idempotencyKey: idempotencyKeyRef.current,
      });
      setQuote(null);
      setSuccessPurchase(purchase);
      resetSelection();
      refreshMe();
      refreshEstimate();
    } catch (e) {
      if (e.status === 401) return logout('expired');
      setConfirmError(e.message);
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
        <label className="motion-toggle">
          <input
            type="checkbox"
            checked={reduceMotion}
            onChange={(e) => setReduceMotion(e.target.checked)}
          />
          화면 움직임 줄이기
        </label>
      </div>

      <PrizeTicker round={round} estimate={estimate} stale={estimateStale} />

      {pageError && <div className="error-banner" style={{ marginTop: 16 }}>{pageError}</div>}
      {!round?.saleOpen && round && (
        <div className="info-banner" style={{ marginTop: 16 }}>
          이번 회차 판매가 마감되었습니다. 다음 회차 시작을 기다려 주세요.
        </div>
      )}

      <div className="panel">
        <div className="section-title">🔢 일반볼 선택 (1~7 중 5개)</div>
        <GeneralBallGrid selected={generalBalls} onChange={setGeneralBalls} disabled={!round?.saleOpen} />
      </div>

      <div className="panel">
        <div className="section-title">💫 파워볼 선택 (0~9, 여러 개 또는 ALL)</div>
        <PowerballGrid selected={powerballs} onChange={setPowerballs} disabled={!round?.saleOpen} />
      </div>

      <div className="panel">
        <div className="section-title">⚡ PowerUp</div>
        <PowerUpToggle
          active={powerUp}
          onToggle={setPowerUp}
          disabled={!round?.saleOpen}
          reduceMotion={reduceMotion}
        />
      </div>

      <div className="panel">
        <div className="btn-row">
          <button type="button" className="btn btn-secondary" onClick={handleAutoSelect} disabled={!round?.saleOpen}>
            🎲 자동선택
          </button>
          <button type="button" className="btn btn-secondary" onClick={resetSelection} disabled={!round?.saleOpen}>
            초기화
          </button>
        </div>
      </div>

      <div className="panel">
        <SavedNumberPanel
          currentSelection={{ generalBalls, powerballs, allSelected }}
          onLoad={handleLoadSaved}
          disabled={!round?.saleOpen}
        />
      </div>

      <div className="summary-bar">
        <div className="summary-stats">
          <div className="summary-stat">
            <div className="label">게임 수</div>
            <div className="value">{gameCount}게임</div>
          </div>
          <div className="summary-stat">
            <div className="label">게임당 가격</div>
            <div className="value">{formatRs(pricePerGame)}</div>
          </div>
          <div className="summary-stat">
            <div className="label">총 구매 금액</div>
            <div className="value gold">{formatRs(totalAmount)}</div>
          </div>
          <div className="summary-stat">
            <div className="label">사용 가능 금액</div>
            <div className="value">{user ? formatRs(user.balance) : '-'}</div>
          </div>
        </div>
        <button type="button" className="btn btn-primary" disabled={!canBuy} onClick={openPurchaseConfirm}>
          {quoting ? '확인 중...' : '구매하기'}
        </button>
      </div>

      <PurchaseConfirmModal
        quote={quote}
        confirming={confirming}
        error={confirmError}
        onConfirm={handleConfirmPurchase}
        onCancel={() => {
          setQuote(null);
          setConfirmError(null);
        }}
      />
      <PurchaseSuccessModal purchase={successPurchase} onClose={() => setSuccessPurchase(null)} />
    </div>
  );
}
