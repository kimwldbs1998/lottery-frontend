import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { formatDateTime, formatRs } from '../utils/format';

const PAGE_SIZE = 10;

/** Requirement section 13: full purchase history across every round, with round/status filters. */
export default function HistoryPage() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [roundFilter, setRoundFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), size: String(PAGE_SIZE) });
    if (roundFilter) params.set('roundNumber', roundFilter);
    if (statusFilter) params.set('status', statusFilter);
    api.get(`/history?${params.toString()}`)
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
  }, [page, roundFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="container">
      <h2>구매내역</h2>
      <div className="muted" style={{ marginBottom: 16 }}>
        직전·현재 회차뿐 아니라 구매하신 전체 회차의 내역을 확인할 수 있습니다.
      </div>

      <div className="filter-row">
        <input
          type="number"
          placeholder="회차 번호로 검색"
          value={roundFilter}
          onChange={(e) => { setPage(0); setRoundFilter(e.target.value); }}
        />
        <select value={statusFilter} onChange={(e) => { setPage(0); setStatusFilter(e.target.value); }}>
          <option value="">전체 상태</option>
          <option value="OPEN">추첨 대기</option>
          <option value="SETTLED">추첨 완료</option>
        </select>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {loading && <div className="muted"><span className="spinner" /> 불러오는 중...</div>}

      {!loading && items.length === 0 && (
        <div className="empty-state panel">구매 내역이 없습니다.</div>
      )}

      {items.map((p) => (
        <div key={p.purchaseId} className="history-card">
          <div className="history-head">
            <div>
              <strong>{p.roundNumber}회차</strong>
              <span className={`status-chip ${p.roundStatus === 'SETTLED' ? 'settled' : 'open'}`} style={{ marginLeft: 8 }}>
                {p.roundStatus === 'SETTLED' ? '추첨 완료' : '추첨 대기'}
              </span>
              {p.equalPayoutApplied && <span className="equal-badge">균등 지급 적용</span>}
            </div>
            <div className="muted">{formatDateTime(p.purchaseDateTime)}</div>
          </div>

          <div className="muted" style={{ marginBottom: 6 }}>
            일반볼 {p.generalBalls.join(', ')} · {p.powerUp ? 'PowerUp 적용' : 'PowerUp 미적용'} ·
            {' '}게임당 {formatRs(p.pricePerGame)} · 총 {formatRs(p.totalAmount)} ({p.gameCount}매)
          </div>

          {p.games.map((g) => (
            <div key={g.ticketId} className="game-row">
              <span>파워볼 {g.powerball}</span>
              <span>
                <span className={`tier-chip${g.tier ? '' : ' none'}`}>{g.tierLabel}</span>
                {' '}
                {g.status === 'SETTLED' && (
                  <strong style={{ marginLeft: 8 }}>{formatRs(g.payout)}</strong>
                )}
                {g.settlementType === 'EQUAL' && <span className="equal-badge">균등</span>}
              </span>
            </div>
          ))}

          {p.totalPayout !== null && p.totalPayout !== undefined && (
            <div className="game-row" style={{ borderTop: '1px solid var(--border-glow)', marginTop: 4 }}>
              <strong>이 구매의 총 당첨금</strong>
              <strong style={{ color: 'var(--gold)' }}>{formatRs(p.totalPayout)}</strong>
            </div>
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
