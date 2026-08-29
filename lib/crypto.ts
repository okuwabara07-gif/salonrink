import crypto from 'crypto'

let key: Buffer | null = null

function getKey(): Buffer {
  if (!key) {
    const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY
    if (!ENCRYPTION_KEY) {
      throw new Error('ENCRYPTION_KEY is not set in environment variables')
    }

    if (ENCRYPTION_KEY.length !== 64) {
      throw new Error('ENCRYPTION_KEY must be 64 hex characters (32 bytes)')
    }

    key = Buffer.from(ENCRYPTION_KEY, 'hex')
  }
  return key
}

export function encrypt(plaintext: string): string {
  const keyBuffer = getKey()
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', keyBuffer, iv)

  let encrypted = cipher.update(plaintext, 'utf8', 'hex')
  encrypted += cipher.final('hex')

  const authTag = cipher.getAuthTag()

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
}

export function decrypt(payload: string): string {
  const keyBuffer = getKey()
  const [ivHex, authTagHex, ciphertext] = payload.split(':')

  if (!ivHex || !authTagHex || !ciphertext) {
    throw new Error('Invalid encrypted payload format')
  }

  const iv = Buffer.from(ivHex, 'hex')
  const authTag = Buffer.from(authTagHex, 'hex')

  const decipher = crypto.createDecipheriv('aes-256-gcm', keyBuffer, iv)
  decipher.setAuthTag(authTag)

  let decrypted = decipher.update(ciphertext, 'hex', 'utf8')
  decrypted += decipher.final('utf8')

  return decrypted
}
