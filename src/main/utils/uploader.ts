import { sendErrorResponse } from '@docsploit/espress'
import { createClient } from '@supabase/supabase-js'
import { Request, Response, NextFunction } from 'express'
import multer, { Field, MulterError } from 'multer'
import path from 'path'
// Create a single supabase client for interacting with your database
export const supabase = createClient(
  'https://svqaxlmmnnxzxyxsnpaw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2cWF4bG1tbm54enh5eHNucGF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODM3OTY4MTEsImV4cCI6MTk5OTM3MjgxMX0.kkEwNnYN0vCZGL6jUn4zVQreKhTcJg7UXg47T3VbeHU'
)

export function multerMultiFieldHandler(
  keyNames: Field[],
  bucketName: string,
  mimeTypes: string[]
) {
  const imageStorage = multer.memoryStorage()
  const imageUpload = multer({
    storage: imageStorage,
    limits: { fieldSize: 25 * 1024 * 1024 },
    fileFilter(req, file, cb) {
      if (mimeTypes.includes(file.mimetype)) {
        cb(null, true)
      } else cb(new (MulterError as any)('INVALID_FILE', keyNames))
    }
  })
  const upload = imageUpload.fields(keyNames)

  return (req: Request, res: Response, next: NextFunction) => {
    try {
      return upload(req, res, async (err) => {
        try {
          if (err) {
            if (err instanceof MulterError) {
              if (err.code === 'LIMIT_FILE_SIZE') {
                return sendErrorResponse(400, 'File size cannot exceed 1 Mb', res)
              }
              if (err.code === 'LIMIT_UNEXPECTED_FILE') {
                return sendErrorResponse(400, 'File must be ' + mimeTypes, res)
              }
              if ((err as any).code === 'INVALID_FILE') {
                return sendErrorResponse(
                  400,
                  'Please upload ' + mimeTypes.toString().toUpperCase() + ' files',
                  res
                )
              }
            }
            console.log(err)
            return sendErrorResponse(500, 'Internal Server Error', res)
          } else {
            if (req.files) {
              const files: any = []
              for (const attribute of Object.values(req.files)) {
                for (const file of attribute) {
                  const { path } = await uploadToBucket(bucketName, file)
                  if (path) {
                    files.push(`uploads/${path}`)
                  }
                }
              }
              req.files = []
              req.files = files
              next()
            }
          }
        } catch (error) {
          console.log(error)

          return sendErrorResponse(500, 'Internal Error', res)
        }
      })
    } catch (error) {
      return sendErrorResponse(500, 'Internal Error', res)
    }
  }
}

export async function uploadToBucket(bucketName: string, file: Express.Multer.File) {
  try {
    const filePath = bucketName + '_' + Date.now() + path.extname(file.originalname)
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file.buffer, { contentType: file.mimetype })
    if (error) {
      throw error
    }
    return data
  } catch (error) {
    throw error
  }
}

export async function downloadFromBucket(bucketName: string, name: string) {
  try {
    const { data, error } = await supabase.storage.from(bucketName).download(name)
    if (error) {
      throw error
    }
    return data
  } catch (error) {
    throw error
  }
}
