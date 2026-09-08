import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { formatDateTime, formatRs } from '../utils/format';

const PAGE_SIZE = 10;

/** Requirement section 13: per-round draw results (winning 일반볼 5개 + 파워볼 1개). */
export default function ResultsPage() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api.get(`/rounds?page=${page}&size=${PAGE_SIZE}`, { auth: false })
      .then((data) => {
        if (cancelled) return;
        setItems(data.items);
        setTotal(data.total);
        setError(null);
      })
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [page]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="container">
      <h2>추첨결과</h2>
      <div className="muted" style={{ marginBottom: 16 }}>회차별 당첨 번호와 정산 요약입니다.</div>

      {error && <div className="error-banner">{error}</div>}
      {loading && <div className="muted"><span className="spinner" /> 불러오는 중...</div>}

      {items.map((r) => (
        <div key={r.roundNumber} className="history-card">
          <div className="history-head">
            <strong>{r.roundNumber}회차</strong>
            <span className={`status-chip ${r.status === 'SETTLED' ? 'settled' : 'open'}`}>
              {r.status === 'SETTLED' ? '추첨 완료' : '추첨 대기'}
            </span>
          </div>

          {r.status === 'SETTLED' ? (
            <>
              <div className="saved-number-row" style={{ marginBottom: 10 }}>
                {r.drawnGeneralBalls.map((n) => (
                  <span key={n} className="mini-ball gold">{n}</span>
                ))}
                <span style={{ color: 'var(--text-dim)' }}>+</span>
                <span className="mini-ball blue">{r.drawnPowerball}</span>
              </div>
              <div className="muted">
                추첨 시각 {formatDateTime(r.settledAt)} · 당첨금 풀 {formatRs(r.currentPool)}
                {r.negativePoolException && (
                  <span className="equal-badge" style={{ marginLeft: 6 }}>네거티브 풀 예외 · 균등 지급 적용</span>
                )}
              </div>
              <div className="muted" style={{ marginTop: 4 }}>
                1등 {r.tier1WinningTickets}명 · 2등 {r.tier2WinningTickets}명 · 3등 {r.tier3WinningTickets}명 ·
                {' '}4등 {r.tier4WinningTickets}명 · 5등 {r.tier5WinningTickets}명
              </div>
              <div className="muted">다음 회차 이월금 {formatRs(r.carryOutPool)}</div>
            </>
          ) : (
            <div className="muted">이번 회차는 아직 판매 중이거나 정산 대기 중입니다.</div>
          )}
        </div>
      ))}

      {totalPages > 1 && (
        <div className="btn-row" style={{ justifyContent: 'center' }}>
          <button className="btn btn-secondary" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>이전</button>
          <span className="muted" style={{ alignSelf: 'center' }}>{page + 1} / {totalPages}</span>
          <button className="btn btn-secondary" disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)}>다음</button>
        </div>
      )}
    </div>
  );
}
