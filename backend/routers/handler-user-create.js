const dayjs = require("dayjs");
const bcrypt = require("bcrypt");
const express = require("express");
const { v4: uuidv4, validate } = require("uuid");

const db = require("../database/knex-instance");
const queriesUsers = require("../database/helper/users");
const queriesUsersKey = require("../database/helper/users-key");
const {
  respondWithJSON,
  respondWithError,
} = require("../middleware/respond-json");
const {
  isValidUserName,
  hashAPIKey,
  generateJWTToken,
} = require("../middleware/generate-token");

const router = express.Router();

async function handlerUserCreate(req, res) {
  const { username, password, gender } = req.body;

  if (!username || !password) {
    return respondWithError(res, 400, "invalid input");
  }

  if (!isValidUserName(username)) {
    return respondWithError(res, 400, "invalid username format");
  }

  const existingUsername = await queriesUsers.getUserByName(db, username);
  if (existingUsername) {
    return respondWithError(res, 400, "username already exists");
  }

  if (password.length < 8) {
    return respondWithError(
      res,
      400,
      "password must be at least 8 characters long"
    );
  }

  const userGender = gender || null;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const { hashedApiKey } = await hashAPIKey();

    const apiKeyExpiresAt = dayjs().add(30, "day").toDate();

    await queriesUsers.createUser(db, {
      id: uuidv4(),
      createdAt: dayjs().toDate(),
      updatedAt: dayjs().toDate(),
      username,
      password: hashedPassword,
      gender: userGender,
      apiKey: hashedApiKey,
      apiKeyExpiresAt,
    });

    const user = await queriesUsers.getUserByApiKey(db, hashedApiKey);
    if (!user) {
      return respondWithError(res, 404, "User not found");
    }

    const userID = user.id;
    if (!validate(userID)) {
      return respondWithError(res, 500, "invalid user ID");
    }

    const jwtExpiresAt = dayjs().add(15, "minute").toDate();
    const jwtToken = generateJWTToken(
      { id: userID, api_key: hashedApiKey },
      jwtExpiresAt,
      "jwtToken"
    );

    const refreshTokenExpiresAt = dayjs().add(30, "day").toDate();
    const refreshToken = generateJWTToken(
      { id: userID, api_key: hashedApiKey },
      refreshTokenExpiresAt,
      "refreshToken"
    );

    await queriesUsersKey.createUserRFKey(db, {
      id: uuidv4(),
      createdAt: dayjs().toDate(),
      updatedAt: dayjs().toDate(),
      accessTokenExpiresAt: jwtExpiresAt,
      refreshToken,
      refreshTokenExpiresAt,
      userID,
    });

    res.cookie("access_token", jwtToken, {
      httpOnly: true,
      secure: true,
      path: "/",
      expires: jwtExpiresAt,
      sameSite: "strict",
    });

    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: true,
      path: "/",
      expires: refreshTokenExpiresAt,
      sameSite: "strict",
    });

    return respondWithJSON(res, 201, { message: "User created successfully" });
  } catch (err) {
    console.error("error during user creation: ", err.message, err.stack);
    return respondWithError(res, 500, "error - creating user");
  }
}

router.post("/signup", handlerUserCreate);

module.exports = router;
