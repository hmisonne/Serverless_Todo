import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { parseUserId } from '../../auth/utils'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import * as AWS from 'aws-sdk'

const docClient = new AWS.DynamoDB.DocumentClient()
const todoTable = process.env.TODOS_TABLE
// const todoIdIndex = process.env.TODO_ID_INDEX

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
  
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]

  const userId = parseUserId(jwtToken)

  // if (!(await getTodo(todoId))) {
  //    return {
  //         statusCode: 404,
  //         headers: {
  //           'Access-Control-Allow-Origin': '*'
  //         },
  //         body: 'Todo Id does not exist'
  //       };
  // }
  const items = await updateTodo(todoId, userId, updatedTodo)
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify(items)
  }
}

async function updateTodo(todoId: string, userId: string, updatedTodo: UpdateTodoRequest) {

  const newItem = await docClient
    .update({
      TableName: todoTable,
      Key: { 
        todoId, 
        userId },
      UpdateExpression: "set #N = :name, dueDate :dueDate, done :done",
      ExpressionAttributeNames: {"#N": "name"},
      ExpressionAttributeValues: {
        ":name": updatedTodo.name,
        ":dueDate": updatedTodo.dueDate,
        ":done": updatedTodo.done,
      },
      ReturnValues: "UPDATED_NEW"
    })
    .promise()
    
  return newItem 
}

// async function getTodo(todoId: string){
//   const result = await docClient.query({
//     TableName: todoTable,
//     IndexName: todoIdIndex,
//     KeyConditionExpression: 'todoId= :todoId',
//     ExpressionAttributeValues: {
//       'todoId': todoId
//     }
//   }).promise()

//   return result.Items[0]
// }