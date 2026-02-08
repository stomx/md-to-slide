/**
 * Markdown 슬라이드 구분자
 *
 * reveal.js 표준 구분자 규칙:
 * - `---` (3개 대시): 수평 슬라이드 구분
 * - `-----` (5개 대시): 수직 슬라이드 구분
 */

/**
 * 수평 슬라이드 구분자 정규식
 *
 * 매칭: 줄 시작 + `---` + 줄 끝
 */
export const HORIZONTAL_SEPARATOR = /^\r?\n---\r?\n$/m

/**
 * 수직 슬라이드 구분자 정규식
 *
 * 매칭: 줄 시작 + `-----` + 줄 끝
 */
export const VERTICAL_SEPARATOR = /^\r?\n-----\r?\n$/m

/**
 * 구분자 문자열 (사용자 입력용)
 */
/**
 * 발표자 노트 구분자 정규식
 *
 * 매칭: `note:` 또는 `notes:`
 */
export const NOTES_SEPARATOR = /^notes?:/i

export const SEPARATOR_STRINGS = {
  horizontal: '\n---\n',
  vertical: '\n-----\n',
} as const
