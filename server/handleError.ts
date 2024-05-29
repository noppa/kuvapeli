import type { Response } from 'express'

export default function handleError(error: unknown, res: Response) {
  console.error(error)
  const message = error instanceof Error ? error.message : String(error)
  const errorCode = parseInt(message.match(/^([0-9]+) /)?.[1]) || 500
  res.status(errorCode).send(message)
}
