import { AppDataSource } from "./data-source"

AppDataSource.initialize().then(() => {
    console.log("database initialized")
}).catch(error => console.log(error))
