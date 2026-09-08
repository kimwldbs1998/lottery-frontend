const BALLS = [1, 2, 3, 4, 5, 6, 7];
const PICK_COUNT = 5;

/** Requirement section 9: pick exactly 5 of 1-7; a 6th click while 5 are selected is a no-op. */
export default function GeneralBallGrid({ selected, onChange, disabled }) {
  const toggle = (n) => {
    if (disabled) return;
    if (selected.includes(n)) {
      onChange(selected.filter((x) => x !== n));
    } else {
      if (selected.length >= PICK_COUNT) return;
      onChange([...selected, n].sort((a, b) => a - b));
    }
  };

  return (
    <div>
      <div className="ball-grid">
        {BALLS.map((n) => {
          const isSelected = selected.includes(n);
          const blocked = !isSelected && selected.length >= PICK_COUNT;
          return (
            <button
              key={n}
              type="button"
              className={`ball${isSelected ? ' selected' : ''}`}
              disabled={disabled || blocked}
              onClick={() => toggle(n)}
              aria-pressed={isSelected}
            >
              {n}
            </button>
          );
        })}
      </div>
      <div className="muted" style={{ marginTop: 6 }}>
        {selected.length}/{PICK_COUNT}개 선택됨 · 1~7 중 서로 다른 5개의 숫자를 선택해 주세요
      </div>
    </div>
  );
}
