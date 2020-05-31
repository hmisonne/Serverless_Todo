import 'source-map-support/register'
import * as AWS from 'aws-sdk'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { parseUserId } from '../../auth/utils'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import * as uuid from 'uuid'

const docClient = new AWS.DynamoDB.DocumentClient()

const todosTable = process.env.TODOS_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  
  // TODO: Implement creating a new TODO item
  
  const todoId = uuid.v4()
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]

  const newItem = await createTodo( todoId, event, jwtToken)

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      newItem
    })
  }
}


async function createTodo(todoId: string, event: any, jwtToken: string) {
  const newTodo: CreateTodoRequest = JSON.parse(event.body)
  const createdAt = new Date().toISOString()
  const userId = parseUserId(jwtToken)
  const newItem = {
    userId,
    todoId,
    createdAt,
    ...newTodo,
    done: false,
  }
  await docClient
    .put({
      TableName: todosTable,
      Item: newItem
    })
    .promise()
    
  return newItem 
}