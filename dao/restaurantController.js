const dotenv = require("dotenv");
dotenv.config();
const OrderModel = require("../models/Orders");
const RestaurantModel = require('../models/Restaurant')
const MenuModel = require('../models/Menu')
const AdminModel = require('../models/Admins')
const { getNextRestaurantId, hashPassword, comparePassword } = require('../utils/util')
const redisUtil = require("../utils/redisUtils");
const RedisKeys = require("../constant/redis");
const { client } = require("../connections/redis");
const Moralis = require("../connections/moralis");


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

async function createRestaurant(body) {
    try {
        const id = await getNextRestaurantId();
        if (!id) {
            throw {
                message: 'Failed to generate restaurant ID'
            }
        }
        const existingAdmin = await AdminModel.findOne({ username: body.superadminUsername });
        if (existingAdmin) {
            throw new Error("username already exists.")
        }
        const superadminUsername = body.superadminUsername;
        let superadminPassword = body.superadminPassword;
        superadminPassword = await hashPassword(superadminPassword);

        const admin = await AdminModel.create({
            username: superadminUsername,
            password: superadminPassword,
            role: "SUPERADMIN",
            restaurantId: id
        });


        let transformedLocation = null;
        if (body.location?.latitude != null && body.location?.longitude != null) {
            transformedLocation = {
                type: 'Point',
                coordinates: [body.location.longitude, body.location.latitude],
            };
        }

        const restaurantData = {
            ...body,
            restaurantId: id,
            location: transformedLocation,
        };
        delete admin.password;
        const restaurant = await RestaurantModel.create(restaurantData);
        return await successMessage({
            restaurantId: restaurant.restaurantId,
            ...restaurant.toJSON(),
            ...admin
        });

    } catch (err) {
        return await errorMessage(err.message);
    }
}

async function addAdmin(body) {
    try {
        const { restaurantId, username, password } = body;
        const { superadminUsername, superadminPassword } = body; // For authentication

        const admin = await AdminModel.findOne({ username: superadminUsername });

        if (!admin || admin?.role !== "SUPERADMIN") {
            throw {
                message: 'Superadmin not found'
            }
        }

        const isValidSuperadmin = await comparePassword(superadminPassword, admin.password);

        if (!isValidSuperadmin) {
            throw {
                message: 'Invalid superadmin credentials'
            }
        }

        const restaurant = await RestaurantModel.findOne({ restaurantId });

        if (!restaurant) {
            throw {
                message: 'Restaurant not found'
            }
        }

        // Hash the new admin's password
        const hashedPassword = await hashPassword(password);

        // Add new admin to the restaurant
        await AdminModel.create({
            username,
            password: hashedPassword,
            role: "ADMIN",
            restaurantId
        });

        return await successMessage(
            'Admin added successfully'
        );

    } catch (error) {
        throw await errorMessage(error.message)
    }
}

async function authenticateAdmin(body) {
    try {
        const { username, password } = body;

        const admin = await AdminModel.findOne({ username });
        if (!admin) {
            throw {
                message: "Admin not found"
            }
        }
        const isValid = await comparePassword(password, admin.password);
        if (!isValid) {
            throw {
                message: "Invalid credentials"
            }
        }
        delete admin.password;
        return await successMessage(
            admin
        );
    }
    catch (error) {
        throw await errorMessage(error.message)
    }
}

async function getAllRestaurants(online) {
    try {
        const query = online === 'true' ? { isOnline: true } : {};

        const restaurants = await RestaurantModel.find(query);

        if (online === 'true') {
            const simplifiedData = restaurants.map(restaurant => ({
                id: restaurant.restaurantId,
                name: restaurant.name,
                description: restaurant.description,
                menuSummary: restaurant.menuSummary,
                location: restaurant.location,
                stripeAccountId: restaurant.stripeAccountId,
                bscBaseDepositAddress: restaurant.bscBaseDepositAddress,
            }));

            return await successMessage(simplifiedData);
        }
        else {
            const fullData = restaurants.map(restaurant => ({
                id: restaurant.restaurantId,
                name: restaurant.name,
                description: restaurant.description,
                image: restaurant.image,
                menuSummary: restaurant.menuSummary,
                contactNo: restaurant.contactNo,
                address: restaurant.address,
                isOnline: restaurant.isOnline,
                location: restaurant.location,
                createdAt: restaurant.createdAt,
                updatedAt: restaurant.updatedAt
            }));

            return await successMessage(fullData);
        }
    } catch (err) {
        return await errorMessage(err.message);
    }
}

