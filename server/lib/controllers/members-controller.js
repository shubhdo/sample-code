const Contacts = require('../models/contacts');
const Organization = require('../models/organization');
const User = require('../models/user');
const Helper = require('../public/helper');
const SendResponse = Helper.SendResponse;

/*************************************************
 * This method sends invitation
 * @param {*} req Http Req object
 * @param {*} res Http Res object
 ***********************************************/
async function addMember(req, res) {
  const currentMemberCount = await User.count({
    organization: req.user.organization._id,
    status: { $in: ['active', 'invited'] }
  });
  const membersToAddCount = req.body.emails.length;

  Organization.findOne({
    _id: req.user.organization._id
  })
    .select('subscription')
    .populate('subscription')
    .exec((err, organization) => {
      if (err) {
        return SendResponse(res, 500, err);
      } else if (!organization) {
        return SendResponse(res, 404, ['Organization not found']);
      }

      // Add additional members will exceed amount allowed by subscription plan
      if (
        currentMemberCount + membersToAddCount >
        organization.subscription.maxNumberOfMembers
      ) {
        return SendResponse(res, 400, [
          'You have reached the maximum number of members, ' +
            organization.subscription.maxNumberOfMembers
        ]);
      }

      let membersToAdd = [];

      for (let i = 0; i < req.body.emails.length; i++) {
        membersToAdd.push({
          organization: organization._id,
          name: req.body.emails[i],
          email: req.body.emails[i],
          password: 'invited_' + new Date().getMilliseconds, // Set up temporary password which will be reset when they register
          status: 'invited',
          createdBy: req.user._id
        });
      }

      User.create(membersToAdd, (err, members) => {
        if (err) {
          return SendResponse(res, 500, err);
        }

        return SendResponse(res, 200, members);
      });
    });
}

/************************************************************
 * This method lists account members
 * @param {*} req HTTP Request object
 * @param {*} res HTTP Response object
 **************************************************************/
function getMembers(req, res) {
  let condition = {
    organization: req.user.organization._id,
    status: 'active'
  };

  if (req.query.status) {
    condition['status'] = {
      $in: req.query.status.split(',')
    };
  }

  User.find(condition).exec((err, members) => {
    if (err) {
      return SendResponse(res, 500, err);
    }

    if (members.length > 0) {
      let promiseArray = [];
      for (let mem of members) {
        promiseArray.push(contactsCount(mem));
      }
      return Promise.all(promiseArray)
        .then(membersWithContactsCount => {
          return SendResponse(res, 200, membersWithContactsCount);
        })
        .catch(err => {
          return SendResponse(res, 500, err);
        });
    }

    return SendResponse(res, 200, members);
  });
}

/*************************************************
 * This method gets a member by id.
 * @param {*} res HTTP Response object
 * @param {*} req HTTP Request object
 **********************************************/
function getMemberById(req, res) {
  User.findOne({
    _id: req.params.id,
    organization: req.user.organization._id
  }).exec(function(err, member) {
    if (err) {
      return SendResponse(res, 500, err);
    } else if (!member) {
      return SendResponse(res, 404, ['Member not found']);
    }

    return SendResponse(res, 200, member);
  });
}

/******************************************************
 * This method updates a member's infomation
 * @param {*} req Http req object
 * @param {*} res Http res object
 ******************************************************/
function updateMember(req, res) {
  let updateData = {};
  const populateQuery = [
    {
      path: 'organization',
      select: 'primaryAdmin'
    }
  ];

  // Fields allowed to be modified by this endpoint
  const allowedUpdateFields = ['name', 'roleTitles', 'permissions', 'status'];
  for (let i = 0; i < allowedUpdateFields.length; i++) {
    const data = req.body[allowedUpdateFields[i]];
    if (data !== undefined) {
      updateData[allowedUpdateFields[i]] = data;
    }
  }

  if (updateData.permissions) {
    delete updateData.permissions.isSuperAdmin;
  }

  User.findOne({ _id: req.body._id })
    .populate(populateQuery)
    .exec((err, user) => {
      if (err) {
        return SendResponse(res, 500, err);
      } else if (!user) {
        return SendResponse(res, 404, ['Member not found']);
      }
      // TODO - Update to enforce permission fields only
      // if (req.body._id !== user.organization.primaryAdmin.toString()) {
      user = Object.assign(user, updateData); // Update user with field values found in updateData
      user.save((err, member) => {
        if (err) {
          return SendResponse(res, 500, err);
        } else if (!member) {
          return SendResponse(res, 404, ['Member not found']);
        }
        return SendResponse(res, 200, member);
      });
      // } else {
      //     return SendResponse(res, 403, ['Primary adminstrator cannot be modified']);
      // }
    });
}

/**************************************************
 * This method gives conatcts count for a user.
 * @param {*} data
 * @param {*} condition
 ***************************************************/
function contactsCount(data, condition = null) {
  let member = !condition ? data.toObject() : data;

  if (!condition) {
    condition = { user: data._id, isDeleted: false };
  }

  return new Promise((resolve, reject) => {
    return Contacts.count(condition, (err, count) => {
      if (!err) {
        member.numberOfContacts = count;
        return resolve(member);
      }
      return reject(err);
    });
  });
}

module.exports = {
  addMember,
  getMembers,
  getMemberById,
  updateMember
};
