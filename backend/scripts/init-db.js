// Database initialization script for SQLite
// Creates the contacts table with proper schema and indexes
const Database = require('better-sqlite3')
const path = require('path')
const fs = require('fs')

// Database file path
const dbPath = path.join(__dirname, '../data/contacts.db')

// Remove existing database file if it exists
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath)
  console.log('Removed existing database file')
}

// Create new database
const db = new Database(dbPath)

// Enable foreign keys and better performance
db.pragma('foreign_keys = ON')
db.pragma('journal_mode = WAL')
db.pragma('synchronous = NORMAL')

// Create contacts table
const createTableSQL = `
  CREATE TABLE contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL CHECK(length(name) > 0 AND length(name) <= 50),
    email TEXT NOT NULL UNIQUE CHECK(email LIKE '%_@__%.__%'),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`

// Create indexes for better performance
const createIndexesSQL = [
  'CREATE INDEX idx_contacts_email ON contacts(email)',
  'CREATE INDEX idx_contacts_name ON contacts(name)',
  'CREATE INDEX idx_contacts_created_at ON contacts(created_at DESC)'
]

try {
  // Create table
  db.exec(createTableSQL)
  console.log('✅ Contacts table created successfully')

  // Create indexes
  createIndexesSQL.forEach(sql => {
    db.exec(sql)
  })
  console.log('✅ Database indexes created successfully')

  // Insert sample data for testing
  const insertSampleData = db.prepare(`
    INSERT INTO contacts (name, email, created_at) 
    VALUES (?, ?, datetime('now', '-1 day'))
  `)

  const sampleContacts = [
    ['John Doe', 'john.doe@example.com'],
    ['Jane Smith', 'jane.smith@example.com'],
    ['Bob Johnson', 'bob.johnson@example.com']
  ]

  sampleContacts.forEach(([name, email]) => {
    insertSampleData.run(name, email)
  })

  console.log('✅ Sample data inserted successfully')
  console.log(`📁 Database created at: ${dbPath}`)
  console.log('🚀 Database initialization completed!')

} catch (error) {
  console.error('❌ Error initializing database:', error)
  process.exit(1)
} finally {
  db.close()
}
