import express from 'express';

//mock data 
import workflow from '../asset/workFlowStructure.json' with { type: 'json' };
import DatabaseOperations from '../utility/databaseOperations.js';
import AgentExecutorUtil from '../utility/agentExecutorUtil.js';



const router = express.Router();

// GET /api/workflows
router.post('/createworkflow', async (req, res) => {
    console.log("Getting this request from postman, ", req.body, req.body.config)
    await new DatabaseOperations().addWorkflowDetails(req.body)
    res.json({ workflows: [] });
});

router.post('/executeworkflow', async (req, res) => {
    console.log("Starting Execution of the execute workflow");

    try {
        //get workflow id from request
        let workFlow_id = req.body.id
        let input = "Some Input Value, some taks "
        let workFlowDetails = new DatabaseOperations();
        let agentExecutor = new AgentExecutorUtil();
        let data = await workFlowDetails.getWorkflowDetails(workFlow_id);
        //console.log("data is ", data, workFlow_id)
        await agentExecutor.executeWorkflow(data, input, res);




    }
    catch (e) {
        console.log("Something wrong went with execution workflow ", e)
        res.send("Internal Server Error").status(500)
    }

})
export default router;
