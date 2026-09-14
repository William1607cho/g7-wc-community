/**
 * @file storageHandlers.test.ts
 * @description 범용 스토리지 핸들러 테스트
 *
 * 핸들러는 ActionDispatcher의 (action, context) 시그니처를 따릅니다.
 * - action.params에서 파라미터를 읽음
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  saveToStorageHandler,
  loadFromStorageHandler,
} from '../storageHandlers';

/**
 * localStorage Mock 설정
 */
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get store() {
      return store;
    },
    reset() {
      store = {};
      this.getItem.mockClear();
      this.setItem.mockClear();
      this.removeItem.mockClear();
      this.clear.mockClear();
    },
  };
})();

describe('storageHandlers', () => {
  beforeEach(() => {
    mockLocalStorage.reset();
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('localStorage 핸들러', () => {
    it('saveToStorage가 localStorage.setItem을 호출한다', () => {
      // Given
      const action = {
        params: {
          key: 'some_key',
          value: 'some_value',
        },
      };

      // When
      saveToStorageHandler(action);

      // Then
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('some_key', 'some_value');
    });

    it('loadFromStorage가 localStorage.getItem 값을 반환한다', () => {
      // Given
      mockLocalStorage.setItem('some_key', 'stored_value');
      const action = { params: { key: 'some_key' } };

      // When
      const result = loadFromStorageHandler(action);

      // Then
      expect(result).toBe('stored_value');
    });

    it('존재하지 않는 키 조회 시 null을 반환한다', () => {
      // Given
      const action = { params: { key: 'unknown_key' } };

      // When
      const result = loadFromStorageHandler(action);

      // Then
      expect(result).toBeNull();
    });

    it('값이 없을 때 defaultValue를 반환한다', () => {
      // Given
      const action = { params: { key: 'nonexistent', defaultValue: 'fallback' } };

      // When
      const result = loadFromStorageHandler(action);

      // Then
      expect(result).toBe('fallback');
    });
  });
});
