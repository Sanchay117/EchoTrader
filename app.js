const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const MongoStore = require("connect-mongo");

const app = express();

require("dotenv").config();

// Ensure MONGO_URI is defined in your .env file
if (!process.env.MONGO_URI) {
    console.error("FATAL ERROR: MONGO_URI is not defined in .env file.");
    process.exit(1);
}

// Connect to MongoDB
mongoose
    .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("MongoDB connected for Mongoose"))
    .catch((err) => {
        console.error("Mongoose connection error:", err);
        process.exit(1); // Exit if DB connection fails
    });

// User schema and model
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
});

// Model name "Users", collection name "Users"
const User = mongoose.model("Users", userSchema, "Users");

// Middleware
app.use(express.urlencoded({ extended: true })); // parse form data
app.use(express.static("public")); // serve CSS/js from public folder

// Middleware to redirect logged-in users from login/signup pages
function alreadyLoggedIn(req, res, next) {
    if (req.session.userId) {
        return res.redirect("/dashboard"); // If logged in, redirect to dashboard
    }
    next(); // If not logged in, proceed to the route handler
}

// Session setup (store session in MongoDB)
const sessionSecret =
    process.env.SESSION_SECRET ||
    "a_very_weak_secret_for_development_only_change_me";
if (
    sessionSecret === "a_very_weak_secret_for_development_only_change_me" &&
    process.env.NODE_ENV === "production"
) {
    console.warn(
        "WARNING: Using a weak default session secret in production. Set SESSION_SECRET environment variable."
    );
}

app.use(
    session({
        secret: sessionSecret,
        resave: false,
        saveUninitialized: false, // Set to false: only save session if modified
        store: MongoStore.create({
            mongoUrl: process.env.MONGO_URI,
            ttl: 14 * 24 * 60 * 60, // Optional: session time to live in seconds (e.g., 14 days)
            autoRemove: "native", // Optional: Default is 'native'.
        }),
        cookie: {
            maxAge: 1000 * 60 * 60 * 24, // 1 day in milliseconds
            httpOnly: true, // Prevents client-side JS from reading the cookie
            secure: process.env.NODE_ENV === "production", // True if in production (HTTPS)
            sameSite: "lax", // Mitigates CSRF attacks
        },
    })
);

// EJS setup
app.set("view engine", "ejs");

// Routes

// GET /signup - show signup page
app.get("/signup", alreadyLoggedIn, (req, res) => {
    res.render("signup", { error: null });
});

// POST /signup - handle signup form
app.post("/signup", async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Check if user is already logged in (e.g., if they bypassed client-side checks)
        if (req.session.userId) {
            return res.redirect("/dashboard");
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.render("signup", {
                error: "Email already registered",
                name,
                email,
            }); // Pass back name and email
        }

        const salt = await bcrypt.genSalt(12);
        const passwordHash = await bcrypt.hash(password, salt);

        const newUser = new User({ name, email, passwordHash });
        await newUser.save();

        req.session.userId = newUser._id.toString(); // Store user ID in session

        res.redirect("/dashboard");
    } catch (err) {
        console.error("Signup Error:", err);
        // Ensure some form values are passed back to pre-fill
        res.status(500).render("signup", {
            error: "Something went wrong. Please try again.",
            name,
            email,
        });
    }
});

// GET /login - show login page
app.get("/login", alreadyLoggedIn, (req, res) => {
    // Added alreadyLoggedIn middleware
    res.render("login", { error: null });
});

// POST /login - handle login form
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if user is already logged in
        if (req.session.userId) {
            return res.redirect("/dashboard");
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.render("login", {
                error: "Invalid email or password",
                email,
            });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.render("login", {
                error: "Invalid email or password",
                email,
            });
        }

        req.session.userId = user._id.toString(); // Store user ID in session

        res.redirect("/dashboard");
    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).render("login", {
            error: "Something went wrong. Please try again.",
            email,
        });
    }
});

// Protected dashboard route example
app.get("/dashboard", async (req, res) => {
    if (!req.session.userId) {
        return res.redirect("/login");
    }

    try {
        const user = await User.findById(req.session.userId).lean(); // .lean() for performance if not modifying
        if (!user) {
            // This case handles if a user ID is in session but the user was deleted from DB
            req.session.destroy((err) => {
                if (err) {
                    console.error(
                        "Session destruction error on dashboard for non-existent user:",
                        err
                    );
                }
                return res.redirect("/login");
            });
            return; // Important to return here to prevent further execution
        }

        // If you had a dashboard.ejs view:
        // res.render("dashboard", { userName: user.name });
        res.send(
            `Really Awesome Dashboard here, ${user.name}! Your User ID is: ${user._id}`
        );
    } catch (error) {
        console.error("Dashboard Error:", error);
        // Generic error or redirect to login if something goes wrong fetching user
        res.redirect("/login");
    }
});

// Logout
app.post("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Logout Error (session destruction):", err);
            // Optionally, send an error response or just redirect
            return res.redirect("/"); // Redirect to homepage or login even if destroy fails
        }
        // After destroying the session, the cookie will be cleared by express-session.
        // Redirect the user to the login page.
        res.redirect("/login");
    });
});

// Basic home route (optional)
app.get("/", (req, res) => {
    if (req.session.userId) {
        res.redirect("/dashboard");
    } else {
        res.send(
            '<h1>Welcome!</h1><a href="/login">Login</a> | <a href="/signup">Sign Up</a>'
        );
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Access signup at http://localhost:${PORT}/signup`);
    console.log(`Access login at http://localhost:${PORT}/login`);
});
