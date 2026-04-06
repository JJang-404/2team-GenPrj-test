import React, { useState } from 'react';
import './ImageGeneration.css';
import { modelApi } from '../../api/modelApi';

const ImageGeneration = () => {
  const [promptText, setPromptText] = useState('');
  const [positivePromptText, setPositivePromptText] = useState('');
  const [negativePromptText, setNegativePromptText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handlePromptChange = (event) => {
    setPromptText(event.target.value);
  };

  const handlePositivePromptChange = (event) => {
    setPositivePromptText(event.target.value);
  };

  const handleNegativePromptChange = (event) => {
    setNegativePromptText(event.target.value);
  };

  const handleGenerateClick = async () => {
    if (!promptText.trim()) return;
    setIsGenerating(true);
    setImageUrl('');
    setErrorMsg('');
    const response = await modelApi.generateImage(
      promptText.trim(),
      positivePromptText,
      negativePromptText,
    );
    if (response.ok) {
      setImageUrl(response.blobUrl);
    } else {
      setErrorMsg(response.error || '이미지 생성에 실패했습니다.');
    }
    setIsGenerating(false);
  };

  return (
    <div className="image-generation">
      <h1>이미지 생성</h1>

      {/* 여러 줄 프롬프트 입력 텍스트박스 */}
      <textarea
        className="image-generation__prompt"
        value={promptText}
        onChange={handlePromptChange}
        placeholder="기본 프롬프트를 입력하세요."
        rows={4}
      />

      <textarea
        className="image-generation__prompt"
        value={positivePromptText}
        onChange={handlePositivePromptChange}
        placeholder="포지티브 프롬프트를 입력하세요."
        rows={4}
      />

      <textarea
        className="image-generation__prompt"
        value={negativePromptText}
        onChange={handleNegativePromptChange}
        placeholder="네가티브 프롬프트를 입력하세요."
        rows={6}
      />

      <button
        className="image-generation__btn"
        onClick={handleGenerateClick}
        disabled={isGenerating}
      >
        {isGenerating ? '생성 중...' : '생성'}
      </button>

      {isGenerating && (
        <div className="image-generation__loading" role="status" aria-live="polite">
          <span className="image-generation__loading-spinner" aria-hidden="true" />
          이미지 생성 중입니다. 잠시만 기다려 주세요.
        </div>
      )}

      {errorMsg && (
        <p className="image-generation__error" role="alert">{errorMsg}</p>
      )}

      {imageUrl && (
        <div className="image-generation__result">
          <img
            className="image-generation__result-img"
            src={imageUrl}
            alt="생성된 이미지"
          />
        </div>
      )}
    </div>
  );
};

export default ImageGeneration;
