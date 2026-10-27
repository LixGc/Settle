const errorHandler = (error, req, res, next) => {
    let code = 500;
    let message = "Internal server error";
    console.log(error);
    if (error.name == "SequelizeValidationError" || error.name == "SequelizeUniqueConstraintError") {
        code = 400;
        message = error.errors[0].message;
    } else if (error.name == "unauthenticated" || error.name == "JsonWebTokenError") {
        code = 401;
        message = "Invalid Token";
    } else if (error.name === "not_found") {
        code = 404;
        message = "Not Found";
    } else if (error.name == "ID card is required!" || error.name == "Profile Picture is required!") {
        code = 400;
        message = error.name;
    } else if (error.name == "invalid_otp") {
        code = 401;
        message = "Invalid otp code!";
    } else if (error.name == "email_is_not_registered" || error.name == "invalid_password") {
        code = 401;
        message = "Invalid Email / Password";
    } else if (error.name == "login_empty_field") {
        code = 400;
        message = "Email/Password is required!";
    } else if (error.name == "forbidden") {
        code = 403;
        message = error.message || "You are not the owner of this property";
    } else if (error.name == "SyntaxError") {
        code = 400;
        message = "Invalid JSON format";
    }
    else if (error.name === "same-user") {
        code = 403;
        message = "Cannot book your own property";
    } else if (error.name == "date_required") {
        code = 400;
        message = "Start date and end date are required";
    } else if (error.name == "invalid_date") {
        code = 400;
        message = "End date must be after start date";
    } else if (error.name == "already_booked") {
        code = 400;
        message = "Property is already booked on those dates";
    } else if (error.name == "invalid_status") {
        code = 400;
        message = "Invalid booking status";
    } else if (error.name == "review_not_allowed") {
        code = 403;
        message = "You can only review a property after completing a booking";
    } else if (error.name == "already_paid") {
        code = 400;
        message = "This booking has already been paid";
    } else if (error.name == "payment_not_completed") {
        code = 400;
        message = "Payment has not been completed";
    } else if (error.type && error.type.startsWith("Stripe")) {
        code = 400;
        message = "Payment gateway error";
    }

    res.status(code).json({ message });
};

module.exports = errorHandler;