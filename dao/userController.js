const UserModel = require("../models/Users");
const encrypt = require("../utils/encry");
const dotenv = require("dotenv");
dotenv.config();
const { client } = require("../connections/redis");
const RedisKeys = require("../constant/redis");
const redisUtil = require("../utils/redisUtils");
const OrderModel = require("../models/Orders");
const axios = require("axios");

async function successMessage(data) {
  let returnData = {};
  returnData["error"] = false;
  returnData["result"] = data;

  return returnData;
}

async function errorMessage(data) {
  let returnData = {};
  returnData["error"] = true;
  returnData["result"] = data;

  return returnData;
}

async function getUserLBData(handle) {
  try {
  } catch (err) {
    throw await errorMessage(err.message);
  }
}

async function signUpUser(data) {
  try {
    let body = await encrypt.decrypt(data);

    let via = body.via.toUpperCase();
    let handle = body.handle;
    if (!via || !handle) {
      throw {
        message: "Incorrect params",
      };
    }
    let userData = await UserModel.findOne({
      "signUpVia.handle": handle,
    });

    // else if user dat does not exist, create one
    if (!userData) {
      let signUpVia = {
        via: via,
        handle: handle,
      };

      userData = await UserModel.create({
        signUpVia: signUpVia,
        createdDate: Date.now(),
        lastUpdatedAt: Date.now(),
      });
    }

    return await successMessage(userData);
  } catch (err) {
    throw await errorMessage(err.message);
  }
}

async function updateUserAddresses(data) {
  try {
    let body = await encrypt.decrypt(data);
    let userData = await UserModel.findOneAndUpdate({
      _id: body.userId,
    }, {
      $set: {
        addresses: body.addresses
      }
    }, {
      new: true
    });
    if (!userData) {
      throw {
        message: "User not found",
      };
    }
    return await successMessage(userData.addresses);
  } catch (err) {
    throw await errorMessage(err.message);
  }
}


async function saveUserSolAddress(body) {
  try {
    let userData = await UserModel.findOne({
      _id: body.userId,
    });
    if (!userData) {
      throw {
        message: "User not found",
      };
    }
    userData.externalWalletAddress = body.address;
    userData.walletProvider = "SOLANA";
    userData.lastUpdatedAt = Date.now();
    await userData.save();
    await redisUtil.redisSAdd(client, RedisKeys.solanaAddress, body.address);
    return await successMessage(userData);
  } catch (err) {
    throw await errorMessage(err.message);
  }
}

async function getUserOrders(userId) {
  try {
    let userData = await UserModel.findOne({
      _id: userId
    });
    if (!userData) {
      throw { message: "User not found" }
    }
    let orders = await OrderModel.find({
      user: userData._id,
      status: { $ne: "requires_payment_method" }
    }).sort({ createdAt: -1 });
    return await successMessage(orders);
  } catch (err) {
    throw await errorMessage(err.message);
  }
}

async function getUserDetails(userId) {
  try {
    let userData = await UserModel.findOne({
      _id: userId
    });
    if (!userData) {
      throw { message: "User not found" }
    }
    return await successMessage(userData);
  } catch (err) {
    throw await errorMessage(err.message);
  }
}

module.exports = {
  getUserLBData,
  signUpUser,
  updateUserAddresses,
  getUserOrders,
  getUserDetails,
  saveUserSolAddress
};
