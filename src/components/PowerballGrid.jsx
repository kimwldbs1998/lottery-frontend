const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

/**
 * Requirement section 2/9: pick one or more powerballs (0-9), or ALL to select every digit
 * (generates 10 games, the purchase maximum). Manually selecting all 10 digits is shown as
 * ALL too; deselecting one digit from that state keeps the rest and just clears the ALL look.
 */
export default function PowerballGrid({ selected, onChange, disabled, maxReachedMessage }) {
  const allActive = selected.length === DIGITS.length;

  const toggleDigit = (n) => {
    if (disabled) return;
    if (selected.includes(n)) {
      onChange(selected.filter((x) => x !== n));
    } else {
      onChange([...selected, n].sort((a, b) => a - b));
    }
  };

  const toggleAll = () => {
    if (disabled) return;
    onChange(allActive ? [] : [...DIGITS]);
  };

  return (
    <div>
      <div className="ball-grid">
        {DIGITS.map((n) => {
          const isSelected = selected.includes(n);
          return (
            <button
              key={n}
              type="button"
              className={`ball powerball${isSelected ? ' selected' : ''}`}
              disabled={disabled}
              onClick={() => toggleDigit(n)}
              aria-pressed={isSelected}
            >
              {n}
            </button>
          );
        })}
        <button
          type="button"
          className={`ball ball-all${allActive ? ' selected' : ''}`}
          disabled={disabled}
          onClick={toggleAll}
          aria-pressed={allActive}
        >
          ALL
        </button>
      </div>
      <div className="muted" style={{ marginTop: 6 }}>
        {selected.length}개 선택됨 (선택한 파워볼 개수만큼 게임이 생성됩니다) · 0~9 중 한 개 이상 선택
        {maxReachedMessage ? ` · ${maxReachedMessage}` : ''}
      </div>
    </div>
  );
}
