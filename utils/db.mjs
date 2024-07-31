import MongoClient from 'mongodb/lib/mongo_client';

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';
    const url = `mongodb://${host}:${port}`;
    MongoClient.connect(url, { useUnifiedTopology: true }, (error, client) => {
      if (error) {
        console.log('Error connecting to MongoDB:', error);
        this.db = null;
      } else {
        this.db = client.db(database);
        console.log('Connected to MongoDB');
      }
    });
  }

  isAlive() {
    return !!this.db;
  }

  async nbUsers() {
    const users = this.db ? this.db.collection('users') : null;
    return users ? users.countDocuments() : 0;
  }

  async nbFiles() {
    const files = this.db ? this.db.collection('files') : null;
    return files ? files.countDocuments() : 0;
  }
}

const dbClient = new DBClient();

export default dbClient;
