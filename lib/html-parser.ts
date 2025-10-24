import DOMPurify from 'dompurify';
import { ElementData } from '../types';

export function sanitizeHTML(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['div', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'img', 'span', 'strong', 'em', 'br'],
    ALLOWED_ATTR: ['class', 'style', 'src', 'alt', 'width', 'height', 'id'],
  });
}

export function extractElementsFromHTML(html: string): ElementData[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const elements: ElementData[] = [];
  
  const traverse = (node: Element, index: number) => {
    if (node.nodeType === Node.ELEMENT_NODE && node.tagName !== 'HTML' && node.tagName !== 'HEAD' && node.tagName !== 'BODY') {
      const computedStyle = window.getComputedStyle ? {} : {};
      const element: ElementData = {
        id: node.id || `element-${Date.now()}-${index}`,
        type: node.tagName.toLowerCase() === 'img' ? 'image' : 'text',
        tagName: node.tagName.toLowerCase(),
        content: node.textContent || '',
        position: {
          x: parseInt(getStyleValue(node, 'left')) || 0,
          y: parseInt(getStyleValue(node, 'top')) || 0
        },
        styles: extractStyles(node),
        attributes: extractAttributes(node)
      };
      elements.push(element);
    }
    
    Array.from(node.children).forEach((child, i) => traverse(child, i));
  };
  
  Array.from(doc.body.children).forEach((child, i) => traverse(child, i));
  return elements;
}

function getStyleValue(element: Element, property: string): string {
  const style = element.getAttribute('style') || '';
  const match = style.match(new RegExp(`${property}:\\s*([^;]+)`));
  return match ? match[1].trim() : '';
}

function extractStyles(element: Element): Record<string, string> {
  const style = element.getAttribute('style') || '';
  const styles: Record<string, string> = {};
  
  style.split(';').forEach(rule => {
    const [property, value] = rule.split(':').map(s => s.trim());
    if (property && value) {
      styles[property] = value;
    }
  });
  
  return styles;
}

function extractAttributes(element: Element): Record<string, string> {
  const attrs: Record<string, string> = {};
  Array.from(element.attributes).forEach(attr => {
    if (attr.name !== 'style') {
      attrs[attr.name] = attr.value;
    }
  });
  return attrs;
}

export function generateHTML(elements: ElementData[]): string {
  const elementsHTML = elements.map(el => {
    const styleStr = Object.entries(el.styles)
      .map(([key, value]) => `${key}: ${value}`)
      .join('; ');
    
    const attrsStr = Object.entries(el.attributes)
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ');
    
    const style = styleStr ? `style="${styleStr}"` : '';
    const attrs = attrsStr ? attrsStr : '';
    
    if (el.tagName === 'img') {
      return `<${el.tagName} ${attrs} ${style} />`;
    } else {
      return `<${el.tagName} ${attrs} ${style}>${el.content}</${el.tagName}>`;
    }
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta data-generated-by="editable-html-poster" />
    <title>Editable HTML Poster</title>
    <style>
        body { margin: 0; padding: 0; font-family: sans-serif; }
        .poster-container { width: 720px; height: 720px; position: relative; overflow: hidden; margin: 0 auto; background: #f3f4f6; }
    </style>
</head>
<body>
    <div class="poster-container">
        ${elementsHTML}
    </div>
</body>
</html>`;
}