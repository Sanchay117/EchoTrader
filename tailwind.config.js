module.exports = {
    darkMode: "class", // enables class-based theme toggling
    content: ["./views/**/*.ejs"],
    theme: {
        extend: {
            colors: {
                primary: "#6366F1", // Indigo
                accent: "#EC4899", // Pink
            },
            fontFamily: {
                display: ['"Poppins"', "sans-serif"],
            },
            backdropBlur: {
                xs: "2px",
            },
        },
    },
    plugins: [],
};
