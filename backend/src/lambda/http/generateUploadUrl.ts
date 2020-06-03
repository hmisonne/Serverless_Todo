import 'source-map-support/register'
import * as AWS from 'aws-sdk'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
// import { updateTodo } from '../../businessLogic/todos'
// import { getUserId } from '../utils'
import * as AWSXRay from 'aws-xray-sdk'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

const XAWS = AWSXRay.captureAWS(AWS)

const s3 = new XAWS.S3({
  signatureVersion: 'v4'
})

// const todosTable = process.env.TODOS_TABLE
const bucketName = process.env.ATTACHEMENTS_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION


export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId

  // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
  const uploadUrl = getUploadUrl(todoId)
  // const userId = getUserId(event)
  // const url = `https://${bucketName}.s3.amazonaws.com/${todoId}`
  // updateTodo({attachmentUrl?: url}, userId, todoId)
  return {
    statusCode: 200,
    body: JSON.stringify({
      uploadUrl
    })
  }
})

function getUploadUrl(todoId: string) {
  return s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: todoId,
    Expires: urlExpiration
  })
}

handler.use(
  cors({
    credentials: true
  })
)