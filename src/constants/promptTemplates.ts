import type { PromptTemplate } from '@/types/ai.types'

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: 'business',
    name: '비즈니스 발표',
    description: 'IR, 사업 계획, 분기 실적 등',
    category: 'business',
    promptPrefix: '비즈니스 청중을 대상으로, 데이터와 차트 중심의 전문적인 톤으로 작성하세요.',
    examplePrompt: '2026년 1분기 실적 보고 발표자료를 만들어주세요',
  },
  {
    id: 'education',
    name: '교육/강의',
    description: '수업 자료, 세미나, 워크숍 등',
    category: 'education',
    promptPrefix: '학습자의 이해를 돕기 위해 단계적으로 설명하고, 예시와 질문을 포함하세요.',
    examplePrompt: 'Python 기초 프로그래밍 3시간 강의자료를 만들어주세요',
  },
  {
    id: 'tech',
    name: '기술 발표',
    description: '기술 소개, 아키텍처 설명, 데모 등',
    category: 'tech',
    promptPrefix: '기술 청중을 대상으로, 코드 예시와 아키텍처 다이어그램을 포함하세요.',
    examplePrompt: 'Next.js App Router 마이그레이션 가이드 발표자료를 만들어주세요',
  },
  {
    id: 'proposal',
    name: '제안서',
    description: '프로젝트 제안, 투자 제안 등',
    category: 'proposal',
    promptPrefix: '문제 → 해결책 → 기대효과 구조로 설득력 있게 작성하세요.',
    examplePrompt: '사내 AI 도입 제안서 발표자료를 만들어주세요',
  },
]
