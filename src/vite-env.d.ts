/// <reference types="vite/client" />

declare module 'mammoth' {
  export function extractRawText(input: { arrayBuffer: ArrayBuffer }): Promise<{
    value: string
    messages: Array<{ type: string; message: string }>
  }>
}

declare module 'pdfjs-dist/build/pdf.worker.mjs?url' {
  const src: string
  export default src
}
