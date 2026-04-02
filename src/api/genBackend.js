import axios from 'axios';

class CallApi {
  // API 객체 초기화. 타임아웃 및 백엔드 접속 URL 설정
  constructor(timeoutSec = 30) {
    this.timeoutMs = timeoutSec * 1000;
    this.backendUrl = import.meta.env?.VITE_BACKEND_URL || "http://127.0.0.1:8019";
    this.backendUrl = this.backendUrl.replace(/\/$/, "");

    // axios 인스턴스 생성 (확장성 및 가독성을 위해)
    this.apiClient = axios.create({
      baseURL: this.backendUrl,
      timeout: this.timeoutMs,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  // API 응답 데이터를 리스트 형식으로 정규화
  _normalizeDataList(rawData) {
    if (Array.isArray(rawData)) return rawData;
    
    if (rawData !== null && typeof rawData === "object") {
      const ObjectKeys = Object.keys(rawData);
      const isAllDigits = ObjectKeys.length > 0 && ObjectKeys.every(k => /^\d+$/.test(k));
      
      if (isAllDigits) {
        return ObjectKeys
          .sort((a, b) => parseInt(a) - parseInt(b))
          .map(k => rawData[k]);
      }
      return Object.values(rawData);
    }
    
    if (typeof rawData === "string") {
      try {
        return this._normalizeDataList(JSON.parse(rawData));
      } catch (error) {
        return null;
      }
    }
    return null;
  }

  // POST 방식의 API 요청 처리를 위한 내부 공통 메서드
  async _postData(urlPath, body, failMsg) {
    try {
      const response = await this.apiClient.post(urlPath, body);
      const respJson = response.data;
      
      const statusStr = respJson?.statusCode ? String(respJson.statusCode) : "";
      const isOk = response.status >= 200 && response.status < 300 && statusStr !== "100";

      return {
        ok: isOk,
        apiUrl: `${this.backendUrl}${urlPath}`,
        statusCode: response.status,
        requestBody: body,
        responseJson: respJson,
        data: respJson?.datalist ?? null,
        error: isOk ? null : (respJson?.statusMsg ?? failMsg),
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          return { ok: false, error: `요청 시간 초과 (${this.timeoutMs}ms)` };
        }
        if (error.response) {
          // 서버 응답이 있는 에러 처리 (예: 4xx, 5xx)
          return {
            ok: false,
            statusCode: error.response.status,
            error: `API 오류: ${error.response.statusText}`,
            text: JSON.stringify(error.response.data),
          };
        }
      }
      return { ok: false, error: `요청 실패: ${error.message}` };
    }
  }

  // 리뷰 수정 API 호출
  async editReview(reviewId, authorName, content, userId = "") {
    const urlPath = `/accessdata/updatereview`;
    const requestBody = { reviewId, authorName, content, userId };
    return this._postData(urlPath, requestBody, "리뷰 수정 실패");
  }

  // 로그인 API 호출
  async login(userId, userPw) {
    const urlPath = `/accessdata/login`;
    const body = { userId, userPw };
    return this._postData(urlPath, body, "로그인 실패");
  }

  // 회원가입 API 호출
  async createUser(userId, userName, userPw) {
    const urlPath = `/accessdata/createuser`;
    const body = { userId, userName, userPw };
    return this._postData(urlPath, body, "회원가입 실패");
  }

  // 영화 목록 조회 API 호출 및 결과 정규화
  async getMovies(count = 10, start = 0, filters = {}) {
    const urlPath = `/accessdata/getmovies`;
    const body = {
      COUNT: String(count),
      START: String(start),
      TITLE: String(filters.title || "").trim(),
      DIRECTOR: String(filters.director || "").trim(),
      ACTOR: String(filters.actor || "").trim(),
      RELEASE_START: String(filters.releaseStart || "").trim(),
      RELEASE_END: String(filters.releaseEnd || "").trim(),
    };

    try {
      const response = await this.apiClient.post(urlPath, body);
      const respJson = response.data;
      const data = respJson?.datalist ?? null;
      
      return {
        ok: true,
        backendUrl: this.backendUrl,
        apiUrl: `${this.backendUrl}${urlPath}`,
        statusCode: response.status,
        requestBody: body,
        responseJson: respJson,
        rows: this._normalizeDataList(data),
        dataList: data,
      };
    } catch (error) {
      if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
        return { ok: false, error: `요청 시간 초과` };
      }
      return { ok: false, error: `요청 실패: ${error.message}` };
    }
  }

  // 전체 영화 건수 조회 API 호출
  async getMoviesCount(filters = {}) {
    const urlPath = `/accessdata/getmoviescount`;
    const body = {
      TITLE: String(filters.title || "").trim(),
      DIRECTOR: String(filters.director || "").trim(),
      ACTOR: String(filters.actor || "").trim(),
      RELEASE_START: String(filters.releaseStart || "").trim(),
      RELEASE_END: String(filters.releaseEnd || "").trim(),
    };

    try {
      const response = await this.apiClient.post(urlPath, body);
      const respJson = response.data;

      let total = 0;
      if (respJson && typeof respJson === "object") {
        total = parseInt(respJson?.datacount ?? respJson?.datalist ?? 0, 10);
        if (isNaN(total)) total = 0;
      }
      
      return { ok: true, apiUrl: `${this.backendUrl}${urlPath}`, statusCode: response.status, totalCount: total };
    } catch (error) {
      if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
        return { ok: false, error: `요청 시간 초과` };
      }
      return { ok: false, error: `요청 실패: ${error.message}` };
    }
  }

