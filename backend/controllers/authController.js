import bcrypt from 'bcryptjs';
import { dbGet, dbRun, dbAll } from '../db/connection.js';
import { generateToken } from '../middleware/auth.js';

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const user = await dbGet(`SELECT * FROM users WHERE email = ?`, [email]);

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = await dbGet(`SELECT id, email, name, role FROM users WHERE id = ?`, [req.user.id]);
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAgents = async (req, res) => {
  try {
    const agents = await dbAll(`SELECT id, name, email FROM users WHERE role = 'Agent'`);
    res.json(agents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
