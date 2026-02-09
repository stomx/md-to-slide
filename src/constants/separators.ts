/**
 * Markdown 슬라이드 구분자
 *
 * reveal.js Markdown 플러그인 표준 구분자 규칙:
 * - `---` (3개 대시): 수평 슬라이드 구분
 * - `--` (2개 대시): 수직 슬라이드 구분
 */

/**
 * 수평 슬라이드 구분자 정규식
 *
 * 매칭: 줄 시작 + `---` + 줄 끝
 */
export const HORIZONTAL_SEPARATOR = /^\n---\n$/m

/**
 * 수직 슬라이드 구분자 정규식
 *
 * 매칭: 줄 시작 + `--` + 줄 끝
 */
export const VERTICAL_SEPARATOR = /^\n--\n$/m

/**
 * 발표자 노트 구분자 정규식
 *
 * 매칭: `note:` 또는 `notes:`
 */
export const NOTES_SEPARATOR = /^notes?:/i

export const SEPARATOR_STRINGS = {
  horizontal: '\n---\n',
  vertical: '\n--\n',
} as const
