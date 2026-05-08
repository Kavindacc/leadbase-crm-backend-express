const prisma = require('../prismaClient');

const getDashboardStats = async (req, res) => {
  try {
    const totalLeads = await prisma.lead.count();
    
    const newLeads = await prisma.lead.count({ where: { status: 'New' } });
    const qualifiedLeads = await prisma.lead.count({ where: { status: 'Qualified' } });
    const wonLeads = await prisma.lead.count({ where: { status: 'Won' } });
    const lostLeads = await prisma.lead.count({ where: { status: 'Lost' } });

    const allLeadsAggr = await prisma.lead.aggregate({ _sum: { dealValue: true } });
    const wonLeadsAggr = await prisma.lead.aggregate({
      where: { status: 'Won' },
      _sum: { dealValue: true }
    });

    const totalPipelineValue = allLeadsAggr._sum.dealValue || 0;
    const wonDealValue = wonLeadsAggr._sum.dealValue || 0;

    const recentLeads = await prisma.lead.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true } } }
    });

    // Map recentLeads to fit frontend requirements easily
    const formattedRecentLeads = recentLeads.map(lead => ({
      id: lead.id,
      name: lead.leadName,
      company: lead.companyName,
      status: lead.status,
      value: `$${lead.dealValue.toLocaleString()}`,
      date: lead.createdAt.toLocaleDateString(),
      salesperson: lead.user?.name || 'Unassigned'
    }));

    res.json({
      stats: {
        totalLeads,
        newLeads,
        qualifiedLeads,
        wonLeads,
        lostLeads,
        totalPipelineValue,
        wonDealValue
      },
      recentLeads: formattedRecentLeads
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching dashboard stats' });
  }
};

module.exports = { getDashboardStats };
