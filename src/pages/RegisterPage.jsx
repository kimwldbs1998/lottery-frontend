import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    setBusy(true);
    try {
      await register(username, password);
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
        <h2 style={{ textAlign: 'center' }}>회원가입</h2>
        <div className="info-banner">
          가입 시 데모용 사용 가능 금액 Rs 100,000이 자동으로 지급됩니다.
        </div>
        {error && <div className="error-banner">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label>아이디 (3~30자)</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} autoFocus required minLength={3} />
          </div>
          <div className="form-field">
            <label>비밀번호 (4자 이상)</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={4} />
          </div>
          <div className="form-field">
            <label>비밀번호 확인</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
            {busy ? '가입 중...' : '회원가입'}
          </button>
        </form>
        <div className="auth-switch">
          이미 계정이 있으신가요? <Link to="/login">로그인</Link>
        </div>
      </div>
    </div>
  );
}
