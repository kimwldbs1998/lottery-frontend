import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { THEMES, useTheme } from '../context/ThemeContext';
import { formatRs } from '../utils/format';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <div className="navbar">
      <NavLink to="/" className="brand">
        {theme === THEMES.SLEEK ? '💎' : '🌶️'} CenLottery 파워픽
      </NavLink>
      <div className="nav-links">
        <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          번호 선택
        </NavLink>
        <NavLink to="/history" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          구매내역
        </NavLink>
        <NavLink to="/results" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          추첨결과
        </NavLink>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div className="theme-switch" role="group" aria-label="테마 선택">
          <button
            type="button"
            className={`theme-btn${theme === THEMES.SRI_LANKA ? ' active' : ''}`}
            onClick={() => setTheme(THEMES.SRI_LANKA)}
            title="스리랑카 스타일 테마"
          >
            🌶️ 스리랑카
          </button>
          <button
            type="button"
            className={`theme-btn${theme === THEMES.SLEEK ? ' active' : ''}`}
            onClick={() => setTheme(THEMES.SLEEK)}
            title="세련된 스타일 테마"
          >
            💎 세련
          </button>
        </div>
        {user && <span className="balance-pill">{formatRs(user.balance)}</span>}
        <button className="btn-logout" onClick={logout}>로그아웃</button>
      </div>
    </div>
  );
}
