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
      const element: ElementData = {
        id: node.id || `element-${Date.now()}-${index}`,
        type: node.tagName.toLowerCase() === 'img' ? 'image' : 'text',
        element: node as HTMLElement, // Add the actual DOM element
        position: {
          x: parseInt(getStyleValue(node, 'left')) || 0,
          y: parseInt(getStyleValue(node, 'top')) || 0
        },
        properties: {
          tagName: node.tagName.toLowerCase(),
          content: node.textContent || '',
          styles: extractStyles(node),
          attributes: extractAttributes(node)
        }
      };
      elements.push(element);
    }
    
    Array.from(node.children).forEach((child, i) => traverse(child, i));
  };
  
  Array.from(doc.body.children).forEach((child, i) => traverse(child, i));
  return elements;
}

export function extractElementsFromContainer(container: HTMLElement): ElementData[] {
  const elements: ElementData[] = [];
  const childElements = container.querySelectorAll('*');
  
  childElements.forEach((element, index) => {
    const htmlElement = element as HTMLElement;
    
    const elementData: ElementData = {
      id: htmlElement.id || `element-${Date.now()}-${index}`,
      type: htmlElement.tagName.toLowerCase() === 'img' ? 'image' : 'text',
      element: htmlElement,
      position: {
        x: parseInt(htmlElement.style.left) || 0,
        y: parseInt(htmlElement.style.top) || 0
      },
      properties: {
        tagName: htmlElement.tagName.toLowerCase(),
        content: htmlElement.textContent || '',
        src: htmlElement.tagName === 'IMG' ? (htmlElement as HTMLImageElement).src : '',
        alt: htmlElement.tagName === 'IMG' ? (htmlElement as HTMLImageElement).alt : '',
        styles: {
          fontSize: htmlElement.style.fontSize,
          color: htmlElement.style.color,
          width: htmlElement.style.width,
          height: htmlElement.style.height,
          position: htmlElement.style.position,
          left: htmlElement.style.left,
          top: htmlElement.style.top
        }
      }
    };
    
    elements.push(elementData);
  });
  
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
    const styles = el.properties?.styles || {};
    const styleStr = Object.entries(styles)
      .map(([key, value]) => `${key}: ${value}`)
      .join('; ');
    
    const attributes = el.properties?.attributes || {};
    const attrsStr = Object.entries(attributes)
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ');
    
    const style = styleStr ? `style="${styleStr}"` : '';
    const attrs = attrsStr ? attrsStr : '';
    const tagName = el.properties?.tagName || 'div';
    const content = el.properties?.content || '';
    
    if (tagName === 'img') {
      return `<${tagName} ${attrs} ${style} />`;
    } else {
      return `<${tagName} ${attrs} ${style}>${content}</${tagName}>`;
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

// Legacy class-based interface for backward compatibility
export class HTMLParser {
  static sanitize(html: string): string {
    return sanitizeHTML(html);
  }
  
  static extractElements(container: HTMLElement): ElementData[] {
    return extractElementsFromContainer(container);
  }
  
  static extractElementsFromHTML(html: string): ElementData[] {
    return extractElementsFromHTML(html);
  }
  
  static generateHTML(elements: ElementData[]): string {
    return generateHTML(elements);
  }
}