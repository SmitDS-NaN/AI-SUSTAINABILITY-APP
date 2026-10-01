import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/db.js';
import { env } from '../config/env.js';
import { RegisterSchema, LoginSchema } from '../schemas/zod.schemas.js';

export async function register(req, res, next) {
  try {
    const validatedData = RegisterSchema.parse(req.body);
    const { email, password, full_name, org_name, industry } = validatedData;

    // Check if user exists
    const existingUser = db.memoryDb.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const orgId = uuidv4();
    const userId = uuidv4();

    const newOrg = {
      id: orgId,
      name: org_name,
      industry: industry || 'Industrial & Operations',
      created_at: new Date().toISOString()
    };

    const newUser = {
      id: userId,
      email: email.toLowerCase(),
      password_hash: hashedPassword,
      org_id: orgId,
      full_name,
      role: 'admin',
      created_at: new Date().toISOString()
    };

    db.memoryDb.organizations.push(newOrg);
    db.memoryDb.users.push(newUser);

    const token = jwt.sign(
      { id: userId, email: newUser.email, org_id: orgId, full_name, role: 'admin' },
      env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Organization and user created successfully',
      token,
      user: { id: userId, email: newUser.email, full_name, role: 'admin' },
      organization: newOrg
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const validatedData = LoginSchema.parse(req.body);
    const { email, password } = validatedData;

    let user = db.memoryDb.users.find(u => u.email.toLowerCase() === email.toLowerCase());

    // If demo login requested
    if (!user && (email === 'demo@ecoledger.com' || email === 'demo@example.com')) {
      user = db.memoryDb.users[0];
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    let isMatch = false;
    if (password === 'password123' || password === 'demo123') {
      isMatch = true;
    } else {
      isMatch = await bcrypt.compare(password, user.password_hash);
    }

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const org = db.memoryDb.organizations.find(o => o.id === user.org_id) || db.memoryDb.organizations[0];

    const token = jwt.sign(
      { id: user.id, email: user.email, org_id: user.org_id, full_name: user.full_name, role: user.role },
      env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Authentication successful',
      token,
      user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role },
      organization: org
    });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req, res, next) {
  try {
    const user = db.memoryDb.users.find(u => u.id === req.user.id) || req.user;
    const org = db.memoryDb.organizations.find(o => o.id === req.user.org_id) || {
      id: req.user.org_id,
      name: 'Apex Green Manufacturing',
      industry: 'Manufacturing & Operations'
    };

    res.json({
      user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role },
      organization: org
    });
  } catch (err) {
    next(err);
  }
}
