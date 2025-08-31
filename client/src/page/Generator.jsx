import { useState, useRef, useEffect } from "react";
import {
  Loader2,
  Download,
  Code,
  Eye,
  Copy,
  Maximize2,
  Minimize2,
  Rocket,
  RefreshCw,
  Edit,
  Save,
} from "lucide-react";
import { saveAs } from "file-saver";
import JSZip from "jszip";
import { motion } from "framer-motion";
import WebsiteEditor from "../components/WebsiteEditor";
import { api } from "../api";

const Generator = () => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPage, setGeneratedPage] = useState(null);
  const [showCode, setShowCode] = useState(false);
  const [error, setError] = useState(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [detectedHtml, setDetectedHtml] = useState(false);

  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployMessage, setDeployMessage] = useState("");
  const [deployedUrl, setDeployedUrl] = useState(null);
  
  // Editor state
  const [isEditMode, setIsEditMode] = useState(false);
  const [componentId, setComponentId] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);


  const previewRef = useRef(null);

  // Check if prompt contains HTML content
  useEffect(() => {
    if (prompt) {
      const hasHtml =
        /<html|<!DOCTYPE html|<body|<head|<div|<script|<style/.test(prompt);
      setDetectedHtml(hasHtml);
    } else {
      setDetectedHtml(false);
    }
  }, [prompt]);

  // Parse HTML content directly from prompt
  const parseHtmlFromPrompt = () => {
    try {
      let cleanedHtml = cleanHtmlContent(prompt);
      cleanedHtml = ensureResponsiveHTML(cleanedHtml);
      setGeneratedPage(cleanedHtml);
    } catch (err) {
      setError("Failed to parse HTML. Please check your input.");
      console.error("Error parsing HTML:", err);
    }
  };

  // Remove markdown code fences and extraneous content
  const cleanHtmlContent = (html) => {
    if (!html || typeof html !== 'string') {
      throw new Error('Invalid HTML content received from API');
    }
    let cleaned = html.replace(/```html\n|```/g, "");
    cleaned = cleaned.split("Key improvements and explanations:")[0];
    cleaned = cleaned.replace(/[`'"]+$/, "");
    cleaned = cleaned.trim();
    const htmlMatch = cleaned.match(/<html[^>]*>[\s\S]*<\/html>/i);
    if (htmlMatch) {
      cleaned = htmlMatch[0];
    }
    return cleaned;
  };

  // Ensure the HTML contains a viewport meta tag and responsive styles for images
  const ensureResponsiveHTML = (html) => {
    let updatedHtml = html;
    if (!updatedHtml.includes('name="viewport"')) {
      updatedHtml = updatedHtml.replace(
        /<\/head>/i,
        '<meta name="viewport" content="width=device-width, initial-scale=1"></head>'
      );
    }
    if (!updatedHtml.includes("img {")) {
      updatedHtml = updatedHtml.replace(
        /<\/head>/i,
        `<style>
  img { max-width: 100%; height: auto; }
</style></head>`
      );
    }
    return updatedHtml;
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const data = await api.generate(prompt);
      
      let htmlContent = data.html || data.data?.html || data.content || data.result;
      
      if (!htmlContent && typeof data === 'string') {
        htmlContent = data;
      }
      
      if (!htmlContent) {
        throw new Error('Invalid response from API - missing HTML content');
      }
      
      let cleanedHtml = cleanHtmlContent(htmlContent);
      cleanedHtml = ensureResponsiveHTML(cleanedHtml);
      setGeneratedPage(cleanedHtml);
    } catch (err) {
      setError(err.message || "Failed to generate landing page. Please try again.");
      console.error("Error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    const zip = new JSZip();
    zip.file("index.html", generatedPage);
    const readme = `# Generated Landing Page

## Instructions
1. Extract the zip file
2. Open index.html in your browser
3. The page uses Tailwind CSS via CDN, so internet connection is required
4. Customize the content and styling as needed

Created with Landing Page Generator`;
    zip.file("README.md", readme);
    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "landing-page.zip");
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedPage);
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      previewRef.current
        .requestFullscreen()
        .then(() => setIsFullScreen(true))
        .catch((err) => console.error("Error enabling full-screen mode:", err));
    } else {
      document
        .exitFullscreen()
        .then(() => setIsFullScreen(false))
        .catch((err) => console.error("Error exiting full-screen mode:", err));
    }
  };

  const handleDeploy = async () => {
    if (!generatedPage) return;
    setIsDeployModalOpen(true);
    setIsDeploying(true);
    setDeployMessage("Deploying...");

    try {
      const data = await api.deploy(generatedPage);
      setDeployedUrl(data.data.siteUrl);
      setDeployMessage(`Deployment successful! Live URL: ${data.data.siteUrl}`);
    } catch (error) {
      console.error("Deployment error:", error);
      setDeployMessage(error.message || "Deployment failed. Please try again.");
    } finally {
      setIsDeploying(false);
    }
  };

  // Editor functions
  const handleToggleEditMode = async () => {
    if (!isEditMode && !componentId) {
      try {
        const data = await api.createComponent(generatedPage);
        const newComponentId = data.id || data.data?.id;
        setComponentId(newComponentId);
        setIsEditMode(true);
      } catch (error) {
        alert(error.message || 'Error creating editable component');
      }
    } else {
      setIsEditMode(!isEditMode);
    }
  };

  const handleSaveEdits = async (serializedContent) => {
    try {
      if (componentId) {
        await api.updateComponent(componentId, serializedContent);
        setGeneratedPage(serializedContent);
        setHasUnsavedChanges(false);
      }
    } catch (error) {
      console.error('Error saving edits:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-black py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            Create Your Landing Page
          </h1>
          <p className="text-lg text-gray-300 mb-8">
            Describe your vision and let AI bring it to life
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-gray-900 rounded-lg shadow-xl p-6 mb-8 border border-gray-800"
        >
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your landing page (e.g., 'Create a modern landing page for a fitness app with a hero section showcasing workout features, testimonials, and pricing plans') or paste HTML directly"
            className="w-full h-40 p-4 bg-black text-white border-gray-700 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
          />

          {error && (
            <div className="bg-red-900 text-red-200 p-4 rounded-lg mb-4">
              {error}
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt}
              className="flex-1 bg-white text-black py-3 rounded-lg
                     hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed
                     transform hover:scale-[1.02] transition-all duration-200 font-medium"
            >
              {isGenerating ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="animate-spin mr-2" />
                  Generating...
                </span>
              ) : (
                "Generate with AI"
              )}
            </button>

            {detectedHtml && (
              <button
                onClick={parseHtmlFromPrompt}
                className="flex items-center justify-center px-6 bg-gray-800 text-white py-3 rounded-lg
                       hover:bg-gray-700 transform hover:scale-[1.02] transition-all duration-200"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Parse HTML
              </button>
            )}
          </div>
        </motion.div>

        {generatedPage && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            ref={previewRef}
            className="bg-gray-900 rounded-lg shadow-xl p-6 border border-gray-800"
            style={isFullScreen ? { overflowY: "auto", height: "100vh" } : {}}
          >
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Generated Landing Page
                </h2>
                {isEditMode && (
                  <p className="text-sm text-gray-400 mt-1">
                    Click on any text element to edit it inline!
                  </p>
                )}
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={handleToggleEditMode}
                  className={`flex items-center ${
                    isEditMode 
                      ? 'text-white hover:text-gray-300' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  {isEditMode ? "Exit Edit" : "Edit Page"}
                </button>
                <button
                  onClick={() => setShowCode(!showCode)}
                  className="flex items-center text-gray-400 hover:text-white"
                  disabled={isEditMode}
                >
                  {showCode ? (
                    <Eye className="w-4 h-4 mr-2" />
                  ) : (
                    <Code className="w-4 h-4 mr-2" />
                  )}
                  {showCode ? "Show Preview" : "Show Code"}
                </button>
                <button
                  onClick={handleCopyCode}
                  className="flex items-center text-gray-400 hover:text-white"
                  disabled={isEditMode}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Code
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center text-gray-400 hover:text-white"
                  disabled={isEditMode}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </button>
                <button
                  onClick={handleToggleFullscreen}
                  className="flex items-center text-gray-400 hover:text-white"
                  disabled={isEditMode}
                >
                  {isFullScreen ? (
                    <Minimize2 className="w-4 h-4 mr-2" />
                  ) : (
                    <Maximize2 className="w-4 h-4 mr-2" />
                  )}
                  {isFullScreen ? "Exit Fullscreen" : "Expand"}
                </button>
                <button
                  onClick={handleDeploy}
                  className="flex items-center text-gray-400 hover:text-white"
                  disabled={isEditMode}
                >
                  <Rocket className="w-4 h-4 mr-2" />
                  Deploy
                </button>
              </div>
            </div>

            {showCode ? (
              <div className="bg-black p-4 rounded-lg border border-gray-800">
                <pre className="whitespace-pre-wrap text-sm overflow-x-auto text-gray-300">
                  {generatedPage}
                </pre>
              </div>
            ) : isEditMode ? (
              <div className="border border-gray-700 rounded-lg bg-white" style={{ height: '70vh', minHeight: '500px' }}>
                <WebsiteEditor
                  component={generatedPage}
                  onSave={handleSaveEdits}
                  autoSave={true}
                  componentId={componentId}
                />
              </div>
            ) : (
              <div
                className="border border-gray-800 rounded-lg p-4 bg-white"
                dangerouslySetInnerHTML={{ __html: generatedPage }}
              />
            )}
          </motion.div>
        )}

        {isDeployModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 flex items-center justify-center z-50"
          >
            <div className="fixed inset-0 bg-black opacity-50"></div>
            <div className="bg-black rounded-lg shadow-xl p-6 z-10 max-w-md w-full border border-gray-700">
              {isDeploying ? (
                <div className="flex flex-col items-center">
                  <Loader2 className="animate-spin w-6 h-6 mb-4 text-white" />
                  <p className="text-lg text-gray-300">{deployMessage}</p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-lg mb-4 text-gray-300">{deployMessage}</p>
                  {deployedUrl && (
                    <a
                      href={deployedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white hover:text-gray-300 block mb-4"
                    >
                      View Live Site
                    </a>
                  )}
                  <button
                    onClick={() => {
                      setIsDeployModalOpen(false);
                      setDeployMessage("");
                      setDeployedUrl(null);
                    }}
                    className="px-4 py-2 bg-white text-black rounded-lg
                             hover:bg-gray-200 transform hover:scale-105 transition-all duration-200 font-medium"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default Generator;
