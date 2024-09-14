import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import bcrypt from 'bcrypt'; // Added bcrypt for password hashing

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('C:/Users/ADK/Desktop/FIRST TRY/public'));

// MongoDB Atlas Connection (to the 'library' database)
mongoose.connect(process.env.MONGO_URI, { dbName: 'library' })
    .then(() => {
        console.log('Connected to MongoDB Atlas');
    })
    .catch(err => console.error('Failed to connect to MongoDB Atlas:', err));

// Serve the login.html file
app.get('/', (req, res) => {
    res.sendFile(path.join('C:/Users/ADK/Desktop/FIRST TRY/public', 'index.html'));
});

// Define User schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

// Create User model for 'user_login' collection in 'library' database
const User = mongoose.model('User', userSchema, 'user_login');

// Login route
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    console.log(`Login attempt: ${username}`);

    try {
        const user = await User.findOne({ username });
        if (user) {
            // Check if the provided password matches the hashed password
            const isMatch = await bcrypt.compare(password, user.password);
            if (isMatch) {
                // Send user dashboard HTML
                return res.sendFile(path.join('C:/Users/ADK/Desktop/FIRST TRY/public', 'USER.html'));
            }
        }
        return res.status(401).send('Invalid username or password');
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send('Server error');
    }
});


// Signup route
app.post('/signup', async (req, res) => {
    const { username, password } = req.body;
    console.log(`Signup attempt: ${username}`);

    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(409).send('Username already exists');
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user and save to the database
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();

        console.log('User created successfully:', newUser);

        // Redirect to login after successful signup
        res.redirect('/');
        //return res.sendFile(path.join('C:/Users/ADK/Desktop/FIRST TRY/public', 'USER.html'));
    } catch (error) {
        console.error('Error during signup:', error);
        res.status(500).send('Server error');
    }
});


// Start the Express server
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
