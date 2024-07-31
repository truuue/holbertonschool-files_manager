import sha1 from 'sha1';
import { ObjectId } from 'mongodb';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const UsersController = {
  postNew: async (req, res) => {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    const usersCollection = dbClient.db.collection('users');
    const user = await usersCollection.findOne({ email });
    if (user) {
      return res.status(400).json({ error: 'Already exist' });
    }

    const addNewUser = await usersCollection.insertOne({
      email,
      password: sha1(password),
    });

    return res.status(201).json({ email, id: addNewUser.insertedId });
  },

  getMe: async (req, res) => {
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
    return res.status(200).json({ id: user._id.toString(), email: user.email });
  },
};

export default UsersController;
