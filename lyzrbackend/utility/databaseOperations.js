import { MongoClient } from "mongodb";

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);
//import workFlowStructure from "../asset/workFlowStructure.json" with {type: 'json'}
// import { Low } from 'lowdb';
// import { Memory } from 'lowdb/node.js';

export default class DatabaseOperations {
    // workflow;
    // constructor() {
    //     this.workflow = workFlowStructure;
    //     this.adapter = new Memory();
    //     this.db = new Low(adapter, { workflows: [] });


    // }

    //function to get workflow details from id
    async getWorkflowDetails(workFlowID) {
        //returning dummy

        try {
            await client.connect();
            const db = client.db("workFlow");
            const collection = db.collection("flows");

            let query = {};
            if (workFlowID) {
                query = { workFlowID };
            }

            const workflows = await collection.find(query).toArray();
            return workflows;
        } catch (err) {
            console.error("Error fetching workflow:", err);
            throw err;
        } finally {
            await client.close();
        }
    }

    // Add a new workflow
    async addWorkflowDetails(workFlowDetails) {
        try {
            console.log("here inside addWorkflowDetails", workFlowDetails)
            await client.connect();
            const db = client.db("workFlow");
            const collection = db.collection("flows");
            let workFlowID = workFlowDetails.workFlow_id
            let edges = workFlowDetails.edges
            let nodes = workFlowDetails.nodes
            const result = await collection.insertOne({
                workFlowID,
                edges,
                nodes,
                createdAt: new Date(),
            });

            console.log("✅ Workflow inserted with ID:", result.insertedId);
            return result.insertedId;
        } catch (err) {
            console.error("Error inserting workflow:", err);
            throw err;
        } finally {
            await client.close();
        }
    }



}
