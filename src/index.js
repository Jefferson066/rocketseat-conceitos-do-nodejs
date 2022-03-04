const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function userFactory(name, username) {
  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }
  return newUser
};

function todoFactory(title, deadline) {
  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }
  return newTodo
};

const getUser = (username) => {
  return users.find(user => user.username === username);
}

const getTodoForUser = (user, id) => {
  return user.todos.find(todo => todo.id === id);
}

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = getUser(username);
  if (user) {
    request = {...request, user}
    next();
  } else {
    response.status(404).json({ error: 'usuário não encontrado' })
  }
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;
  if (!name || !username) {
    response.status(400).json({ error: 'name ou username nao digitado' })
    return;
  }
  if( getUser(username )){
    response.status(400).json({ error: 'username ja existe' })
    return;
  }
  const user = userFactory(name, username);
  users.push(user);
  response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const user = getUser(username)
  response.status(201).json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { username } = request.headers;
  if (!title || !deadline) {
    response.status(400).json({ error: 'title ou deadline nao digitado' })
  };
  const todo = todoFactory(title, deadline);
  const user = getUser(username);
  user.todos.push(todo);
  response.status(201).json(todo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { username } = request.headers;
  const { id } = request.params;
  if (!title || !deadline || !id) {
    response.status(400).json({ error: 'title ou deadline ou id nao digitado' })
  };
  const user = getUser(username);
  let todo = getTodoForUser(user, id);
  if(todo){
    let newTodo = Object.assign({}, todo)
    newTodo.title = title
    newTodo.deadline = new Date(deadline)
    let newArrayTodos = user.todos.filter( todos => todos.id !== todo.id);
    newArrayTodos.push(newTodo)
    user.todos = newArrayTodos
    response.status(201).json(newTodo)
  }else{
    response.status(404).json({error: 'essa todo nao existe'})
  }
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { id } = request.params;
  const user = getUser(username);
  let todo = getTodoForUser(user, id);
  if(todo){
    todo = { ...todo, done: true };
    response.status(201).json(todo)
  }else{
    response.status(404).json({error: 'essa todo nao existe'})
  }
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { id } = request.params;
  let user = getUser(username);
  let todo = user.todos.find( todo => todo.id === id);
  if(!todo){
    response.status(404).json({error: 'essa todo nao existe'})
  }
  const newArrayTodos = user.todos.filter( todo => todo.id !== id);
  user.todos = newArrayTodos
  response.status(204).json()
});

module.exports = app;