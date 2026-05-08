const prisma = require('../prismaClient');

// Get all leads
const getLeads = async (req, res) => {
  try {
    const leads = await prisma.lead.findMany({
      include: {
        user: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Format to match frontend structure
    const formattedLeads = leads.map(lead => ({
      id: lead.id,
      name: lead.leadName,
      company: lead.companyName,
      email: lead.email,
      source: lead.leadSource,
      status: lead.status,
      salesperson: lead.user?.name || 'Unassigned',
      value: `$${lead.dealValue.toLocaleString()}`,
      date: lead.createdAt.toISOString().split('T')[0]
    }));

    res.json(formattedLeads);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error fetching leads' });
  }
};

// Get single lead
const getLeadById = async (req, res) => {
  try {
    const lead = await prisma.lead.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        notes: {
          include: { user: { select: { name: true } } },
          orderBy: { createdAt: 'desc' }
        },
        statusHistory: {
          include: { user: { select: { name: true } } },
          orderBy: { changedAt: 'desc' }
        }
      }
    });

    if (lead) {
      res.json(lead);
    } else {
      res.status(404).json({ message: 'Lead not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching lead details' });
  }
};

// Create a lead
const createLead = async (req, res) => {
  try {
    const { leadName, companyName, email, phone, leadSource, status, dealValue, salesperson } = req.body;

    const lead = await prisma.lead.create({
      data: {
        leadName,
        companyName,
        email,
        phone: phone || '',
        leadSource: leadSource || 'Website',
        status: status || 'New',
        dealValue: parseFloat(dealValue) || 0,
        assignedTo: parseInt(salesperson) || req.user.id
      }
    });

    // Create initial status history entry
    await prisma.leadStatusHistory.create({
      data: {
        leadId: lead.id,
        fromStatus: 'None',
        toStatus: lead.status,
        changedBy: req.user.id
      }
    });

    res.status(201).json(lead);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Invalid lead data', error: error.message });
  }
};

// Update a lead
const updateLead = async (req, res) => {
  try {
    const { leadName, companyName, email, phone, source, status, dealValue, salesperson } = req.body;
    
    // Check if status changed to log history
    const existingLead = await prisma.lead.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!existingLead) return res.status(404).json({ message: 'Lead not found' });

    if (status && status !== existingLead.status) {
      await prisma.leadStatusHistory.create({
        data: {
          leadId: existingLead.id,
          fromStatus: existingLead.status,
          toStatus: status,
          changedBy: req.user.id
        }
      });
    }

    const updatedLead = await prisma.lead.update({
      where: { id: parseInt(req.params.id) },
      data: {
        leadName,
        companyName,
        email,
        phone,
        leadSource: source,
        status,
        dealValue: dealValue ? parseFloat(dealValue) : undefined,
        assignedTo: salesperson ? parseInt(salesperson) : undefined
      }
    });

    res.json(updatedLead);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Invalid update data' });
  }
};

// Delete a lead
const deleteLead = async (req, res) => {
  try {
    await prisma.lead.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ message: 'Lead removed successfully' });
  } catch (error) {
    res.status(404).json({ message: 'Lead not found' });
  }
};

// Add Note
const addNote = async (req, res) => {
  try {
    const note = await prisma.note.create({
      data: {
        content: req.body.content,
        leadId: parseInt(req.params.id),
        createdBy: req.user.id
      },
      include: { user: { select: { name: true } } }
    });
    res.status(201).json({
      id: note.id,
      content: note.content,
      author: note.user.name,
      date: 'Just now' // Simplified for frontend
    });
  } catch (error) {
    res.status(400).json({ message: 'Error adding note' });
  }
};

module.exports = { getLeads, getLeadById, createLead, updateLead, deleteLead, addNote };
