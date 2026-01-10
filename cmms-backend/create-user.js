import pg from 'pg'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'

dotenv.config()

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

async function createUser() {
  const hash = await bcrypt.hash('123456', 10)
  console.log('Hash:', hash)
  
//   await pool.query('DELETE FROM users WHERE username = $1', ['roma1'])
  
  await pool.query(
    `INSERT INTO users (username, password_hash, full_name, role) VALUES ($1, $2, $3, $4)`,
    ['roma2', hash, 'Roma', 'admin']
  )
  
  console.log('✅ User roma2 created with password 123456')
  process.exit(0)
}

createUser()
