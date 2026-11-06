import {evaluateSubmission,summarizeAgent} from '../src/evals.js';
const agent={id:'relay',name:'Relay Support'};
const r=evaluateSubmission({agentId:'relay',suiteId:'classification',outputs:['billing','technical','sales','billing','technical'],runLabel:'ILLUSTRATIVE SELF-SUBMITTED SAMPLE'},[agent]);
console.log(JSON.stringify({run:r,summary:summarizeAgent('relay',[r]),warning:'ILLUSTRATIVE FIXTURE: No agent was executed'},null,2));
