# 코드 가독성, 유지보수성, 간결성, 일관성, 확장성, 이식성을 고려하고 코드의 중복을 피하고 모듈화/컴포넌트화/함수화 하여 작성한다.

## 1. 문서 역할

이 문서는 코딩 규칙(Convention) 문서입니다.

포함 범위:

- React 코드 작성 규칙
- 네이밍 규칙
- 변수 범위별 이름 규칙
- 컴포넌트 / 훅(Hook) / 함수 / 상태(State) 설계 기준

포함하지 않는 범위:

- 프로젝트 목적 및 배경 (READ.md에서 관리)
- 전체 시스템 구조 및 기술 세부 사항 (TECH.md에서 관리)


## 2. 개발 원칙

1) React를 사용하여 프론트엔드를 개발하며, 상태 관리 및 UI 컴포넌트의 재사용성을 극대화한다.
2) 적절한 폴더 구조를만들어서 향후에 유지보수하기 쉽게 한다.
3) backend와 frontend를 철저히 분리하여 개발하고 REST API를 통해 통신한다.

## 3. 기본 원칙

1) 한 프로젝트 안에서는 네이밍 스타일을 섞지 않는다.
2) 이 프로젝트는 다음 스타일을 기준으로 한다.

- 상수: UPPER_SNAKE_CASE (대문자 + `_`)
- 컴포넌트 / 인터페이스 / 타입: PascalCase
- 함수 / 변수 / 프로퍼티: camelCase
- 커스텀 훅(Hook): `use` + PascalCase
- 이벤트 핸들러: `handle` + 이벤트명 (예: `handleClick`) 혹은 `on` + 이벤트명 (예: `onClick`) 프로퍼티로 전달할 때.
- 파일명: 컴포넌트는 PascalCase (`MyComponent.tsx` 혹은 `MyComponent.jsx`), 일반 유틸 및 함수 파일은 camelCase (`api.ts`, `utils.js`)

3) 의미가 같은 값은 범위가 달라도 핵심 단어를 유지한다.
4) 함수/변수/컴포넌트 등에 대해서 간결한 주석을 명기한다.
5) 주요 비즈니스 로직에도 간결한 주석을 명기한다.


## 4. 폴더 구조 및 네이밍 규칙

폴더 이름은 해당 폴더가 포함하는 메인 컴포넌트나 역할에 따라 명명한다.

- 페이지 및 컴포넌트 폴더: PascalCase 사용 (내부의 메인 컴포넌트 파일명과 동일하게 작성). 예: `src/pages/InvoiceEntry/InvoiceEntry.jsx`, `src/components/Sidebar/Sidebar.jsx`
- 공통 유틸리티, 훅, 컨텍스트 등의 폴더: camelCase 또는 소문자 사용. 예: `src/hooks`, `src/utils`, `src/context`
- 각 페이지와 관련된 CSS 모듈, 테스트 파일, 하위 컴포넌트는 해당 컴포넌트 폴더 내에 위치시킨다.

예시 폴더 구조:
```
src/
  components/
    Header/
      Header.jsx
      Header.css
  pages/
    InvoiceEntry/
      InvoiceEntry.jsx
  utils/
```

## 5. 상수 규칙

상수는 모두 대문자로 쓰고, 단어 구분은 `_` 로 한다. 주로 파일 상단이나 별도의 상수 관리 파일(`constants.ts` 또는 `constants.js`)에 선언한다.

예:

```javascript
const MAX_ITEM_COUNT = 100;
const API_BASE_URL = "https://api.example.com";
const DEFAULT_THEME = "dark";
```


## 5. 컴포넌트 규칙

React 컴포넌트 이름과 파일명은 PascalCase를 사용한다. 함수형 컴포넌트 작성을 원칙으로 한다.

예 (`UserProfile.tsx` 또는 `UserProfile.jsx`):

```javascript
const UserProfile = ({ user }) => {
  return (
    <div>
      <h1>{user.name}</h1>
    </div>
  );
};

export default UserProfile;
```


## 6. 변수 및 상태(State) 규칙

일반 변수와 React 상태(State) 이름은 camelCase를 사용한다. 상태를 변경하는 함수(setter)는 `set` + StateName 형태를 취한다.

예:

```javascript
const [isLoading, setIsLoading] = useState(false);
const [userData, setUserData] = useState(null);

let totalCount = 0;
```

원칙:

- 불리언(Boolean) 변수나 상태는 `is`, `has`, `should` 등의 접두사를 사용하여 의도를 명확히 한다.
  - 좋은 예: `isVisible`, `hasError`, `shouldRender`
  - 나쁜 예: `visible`, `error`, `renderFlag`


## 7. 함수 규칙

함수 이름은 camelCase를 사용하며, 동사로 시작하여 어떤 동작을 하는지 명확히 나타낸다.

예:

```javascript
const fetchUserData = () => { ... }
const calculateTotal = (price, quantity) => { ... }
const parseDateString = (dateString) => { ... }
```


### 7.1 이벤트 핸들러 함수

이벤트를 처리하는 함수는 `handle`로 시작한다.

예:

```javascript
const handleLoginSubmit = (e) => { ... }
const handleFileChange = (e) => { ... }
```

props로 이벤트 핸들러를 전달할 때는 `on`으로 시작하는 네이밍을 사용한다.

예:

```javascript
<CustomButton onClick={handleClick} onSubmit={handleSubmit} />
```


## 8. 훅(Hook) 규칙

커스텀 훅 이름은 반드시 `use`로 시작하고, 그 뒤는 PascalCase로 작성한다.

예:

```javascript
const useFetchData = (url) => { ... }
const useWindowSize = () => { ... }
```


## 9. 파라미터 및 프로퍼티(Props) 규칙

파라미터 및 Props 변수명은 camelCase를 사용한다.

예:

```javascript
const UserCard = ({ userId, userName, profileImageUrl }) => { ... }
```

원칙:

- 약어보다 의미가 분명한 이름을 사용
- 너무 짧은 이름은 피함
- 범위보다 역할이 드러나는 이름을 우선함

좋은 예:

- `userId`
- `fetchData`
- `profileImageUrl`

나쁜 예:

- `id` (단순 id보다 userId가 명확할 때)
- `url`
- `func`


## 10. 인터페이스 및 타입(Type) 규칙 (TypeScript 사용 시)

인터페이스와 타입 별칭은 PascalCase를 사용한다. Prefix로 `I`나 `T`를 붙이지 않는 것을 권장한다.

예:

```typescript
interface UserData {
  id: string;
  name: string;
  email: string;
}

type ButtonVariant = 'primary' | 'secondary' | 'danger';
```


## 11. 이름 일관성 규칙

같은 의미의 이름은 컴포넌트나 함수가 달라도 가능한 한 같은 단어를 유지한다.

예:

- 상태: `userData`
- Props: `userData={userData}`
- 받아오는 함수: `fetchUserData`

이름이 완전히 달라지면 추적이 어려우므로, 같은 개념은 같은 핵심 단어를 반복해서 사용한다.


## 12. 예외 규칙

로컬 스토리지 키, 세션 스토리지 키, JSON 딕셔너리 키처럼 외부 시스템과 주고받는 문자열 값은 가독성과 하위/외부 호환성을 위해 snake_case나 외부에서 정의된 기존 포맷을 유지할 수 있다.

예:

- `"access_token"`
- `"refresh_token"`
- `"user_preferences"`
