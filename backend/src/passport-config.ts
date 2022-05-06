import { PassportStatic } from "passport";
import { VerifyFunction } from "passport-local/index";

interface User {
    userID: number;
    username: string;
    email: string;
    password: string;
}

const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");

function initialize(
    passport: PassportStatic,
    getUserByEmail: (email: string) => User,
    getUserById: (id: string) => Express.User
) {
    const authenticateUser: VerifyFunction = async (email, password, done) => {
        const user = await getUserByEmail(email);
        if (user == null) {
            return done(null, false, { message: "No user with that email" });
        }

        try {
            if (await bcrypt.compare(password, user.password)) {
                console.log("ok");
                return done(null, user);
            } else {
                console.log("bledne haslo");
                return done(null, false, { message: "Password incorrect" });
            }
        } catch (e) {
            return done(e);
        }
    };

    passport.use(new LocalStrategy({ usernameField: "email" }, authenticateUser));
    passport.serializeUser((user: Express.User, done) => done(null, user._id));
    passport.deserializeUser((id: string, done) => {
        return done(null, getUserById(id));
    });
}

module.exports = initialize;