import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

const app=express(); app.use(cors()); app.use(express.json({limit:'2mb'}));
const AI_URL=(process.env.AI_URL||'http://localhost:8000').replace(/\/$/,'');
const __dirname=path.dirname(fileURLToPath(import.meta.url));

let dbReady=false;
if(process.env.MONGO_URI){
  try{await mongoose.connect(process.env.MONGO_URI);dbReady=true;console.log('MongoDB connected')}
  catch(e){console.warn('Mongo unavailable, using demo memory store:',e.message)}
}else console.log('MONGO_URI not set; using demo memory store');

const Candidate=mongoose.model('Candidate',new mongoose.Schema({name:String,email:String,resumeText:String,jobDescription:String,analysis:Object,createdAt:{type:Date,default:Date.now}}));
const memory=[];

app.get('/api/health',(req,res)=>res.json({ok:true,service:'hiresense-api',storage:dbReady?'mongodb':'memory'}));
app.post('/api/candidates/analyze',async(req,res)=>{
  try{
    const {name,email,resumeText,jobDescription}=req.body;
    if(!resumeText||!jobDescription) return res.status(400).json({error:'resumeText and jobDescription are required'});
    const r=await fetch(`${AI_URL}/match`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({resume_text:resumeText,job_description:jobDescription})});
    if(!r.ok) throw new Error(`AI service returned ${r.status}`);
    const analysis=await r.json();
    let saved;
    if(dbReady) saved=await Candidate.create({name,email,resumeText,jobDescription,analysis});
    else {saved={_id:crypto.randomUUID(),name,email,resumeText,jobDescription,analysis,createdAt:new Date().toISOString()};memory.unshift(saved)}
    res.json(saved);
  }catch(e){res.status(502).json({error:e.message});}
});
app.get('/api/candidates',async(req,res)=>res.json(dbReady?await Candidate.find().sort({createdAt:-1}).limit(30):memory.slice(0,30)));
app.get('/api/dashboard',async(req,res)=>{
  const docs=dbReady?await Candidate.find().sort({createdAt:-1}).limit(50):memory.slice(0,50);
  const avg=docs.length?docs.reduce((a,c)=>a+(c.analysis?.score||0),0)/docs.length:0;
  res.json({candidates:docs.length,averageScore:+avg.toFixed(1),storage:dbReady?'mongodb':'memory'});
});

const clientDist=path.resolve(__dirname,'../../client/dist');
app.use(express.static(clientDist));
app.use((req,res,next)=>{
  if(req.method==='GET'&&!req.path.startsWith('/api/')) return res.sendFile(path.join(clientDist,'index.html'));
  next();
});

app.listen(process.env.PORT||5000,'0.0.0.0',()=>console.log('HireSense web app running'));
