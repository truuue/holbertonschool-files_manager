import { MongoClient } from 'mongodb';

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';

    this.client = new MongoClient(`mongodb://${host}:${port}`, { useUnifiedTopology: true });
    this.database = database;
  }

  async isAlive() {
    try {
      await this.client.connect();
      return true;
    } catch (error) {
      return false;
    }
  }

  async nbUsers() {
    try {
      await this.client.connect();
      const collection = this.client.db(this.database).collection('users');
      const count = await collection.countDocuments();
      return count;
    } catch (error) {
      return -1;
    }
  }

  async nbFiles() {
    try {
      await this.client.connect();
      const collection = this.client.db(this.database).collection('files');
      const count = await collection.countDocuments();
      return count;
    } catch (error) {
      return -1;
    }
  }
}

const dbClient = new DBClient();
export { dbClient };
