const express = require('express');
const router = express.Router();

// // JOIN A GROUP RESTRICTED POST ROUTE
// app.post("/joinGroup", [
//   body('data').notEmpty().withMessage("The group ID is required to join a group")
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
//     const group = await GroupModel.findById(req.body.data).exec();
//     // if the group entry doesn't exist return an error to the client
//     if (!group) return res.json({ error: "Group doesn't exist" });
//     // Check if the user isn't in this group already
//     for (let i = 0; i < user.groups.length; i++) {
//       if (String(user.groups[i]) === String(req.body.data)) {
//         return res.json({ error: "You are already in this group" });
//       }
//     }
//     // Find the group admin user entry
//     const groupAdmin = await UserModel.findById(group.admin).exec();
//     // if the group admin user entry doesn't exist return an error to the client
//     if (!groupAdmin) return res.json({ error: "The group admin is not available" });
//     // Check if the user didnt send a request to the admin already
//     let nots = groupAdmin.notifications;
//     for (let i = 0; i < nots.length; i++) {
//       if (String(nots[i].from) === String(user._id) && String(nots[i].groupName) === String(group.name)) {
//         return res.json({ error: "You already sent a request to the admin" });
//       }
//     }
//     // Push the user's request to the group admin
//     groupAdmin.notifications.push({
//       from: user._id, name: user.name,
//       groupName: group.name, groupId: group._id
//     })
//     const saved = await groupAdmin.save();
//     return res.json({ success: true });
//   } catch (err) { console.log(err) }
// })