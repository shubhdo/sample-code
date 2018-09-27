const Group = require('../models/groups');
const Helper = require('../public/helper');
const SendResponse = Helper.SendResponse;

/*************************************************
 * This method creates a new group
 *
 * @param {*} req Http Req object
 * @param {*} res Http Res object
 ***********************************************/
function createGroup(req, res) {
    Group.create({
        name: req.body.name,
        organization: req.user.organization,
        members: req.body.members,
        createdBy: req.user._id
    }, (err, group) => {
        if (err) {
            return SendResponse(res, 500, err);
        } else if (!group) {
            return SendResponse(res, 404, ['Created group not found']);
        }

        group
        .populate('createdBy', 'name')
        .populate('members.member', 'name')
        .populate('members.contact', 'alias name',
        function(err, group) {
            return SendResponse(res, 201, group);
        });
    });
}

/*************************************************
 * This method deletes a group
 *
 * @param {*} req Http Req object
 * @param {*} res Http Res object
 ***********************************************/
function deleteGroup(req, res) {
    Group.findOne({
        _id: req.params.id,
        organization: req.user.organization,
        isDeleted: false
    }, function(err, group) {
        if (err) {
            return SendResponse(res, 500, err);
        } else if (!group) {
            return SendResponse(res, 404, ['Group not found']);
        }

        // Update fields
        group.isDeleted = true;

        group.save(function (err, savedGroup) {
            if (err) {
                return SendResponse(res, 500, err);
            }

            return SendResponse(res, 202, savedGroup);
        });
    });
}

/*************************************************
 * This method lists the groups
 *
 * @param {*} req Http Req object
 * @param {*} res Http Res object
 ***********************************************/
function getGroups(req, res) {
    Group.find({
        organization: req.user.organization,
        isDeleted: false
    })
    .populate('createdBy', 'name')
    .populate('members.member', 'name')
    .populate('members.contact', 'alias name')
    .exec((err, groups) => {
        if (err) {
            return SendResponse(res, 500, err);
        }

        return SendResponse(res, 200, groups);
    });
}

/*************************************************
 * This method lists the groups
 *
 * @param {*} req Http Req object
 * @param {*} res Http Res object
 ***********************************************/
function getGroupById(req, res) {
    Group.findOne({
        _id: req.params.id,
        organization: req.user.organization,
        isDeleted: false
    })
    .populate('createdBy', 'name')
    .populate('members.member', 'name')
    .populate('members.contact', 'alias name')
    .exec((err, group) => {
        if (err) {
            return SendResponse(res, 500, err);
        } else if (!group) {
            return SendResponse(res, 404, ['Group not found']);
        }

        return SendResponse(res, 200, group);
    });
}

/*************************************************
 * This method updates a new group
 *
 * @param {*} req Http Req object
 * @param {*} res Http Res object
 ***********************************************/
function updateGroup(req, res) {
    Group.findOne({
        _id: req.body._id,
        organization: req.user.organization,
        isDeleted: false
    }, function(err, group) {
        if (err) {
            return SendResponse(res, 500, err);
        } else if (!group) {
            return SendResponse(res, 404, ['Group not found']);
        }

        // Update fields
        group.name = req.body.name;
        group.members = req.body.members;

        group.save(function (err, group) {
            if (err) {
                return SendResponse(res, 500, err);
            }

            group
            .populate('createdBy', 'name')
            .populate('members.member', 'name')
            .populate('members.contact', 'alias name',
            function(err, group) {
                return SendResponse(res, 200, group);
            });
        });
    });
}

module.exports = {
    createGroup,
    deleteGroup,
    getGroups,
    getGroupById,
    updateGroup
};
