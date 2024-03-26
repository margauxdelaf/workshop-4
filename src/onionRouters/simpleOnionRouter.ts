import bodyParser from "body-parser";
import express from "express";
import {BASE_ONION_ROUTER_PORT,REGISTRY_PORT, ENCRYPTION_ALGORITHM, IV, KEY} from "../config";
import crypto from "crypto";
import {SendMessageBody} from "@/src/users/user";
import {generateKeyPair} from "../config";

let lastReceivedEncryptedMessage:string|null=null;
let lastMessageDestination: number | null = null;
const REGISTRY_URL = `http://localhost:${REGISTRY_PORT}/registerNode`;
function decryptMessage(encryptedMessage:string){
  const decipher=crypto.createDecipheriv(ENCRYPTION_ALGORITHM,KEY,IV);
  let decrypted= decipher.update(encryptedMessage,'hex','utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

async function registerNode(nodeId:number,publicKey:string) {
  try {
    const response= await fetch(REGISTRY_URL,{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        nodeId:nodeId,
        pubKey:publicKey
      })
    });
  } catch(error) {
    console.error("Error registering node : ",error);
  }
}
export async function simpleOnionRouter(nodeId: number) {
  const {publicKey,privateKey} = generateKeyPair();
  await registerNode(nodeId,publicKey);


  const onionRouter = express();
  onionRouter.use(express.json());
  onionRouter.use(bodyParser.json());

  onionRouter.get("/status", (req, res) => {
    res.send("live");
  });

  onionRouter.get("/getLastReceivedEncryptedMessage",(req,res) => {
    res.json({result:lastReceivedEncryptedMessage});
  });



  onionRouter.get("/getLastReceivedDecryptedMessage",(req,res) => {
    const lastReceivedDecryptedMessage= lastReceivedEncryptedMessage ? decryptMessage(lastReceivedEncryptedMessage):null;
    res.json({result:lastReceivedDecryptedMessage});
  });



  onionRouter.get("/getLastMessageDestination",(req,res) => {
    res.send({result:lastMessageDestination});
  });

  onionRouter.get("/getPrivateKey",(req,res) => {
    console.log(privateKey);
    res.json(privateKey);
  })


  const server = onionRouter.listen(BASE_ONION_ROUTER_PORT + nodeId, () => {
    console.log(
      `Onion router ${nodeId} is listening on port ${
        BASE_ONION_ROUTER_PORT + nodeId
      }`
    );
  });

  return server;
}
