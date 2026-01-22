import ChronoDB from "chronodb";

async function main() {
    const db = await ChronoDB.open({ cloudSync: false });

    const users = db.col("users", {
        schema: {
            userName: {
                type: "string",
                important: true,
            },
            email: {
                type: "string",
                distinct: true,
            },
            role: "string"
        }
    });

    // await users.add(
    //     {
    //         userName: "John Doe",
    //         email: "johndoe@gmail.com",
    //         role: "Software Engineering"
    //     }
    // )

}

main();