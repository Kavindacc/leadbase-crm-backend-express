const prisma = require('./prismaClient');

async function main() {
  console.log("Starting to seed dummy leads...");

  // Get users to assign leads to
  const users = await prisma.user.findMany();
  if (users.length === 0) {
    console.log("No users found. Please run the user seed command first.");
    return;
  }

  const dummyLeads = [
    {
      leadName: "Alice Johnson",
      companyName: "TechNova Solutions",
      email: "alice@technova.com",
      phone: "+1-555-0101",
      leadSource: "Website",
      status: "New",
      dealValue: 15000,
      assignedTo: users[0].id
    },
    {
      leadName: "Michael Chang",
      companyName: "Global Trade Inc",
      email: "m.chang@globaltrade.io",
      phone: "+1-555-0102",
      leadSource: "LinkedIn",
      status: "Qualified",
      dealValue: 32000,
      assignedTo: users[1 % users.length].id
    },
    {
      leadName: "Sarah Connor",
      companyName: "CyberDyne Systems",
      email: "sconnor@cyberdyne.com",
      phone: "+1-555-0103",
      leadSource: "Referral",
      status: "Proposal Sent",
      dealValue: 120000,
      assignedTo: users[2 % users.length].id
    },
    {
      leadName: "James Bond",
      companyName: "MI6 Consulting",
      email: "jbond@mi6.gov.uk",
      phone: "+44-7700-900007",
      leadSource: "Event",
      status: "Won",
      dealValue: 250000,
      assignedTo: users[0].id
    },
    {
      leadName: "Bruce Wayne",
      companyName: "Wayne Enterprises",
      email: "bruce@wayne.com",
      phone: "+1-555-0105",
      leadSource: "Cold Email",
      status: "Lost",
      dealValue: 500000,
      assignedTo: users[1 % users.length].id
    },
    {
      leadName: "Clark Kent",
      companyName: "Daily Planet",
      email: "ckent@dailyplanet.com",
      phone: "+1-555-0106",
      leadSource: "Website",
      status: "New",
      dealValue: 5000,
      assignedTo: users[2 % users.length].id
    }
  ];

  for (const leadData of dummyLeads) {
    const lead = await prisma.lead.create({ data: leadData });
    
    // Add status history
    await prisma.leadStatusHistory.create({
      data: {
        leadId: lead.id,
        fromStatus: "None",
        toStatus: lead.status,
        changedBy: lead.assignedTo
      }
    });

    // Add a dummy note
    await prisma.note.create({
      data: {
        leadId: lead.id,
        content: `Initial contact established with ${lead.leadName} from ${lead.companyName}.`,
        createdBy: lead.assignedTo
      }
    });

    console.log(`Created lead: ${lead.leadName} (${lead.status})`);
  }

  console.log("Dummy leads and notes seeded successfully!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
