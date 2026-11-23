/// <reference types="vite/client" />

declare module 'jspdf' {
  export class jsPDF {
    constructor(options?: any);
    internal: {
      pageSize: {
        getWidth: () => number;
        getHeight: () => number;
      };
    };
    addImage: (...args: any[]) => void;
    addPage: () => void;
    save: (filename: string) => void;
  }
}

declare module 'html2canvas' {
  const html2canvas: (element: HTMLElement, options?: any) => Promise<HTMLCanvasElement>;
  export default html2canvas;
}
