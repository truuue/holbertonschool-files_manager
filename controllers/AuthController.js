import sha1 from 'sha1';
import { v4 as uuidv4 } from 'uuid';
import { ObjectId } from 'mongodb';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const AuthController = {
  getConnect: async (req, res) => {
    try {
      const b64auth = (req.headers.authorization || '').split(' ')[1] || '';
      if (!b64auth) {
        return res.status(401).json({ error: 'Unauthorized: Missing authorization header' });
      }

      const auth = Buffer.from(b64auth, 'base64').toString('utf-8');
      const [email, password] = auth.split(':');
      if (!email || !password) {
        return res.status(401).json({ error: 'Unauthorized: Invalid credentials' });
      }

      const hashedPassword = sha1(password);

      const usersCollection = dbClient.db.collection('users');
      const user = await usersCollection.findOne({ email });
      if (!user || user.password !== hashedPassword) {
        return res.status(401).json({ error: 'Unauthorized: Incorrect email or password' });
      }

      const token = uuidv4();
      const key = `auth_${token}`;
      const value = user._id.toString();
      const duration = 24 * 60 * 60;

      await redisClient.set(key, value, duration);
      return res.status(200).json({ token });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  getDisconnect: async (req, res) => {
    try {
      const token = req.headers['x-token'];
      if (!token) {
        return res.status(401).json({ error: 'Unauthorized: Missing token' });
      }

      const userId = await redisClient.get(`auth_${token}`);
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
      }

      await redisClient.del(`auth_${token}`);
      return res.status(204).end();
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },
};

export default AuthController;
