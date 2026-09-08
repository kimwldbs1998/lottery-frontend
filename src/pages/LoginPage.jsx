import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  // Requirement section 15: when a session expires mid-action, explain why the user landed
  // back on the login screen instead of silently bouncing them here.
  const [flash] = useState(() => {
    const msg = sessionStorage.getItem('cenlottery.flash');
    if (msg) sessionStorage.removeItem('cenlottery.flash');
    return msg;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="panel auth-card">
        <div className="brand" style={{ justifyContent: 'center', marginBottom: 18, fontSize: 24 }}>
          🎰 CenLottery 파워픽
        </div>
        <h2 style={{ textAlign: 'center' }}>로그인</h2>
        {flash && <div className="info-banner">{flash}</div>}
        {error && <div className="error-banner">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label>아이디</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} autoFocus required />
          </div>
          <div className="form-field">
            <label>비밀번호</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
            {busy ? '로그인 중...' : '로그인'}
          </button>
        </form>
        <div className="auth-switch">
          계정이 없으신가요? <Link to="/register">회원가입</Link>
        </div>
      </div>
    </div>
  );
}
