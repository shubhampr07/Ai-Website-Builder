
import { NetlifyAPI } from "netlify";
import path from "path";
import { fileURLToPath } from "url";
import fetch from "node-fetch";
import fs from "fs";
import dotenv from "dotenv";
import { sanitizeHTML, wrapHTML, validateHTML } from "../utils/htmlUtils.js";
import { createZipFile, cleanupFiles, ensureDirectory, writeFileWithErrorHandling } from "../utils/fileUtils.js";
import { sendSuccess, sendError, sendValidationError } from "../utils/responseUtils.js";
import { NETLIFY_CONFIG, LIMITS, HTTP_STATUS } from "../config/constants.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Netlify client
const netlifyClient = new NetlifyAPI(process.env.NETLIFY_ACCESS_TOKEN);

/**
 * Wait for deployment to complete
 * @param {string} siteId - Netlify site ID
 * @param {string} deployId - Deployment ID
 * @returns {Promise<object>} Final deployment status
 */
const waitForDeployment = async (siteId, deployId) => {
  let retries = 0;

  while (retries < LIMITS.MAX_RETRIES) {
    const statusResponse = await fetch(
      `https://api.netlify.com/api/v1/sites/${siteId}/deploys/${deployId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.NETLIFY_ACCESS_TOKEN}`,
        },
      }
    );

    if (!statusResponse.ok) {
      throw new Error(`Failed to check deploy status: ${statusResponse.statusText}`);
    }

    const deployStatus = await statusResponse.json();
    console.log("Current deploy status:", deployStatus.state);

    if (deployStatus.state === "ready") {
      return deployStatus;
    }

    if (deployStatus.state === "error" || deployStatus.state === "failed") {
      throw new Error(`Deployment failed with state: ${deployStatus.state}`);
    }

    await new Promise((resolve) => setTimeout(resolve, LIMITS.RETRY_INTERVAL));
    retries++;
  }

  throw new Error("Deployment timeout");
};

/**
 * Create and deploy site to Netlify
 */
const createAndDeploySite = async (html) => {
  const tempDir = path.join(__dirname, "..", "temp-deploy");
  const zipPath = path.join(__dirname, "..", "deploy.zip");

  try {
    // Clean up any existing files
    await cleanupFiles([tempDir, zipPath]);

    // Create temporary directory and write files
    await ensureDirectory(tempDir);
    await writeFileWithErrorHandling(path.join(tempDir, "_headers"), NETLIFY_CONFIG.HEADERS_CONTENT);
    await writeFileWithErrorHandling(path.join(tempDir, "index.html"), html);

    // Create ZIP file
    console.log("Creating ZIP file...");
    await createZipFile(tempDir, zipPath);
    
    let site;
    try {
      site = await netlifyClient.createSite({
        name: `${NETLIFY_CONFIG.SITE_NAME_PREFIX}${Date.now()}`
      });
      console.log("Site created successfully:", site.id);
    } catch (siteError) {
      console.error("Site creation failed:", siteError.message);
      throw new Error(`Failed to create site: ${siteError.message}`);
    }

    // Deploy the ZIP file
    console.log("Deploying site...");
    const deployResponse = await fetch(
      `https://api.netlify.com/api/v1/sites/${site.id}/deploys`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/zip",
          Authorization: `Bearer ${process.env.NETLIFY_ACCESS_TOKEN}`,
        },
        body: fs.readFileSync(zipPath),
      }
    );

    if (!deployResponse.ok) {
      const errorText = await deployResponse.text();
      throw new Error(`Deploy failed: ${errorText}`);
    }

    const deployData = await deployResponse.json();
    console.log("Deployment started:", deployData.id);

    // Wait for deployment to complete
    console.log("Waiting for deployment to complete...");
    const finalDeploy = await waitForDeployment(site.id, deployData.id);

    await cleanupFiles([tempDir, zipPath]);

    return {
      siteId: site.id,
      siteName: site.name,
      siteUrl: finalDeploy.ssl_url || finalDeploy.url,
      adminUrl: `https://app.netlify.com/sites/${site.name}/overview`,
      deployStatus: finalDeploy.state,
      deployId: finalDeploy.id,
      deployedAt: new Date().toISOString()
    };
    
  } catch (error) {
    // Clean up on error
    await cleanupFiles([tempDir, zipPath]);
    throw error;
  }
};

/**
 * Handle POST /api/deploy request
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
export const deployToNetlify = async (req, res) => {
  try {
    const { html } = req.body;

    // Validation
    if (!html) {
      return sendValidationError(res, "HTML content is required");
    }

    if (typeof html !== 'string') {
      return sendValidationError(res, "HTML content must be a string");
    }

    // Validate and sanitize HTML
    const validation = validateHTML(html);
    if (!validation.isValid) {
      return sendValidationError(res, validation.error);
    }

    const sanitizedHTML = wrapHTML(sanitizeHTML(html));
    
    console.log("Starting deployment to Netlify...");
    const deploymentResult = await createAndDeploySite(sanitizedHTML);
    
    sendSuccess(res, {
      ...deploymentResult,
      url: deploymentResult.siteUrl // Add url field for easy access
    }, "Deployment successful", HTTP_STATUS.CREATED);
    
  } catch (error) {
    console.error("Error during deployment:", error);
    
    // Provide more specific error messages
    if (error.message.includes("NETLIFY_ACCESS_TOKEN")) {
      sendError(res, "Netlify access token not configured", HTTP_STATUS.INTERNAL_SERVER_ERROR);
    } else if (error.message.includes("timeout")) {
      sendError(res, "Deployment timeout - please try again", 408);
    } else {
      sendError(res, `Deployment failed: ${error.message}`, HTTP_STATUS.INTERNAL_SERVER_ERROR, error.stack);
    }
  }
};