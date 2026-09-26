import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * 글 보기 확장 앵커 표식 (2026-09-27)
 *
 * g7-forum-addon 은 board/show 의 일곱 자리를 찾아 포럼 기능을 끼운다(위젯·잠금 안내·댓글 추천·
 * 채택 강조·답글 기본 펼침 둘·삭제 후 재조회). 1.4.0 까지는 모양(className·if 문자열·자식 위치)으로만
 * 찾아서, 모양을 바꾸면 기능이 조용히 빠졌다. 그래서 자리마다 `data-g7-anchor` 표식을 단다.
 *
 * 이 테스트는 (1) 일곱 표식이 정해진 노드에 한 번씩 있는지, (2) 옛 모양 앵커(1.4.0 호환)가
 * 그대로인지를 본다. 화면 모양은 바뀌지 않는다(속성만 더했다).
 */
describe('board/show 확장 앵커 표식', () => {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
  const load = (p: string) => JSON.parse(readFileSync(resolve(root, 'layouts/partials/board', p), 'utf8'));

  const collect = (node: unknown, out: Array<Record<string, any>> = []): Array<Record<string, any>> => {
    if (Array.isArray(node)) {
      node.forEach((n) => collect(n, out));
    } else if (node && typeof node === 'object') {
      const o = node as Record<string, any>;
      // 노드는 props 에, 액션 스텝(handler 가 있는 객체)은 스텝 자신에 표식이 있다. props 객체 자체는 세지 않는다.
      if (typeof o.props?.['data-g7-anchor'] === 'string' || (typeof o['data-g7-anchor'] === 'string' && 'handler' in o)) out.push(o);
      Object.values(o).forEach((v) => collect(v, out));
    }
    return out;
  };
  const anchorOf = (n: Record<string, any>) => n.props?.['data-g7-anchor'] ?? n['data-g7-anchor'];

  const files = {
    show: load('types/basic/show.json'),
    input: load('show/_comment_input.json'),
    item: load('show/_comment_item.json'),
    section: load('show/_comment_section.json'),
    del: load('show/modals/_modal_delete.json'),
  };
  const all = Object.values(files).flatMap((f) => collect(f));
  const one = (name: string) => {
    const found = all.filter((n) => anchorOf(n) === name);
    expect(found, name).toHaveLength(1);
    return found[0];
  };

  it('일곱 표식이 한 번씩만 있다', () => {
    expect(all.map(anchorOf).sort()).toEqual([
      'comment-body', 'comment-delete-refetch', 'comment-input', 'comment-replies-row',
      'comment-replies-toggle', 'comment-row', 'post-actions',
    ]);
  });

  it('표식이 맞는 노드에 붙어 있고 1.4.0 모양 앵커도 남아 있다', () => {
    const actions = one('post-actions');
    expect(actions.props.className).toContain('justify-end');
    expect(actions.if).toContain('is_guest_post');

    const input = one('comment-input');
    expect(input.props.className).toContain('p-4');
    expect(input.if).toContain('can_write_comments');

    const row = one('comment-row');
    expect(row).toBe(files.item);
    expect(row.props.className).toBe('flex gap-3 p-4 rounded-lg');

    const body = one('comment-body');
    expect(body.name).toBe('P');
    expect(body.text).toBe('{{comment?.content}}');
    expect(body.if).toContain('is_cascade_deleted');

    const repliesRow = one('comment-replies-row');
    expect(repliesRow.if).toContain('_local.collapsedReplies?.[$computed.commentRootMap?.[comment?.id]] === false');

    const toggle = one('comment-replies-toggle');
    expect(toggle.name).toBe('Button');
    expect(toggle.actions[0].params.collapsedReplies).toContain('?? true');
    expect(toggle.children[0].name).toBe('Icon');
    expect(toggle.children[1].props.className).toBe('sr-only');

    const step = one('comment-delete-refetch');
    expect(step.handler).toBe('refetchDataSource');
    expect(step.params.dataSourceId).toBe('post');
    expect(step.if).toContain("deleteModal.type === 'comment'");
  });
});
