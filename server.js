const ChronoDB = require("./dist/index.js").default;

async function main() {
    const db = await ChronoDB.open({ cloudSync: false });

    const users = db.col("users", {
        userName: {
            type: "string",
            important: true,
        },
        email: {
            type: "string",
            distinct: true,
        },
        role: "string"
    });

    await users.addMany([
        {
            email: "oladiipoayomide2021@gmail.com",
            role: "Software Engineering"
        },
        {
            userName: "John Doe",
            email: "oladiipoayomide2021@gmail.com",
            role: "Software Engineering"
        },
    ])
}

main();