import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

const app=express(); app.use(cors()); app.use(express.json({limit:'2mb'}));
const AI_URL=process.env.AI_URL||'http://localhost:8000';
const uri=process.env.MONGO_URI||'mongodb://127.0.0.1:27017/hiresense';
await mongoose.connect(uri).catch(e=>console.warn('Mongo unavailable:',e.message));

const Job=mongoose.model('Job',new mongoose.Schema({title:String,description:String,createdAt:{type:Date,default:Date.now}}));
const Candidate=mongoose.model('Candidate',new mongoose.Schema({name:String,email:String,resumeText:String,jobDescription:String,analysis:Object,createdAt:{type:Date,default:Date.now}}));

app.get('/api/health',(req,res)=>res.json({ok:true,service:'hiresense-api'}));
app.post('/api/jobs',async(req,res)=>res.status(201).json(await Job.create(req.body)));
app.get('/api/jobs',async(req,res)=>res.json(await Job.find().sort({createdAt:-1}).limit(20)));
app.post('/api/candidates/analyze',async(req,res)=>{
  try{
    const {name,email,resumeText,jobDescription}=req.body;
    if(!resumeText||!jobDescription) return res.status(400).json({error:'resumeText and jobDescription are required'});
    const r=await fetch(`${AI_URL}/match`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({resume_text:resumeText,job_description:jobDescription})});
    if(!r.ok) throw new Error(`AI service returned ${r.status}`);
    const analysis=await r.json();
    const saved=await Candidate.create({name,email,resumeText,jobDescription,analysis});
    res.json(saved);
  }catch(e){res.status(502).json({error:e.message});}
});
app.get('/api/candidates',async(req,res)=>res.json(await Candidate.find().sort({createdAt:-1}).limit(30)));
app.get('/api/dashboard',async(req,res)=>{
  const docs=await Candidate.find().sort({createdAt:-1}).limit(50);
  const avg=docs.length?docs.reduce((a,c)=>a+(c.analysis?.score||0),0)/docs.length:0;
  res.json({candidates:docs.length,averageScore:+avg.toFixed(1),top:docs.sort((a,b)=>(b.analysis?.score||0)-(a.analysis?.score||0)).slice(0,5)});
});
app.listen(process.env.PORT||5000,()=>console.log('HireSense API running'));
