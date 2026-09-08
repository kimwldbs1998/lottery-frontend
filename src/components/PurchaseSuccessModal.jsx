import { formatRs } from '../utils/format';

/** Requirement section 11: purchase-completed receipt (거래번호, 회차, 번호, 매수, 금액, 잔액). */
export default function PurchaseSuccessModal({ purchase, onClose }) {
  if (!purchase) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h3>🎉 구매 완료</h3>
        <div className="modal-row">
          <span className="k">거래번호</span>
          <span className="v" style={{ fontSize: 12 }}>{purchase.id}</span>
        </div>
        <div className="modal-row">
          <span className="k">회차</span>
          <span className="v">{purchase.roundNumber}회차</span>
        </div>
        <div className="modal-row">
          <span className="k">선택 번호</span>
          <span className="v">{purchase.generalBalls.join(', ')}</span>
        </div>
        <div className="modal-row">
          <span className="k">파워볼</span>
          <span className="v">{purchase.allSelected ? 'ALL' : purchase.powerballs.join(', ')}</span>
        </div>
        <div className="modal-row">
          <span className="k">PowerUp</span>
          <span className="v">{purchase.powerUp ? '적용' : '미적용'}</span>
        </div>
        <div className="modal-row">
          <span className="k">매수</span>
          <span className="v">{purchase.gameCount}매</span>
        </div>
        <div className="modal-row">
          <span className="k">구매 금액</span>
          <span className="v" style={{ color: 'var(--gold)' }}>{formatRs(purchase.totalAmount)}</span>
        </div>
        <div className="modal-row">
          <span className="k">남은 잔액</span>
          <span className="v" style={{ color: 'var(--green-neon)' }}>{formatRs(purchase.balanceAfter)}</span>
        </div>

        <div className="btn-row">
          <button type="button" className="btn btn-primary btn-block" onClick={onClose}>
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
