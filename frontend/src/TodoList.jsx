import { useState, useEffect } from 'react'
import './App.css'
import { useAuth } from './context/AuthContext.jsx';
import './App.css'
import TodoItem from './TodoItem.jsx';


function TodoList({apiUrl}) {
  const TODOLIST_API_URL = apiUrl;
  const { username, accessToken, logout } = useAuth();

  const [todoList, setTodoList] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  useEffect(() => {
    fetchTodoList();
  }, [username]);

  async function fetchTodoList() {
  try {
    const response = await fetch(TODOLIST_API_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch");
    }

    const data = await response.json();
    setTodoList(data);

  } catch (err) {
    console.error("Failed to fetch todo list:", err);
    setTodoList([]);
  }
}
  async function toggleDone(id) {
    const url = `${TODOLIST_API_URL}${id}/toggle/`

    try {
      const response = await fetch(url, { method: 'PATCH' })

      if (response.ok) {
        const updatedTodo = await response.json()

        setTodoList(prev =>
          prev.map(todo =>
            todo.id === id ? updatedTodo : todo
          )
        )
      }
    } catch (error) {
      console.error("Error toggling todo:", error)
    }
  }

  async function deleteTodo(id) {
    const url = `${TODOLIST_API_URL}${id}/`

    try {
      const response = await fetch(url, { method: 'DELETE' })

      if (response.ok) {
        setTodoList(prev =>
          prev.filter(todo => todo.id !== id)
        )
      }
    } catch (error) {
      console.error("Error deleting todo:", error)
    }
  }

  async function addNewTodo() {
    if (!newTitle.trim()) return

    try {
      const response = await fetch(TODOLIST_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newTitle }),
      })

      if (response.ok) {
        const newTodo = await response.json()

        setTodoList(prev => [...prev, newTodo])
        setNewTitle("")
      }
    } catch (error) {
      console.error("Error adding new todo:", error)
    }
  }

  async function addNewComment(todoId, newComment) {
    if (!newComment.trim()) return

    try {
      const url = `${TODOLIST_API_URL}${todoId}/comments/`

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: newComment }),
      })

      if (response.ok) {
        await fetchTodoList()
      }
    } catch (error) {
      console.error("Error adding new comment:", error)
    }
  }

  return (
    <>
      <h1>Todo List</h1>
        
      <ul>
        {todoList.map(todo => (
          <TodoItem
            key={todo.id}
            todo={todo}
            toggleDone={toggleDone}
            deleteTodo={deleteTodo}
            addNewComment={addNewComment}
          />
        ))}
      </ul>
    
      <div>
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <button onClick={addNewTodo}>Add</button>
      </div>
      <br/>
      <a href="/about">About</a>
      <br/>
      {username && (
        <a href="#" onClick={(e) => {e.preventDefault(); logout();}}>Logout</a> )}

    </>
  )
}





export default TodoList; 