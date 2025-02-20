var express = require("express");
var router = express.Router();
var UserDao = require("../dao/userController.js");
require("dotenv").config();
const { URLSearchParams } = require("url");
const { validateHmac, isTimestampValid } = require("../utils/hmacUtils.js");
const restaurantController = require("../dao/restaurantController.js");

router.post("/createRestaurant", async (req, res, next) => {
    try {
        const reqData = req.body;
        if (!reqData) {
            return res.status(400).json({
                error: true,
                result: "No data in request"
            });
        }

        const data = await restaurantController.createRestaurant(reqData);
        return res.status(200).json(data);

    } catch (error) {
        return res.status(400).json(error)
    }
});

router.post("/addAdmin", async (req, res, next) => {
    try {
        const reqData = req.body;
        if (!reqData) {
            return res.status(400).json({
                error: true,
                result: "No data in request"
            });
        }

        const data = await restaurantController.addAdmin(reqData);
        return res.status(200).json(data);

    } catch (error) {
        return res.status(400).json(error)
    }
});


router.post("/authenticateAdmin", async (req, res, next) => {
    try {
        const reqData = req.body;
        if (!reqData) {
            return res.status(400).json({
                error: true,
                result: "No data in request"
            });
        }

        const data = await restaurantController.authenticateAdmin(reqData);
        return res.status(200).json(data);

    } catch (error) {
        return res.status(400).json(error)
    }
});

router.post("/updateOnlineStatus", async (req, res, next) => {
    try {
        const reqData = req.body;
        if (!reqData) {
            return res.status(400).json({
                error: true,
                result: "No data in request"
            });
        }

        const data = await restaurantController.updateOnlineStatus(reqData);
        return res.status(200).json(data);

    } catch (error) {
        return res.status(400).json(error)
    }
});


router.get("/getAllRestaurants", async (req, res, next) => {
    try {
        const { online } = req.query;
        const data = await restaurantController.getAllRestaurants(online);
        return res.status(200).send(data);
    } catch (error) {
        return res.status(400).json(error);
    }
});

router.get("/getRestaurant/:restaurantId", async (req, res, next) => {
    try {
        const restaurantId = req.params.restaurantId;
        const data = await restaurantController.getRestaurant(Number(restaurantId));
        return res.status(200).send(data);
    } catch (error) {
        return res.status(400).json(error);
    }
});

router.put("/updateRestaurant/:restaurantId", async (req, res, next) => {
    try {
        const restaurantId = req.params.restaurantId;
        const data = await restaurantController.updateRestaurant(Number(restaurantId), req.body);
        return res.status(200).send(data);
    } catch (error) {
        return res.status(400).json(error);
    }
});

router.put("/updateMenuItem/:restaurantId/:itemId", async (req, res, next) => {
    try {
        const restaurantId = req.params.restaurantId;
        const itemId = req.params.itemId;
        const data = await restaurantController.updateMenuItem(Number(restaurantId), Number(itemId), req.body);
        return res.status(200).send(data);
    } catch (error) {
        return res.status(400).json(error);
    }
});

router.put("/updateMenuStatus/:restaurantId", async (req, res, next) => {
    try {
        const restaurantId = req.params.restaurantId;

        const data = await restaurantController.updateMenuStatus(Number(restaurantId), req.body);
        return res.status(200).send(data);
    } catch (error) {
        return res.status(400).json(error);
    }
});

router.get("/getMultipleRestaurantMenu/:restaurantIds", async (req, res, next) => {
    try {
        const restaurantIds = req.params.restaurantIds
            .split(',')
            .filter(id => id.trim() !== '')
            .map(id => {
                const numId = Number(id.trim());
                if (isNaN(numId)) {
                    throw {
                        error: true,
                        message: `Invalid restaurant ID format: ${id}`
                    };
                }
                return numId;
            });

        if (restaurantIds.length === 0) {
            throw {
                error: true,
                message: "No valid restaurant IDs provided"
            };
        }

        const data = await restaurantController.getMultipleRestaurantMenu(restaurantIds);
        return res.status(200).send(data);
    } catch (error) {
        return res.status(400).json(error);
    }
});

router.put("/updateMenu/:restaurantId", async (req, res) => {
    try {
        const restaurantId = req.params.restaurantId;
        const result = await restaurantController.updateMenu(Number(restaurantId), req.body);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(400).json(error);
    }
});


router.get("/getRestaurantMenu/:restaurantId", async (req, res, next) => {
    try {
        const restaurantId = req.params.restaurantId;
        const data = await restaurantController.getRestaurantMenu(Number(restaurantId));
        return res.status(200).send(data);
    } catch (error) {
        return res.status(400).json(error);
    }
});

router.post("/getImages", async (req, res, next) => {
    try {
        const data = await restaurantController.getImages(req.body);
        return res.status(200).send(data);
    } catch (error) {
        return res.status(400).json(error);
    }
});

router.get("/getRestaurantOrders", async (req, res) => {
    try {
        const restaurantId = req.query.restaurantId;
        const orders = await restaurantController.getRestaurantOrders(Number(restaurantId));
        return res.status(200).json(orders);
    } catch (error) {
        return res.status(400).json(error);
    }
});

router.post("/updateOrderStatus", async (req, res) => {
    try {
        const data = await restaurantController.updateOrderStatus(req.body);
        return res.status(200).json(data);
    } catch (error) {
        return res.status(400).json(error);
    }
});

router.put("/updateSolanaDepositAddress", async (req, res) => {
    try {
        const data = await restaurantController.updateSolanaDepositAddress(req.body);
        return res.status(200).json(data);
    } catch (error) {
        return res.status(400).json(error);
    }
});

router.post("/updateBSCBaseDepositAddress", async (req, res) => {
    try {
        const data = await restaurantController.updateBSCBaseDepositAddress(req.body);
        return res.status(200).json(data);
    } catch (error) {
        return res.status(400).json(error);
    }
});

router.post("/addMenuItem/:restaurantId", async (req, res) => {
    try {
        const restaurantId = req.params.restaurantId;
        const data = await restaurantController.addMenuItem(Number(restaurantId), req.body);
        return res.status(200).json(data);
    } catch (error) {
        return res.status(400).json(error);
    }
});

router.delete('/deleteMenuItem/:restaurantId/:itemId', async (req, res) => {
    try {
        const result = await restaurantController.deleteMenuItem(
            Number(req.params.restaurantId), 
            Number(req.params.itemId), 
            req.body
        );
        res.json(result);
    } catch (error) {
        res.status(500).json(error);
    }
});

module.exports = router;