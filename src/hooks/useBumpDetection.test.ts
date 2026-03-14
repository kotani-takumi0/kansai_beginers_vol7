// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBumpDetection } from './useBumpDetection';

// DeviceMotionEvent のモック
const createMockDeviceMotionEvent = () => {
  const listeners = new Map<string, EventListener>();

  const mockAddEventListener = vi.fn(
    (type: string, listener: EventListener) => {
      listeners.set(type, listener);
    }
  );

  const mockRemoveEventListener = vi.fn(
    (type: string, _listener: EventListener) => {
      listeners.delete(type);
    }
  );

  return {
    listeners,
    mockAddEventListener,
    mockRemoveEventListener,
  };
};

const fireDeviceMotionEvent = (
  listeners: Map<string, EventListener>,
  acceleration: { x: number; y: number; z: number }
) => {
  const listener = listeners.get('devicemotion');
  if (listener) {
    const event = {
      accelerationIncludingGravity: acceleration,
    } as unknown as Event;
    listener(event);
  }
};

describe('useBumpDetection', () => {
  let mockEventSetup: ReturnType<typeof createMockDeviceMotionEvent>;

  beforeEach(() => {
    vi.useFakeTimers();
    mockEventSetup = createMockDeviceMotionEvent();

    // DeviceMotionEvent をグローバルに定義
    Object.defineProperty(window, 'DeviceMotionEvent', {
      value: class MockDeviceMotionEvent {},
      writable: true,
      configurable: true,
    });

    vi.spyOn(window, 'addEventListener').mockImplementation(
      mockEventSetup.mockAddEventListener as unknown as typeof window.addEventListener
    );
    vi.spyOn(window, 'removeEventListener').mockImplementation(
      mockEventSetup.mockRemoveEventListener as unknown as typeof window.removeEventListener
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('isSupported', () => {
    it('DeviceMotionEvent が存在する場合、isSupported が true を返す', () => {
      const onBump = vi.fn();
      const { result } = renderHook(() =>
        useBumpDetection({ threshold: 15, debounceMs: 500, onBump })
      );

      expect(result.current.isSupported).toBe(true);
    });

    it('DeviceMotionEvent が存在しない場合、isSupported が false を返す', () => {
      // DeviceMotionEvent を削除
      Object.defineProperty(window, 'DeviceMotionEvent', {
        value: undefined,
        writable: true,
        configurable: true,
      });

      const onBump = vi.fn();
      const { result } = renderHook(() =>
        useBumpDetection({ threshold: 15, debounceMs: 500, onBump })
      );

      expect(result.current.isSupported).toBe(false);
    });
  });

  describe('permissionState', () => {
    it('初期状態では permissionState が "prompt" を返す', () => {
      const onBump = vi.fn();
      const { result } = renderHook(() =>
        useBumpDetection({ threshold: 15, debounceMs: 500, onBump })
      );

      expect(result.current.permissionState).toBe('prompt');
    });

    it('requestPermission が iOS で "granted" を返した場合、permissionState を更新する', async () => {
      // iOS Safari の requestPermission をモック
      const MockDeviceMotionEvent = class {} as unknown as {
        requestPermission: () => Promise<string>;
      };
      MockDeviceMotionEvent.requestPermission = vi.fn().mockResolvedValue('granted');
      Object.defineProperty(window, 'DeviceMotionEvent', {
        value: MockDeviceMotionEvent,
        writable: true,
        configurable: true,
      });

      const onBump = vi.fn();
      const { result } = renderHook(() =>
        useBumpDetection({ threshold: 15, debounceMs: 500, onBump })
      );

      let granted: boolean | undefined;
      await act(async () => {
        granted = await result.current.requestPermission();
      });

      expect(granted).toBe(true);
      expect(result.current.permissionState).toBe('granted');
    });

    it('requestPermission が "denied" を返した場合、permissionState を "denied" に更新する', async () => {
      const MockDeviceMotionEvent = class {} as unknown as {
        requestPermission: () => Promise<string>;
      };
      MockDeviceMotionEvent.requestPermission = vi.fn().mockResolvedValue('denied');
      Object.defineProperty(window, 'DeviceMotionEvent', {
        value: MockDeviceMotionEvent,
        writable: true,
        configurable: true,
      });

      const onBump = vi.fn();
      const { result } = renderHook(() =>
        useBumpDetection({ threshold: 15, debounceMs: 500, onBump })
      );

      let granted: boolean | undefined;
      await act(async () => {
        granted = await result.current.requestPermission();
      });

      expect(granted).toBe(false);
      expect(result.current.permissionState).toBe('denied');
    });

    it('requestPermission が不要な環境（Android等）では即座に "granted" を返す', async () => {
      // requestPermission メソッドなし
      Object.defineProperty(window, 'DeviceMotionEvent', {
        value: class {},
        writable: true,
        configurable: true,
      });

      const onBump = vi.fn();
      const { result } = renderHook(() =>
        useBumpDetection({ threshold: 15, debounceMs: 500, onBump })
      );

      let granted: boolean | undefined;
      await act(async () => {
        granted = await result.current.requestPermission();
      });

      expect(granted).toBe(true);
      expect(result.current.permissionState).toBe('granted');
    });
  });

  describe('startListening / stopListening', () => {
    it('startListening で isListening が true になる', () => {
      const onBump = vi.fn();
      const { result } = renderHook(() =>
        useBumpDetection({ threshold: 15, debounceMs: 500, onBump })
      );

      expect(result.current.isListening).toBe(false);

      act(() => {
        result.current.startListening();
      });

      expect(result.current.isListening).toBe(true);
      expect(mockEventSetup.mockAddEventListener).toHaveBeenCalledWith(
        'devicemotion',
        expect.any(Function)
      );
    });

    it('stopListening で isListening が false になる', () => {
      const onBump = vi.fn();
      const { result } = renderHook(() =>
        useBumpDetection({ threshold: 15, debounceMs: 500, onBump })
      );

      act(() => {
        result.current.startListening();
      });
      expect(result.current.isListening).toBe(true);

      act(() => {
        result.current.stopListening();
      });
      expect(result.current.isListening).toBe(false);
      expect(mockEventSetup.mockRemoveEventListener).toHaveBeenCalledWith(
        'devicemotion',
        expect.any(Function)
      );
    });

    it('デバイス未対応の場合、startListening しても isListening が false のまま', () => {
      Object.defineProperty(window, 'DeviceMotionEvent', {
        value: undefined,
        writable: true,
        configurable: true,
      });

      const onBump = vi.fn();
      const { result } = renderHook(() =>
        useBumpDetection({ threshold: 15, debounceMs: 500, onBump })
      );

      act(() => {
        result.current.startListening();
      });

      expect(result.current.isListening).toBe(false);
    });
  });

  describe('bump 検知', () => {
    it('加速度が閾値を超えた場合、onBump コールバックが呼ばれる', () => {
      const onBump = vi.fn();
      const { result } = renderHook(() =>
        useBumpDetection({ threshold: 15, debounceMs: 500, onBump })
      );

      act(() => {
        result.current.startListening();
      });

      // 閾値超え: sqrt(10^2 + 10^2 + 10^2) = 17.32 > 15
      act(() => {
        fireDeviceMotionEvent(mockEventSetup.listeners, {
          x: 10,
          y: 10,
          z: 10,
        });
      });

      expect(onBump).toHaveBeenCalledTimes(1);
    });

    it('加速度が閾値以下の場合、onBump コールバックが呼ばれない', () => {
      const onBump = vi.fn();
      const { result } = renderHook(() =>
        useBumpDetection({ threshold: 15, debounceMs: 500, onBump })
      );

      act(() => {
        result.current.startListening();
      });

      // 閾値以下: sqrt(5^2 + 5^2 + 5^2) = 8.66 < 15
      act(() => {
        fireDeviceMotionEvent(mockEventSetup.listeners, {
          x: 5,
          y: 5,
          z: 5,
        });
      });

      expect(onBump).not.toHaveBeenCalled();
    });

    it('accelerationIncludingGravity が null の場合、onBump は呼ばれない', () => {
      const onBump = vi.fn();
      const { result } = renderHook(() =>
        useBumpDetection({ threshold: 15, debounceMs: 500, onBump })
      );

      act(() => {
        result.current.startListening();
      });

      // null の加速度データ
      const listener = mockEventSetup.listeners.get('devicemotion');
      if (listener) {
        act(() => {
          listener({
            accelerationIncludingGravity: null,
          } as unknown as Event);
        });
      }

      expect(onBump).not.toHaveBeenCalled();
    });
  });

  describe('デバウンス', () => {
    it('デバウンス期間内の連続 bump は1回のみコールバックが呼ばれる', () => {
      const onBump = vi.fn();
      const { result } = renderHook(() =>
        useBumpDetection({ threshold: 15, debounceMs: 500, onBump })
      );

      act(() => {
        result.current.startListening();
      });

      const strongShake = { x: 10, y: 10, z: 10 };

      // 1回目: 検知される
      act(() => {
        fireDeviceMotionEvent(mockEventSetup.listeners, strongShake);
      });
      expect(onBump).toHaveBeenCalledTimes(1);

      // 100ms 後: デバウンス内なので無視
      act(() => {
        vi.advanceTimersByTime(100);
        fireDeviceMotionEvent(mockEventSetup.listeners, strongShake);
      });
      expect(onBump).toHaveBeenCalledTimes(1);

      // 200ms 後（合計300ms）: まだデバウンス内
      act(() => {
        vi.advanceTimersByTime(200);
        fireDeviceMotionEvent(mockEventSetup.listeners, strongShake);
      });
      expect(onBump).toHaveBeenCalledTimes(1);
    });

    it('デバウンス期間経過後は再度 bump を検知する', () => {
      const onBump = vi.fn();
      const { result } = renderHook(() =>
        useBumpDetection({ threshold: 15, debounceMs: 500, onBump })
      );

      act(() => {
        result.current.startListening();
      });

      const strongShake = { x: 10, y: 10, z: 10 };

      // 1回目
      act(() => {
        fireDeviceMotionEvent(mockEventSetup.listeners, strongShake);
      });
      expect(onBump).toHaveBeenCalledTimes(1);

      // 500ms 経過後: 再検知される
      act(() => {
        vi.advanceTimersByTime(500);
        fireDeviceMotionEvent(mockEventSetup.listeners, strongShake);
      });
      expect(onBump).toHaveBeenCalledTimes(2);
    });
  });

  describe('クリーンアップ', () => {
    it('アンマウント時にイベントリスナーが削除される', () => {
      const onBump = vi.fn();
      const { result, unmount } = renderHook(() =>
        useBumpDetection({ threshold: 15, debounceMs: 500, onBump })
      );

      act(() => {
        result.current.startListening();
      });

      unmount();

      expect(mockEventSetup.mockRemoveEventListener).toHaveBeenCalledWith(
        'devicemotion',
        expect.any(Function)
      );
    });
  });
});
