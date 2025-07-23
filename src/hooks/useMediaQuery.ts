import { useEffect, useState } from 'react';

/**
 * useMediaQuery - React hook to listen to a media query and return a boolean
 * indicating whether the query currently matches.
 *
 * @param query CSS media query string e.g. '(min-width: 1280px)'
 * @returns boolean - true if query matches, false otherwise
 */
export function useMediaQuery(query: string): boolean {
  const getMatches = (q: string): boolean => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(q).matches;
  };

  const [matches, setMatches] = useState<boolean>(getMatches(query));

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);
    const listener = (event: MediaQueryListEvent) => setMatches(event.matches);

    // Safari < 14 compatibility: addEventListener may not exist
    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener('change', listener);
    } else {
      mediaQueryList.addListener(listener);
    }

    // Update immediately in case of fast client-side resizes
    setMatches(mediaQueryList.matches);

    return () => {
      if (mediaQueryList.removeEventListener) {
        mediaQueryList.removeEventListener('change', listener);
      } else {
        mediaQueryList.removeListener(listener);
      }
    };
  }, [query]);

  return matches;
}
