export class AppError extends Error {
    constructor(message, statusCode) {
        super(message)
        this.statusCode = statusCode
        this.isOperational = true
    }
}

export class UnauthorizedError extends AppError {
    constructor(message = 'Looks like you can\'t do that') {
        super(message, 401)
    }
}

export class ForbiddenError extends AppError {
    constructor(message = 'You shall not pass!') {
        super(message, 403)
    }
}

export class NotFoundError extends AppError {
    constructor(message = 'What you requested cannot be found') {
        super(message, 404)
    }
}

export class ConstraintError extends AppError {
    constructor(message = 'That username already exists') {
        super(message, 409)
    }
}