import { useEffect } from 'react';

/**
 * Custom hook to set page-specific SEO meta tags
 * Usage: usePageSEO({ title: 'Giỏ hàng', description: '...' })
 */
export default function usePageSEO({ title, description, keywords, ogImage } = {}) {
  useEffect(() => {
    // Set document title
    const baseTitle = 'EduVNU';
    document.title = title ? `${title} | ${baseTitle}` : `${baseTitle} — Nền tảng học trực tuyến hàng đầu Việt Nam`;

    // Set meta description
    if (description) {
      let meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute('content', description);
    }

    // Set meta keywords
    if (keywords) {
      let meta = document.querySelector('meta[name="keywords"]');
      if (meta) meta.setAttribute('content', keywords);
    }

    // Set OG title
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', title ? `${title} | ${baseTitle}` : baseTitle);

    // Set OG description
    if (description) {
      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.setAttribute('content', description);
    }

    // Set OG image
    if (ogImage) {
      const ogImg = document.querySelector('meta[property="og:image"]');
      if (ogImg) ogImg.setAttribute('content', ogImage);
    }

    // Cleanup: restore defaults on unmount
    return () => {
      document.title = `${baseTitle} — Nền tảng học trực tuyến hàng đầu Việt Nam`;
    };
  }, [title, description, keywords, ogImage]);
}
