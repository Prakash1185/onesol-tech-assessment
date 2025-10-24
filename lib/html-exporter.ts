import { ElementData } from '@/types';

export class HTMLExporter {
  static generateHTML(stageContent: string): string {
    const timestamp = new Date().toISOString();
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta data-generated-by="editable-html-poster" />
    <meta data-exported-at="${timestamp}" />
    <title>Editable HTML Poster</title>
    <style>
        body { 
            margin: 0; 
            padding: 0; 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .poster-container {
            width: 720px; 
            height: 720px; 
            position: relative;
            overflow: hidden;
            margin: 0 auto;
        }
        .element-selected {
            outline: none !important;
            border: none !important;
        }
    </style>
</head>
<body>
    <div class="poster-container">
        ${stageContent}
    </div>
</body>
</html>`;
  }

  static downloadHTML(content: string, filename: string = 'poster.html'): void {
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}