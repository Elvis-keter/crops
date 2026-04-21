import express from 'express';
import {
  createField,
  getFields,
  getFieldById,
  updateField,
  assignField,
  getAssignedFields
} from '../controllers/fieldController.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

//s (filtered by role)
router.get('/', getFields);

router.get('/agent/assigned', getAssignedFields);

router.post('/', authorizeRole(['Admin']), createField);


router.get('/:id', getFieldById);

router.put('/:id', updateField);

router.put('/:id/assign', authorizeRole(['Admin']), assignField);

export default router;
