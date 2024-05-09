const { MongoClient } = require('mongodb');

// Connection URI
const uri = 'mongodb://localhost:27017';

// Database Name
const dbName = 'Events';

// Collection Names
const collectionNames = ['eventslinks', 'eventsdates', 'eventsdatas'];

// Function to delete all documents from a collection
async function deleteAllDocuments(collectionName) {
    const client = new MongoClient(uri);

    try {
        await client.connect();

        const database = client.db(dbName);
        const collection = database.collection(collectionName);

        // Delete all documents from the collection
        const result = await collection.deleteMany({});

        console.log(`${result.deletedCount} documents deleted from ${collectionName}`);
    } catch (error) {
        console.error(`Error deleting documents from ${collectionName}:`, error);
    } finally {
        await client.close();
    }
}

// Function to delete all documents from each collection
async function deleteAllData() {
    for (const collectionName of collectionNames) {
        await deleteAllDocuments(collectionName);
    }
}

// Call the function to delete all data from each collection
deleteAllData();
