import { formatRs } from '../utils/format';

/** Requirement section 11: the mandatory review popup shown before a purchase is finalized. */
export default function PurchaseConfirmModal({ quote, onConfirm, onCancel, confirming, error }) {
  if (!quote) return null;

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h3>구매 확인</h3>
        {error && <div className="error-banner">{error}</div>}

        <div className="modal-row">
          <span className="k">구매 회차</span>
          <span className="v">{quote.roundNumber}회차</span>
        </div>
        <div className="modal-row">
          <span className="k">일반볼 번호</span>
          <span className="v">{quote.generalBalls.join(', ')}</span>
        </div>
        <div className="modal-row">
          <span className="k">파워볼 번호</span>
          <span className="v">{quote.allSelected ? 'ALL (0~9 전체)' : quote.powerballs.join(', ')}</span>
        </div>
        <div className="modal-row">
          <span className="k">전체 게임 수 / 매수</span>
          <span className="v">{quote.gameCount}게임 · {quote.gameCount}매</span>
        </div>
        <div className="modal-row">
          <span className="k">PowerUp 적용</span>
          <span className="v">{quote.powerUp ? '적용 (4·5등 당첨금 2배)' : '미적용'}</span>
        </div>
        <div className="modal-row">
          <span className="k">게임당 가격</span>
          <span className="v">{formatRs(quote.pricePerGame)}</span>
        </div>
        <div className="modal-row">
          <span className="k">총 구매 금액</span>
          <span className="v" style={{ color: 'var(--gold)' }}>{formatRs(quote.totalAmount)}</span>
        </div>
        <div className="modal-row">
          <span className="k">현재 사용 가능 금액</span>
          <span className="v">{formatRs(quote.currentBalance)}</span>
        </div>
        <div className="modal-row">
          <span className="k">구매 후 예상 잔액</span>
          <span className="v">{formatRs(quote.projectedBalance)}</span>
        </div>

        <div className="info-banner" style={{ marginTop: 14 }}>
          구매를 확정하면 즉시 처리되며, 이후에는 변경하거나 취소할 수 없습니다.
        </div>

        <div className="btn-row">
          <button type="button" className="btn btn-primary btn-block" disabled={confirming} onClick={onConfirm}>
            {confirming ? '처리 중...' : '구매 확정'}
          </button>
          <button type="button" className="btn btn-secondary btn-block" disabled={confirming} onClick={onCancel}>
            돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}
