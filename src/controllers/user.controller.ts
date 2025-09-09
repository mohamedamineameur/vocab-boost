import env from '../config/env.ts';
import type { Request } from 'express';
import type { Response } from 'express';
import { User } from '../models/user.model.ts';
import bcrypt from 'bcrypt';
import { bodyValidator } from '../validations/bodyValidator.ts';
import { userCreationSchema, updateUserSchema } from '../validations/user.schemas.ts';

export const createUser = async (req: Request, res: Response) => {
  try {
    const error = bodyValidator(req.body, userCreationSchema);
    if (error.length > 0) {
      return res.status(400).json({ error }); 
    }
    const { email, password, firstname, lastname, passwordConfirmation } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
   if (existingUser) {
  return res.status(400).json({ error: 'User already exists' }); // 👈 utilise "error"
}
    

    // Validate password confirmation
    if (password !== passwordConfirmation) {
      return res.status(400).json({ error: 'Password confirmation does not match' });
    }

    // Hash the password
    const saltRounds = env.SALT_ROUNDS || 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = await User.create({
      email,
      password: hashedPassword,
      firstname,
      lastname,
      isVerified: false,
    });

    res.status(201).json({ message: 'User created successfully', userId: newUser.id });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password', 'verificationToken', 'oneTimePassword', 'otpExpiration'] },
    });
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password', 'verificationToken', 'oneTimePassword', 'otpExpiration'] },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' }); 
    }

    return res.status(200).json(user); 
  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(500).json({ error: 'Internal server error' }); 
  }
};


export const updateUserPartialOrFull = async (req: Request, res: Response) => {
  try {
    const error = bodyValidator(req.body, updateUserSchema);
    if (error.length > 0) {
      return res.status(400).json({ error }); 
    }
    const { id } = req.params;
    const { email, password, firstname, lastname, newPassword, passwordConfirmation } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // check if old password matches
    if (password) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: 'Old password is incorrect' });
      }
    }

    // Validate new password confirmation
    if (newPassword && newPassword !== passwordConfirmation) {
      return res.status(400).json({ error: 'New password confirmation does not match' });
    }

    // Hash the new password if provided
    let hashedPassword = user.password;
    if (newPassword) {
      const saltRounds = env.SALT_ROUNDS || 10;
      hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    }

    // Update only provided fields
    await user.update({
      email: email || user.email,
      password: hashedPassword || user.password,
      firstname: firstname || user.firstname,
      lastname: lastname || user.lastname,
    });

    res.status(200).json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await user.destroy();
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
