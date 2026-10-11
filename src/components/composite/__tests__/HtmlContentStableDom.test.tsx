/**
 * HtmlContent — 같은 HTML 이면 본문 DOM 을 다시 쓰지 않는다.
 *
 * React 19 는 dangerouslySetInnerHTML 객체가 바뀌면(문자열이 같아도) innerHTML 을 다시 넣는다.
 * 렌더마다 새 객체를 넘기던 때는 같은 화면의 다른 상태(댓글 입력 등)가 바뀌어 다시 렌더될 때마다
 * 본문이 원문 HTML 로 되돌아가, 다른 확장이 본문 위에 그린 링크 카드가 풀렸다가 다시 그려졌다.
 */
import React, { useState } from 'react';
import { describe, it, expect } from 'vitest';
import { render, act } from '@testing-library/react';
import { HtmlContent } from '../HtmlContent';

const HTML = '<p><a href="https://example.com/">https://example.com/</a></p>';

function setup(initial: { content: string; isHtml?: boolean }) {
  let update: (next: Partial<{ content: string; isHtml: boolean; tick: number }>) => void = () => {};
  function Parent() {
    const [s, setS] = useState({ content: initial.content, isHtml: initial.isHtml ?? true, tick: 0 });
    update = (next) => setS((prev) => ({ ...prev, ...next }));
    // purifyConfig 는 레이아웃 식처럼 렌더마다 새 객체로 넘긴다.
    return (
      <div data-tick={s.tick}>
        <HtmlContent content={s.content} isHtml={s.isHtml} purifyConfig={{ ADD_ATTR: ['target'] }} />
      </div>
    );
  }
  const utils = render(<Parent />);
  return { ...utils, update: (next: Parameters<typeof update>[0]) => act(() => update(next)) };
}

describe('HtmlContent 본문 DOM 유지', () => {
  it('같은 HTML 로 다시 렌더되면 본문 노드를 바꾸지 않는다', () => {
    const { container, update } = setup({ content: HTML });
    // happy-dom 의 정화 결과는 브라우저와 달리 <p> 를 떨어뜨린다(README 「알려진 실패」) — 남는 <a> 로 본다
    const a = container.querySelector('a') as HTMLElement;
    expect(a).not.toBeNull();
    // 다른 확장이 본문 위에 화면 처리를 한 것처럼 표식을 단다
    a.setAttribute('data-ext-mark', '1');

    for (let i = 1; i <= 3; i++) update({ tick: i });

    expect(container.querySelector('a')).toBe(a);
    expect(container.querySelector('[data-ext-mark]')).not.toBeNull();
  });

  it('HTML 이 바뀌면 새 HTML 로 다시 그린다', () => {
    const { container, update } = setup({ content: HTML });
    update({ content: '<p>changed</p>' });
    expect(container.querySelector('a')).toBeNull();
    expect(container.textContent).toContain('changed');
  });

  it('빈 값·HTML·텍스트 모드를 오가도 오류 없이 그린다', () => {
    const { container, update } = setup({ content: '' });
    expect(container.querySelector('[data-tick] > *')).toBeNull();
    update({ content: HTML });
    expect(container.querySelector('a')).not.toBeNull();
    update({ isHtml: false });
    expect(container.querySelector('a')).toBeNull();
    expect(container.textContent).toContain('<p>');
    update({ content: '' });
    expect(container.textContent).toBe('');
  });
});
