const notebooksDbName = process.env.NOTEBOOKS_DB_NAME;
const notebooksDbUser = process.env.NOTEBOOKS_DB_USER;
const notebooksDbPassword = process.env.NOTEBOOKS_DB_PASSWORD;

db = db.getSiblingDB(notebooksDbName);

db.createUser(
    {
        user: notebooksDbUser,
        pwd: notebooksDbPassword,
        roles: [
            {
                role: 'readWrite',
                db: notebooksDbName
            }
        ]
    }
)