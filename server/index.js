import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// Open SQLite database (stored in a file named database.sqlite)
const db = await open({
  filename: 'database.sqlite',
  driver: sqlite3.Database,
});
// Create table if it doesn't exist
await db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    age INTEGER,
    isMarried BOOLEAN
  )
`);


const typeDefs = `
  type Query {
    getUsers: [User]
    getUserById(id: ID!): User
  }

  type Mutation {
    createUser(name: String!, age: Int!, isMarried: Boolean!): User
    deleteUser(id: ID!): ID
  }

  type User {
    id: ID
    name: String
    age: Int
    isMarried: Boolean  
  }
`;

const resolvers = {
  Query: {
    getUsers: async () => {
      return await db.all(`SELECT * FROM users`);
    },
    getUserById: async (parent, args) => {
      return await db.get(`SELECT * FROM users WHERE id = ?`, args.id);
    },
  },
  Mutation: {
    createUser: async (parent, args) => {
      const { name, age, isMarried } = args;
      const result = await db.run(
        `INSERT INTO users (name, age, isMarried) VALUES (?, ?, ?)`,
        [name, age, isMarried ? 1 : 0]
      );
      return await db.get(`SELECT * FROM users WHERE id = ?`, result.lastID);
    },
    deleteUser: async (parent, args) => {
      const id = args.id;
      await db.run(`DELETE FROM users WHERE id = ?`, id);
      return id;
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
});

console.log(`🚀 Server ready at: ${url}`);
