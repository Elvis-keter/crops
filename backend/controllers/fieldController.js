import { dbGet, dbRun, dbAll } from '../db/connection.js';

const calculateStatus = (field) => {
  const stage = field.current_stage;
  
  if (stage === 'Harvested') {
    return 'Completed';
  }
  
  if (stage === 'Ready') {
    return 'Completed';
  }

  if (field.last_updated) {
    const lastUpdateDate = new Date(field.last_updated);
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    
    if (lastUpdateDate < twoWeeksAgo) {
      return 'At Risk';
    }
  } else {
    // No updates - check planting date
    const plantingDate = new Date(field.planting_date);
    const threeWeeksAgo = new Date();
    threeWeeksAgo.setDate(threeWeeksAgo.getDate() - 21);
    
    if (plantingDate < threeWeeksAgo && stage === 'Planted') {
      return 'At Risk';
    }
  }

  return 'Active';
};

export const createField = async (req, res) => {
  try {
    const { name, crop_type, planting_date } = req.body;

    if (!name || !crop_type || !planting_date) {
      return res.status(400).json({ message: 'Name, crop type, and planting date are required' });
    }

    const result = await dbRun(
      `INSERT INTO fields (name, crop_type, planting_date, current_stage, status) 
       VALUES (?, ?, ?, 'Planted', 'Active')`,
      [name, crop_type, planting_date]
    );

    res.status(201).json({
      id: result.lastID,
      name,
      crop_type,
      planting_date,
      current_stage: 'Planted',
      status: 'Active'
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getFields = async (req, res) => {
  try {
    // Admin sees all fields
    // Agents see only assigned fields
    let query = `
      SELECT f.*, u.name as agent_name 
      FROM fields f 
      LEFT JOIN users u ON f.assigned_to = u.id
      ORDER BY f.created_at DESC
    `;
    let params = [];

    if (req.user.role === 'Agent') {
      query = `
        SELECT f.*, u.name as agent_name 
        FROM fields f 
        LEFT JOIN users u ON f.assigned_to = u.id
        WHERE f.assigned_to = ?
        ORDER BY f.created_at DESC
      `;
      params = [req.user.id];
    }

    const fields = await dbAll(query, params);

    // Calculate status for each field
    const fieldsWithStatus = fields.map(field => {
      const status = field.status || calculateStatus(field);
      return {
        ...field,
        status
      };
    });

    res.json(fieldsWithStatus);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getFieldById = async (req, res) => {
  try {
    const { id } = req.params;
    const field = await dbGet(
      `SELECT f.*, u.name as agent_name FROM fields f LEFT JOIN users u ON f.assigned_to = u.id WHERE f.id = ?`,
      [id]
    );

    if (!field) {
      return res.status(404).json({ message: 'Field not found' });
    }

    // Check access - agents can only access their own fields
    if (req.user.role === 'Agent' && field.assigned_to !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const status = field.status || calculateStatus(field);

    res.json({
      ...field,
      status
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateField = async (req, res) => {
  try {
    const { id } = req.params;
    const { current_stage, notes } = req.body;

    const field = await dbGet(`SELECT * FROM fields WHERE id = ?`, [id]);

    if (!field) {
      return res.status(404).json({ message: 'Field not found' });
    }

    // Agents can only update their own fields
    if (req.user.role === 'Agent' && field.assigned_to !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await dbRun(
      `UPDATE fields SET current_stage = ?, notes = ?, last_updated = CURRENT_TIMESTAMP WHERE id = ?`,
      [current_stage || field.current_stage, notes !== undefined ? notes : field.notes, id]
    );

    const updatedField = await dbGet(`SELECT * FROM fields WHERE id = ?`, [id]);
    const status = updatedField.status || calculateStatus(updatedField);

    res.json({
      ...updatedField,
      status,
      message: 'Field updated successfully'
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const assignField = async (req, res) => {
  try {
    const { id } = req.params;
    const { assigned_to } = req.body;

    // Only admins can assign fields
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Only admins can assign fields' });
    }

    const field = await dbGet(`SELECT * FROM fields WHERE id = ?`, [id]);

    if (!field) {
      return res.status(404).json({ message: 'Field not found' });
    }

    // Verify agent exists
    if (assigned_to) {
      const agent = await dbGet(`SELECT * FROM users WHERE id = ? AND role = 'Agent'`, [assigned_to]);
      if (!agent) {
        return res.status(400).json({ message: 'Invalid agent' });
      }
    }

    await dbRun(
      `UPDATE fields SET assigned_to = ? WHERE id = ?`,
      [assigned_to || null, id]
    );

    res.json({ message: 'Field assigned successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAssignedFields = async (req, res) => {
  try {
    const fields = await dbAll(
      `SELECT f.*, u.name as agent_name FROM fields f 
       LEFT JOIN users u ON f.assigned_to = u.id
       WHERE f.assigned_to = ?
       ORDER BY f.created_at DESC`,
      [req.user.id]
    );

    const fieldsWithStatus = fields.map(field => {
      const status = field.status || calculateStatus(field);
      return {
        ...field,
        status
      };
    });

    res.json(fieldsWithStatus);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