async function getRestaurant(restaurantId) {
    try {
        let restaurant = await RestaurantModel.findOne({ restaurantId: restaurantId })
        if (!restaurant) {
            throw {
                message: "Restaurant not found"
            }
        }
        return await successMessage(restaurant)
    }
    catch (err) {
        return await errorMessage(err.message)
    }
}

async function updateRestaurant(restaurantId, body) {
    try {
        const admin = await AdminModel.findOne({ username: body.adminUsername });
        if (!admin || admin?.role !== "SUPERADMIN") {
            throw {
                message: "Super Admin not found"
            }
        }

        if (admin?.restaurantId !== restaurantId) {
            throw {
                message: "Unauthorized"
            }
        }

        let restaurant = await RestaurantModel.findOne({ restaurantId: restaurantId });
        if (!restaurant) {
            throw {
                message: "Restaurant not found"
            }
        }

        let updatedData = { ...body };

        if (body.location?.latitude != null && body.location?.longitude != null) {
            updatedData.location = {
                type: "Point",
                coordinates: [body.location.longitude, body.location.latitude],
            };
        }

        let updatedRestaurant = await RestaurantModel.findOneAndUpdate(
            { restaurantId: restaurantId },
            updatedData,
            { new: true }
        );

        return await successMessage(updatedRestaurant);
    } catch (err) {
        return await errorMessage(err.message);
    }
}

async function updateMenuStatus(restaurantId, body) {
    try {

        const admin = await AdminModel.findOne({ username: body.adminUsername });

        if (admin?.restaurantId !== restaurantId) {
            throw {
                message: "Unauthorized"
            }
        }

        let restaurant = await RestaurantModel.findOne({ restaurantId: restaurantId })
        if (!restaurant) {
            throw {
                message: "Restaurant not found"
            }
        }
        let updatedRestaurant = await RestaurantModel.findOneAndUpdate({ restaurantId: restaurantId }, { menuUploaded: true }, { new: true })
        return await successMessage(updatedRestaurant)
    }
    catch (err) {
        return await errorMessage(err.message)
    }
}

async function updateOnlineStatus(body) {
    try {

        const admin = await AdminModel.findOne({ username: body.adminUsername });

        if (admin?.restaurantId !== body.restaurantId) {
            throw {
                message: "Unauthorized"
            }
        }

        const { restaurantId } = body;
        let restaurant = await RestaurantModel.findOne({ restaurantId: restaurantId })
        if (!restaurant) {
            throw {
                message: "Restaurant not found"
            }
        }
        let newStatus = restaurant.isOnline == true ? false : true;
        let updatedRestaurant = await RestaurantModel.findOneAndUpdate({ restaurantId: restaurantId }, { isOnline: newStatus }, { new: true })
        return await successMessage(updatedRestaurant)
    }
    catch (err) {
        return await errorMessage(err.message)
    }
}

async function getRestaurantMenu(restaurantId) {
    try {
        let restaurant = await RestaurantModel.findOne({ restaurantId: restaurantId })
        if (!restaurant) {
            throw {
                message: "Restaurant not found"
            }
        }
        let menu = await MenuModel.findOne({ restaurantId: restaurantId })
        if (!menu) {
            throw {
                message: "Menu not found"
            }
        }
        return await successMessage({ restaurant, menu })
    }
    catch (err) {
        return await errorMessage(err.message)
    }
}

