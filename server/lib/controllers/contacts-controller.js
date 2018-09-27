/***********************************************************************
 * Required Libraries
 ***********************************************************************/
const Contacts = require('../models/contacts');
const Relationship = require('../models/relationship');
const User = require('../models/user');
const Helper = require('..//public/helper');
const SendResponse = Helper.SendResponse;

const populateQuery = [
  { path: 'contact', select: 'name email', },
  { path: 'relationship', select: 'name', }
];

/*****************************************
 * This method adds a new contact
 * @param {*} doc
 *****************************************/
function addContact(req, res) {
  User.findOne({
      email: req.body.contactEmail,
      status: 'active'
  }, (err, user) => {
    if (err) {
      return SendResponse(res, 500, err);
    }

    const contactData = {
      user: req.user._id,
      contactEmail: req.body.contactEmail,
      aliases: req.body.aliases,
      relationship: req.body.relationship
    };

    if (user) {
      contactData.contact = user._id;
    }

    Contacts.create(contactData, (err, contact) => {
      if (err) {
        return SendResponse(res, 500, err);
      }
      contact.populate(populateQuery, function(err, contact) {
        return SendResponse(res, 201, contact);
      });
    });
  });
}

/*************************************************
 * This method deletes a contact
 *
 * @param {*} req Http Req object
 * @param {*} res Http Res object
 ***********************************************/
function deleteContact(req, res) {
    Contacts.findOne({
        _id: req.params.id,
        isDeleted: false
    }, function(err, contact) {
        if (err) {
            return SendResponse(res, 500, err);
        } else if (!contact) {
            return SendResponse(res, 404, ['Contact not found']);
        }

        // Update fields
        contact.isDeleted = true;

        contact.save(function (err, savedContact) {
            if (err) {
                return SendResponse(res, 500, err);
            }

            return SendResponse(res, 202, savedContact);
        });
    });

}

/**************************************************
 * This method returns users conatcts
 * @param {*} req HTTP request object
 * @param {*} res HTTP response object
 *************************************************/
function getContacts(req, res) {
    const fieldString = 'contact contactEmail relationship aliases';

  Contacts.find({
      user: req.user._id,
      isDeleted: false
    },
    fieldString)
    .populate(populateQuery)
    .exec((err, contacts) => {
        if (err) {
            return SendResponse(res, 500, err);
        }

        return SendResponse(res, 200, contacts);
    });
}

/*************************************************
 * This method gets a contact by id.
 * @param {*} res HTTP Response object
 * @param {*} req HTTP Request object
 **********************************************/
function getContactById(req, res) {
  Contacts.findOne({
      _id: req.params.id,
      user: req.user._id,
      isDeleted: false
    })
    .populate(populateQuery)
    .exec(function(err, contact) {
      if (err) {
        return SendResponse(res, 500, err);
      } else if (!contact) {
        return SendResponse(res, 404, ['Contact not found']);
      }

      return SendResponse(res, 200, contact);
    });
  }


function getRelationships(req, res) {
  Relationship.find({})
    .exec((err, relationships) => {
      if (err) {
        return SendResponse(res, 500, err);
      }

      return SendResponse(res, 200, relationships);
    });
}

/*************************************************
 * This method updates a contact
 *
 * @param {*} req Http Req object
 * @param {*} res Http Res object
 ***********************************************/
function updateContact(req, res) {
  Contacts.findByIdAndUpdate(req.body._id, {
      contactEmail: req.body.contactEmail,
      relationship: req.body.relationship,
      aliases: req.body.aliases
  }, {
      new: true
  })
  .populate(populateQuery)
  .exec((err, contact) => {
      if (err) {
          return SendResponse(res, 500, err);
      }

      return SendResponse(res, 200, contact);
  });
}

module.exports = {
    addContact,
    deleteContact,
    getContacts,
    getContactById,
    getRelationships,
    updateContact
};
