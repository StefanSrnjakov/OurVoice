const bcrypt = require('bcrypt'); // Ensure bcrypt is imported
const SALT_WORK_FACTOR = 10; // Define salt work factor

var UserModel = require('../models/UserModel.js');
/**
 * UserController.js
 *
 * @description :: Server-side logic for managing Users.
 */
module.exports = {

    /**
     * UserController.list()
     */
    list: function (req, res) {
        UserModel.find().select('-password').exec(function (err, Users) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting User.',
                    error: err
                });
            }

            return res.json(Users);

        });
    },

    /**
     * UserController.show()
     */
    show: function (req, res) {
        var id = req.params.id;

        UserModel.findOne({_id: id}).select('-password').exec(function (err, User) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting User.',
                    error: err
                });
            }

            if (!User) {
                return res.status(404).json({
                    message: 'No such User'
                });
            }
            return res.json(User);
            //return res.render('user/profile', User);
        });
    },

    /**
     * UserController.create()
     */
    create: function (req, res) {
        var newUser = new UserModel({
            username: req.body.username,
            password: req.body.password,
            email: req.body.email
        });
    
        newUser.save(function (err, User) {
            if (err) {
                // Check for duplicate key error
                if (err.code === 11000) {
                    const field = err.keyPattern.username ? 'Username' : 'Email';
                    return res.status(409).json({
                        message: `${field} already taken. Please choose another.`,
                        error: err
                    });
                }
    
                console.log(err);
                return res.status(500).json({
                    message: 'Error when creating User',
                    error: err
                });
            }
    
            // Remove password from the response
            User.password = undefined;
            return res.status(201).json(User);
        });
    },

    login: function (req, res, next) {
    // First, find the user by username
    UserModel.findOne({ username: req.body.username }, function (error, user) {
        if (error || !user) {
            return res.status(401).json({
                message: 'Wrong username or password',
                error: new Error("Wrong username or password")
            });
        }

        // Compare the provided password with the hashed password
        bcrypt.compare(req.body.password, user.password, function (err, isMatch) {
            if (err || !isMatch) {
                return res.status(401).json({
                    message: 'Wrong username or password',
                    error: new Error("Wrong username or password")
                });
            } else {
                // If password matches, create session
                req.session.userId = user._id;
                req.session.username = user.username;

                // Optionally, remove password from user object before sending response
                user.password = undefined;

                return res.json(user);
            }
        });
    });
    },
    ban: async function (req, res) {
        try {
            const { id } = req.params;
            const { isBanned } = req.body;
            console.log(req.body);
            if (isBanned === undefined) {
                return res.status(400).json({ message: 'Polje isBanned je obvezno.' });
            }
            const user = await UserModel.findById(id);
            if (!user) {
                return res.status(404).json({ message: 'Uporabnik ne obstaja.' });
            }
            user.isBanned = isBanned;
            await user.save();
            return res.status(200).json({ message: 'Uporabnik je bil uspešno ' + (isBanned ? 'blokiran.' : 'odblokiriran.') });
        } catch (error) {
            return res.status(500).json({ message: 'Pri blokiranju uporabnika je prišlo do napake.', error });
        }
    },
    report: async function (req, res) {
        try {
            const { reportedUserId } = req.params; 
            const { reason, reportingUserId } = req.body;
    
            if (!reason || reason.trim() === '') {
                return res.status(400).json({ message: 'Razlog za prijavo je obvezen.' });
            }
            if (!reportingUserId) {
                return res.status(400).json({ message: 'ID uporabnika, ki prijavlja, je obvezen.' });
            }
    
            const reportedUser = await UserModel.findById(reportedUserId);
            if (!reportedUser) {
                return res.status(404).json({ message: 'Uporabnik, ki ga želite prijaviti, ne obstaja.' });
            }
    
            const alreadyReported = reportedUser.userReports.some(
                (report) => report.reportingUserId.toString() === reportingUserId
            );
            if (alreadyReported) {
                return res.status(400).json({ message: 'Tega uporabnika ste že prijavili.' });
            }
    
            reportedUser.userReports.push({
                reportingUserId,
                reportReason: reason,
            });
    
            await reportedUser.save();
    
            return res.status(200).json({ message: 'Uporabnik je bil uspešno prijavljen.' });
        } catch (error) {
            console.error('Napaka v funkciji za prijavo:', error);
            return res.status(500).json({ message: 'Pri prijavi uporabnika je prišlo do napake.', error });
        }
    },
    /**
     * UserController.update()
     */
    update: function (req, res) {
        const id = req.params.id;

        // Check if the user exists first
        UserModel.findOne({ _id: id }, function (err, user) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting User',
                    error: err
                });
            }
    
            if (!user) {
                return res.status(404).json({
                    message: 'No such User'
                });
            }
    
            // Prepare updates object
            const updates = {};
            
            // Check if password needs to be updated
            if (req.body.password) {
                // Validate the new password against your rules
                if (!/^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/.test(req.body.password)) {
                    return res.status(400).json({
                        message: 'Geslo mora biti dolgo vsaj 8 znakov in vsebovati vsaj eno veliko črko in eno številko.'
                    });
                }
    
                // Hash the new password
                bcrypt.hash(req.body.password, SALT_WORK_FACTOR, function(err, hash) {
                    if (err) {
                        return res.status(500).json({
                            message: 'Error while hashing password.',
                            error: err
                        });
                    }
                    // Update password with the hashed value
                    updates.password = hash;
    
                    // Now, update bio and avatar if provided
                    updates.bio = req.body.bio || user.bio; // Retain existing bio if not provided
                    updates.avatar = req.body.avatar || user.avatar; // Retain existing avatar if not provided
    
                    // Proceed to update user with hashed password
                    UserModel.updateOne({ _id: id }, updates, { runValidators: false }, function (err, result) {
                        if (err) {
                            return res.status(500).json({
                                message: 'Error when updating User.',
                                error: err
                            });
                        }
                        return res.json({ message: 'User updated successfully' });
                    });
                });
            } else {
                // If no password is being updated, only update bio and avatar
                updates.bio = req.body.bio || user.bio; // Use existing bio if not provided
                updates.avatar = req.body.avatar || user.avatar; // Use existing avatar if not provided
    
                UserModel.updateOne({ _id: id }, updates, { runValidators: true }, function (err, result) {
                    if (err) {
                        return res.status(500).json({
                            message: 'Error when updating User.',
                            error: err
                        });
                    }
                    return res.json({ message: 'User updated successfully' });
                });
            }
        });
    },

    /**
     * UserController.remove()
     */
    remove: function (req, res) {
        var id = req.params.id;

        UserModel.findByIdAndRemove(id, function (err, User) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when deleting the User.',
                    error: err
                });
            }

            return res.status(204).json();
        });
    }
};