const express = require('express');
const router = express.Router();

// app.post("/acceptReq", [
//   body('groupId').notEmpty().withMessage("The group ID is required to accept a member")
//     .isAlphanumeric().withMessage("The group ID must be alphanumeric")
//     .isLength({ min: 24, max: 24 }).withMessage("The group ID is invalid"),
//   body('member').notEmpty().withMessage("The member ID is required to accept a member")
//     .isAlphanumeric().withMessage("The member ID must be alphanumeric")
//     .isLength({ min: 24, max: 24 }).withMessage("The member ID is invalid"),
// ], async (req, res) => {
//   try {
//     // Check if the user is signed in
//     if (!req.session.userId) return res.json({ error: "Restricted route" });
//     // Check if the User entry exists in the database
//     const user = await UserModel.findById(req.session.userId).exec();
//     // if the user entry doesn't exist return an error
//     if (!user) return res.json({ error: "Restricted route" });
//     const member = await UserModel.findById(req.body.member).exec();
//     // if the user entry doesn't exist return an error
//     if (!member) return res.json({ error: "Member doesn't exist" });
//     // Group ID validation errors
//     const errors = validationResult(req);
//     // if the group ID is invalid return an error to the client
//     if (!errors.isEmpty()) return res.json({ error: errors.array()[0].msg });
//     // Check if the group entry exists
//     const group = await GroupModel.findById(req.body.groupId).exec();
//     // if the group entry doesn't exist return an error to the client
//     if (!group) return res.json({ error: "Group doesn't exist" });
//     // Add the new member to the group
//     group.users.push(req.body.from);
//     member.groups.push(req.body.groupId)
//     // Find the notification
//     let index = 0;
//     for (index; index < user.notifications.length; index++) {
//       if (String(user.notifications[index].groupId) === String(req.body.groupId) &&
//         String(user.notifications[index].from) === String(req.body.member)) {
//         break;
//       }
//     }
//     // Delete the notification
//     user.notifications.splice(index, 1);
//     // Save the group & the user
//     const savedGroup = await group.save();
//     const savedUser = await user.save();
//     const savedMember = await member.save();
//     return res.json({ index });
//   } catch (err) { console.log(err) }
// })