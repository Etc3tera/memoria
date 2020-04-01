import crypto from 'crypto'

export default function(data: string) : string {  
  const sha1 = crypto.createHash('sha1')
  sha1.update(data)
  return sha1.digest('hex')
}