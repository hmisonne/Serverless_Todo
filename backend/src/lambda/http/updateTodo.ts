import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { parseUserId } from '../../auth/utils'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import * as AWS from 'aws-sdk'

const docClient = new AWS.DynamoDB.DocumentClient()
const todoTable = process.env.TODOS_TABLE
const todoIdIndex = process.env.TODO_ID_INDEX

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
  
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]

  const userId = parseUserId(jwtToken)

  if (!(await getTodo(todoId))) {
     return {
          statusCode: 404,
          headers: {
            'Access-Control-Allow-Origin': '*'
          },
          body: 'Todo Id does not exist'
        };
  }
  const newTodo = updateTodo(todoId, userId, updatedTodo)
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify(newTodo)
  }
}

async function updateTodo(todoId: string, userId: string, updatedTodo: UpdateTodoRequest) {

  const newItem = await docClient
    .update({
      TableName: todoTable,
      Key: { 
        todoId, 
        userId },
      UpdateExpression: 'set #NAME = :name, #DUEDATE :dueDate, #DONE :done',
      ExpressionAttributeNames: {
        '#NAME' : 'name',
        '#DUEDATE' : 'dueDate',
        '#DONE' : 'done'
      },
      ExpressionAttributeValues: {
        ':name' : updatedTodo.name,
        ':dueDate' : updatedTodo.dueDate,
        ':done' : updatedTodo.done,
      }
    })
    .promise()
    
  return newItem 
}

async function getTodo(todoId: string){
  const result = await docClient.query({
    TableName: todoTable,
    IndexName: todoIdIndex,
    KeyConditionExpression: 'todoId= :todoId',
    ExpressionAttributeValues: {
      'todoId': todoId
    }
  }).promise()

  return result.Items[0]
}