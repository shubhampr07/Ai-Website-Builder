# Landing Page Builder 🚀

A powerful, AI-driven landing page generator that creates professional websites with a single prompt. Build, customize, and deploy landing pages in minutes with live editing capabilities and one-click Netlify deployment.

## 🌟 Features

### Core Functionality
- **AI-Powered Generation**: Create landing pages from natural language prompts using Google's Gemini AI
- **Live Preview**: Real-time preview of generated pages with responsive design
- **Visual Editor**: In-browser editing with click-to-edit functionality for text elements
- **One-Click Deployment**: Deploy directly to Netlify with automatic domain generation
- **Code Export**: Download generated HTML files as ZIP packages
- **HTML Import**: Parse and preview existing HTML content

### Technical Features
- **Responsive Design**: All generated pages are mobile-friendly with viewport optimization
- **Modern Tech Stack**: React frontend with Express.js backend
- **Real-time Updates**: Live editing with auto-save functionality
- **Error Handling**: Comprehensive error handling and user feedback
- **Rate Limiting**: Built-in API rate limiting for production use

## 🏗️ Architecture

```
landingPage-builder/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   └── api.js         # API client
│   └── package.json
├── server/                 # Express.js backend
│   ├── controllers/       # Request handlers
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   ├── utils/            # Utility functions
│   ├── config/           # Configuration files
│   └── package.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Google Gemini API key
- Netlify account (for deployment feature)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd landingPage-builder
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   cd server
   npm install
   
   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Environment Setup**
   
   Create a `.env` file in the `server` directory:
   ```env
   # Required: Google Gemini API Configuration
   GOOGLE_API_KEY=your_google_gemini_api_key_here
   
   # Required: Netlify Deployment Configuration
   NETLIFY_ACCESS_TOKEN=your_netlify_access_token_here
   
   # Optional: Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # Optional: Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

4. **Start the development servers**
   
   **Terminal 1 - Backend:**
   ```bash
   cd server
   npm run dev
   ```
   
   **Terminal 2 - Frontend:**
   ```bash
   cd client
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 🔧 Configuration

### Server Configuration

#### Environment Variables
| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `GOOGLE_API_KEY` | Google Gemini API key for AI generation | Yes | - |
| `NETLIFY_ACCESS_TOKEN` | Netlify personal access token for deployments | Yes | - |
| `PORT` | Server port number | No | 5000 |
| `NODE_ENV` | Environment mode | No | development |
| `RATE_LIMIT_WINDOW_MS` | Rate limiting window in milliseconds | No | 900000 |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | No | 100 |

#### Getting API Keys

**Google Gemini API Key:**
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key to your `.env` file

**Netlify Access Token:**
1. Go to [Netlify User Settings](https://app.netlify.com/user/applications)
2. Click "New access token"
3. Copy the token to your `.env` file

### Client Configuration

The client automatically connects to the backend at `http://localhost:5000` during development. For production, update the `API_URL` in `client/src/api.js`.

## 📚 API Documentation

### Endpoints

#### POST /api/generate
Generate a landing page from a text prompt.

**Request:**
```json
{
  "prompt": "Create a modern landing page for a fitness app"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Generation successful",
  "data": {
    "html": "<html>...</html>"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### POST /api/deploy
Deploy HTML content to Netlify.

**Request:**
```json
{
  "html": "<html>...</html>"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Deployment successful",
  "data": {
    "siteId": "abc123",
    "siteName": "amazing-site-123",
    "siteUrl": "https://amazing-site-123.netlify.app",
    "deployStatus": "ready",
    "deployId": "def456",
    "deployedAt": "2024-01-01T00:00:00.000Z"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### POST /api/component
Create an editable component for live editing.

#### PUT /api/component/:id
Update an existing component.

#### GET /api/component/:id
Retrieve component content.

## 🎨 Usage Guide

### Generating Landing Pages

1. **Enter a prompt** describing your desired landing page:
   ```
   "Create a modern SaaS landing page with a hero section, features showcase, testimonials, and pricing table"
   ```

2. **Click "Generate with AI"** and wait for the AI to create your page

3. **Preview the result** in the built-in viewer

### Editing Pages

1. **Click "Edit Page"** to enter edit mode
2. **Click on any text element** to edit it inline
3. **Changes are auto-saved** as you type
4. **Click "Exit Edit"** when finished

### Deploying to Netlify

1. **Click the "Deploy" button**
2. **Wait for deployment** (usually 30-60 seconds)
3. **Get your live URL** and share it with the world!

### Exporting Code

1. **Click "Download"** to get a ZIP file
2. **Extract the files** to your computer
3. **Open index.html** in any browser

## 🛠️ Development

### Project Structure

#### Client (`/client`)
```
src/
├── components/
│   ├── LandingPagePreview.jsx    # Page preview component
│   ├── WebsiteEditor.jsx         # Live editor component
│   └── ui/                       # Reusable UI components
├── pages/
│   ├── Generator.jsx             # Main generation interface
│   └── LandingPage.jsx          # Landing page component
├── api.js                        # API client with error handling
├── App.jsx                       # Main app component
└── main.jsx                      # App entry point
```

#### Server (`/server`)
```
controllers/
├── generatorController.js        # AI generation logic
├── deploymentController.js       # Netlify deployment handling
└── componentController.js        # Component CRUD operations

routes/
├── index.js                      # Main router
├── generator.js                  # Generation routes
├── deployment.js                 # Deployment routes
└── component.js                  # Component routes

middleware/
├── errorHandler.js               # Global error handling
├── requestLogger.js              # Request logging
└── validation.js                 # Input validation & rate limiting

utils/
├── htmlUtils.js                  # HTML processing utilities
├── fileUtils.js                  # File system operations
└── responseUtils.js              # Standardized API responses

config/
└── constants.js                  # Application constants
```

### Available Scripts

#### Server Scripts
```bash
npm start        # Start production server
npm run dev      # Start development server with nodemon
npm run prod     # Start production server with NODE_ENV=production
```

#### Client Scripts
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Adding New Features

1. **Create controller** in `server/controllers/`
2. **Add routes** in `server/routes/`
3. **Update API client** in `client/src/api.js`
4. **Create/update components** in `client/src/`

## 🚀 Deployment

### Production Deployment

#### Backend (Server)
1. **Choose a hosting platform** (Heroku, Railway, DigitalOcean, etc.)
2. **Set environment variables** in your hosting platform
3. **Deploy the server** directory
4. **Update client API_URL** to point to your deployed backend

#### Frontend (Client)
1. **Build the client**:
   ```bash
   cd client
   npm run build
   ```
2. **Deploy the `dist` folder** to:
   - Netlify (drag & drop)
   - Vercel (`vercel deploy`)
   - GitHub Pages
   - Any static hosting service

### Environment Variables for Production

Ensure these are set in your production environment:
- `GOOGLE_API_KEY`
- `NETLIFY_ACCESS_TOKEN`
- `NODE_ENV=production`

## 🤔 Technical Decisions

### Why JavaScript Instead of TypeScript?

Honestly? When setting up the Vite project, I accidentally clicked JavaScript instead of TypeScript! 😊 


## 🔒 Security Considerations

- **API Keys**: Never commit API keys to version control
- **Rate Limiting**: Implemented to prevent API abuse
- **Input Validation**: All user inputs are validated and sanitized
- **CORS**: Properly configured for cross-origin requests
- **Error Handling**: Sensitive information is not exposed in error messages
