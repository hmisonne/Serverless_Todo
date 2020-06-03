import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils'
import { updateTodo } from '../../businessLogic/todos'
import { getTodo } from '../../businessLogic/todos'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

const logger = createLogger('updateTodo')


export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing event: ', event)
  const todoId = event.pathParameters.todoId
  const userId = getUserId(event)
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
  
  const item = await getTodo(userId, todoId)
  if (item.length === 0){
    return {
        statusCode: 404,
        body: 'todoId does not exist'
      }
  }

  const items = await updateTodo(updatedTodo, userId, todoId)
  return {
    statusCode: 200,
    body: JSON.stringify(items)
  }
})

handler.use(
  cors({
    credentials: true
  })
)