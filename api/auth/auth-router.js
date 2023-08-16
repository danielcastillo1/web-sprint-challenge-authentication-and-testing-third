const router = require("express").Router();
const bycrpt = require("bcryptjs");
const db = require("../../data/dbConfig");
const jwt = require("jsonwebtoken");

// router.post('/register', (req, res) => {
//   res.end('implement register, please!');
//
//     IMPLEMENT
//     You are welcome to build additional middlewares to help with the endpoint's functionality.
//     DO NOT EXCEED 2^8 ROUNDS OF HASHING!

//     1- In order to register a new account the client must provide `username` and `password`:
//       {
//         "username": "Captain Marvel", // must not exist already in the `users` table
//         "password": "foobar"          // needs to be hashed before it's saved
//       }

//     2- On SUCCESSFUL registration,
//       the response body should have `id`, `username` and `password`:
//       {
//         "id": 1,
//         "username": "Captain Marvel",
//         "password": "2a$08$jG.wIGR2S4hxuyWNcBf9MuoC4y0dNy7qC/LbmtuFBSdIhWks2LhpG"
//       }

//     3- On FAILED registration due to `username` or `password` missing from the request body,
//       the response body should include a string exactly as follows: "username and password required".

//     4- On FAILED registration due to the `username` being taken,
//       the response body should include a string exactly as follows: "username taken".
//
// });

router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    if (!username || !password) {
      res.status(400).json({
        message: "username and password required",
      });
    } else {
      const hash = bycrpt.hashSync(password, 8);
      const newUser = { username, password: hash };
      const usernameExists = await db("users")
        .where("username", username)
        .first();
      if (!usernameExists) {
        const result = await db("users").insert(newUser);
        const foundUser = await db("users")
          .where("id", result[0])
          .first();
        res.status(201).json(foundUser);
      } else {
        res.status(409).json({ message: "username taken" });
      }
    }
  } catch (err) {
    res.end("implement register, please!");
  }
});

// router.post('/login', (req, res) => {
//   res.end('implement login, please!');
//
//     IMPLEMENT
//     You are welcome to build additional middlewares to help with the endpoint's functionality.

//     1- In order to log into an existing account the client must provide `username` and `password`:
//       {
//         "username": "Captain Marvel",
//         "password": "foobar"
//       }

//     2- On SUCCESSFUL login,
//       the response body should have `message` and `token`:
//       {
//         "message": "welcome, Captain Marvel",
//         "token": "eyJhbGciOiJIUzI ... ETC ... vUPjZYDSa46Nwz8"
//       }

//     3- On FAILED login due to `username` or `password` missing from the request body,
//       the response body should include a string exactly as follows: "username and password required".

//     4- On FAILED login due to `username` not existing in the db, or `password` being incorrect,
//       the response body should include a string exactly as follows: "invalid credentials".
//
// });

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  console.log("fired");
  try {
    if (!username || !password) {
      res.status(400).json({
        message: "username and password required",
      });
    } else {
      const [user] = await db("users").where(
        "username",
        username
      );
      if (
        user &&
        bycrpt.compareSync(password, user.password)
      ) {
        const token = generateToken(user);
        res.status(200).json({
          message: `welcome, ${username}`,
          token,
        });
      } else {
        res.status(404).json("invalid credentials");
      }
    }
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

function generateToken(user) {
  const payload = {
    subject: user.id,
    username: user.username,
  };
  const options = {
    expiresIn: "1d",
  };
  const secret = "test";
  return jwt.sign(payload, secret, options);
}

module.exports = router;
