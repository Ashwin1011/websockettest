var express = require("express");
var router = express.Router();
var UserDao = require("../dao/userController.js");
require("dotenv").config();
const { URLSearchParams } = require("url");
const { validateHmac, isTimestampValid } = require("../utils/hmacUtils.js");

router.post("/signUpUser", async (req, res, next) => {
  try {
    // const requestBody = JSON.stringify(req.body);
    // const receivedHmac = req.header('HMAC');
    // const timestamp = req.header('Timestamp');

    // if (!isTimestampValid(timestamp)) {
    //   throw ({ error: true, message: 'Invalid or expired timestamp' });
    // }

    // if (!validateHmac(receivedHmac, requestBody, timestamp)) {
    //   throw ({ error: true, message: 'Invalid HMAC' });

    // }
    const reqData = req.body.data;
    if (!reqData) {
      throw {
        error: true,
        result: "No data in request",
      };
    }
    const data = await UserDao.signUpUser(reqData);
    return res.status(200).send(data);
  } catch (error) {
    return res.status(400).send(error);
  }
});

router.get("/getUserDetails", async (req, res, next) => {
  try {
    // const params = new URLSearchParams(Object.entries(req.query));
    // const queryString = params.toString();
    // const receivedHmac = req.header('HMAC');
    // const timestamp = req.header('Timestamp');

    // if (!isTimestampValid(timestamp)) {
    //     throw ({ error: true, message: 'Invalid or expired timestamp' });
    // }

    // if (!validateHmac(receivedHmac, queryString, timestamp)) {
    //     throw ({ error: true, message: 'Invalid HMAC' });

    // }
    const userId = req.query.userId;
    const data = await UserDao.getUserDetails(userId);
    return res.status(200).send(data);
  } catch (error) {
    return res.status(400).send(error);
  }
});


router.post("/updateUserAddresses", async (req, res, next) => {
  try {
    // const requestBody = JSON.stringify(req.body);
    // const receivedHmac = req.header('HMAC');
    // const timestamp = req.header('Timestamp');

    // if (!isTimestampValid(timestamp)) {
    //   throw ({ error: true, message: 'Invalid or expired timestamp' });
    // }

    // if (!validateHmac(receivedHmac, requestBody, timestamp)) {
    //   throw ({ error: true, message: 'Invalid HMAC' });

    // }
    const reqData = req.body.data;
    if (!reqData) {
      throw {
        error: true,
        result: "No data in request",
      };
    }
    const data = await UserDao.updateUserAddresses(reqData);
    return res.status(200).send(data);
  } catch (error) {
    return res.status(400).send(error);
  }
});

router.get("/getUserOrderHistory", async (req, res, next) => {
  try {
    // const params = new URLSearchParams(Object.entries(req.query));
    // const queryString = params.toString();
    // const receivedHmac = req.header('HMAC');
    // const timestamp = req.header('Timestamp');

    // if (!isTimestampValid(timestamp)) {
    //     throw ({ error: true, message: 'Invalid or expired timestamp' });
    // }

    // if (!validateHmac(receivedHmac, queryString, timestamp)) {
    //     throw ({ error: true, message: 'Invalid HMAC' });

    // }
    const userId = req.query.userId;
    const data = await UserDao.getUserOrders(userId);
    return res.status(200).send(data);
  } catch (error) {
    return res.status(400).send(error);
  }
});

router.post("/saveUserSolAddress", async (req, res, next) => {
  try {
    const reqData = req.body.data;
    if (!reqData) {
      throw {
        error: true,
        result: "No data in request",
      };
    }
    const data = await UserDao.saveUserSolAddress(reqData);
    return res.status(200).send(data);
  } catch (error) {
    return res.status(400).send(error);
  }
});


module.exports = router;
