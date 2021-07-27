export const createTodo = (todo) => {
  const template = /*html*/ `
    <li
      data-id="${todo.id}"
      class="todo_item list-group-item d-flex"
    >
      <input
        type="checkbox"
        ${todo.done ? 'checked' : ''}
        class="btn"
        data-for="update_todo"
      />
      <p>${todo.text}</p>
      <button
        class="btn btn-sm"
        data-for="remove_todo"
      >
        ❌
      </button>
    </li>
  `
  result.insertAdjacentHTML('beforeend', template)
}
