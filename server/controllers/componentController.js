import { sendSuccess, sendError, sendValidationError, sendNotFound } from "../utils/responseUtils.js";
import { validateHTML } from "../utils/htmlUtils.js";
import { HTTP_STATUS } from "../config/constants.js";

// In-memory storage for components (we can also use real database)
const componentsStore = new Map();

/**
 * Generate unique component ID
 * @returns {string} Unique component ID
 */
const generateComponentId = () => {
  return `comp_${Date.now()}_${Math.random().toString(36).substring(7)}`;
};

/**
 * Create a new component
 * POST /api/component
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
export const createComponent = async (req, res) => {
  try {
    const { content } = req.body;

    // Validation
    if (!content) {
      return sendValidationError(res, "Component content is required");
    }

    if (typeof content !== 'string') {
      return sendValidationError(res, "Component content must be a string");
    }

    // Validate HTML content
    const validation = validateHTML(content);
    if (!validation.isValid) {
      return sendValidationError(res, validation.error);
    }

    // Generate unique ID and store component
    const componentId = generateComponentId();
    const componentData = {
      id: componentId,
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1
    };

    componentsStore.set(componentId, componentData);

    console.log(`Component created with ID: ${componentId}`);
    console.log(`Total components in store: ${componentsStore.size}`);

    sendSuccess(res, { id: componentId }, "Component created successfully", HTTP_STATUS.CREATED);

  } catch (error) {
    console.error("Error creating component:", error);
    sendError(res, "Failed to create component", HTTP_STATUS.INTERNAL_SERVER_ERROR, error.stack);
  }
};

/**
 * Get a component by ID
 * GET /api/preview/:id
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
export const getComponent = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return sendValidationError(res, "Component ID is required");
    }

    const component = componentsStore.get(id);

    if (!component) {
      console.log(`Component not found with ID: ${id}`);
      console.log(`Available IDs: ${Array.from(componentsStore.keys()).join(', ')}`);
      return sendNotFound(res, "Component");
    }

    sendSuccess(res, component, "Component retrieved successfully");

  } catch (error) {
    console.error("Error retrieving component:", error);
    sendError(res, "Failed to retrieve component", HTTP_STATUS.INTERNAL_SERVER_ERROR, error.stack);
  }
};

/**
 * Update an existing component
 * PUT /api/component/:id
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
export const updateComponent = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    console.log(`PUT request for component ID: ${id}`);
    console.log(`Current components in store: ${Array.from(componentsStore.keys()).join(', ')}`);
    console.log(`Total components in store: ${componentsStore.size}`);

    // Validation
    if (!id) {
      return sendValidationError(res, "Component ID is required");
    }

    if (!content) {
      return sendValidationError(res, "Component content is required");
    }

    if (typeof content !== 'string') {
      return sendValidationError(res, "Component content must be a string");
    }

    // Validate HTML content
    const validation = validateHTML(content);
    if (!validation.isValid) {
      return sendValidationError(res, validation.error);
    }

    const existingComponent = componentsStore.get(id);

    if (!existingComponent) {
      console.log(`Component not found with ID: ${id}`);
      return sendError(res, "Component not found", HTTP_STATUS.NOT_FOUND, {
        requestedId: id,
        availableIds: Array.from(componentsStore.keys())
      });
    }

    // Update component
    const updatedComponent = {
      ...existingComponent,
      content,
      updatedAt: new Date().toISOString(),
      version: existingComponent.version + 1
    };

    componentsStore.set(id, updatedComponent);

    console.log(`Component updated successfully: ${id}`);

    sendSuccess(res, { id, version: updatedComponent.version }, "Component updated successfully");

  } catch (error) {
    console.error("Error updating component:", error);
    sendError(res, "Failed to update component", HTTP_STATUS.INTERNAL_SERVER_ERROR, error.stack);
  }
};

/**
 * Get all components (debug endpoint)
 * GET /api/debug/components
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
export const debugComponents = async (req, res) => {
  try {
    const components = Array.from(componentsStore.entries()).map(([id, data]) => ({
      id,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      version: data.version,
      contentLength: data.content?.length || 0
    }));

    sendSuccess(res, {
      total: componentsStore.size,
      components
    }, "Components retrieved successfully");

  } catch (error) {
    console.error("Error retrieving components:", error);
    sendError(res, "Failed to retrieve components", HTTP_STATUS.INTERNAL_SERVER_ERROR, error.stack);
  }
};

/**
 * Delete a component
 * DELETE /api/component/:id
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
export const deleteComponent = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return sendValidationError(res, "Component ID is required");
    }

    const component = componentsStore.get(id);

    if (!component) {
      return sendNotFound(res, "Component");
    }

    componentsStore.delete(id);

    console.log(`Component deleted: ${id}`);
    console.log(`Remaining components: ${componentsStore.size}`);

    sendSuccess(res, null, "Component deleted successfully");

  } catch (error) {
    console.error("Error deleting component:", error);
    sendError(res, "Failed to delete component", HTTP_STATUS.INTERNAL_SERVER_ERROR, error.stack);
  }
};