async function updateMenu(restaurantId, body) {
    try {

        const admin = await AdminModel.findOne({ username: body.adminUsername });

        if (admin?.restaurantId !== restaurantId) {
            throw {
                message: "Unauthorized"
            }
        }

        const restaurant = await RestaurantModel.findOne({ restaurantId });
        if (!restaurant) {
            throw {
                message: `Restaurant not found with ID: ${restaurantId}`
            }
        }

        const { menuItems = [], customisations = [] } = body;

        const mergedItems = menuItems.map((item) => {
            const found = customisations.find((c) => c.id === item.id);
            return {
                ...item,
                id: Number(item.id),
                price: Number(item.price || 0),
                spicinessLevel: Number(item.spicinessLevel || 0),
                sweetnessLevel: Number(item.sweetnessLevel || 0),
                healthinessScore: Number(item.healthinessScore || 0),
                sufficientFor: Number(item.sufficientFor || 1),
                available: Boolean(item.available !== false),
                dietaryPreference: Array.isArray(item.dietaryPreference) ? item.dietaryPreference : [],
                caffeineLevel: String(item.caffeineLevel || 'None'),
                image: String(item.image || ''),
                customisation: found ? found.customisation : { categories: [] },
            };
        });

        const updatedMenu = await MenuModel.findOneAndUpdate(
            { restaurantId },
            {
                $set: {
                    restaurantId,
                    restaurantName: restaurant.name,
                    items: mergedItems,
                    lastUpdated: new Date(),
                }
            },
            {
                new: true,
                upsert: true,
                runValidators: true,
                setDefaultsOnInsert: true,
            }
        );

        await RestaurantModel.findOneAndUpdate({ restaurantId }, { $set: { menuUploaded: true } });

        return await successMessage(updatedMenu)
    } catch (error) {
        return await errorMessage(error.message)
    }
}

async function updateMenuItem(restaurantId, itemId, body) {
    try {
        const admin = await AdminModel.findOne({ username: body.adminUsername });

        if (admin?.restaurantId !== restaurantId) {
            throw {
                message: "Unauthorized"
            }
        }
        delete body.adminUsername;
        const updatedMenuItem = await MenuModel.findOneAndUpdate(
            { restaurantId: Number(restaurantId) },
            { $set: { "items.$[elem]": body } },
            {
                arrayFilters: [{ "elem.id": Number(itemId) }],
                new: true
            }
        );
        return await successMessage(updatedMenuItem);
    } catch (error) {
        return await errorMessage(error.message)
    }
}

async function addMenuItem(restaurantId, body) {
    try {
        const admin = await AdminModel.findOne({ username: body.adminUsername });
        if (!admin || admin?.role !== "SUPERADMIN") {
            throw {
                message: "Unauthorized"
            }
        }
        const menu = await MenuModel.findOne({ restaurantId: restaurantId });
        if (!menu) {
            throw {
                message: "Menu not found"
            }
        }
        // Find highest existing item id and increment by 1 for new item
        const maxId = menu.items.reduce((max, item) => {
            const itemId = parseInt(item.id);
            return !isNaN(itemId) ? Math.max(max, itemId) : max;
        }, 0);
        body.id = maxId + 1;
        const updatedMenu = await MenuModel.findOneAndUpdate({ restaurantId: restaurantId }, { $push: { items: body } }, { new: true });
        return await successMessage(updatedMenu);
    } catch (error) {
        return await errorMessage(error.message)
    }
}

async function deleteMenuItem(restaurantId, itemId, body) {
    try {
        const admin = await AdminModel.findOne({ username: body.adminUsername });
        
        if (admin?.restaurantId !== restaurantId) {
            throw {
                message: "Unauthorized"
            }
        }

        const updatedMenu = await MenuModel.findOneAndUpdate(
            { restaurantId: Number(restaurantId) },
            { $pull: { items: { id: Number(itemId) } } },
            { new: true }
        );

        if (!updatedMenu) {
            throw {
                message: "Menu not found"
            }
        }

        return await successMessage(updatedMenu);
    } catch (error) {
        return await errorMessage(error.message)
    }
}

async function getMultipleRestaurantMenu(restaurantIds) {
    try {
        const menus = await MenuModel.find({ restaurantId: { $in: restaurantIds } });

        // Transform array into object with restaurantId as keys
        const menuMap = menus.reduce((acc, menu) => {
            acc[menu.restaurantId] = menu.items;
            return acc;
        }, {});

        return await successMessage(menuMap);
    } catch (err) {
        return await errorMessage(err.message)
    }
}

