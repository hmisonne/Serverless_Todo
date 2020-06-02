import * as AWS  from 'aws-sdk'
// import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { TodoItem } from '../models/TodoItem'

export class TodoAccess {
    constructor(
        private readonly docClient = new AWS.DynamoDB.DocumentClient(),
        private readonly todosTable = process.env.TODOS_TABLE){}

    async getAllTodos(userId: string): Promise<TodoItem[]> {
        console.log('Getting all todos')

        const result = await this.docClient.query({
            TableName: this.todosTable,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
          }).promise()
          
          const items = result.Items

          return items as TodoItem[]
        
    }
    
}