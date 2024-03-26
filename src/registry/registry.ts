import bodyParser from "body-parser";
import express, { Request, Response } from "express";
import { REGISTRY_PORT } from "../config";
export type Node = { nodeId: number; pubKey: string };

export type RegisterNodeBody = {
  nodeId: number;
  pubKey: string;
};

export type GetNodeRegistryBody = {
  nodes: Node[];
};
let nodes:Node[]=[];

export function restNodeRegistry(){
    nodes.length=0;
}
export async function launchRegistry() {
  const _registry = express();
  _registry.use(express.json());
  _registry.use(bodyParser.json());


   _registry.get("/status", (req, res) => {
     res.send("live");
   });


   _registry.get("/getNodeRegistry",(req,res) => {
     const registryBody: GetNodeRegistryBody = {
       nodes:nodes
     };
     res.json(registryBody);
   });

   _registry.post("/registerNode",(req,res)=> {
     const {nodeId,pubKey}:RegisterNodeBody= req.body;
     const newNode:Node= {nodeId,pubKey};

     nodes.push(newNode);
     console.log("length nodes : ",nodes.length);
     res.status(200).send(`Node ${nodeId} registered successfully`);
   });

  const server = _registry.listen(REGISTRY_PORT, () => {
    console.log(`registry is listening on port ${REGISTRY_PORT}`);
  });

  return server;
}
