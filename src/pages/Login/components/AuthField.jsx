import React from 'react';

const HelpIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.8" />
    <path d="M9.85 9.35a2.3 2.3 0 0 1 4.3 1.15c0 1.52-1.6 1.92-1.98 3.05" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    <circle cx="12" cy="16.8" r="1" fill="currentColor" />
  </svg>
);

const EyeIcon = ({ visible }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path
      d="M2.2 12s3.55-5.8 9.8-5.8 9.8 5.8 9.8 5.8-3.55 5.8-9.8 5.8S2.2 12 2.2 12Z"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.7"
    />
    <circle cx="12" cy="12" r="2.9" fill="none" stroke="currentColor" strokeWidth="1.7" />
    {!visible && (
      <path
        d="M4 20 20 4"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.9"
      />
    )}
  </svg>
);

const AuthField = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  showHelp = false,
  canToggleVisibility = false,
  isVisible = false,
  onToggleVisibility,
  autoComplete,
}) => {
  const inputType = canToggleVisibility ? (isVisible ? 'text' : 'password') : type;

  return (
    <div className="auth-field">
      <div className="auth-field__label-row">
        <label className="auth-field__label">{label}</label>
        {showHelp && (
          <button type="button" className="auth-field__icon-button" aria-label={`${label} 도움말`}>
            <HelpIcon />
          </button>
        )}
      </div>

      <div className="auth-field__input-wrap">
        <input
          className="auth-field__input"
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
        />
        {canToggleVisibility && (
          <button
            type="button"
            className="auth-field__icon-button auth-field__icon-button--inside"
            onClick={onToggleVisibility}
            aria-label={isVisible ? '비밀번호 숨기기' : '비밀번호 보기'}
          >
            <EyeIcon visible={isVisible} />
          </button>
        )}
      </div>
    </div>
  );
};

export default AuthField;