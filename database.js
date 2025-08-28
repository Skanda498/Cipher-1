const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'users.json');

// Initialize database file if it doesn't exist
if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify([]));
}

// Read all users
function getUsers() {
    try {
        const data = fs.readFileSync(dbPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading users:', error);
        return [];
    }
}

// Save all users
function saveUsers(users) {
    try {
        fs.writeFileSync(dbPath, JSON.stringify(users, null, 2));
        return true;
    } catch (error) {
        console.error('Error saving users:', error);
        return false;
    }
}

// Create new user
async function createUser(email, password) {
    const users = getUsers();
    
    // Check if user already exists
    if (users.find(user => user.email === email)) {
        throw new Error('User already exists');
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user object
    const newUser = {
        id: Date.now().toString(),
        email: email,
        password: hashedPassword,
        createdAt: new Date().toISOString()
    };
    
    // Save user
    users.push(newUser);
    saveUsers(users);
    
    return newUser;
}

// Find user by email
async function findUserByEmail(email) {
    const users = getUsers();
    return users.find(user => user.email === email);
}

// Verify user password
async function verifyUser(email, password) {
    const user = await findUserByEmail(email);
    if (!user) return false;
    
    return await bcrypt.compare(password, user.password);
}

module.exports = {
    getUsers,
    saveUsers,
    createUser,
    findUserByEmail,
    verifyUser
};
