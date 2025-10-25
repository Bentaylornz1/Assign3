// server/backend/user.cjs
/*
 USER BACKEND CLASS
 Responsiblities:
 - Know user ID
 - Manage account credentials.
 */

 class User
 {
    //Current user details:
    #userId = null;
    get userId()
    {
        return this.#userId;
    }
    #role = null;
    get role()
    {
        return this.#role;
    }
    #email = null;
    get email()
    {
        return this.#email;
    }
    #name = null;
    get name()
    {
        return this.#name;
    }
    
    constructor(db)
    {
        this.db = db;
    }
    
    async Login(email, password)
    {
        userDetails = await this.db.get("SELECT * FROM Users WHERE email = ? AND password = ?", email, password);
        if (userDetails.length == 0 ) //If no match
        {
            return false;
        }
        else
        {
            this.#userId = userDetails.userId;
            this.#email = userDetails.email;
            this.#role = userDetails.role;
            this.#name = userDetails.name;
            return true;
        }
    }

    async UpdateRole(userId, newRole)
    {
        await this.db.run("UPDATE Users SET role = ? WHERE userId = ?", newRole, userId);
    }
    async UpdateEmail(userId, newEmail)
    {
        await this.db.run("UPDATE Users SET email = ? WHERE userId = ?", newEmail, userId);
    }
    async UpdatePassword(userId, newPassword)
    {
        await this.db.run("UPDATE Users SET password = ? WHERE userId = ?", newPassword, userId);
    }
    async UpdateName(userId, newName)
    {
        await this.db.run("UPDATE Users SET name = ? WHERE userId = ?", newName, userId);
    }
 }

 module.exports = User;