async function getImages(body) {
    try {
        // Create an array of restaurant IDs to query
        const restaurantIds = Object.keys(body).map(Number);

        // Build aggregation pipeline to get only requested items and their images
        const menus = await MenuModel.aggregate([
            // Match restaurants we want
            { $match: { restaurantId: { $in: restaurantIds } } },

            // Unwind items array to work with individual items
            { $unwind: "$items" },

            // Match only items requested for each restaurant
            {
                $match: {
                    $expr: {
                        $in: ["$items.id", {
                            $getField: {
                                field: { $toString: "$restaurantId" },
                                input: body
                            }
                        }]
                    }
                }
            },

            // Project only needed fields in desired format
            {
                $project: {
                    _id: 0,
                    key: {
                        $concat: [
                            { $toString: "$restaurantId" },
                            ".",
                            { $toString: "$items.id" }
                        ]
                    },
                    image: "$items.image"
                }
            }
        ]);

        // Convert array of {key, image} to object format
        const result = menus.reduce((acc, { key, image }) => {
            acc[key] = image;
            return acc;
        }, {});

        return await successMessage(result);
    } catch (err) {
        return await errorMessage(err.message)
    }
}

async function getRestaurantOrders(restaurantId) {
    try {
        const orders = await OrderModel.aggregate([
            { $match: { restaurantId: restaurantId, paymentStatus: "succeeded" } },
            { $sort: { createdAt: -1 } }
        ]);
        return await successMessage(orders);
    } catch (error) {
        return await errorMessage(error.message);
    }
}

async function updateOrderStatus(body) {
    try {
        const orderId = body.orderId;
        const status = body.status;
        const estimatedDeliveryTime = body.estimatedDeliveryTime !== undefined ? body.estimatedDeliveryTime : 0;
        const admin = await AdminModel.findOne({ username: body.adminUsername });

        if (admin?.restaurantId !== body.restaurantId) {
            throw {
                message: "Unauthorized"
            }
        }
        let updatedData = { status: status };
        if (status == 'OUT_FOR_DELIVERY') {
            updatedData["estimatedDeliveryTime"] = estimatedDeliveryTime;
        }
        let updatedOrder = await OrderModel.findOneAndUpdate({ orderId: orderId }, updatedData, { new: true });
        const order = await getRestaurantOrders(updatedOrder.restaurantId);
        return order;
    } catch (error) {
        return await errorMessage(error.message);
    }
}

async function updateSolanaDepositAddress(body) {
    try {
        const admin = await AdminModel.findOne({ username: body.adminUsername });

        if (admin?.restaurantId !== body.restaurantId) {
            throw {
                message: "Unauthorized"
            }
        }
        const restaurantId = body.restaurantId;
        const solanaAddress = body.solanaAddress;
        const restaurant = await RestaurantModel.findOneAndUpdate({ restaurantId: restaurantId }, { solanaDepositAddress: solanaAddress }, { new: true });
        await redisUtil.redisSAdd(client, RedisKeys.restaurantSolAddress, solanaAddress);
        return await successMessage(restaurant);
    } catch (error) {
        return await errorMessage(error.message);
    }
}

async function updateBSCBaseDepositAddress(body) {
    try {
        const admin = await AdminModel.findOne({ username: body.adminUsername });

        if (admin?.restaurantId !== body.restaurantId) {
            throw {
                message: "Unauthorized"
            }
        }
        const restaurantId = body.restaurantId;
        const bscBaseAddress = body.bscBaseAddress;
       
        const list = [
            bscBaseAddress
        ];

        const response = await Moralis.Streams.addAddress({
            id: process.env.BSC_BASE_STREAM_ID,
            address: list,
        });

        const restaurant = await RestaurantModel.findOneAndUpdate({ restaurantId: restaurantId }, { bscBaseDepositAddress: bscBaseAddress }, { new: true });
        return await successMessage(restaurant);
    } catch (error) {
        return await errorMessage(error.message);
    }
}


module.exports = {
    getRestaurantOrders,
    updateOrderStatus,
    createRestaurant,
    getAllRestaurants,
    getRestaurant,
    updateRestaurant,
    updateMenuStatus,
    getRestaurantMenu,
    updateMenu,
    getMultipleRestaurantMenu,
    getImages,
    addAdmin,
    updateOnlineStatus,
    updateMenuItem,
    authenticateAdmin,
    updateSolanaDepositAddress,
    addMenuItem,
    deleteMenuItem,
    updateBSCBaseDepositAddress
}