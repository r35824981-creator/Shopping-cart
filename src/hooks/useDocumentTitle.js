import { useEffect } from 'react';

/**
 * Set the document title for a page.
 * @param {string} title
 */
export function useDocumentTitle(title) {
  useEffect(() => {
    const previous = document.title;
    document.title = title ? `${title} - FootWear` : 'FootWear - Sneakers, simplified';
    return () => {
      document.title = previous;
    };
  }, [title]);
}
