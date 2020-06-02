import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import * as AWS from 'aws-sdk'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils'

const logger = createLogger('updateTodo')

const docClient = new AWS.DynamoDB.DocumentClient()
const todoTable = process.env.TODOS_TABLE
// const todoIdIndex = process.env.TODO_ID_INDEX

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing event: ', event)
  const todoId = event.pathParameters.todoId

  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
  

  // if (!(await getTodo(todoId))) {
  //    return {
  //         statusCode: 404,
  //         headers: {
  //           'Access-Control-Allow-Origin': '*'
  //         },
  //         body: 'Todo Id does not exist'
  //       };
  // }
  const items = await updateTodo(todoId, updatedTodo, event)
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify(items)
  }
}

async function updateTodo(todoId: string, updatedTodo: UpdateTodoRequest, event: any ) {
  const userId = getUserId(event)
  const newItem = await docClient
    .update({
      TableName: todoTable,
      Key: { 
        todoId, 
        userId },
      ExpressionAttributeNames: {"#N": "name"},
      UpdateExpression: "set #N = :name, dueDate :dueDate, done :done",
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