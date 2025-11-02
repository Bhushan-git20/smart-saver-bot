/**
 * Image Optimization Utilities
 * Lazy loading and responsive image handling
 */

export class ImageOptimization {
  /**
   * Create an intersection observer for lazy loading images
   */
  static createLazyLoadObserver(
    onIntersect: (entry: IntersectionObserverEntry) => void,
    options?: IntersectionObserverInit
  ): IntersectionObserver {
    const defaultOptions: IntersectionObserverInit = {
      root: null,
      rootMargin: '50px',
      threshold: 0.01,
      ...options,
    };

    return new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          onIntersect(entry);
        }
      });
    }, defaultOptions);
  }

  /**
   * Lazy load image with loading state
   */
  static lazyLoadImage(img: HTMLImageElement): Promise<void> {
    return new Promise((resolve, reject) => {
      const src = img.dataset.src;
      if (!src) {
        reject(new Error('No data-src attribute found'));
        return;
      }

      img.onload = () => resolve();
      img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
      img.src = src;
      img.removeAttribute('data-src');
    });
  }

  /**
   * Generate responsive image srcset
   */
  static generateSrcSet(baseUrl: string, widths: number[]): string {
    return widths
      .map((width) => `${baseUrl}?w=${width} ${width}w`)
      .join(', ');
  }

  /**
   * Preload critical images
   */
  static preloadImage(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject(new Error(`Failed to preload: ${src}`));
      img.src = src;
    });
  }

  /**
   * Check if image format is supported
   */
  static supportsWebP(): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img.width === 1);
      img.onerror = () => resolve(false);
      img.src = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=';
    });
  }
}
