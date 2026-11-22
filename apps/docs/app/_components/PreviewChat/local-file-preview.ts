export function fileKind(file: File) {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type === 'application/pdf' || /\.pdf$/i.test(file.name)) return 'pdf';
  if (/\.docx$/i.test(file.name)) return 'docx';
  if (file.type.startsWith('text/') || /\.(txt|md|csv|json|log)$/i.test(file.name)) return 'text';
  return 'other';
}

type DocumentPreview = { thumbnail?: Blob; text?: string };
const previews = new WeakMap<File, Promise<DocumentPreview>>();

async function readDocument(file: File): Promise<DocumentPreview> {
  switch (fileKind(file)) {
    case 'pdf': {
      const pdfjs = await import('pdfjs-dist');
      pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).href;
      const task = pdfjs.getDocument({ data: await file.arrayBuffer() });
      try {
        const page = await (await task.promise).getPage(1);
        const natural = page.getViewport({ scale: 1 });
        const viewport = page.getViewport({ scale: 360 / Math.max(natural.width, natural.height) });
        const canvas = document.createElement('canvas');
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        await page.render({ canvas, viewport }).promise;
        const thumbnail = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve));
        return { thumbnail: thumbnail ?? undefined };
      } finally {
        await task.destroy();
      }
    }
    case 'docx': {
      const { unzipSync, strFromU8 } = await import('fflate');
      const entry = 'word/document.xml';
      const xml = unzipSync(new Uint8Array(await file.arrayBuffer()), {
        filter: part => part.name === entry && part.originalSize <= 12 * 1024 * 1024,
      })[entry];
      if (!xml) return {};
      const doc = new DOMParser().parseFromString(strFromU8(xml), 'application/xml');
      const paragraphs = Array.from(doc.getElementsByTagNameNS('*', 'p'), p =>
        Array.from(p.getElementsByTagNameNS('*', 't'), t => t.textContent).join(''));
      return paragraphs.length ? { text: paragraphs.join('\n') } : {};
    }
    case 'text': return { text: await file.text() };
    default: return {};
  }
}

export function documentPreview(file: File) {
  let pending = previews.get(file);
  if (!pending) {
    pending = readDocument(file).catch((): DocumentPreview => ({}));
    previews.set(file, pending);
  }
  return pending;
}
