import express from 'express';
import connectDB from './dbConfig/dbConfig.js';
import dotenv from "dotenv";
import session from 'express-session';
import passport from 'passport';
import MongoStore from 'connect-mongo';
import jwt from 'jsonwebtoken';
import authRoute from './routes/authRouter.js';

dotenv.config();

let app = express();


connectDB();


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.text({ limit: '10mb' }));


app.use(session({
    secret: process.env.SESSION_SECRET || 'your-session-secret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.DB_URI,
        collectionName: 'sessions'
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

app.use(passport.initialize());
app.use(passport.session());

// JWT verification middleware - AFTER body parsing
app.use((req, res, next) => {
    const tokenString = req.header("Authorization");
    if (tokenString != null) {
        const token = tokenString.replace("Bearer ", "");

        jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
            if (decoded != null) {
                req.user = decoded;
                next();
            } else {
                console.log("Invalid token:", err.message);
                res.status(403).json({
                    message: "Invalid Token"
                });
            }
        });
    } else {
        next();
    }
});



// Routes
app.use('/api/auth', authRoute);


app.listen(5000, () => {
    console.log("Server is running on port 5000");
});