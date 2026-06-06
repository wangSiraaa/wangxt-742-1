import { useCallback, useEffect } from 'react';

export const ANCHOR_IDS = {
  RECOMMEND_LIST: 'recommend-list',
  RECOMMEND_DETAIL: 'recommend-detail',
  EMPTY_STATE: 'empty-state',
} as const;

export type AnchorId = typeof ANCHOR_IDS[keyof typeof ANCHOR_IDS];

export function useScrollAnchor() {
  const scrollToAnchor = useCallback((anchorId: AnchorId, offset = 80) => {
    const element = document.getElementById(anchorId);
    if (element) {
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });

      history.replaceState(null, '', `#${anchorId}`);
    }
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
    history.replaceState(null, '', window.location.pathname);
  }, []);

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      setTimeout(() => {
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, []);

  return { scrollToAnchor, scrollToTop, ANCHOR_IDS };
}
