import React, { useEffect, useState } from 'react';
import { modelApi } from '../../api/modelApi';
import { getImagePromptState, setImagePromptState } from '../../common/storage';
import './ImagePrompt.css';

const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

// Blob URL을 Data URI로 변환하는 헬퍼 함수
const blobUrlToDataUri = async (blobUrl) => {
  try {
    const response = await fetch(blobUrl);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('이미지 변환 실패:', error);
    return '';
  }
};

const OPT_DESCRIPTIONS = {
  0: 'opt=0: user_prompt,positive_prompot, negative_prompt 도 다 넘기고 시스템 프롬프트도 넘겨서 처리',
  1: 'opt=1: user_prompt만 LLM에 전달, 파라메터 긍정/부정 + LLM 결과 조합',
  2: 'opt=2: user_prompt만 LLM에 전달(시스템 프롬프트 없이), 파라메터 긍정/부정 + LLM 결과 조합',
};

// 이미지/프롬프트 페이지 상태
const ImagePrompt = () => {
  // 초기 상태 한 번만 로드
  const savedState = getImagePromptState();
  const [promptText, setPromptText] = useState(savedState.promptText || '');
  const [positivePromptText, setPositivePromptText] = useState(savedState.positivePromptText || '');
  const [negativePromptText, setNegativePromptText] = useState(savedState.negativePromptText || '');
  // 업로드 이미지: Data URI로 저장/복원 (File 객체는 저장 불가)
  const [uploadedImageUrl, setUploadedImageUrl] = useState(savedState.uploadedImageDataUri || '');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [strength, setStrength] = useState(savedState.strength || 0.75);
  const [resultsByOpt, setResultsByOpt] = useState(savedState.resultsByOpt || { 0: '', 1: '', 2: '' });
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeOptTab, setActiveOptTab] = useState(savedState.activeOptTab || 0);
  const [loadingText, setLoadingText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // 상태 변경 시 저장
  useEffect(() => {
    setImagePromptState({
      promptText,
      positivePromptText,
      negativePromptText,
      strength,
      uploadedImageDataUri: uploadedImageUrl,
      resultsByOpt,
      activeOptTab,
    });
  }, [promptText, positivePromptText, negativePromptText, strength, uploadedImageUrl, resultsByOpt, activeOptTab]);

  // 언마운트 시 상태 저장 (명시적 보장)
  useEffect(() => {
    return () => {
      setImagePromptState({
        promptText,
        positivePromptText,
        negativePromptText,
        strength,
        uploadedImageDataUri: uploadedImageUrl,
        resultsByOpt,
        activeOptTab,
      });
    };
  }, [promptText, positivePromptText, negativePromptText, strength, uploadedImageUrl, resultsByOpt, activeOptTab]);


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

  const getGeneratedImageDataUri = async (response, fallbackMessage) => {
    if (response.ok) {
      const dataUri = await blobUrlToDataUri(response.blobUrl);
      return dataUri || response.blobUrl;
    }

    setErrorMsg(response.error || fallbackMessage);
    return '';
  };

  const handleGenerateComfyuiClick = async () => {
    const hasImage = uploadedFile !== null || uploadedImageUrl !== '';
    if (!hasImage) {
      setErrorMsg('이미지를 먼저 업로드하거나 붙여넣기 해주세요.');
      return;
    }

    if (!promptText.trim() && !positivePromptText.trim()) {
      setErrorMsg('이미지 변경은 기본 프롬프트 또는 포지티브 프롬프트가 필요합니다.');
      return;
    }

    setIsGenerating(true);
    setLoadingText(`옵션 ${activeOptTab}으로 이미지 변환 중입니다. 잠시만 기다려 주세요.`);
    setErrorMsg('');

    try {
      const dataUri = uploadedFile
        ? await fileToBase64(uploadedFile)
        : uploadedImageUrl;
      
      // modelApi.changeImageComfyuiOpt 사용 (비동기 구현)
      const response = await modelApi.changeImageComfyuiOpt(
        activeOptTab,
        promptText,
        dataUri,
        strength,
        positivePromptText,
        negativePromptText,
      );

      const generatedImageUrl = await getGeneratedImageDataUri(response, `이미지 변환(Opt ${activeOptTab})에 실패했습니다.`);
      if (generatedImageUrl) {
        setResultsByOpt(prev => ({
          ...prev,
          [activeOptTab]: generatedImageUrl
        }));
      }
    } catch (error) {
      setErrorMsg(`오류가 발생했습니다: ${error.message}`);
    } finally {
      setIsGenerating(false);
      setLoadingText('');
    }
  };


  const handleUploadChange = async (event) => {
    const selectedFile = event.target.files && event.target.files[0];
    if (!selectedFile) return;

    setUploadedFile(selectedFile);
    // Data URI로 변환하여 저장 (페이지 이동 후 복원 가능)
    const dataUri = await fileToBase64(selectedFile);
    setUploadedImageUrl(dataUri);
  };

  const handlePaste = async (event) => {
    const clipboardItems = event.clipboardData && event.clipboardData.items;
    if (!clipboardItems) return;

    for (const item of clipboardItems) {
      if (item.type.startsWith('image/')) {
        const pastedFile = item.getAsFile();
        if (!pastedFile) continue;

        setUploadedFile(pastedFile);
        // Data URI로 변환하여 저장 (페이지 이동 후 복원 가능)
        const dataUri = await fileToBase64(pastedFile);
        setUploadedImageUrl(dataUri);
        break;
      }
    }
  };

  return (
    <section className="image-prompt">
      <h1>이미지변경</h1>

      <div className="image-prompt__form">
        <label className="image-prompt__label" htmlFor="image-prompt-basic">
          기본 프롬프트
        </label>
        <textarea
          id="image-prompt-basic"
          className="image-prompt__textarea"
          value={promptText}
          onChange={handlePromptChange}
          placeholder="기본 프롬프트를 입력하세요."
          rows={4}
        />

        <label className="image-prompt__label" htmlFor="image-prompt-positive">
          포지티브 프롬프트
        </label>
        <textarea
          id="image-prompt-positive"
          className="image-prompt__textarea"
          value={positivePromptText}
          onChange={handlePositivePromptChange}
          placeholder="포지티브 프롬프트를 입력하세요."
          rows={4}
        />

        <label className="image-prompt__label" htmlFor="image-prompt-negative">
          네가티브 프롬프트
        </label>
        <textarea
          id="image-prompt-negative"
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

        <div className="image-prompt__tabs">
          {[0, 1, 2].map((opt) => (
            <button
              key={opt}
              type="button"
              className={`image-prompt__tab${activeOptTab === opt ? ' is-active' : ''}`}
              onClick={() => setActiveOptTab(opt)}
            >
              옵션 {opt}
            </button>
          ))}
        </div>

        <div className="image-prompt__tab-content">
          <div className="image-prompt__tab-pane">
            <p className="image-prompt__tab-description">{OPT_DESCRIPTIONS[activeOptTab]}</p>
            <button
              className="image-prompt__btn image-prompt__btn--full image-prompt__btn--secondary"
              type="button"
              onClick={handleGenerateComfyuiClick}
              disabled={isGenerating}
            >
              {isGenerating ? '생성 중...' : `이미지 변경 (Opt ${activeOptTab})`}
            </button>

            <div className="image-prompt__result-section">
              <h3 className="image-prompt__result-title">생성 결과 (Opt {activeOptTab})</h3>
              {resultsByOpt[activeOptTab] ? (
                <div className="image-prompt__generated-box">
                  <img
                    className="image-prompt__generated-image"
                    src={resultsByOpt[activeOptTab]}
                    alt={`생성된 이미지 (Opt ${activeOptTab})`}
                  />
                </div>
              ) : (
                <div className="image-prompt__empty-result" aria-label={`생성 결과 (Opt ${activeOptTab}) 빈 구역`}>
                  옵션 {activeOptTab}의 생성 결과가 없습니다.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {errorMsg && (
        <p className="image-prompt__error" role="alert">{errorMsg}</p>
      )}

      {isGenerating && (
        <div className="image-prompt__loading" role="status" aria-live="polite">
          <span className="image-prompt__loading-spinner" aria-hidden="true" />
          {loadingText}
        </div>
      )}




    </section>
  );
};

export default ImagePrompt;