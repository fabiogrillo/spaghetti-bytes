// server/models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        minlength: [3, 'Username must be at least 3 characters'],
        maxlength: [30, 'Username cannot exceed 30 characters'],
        match: [/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters']
    },
    role: {
        type: String,
        enum: ['user', 'moderator', 'admin', 'superadmin'],
        default: 'user'
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'suspended', 'banned'],
        default: 'active'
    },
    profile: {
        firstName: String,
        lastName: String,
        bio: {
            type: String,
            maxlength: [500, 'Bio cannot exceed 500 characters']
        },
        avatar: String,
        website: String,
        location: String,
        socialLinks: {
            twitter: String,
            linkedin: String,
            github: String,
            facebook: String
        }
    },
    preferences: {
        newsletter: {
            type: Boolean,
            default: false
        },
        notifications: {
            email: {
                type: Boolean,
                default: true
            },
            push: {
                type: Boolean,
                default: false
            }
        },
        theme: {
            type: String,
            enum: ['light', 'dark', 'auto'],
            default: 'auto'
        }
    },
    security: {
        twoFactorEnabled: {
            type: Boolean,
            default: false
        },
        twoFactorSecret: String,
        passwordResetToken: String,
        passwordResetExpires: Date,
        emailVerificationToken: String,
        emailVerified: {
            type: Boolean,
            default: false
        },
        loginAttempts: {
            type: Number,
            default: 0
        },
        lockUntil: Date,
        lastLogin: Date,
        lastPasswordChange: Date
    },
    metadata: {
        ipAddress: String,
        userAgent: String,
        referrer: String,
        source: String
    },
    stats: {
        postsCount: {
            type: Number,
            default: 0
        },
        commentsCount: {
            type: Number,
            default: 0
        },
        likesReceived: {
            type: Number,
            default: 0
        }
    }
}, {
    timestamps: true // Adds createdAt and updatedAt automatically
});

// Remove duplicate indexes - let MongoDB handle unique constraints from schema
// Only add compound indexes if needed
userSchema.index({ role: 1, status: 1 });
userSchema.index({ 'security.emailVerified': 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function () {
    if (this.profile.firstName && this.profile.lastName) {
        return `${this.profile.firstName} ${this.profile.lastName}`;
    }
    return this.username;
});

// Check if account is locked
userSchema.virtual('isLocked').get(function () {
    return !!(this.security.lockUntil && this.security.lockUntil > Date.now());
});

// Pre-save middleware to hash password
userSchema.pre('save', async function (next) {
    // Only hash the password if it has been modified
    if (!this.isModified('password')) {
        return next();
    }

    try {
        // Generate salt and hash password
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);

        // Update password change date
        this.security.lastPasswordChange = new Date();

        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw new Error('Password comparison failed');
    }
};

// Method to handle failed login attempts
userSchema.methods.incLoginAttempts = function () {
    // If we have a previous lock that has expired, restart at 1
    if (this.security.lockUntil && this.security.lockUntil < Date.now()) {
        return this.updateOne({
            $set: { 'security.loginAttempts': 1 },
            $unset: { 'security.lockUntil': 1 }
        });
    }

    // Otherwise we're incrementing
    const updates = { $inc: { 'security.loginAttempts': 1 } };

    // Lock the account after 5 attempts for 2 hours
    const maxAttempts = 5;
    const lockTime = 2 * 60 * 60 * 1000; // 2 hours

    if (this.security.loginAttempts + 1 >= maxAttempts && !this.isLocked) {
        updates.$set = { 'security.lockUntil': Date.now() + lockTime };
    }

    return this.updateOne(updates);
};

// Method to reset login attempts
userSchema.methods.resetLoginAttempts = function () {
    return this.updateOne({
        $set: {
            'security.loginAttempts': 0,
            'security.lastLogin': new Date()
        },
        $unset: { 'security.lockUntil': 1 }
    });
};

// Method to check permissions
userSchema.methods.hasPermission = function (permission) {
    const permissions = {
        user: ['read'],
        moderator: ['read', 'write', 'moderate'],
        admin: ['read', 'write', 'moderate', 'delete', 'manage_users'],
        superadmin: ['read', 'write', 'moderate', 'delete', 'manage_users', 'manage_system']
    };

    return permissions[this.role] && permissions[this.role].includes(permission);
};

// Method to check if user is admin
userSchema.methods.isAdmin = function () {
    return this.role === 'admin' || this.role === 'superadmin';
};

// Static method to find by email
userSchema.statics.findByEmail = function (email) {
    return this.findOne({ email: email.toLowerCase() });
};

// Remove sensitive information when converting to JSON
userSchema.methods.toJSON = function() {
    const userObject = this.toObject();
    
    // Remove sensitive fields
    delete userObject.password;
    delete userObject.__v;
    
    // Safely handle socialLinks if it exists
    if (userObject.socialLinks && typeof userObject.socialLinks === 'object') {
        // Remove empty social links
        const socialLinks = {};
        Object.keys(userObject.socialLinks).forEach(key => {
            if (userObject.socialLinks[key]) {
                socialLinks[key] = userObject.socialLinks[key];
            }
        });
        
        // Only include socialLinks if it has values
        if (Object.keys(socialLinks).length > 0) {
            userObject.socialLinks = socialLinks;
        } else {
            delete userObject.socialLinks;
        }
    }
    
    // Safely handle preferences if it exists
    if (userObject.preferences && typeof userObject.preferences === 'object') {
        // Check if preferences has any actual content
        const hasPreferences = userObject.preferences.newsletter || 
                              userObject.preferences.notifications || 
                              userObject.preferences.theme;
        
        if (!hasPreferences) {
            delete userObject.preferences;
        }
    }
    
    // Safely handle metadata if it exists
    if (userObject.metadata && typeof userObject.metadata === 'object') {
        // Check if metadata has any actual content
        const hasMetadata = userObject.metadata.lastLogin || 
                           userObject.metadata.loginCount || 
                           userObject.metadata.ipAddress;
        
        if (!hasMetadata) {
            delete userObject.metadata;
        }
    }
    
    return userObject;
};

const User = mongoose.model("User", userSchema);

module.exports = User;