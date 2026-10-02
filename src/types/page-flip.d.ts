declare module 'page-flip' {
  export class PageFlip {
    constructor(element: HTMLElement, settings: {
      width: number; height: number; size: 'stretch'; minWidth: number; maxWidth: number;
      minHeight: number; maxHeight: number; autoSize: boolean; usePortrait: boolean;
      showCover: boolean; drawShadow: boolean; flippingTime: number;
      showPageCorners: boolean; disableFlipByClick: boolean; useMouseEvents: boolean;
      mobileScrollSupport: boolean; startPage: number;
    });
    loadFromHTML(pages: HTMLElement[]): void;
    on(event: 'flip', handler: (event: { data: number }) => void): void;
    on(event: 'changeOrientation', handler: (event: { data: 'portrait' | 'landscape' }) => void): void;
    getCurrentPageIndex(): number;
    getPageCount(): number;
    getOrientation(): 'portrait' | 'landscape';
    startUserTouch(position: { x: number; y: number }): void;
    userMove(position: { x: number; y: number }, isTouch: boolean): void;
    userStop(position: { x: number; y: number }): void;
    flipNext(corner: 'top' | 'bottom'): void;
    flipPrev(corner: 'top' | 'bottom'): void;
    turnToPage(page: number): void;
    destroy(): void;
  }
}
