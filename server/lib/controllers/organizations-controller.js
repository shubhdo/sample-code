const Organization = require('../models/organization');
const User = require('../models/user');
const Helper = require('../public/helper');
const SendResponse = Helper.SendResponse;

/***************************************************************************************
 * This method returns a list of organizations.
 *
 * @param {*} req HTTP Request Object
 * @param {*} res HTTP Response Object
 ***************************************************************************************/
function getOrganizations(req, res) {
  // Ensure this is only accessed by super admins
  if (!req.user.permissions.isSuperAdmin) {
    return SendResponse(res, 403, ['Permission denied']);
  }

  Organization
    .find()
    .lean()
    .populate('subscription', 'name')
    .populate('createdBy', 'name')
    .exec((err, organizations) => {
      if (err) {
        return SendResponse(res, 500, err);
      }

      // Get member counts for each organization
      User.aggregate([
        {
          '$group': {
              _id: '$organization',
              count: { $sum: 1 }
          }
        }
      ]).exec(function(err, memberCounts) {
        if (err) {
          return SendResponse(res, 500, err);
        }

        for (let i = 0; i < memberCounts.length; i++) {
          for (let j = 0; j < organizations.length; j++) {
            if (organizations[j]._id.equals(memberCounts[i]._id)) {
              organizations[j].memberCount = memberCounts[i].count;
              break;
            }
          }
        }

        return SendResponse(res, 200, organizations);
      });
    });
}

/***************************************************************************************
 * This method returns a organization based on ID.
 *
 * @param {*} req HTTP Request Object
 * @param {*} res HTTP Response Object
 ***************************************************************************************/
function getOrganizationById(req, res) {
  if (!req.user.permissions.isSuperAdmin) {
    if (req.params.id !== req.user.organization._id.toString()) {
      return SendResponse(res, 403, ['Permission denied']);
    }
  }

  Organization
    .findById(req.params.id)
    .select('name address primaryAdmin')
    .exec((err, organization) => {
      if (err) {
        return SendResponse(res, 500, err);
      } else if (!organization) {
        return SendResponse(res, 404, ['Organization not found']);
      }

      return SendResponse(res, 200, organization);
    });
}

/***************************************************************************************
 * This method returns a organization based on ID.
 *
 * @param {*} req HTTP Request Object
 * @param {*} res HTTP Response Object
 ***************************************************************************************/
function updateOrganization(req, res) {
  // Ensure this only accessed by account admins
  if (!req.user.permissions.isSuperAdmin) {
    if (req.body._id !== req.user.organization._id.toString()) {
      return SendResponse(res, 403, ['Permission denied']);
    }
  }

  let updateData = {};

  // Fields allowed to be modified by this endpoint
  const allowedUpdateFields = ['name', 'address', 'primaryAdmin'];
  for (let i = 0; i < allowedUpdateFields.length; i++) {
    const data = req.body[allowedUpdateFields[i]];
    if (data !== undefined) {
      updateData[allowedUpdateFields[i]] = data;
    }
  }

  Organization
    .findByIdAndUpdate(req.body._id, updateData, (err, organization) => {
      if (err) {
          return SendResponse(res, 500, err);
      } else if (!organization) {
          return SendResponse(res, 404, ['Organization not found']);
      }

      return SendResponse(res, 200, organization);
    });
}

module.exports = {
  getOrganizations,
  getOrganizationById,
  updateOrganization
};
