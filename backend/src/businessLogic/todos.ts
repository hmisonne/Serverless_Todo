// import * as uuid from 'uuid'

import { TodoItem } from '../models/TodoItem'
import { TodoAccess } from '../dataLayer/todosAccess'
// import { CreateTodoRequest, UpdateTodoRequest } from '../requests/CreateGroupRequest'

const todoAccess = new TodoAccess()

export async function getAllTodos(userId: string): Promise<TodoItem[]>{
    return todoAccess.getAllTodos(userId)
}
