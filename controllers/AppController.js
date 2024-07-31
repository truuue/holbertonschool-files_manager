import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const AppController = {
  getStatus: async (req, res) => {
    try {
      const dbStatus = await dbClient.isAlive();
      const redisStatus = await redisClient.isAlive();
      if (dbStatus && redisStatus) {
        res.status(200).json({ redis: redisStatus, db: dbStatus });
      } else {
        res.status(503).json({ redis: redisStatus, db: dbStatus });
      }
    } catch (error) {
      console.log(error);
      res.status(400).end();
    }
  },
  getStats: async (req, res) => {
    try {
      const nbUsers = await dbClient.users.countDocuments();
      const nbFiles = await dbClient.files.countDocuments();
      res.status(200).json({ users: nbUsers, files: nbFiles });
    } catch (error) {
      console.log(error);
      res.status(400).end();
    }
  },
};

export default AppController;
