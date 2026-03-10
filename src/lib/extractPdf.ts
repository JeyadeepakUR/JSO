/**
 * Extracts all text from a PDF File object using pdfjs-dist running entirely
 * in the browser. No server round-trip or Python process needed.
 */
export async function extractTextFromPDF(file: File): Promise<string> {
    // Guard: this must only run in the browser. Should never be called server-side.
    if (typeof window === 'undefined') {
        throw new Error('extractTextFromPDF can only be called in the browser.');
    }
    // Dynamically import pdfjs-dist only on the client side
    const pdfjsLib = await import('pdfjs-dist');

    // Point the worker at the official CDN so we don't have to bundle it.
    // This is the key fix: in a browser environment, the worker loads as a real
    // Web Worker thread so the CDN URL resolves correctly.
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
    const pdfDocument = await loadingTask.promise;

    let fullText = '';
    for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
        const page = await pdfDocument.getPage(pageNum);
        const textContent = await page.getTextContent();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\n\n';
    }

    return fullText.replace(/\n\s*\n/g, '\n\n').trim();
}
