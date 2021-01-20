const express = require('express');
const router = express.Router();

// app.post("/deleteGroup", [
//   body('groupId').notEmpty().withMessage("The group ID is required to join a group")
//     .isAlphanumeric().withMessage("The group ID must be alphanumeric")
//     .isLength({ min: 24, max: 24 }).withMessage("The group ID is invalid"),
// ], async (req, res) => {
//   try {
//     // Check if the user is signed in
//     if (!req.session.userId) return res.json({ error: "Restricted route" });
//     // Check if the User entry exists in the database
//     const user = await UserModel.findById(req.session.userId).lean().exec();
//     // if the user entry doesn't exist return an error
//     if (!user) return res.json({ error: "User doesn't exist" });
//     // Group ID validation errors
//     const errors = validationResult(req);
//     // if the group ID is invalid return an error to the client
//     if (!errors.isEmpty()) return res.json({ error: errors.array()[0].msg });
//     // Check if the group entry exists
//     const group = await GroupModel.findById(req.body.groupId).exec();
//     // if the group entry doesn't exist return an error to the client
//     if (!group) return res.json({ error: "Group doesn't exist" });
//     // Check if the current user is the group's admin
//     if (String(group.admin) !== String(user._id)) {
//       return res.json({ error: "You are not allowed to delete this group" });
//     }

//     return res.json({ success: true });
//   } catch (err) { console.log(err) }
// })
// DELETE A GROUP