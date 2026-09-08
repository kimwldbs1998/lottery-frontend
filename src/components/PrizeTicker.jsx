import { formatCountdown, formatDateTime, formatRs } from '../utils/format';

/**
 * Requirement section 8 (예상 당첨금 표시): a neon slot-machine-style marquee showing the
 * current round's estimated 1st/2nd place prize pools, the rollover amount, and a plain-language
 * disclaimer that real payouts depend on the actual draw.
 */
export default function PrizeTicker({ round, estimate, stale }) {
  if (!round) {
    return (
      <div className="ticker-frame">
        <div className="ticker-inner">
          <span className="spinner" /> <span className="muted">회차 정보를 불러오는 중...</span>
        </div>
      </div>
    );
  }

  const remainingSeconds = round.remainingSeconds ?? 0;
  const urgent = remainingSeconds <= 30 && round.saleOpen;

  return (
    <div className="ticker-frame">
      <div className="ticker-inner">
        <div className="ticker-round-label">
          {round.roundNumber}회차 {round.saleOpen ? '· 판매중' : '· 판매마감'}
        </div>

        {estimate ? (
          <div style={{ overflow: 'hidden' }}>
            <div className="ticker-track">
              {[0, 1].map((dup) => (
                <span key={dup} style={{ display: 'inline-flex', gap: 40 }}>
                  <span className="ticker-item">
                    <span className="label">1등 예상</span>
                    <span className="amount">{formatRs(estimate.tier1Expected)}</span>
                  </span>
                  <span className="ticker-item">
                    <span className="label">2등 예상</span>
                    <span className="amount">{formatRs(estimate.tier2Expected)}</span>
                  </span>
                  <span className="ticker-item">
                    <span className="label">이월 공동풀</span>
                    <span className="amount" style={{ fontSize: 18, color: 'var(--blue-neon)' }}>
                      {formatRs(estimate.carryInPool)}
                    </span>
                  </span>
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="muted" style={{ padding: '8px 0' }}>예상 당첨금을 불러오는 중...</div>
        )}

        <div className="ticker-meta">
          {stale
            ? '현재 정보를 확인할 수 없습니다. 잠시 후 다시 시도해 주세요.'
            : `예상 금액입니다 · 실제 지급액은 당첨 매수와 정산 결과에 따라 달라집니다 · 마지막 갱신 ${estimate ? formatDateTime(estimate.lastUpdated) : '-'}`}
        </div>

        <div className="countdown-wrap">
          <span>{round.saleOpen ? '판매 마감까지' : '다음 회차까지'}</span>
          <span className={`countdown-clock${urgent ? ' urgent' : ''}`}>{formatCountdown(remainingSeconds)}</span>
        </div>
      </div>
    </div>
  );
}
