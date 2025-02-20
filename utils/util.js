const redisUtil = require('./redisUtils')
const { client } = require("../connections/redis");
const redisKeys = require('../constant/redis')
const bcrypt = require('bcrypt');

const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

module.exports = {
  hashPassword,
  comparePassword
}; 

async function getNextRestaurantId() {
  try {
    let currentRestaurantId = await redisUtil.redisGetter(client, redisKeys.currentRestaurantId)
    if (!currentRestaurantId) {
      currentRestaurantId = 0
    }
    let nextRestaurantId = Number(currentRestaurantId) + 1
    await redisUtil.redisSetter(client, redisKeys.currentRestaurantId, nextRestaurantId)
    return nextRestaurantId
  }
  catch (err) {
    console.log(err)
  }
}

async function getDateFormat() {
  let now = Date.now()
  const date = new Date(now);
  let day = date.getDate();
  let month = date.getMonth() + 1; // getMonth() returns months from 0-11, so we add 1
  const year = date.getFullYear();

  // Format day and month to 2 digits
  day = day < 10 ? '0' + day : day;

  let months = {
    1: 'JAN',
    2: 'FEB',
    3: 'MAR',
    4: 'APR',
    5: 'MAY',
    6: 'JUN',
    7: 'JUL',
    8: 'AUG',
    9: 'SEP',
    10: 'OCT',
    11: 'NOV',
    12: 'DEC'
  };

  month = months[month]

  let dateformat = `${day}${month}${year}`;
  return dateformat
}


module.exports = {
  getDateFormat,
  getNextRestaurantId,
  hashPassword,
  comparePassword
}