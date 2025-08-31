import { useState, useRef, useEffect, useCallback } from 'react';
import { Bold, Italic, Underline, Save, X, Type, Palette } from 'lucide-react';
import { api } from '../api';

const WebsiteEditor = ({ component, onSave, autoSave = false, componentId = null, onUnmount = null }) => {
  const [selectedElement, setSelectedElement] = useState(null);
  const [selectedText, setSelectedText] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const containerRef = useRef(null);
  const autoSaveTimeoutRef = useRef(null);

  // Handle save function (defined early to avoid hoisting issues)
  const handleSave = useCallback(async () => {
    if (!containerRef.current) return;

    const serializedContent = containerRef.current.innerHTML;
    
    if (componentId && autoSave) {
      try {
        await api.updateComponent(componentId, serializedContent);
        setHasChanges(false);
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }

    if (onSave) {
      onSave(serializedContent);
    }
    
    setHasChanges(false);
  }, [componentId, autoSave, onSave]);

  useEffect(() => {
    if (autoSave && hasChanges && componentId) {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      autoSaveTimeoutRef.current = setTimeout(() => {
        handleSave();
      }, 1000);
    }
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [hasChanges, autoSave, componentId, handleSave]);

  // Initialize component content and set up event listeners
  useEffect(() => {
    if (component && containerRef.current) {
      clearAllSelections(); // Clean up any previous selections
      containerRef.current.innerHTML = component;
      setupEventListeners();
    }
    
    // Cleanup function
    return () => {
      clearAllSelections();
      if (onUnmount) {
        onUnmount();
      }
    };
  }, [component]);

  const setupEventListeners = () => {
    const container = containerRef.current;
    if (!container) return;

    // GrapesJS-inspired: Make ALL elements selectable, not just text elements
    const allElements = container.querySelectorAll('*');
    
    allElements.forEach(element => {
      // Skip script and style tags
      if (element.tagName === 'SCRIPT' || element.tagName === 'STYLE') return;
      
      element.style.cursor = 'pointer';
      element.addEventListener('click', handleElementClick);
      element.addEventListener('mouseenter', handleMouseEnter);
      element.addEventListener('mouseleave', handleMouseLeave);
      
      // Prevent default behaviors that might interfere
      element.addEventListener('dragstart', (e) => e.preventDefault());
    });
  };

  const handleMouseEnter = (e) => {
    if (!selectedElement || selectedElement !== e.target) {
      e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
      e.target.style.outline = '1px dashed rgba(59, 130, 246, 0.5)';
      e.target.style.transition = 'background-color 0.2s, outline 0.2s';
    }
  };

  const handleMouseLeave = (e) => {
    if (!selectedElement || selectedElement !== e.target) {
      e.target.style.backgroundColor = '';
      e.target.style.outline = '';
      e.target.style.transition = '';
    }
  };

  const handleElementClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Clear previous selection
    if (selectedElement && selectedElement !== e.target) {
      selectedElement.style.backgroundColor = '';
      selectedElement.style.outline = '';
    }

    // GrapesJS-inspired: Select the most specific element that has meaningful content
    const element = findBestSelectableElement(e.target);
    setSelectedElement(element);
    // Convert HTML to plain text for editing, preserving line breaks
    const htmlContent = element.innerHTML || '';
    const plainText = htmlContent.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]*>/g, '');
    setSelectedText(plainText);
    
    // Highlight selected element
    element.style.backgroundColor = 'rgba(59, 130, 246, 0.2)';
    element.style.outline = '2px solid #3b82f6';
    element.style.outlineOffset = '2px';
  };

  // GrapesJS-inspired element selection logic
  const findBestSelectableElement = (target) => {
    // If it's a text element with content, select it
    const textTags = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'SPAN', 'A', 'BUTTON', 'LI'];
    if (textTags.includes(target.tagName) && target.textContent.trim()) {
      return target;
    }
    
    // If it's a container, try to find a text element inside
    const textChild = target.querySelector('h1, h2, h3, h4, h5, h6, p, span, a, button, li');
    if (textChild && textChild.textContent.trim()) {
      return textChild;
    }
    
    // If it's a div with direct text content
    if (target.tagName === 'DIV' && hasDirectTextContent(target)) {
      return target;
    }
    
    // Otherwise, select the clicked element
    return target;
  };

  // Check if element has direct text content (not just from children)
  const hasDirectTextContent = (element) => {
    for (let node of element.childNodes) {
      if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
        return true;
      }
    }
    return false;
  };

  // TipTap-inspired: Handle rich text with HTML content
  const handleTextChange = (newText) => {
    if (selectedElement) {
      const htmlText = newText.replace(/\n/g, '<br>');
      selectedElement.innerHTML = htmlText;
      setSelectedText(newText);
      setHasChanges(true);
    }
  };

  // Enhanced styling with !important to override existing styles
  const applyStyle = (property, value) => {
    if (!selectedElement) return;
    
    // For font size, need special handling due to Tailwind's high specificity
    if (property === 'fontSize') {
      // Remove ALL Tailwind font size classes (including responsive ones)
      const allTailwindFontSizes = [
        'text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl', 'text-4xl', 'text-5xl', 'text-6xl', 'text-7xl', 'text-8xl', 'text-9xl',
        // Responsive variants
        'sm:text-xs', 'sm:text-sm', 'sm:text-base', 'sm:text-lg', 'sm:text-xl', 'sm:text-2xl', 'sm:text-3xl', 'sm:text-4xl', 'sm:text-5xl', 'sm:text-6xl',
        'md:text-xs', 'md:text-sm', 'md:text-base', 'md:text-lg', 'md:text-xl', 'md:text-2xl', 'md:text-3xl', 'md:text-4xl', 'md:text-5xl', 'md:text-6xl',
        'lg:text-xs', 'lg:text-sm', 'lg:text-base', 'lg:text-lg', 'lg:text-xl', 'lg:text-2xl', 'lg:text-3xl', 'lg:text-4xl', 'lg:text-5xl', 'lg:text-6xl'
      ];
      
      allTailwindFontSizes.forEach(className => {
        selectedElement.classList.remove(className);
      });
      
      // Create a unique ID for this element
      const elementId = `editor-element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      selectedElement.setAttribute('data-editor-id', elementId);
      
      // Inject highly specific CSS that will override Tailwind
      injectHighSpecificityCSS(elementId, property, value);
    } else {
      // For other properties, use regular inline style
      selectedElement.style.setProperty(property, value, 'important');
    }
    
    setHasChanges(true);
  };

  // Inject high-specificity CSS to override Tailwind
  const injectHighSpecificityCSS = (elementId, property, value) => {
    const styleId = `editor-style-${elementId}`;
    
    // Remove existing style if present
    const existingStyle = document.getElementById(styleId);
    if (existingStyle) {
      existingStyle.remove();
    }
    
    // Create and inject high-specificity style
    const style = document.createElement('style');
    style.id = styleId;
    // Use attribute selector with high specificity to override Tailwind
    style.textContent = `
      [data-editor-id="${elementId}"] { 
        ${property.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value} !important; 
      }
      html [data-editor-id="${elementId}"] { 
        ${property.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value} !important; 
      }
      html body [data-editor-id="${elementId}"] { 
        ${property.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value} !important; 
      }
    `;
    document.head.appendChild(style);
  };

  // Get computed style value for better state detection
  const getElementStyle = (element, property) => {
    if (!element) return '';
    
    const inlineStyle = element.style[property];
    if (inlineStyle) {
      return inlineStyle;
    }
    
    const computed = window.getComputedStyle(element);
    const computedValue = computed[property] || '';
    
    if (property === 'fontSize' && computedValue) {
      if (computedValue.includes('px')) {
        return computedValue;
      }
    }
    
    return computedValue;
  };

  const toggleBold = () => {
    if (!selectedElement) return;
    const currentWeight = getElementStyle(selectedElement, 'fontWeight');
    const isBold = currentWeight === 'bold' || currentWeight === '700' || parseInt(currentWeight) >= 600;
    applyStyle('fontWeight', isBold ? 'normal' : 'bold');
  };

  const toggleItalic = () => {
    if (!selectedElement) return;
    const currentStyle = getElementStyle(selectedElement, 'fontStyle');
    applyStyle('fontStyle', currentStyle === 'italic' ? 'normal' : 'italic');
  };

  const toggleUnderline = () => {
    if (!selectedElement) return;
    const currentDecoration = getElementStyle(selectedElement, 'textDecoration');
    applyStyle('textDecoration', currentDecoration.includes('underline') ? 'none' : 'underline');
  };

  // Helper to check if style is active
  const isStyleActive = (property, value) => {
    if (!selectedElement) return false;
    const currentValue = getElementStyle(selectedElement, property);
    
    if (property === 'fontWeight') {
      const isBold = currentValue === 'bold' || currentValue === '700' || parseInt(currentValue) >= 600;
      return value === 'bold' ? isBold : !isBold;
    }
    
    if (property === 'textDecoration') {
      return currentValue.includes(value);
    }
    
    return currentValue === value;
  };

  // Convert RGB color to hex for color input
  const rgbToHex = (rgb) => {
    if (!rgb || rgb === 'transparent' || rgb === 'rgba(0, 0, 0, 0)') return '#ffffff';
    
    // If already hex, return as is
    if (rgb.startsWith('#')) return rgb;
    
    // Extract RGB values
    const rgbMatch = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (!rgbMatch) return '#000000';
    
    const [, r, g, b] = rgbMatch;
    const hex = ((1 << 24) + (parseInt(r) << 16) + (parseInt(g) << 8) + parseInt(b)).toString(16).slice(1);
    return '#' + hex;
  };

  const clearSelection = () => {
    if (selectedElement) {
      selectedElement.style.backgroundColor = '';
      selectedElement.style.outline = '';
      selectedElement.style.outlineOffset = '';
    }
    setSelectedElement(null);
    setSelectedText('');
  };

  // Clean up all element styles when component unmounts or switches modes
  const clearAllSelections = () => {
    if (containerRef.current) {
      const allElements = containerRef.current.querySelectorAll('*');
      allElements.forEach(element => {
        // Clear selection and hover styles
        element.style.backgroundColor = '';
        element.style.outline = '';
        element.style.outlineOffset = '';
        element.style.transition = '';
        
        // Remove custom editor attributes and clean up injected styles
        const editorId = element.getAttribute('data-editor-id');
        if (editorId) {
          const styleElement = document.getElementById(`editor-style-${editorId}`);
          if (styleElement) {
            styleElement.remove();
          }
          element.removeAttribute('data-editor-id');
        }
        
        // Remove event listeners to prevent memory leaks
        element.removeEventListener('click', handleElementClick);
        element.removeEventListener('mouseenter', handleMouseEnter);
        element.removeEventListener('mouseleave', handleMouseLeave);
        element.removeEventListener('dragstart', (e) => e.preventDefault());
      });
    }
    setSelectedElement(null);
    setSelectedText('');
  };

  return (
    <div className="flex h-full">
      {/* Main Content Area */}
      <div className="flex-1 overflow-auto">
        <div 
          ref={containerRef}
          className="website-editor-content min-h-full p-4"
          style={{ cursor: 'default' }}
        />
      </div>

      {/* Right Sidebar Editor Panel */}
      {selectedElement && (
        <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Edit Element</h3>
            <button
              onClick={clearSelection}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Element Info */}
          <div className="mb-4 p-3 bg-gray-50 rounded">
            <div className="text-sm text-gray-600">Selected: <span className="font-medium">{selectedElement.tagName.toLowerCase()}</span></div>
          </div>

          {/* Text Content Editor */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Text Content</label>
            <textarea
              value={selectedText.replace(/<br>/g, '\n')} // Convert <br> to newlines for editing
              onChange={(e) => handleTextChange(e.target.value)}
              className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
              placeholder="Enter text content... (Press Enter for new lines)"
              style={{ fontFamily: 'inherit' }}
            />
            <div className="text-xs text-gray-500 mt-1">
              Tip: Press Enter to create new lines
            </div>
          </div>
          
          {/* Formatting Options */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
            <div className="flex gap-2">
              <button
                onClick={toggleBold}
                className={`p-2 rounded border ${
                  isStyleActive('fontWeight', 'bold')
                    ? 'bg-black text-white border-gray-600' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
                title="Bold"
              >
                <Bold className="w-4 h-4" />
              </button>
              
              <button
                onClick={toggleItalic}
                className={`p-2 rounded border ${
                  isStyleActive('fontStyle', 'italic')
                    ? 'bg-black text-white border-gray-600' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
                title="Italic"
              >
                <Italic className="w-4 h-4" />
              </button>
              
              <button
                onClick={toggleUnderline}
                className={`p-2 rounded border ${
                  isStyleActive('textDecoration', 'underline')
                    ? 'bg-black text-white border-gray-600' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
                title="Underline"
              >
                <Underline className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Style Options */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Text Color</label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={rgbToHex(getElementStyle(selectedElement, 'color')) || '#000000'}
                  onChange={(e) => applyStyle('color', e.target.value)}
                  className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={getElementStyle(selectedElement, 'color') || '#000000'}
                  onChange={(e) => applyStyle('color', e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded text-sm"
                  placeholder="#000000"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Font Size</label>
              <div className="flex gap-2">
                <select
                  value={getElementStyle(selectedElement, 'fontSize') || ''}
                  onChange={(e) => {
                    console.log('Font size select changed to:', e.target.value);
                    if (e.target.value) {
                      applyStyle('fontSize', e.target.value);
                    }
                  }}
                  className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                >
                  <option value="">Default</option>
                  <option value="10px">10px</option>
                  <option value="12px">12px</option>
                  <option value="14px">14px</option>
                  <option value="16px">16px</option>
                  <option value="18px">18px</option>
                  <option value="20px">20px</option>
                  <option value="22px">22px</option>
                  <option value="24px">24px</option>
                  <option value="28px">28px</option>
                  <option value="32px">32px</option>
                  <option value="36px">36px</option>
                  <option value="40px">40px</option>
                  <option value="48px">48px</option>
                  <option value="56px">56px</option>
                  <option value="64px">64px</option>
                </select>
                <input
                  type="text"
                  value={getElementStyle(selectedElement, 'fontSize') || ''}
                  onChange={(e) => {
                    console.log('Font size input changed to:', e.target.value);
                    if (e.target.value) {
                      applyStyle('fontSize', e.target.value);
                    }
                  }}
                  onBlur={(e) => {
                    // Ensure px unit if not provided
                    if (e.target.value && !e.target.value.includes('px') && !e.target.value.includes('rem') && !e.target.value.includes('em')) {
                      const value = e.target.value + 'px';
                      applyStyle('fontSize', value);
                    }
                  }}
                  className="w-24 p-2 border border-gray-300 rounded text-sm"
                  placeholder="16px"
                />
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Current: {getElementStyle(selectedElement, 'fontSize') || 'inherit'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={rgbToHex(getElementStyle(selectedElement, 'backgroundColor')) || '#ffffff'}
                  onChange={(e) => applyStyle('backgroundColor', e.target.value)}
                  className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={getElementStyle(selectedElement, 'backgroundColor') || ''}
                  onChange={(e) => applyStyle('backgroundColor', e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded text-sm"
                  placeholder="transparent"
                />
                <button
                  onClick={() => applyStyle('backgroundColor', 'transparent')}
                  className="px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className={`text-sm mb-3 ${hasChanges ? 'text-orange-600' : 'text-green-600'}`}>
              {hasChanges ? '● Unsaved changes' : '● All changes saved'}
            </div>
            <button
              onClick={handleSave}
              disabled={!hasChanges}
              className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded font-medium ${
                hasChanges 
                  ? 'bg-black text-white hover:bg-gray-800' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      )}

      {!selectedElement && (
        <div className="w-80 bg-gray-900 border-l border-gray-700 p-4">
          <h3 className="text-lg font-semibold text-white mb-4">How to Edit</h3>
          <div className="space-y-3 text-sm text-gray-300">
            <p>• Click on any text element in the page to start editing</p>
            <p>• Elements will highlight when you hover over them</p>
            <p>• Use the editor panel to modify text content and styling</p>
            <p>• Changes are saved automatically</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebsiteEditor;