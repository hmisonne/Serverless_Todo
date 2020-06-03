import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { getUserId } from '../utils'
import { removeTodo } from '../../businessLogic/todos'
import { createLogger } from '../../utils/logger'
import { getTodo } from '../../businessLogic/todos'

const logger = createLogger('deleteTodo')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const userId = getUserId(event)
  
  //   Check if todoId exists
  const item = await getTodo(userId, todoId)

  if (item.length === 0){
    logger.info('Incorrect ID: ', todoId)
    return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: 'todoId does not exist'
      }
  }
  await removeTodo(userId, todoId)

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: ''
  }
}
