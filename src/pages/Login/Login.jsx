import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usersApi } from '../../api/users';
import AuthField from './components/AuthField';
import './AuthPage.css';

const Login = () => {
  const navigate = useNavigate();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!loginId.trim() || !password.trim()) {
      setSuccessMessage('');
      setErrorMessage('아이디와 비밀번호를 입력해 주세요.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    const response = await usersApi.login(loginId.trim(), password);

    if (response.ok) {
      const userInfo = Array.isArray(response.data) ? response.data[0] : null;
      const loginName = userInfo?.user_name || loginId.trim();
      setSuccessMessage(`${loginName}님 로그인에 성공했습니다.`);
      setIsSubmitting(false);
      return;
    }

    setErrorMessage(response.error || '로그인에 실패했습니다.');
    setIsSubmitting(false);
  };

  return (
    <section className="auth-page">
      <h1 className="auth-page__title">로그인(ver1.0)</h1>

      <div className="auth-card">
        <form className="auth-form" onSubmit={handleSubmit}>
          <AuthField
            label="아이디"
            value={loginId}
            onChange={(event) => setLoginId(event.target.value)}
            showHelp
            autoComplete="username"
          />

          <AuthField
            label="비밀번호"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            showHelp
            canToggleVisibility
            isVisible={isPasswordVisible}
            onToggleVisibility={() => setIsPasswordVisible((prev) => !prev)}
            autoComplete="current-password"
          />

          {errorMessage && <p className="auth-feedback auth-feedback--error">{errorMessage}</p>}
          {successMessage && <p className="auth-feedback auth-feedback--success">{successMessage}</p>}

          <div className="auth-actions">
            <button type="submit" className="auth-button auth-button--primary" disabled={isSubmitting}>
              {isSubmitting ? '로그인 중...' : '로그인'}
            </button>
            <button type="button" className="auth-button" onClick={() => navigate('/login/signup')}>
              회원가입
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default Login;