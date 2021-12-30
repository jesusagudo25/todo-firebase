// jshint esversion: 8
import { login, logout } from "./auth.js";
import { insert, getItems, update } from "./firestore.js";
import { getUUID } from "./utils.js";

let buttonLogin = document.querySelector('#button-login');
let buttonLogout = document.querySelector('#button-logout');
let todoForm = document.querySelector('#todo-form');
let userInfo = document.querySelector('#user-info');
let todoInput = document.querySelector('#todo-input');
let todosContainer = document.querySelector('#todos-container');

let currentUser;
let todos = [];

firebase.auth().onAuthStateChanged(user =>{
  if(user){
    currentUser = user;
    console.log('Usuario logueado', currentUser.displayName);
    init();
  }
  else{
    console.log('No hay usuario logueado');
  }
});

buttonLogin.addEventListener("click", async (e) => {
  try {
    currentUser =  await login();
    
  } catch (error) {
    console.error(error);
  }
});


buttonLogout.addEventListener("click", (e) => {
  logout();
  buttonLogin.classList.remove("hidden");
  buttonLogout.classList.add("hidden");
  todoForm.classList.add("hidden");
  todosContainer.innerHTML = "";
});

todoForm.addEventListener('submit', (e) =>{
  e.preventDefault();
  const text = todoInput.value;
  
  if(text != ''){
    addTodo(text);
    todoInput.value = "";
    loadTodos();
  }
});

async function addTodo(text) {
  try {
    const todo = {
      id: getUUID(),
      text: text,
      completed: false,
      userid: currentUser.uid,
    };

    const response = await insert(todo);

  } catch (error) {
    console.error(error);
  }  
}

function init(){
  buttonLogin.classList.add('hidden');
  buttonLogout.classList.remove('hidden');
  todoForm.classList.remove('hidden');

  userInfo.innerHTML = `<img src= "${currentUser.photoURL}" width="32"/>
  <span>${currentUser.displayName}</span>
  `;

  loadTodos();
}

async function loadTodos(){
  todosContainer.innerHTML = "";
  todos = [];

  try {
    const response = await getItems(currentUser.uid);

    todos = [... response];
    renderTodos();

  } catch (error) {
    
  }
}

function renderTodos() {
  let html = "";
  todos.forEach((todo) => {
    html += `
      <li>
        <input type="checkbox" id="${todo.id}" ${
      todo.completed ? "checked" : ""
    } />
        <label for="${todo.id}">${todo.text}</label>
      </li>
    `;
  });

  todosContainer.innerHTML = html;

  document
    .querySelectorAll('#todos-container input[type="checkbox"]')
    .forEach((checkbox) => {
      checkbox.addEventListener("change", async (e) => {
        const id = e.target.id;
        try {
          await update(id, e.target.checked);
        } catch (error) {
          console.error(error);
        }
      });
    });
}
