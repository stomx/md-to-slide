# change-llm-provider Planning Document

> **Summary**: LLM Provider를 Anthropic Claude에서 OpenAI GPT로 변경
>
> **Project**: md-to-slides
> **Version**: 0.3.0
> **Author**: ax
> **Date**: 2026-02-09
> **Status**: Draft

---

## 1. Overview

### 1.1 Purpose

현재 Anthropic Claude Sonnet 4.5를 사용하는 AI 슬라이드 생성 파이프라인을 OpenAI GPT-4o로 교체한다. 사용자가 OpenAI API 키만 보유하고 있으므로, 동일한 2+2 하이브리드 파이프라인 아키텍처를 유지하면서 LLM Provider만 변경한다.

### 1.2 Background

- 사용자가 Anthropic API 키 없이 OpenAI API 키만 보유
- 기존 2+2 하이브리드 파이프라인 (Plan + Generate) 구조는 유지
- SSE 스트리밍 기반 실시간 마크다운 전달 방식 유지
- UI 컴포넌트, Wizard 흐름, 상태관리는 변경 없음

### 1.3 Related Documents

- 아카이브: `docs/archive/2026-02/md-to-slide-core/`
- 기존 설계: apply-gen-ai-feature PDCA 사이클 (100% match)

---

## 2. Scope

### 2.1 In Scope

- [x] `@anthropic-ai/sdk` 제거, `openai` 패키지 설치
- [x] 환경변수 변경 (`ANTHROPIC_API_KEY` → `OPENAI_API_KEY`, `AI_MODEL` 기본값 변경)
- [x] `src/lib/ai/pipeline.ts` - Anthropic SDK 호출을 OpenAI SDK 호출로 교체
- [x] `src/app/api/ai/generate/route.ts` - API 라우트에서 SDK 초기화 변경
- [x] `src/lib/ai/errorHandler.ts` - OpenAI 에러 코드에 맞게 수정
- [x] `.env.example` 업데이트

### 2.2 Out of Scope

- UI 컴포넌트 변경 (AIWizardPanel, Step1~4)
- Wizard 흐름 및 상태관리 (ai-wizard-store)
- SSE 이벤트 타입 및 클라이언트 Hook (useAIGenerate)
- 프롬프트 내용 변경 (prompts.ts의 시스템 프롬프트 텍스트)
- reveal.js 마크다운 생성 규칙
- PPTX 내보내기 기능

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | OpenAI SDK(`openai`)로 Planning API 호출 (JSON 모드) | High | Pending |
| FR-02 | OpenAI SDK로 Generation 스트리밍 호출 | High | Pending |
| FR-03 | SSE 이벤트 형식 동일하게 유지 (md_delta, slide_complete 등) | High | Pending |
| FR-04 | Planning 단계에서 `response_format: { type: "json_object" }` 적용 | High | Pending |
| FR-05 | 환경변수 `OPENAI_API_KEY`로 인증 | High | Pending |
| FR-06 | 기존 에러 복구 전략 유지 (재시도, rate limit 대응) | Medium | Pending |
| FR-07 | 토큰 사용량 추적 유지 (`stream_options: { include_usage: true }`) | Medium | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement Method |
|----------|----------|-------------------|
| Performance | Planning 응답 < 10초 | 수동 테스트 |
| Performance | Generation 스트리밍 첫 토큰 < 3초 | 수동 테스트 |
| Compatibility | 기존 SSE 이벤트 형식 100% 호환 | 클라이언트 Hook 동작 확인 |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [ ] OpenAI SDK로 Planning 호출 성공 (JSON 아웃라인 반환)
- [ ] OpenAI SDK로 Generation 스트리밍 성공 (reveal.js 마크다운)
- [ ] 기존 UI Wizard 4단계 흐름 정상 동작
- [ ] 에러 처리 (rate limit, network error) 정상 동작
- [ ] `.env.example` 업데이트 완료
- [ ] 빌드 성공 (TypeScript 에러 없음)

### 4.2 Quality Criteria

- [ ] TypeScript 타입 에러 0개
- [ ] 빌드 성공
- [ ] 기존 SSE 이벤트 타입 호환성 유지

---

## 5. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| OpenAI 모델의 프롬프트 응답 품질 차이 | Medium | Medium | 프롬프트 미세 조정으로 대응 |
| JSON 모드에서 스키마 불일치 | Medium | Low | `response_format: json_object` + 프롬프트에 스키마 명시 |
| 스트리밍 청크 형식 차이 | High | Low | delta.content 필드 매핑으로 해결 |
| Prompt Caching 기능 부재 | Low | High | OpenAI는 자동 캐싱 지원, 별도 설정 불필요 |
| rate limit 에러 코드 차이 | Medium | Medium | OpenAI 에러 코드(429)에 맞게 errorHandler 수정 |

---

## 6. Architecture Considerations

### 6.1 Project Level Selection

