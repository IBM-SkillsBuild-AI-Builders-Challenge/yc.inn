import { useRef, useEffect, useCallback } from "react";

export function useAutoResizeTextarea(minHeight = 44) {
  const textareaRef = useRef(null);

  const resize = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    const newHeight = Math.max(minHeight, textarea.scrollHeight);
    textarea.style.height = `${newHeight}px`;
  }, [minHeight]);

  useEffect(() => {
    resize();
  }, [resize]);

  return { textareaRef, resize };
}
