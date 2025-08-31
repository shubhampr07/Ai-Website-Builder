/**
 * HTML utility functions for processing and sanitizing HTML content
 */

/**
 * Remove markdown/code fences from generated HTML
 * @param {string} html - Raw HTML string
 * @returns {string} Cleaned HTML
 */
export const sanitizeHTML = (html) => {
  return html
    .replace(/```(html)?\n?/gi, "")
    .replace(/```/g, "")
    .trim();
};

/**
 * Ensure we have a complete HTML document
 * If the generated HTML is only a snippet, wrap it in a basic HTML skeleton
 * @param {string} html - HTML content
 * @returns {string} Complete HTML document
 */
export const wrapHTML = (html) => {
  if (!html.toLowerCase().includes("<html")) {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Landing Page</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
${html}
</body>
</html>`;
  }
  return html;
};

/**
 * Validate HTML content
 * @param {string} html - HTML content to validate
 * @returns {object} Validation result
 */
export const validateHTML = (html) => {
  if (!html || typeof html !== 'string') {
    return { isValid: false, error: 'HTML content is required and must be a string' };
  }

  if (html.length > 1000000) { // 1MB limit
    return { isValid: false, error: 'HTML content exceeds maximum size limit' };
  }

  // Check for potentially dangerous content
  const dangerousPatterns = [
    /<script[^>]*>(?!.*tailwindcss).*<\/script>/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
    /javascript:/gi,
    /data:text\/html/gi
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(html)) {
      return { isValid: false, error: 'HTML content contains potentially dangerous elements' };
    }
  }

  return { isValid: true };
};