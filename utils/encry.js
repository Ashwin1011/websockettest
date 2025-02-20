
const dotenv = require('dotenv')
dotenv.config()
var CryptoJS = require("crypto-js");

const AesKey = CryptoJS.enc.Utf8.parse(process.env.AesKey)


async function encrypt(jsonObject) {
    try {
        var ciphertext = CryptoJS.AES.encrypt(JSON.stringify(jsonObject), AesKey, {
            mode: CryptoJS.mode.ECB,
        }).toString();
        return ciphertext
    }
    catch (err) {
        throw err
    }
}

async function encryptString(message) {
    try {
        var ciphertext = CryptoJS.AES.encrypt(message, AesKey, {
            mode: CryptoJS.mode.ECB,
        }).toString();
        return ciphertext
    }
    catch (err) {
        throw err
    }
}

async function decrypt(ciphertext) {
    try {
        var bytes = CryptoJS.AES.decrypt(ciphertext, AesKey, {
            mode: CryptoJS.mode.ECB,
        });
        var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
        return decryptedData
    }
    catch (err) {
        throw err
    }
}

async function decryptString(ciphertext) {
    try {
        var bytes = CryptoJS.AES.decrypt(ciphertext, AesKey, {
            mode: CryptoJS.mode.ECB,
        });
        var decryptedData = bytes.toString(CryptoJS.enc.Utf8);
        return decryptedData
    }
    catch (err) {
        throw err
    }
}

async function main() {
    // var data = {
    //     gameType: "rookieChef",
    //     userIds: ["66ee986bc3b539a188edb4f9", "669609b324e088f697cec71b"]
    // }
    // data = {
    //     gameId: "048a7afecf206a",
    //     userIds: [
    //         {
    //             userId: "66ee986bc3b539a188edb4f9",
    //             chips: 400,
    //             munches: 10
    //         },
    //         {
    //             userId: "669609b324e088f697cec71b",
    //             chips: 200,
    //             munches: 10
    //         }
    //     ]
    // }
    var data = {
        userId:"6708fcd77b12c310dce69d4b"
    }
    var ciphertext = await encrypt(data)
    console.log(ciphertext)

    var data = "ax2IfsbbgiKjt5p0RQCWTCGqZOPtDC17Pf5l7nLKVFc="
    var ciphertext = await decryptString(data)
    console.log(ciphertext)

}
main()

module.exports = { decrypt, encrypt, encryptString, decryptString }