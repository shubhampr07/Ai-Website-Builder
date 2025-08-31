/**
 * File utility functions for handling file operations
 */
import fs from "fs-extra";
import path from "path";
import archiver from "archiver";

/**
 * Create a ZIP file from a source directory
 * @param {string} sourceDir - Source directory path
 * @param {string} outputPath - Output ZIP file path
 * @returns {Promise<void>}
 */
export const createZipFile = async (sourceDir, outputPath) => {
  const output = fs.createWriteStream(outputPath);
  const archive = archiver("zip", {
    zlib: { level: 9 },
  });

  return new Promise((resolve, reject) => {
    output.on("close", () => resolve());
    archive.on("error", (err) => reject(err));
    archive.pipe(output);
    archive.directory(sourceDir, false);
    archive.finalize();
  });
};

/**
 * Clean up temporary files and directories
 * @param {string[]} paths - Array of paths to clean up
 * @returns {Promise<void>}
 */
export const cleanupFiles = async (paths) => {
  const cleanupPromises = paths.map(async (filePath) => {
    try {
      await fs.remove(filePath);
    } catch (error) {
      console.warn(`Failed to cleanup file ${filePath}:`, error.message);
    }
  });

  await Promise.all(cleanupPromises);
};

/**
 * Ensure directory exists, create if it doesn't
 * @param {string} dirPath - Directory path
 * @returns {Promise<void>}
 */
export const ensureDirectory = async (dirPath) => {
  await fs.ensureDir(dirPath);
};

/**
 * Write file with error handling
 * @param {string} filePath - File path
 * @param {string} content - File content
 * @returns {Promise<void>}
 */
export const writeFileWithErrorHandling = async (filePath, content) => {
  try {
    await fs.writeFile(filePath, content);
  } catch (error) {
    throw new Error(`Failed to write file ${filePath}: ${error.message}`);
  }
};