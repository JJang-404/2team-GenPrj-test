import React, { useState } from 'react';
import { modelApi } from '../../api/modelApi';
import './ImagePrompt.css';

const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const ImagePrompt = () => {
  const [promptText, setPromptText] = useState('');
  const [positivePromptText, setPositivePromptText] = useState('');
  const [negativePromptText, setNegativePromptText] = useState('');
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [strength, setStrength] = useState(0.75);
  const [resultImageUrl, setResultImageUrl] = useState('');
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

  const handleStrengthChange = (event) => {
    setStrength(parseFloat(event.target.value));
  };

  const handleGenerateClick = async () => {
    if (!promptText.trim()) return;
    if (!uploadedFile) {
      setErrorMsg('이미지를 먼저 업로드하거나 붙여넣기 해주세요.');
      return;
    }

    setIsGenerating(true);
    setErrorMsg('');
    setResultImageUrl('');

    try {
      const imageBase64 = await fileToBase64(uploadedFile);
      const response = await modelApi.changeImage(
        promptText.trim(),
        imageBase64,
        strength,
        positivePromptText,
        negativePromptText,
      );

      if (response.ok) {
        setResultImageUrl(response.blobUrl);
      } else {
        setErrorMsg(response.error || '이미지 변환에 실패했습니다.');
      }
    } catch (error) {
      setErrorMsg(`오류가 발생했습니다: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUploadChange = (event) => {
    const selectedFile = event.target.files && event.target.files[0];
    if (!selectedFile) return;

    setUploadedFile(selectedFile);
    const localImageUrl = URL.createObjectURL(selectedFile);
    setUploadedImageUrl(localImageUrl);
  };

  const handlePaste = (event) => {
    const clipboardItems = event.clipboardData && event.clipboardData.items;
    if (!clipboardItems) return;

    for (const item of clipboardItems) {
      if (item.type.startsWith('image/')) {
        const pastedFile = item.getAsFile();
        if (!pastedFile) continue;

        setUploadedFile(pastedFile);
        const localImageUrl = URL.createObjectURL(pastedFile);
        setUploadedImageUrl(localImageUrl);
        break;
      }
    }
  };

  return (
    <div className="image-prompt">
      <h1>이미지/프롬프트</h1>

      <button
        className="image-prompt__btn"
        type="button"
        onClick={handleGenerateClick}
        disabled={isGenerating}
      >
        {isGenerating ? '생성 중...' : '생성'}
      </button>

      <textarea
        className="image-prompt__textarea"
        value={promptText}
        onChange={handlePromptChange}
        placeholder="기본 프롬프트를 입력하세요."
        rows={4}
      />

      <textarea
        className="image-prompt__textarea"
        value={positivePromptText}
        onChange={handlePositivePromptChange}
        placeholder="포지티브 프롬프트를 입력하세요."
        rows={4}
      />

      <textarea
        className="image-prompt__textarea"
        value={negativePromptText}
        onChange={handleNegativePromptChange}
        placeholder="네가티브 프롬프트를 입력하세요."
        rows={6}
      />

      <div
        className={`image-prompt__upload${uploadedImageUrl ? '' : ' image-prompt__upload--empty'}`}
        onPaste={handlePaste}
        tabIndex={0}
        role="region"
        aria-label="이미지 붙여넣기 영역"
      >
        <label className="image-prompt__upload-label" htmlFor="image-prompt-upload">
          이미지를 넣을 수 있는 창
        </label>
        <input
          id="image-prompt-upload"
          className="image-prompt__upload-input"
          type="file"
          accept="image/*"
          onChange={handleUploadChange}
        />

        {uploadedImageUrl ? (
          <div className="image-prompt__preview-box">
            <img className="image-prompt__preview-image" src={uploadedImageUrl} alt="업로드한 이미지" />
          </div>
        ) : (
          <p className="image-prompt__paste-hint">이 영역을 클릭하고 Ctrl+V 로 캡처 이미지를 붙여넣을 수 있습니다.</p>
        )}
      </div>

      <div className="image-prompt__strength">
        <label className="image-prompt__strength-label" htmlFor="image-prompt-strength">
          변환 강도 (strength): <strong>{strength.toFixed(2)}</strong>
        </label>
        <input
          id="image-prompt-strength"
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={strength}
          onChange={handleStrengthChange}
          className="image-prompt__strength-slider"
        />
      </div>

      {errorMsg && (
        <p className="image-prompt__error" role="alert">{errorMsg}</p>
      )}

      {isGenerating && (
        <div className="image-prompt__loading" role="status" aria-live="polite">
          <span className="image-prompt__loading-spinner" aria-hidden="true" />
          이미지 변환 중입니다. 잠시만 기다려 주세요.
        </div>
      )}

      {resultImageUrl && (
        <div className="image-prompt__generated-box">
          <img
            className="image-prompt__generated-image"
            src={resultImageUrl}
            alt="변환된 이미지"
          />
        </div>
      )}
    </div>
  );
};

export default ImagePrompt;