const notesDbName = process.env.NOTES_DB_NAME;
const notesDbUser = process.env.NOTES_DB_USER;
const notesDbPassword = process.env.NOTES_DB_PASSWORD;

db = db.getSiblingDB(notesDbName);

db.createUser(
    {
        user: notesDbUser,
        pwd: notesDbPassword,
        roles: [
            {
                role: 'readWrite',
                db: notesDbName
            }
        ]
    }
)