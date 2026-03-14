import { useState, useCallback, useEffect, useRef } from 'react';

interface BumpDetectionResult {
  readonly isSupported: boolean;
  readonly permissionState: 'prompt' | 'granted' | 'denied';
  readonly isListening: boolean;
}

interface UseBumpDetectionOptions {
  readonly threshold: number;
  readonly debounceMs: number;
  readonly onBump: () => void;
}

type UseBumpDetection = (
  options: UseBumpDetectionOptions
) => BumpDetectionResult & {
  readonly requestPermission: () => Promise<boolean>;
  readonly startListening: () => void;
  readonly stopListening: () => void;
};

/** DeviceMotionEvent に iOS Safari の requestPermission が存在するかの型ガード */
interface DeviceMotionEventWithPermission {
  requestPermission: () => Promise<'granted' | 'denied' | 'prompt'>;
}

const hasRequestPermission = (
  event: unknown
): event is DeviceMotionEventWithPermission => {
  return (
    typeof event === 'function' &&
    'requestPermission' in event &&
    typeof (event as DeviceMotionEventWithPermission).requestPermission ===
      'function'
  );
};

const checkIsSupported = (): boolean => {
  return (
    typeof window !== 'undefined' &&
    typeof window.DeviceMotionEvent !== 'undefined'
  );
};

export const useBumpDetection: UseBumpDetection = ({
  threshold,
  debounceMs,
  onBump,
}) => {
  const [isSupported] = useState<boolean>(() => checkIsSupported());
  const [permissionState, setPermissionState] = useState<
    'prompt' | 'granted' | 'denied'
  >('prompt');
  const [isListening, setIsListening] = useState<boolean>(false);

  const lastBumpTimeRef = useRef<number>(0);
  const listenerRef = useRef<((event: DeviceMotionEvent) => void) | null>(null);
  const onBumpRef = useRef(onBump);
  const thresholdRef = useRef(threshold);
  const debounceMsRef = useRef(debounceMs);

  // コールバックとオプションの最新値を ref に保持
  useEffect(() => {
    onBumpRef.current = onBump;
  }, [onBump]);

  useEffect(() => {
    thresholdRef.current = threshold;
  }, [threshold]);

  useEffect(() => {
    debounceMsRef.current = debounceMs;
  }, [debounceMs]);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!checkIsSupported()) {
      return false;
    }

    // iOS Safari: DeviceMotionEvent.requestPermission() が必要
    if (hasRequestPermission(window.DeviceMotionEvent)) {
      try {
        const result = await window.DeviceMotionEvent.requestPermission();
        const state = result === 'granted' ? 'granted' : 'denied';
        setPermissionState(state);
        return state === 'granted';
      } catch {
        setPermissionState('denied');
        return false;
      }
    }

    // Android 等: パーミッション不要
    setPermissionState('granted');
    return true;
  }, []);

  const handleDeviceMotion = useCallback((event: DeviceMotionEvent): void => {
    const acceleration = event.accelerationIncludingGravity;
    if (!acceleration) {
      return;
    }

    const { x, y, z } = acceleration;
    const magnitude = Math.sqrt(
      (x ?? 0) ** 2 + (y ?? 0) ** 2 + (z ?? 0) ** 2
    );

    if (magnitude <= thresholdRef.current) {
      return;
    }

    const now = Date.now();
    if (now - lastBumpTimeRef.current < debounceMsRef.current) {
      return;
    }

    lastBumpTimeRef.current = now;
    onBumpRef.current();
  }, []);

  const startListening = useCallback((): void => {
    if (!checkIsSupported()) {
      return;
    }

    listenerRef.current = handleDeviceMotion;
    window.addEventListener(
      'devicemotion',
      handleDeviceMotion as EventListener
    );
    setIsListening(true);
  }, [handleDeviceMotion]);

  const stopListening = useCallback((): void => {
    if (listenerRef.current) {
      window.removeEventListener(
        'devicemotion',
        listenerRef.current as EventListener
      );
      listenerRef.current = null;
    }
    setIsListening(false);
  }, []);

  // アンマウント時のクリーンアップ
  useEffect(() => {
    return () => {
      if (listenerRef.current) {
        window.removeEventListener(
          'devicemotion',
          listenerRef.current as EventListener
        );
        listenerRef.current = null;
      }
    };
  }, []);

  return {
    isSupported,
    permissionState,
    isListening,
    requestPermission,
    startListening,
    stopListening,
  };
};
