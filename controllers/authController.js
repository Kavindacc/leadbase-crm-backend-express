const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../prismaClient');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
    expiresIn: '30d',
  });
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user.id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const seedUsers = async (req, res) => {
  try {
    const usersToSeed = [
      { name: 'Admin User', email: 'admin@example.com', password: 'password123', role: 'admin' },
      { name: 'Sales Man01', email: 'sale01@leadbase.com', password: '123user1', role: 'salesperson' },
      { name: 'Sales Man02', email: 'sale@leadbase.com', password: '123user2', role: 'salesperson' }
    ];

    const results = [];
    for (const u of usersToSeed) {
      const exists = await prisma.user.findUnique({ where: { email: u.email } });
      if (!exists) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(u.password, salt);
        const user = await prisma.user.create({
          data: {
            name: u.name,
            email: u.email,
            password: hashedPassword,
            role: u.role,
          },
        });
        results.push({ email: user.email, status: 'Created' });
      } else {
        results.push({ email: exists.email, status: 'Already exists' });
      }
    }
    
    res.status(201).json({ message: 'Seeding completed', results });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error seeding users' });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, role: true }
    });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching users' });
  }
};

module.exports = { loginUser, seedUsers, getUsers };
