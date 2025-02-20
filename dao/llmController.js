const dotenv = require("dotenv");
dotenv.config();
const axios = require("axios");
const config = require("../config/config");

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

async function generateText(model, systemPrompt, maxTokens, temperature) {
    try {
        let temp = temperature ? temperature : 0.5
        const LLMDATA = config.LLM_DATA[model]
        const API_URL = LLMDATA.API_URL;
        const response = await axios.post(
            API_URL,
            {
                model: LLMDATA.modelName,
                messages: [{ role: "user", content: systemPrompt }],
                max_tokens: maxTokens,
                temperature: temp
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${LLMDATA.API_KEY}`,
                },
            }
        );

        const parsedResponse = JSON.parse(
            response.data.choices[0].message.content
        );

        return await successMessage(parsedResponse)
    }
    catch (error) {
        return await errorMessage(error.message)
    }
}

module.exports = {
    generateText
}