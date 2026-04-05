import React, { useState } from 'react';
import { miireboxApi } from '../../api/genBackend';

const Test = () => {
  const expectedApiUrl = `${miireboxApi.backendUrl}/model/test`;
  const expectedGenerateUrl = `${miireboxApi.backendUrl}/model/generate?prompt={prompt}`;
  const expectedChangeImageUrl = `${miireboxApi.backendUrl}/model/changeimage`;
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleBackendCheck = async () => {
    setIsLoading(true);
    setResult(null);

    const response = await miireboxApi.testConnection();

    setResult({
      ok: response.ok,
      apiUrl: response.apiUrl || expectedApiUrl,
      statusCode: response.statusCode ?? null,
      message: response.data ?? null,
      error: response.error ?? null,
    });
    setIsLoading(false);
  };

  return (
    <div>
      <h1>테스트</h1>
      <p>백엔드 요청이 실제로 어디로 나가는지 확인하는 페이지입니다.</p>

      <p>설정된 요청 대상: {expectedApiUrl}</p>
      <p>이미지 생성 요청 대상: {expectedGenerateUrl}</p>
      <p>이미지/프롬프트 요청 대상: {expectedChangeImageUrl}</p>

      <button type="button" onClick={handleBackendCheck} disabled={isLoading}>
        {isLoading ? '확인 중...' : '백엔드 요청 확인'}
      </button>

      {result && (
        <div style={{ marginTop: '16px' }}>
          <p>요청 URL: {result.apiUrl}</p>
          <p>성공 여부: {result.ok ? '성공' : '실패'}</p>
          <p>응답 코드: {result.statusCode ?? '없음'}</p>
          <p>응답 메시지: {result.message ?? '없음'}</p>
          <p>오류 메시지: {result.error ?? '없음'}</p>
        </div>
      )}
    </div>
  );
};

export default Test;