  // 신규 영화 정보 등록 API 호출
  async createMovie(title, releaseDate, docId = "", director = "", genre = "", posterUrl = "", actor = "", userId = "") {
    const urlPath = `/accessdata/createmovie`;
    const body = {
      docid: docId,
      title: title,
      releaseDate: releaseDate,
      directorNm: director,
      genre: genre,
      posterUrl: posterUrl,
      actorNm: actor,
      userId: userId,
    };
    return this._postData(urlPath, body, "영화 등록 실패");
  }

  // 기존 영화 정보 수정 API 호출
  async updateMovie(movieIdx, title, releaseDate, director = "", actor = "", genre = "", posterUrl = "", userId = "") {
    const urlPath = `/accessdata/updatemovie`;
    const body = {
      movieId: movieIdx,
      title: title,
      releaseDate: releaseDate,
      directorNm: director,
      actorNm: actor,
      genre: genre,
      posterUrl: posterUrl,
      userId: userId,
    };
    return this._postData(urlPath, body, "영화 수정 실패");
  }

  // 영화 삭제 API 호출
  async deleteMovie(movieIdx, userId = "") {
    const urlPath = `/accessdata/deletemovie`;
    return this._postData(urlPath, { movieId: movieIdx, userId }, "영화 삭제 실패");
  }

  // 신규 리뷰 및 감성 분석 요청 API 호출
  async createReview(movieIdx, author, content, userId = "") {
    const urlPath = `/accessdata/createreview`;
    const body = { movieId: movieIdx, authorName: author, content, userId };
    return this._postData(urlPath, body, "리뷰 등록 실패");
  }

  // 특정 영화에 대한 리뷰 목록 조회 API 호출
  async getReviews(movieIdx) {
    const urlPath = `/accessdata/getreviews`;
    const result = await this._postData(urlPath, { movieId: movieIdx }, "리뷰 목록 조회 실패");
    if (result.ok) {
      result.rows = this._normalizeDataList(result.data);
    }
    return result;
  }

  // 전체 리뷰 통합 조회 API 호출
  async getAllReviews(count = 10, start = 0, filters = {}) {
    const urlPath = `/accessdata/getallreviews`;
    const body = {
      COUNT: String(count),
      START: String(start),
      MOVIE_TITLE: String(filters.movieTitle || "").trim(),
      AUTHOR_NAME: String(filters.authorName || "").trim(),
      CONTENT: String(filters.content || "").trim(),
      SENTIMENT_LABEL: String(filters.sentimentLabel || "").trim(),
      SENTIMENT_SCORE: String(filters.sentimentScore || "").trim(),
      CREATED_START: String(filters.createdStart || "").trim(),
      CREATED_END: String(filters.createdEnd || "").trim(),
    };
    
    const result = await this._postData(urlPath, body, "전체 리뷰 목록 조회 실패");
    if (result.ok) {
      result.rows = this._normalizeDataList(result.data);
    }
    return result;
  }

  // 전체 리뷰 총 건수 조회 API 호출
  async getAllReviewsCount(filters = {}) {
    const urlPath = `/accessdata/getallreviewscount`;
    const body = {
      MOVIE_TITLE: String(filters.movieTitle || "").trim(),
      AUTHOR_NAME: String(filters.authorName || "").trim(),
      CONTENT: String(filters.content || "").trim(),
      SENTIMENT_LABEL: String(filters.sentimentLabel || "").trim(),
      SENTIMENT_SCORE: String(filters.sentimentScore || "").trim(),
      CREATED_START: String(filters.createdStart || "").trim(),
      CREATED_END: String(filters.createdEnd || "").trim(),
    };

    try {
      const response = await this.apiClient.post(urlPath, body);
      const respJson = response.data;

      let total = 0;
      if (respJson && typeof respJson === "object") {
        total = parseInt(respJson?.datacount ?? respJson?.datalist ?? 0, 10);
        if (isNaN(total)) total = 0;
      }
      
      return { ok: true, apiUrl: `${this.backendUrl}${urlPath}`, statusCode: response.status, totalCount: total };
    } catch (error) {
      if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
        return { ok: false, error: `요청 시간 초과` };
      }
      return { ok: false, error: `요청 실패: ${error.message}` };
    }
  }

  // 리뷰 삭제 API 호출
  async deleteReview(reviewIdx, userId = "") {
    const urlPath = `/accessdata/deletereview`;
    return this._postData(urlPath, { reviewId: reviewIdx, userId }, "리뷰 삭제 실패");
  }

  // 이미지 생성 API URL 반환 (GET 방식, 결과는 이미지 파일)
  getImageGenerateUrl(prompt) {
    const IMAGE_GEN_BASE_URL = 'https://gen-proj.duckdns.org/addhelper';
    return `${IMAGE_GEN_BASE_URL}/accessdata/generate?prompt=${encodeURIComponent(prompt)}`;
  }
}

// 하나의 인스턴스(싱글톤)로 생성하여 여러 곳에서 편하게 사용할 수 있도록 export 합니다.
export const miireboxApi = new CallApi();
export default CallApi;
