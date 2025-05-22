// app.js
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const MongoStore = require("connect-mongo");

const app = express();

// Replace with your MongoDB connection string
const MONGO_URI = "mongodb://localhost:27017/echotrader";

// Connect to MongoDB
mongoose
    .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error(err));

// User schema and model
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
});
const User = mongoose.model("User", userSchema);

// Middleware
app.use(express.urlencoded({ extended: true })); // parse form data
app.use(express.static("public")); // serve CSS/js from public folder

// Session setup (store session in MongoDB)
app.use(
    session({
        secret: "some very secret string here",
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({ mongoUrl: MONGO_URI }),
        cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 1 day
    })
);

// EJS setup
app.set("view engine", "ejs");

// Routes

// GET /signup - show signup page
app.get("/signup", (req, res) => {
    res.render("signup", { error: null });
});

// POST /signup - handle signup form
app.post("/signup", async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.render("signup", { error: "Email already registered" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Save user
        const newUser = new User({ name, email, passwordHash });
        await newUser.save();

        // Log user in (save id in session)
        req.session.userId = newUser._id;

        // Redirect to a protected page or dashboard
        res.redirect("/dashboard");
    } catch (err) {
        console.error(err);
        res.render("signup", { error: "Something went wrong. Try again." });
    }
});

// GET /login - show login page
app.get("/login", (req, res) => {
    res.render("login", { error: null });
});

// POST /login - handle login form
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.render("login", { error: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.render("login", { error: "Invalid email or password" });
        }

        // Login success
        req.session.userId = user._id;
        res.redirect("/dashboard");
    } catch (err) {
        console.error(err);
        res.render("login", { error: "Something went wrong. Try again." });
    }
});

// Protected dashboard route example
app.get("/dashboard", async (req, res) => {
    if (!req.session.userId) {
        return res.redirect("/login");
    }

    const user = await User.findById(req.session.userId).lean();
    if (!user) {
        return res.redirect("/login");
    }

    res.render("dashboard", { user });
});

// Logout
app.post("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/login");
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
    console.log(`Server running on http://localhost:${PORT}`)
);