| Level | Characteristics | Recommended For | Selected |
|-------|-----------------|-----------------|:--------:|
| **Starter** | Simple structure (`components/`, `lib/`, `types/`) | Static sites, portfolios, landing pages | x |
| **Dynamic** | Feature-based modules, services layer | Web apps with backend, SaaS MVPs | |
| **Enterprise** | Strict layer separation, DI, microservices | High-traffic systems, complex architectures | |

### 6.2 Key Architectural Decisions

| Decision | Options | Selected | Rationale |
|----------|---------|----------|-----------|
| LLM SDK | openai | openai | 사용자가 OpenAI 키만 보유 |
| 모델 | gpt-4o / gpt-4o-mini | gpt-4o | 품질 우선, Claude Sonnet 4.5 대비 동등 수준 |
| JSON 출력 | response_format / 프롬프트 유도 | response_format: json_object | 안정적 JSON 파싱 보장 |
| 스트리밍 | for await 이터레이터 | for await | OpenAI SDK 네이티브 방식 |
| 파이프라인 구조 | 2+2 하이브리드 유지 | 유지 | 검증된 아키텍처, 변경 불필요 |

### 6.3 변경 대상 파일 맵

```
변경 필요:
├── package.json                          # SDK 교체
├── .env.example                          # 환경변수 변경
├── src/lib/ai/pipeline.ts                # 핵심: API 호출 로직
├── src/app/api/ai/generate/route.ts      # SDK 초기화
└── src/lib/ai/errorHandler.ts            # 에러 코드 매핑

변경 불필요:
├── src/lib/ai/prompts.ts                 # 프롬프트 텍스트 유지
├── src/lib/ai/streamHelpers.ts           # SSE 헬퍼 유지
├── src/hooks/useAIGenerate.ts            # 클라이언트 Hook 유지
├── src/store/ai-wizard-store.ts          # 상태관리 유지
├── src/types/ai.types.ts                 # 타입 정의 유지
└── src/components/ai-wizard/*            # UI 컴포넌트 유지
```

---

## 7. Convention Prerequisites

### 7.1 Existing Project Conventions

- [x] `CLAUDE.md` has coding conventions section
- [x] `docs/01-plan/conventions.md` exists (Phase 2 output)
- [x] TypeScript configuration (`tsconfig.json`)

### 7.2 Conventions to Define/Verify

| Category | Current State | To Define | Priority |
|----------|---------------|-----------|:--------:|
| **Naming** | exists | 변경 없음 | - |
| **Folder structure** | exists | 변경 없음 | - |
| **Environment variables** | exists | OPENAI_API_KEY 추가 | High |
| **Error handling** | exists | OpenAI 에러 코드 매핑 | High |

### 7.3 Environment Variables Needed

| Variable | Purpose | Scope | To Be Created |
|----------|---------|-------|:-------------:|
| `OPENAI_API_KEY` | OpenAI API 인증 | Server | x |
| `AI_MODEL` | 사용할 모델 (기본값: gpt-4o) | Server | 수정 |
| `AI_MAX_TOKENS` | 최대 토큰 수 (기본값: 4000) | Server | 유지 |
| `NEXT_PUBLIC_AI_ENABLED` | AI 기능 활성화 | Client | 유지 |

---

## 8. API 매핑 상세

### 8.1 SDK 호출 매핑

| 항목 | Anthropic (현재) | OpenAI (변경) |
|------|-----------------|--------------|
| 패키지 | `@anthropic-ai/sdk` | `openai` |
| 초기화 | `new Anthropic({ apiKey })` | `new OpenAI({ apiKey })` |
| Planning 호출 | `anthropic.messages.create({ system, messages, max_tokens })` | `openai.chat.completions.create({ model, messages: [{ role: 'system', ... }, ...], max_tokens, response_format: { type: 'json_object' } })` |
| Generation 스트리밍 | `anthropic.messages.stream({ system, messages, max_tokens })` | `openai.chat.completions.create({ model, messages, max_tokens, stream: true, stream_options: { include_usage: true } })` |
| 응답 텍스트 추출 | `response.content[0].text` | `response.choices[0].message.content` |
| 스트리밍 텍스트 | `event.delta.text` (on 'text' event) | `chunk.choices[0]?.delta?.content` (for await) |
| 토큰 사용량 | `response.usage.input_tokens` / `output_tokens` | `response.usage.prompt_tokens` / `completion_tokens` |
| Prompt Caching | `cache_control: { type: 'ephemeral' }` | 자동 (별도 설정 불필요) |

### 8.2 에러 코드 매핑

| 상황 | Anthropic | OpenAI |
|------|-----------|--------|
| Rate Limit | `rate_limit_error` | HTTP 429 / `RateLimitError` |
| 인증 실패 | `authentication_error` | HTTP 401 / `AuthenticationError` |
| 서버 오류 | `api_error` | HTTP 500 / `InternalServerError` |
| 토큰 초과 | `invalid_request_error` | HTTP 400 / `BadRequestError` |

---

## 9. Next Steps

1. [ ] Design 문서 작성 (`change-llm-provider.design.md`)
2. [ ] 구현 (5개 파일 수정)
3. [ ] 수동 테스트 (Planning + Generation 스트리밍)

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-02-09 | Initial draft | ax |
