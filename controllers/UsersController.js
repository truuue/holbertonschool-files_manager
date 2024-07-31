import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;

    if (!email) {
      res.status(400);
      return res.json({ error: 'Missing email' });
    }
    if (!password) {
      res.status(400);
      return res.json({ error: 'Missing password' });
    }

    const exist = await dbClient.doesUserExist(email);
    if (exist) {
      res.status(400);
      return res.json({ error: 'Already exist' });
    }
    const id = await dbClient.createUser(email, password);

    res.status(201);
    return res.json({ id, email });
  }

  static async getMe(req, res) {
    const token = req.headers['x-token'];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const tokenKey = `auth_${token}`;
    const userId = await redisClient.get(tokenKey);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const user = await dbClient.findUserById(userId);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    return res.status(200).json({ id: user._id, email: user.email });
  }
}
export default UsersController;
