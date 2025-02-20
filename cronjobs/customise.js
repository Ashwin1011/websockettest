const MenuModel = require("../models/Menu");
const mongoose = require("mongoose");
const config = require("../config/config");

mongoose
    .connect(config.MONGODB_URL, {
        user: config.MONGODB_USER,
        pass: config.MONGODB_PASS
    })
    .catch((err) => console.log(err));

async function customiseMenu() {
    try {
        const restaurantMenus = await MenuModel.find({});
        for (const restaurantMenu of restaurantMenus) {
            // if (restaurantMenu.restaurantId != 9 && restaurantMenu.restaurantId != 10) {
            //     console.log(`Skipping restaurant ${restaurantMenu.restaurantId}`);
            //     continue;
            // }

            let items = restaurantMenu.items;
            for (const item of items) {
                if (item.customisation.categories.length > 0) {
                    item.isCustomisable = true;
                }
                else {
                    item.isCustomisable = false;
                }
            }

            await MenuModel.findOneAndUpdate({ restaurantId: restaurantMenu.restaurantId }, { $set: { items: items } });
            console.log(`Updated restaurant ${restaurantMenu.restaurantId}`);
        }

        process.exit(0);
    } catch (error) {
        console.log(error);
    }
}

customiseMenu();