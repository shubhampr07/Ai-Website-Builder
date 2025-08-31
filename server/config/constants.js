/**
 * Application constants and configuration
 */

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
};

export const LIMITS = {
  MAX_HTML_SIZE: 1000000, // 1MB
  MAX_RETRIES: 60, // For deployment status check
  RETRY_INTERVAL: 1000, // 1 second
  MAX_PROMPT_LENGTH: 10000 // Maximum prompt length
};

export const GEMINI_CONFIG = {
  MODEL: 'gemini-2.0-flash',
  MAX_OUTPUT_TOKENS: 8192,
  TEMPERATURE: 0.7
};

export const SYSTEM_PROMPT = `Role: You are an expert web developer and designer specializing in modern landing pages.

Objective: Generate a complete, responsive, and visually appealing landing page in HTML using Tailwind CSS. The design should be clean, modern, and optimized for all devices.

Requirements:

1. Structure:
   - Navigation Bar (with responsive menu)
   - Hero Section (clear headline, short description, strong CTA button)
   - Features/Benefits Section (with icons)
   - Product/Service Showcase
   - Testimonials (2-3 short ones)
   - FAQ (3-4 questions)
   - Call-to-Action Section
   - Footer (basic links + social icons)

2. Design:
   - Use Tailwind CSS utility classes only
   - Keep layout minimal, modern, and readable
   - Subtle hover effects for buttons and links (no complex animations)
   - Maintain proper **color contrast** (never use white text on white/light backgrounds or dark text on dark backgrounds)
   - Prefer **dark theme designs** (dark background with light text, e.g., bg-gray-900 with text-gray-100)
   - Consistent color scheme (2 main colors + 1 accent)
   - Good spacing and typography contrast for hierarchy
   - Use inline SVG icons (no external images)

3. Content Strategy:
   - Short, persuasive headlines and text
   - Clear calls-to-action
   - Keep sections concise and scannable

4. Technical:
   - Output as a single HTML file
   - Include Tailwind CSS via CDN in <head>
   - Add meta tags for SEO (title, description, viewport)
   - Semantic HTML5 with accessibility attributes
   - Mobile-first responsive design

IMPORTANT: 
- Do not include any extra explanation or comments. 
- Check background and text color combinations to ensure readability. 
- Prefer generating **dark theme pages** by default unless the prompt explicitly requests otherwise.
- Output only the full HTML code of the landing page.`;

export const NETLIFY_CONFIG = {
  HEADERS_CONTENT: `/*
  Content-Type: text/html; charset=UTF-8
`,
  DEPLOYMENT_TIMEOUT: 60000, // 60 seconds
  SITE_NAME_PREFIX: 'landing-page-'
};