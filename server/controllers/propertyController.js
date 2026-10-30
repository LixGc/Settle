const { Property, User, Category, Review, Booking, UserProfile, Specification, PropertyImage } = require("../models/index");
const { sequelize } = require("../models/index");
const getCoordinates = require("../helpers/geocode");

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
            const property = await Property.findOne({
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
            res.status(200).json({ property, rating: averageRating });
        } catch (error) {
            next(error);
        }
    }

    static async fetchMyProperty(req, res, next) {
        try {
            const properties = await Property.findAll({
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
            const { name, CategoryId, price, location } = req.body;
            const specifications = req.body.specifications ? JSON.parse(req.body.specifications) : [];
            const images = req.images || [];
            const { latitude, longitude } = await getCoordinates(location);

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
            const { name, CategoryId, price, location } = req.body;

            const findProperty = await Property.findByPk(id);
            if (!findProperty) {
                throw { name: "not_found" };
            }
            if (findProperty.UserId !== req.user.id) {
                throw { name: "forbidden" };
            }

            // Only look the suburb up again when it changed, or the place has no map yet
            const needsMap = location && (location !== findProperty.location || findProperty.latitude === null);
            const coordinates = needsMap ? await getCoordinates(location) : {};

            await findProperty.update({
                name,
                CategoryId,
                price,
                location,
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