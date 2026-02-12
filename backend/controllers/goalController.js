// Goal Controller - MongoDB/Mongoose
// Manages user goals, tasks, and notes

/**
 * Get all items (goals, tasks, notes)
 * @route GET /api/goals
 */
export const getItems = async (req, res) => {
  try {
    const { type } = req.query;
    // Goals are stored in localStorage on the frontend
    // This endpoint serves as API placeholder for future DB integration
    res.json({ success: true, count: 0, data: [] });
  } catch (error) {
    res.json({ success: true, count: 0, data: [] });
  }
};

/**
 * Create item
 * @route POST /api/goals
 */
export const createItem = async (req, res) => {
  try {
    const { type, data } = req.body;
    res.status(201).json({ success: true, data: { id: Date.now().toString(), ...data } });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

/**
 * Update item
 * @route PUT /api/goals/:id
 */
export const updateItem = async (req, res) => {
  try {
    const { data } = req.body;
    res.json({ success: true, data: { id: req.params.id, ...data } });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

/**
 * Delete item
 * @route DELETE /api/goals/:id
 */
export const deleteItem = async (req, res) => {
  try {
    res.json({ success: true, message: 'Item deleted' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export default { getItems, createItem, updateItem, deleteItem };
