import bodyParser from "body-parser";
import express from "express";
import { BASE_USER_PORT } from "../config";
import {ENCRYPTION_ALGORITHM,IV,KEY} from "../config";
import crypto from "crypto";

export type SendMessageBody = {
  message: string;
  destinationUserId: number;
};


const usersData= new Map();
// Make sure to update the map entry as Maps hold references and do not auto-update.
function initializeUserData(userId:number) {
  if (!usersData.has(userId)) {
    usersData.set(userId, { lastReceivedMessage: null, lastSentMessage: null });
  }
}
function updateLastReceivedMessage(userId:number, message:string) {
  if (usersData.has(userId)) {
    const userData = usersData.get(userId);
    userData.lastReceivedMessage = message;
    usersData.set(userId, userData);
  }
}
function updateLastSentMessage(userId:number, message:string) {
  if (usersData.has(userId)) {
    const userData = usersData.get(userId);
    userData.lastSentMessage = message;
    usersData.set(userId, userData);
  }
}

function getLastReceivedMessage(userId:number){
  if (usersData.has(userId)) {
    const userData = usersData.get(userId);
    return userData.lastReceivedMessage;
  }
}
function getLastSentMessage(userId:number){
  if (usersData.has(userId)) {
    const userData = usersData.get(userId);
    return userData.lastSentMessage;
  }
}
function decryptMessage(encryptedMessage:string){
  const decipher=crypto.createDecipheriv(ENCRYPTION_ALGORITHM,KEY,IV);
  let decrypted= decipher.update(encryptedMessage,'hex','utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

export async function user(userId: number) {
  initializeUserData(userId);
  const _user = express();
  _user.use(express.json());
  _user.use(bodyParser.json());


  _user.get("/status", (req, res) => {
    res.send("live");
  });

  _user.get("/getLastReceivedMessage",(req,res) => {
    console.log(usersData);
    const lastReceived= getLastReceivedMessage(userId);
    res.json({result:lastReceived});
  });

  _user.get("/getLastSentMessage",(req,res) => {
    console.log(usersData);
    const lastSent= getLastSentMessage(userId);
    res.json({result:lastSent});
  });


  _user.post('/message',(req,res)=> {
    console.log(usersData);
    const {message} = req.body;
    updateLastReceivedMessage(userId,message);
    res.send("success");
  });

  _user.post("/sendMessage",async (req,res)=> {
    console.log(usersData);

    const{userPort, message,destinationUserId} = req.body;
    updateLastSentMessage(userId,message);
    const RECIPIENT_PORT= BASE_USER_PORT + destinationUserId;
    try{
      await fetch(`http://localhost:${RECIPIENT_PORT}/message`,{
        method:"POST",
        headers:{
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message:message
        })

      })
      res.json({ status: 'Message sent successfully' });
    }catch (error) {
      console.error("Error forwarding message:", error);
      res.status(500).json({ error: "Failed to forward message" });
  }});



  const server = _user.listen(BASE_USER_PORT + userId, () => {
    console.log(
      `User ${userId} is listening on port ${BASE_USER_PORT + userId}`
    );
  });

  return server;
}
