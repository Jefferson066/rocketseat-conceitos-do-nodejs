const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function userFactory (name, username) {
  const newUser = { 
    id: uuidv4(), 
    name,
    username,
    todos: []
  }
  return newUser
};

function todoFactory (title , deadline) {
  const newTodo ={ 
    id: uuidv4(), 
    title,
    done: false, 
    deadline:  new Date(deadline), 
    created_at: new Date()
  }
  return newTodo
};

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const findUser = users.find(user => user.username === username);

  if(findUser){
    next()
  }else{
    response.status(400).json({error: 'usuário não encontrado'})
  }
}

app.post('/users', (request, response) => {
  const { name, username }=  request.body;
  if(!name || ! username){
    response.status(400).json({error: 'name ou username nao digitado'})
  }
  const user = userFactory(name, username);
  users.push(user);
  response.status(200).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const findUser = users.find(user => user.username === username);
  response.status(200).json(findUser.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  // Complete aqui
  const { title , deadline }=  request.body;
  const { username } = request.headers;
  if(!title || ! deadline){
    response.status(400).json({error: 'title ou deadline nao digitado'})
  };
  const todo = todoFactory (title , deadline);
  const user = users.find(user => user.username === username);
  user.todos.push(todo);
  response.status(200).json({msg: 'todo armazenada'})
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  // Complete aqui
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  // Complete aqui
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  // Complete aqui
});

module.exports = app;