import { randomUUID } from 'crypto'
import path from 'path'
import fs from 'fs'

const uuid = () => randomUUID()

export const extractFileExtension = (dataUrl: string) => {
  const matches = dataUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.*)$/)

  if (matches && matches.length === 3) {
    const mimeType = matches[1]
    const extension = mimeType.split('/')[1]
    return `.${extension}`
  }

  return null
}

export const saveBase64File = (base64Data: string, basePath: string) => {
  const base64 = base64Data.split(';base64,').pop()
  const buffer = Buffer.from(base64!, 'base64')
  const filePath = path.join(
    basePath,
    `${uuid()}${extractFileExtension(base64Data)}`,
  )
  fs.writeFileSync(filePath, buffer)

  return filePath
}

export const saveMessages = (data: object, basePath: string) => {
  const filePath = path.join(basePath, 'messages.json')
  const stringData = JSON.stringify(data, null, 2)
  fs.writeFileSync(filePath, stringData)
}

export const getMessages = (basePath: string): object => {
  const filePath = path.join(basePath, 'messages.json')
  const data = fs.readFileSync(filePath)
  const parsedData = JSON.parse(data.toString())
  return parsedData
}
