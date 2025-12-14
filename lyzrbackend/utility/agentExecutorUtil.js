import { NODE_TYPES } from "../constants/Common_Constants.js"
export default class AgentExecutorUtil {

    //for running simple agent
    runAgent(agent_id) {
        console.log("Inside of this simple agent with agent id " + agent_id)
        return { success: true, inputToAnotherAgent: " some random input to the agent" }


    }
    //for running human interaction part
    runHumanAgent(human_agent_id) {
        console.log("Inside of this Human agent with agent id " + human_agent_id)

        return { success: true, inputToAnotherAgent: " some random input to the agent" }


    }
    //for running conditional agent
    runConditionalAgent(conditional_agent_id) {
        console.log("Inside of this Conditional agent with agent id " + conditional_agent_id)

        return { success: true, inputToAnotherAgent: " some random input to the agent" }


    }

    //for executing whole workflow
    async executeWorkflow(workflow, input, res) {
        let nodes = workflow[0].nodes
        let edges = workflow[0].edges
        // console.log("Inside of the Execute Workflow ", nodes, edges)

        //maintaing visited set

        let visited = new Set()


        try {
            //finding starting point
            let start_idx = 0;
            let start_id = nodes[0]
            while (start_idx < nodes.length) {
                if (nodes[start_idx].type === NODE_TYPES.INPUT_AGENT) {
                    start_id = nodes[start_idx].id
                    break;
                }
                start_idx++;
            }


            let i = 0
            while (i < edges.length) {
                if (edges[i].source === start_id) {
                    break;
                }
                i++;
            }


            let response = this.dfs(edges, visited, i, NODE_TYPES.INPUT_AGENT, input)
            if (response.success == false) {
                res.sendStatus(500)
            }
            else {
                res.sendStatus(200);
            }

        }
        catch (e) {
            console.log("Error in executework flow ", e)
        }


    }

    dfs(edges, visited, i, j, input) {
        console.log(" edges ", edges, visited, i)
        let currNodeId = edges[i].source
        if (visited.has(currNodeId)) {
            return;
        }
        else {
            let output = null
            if (j === NODE_TYPES.INPUT_AGENT) {
                //execute inital one 
                output = this.runAgent(input);
                if (output.success == false) {
                    visited.delete(currNodeId)
                    return output;
                }
            }
            else if (j === NODE_TYPES.HUMAN) {
                //human agent call
                output = this.runHumanAgent(input)
                if (output.success == false) {
                    visited.delete(currNodeId)
                    return output;
                }
            }
            else if (j === NODE_TYPES.CHECK_AGENT) {
                //call check agent
                output = this.runConditionalAgent(input)
                if (output.success == false) {
                    visited.delete(currNodeId)
                    return output;
                }
            }
            else {

                output = this.runAgent(input)
                if (output.success == false) {
                    visited.delete(currNodeId)
                    return output;
                }

            }
            visited.add(currNodeId)

            edges[i].target.forEach(element => {
                if (!visited.has(element)) {
                    let i = 0
                    while (i < edges.length) {
                        if (edges[i].source === element) {
                            break;
                        }
                        i++;
                    }
                    if (i >= edges.length) {
                        return;
                    }
                    else {
                        return this.dfs(edges, visited, i, edges[i].type, output);
                    }
                }
            });

            return output
        }


    }
}
