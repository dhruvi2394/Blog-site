const express = require('express');
const cors =require('cors');
const mongoose = require('mongoose');
const User = require('./models/User');
const Post = require('./models/Post');
const bcrypt = require('bcrypt');
const app = express();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const uploadMiddleware = multer({ dest: 'uploads/' });
const fs = require('fs');

const salt = bcrypt.genSaltSync(10);
const secret = 'asdfe45we45w345wegw345werjktjwertkj';

app.use(cors({credentials:true,origin:'http://localhost:3000'}));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads',express.static(__dirname +'/uploads'));

const dbURI = 'mongodb+srv://dhruvi:Dhruvi2394@dhruvi.cudjb2f.mongodb.net/test?retryWrites=true&w=majority&appName=dhruvi';
mongoose.connect(dbURI)
  .then((result) => app.listen(4000))
  .catch((err) => console.log(err));

app.post('/register', async (req,res) => {
  const{username,password} = req.body;
  try{
    const userDoc= await User.create({username,
      password:bcrypt.hashSync(password,salt),
    });
    res.json(userDoc);

  }
catch(e){
  console.log(e);
  res.status(400).json(e);
}
});

app.post('/login', async (req,res) => {
  const {username,password} = req.body;
  const userDoc= await User.findOne({username});
  const passOk = bcrypt.compareSync(password,userDoc.password);
  if (passOk) {
    // logged in
    jwt.sign({username,id:userDoc._id}, secret, {}, (err,token) => {
      if (err) throw err;
      res.cookie('token',token).json({
        id:userDoc._id,
        username,
      });
    });
  } else {
    res.status(400).json('wrong credentials');
  }
});

app.get('/profile', (req,res) => {
  const {token}= req.cookies;
  jwt.verify(token, secret, {}, (err,info) => {
    if (err) throw err;
    res.json(info);
  });

});

app.post('/logout', (req,res) => {
  res.cookie('token', '').json('ok');
});

app.post('/post',uploadMiddleware.single('file'), async (req,res) => {
  const {originalname,path} = req.file;
  const parts = originalname.split('.');
  const ext = parts[parts.length - 1];
  const newPath = path+'.'+ext;
  fs.renameSync(path, newPath);
  const {token}= req.cookies;
  jwt.verify(token, secret, {}, async (err,info) => {
    if (err) throw err;
    const {title,category,summary,content} = req.body;
    const postDoc = await Post.create({
       title,
       category,
       summary,
       content,
       cover: newPath,
       author:info.id,
     });
   res.json(postDoc);
   
  }); 
});

app.put('/post',uploadMiddleware.single('file'), async (req,res) => {
  let newPath = null;
  if (req.file) {
    const {originalname,path} = req.file;
    const parts = originalname.split('.');
    const ext = parts[parts.length - 1];
    newPath = path+'.'+ext;
    fs.renameSync(path, newPath);
  }
  const {token} = req.cookies;
  jwt.verify(token, secret, {}, async (err,info) => {
    if (err) throw err;
    const {id,title,category,summary,content,cover} = req.body;
    const postDoc = await Post.findByIdAndUpdate(id,{
      title,
      category,
      summary,
      content,
      cover: newPath ? newPath :cover,
    });
    const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
    if (!isAuthor) {
      return res.status(400).json('you are not the author');
    }
 

    res.json(postDoc);
  });
});

app.delete('/post/:id', async (req, res) => {
  const { id } = req.params;
  const { token } = req.cookies;
  
  jwt.verify(token, secret, {}, async (err, info) => {
    if (err) return res.status(401).json('Unauthorized request');
    
    const postDoc = await Post.findById(id);
    if (!postDoc) return res.status(404).json('Post not found');
    
    const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
    if (!isAuthor) {
      return res.status(403).json('You are not the author');
    }

    await postDoc.deleteOne();
    res.status(200).json('Post deleted');
  });
});

app.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, 'username');
    res.json(users);
  } catch (err) {
    res.status(500).json(err);
  }
});

app.get('/posts/users/:username', async (req, res) => {
  const { username } = req.params;
  try {
    // Check if the user exists
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find posts by the user's ID
    const posts = await Post.find({ author: user._id })
      .populate('author', ['username'])
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    console.error(err); // Log the error
    res.status(500).json({ message: 'Internal Server Error' });
  }
});



app.get('/post', async (req,res) => {
  res.json(
    await Post.find()
      .populate('author', ['username'])
      .sort({createdAt: -1})
      .limit(20)
  );
});

app.get('/post/:id', async (req, res) => {
  const {id} = req.params;
  const postDoc = await Post.findById(id).populate('author', ['username']);
  res.json(postDoc);
})
//app.listen(4000);