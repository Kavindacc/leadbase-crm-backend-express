const express = require('express');
const router = express.Router();
const { getLeads, getLeadById, createLead, updateLead, deleteLead, addNote } = require('../controllers/leadController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getLeads)
  .post(protect, createLead);

router.route('/:id')
  .get(protect, getLeadById)
  .put(protect, updateLead)
  .delete(protect, deleteLead);

router.post('/:id/notes', protect, addNote);

module.exports = router;
