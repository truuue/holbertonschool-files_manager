import sha1 from 'sha1';
import { v4 as uuidv4 } from 'uuid';
import { ObjectId } from 'mongodb';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const AuthController = {
  getConnect: async (req, res) => {
    const b64auth = (req.headers.authorization || '').split(' ')[1] || '';
    if (!b64auth) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const auth = Buffer.from(b64auth, 'base64').toString('utf-8');
    const email = auth.split(':')[0] || '';
    const password = auth.split(':')[1];
    if (!password || !email) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const hashedPassword = sha1(password);

    const usersCollection = dbClient.db.collection('users');
    const user = await usersCollection.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (user.password !== hashedPassword) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = uuidv4();
    const key = `auth_${token}`;
    const value = user._id.toString();
    const duration = 24 * 60 * 60;
    await redisClient.set(key, value, duration);
    return res.status(200).json({ token });
  },

  getDisconnect: async (req, res) => {
    const token = req.headers['x-token'];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const _id = new ObjectId(userId);
    const usersCollection = dbClient.db.collection('users');
    const user = await usersCollection.findOne({ _id });
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    await redisClient.del(`auth_${token}`);
    return res.status(204).end();
  },
};

export default AuthController;
