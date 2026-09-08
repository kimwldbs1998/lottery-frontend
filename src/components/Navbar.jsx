import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { formatRs } from '../utils/format';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <div className="navbar">
      <NavLink to="/" className="brand">🎰 CenLottery 파워픽</NavLink>
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
        {user && <span className="balance-pill">{formatRs(user.balance)}</span>}
        <button className="btn-logout" onClick={logout}>로그아웃</button>
      </div>
    </div>
  );
}
