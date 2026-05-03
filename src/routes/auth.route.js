import express from 'express';
import { signup } from '#controllers/auth.controller.js';

const router = express.Router();

router.post('/signup', signup);



router.post('/signup', (req,res) =>{
  res.send('POST /api/auth/sign-inresponse');
});


router.post('/signup', (req,res) =>{
  res.send('POST /api/auth/sign-out response');
});
  

export default router;
