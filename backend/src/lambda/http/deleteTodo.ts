import 'source-map-support/register'
import * as AWS from 'aws-sdk'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { getUserId } from '../utils'

const docClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId

  await removeTodo(todoId, event)
  // TODO: Remove a TODO item by id
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: ''
  }
}

async function removeTodo(todoId: string, event: any){
  const userId = getUserId(event)
  const params = {
    TableName: todosTable,
    Key: {
      todoId, 
      userId
    }
  }
  const data = docClient.delete(params, function(err, data) {
    if (err) {
      console.error("Unable to delete item", JSON.stringify(err))
    }
    else {
      console.log("DeleteItem succeeded", JSON.stringify(data))
    }
  }
  ).promise()
  return data
}