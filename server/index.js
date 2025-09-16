import express from 'express';
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';


const typedefs = `
    type Query {
        getUsers: 
    }

    type Mutation {
    
    
    }

    type User {
        id: ID
        name: String
        age: Int
        isMarried: Boolean  
    }
`

const server = new ApolloServer({ typeDefs, resolvers });


const { uri } = await startStandaloneServer(server, {
    listen: {
        port: 4000
    }
})

console.log(`Server running at: ${uri}`);

// Query, Mutation, typedefs, resolver