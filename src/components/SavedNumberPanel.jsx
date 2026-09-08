import { useEffect, useState } from 'react';
import { api } from '../api/client';

/**
 * Requirement section 9 "나만의 번호": exactly one saved favorite number per user, with
 * load/replace/delete. Replacing an existing saved number needs explicit confirmation.
 */
export default function SavedNumberPanel({ currentSelection, onLoad, disabled }) {
  const [saved, setSaved] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);

  const refresh = async () => {
    try {
      const data = await api.get('/purchase/saved-number');
      setSaved(data.exists ? data : null);
    } catch (e) {
      // silently ignore; saved-number is a convenience feature
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const canSaveCurrent = currentSelection.generalBalls.length === 5 && currentSelection.powerballs.length >= 1;

  const handleSave = async () => {
    if (!canSaveCurrent) return;
    if (saved && !window.confirm('이미 저장된 번호가 있습니다. 현재 선택한 번호로 교체하시겠습니까?')) {
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const body = {
        generalBalls: currentSelection.generalBalls,
        powerballs: currentSelection.powerballs,
        allSelected: currentSelection.allSelected,
      };
      const result = await api.post('/purchase/saved-number', body);
      setSaved(result);
      setMessage('나만의 번호로 저장했습니다.');
    } catch (e) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('저장된 나만의 번호를 삭제하시겠습니까?')) return;
    setBusy(true);
    try {
      await api.del('/purchase/saved-number');
      setSaved(null);
      setMessage('삭제했습니다.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="section-title">⭐ 나만의 번호</div>
      {saved ? (
        <div className="saved-number-row">
          {saved.generalBalls.map((n) => (
            <span key={n} className="mini-ball gold">{n}</span>
          ))}
          <span style={{ color: 'var(--text-dim)' }}>+</span>
          {saved.powerballs.length === 10 ? (
            <span className="mini-ball blue">ALL</span>
          ) : (
            saved.powerballs.map((n) => (
              <span key={n} className="mini-ball blue">{n}</span>
            ))
          )}
          <div className="btn-row" style={{ marginTop: 0 }}>
            <button type="button" className="btn btn-secondary" disabled={disabled || busy} onClick={() => onLoad(saved)}>
              불러오기
            </button>
            <button type="button" className="btn btn-danger" disabled={disabled || busy} onClick={handleDelete}>
              삭제
            </button>
          </div>
        </div>
      ) : (
        <div className="muted">저장된 번호가 없습니다.</div>
      )}
      <div className="btn-row">
        <button
          type="button"
          className="btn btn-secondary"
          disabled={disabled || busy || !canSaveCurrent}
          onClick={handleSave}
        >
          현재 선택 번호 저장
        </button>
      </div>
      {message && <div className="muted" style={{ marginTop: 6 }}>{message}</div>}
    </div>
  );
}
