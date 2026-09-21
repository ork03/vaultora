import { useEffect } from "react";
import { AUTO_LOCK_MS } from "../utils/constants";
export function useAutoLock(onLock, enabled = true) {
  useEffect(() => {
    if (!enabled) return undefined;
    let timer;
    const reset = () => {
      clearTimeout(timer);
      timer = setTimeout(onLock, AUTO_LOCK_MS);
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") reset();
      else clearTimeout(timer);
    };
    ["pointerdown", "keydown", "touchstart"].forEach((e) =>
      window.addEventListener(e, reset, { passive: true })
    );
    document.addEventListener("visibilitychange", onVisibility);
    reset();
    return () => {
      clearTimeout(timer);
      ["pointerdown", "keydown", "touchstart"].forEach((e) =>
        window.removeEventListener(e, reset)
      );
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [onLock, enabled]);
}
