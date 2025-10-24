import { ElementData } from '@/types';

export class ElementFactory {
  static createTextElement(container: HTMLElement): ElementData {
    const textElement = document.createElement('p');
    textElement.textContent = 'New Text Element';
    textElement.style.position = 'absolute';
    textElement.style.top = '50px';
    textElement.style.left = '50px';
    textElement.style.fontSize = '16px';
    textElement.style.color = '#000000';
    textElement.style.fontFamily = 'Arial, sans-serif';
    textElement.style.cursor = 'pointer';
    textElement.style.userSelect = 'none';
    
    const elementId = `text-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    textElement.id = elementId;
    
    container.appendChild(textElement);
    
    return {
      id: elementId,
      type: 'text',
      element: textElement,
      position: { x: 50, y: 50 },
      properties: {
        textContent: 'New Text Element',
        fontSize: '16px',
        color: '#000000',
        fontWeight: '400'
      }
    };
  }
  
  static createImageElement(container: HTMLElement): ElementData {
    const imageElement = document.createElement('img');
    imageElement.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150"%3E%3Crect width="200" height="150" fill="%23f0f0f0"/%3E%3Ctext x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999"%3EImage Placeholder%3C/text%3E%3C/svg%3E';
    imageElement.alt = 'New Image';
    imageElement.style.position = 'absolute';
    imageElement.style.top = '50px';
    imageElement.style.left = '250px';
    imageElement.style.width = '200px';
    imageElement.style.height = '150px';
    imageElement.style.cursor = 'pointer';
    imageElement.style.userSelect = 'none';
    imageElement.style.objectFit = 'cover';
    
    const elementId = `image-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    imageElement.id = elementId;
    
    container.appendChild(imageElement);
    
    return {
      id: elementId,
      type: 'image',
      element: imageElement,
      position: { x: 250, y: 50 },
      properties: {
        src: imageElement.src,
        alt: 'New Image',
        width: 200,
        height: 150
      }
    };
  }
}