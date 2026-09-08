import { useMemo, useState } from 'react';

/**
 * Requirement section 10 (PowerUp 옵션): toggling on doubles 4th/5th place fixed prizes and
 * raises the per-game price from Rs 40 to Rs 60. Section 10 also asks for a flashy activation
 * effect (sparks/particles, a brief highlight) as long as it never obscures the numbers, price,
 * balance or purchase button, and to offer a way to reduce motion.
 */
export default function PowerUpToggle({ active, onToggle, disabled, reduceMotion }) {
  const [burstKey, setBurstKey] = useState(0);

  const sparks = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => {
      const angle = (Math.PI * 2 * i) / 14;
      const dist = 46 + (i % 3) * 10;
      return {
        id: i,
        dx: Math.cos(angle) * dist,
        dy: Math.sin(angle) * dist,
        delay: (i % 4) * 40,
      };
    });
  }, [burstKey]);

  const handleClick = () => {
    if (disabled) return;
    const turningOn = !active;
    onToggle(turningOn);
    if (turningOn && !reduceMotion) setBurstKey((k) => k + 1);
  };

  return (
    <div className="powerup-row">
      <button
        type="button"
        className={`powerup-btn${active ? ' active' : ''}`}
        onClick={handleClick}
        disabled={disabled}
      >
        {active ? '⚡ POWER UP! 적용중' : 'PowerUp 적용하기 (+Rs 20/게임)'}
        {active && !reduceMotion && (
          <span className="powerup-burst" key={burstKey}>
            {sparks.map((s) => (
              <span
                key={s.id}
                className="spark"
                style={{ '--dx': `${s.dx}px`, '--dy': `${s.dy}px`, animationDelay: `${s.delay}ms` }}
              />
            ))}
          </span>
        )}
      </button>
      <div className="powerup-info">
        PowerUp을 적용하면 게임당 가격이 Rs 40 → Rs 60으로 바뀌고, 4등·5등 당첨금이 2배로 지급됩니다
        (1~3등은 배율이 적용되지 않습니다). 구매 완료 후에는 변경할 수 없습니다.
      </div>
    </div>
  );
}
