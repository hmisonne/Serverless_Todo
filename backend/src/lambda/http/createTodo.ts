import 'source-map-support/register'
import * as AWS from 'aws-sdk'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { getUserId } from '../utils'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import * as uuid from 'uuid'

const docClient = new AWS.DynamoDB.DocumentClient()

const todosTable = process.env.TODOS_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  
  // TODO: Implement creating a new TODO item
  
  const todoId = uuid.v4()

  const newItem = await createTodo( todoId, event)

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      item: newItem
    })
  }
}


async function createTodo(todoId: string, event: any) {
  const newTodo: CreateTodoRequest = JSON.parse(event.body)
  const createdAt = new Date().toISOString()
  const userId = getUserId(event)
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