import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usersApi } from '../../api/users';
import AuthField from './components/AuthField';
import './AuthPage.css';

const Signup = () => {
  const navigate = useNavigate();
  const [loginId, setLoginId] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isPasswordConfirmVisible, setIsPasswordConfirmVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!loginId.trim() || !password.trim() || !passwordConfirm.trim()) {
      setSuccessMessage('');
      setErrorMessage('아이디와 비밀번호를 모두 입력해 주세요.');
      return;
    }

    if (password !== passwordConfirm) {
      setSuccessMessage('');
      setErrorMessage('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    const response = await usersApi.signup(loginId.trim(), password);

    if (response.ok) {
      setSuccessMessage('회원가입이 완료되었습니다. 로그인 화면으로 이동해 주세요.');
      setErrorMessage('');
      setPassword('');
      setPasswordConfirm('');
      setIsSubmitting(false);
      return;
    }

    setErrorMessage(response.error || '회원가입에 실패했습니다.');
    setIsSubmitting(false);
  };

  return (
    <section className="auth-page">
      <h1 className="auth-page__title">회원 가입</h1>

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
            label="이름 (닉네임)"
            value={nickname}
            onChange={(event) => setNickname(event.target.value)}
            autoComplete="nickname"
          />

          <AuthField
            label="비밀번호"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            showHelp
            canToggleVisibility
            isVisible={isPasswordVisible}
            onToggleVisibility={() => setIsPasswordVisible((prev) => !prev)}
            autoComplete="new-password"
          />

          <AuthField
            label="비밀번호 확인"
            value={passwordConfirm}
            onChange={(event) => setPasswordConfirm(event.target.value)}
            canToggleVisibility
            isVisible={isPasswordConfirmVisible}
            onToggleVisibility={() => setIsPasswordConfirmVisible((prev) => !prev)}
            autoComplete="new-password"
          />

          {nickname.trim() && (
            <p className="auth-feedback auth-feedback--muted">
              현재 백엔드 사양에는 닉네임 저장 항목이 없어 화면 입력만 유지합니다.
            </p>
          )}
          {errorMessage && <p className="auth-feedback auth-feedback--error">{errorMessage}</p>}
          {successMessage && <p className="auth-feedback auth-feedback--success">{successMessage}</p>}

          <div className="auth-actions">
            <button type="submit" className="auth-button auth-button--primary" disabled={isSubmitting}>
              {isSubmitting ? '가입 처리 중...' : '가입하기'}
            </button>
            <button type="button" className="auth-button" onClick={() => navigate('/login')}>
              취소 (로그인으로)
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default Signup;