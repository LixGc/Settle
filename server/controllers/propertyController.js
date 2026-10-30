const { Property, User, Category, Review, Booking, UserProfile, Specification, PropertyImage } = require("../models/index");
const { sequelize } = require("../models/index");
const getCoordinates = require("../helpers/geocode");
// "parramatta " and "Parramatta" are the same suburb, so save them the same way.
// Otherwise Explore would show the suburb twice
const tidySuburb = (location) => location?.trim().toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());

class PropertyController {
    static async getCategories(req, res, next) {
        try {
            const categories = await Category.findAll();
            res.json(categories);
        } catch (error) {
            next(error);
        }
    }
    static async fetchProperty(req, res, next) {
        try {
            let { location, startdate, enddate } = req.query;
            let options = {
                include: [
                    {
                        model: Category,
                    },
                    {
                        model: User,
                        attributes: { exclude: ["password", "otp"] },
                    },
                    {
                        model: Booking,
                    },
                    {
                        model: Review,
                    },
                ],
            };
            if (location) {
                options.where = { location };
            }
            const properties = await Property.findAll(options);
            if (properties.length == 0) {
                throw { name: "not_found" };
            }

            let filteredProperties;
            if (startdate && enddate) {
                startdate = new Date(startdate);
                enddate = new Date(enddate);
                filteredProperties = properties.filter((property) => {
                    let isNotBooked = true;
                    property.Bookings.forEach((el) => {
                        if (startdate < el.endDate && enddate > el.startDate) {
                            isNotBooked = false;
                        }
                    });
                    return isNotBooked;
                });
            } else {
                filteredProperties = properties;
            }

            const propertyData = filteredProperties.map((property) => {
                const { id, name, image, price, location, status, Reviews, Bookings, Category } = property;
                const totalReviews = Reviews.length;
                const totalBookings = Bookings.length;
                const averageRating = totalReviews > 0 ? Reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews : 0;
                return {
                    id,
                    name,
                    image,
                    price,
                    location,
                    status,
                    totalReviews,
                    totalBookings,
                    averageRating: averageRating.toFixed(1),
                    Category,
                };
            });
            res.status(200).json(propertyData);
        } catch (error) {
            next(error);
        }
    }

    static async fetchLocation(req, res, next) {
        try {
            const properties = await Property.findAll();
            const locations = [...new Set(properties.map((property) => property.location))];
            res.status(200).json(locations);
        } catch (error) {
            next(error);
        }
    }
    static async detailProperty(req, res, next) {
        try {
            const { id } = req.params;
            let averageRating = 0;
            const reviews = await Review.findAll({
                where: {
                    PropertyId: id,
                },
            });
            if (reviews.length > 0) {
                const ratingData = reviews.map((el) => el.rating);
                const average = ratingData.reduce((a, b) => a + b, 0) / ratingData.length;
                averageRating = average.toFixed(1);
            }
            const property = await Property.scope("withAddress").findOne({
                where: {
                    id,
                },
                include: [
                    {
                        model: Category,
                    },
                    {
                        model: User,
                        attributes: { exclude: ["password", "otp"] },
                        include: UserProfile,
                    },
                    {
                        model: Booking,
                    },
                    {
                        model: Specification,
                    },
                    {
                        model: PropertyImage,
                    },
                    {
                        model: Review,
                    },
                ],
            });
            if (!property) {
                throw { name: "not_found" };
            }
            // Before booking, guests only see roughly where the place is, like Airbnb.
            // The street address is left out and the map spot is rounded to about a kilometre
            const { address, latitude, longitude, ...publicProperty } = property.toJSON();
            const roughly = (value) => (value === null ? null : Math.round(value * 100) / 100);
            res.status(200).json({ property: { ...publicProperty, latitude: roughly(latitude), longitude: roughly(longitude) }, rating: averageRating });
        } catch (error) {
            next(error);
        }
    }

    static async fetchMyProperty(req, res, next) {
        try {
            // Owners can see their own addresses
            const properties = await Property.scope("withAddress").findAll({
                where: { UserId: req.user.id },
                include: [Category],
            });
            res.json(properties);
        } catch (error) {
            next(error);
        }
    }
    static async addProperty(req, res, next) {
        try {
            const { name, CategoryId, price, address } = req.body;
            const location = tidySuburb(req.body.location);
            const specifications = req.body.specifications ? JSON.parse(req.body.specifications) : [];
            const images = req.images || [];
            const { latitude, longitude } = await getCoordinates(address, location);

            await sequelize.transaction(async (t) => {
                const property = await Property.create(
                    {
                        name,
                        CategoryId,
                        price,
                        image: req.image,
                        location,
                        latitude,
                        longitude,
                        UserId: req.user.id,
                    },
                    { transaction: t }
                );
                await Specification.bulkCreate(
                    specifications.map((el) => ({ name: el.name, value: el.value, PropertyId: property.id })),
                    { transaction: t }
                );
                await PropertyImage.bulkCreate(
                    images.map((imageUrl) => ({ imageUrl, PropertyId: property.id })),
                    { transaction: t }
                );
            });
            res.status(201).json({ message: "Success Add New Property" });
        } catch (error) {
            next(error);
        }
    }
    static async editProperty(req, res, next) {
        try {
            const { id } = req.params;
            const { name, CategoryId, price, address } = req.body;
            const location = tidySuburb(req.body.location);
            const findProperty = await Property.scope("withAddress").findByPk(id);
            if (!findProperty) {
                throw { name: "not_found" };
            }
            if (findProperty.UserId !== req.user.id) {
                throw { name: "forbidden" };
            }

            // Only look the place up again when the address or suburb changed, or it has no map yet
            const moved = address !== findProperty.address || location !== findProperty.location;
            const coordinates = moved || findProperty.latitude === null ? await getCoordinates(address, location) : {};

            await findProperty.update({
                name,
                CategoryId,
                price,
                location,
                address,
                image: req.image || findProperty.image,
                ...coordinates,
            });
            if (req.images) {
                await PropertyImage.bulkCreate(req.images.map((imageUrl) => ({ imageUrl, PropertyId: findProperty.id })));
            }
            res.status(200).json({ message: "Success Edit Property" });
        } catch (error) {
            next(error);
        }
    }

    static async removeProperty(req, res, next) {
        try {
            const { id } = req.params;
            const findProperty = await Property.findByPk(id);
            if (!findProperty) {
                throw { name: "not_found" };
            }
            if (findProperty.UserId !== req.user.id) {
                throw { name: "forbidden" };
            }
            await Property.destroy({
                where: {
                    id,
                },
            });
            res.status(200).json({ message: `Success Delete Property With Id ${id}` });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = PropertyController;