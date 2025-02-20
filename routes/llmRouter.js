var express = require("express");
var router = express.Router();
var llmDao = require("../dao/llmController.js");
require("dotenv").config();

router.post("/generateText", async (req, res, next) => {
    try {
       
        const reqData = req.body
        if (!reqData) {
            throw {
                error: true,
                result: "No data in request",
            };
        }
        const data = await llmDao.generateText(reqData.model,reqData.systemPrompt, reqData.maxTokens, reqData.temperature)
        return res.status(200).send(data);
    } catch (error) {
        return res.status(400).send(error);
    }
});

module.exports = router;