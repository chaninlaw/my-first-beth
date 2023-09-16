import { Elysia, t } from 'elysia'
import { html } from '@elysiajs/html'
import * as elements from 'typed-html'

const app = new Elysia()
  .use(html())
  .get('/', ({ html }) =>
    html(
      <BaseHTML>
        <div class="h-screen flex justify-center items-center bg-slate-800">
          <div class="flex flex-col items-center">
            <h1 class="text-3xl text-white">Hello, World!!</h1>
            <button
              class="border-1 bg-slate-200 rounded-md py-2 px-1"
              hx-post="/clicked"
              hx-trigger="click"
              hx-swap="outerHTML"
            >
              Click me!
            </button>
          </div>
        </div>
      </BaseHTML>
    )
  )
  .post('/clicked', () => (
    <div class="text-teal-400 mt-4 flex flex-col items-center">
      <p>Hey, I'm from server</p>
      <button
        hx-get="/todos"
        hx-trigger="click"
        hx-swap="outerHTML"
        class="rounded-lg bg-green-950 border-2 border-green-400 px-2 py-1"
      >
        Todo
      </button>
    </div>
  ))
  .get('/todos', () => <TodoList todos={db} />)
  .post(
    '/todos/toggle/:id',
    ({ params }) => {
      const todo = db.find((todo) => todo.id === params.id)
      if (todo) {
        todo.completed = !todo.completed
        return <TodoItem {...todo} />
      }
    },
    {
      params: t.Object({
        id: t.Numeric(),
      }),
    }
  )
  .delete(
    'todos/:id',
    ({ params }) => {
      const todo = db.find((todo) => todo.id === params.id)
      if (todo) {
        db.splice(db.indexOf(todo), 1)
      }
    },
    {
      params: t.Object({
        id: t.Numeric(),
      }),
    }
  )
  .post(
    '/todos',
    ({ body }) => {
      if (!body.content) {
        throw new Error('Content cannot be empty')
      }
      const newTodo = {
        id: lastID++,
        content: body.content,
        completed: false,
      }
      db.push(newTodo)
      return <TodoItem {...newTodo} />
    },
    {
      body: t.Object({
        content: t.String()
      }),
    }
  )
  .listen(4000)

console.log(
  `Elysia is running at http://${app.server?.hostname}:${app.server?.port}`
)

const BaseHTML = ({ children }: elements.Children) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>The BETH Stack</title>
  <script src="https://unpkg.com/htmx.org@1.9.5"></script>
  <script src="https://unpkg.com/hyperscript.org@0.9.9"></script>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
  ${children}
</body>
</html>
`
interface Todo {
  id: number
  content: string
  completed: boolean
}

let lastID = 2
const db: Todo[] = [
  { id: 1, content: 'learn the beth stack', completed: true },
  { id: 2, content: 'learn vim', completed: false },
]

function TodoItem({ content, completed, id }: Todo) {
  return (
    <div class="flex flex-row space-x-3 px-4 py-2">
      <input
        type="checkbox"
        checked={completed}
        hx-post={`/todos/toggle/${id}`}
        hx-target="closest div"
        hx-swap="outerHTML"
      />
      <p>{content}</p>
      <button
        class="text-red-500"
        hx-delete={`/todos/${id}`}
        hx-swap="outerHTML"
        hx-target="closest div"
      >
        x
      </button>
    </div>
  )
}

function TodoList({ todos }: { todos: Todo[] }) {
  return (
    <div class="px-8 py-4 mt-4 rounded-lg bg-green-950 border-2 border-green-400 px-2 py-1">
      {todos.map((todo) => (
        <TodoItem {...todo} />
      ))}
      <TodoForm />
    </div>
  )
}

function TodoForm() {
  return (
    <form class="flex space-x-3" hx-post="/todos" hx-swap="beforebegin" _='on submit target.reset()'>
      <input
        type="text"
        name="content"
        class="border border-slate-800 rounded-lg bg-slate-800"
      />
      <button
        type="submit"
        class="rounded-lg py-1 px-2 border border-teal-100 bg-green-200"
      >
        add
      </button>
    </form>
  )
}
