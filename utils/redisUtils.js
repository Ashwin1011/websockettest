

var redisHIncrby = function (redisClient, key, field, value) {
    return new Promise((resolve, reject) => {
        redisClient.hincrby(key, field, value, (err, resp) => {
            if (err) return reject(err)
            resolve(resp);
        })
    })
}


var redisGetter = function (redisClient, key) {
    return new Promise((resolve, reject) => {
        redisClient.get(key, (err, value) => {
            if (err) return reject(err)
            resolve(value);
        })
    })
}

var redisIncrby = function (redisClient, key, value) {
    return new Promise((resolve, reject) => {
        redisClient.incrby(key, value, (err, resp) => {
            if (err) return reject(err)
            resolve(resp);
        })
    })
}


var redisSetter = function (redisClient, key, value) {
    return new Promise((resolve, reject) => {
        redisClient.set(key, value, (err, resp) => {
            if (err) return reject(err)
            resolve(resp);
        })
    })
}

var redisSMembers = function (redisClient, key) {
    return new Promise((resolve, reject) => {
        redisClient.smembers(key, (err, value) => {
            if (err) return reject(err)
            resolve(value);
        })
    })
}

var redisSIsMembers = function (redisClient, key, value) {
    return new Promise((resolve, reject) => {
        redisClient.sismember(key, value, (err, resp) => {
            if (err) {
                return reject(err)
            }
            resolve(resp);
        })
    })
}

var redisHGetter = function (redisClient, key, field) {
    return new Promise((resolve, reject) => {
        redisClient.hget(key, field, (err, value) => {
            if (err) return reject(err)
            resolve(value);
        })
    })
}

var redisHSetter = function (redisClient, key, field, value) {
    return new Promise((resolve, reject) => {
        redisClient.hset(key, field, value, (err, resp) => {
            if (err) return reject(err)
            resolve(resp);
        })
    })
}

var redisHDeleter = function (redisClient, key, field) {
    return new Promise((resolve, reject) => {
        redisClient.hdel(key, field, (err, resp) => {
            if (err) return reject(err)
            resolve(resp);
        })
    })
}

var redisSAdd = function (redisClient, key, value) {
    return new Promise((resolve, reject) => {
        redisClient.sadd(key, value, (err, resp) => {
            if (err) return reject(err)
            resolve(resp);
        })
    })
}

var redisSRem = function (redisClient, key, value) {
    return new Promise((resolve, reject) => {
        redisClient.srem(key, value, (err, resp) => {
            if (err) return reject(err)
            resolve(resp);
        })
    })
}

var redisGetTTL = function (redisClient, key) {
    return new Promise((resolve, reject) => {
        redisClient.ttl(key, (err, resp) => {
            if (err) return reject(err)
            resolve(resp);
        })
    })
}

var redisSetTTL = function (redisClient, key, time, value) {
    return new Promise((resolve, reject) => {
        redisClient.setex(key, time, value, (err, resp) => {
            if (err) return reject(err)
            resolve(resp);
        })
    })
}

var redisZAdd = function (redisClient, key, score, value) {
    return new Promise((resolve, reject) => {
        redisClient.zadd(key, score, value, (err, resp) => {
            if (err) return reject(err)
            resolve(resp);
        })
    })
}
var redisZRem = function (redisClient, key, value) {
    return new Promise((resolve, reject) => {
        redisClient.zrem(key, value, (err, resp) => {
            if (err) return reject(err)
            resolve(resp);
        })
    })
}

var redisZIncrby = function (redisClient, key, value, field) {
    return new Promise((resolve, reject) => {
        redisClient.zincrby(key, value, field, (err, resp) => {
            if (err) return reject(err)
            resolve(resp);
        })
    })
}

var redisZRevRank = function (redisClient, key, value) {
    return new Promise((resolve, reject) => {
        redisClient.zrevrank(key, value, (err, resp) => {
            if (err) return reject(err)
            resolve(resp);
        })
    })
}

var redisZScore = function (redisClient, key, value) {
    return new Promise((resolve, reject) => {
        redisClient.zscore(key, value, (err, resp) => {
            if (err) return reject(err)
            resolve(resp);
        })
    })
}

var redisZRevRange = function (redisClient, key, start, stop, withScores) {
    return new Promise((resolve, reject) => {
        redisClient.zrevrange(key, start, stop, withScores, (err, resp) => {
            if (err) return reject(err)
            resolve(resp);
        })
    })
}

var redisLPop = function (redisClient, key) {
    return new Promise((resolve, reject) => {
        redisClient.lpop(key, (err, value) => {
            if (err) return reject(err)
            resolve(value);
        })
    })
}

var redisRPush = function (redisClient, key, value) {
    return new Promise((resolve, reject) => {
        redisClient.rpush(key, value, (err, resp) => {
            if (err) return reject(err)
            resolve(resp);
        })
    })
}

var redisZUnionStore = function (redisClient, tempKey, gamers) {
    return new Promise((resolve, reject) => {
        redisClient.zunionstore(tempKey, 1, gamers, 'weights', 0, (err, resp) => {
            if (err) return reject(err)
            resolve(resp);
        })
    })
}

var redisRename = function (redisClient, tempKey, gamers) {
    return new Promise((resolve, reject) => {
        redisClient.rename(tempKey, gamers, (err, resp) => {
            if (err) return reject(err)
            resolve(resp);
        })
    })
}

module.exports = {
    redisGetTTL,
    redisGetter,
    redisHDeleter,
    redisHGetter,
    redisHIncrby,
    redisHSetter,
    redisSAdd,
    redisSIsMembers,
    redisSRem,
    redisSetTTL,
    redisSetter,
    redisLPop,
    redisRPush,
    redisZAdd,
    redisZIncrby,
    redisZRevRank,
    redisZRevRange,
    redisZScore,
    redisZUnionStore,
    redisRename,
    redisIncrby,
    redisZRem,
    redisSMembers
}