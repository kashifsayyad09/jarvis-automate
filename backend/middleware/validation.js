const { body, validationResult } = require('express-validator');

// Validation middleware
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }
    next();
};

// User registration validation rules
const registerValidation = [
    body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('fullName').trim().notEmpty().withMessage('Full name is required')
];

// User login validation rules
const loginValidation = [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required')
];

// Problem submission validation rules
const problemValidation = [
    body('title').trim().isLength({ min: 10 }).withMessage('Title must be at least 10 characters'),
    body('description').trim().isLength({ min: 50 }).withMessage('Description must be at least 50 characters'),
    body('solution').trim().isLength({ min: 20 }).withMessage('Solution must be at least 20 characters'),
    body('category').notEmpty().withMessage('Category is required'),
    body('tags').optional().isArray().withMessage('Tags must be an array')
];

module.exports = {
    validate,
    registerValidation,
    loginValidation,
    problemValidation
};
