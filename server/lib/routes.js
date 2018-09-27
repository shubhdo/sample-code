const validate = require('express-validation');
const { auth, authWithPrivateKey } = require('./auth');

// Controllers
const authenticationController = require('./controllers/authentication-controller');
const billingController = require('./controllers/billing-controller');
const contactsController = require('./controllers/contacts-controller');
const groupsController = require('./controllers/groups-controller');
const membersController = require('./controllers/members-controller');
const organizationsController = require('./controllers/organizations-controller');
const sessionsController = require('./controllers/sessions-controller');
const subscriptionController = require('./controllers/subscription-controller');
const subscriptionPlans = require('./controllers/subscription-plans-controller');
const userController = require('./controllers/user-controller');
const emailController = require('./controllers/email-controller');
const smsController = require('./controllers/sms-controller');

// Validators
const authenticationValidation = require('./validations/authentication-validation');
const contactValidation = require('./validations/contact-validation');
const creditCardValidation = require('./validations/credit-card-validation');
const emailValidation = require('./validations/email-validation');
const groupValidation = require('./validations/group-validation');
const memberValidation = require('./validations/member-validation');
const smsValidation = require('./validations/sms-validation');
const subscriptionPlanValidation = require('./validations/subscription-plan-validation');

/**********************************************************
 * Routing controller
 *********************************************************/
module.exports = app => {
  const baseUrl = '/api',
    notificationBaseUrl = baseUrl + '/notification',
    billingBaseUrl = baseUrl + '/billing',
    contactsBaseUrl = baseUrl + '/contacts',
    emailBaseUrl = notificationBaseUrl + '/email',
    groupBaseUrl = baseUrl + '/groups',
    invoicesBaseUrl = billingBaseUrl + '/invoices',
    membersBaseUrl = baseUrl + '/members',
    organizationBaseUrl = baseUrl + '/organizations',
    paymentMethodsBaseUrl = billingBaseUrl + '/paymentMethods',
    plansBaseUrl = baseUrl + '/plans',
    resetPasswordBaseUrl = baseUrl + '/resetPassword',
    smsBaseUrl = notificationBaseUrl + '/sms',
    subscriptionBaseUrl = baseUrl + '/subscription',
    userBaseUrl = baseUrl + '/user';

  /**
   * @swagger
   * /login:
   *   post:
   *     tags:
   *       - Authentication
   *     summary:
   *       - Login using email and password
   *     security: []
   *     description: Login using email and password
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: login
   *         in: body
   *         required: true
   *         schema:
   *           type: object
   *           properties:
   *             email:
   *               type: string
   *             password:
   *               type: string
   *     responses:
   *       200:
   *         $ref: '#/responses/Success'
   *       400:
   *         $ref: '#/responses/BadRequest'
   */
  app.post(
    baseUrl + '/login',
    validate(authenticationValidation.login),
    authenticationController.login
  );

  app.post(baseUrl + '/login/social', authenticationController.socialLogin);

  /**
   * @swagger
   * /logout:
   *   get:
   *     tags:
   *       - Authentication
   *     summary:
   *       - End your session
   *     description: End your session
   *     produces:
   *       - application/json
   *     responses:
   *       204:
   *         $ref: '#/responses/NoContent'
   *       401:
   *         $ref: '#/responses/Unauthorized'
   *       404:
   *         $ref: '#/responses/NotFound'
   */
  app.get(baseUrl + '/logout', auth(), authenticationController.logout);

  /**
   * @swagger
   * /register:
   *   post:
   *     tags:
   *       - Authentication
   *     summary:
   *       - Register an organization
   *     security: []
   *     description: Register an organization
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: registration
   *         in: body
   *         required: true
   *         schema:
   *           type: object
   *           properties:
   *             subscriptionPlanId:
   *               type: string
   *             name:
   *               type: string
   *             organization:
   *               type: string
   *             email:
   *               type: string
   *             password:
   *               type: string
   *             confirmPassword:
   *               type: string
   *             isPolicyAccepted:
   *               type: boolean
   *     responses:
   *       200:
   *         $ref: '#/responses/Success'
   *       400:
   *         description: Bad Request
   */
  app.post(
    baseUrl + '/register',
    validate(authenticationValidation.accountRegistration),
    authenticationController.accountRegistration
  );

  /**
   * @swagger
   * /register/{id}:
   *   post:
   *     tags:
   *       - Authentication
   *     summary:
   *       - Register as a member of an existing organization
   *     security: []
   *     description: Register as a member of an existing organization
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: id
   *         description: Id of member added by an account adminstrator
   *         in: path
   *         required: true
   *         type: string
   *       - name: registration
   *         in: body
   *         required: true
   *         schema:
   *           type: object
   *           properties:
   *             name:
   *               type: string
   *             password:
   *               type: string
   *             confirmPassword:
   *               type: string
   *     responses:
   *       200:
   *         $ref: '#/responses/Success'
   *       400:
   *         $ref: '#/responses/BadRequest'
   */
  app.post(
    baseUrl + '/register/:id',
    validate(authenticationValidation.memberRegistration),
    authenticationController.memberRegistration
  );

  /**
   * @swagger
   * /resetPassword:
   *   post:
   *     tags:
   *       - Authentication
   *     summary:
   *       - Request to reset your password
   *     security: []
   *     description: Request to reset your password. An email will be sent to the given email address with further instructions.
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: resetPassword
   *         in: body
   *         required: true
   *         schema:
   *           type: object
   *           properties:
   *             email:
   *               type: string
   *     responses:
   *       204:
   *         $ref: '#/responses/NoContent'
   *       400:
   *         $ref: '#/responses/BadRequest'
   *       404:
   *         $ref: '#/responses/NotFound'
   */
  app.post(
    resetPasswordBaseUrl,
    validate(authenticationValidation.resetPasswordEmail),
    authenticationController.sendResetPasswordEmail
  );

  /**
   * @swagger
   * /resetPassword/{code}:
   *   post:
   *     tags:
   *       - Authentication
   *     summary:
   *       - Reset your password
   *     security: []
   *     description: Reset your password
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: code
   *         in: path
   *         required: true
   *         type: string
   *       - name: resetPassword
   *         in: body
   *         required: true
   *         schema:
   *           type: object
   *           properties:
   *             password:
   *               type: string
   *             confirmPassword:
   *               type: string
   *     responses:
   *       204:
   *         $ref: '#/responses/NoContent'
   *       400:
   *         $ref: '#/responses/BadRequest'
   *       404:
   *         $ref: '#/responses/NotFound'
   */
  app.post(
    resetPasswordBaseUrl + '/:code',
    validate(authenticationValidation.resetPassword),
    authenticationController.resetPassword
  );

  /**
   * @swagger
   * /billing/invoices:
   *   get:
   *     tags:
   *       - Billing
   *     summary:
   *       - View past invoices
   *     description: Returns a list of invoices
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         $ref: '#/responses/Success'
   *       401:
   *         $ref: '#/responses/Unauthorized'
   */
  app.get(
    invoicesBaseUrl,
    auth('isAccountAdmin'),
    billingController.getInvoices
  );

  /**
   * @swagger
   * /billing/invoices/upcoming:
   *   get:
   *     tags:
   *       - Billing
   *     summary:
   *       - View invoice for next billing period
   *     description: Returns the next invoice to be billed
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         $ref: '#/responses/Success'
   *       401:
   *         $ref: '#/responses/Unauthorized'
   */
  app.get(
    invoicesBaseUrl + '/upcoming',
    auth('isAccountAdmin'),
    billingController.getUpcomingInvoice
  );

  /**
   * @swagger
   * /billing/paymentMethods:
   *   get:
   *     tags:
   *       - Billing
   *     summary:
   *       - View stored payment methods
   *     description: Returns a list of payments available
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         $ref: '#/responses/Success'
   *       401:
   *         $ref: '#/responses/Unauthorized'
   */
  app.get(
    paymentMethodsBaseUrl,
    auth('isAccountAdmin'),
    billingController.getCreditCards
  );

  /**
   * @swagger
   * /billing/paymentMethods:
   *   post:
   *     tags:
   *       - Billing
   *     summary:
   *       - Save new credit card as a payment method
   *     description: Save new credit card to use as a payment method
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         $ref: '#/responses/Success'
   *       401:
   *         $ref: '#/responses/Unauthorized'
   */
  app.post(
    paymentMethodsBaseUrl,
    auth('isAccountAdmin'),
    billingController.addCreditCard
  );

  /**
   * @swagger
   * /billing/paymentMethods:
   *   put:
   *     tags:
   *       - Billing
   *     summary:
   *       - Update details of an existing payment method
   *     description: Update details of an existing payment method
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: creditCard
   *         in: body
   *         required: true
   *         schema:
   *           type: object
   *           properties:
   *             id:
   *               type: string
   *             cardHolderName:
   *               type: string
   *               description: Cardholder name
   *             month:
   *               type: number
   *               description: Expiration month
   *             year:
   *               type: number
   *               description: Expiration year
   *             setDefaultSource:
   *               type: boolean
   *               description: Set as default payment method
   *     responses:
   *       200:
   *         $ref: '#/responses/Success'
   *       400:
   *         $ref: '#/responses/BadRequest'
   *       401:
   *         $ref: '#/responses/Unauthorized'
   */
  app.put(
    paymentMethodsBaseUrl,
    auth('isAccountAdmin'),
    validate(creditCardValidation),
    billingController.updateCreditCard
  );

  /**
   * @swagger
   * /contacts:
   *   get:
   *     tags:
   *       - Contacts
   *     summary:
   *       - View your contacts
   *     description: Returns a list of contacts
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         $ref: '#/responses/Success'
   *       401:
   *         $ref: '#/responses/Unauthorized'
   */
  app.get(contactsBaseUrl, auth(), contactsController.getContacts);

  /**
   * @swagger
   * /contacts:
   *   post:
   *     tags:
   *       - Contacts
   *     summary:
   *       - Create a contact
   *     description: Add a new contact
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: contact
   *         in: body
   *         required: true
   *         schema:
   *           type: object
   *           properties:
   *             name:
   *               type: string
   *             contactEmail:
   *               type: string
   *             relationship:
   *               type: string
   *             aliases:
   *               type: array
   *               items:
   *                 type: string
   *     responses:
   *       200:
   *         $ref: '#/responses/Success'
   *       400:
   *         $ref: '#/responses/BadRequest'
   *       401:
   *         $ref: '#/responses/Unauthorized'
   */
  app.post(
    contactsBaseUrl,
    auth(),
    validate(contactValidation.create),
    contactsController.addContact
  );

  /**
   * @swagger
   * /contacts:
   *   put:
   *     tags:
   *       - Contacts
   *     summary:
   *       - Update a contact
   *     description: Update an existing contact
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: contact
   *         in: body
   *         required: true
   *         schema:
   *           type: object
   *           properties:
   *             _id:
   *               type: string
   *             name:
   *               type: string
   *             contactEmail:
   *               type: string
   *             relationship:
   *               type: string
   *             aliases:
   *               type: array
   *               items:
   *                 type: string
   *     responses:
   *       200:
   *         $ref: '#/responses/Success'
   *       400:
   *         $ref: '#/responses/BadRequest'
   *       401:
   *         $ref: '#/responses/Unauthorized'
   *       404:
   *         $ref: '#/responses/NotFound'
   */
  app.put(
    contactsBaseUrl,
    auth(),
    validate(contactValidation.update),
    contactsController.updateContact
  );

  /**
   * @swagger
   * /contacts/:id:
   *   delete:
   *     tags:
   *       - Contacts
   *     summary:
   *       - Delete a contact
   *     description: Delete a contact
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: id
   *         description: Id of contact to delete
   *         in: path
   *         required: true
   *         type: string
   *     responses:
   *       202:
   *         $ref: '#/responses/Success'
   *       401:
   *         $ref: '#/responses/Unauthorized'
   *       404:
   *         $ref: '#/responses/NotFound'
   */
  app.delete(
    contactsBaseUrl + '/:id',
    auth(),
    contactsController.deleteContact
  );

  /**
   * @swagger
   * /contacts/relationships:
   *   get:
   *     tags:
   *       - Contacts
   *     summary:
   *       - View possible relationships
   *     description: Returns a list of possible relationships
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         $ref: '#/responses/Success'
   *       401:
   *         $ref: '#/responses/Unauthorized'
   */
  app.get(
    contactsBaseUrl + '/relationships',
    auth(),
    contactsController.getRelationships
  );

  /**
   * @swagger
   * /contacts/{id}:
   *   get:
   *     tags:
   *       - Contacts
   *     summary:
   *       - View a contact
   *     description: Returns a contact
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         $ref: '#/responses/Success'
   *       401:
   *         $ref: '#/responses/Unauthorized'
   *       404:
   *         $ref: '#/responses/NotFound'
   */
  app.get(contactsBaseUrl + '/:id', auth(), contactsController.getContactById);

  /**
   * @swagger
   * /groups:
   *   get:
   *     tags:
   *       - Groups
   *     summary:
   *       - Groups in your organization
   *     description: Returns a list of groups
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         $ref: '#/responses/Success'
   *       401:
   *         $ref: '#/responses/Unauthorized'
   */
  app.get(groupBaseUrl, auth(), groupsController.getGroups);

  /**
   * @swagger
   * /groups/{id}:
   *   get:
   *     tags:
   *       - Groups
   *     summary:
   *       - View a group in your organization
   *     description: Returns a group
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         $ref: '#/responses/Success'
   *       401:
   *         $ref: '#/responses/Unauthorized'
   *       404:
   *         $ref: '#/responses/NotFound'
   */
  app.get(groupBaseUrl + '/:id', auth(), groupsController.getGroupById);

  /**
   * @swagger
   * /groups:
   *   post:
   *     tags:
   *       - Groups
   *     summary:
   *       - Create a group
   *     description: Add a new group to your organization
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: group
   *         in: body
   *         required: true
   *         schema:
   *           type: object
   *           properties:
   *             name:
   *               type: string
   *             members:
   *               type: array
   *               items:
   *                 type: string
   *     responses:
   *       201:
   *         $ref: '#/responses/Created'
   *       400:
   *         $ref: '#/responses/BadRequest'
   *       401:
   *         $ref: '#/responses/Unauthorized'
   */
  app.post(
    groupBaseUrl,
    auth(),
    validate(groupValidation.create),
    groupsController.createGroup
  );

  /**
   * @swagger
   * /groups:
   *   put:
   *     tags:
   *       - Groups
   *     summary:
   *       - Update a group
   *     description: Update an existing group
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: group
   *         in: body
   *         required: true
   *         schema:
   *           type: object
   *           properties:
   *             _id:
   *               type: string
   *             name:
   *               type: string
   *             members:
   *               type: array
   *               items:
   *                 type: string
   *     responses:
   *       200:
   *         $ref: '#/responses/Success'
   *       400:
   *         $ref: '#/responses/BadRequest'
   *       401:
   *         $ref: '#/responses/Unauthorized'
   *       404:
   *         $ref: '#/responses/NotFound'
   */
  app.put(
    groupBaseUrl,
    auth(),
    validate(groupValidation.update),
    groupsController.updateGroup
  );

  /**
   * @swagger
   * /groups/:id:
   *   delete:
   *     tags:
   *       - Groups
   *     summary:
   *       - Delete a group
   *     description: Delete a group
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: id
   *         description: Id of the group to delete
   *         in: path
   *         required: true
   *         type: string
   *     responses:
   *       202:
   *         $ref: '#/responses/Success'
   *       401:
   *         $ref: '#/responses/Unauthorized'
   *       404:
   *         $ref: '#/responses/NotFound'
   */
  app.delete(groupBaseUrl + '/:id', auth(), groupsController.deleteGroup);

  /**
   * @swagger
   * /members:
   *   get:
   *     tags:
   *       - Members
   *     summary:
   *       - Members in your organization
   *     description: Returns a list of members
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         $ref: '#/responses/Success'
   *       401:
   *         $ref: '#/responses/Unauthorized'
   */
  app.get(membersBaseUrl, auth(), membersController.getMembers);

  /**
   * @swagger
   * /members/{id}:
   *   get:
   *     tags:
   *       - Members
   *     summary:
   *       - View a member
   *     description: Returns a member
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         $ref: '#/responses/Success'
   *       401:
   *         $ref: '#/responses/Unauthorized'
   *       404:
   *         $ref: '#/responses/NotFound'
   */
  app.get(membersBaseUrl + '/:id', auth(), membersController.getMemberById);

  /**
   * @swagger
   * /members:
   *   post:
   *     tags:
   *       - Members
   *     summary:
   *       - Request people to join your organization
   *     description: Send requests to people to join your organization
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: emails
   *         in: body
   *         required: true
   *         schema:
   *           type: object
   *           properties:
   *             emails:
   *               type: array
   *               items:
   *                 type: string
   *     responses:
   *       200:
   *         $ref: '#/responses/Success'
   *       400:
   *         $ref: '#/responses/BadRequest'
   *       401:
   *         $ref: '#/responses/Unauthorized'
   */
  app.post(
    membersBaseUrl,
    auth(),
    validate(memberValidation.invite),
    membersController.addMember
  );

  /**
   * @swagger
   * /members:
   *   put:
   *     tags:
   *       - Members
   *     summary:
   *       - Update a member
   *     description: Update an existing member
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: _id
   *         description: Id of member
   *         in: path
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         $ref: '#/responses/Success'
   *       400:
   *         $ref: '#/responses/BadRequest'
   *       401:
   *         $ref: '#/responses/Unauthorized'
   */
  app.put(
    membersBaseUrl,
    auth(),
    validate(memberValidation.update),
    membersController.updateMember
  );

  /**
   * @swagger
   * /organizations:
   *   get:
   *     tags:
   *       - Organization
   *     summary:
   *       - View all organizations
   *     description: Returns a list of organizations
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         $ref: '#/responses/Success'
   *       401:
   *         $ref: '#/responses/Unauthorized'
   */
  app.get(
    organizationBaseUrl,
    auth('isSuperAdmin'),
    organizationsController.getOrganizations
  );

  /**
   * @swagger
   * /organizations/{id}:
   *   get:
   *     tags:
   *       - Organization
   *     summary:
   *       - Details about your organization's account
   *     description: Returns your organization
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: id
   *         description: Id of the organization to return
   *         in: path
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         $ref: '#/responses/Success'
   *       401:
   *         $ref: '#/responses/Unauthorized'
   */
  app.get(
    organizationBaseUrl + '/:id',
    auth('isAccountAdmin'),
    organizationsController.getOrganizationById
  );

  /**
   * @swagger
   * /organizations:
   *   put:
   *     tags:
   *       - Organization
   *     summary:
   *       - Update a organization
   *     description: Update an existing organization
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: organization
   *         in: body
   *         required: true
   *         schema:
   *           type: object
   *           properties:
   *             name:
   *               type: string
   *             primaryAdmin:
   *               type: string
   *               description: Id of a member
   *     responses:
   *       200:
   *         $ref: '#/responses/Success'
   *       401:
   *         $ref: '#/responses/Unauthorized'
   */
  app.put(
    organizationBaseUrl,
    auth('isAccountAdmin'),
    organizationsController.updateOrganization
  );

  /**
   * @swagger
   * /subscription:
   *   get:
   *     tags:
   *       - Subscription
   *     summary:
   *       - Details about your current subscription plan
   *     description: Returns your current subscription plan
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         $ref: '#/responses/Success'
   *       401:
   *         $ref: '#/responses/Unauthorized'
   */
  app.get(
    subscriptionBaseUrl,
    auth(),
    subscriptionController.getSubscriptionPlan
  );

  /**
   * @swagger
   * /subscription/cancel:
   *   put:
   *     tags:
   *       - Subscription
   *     summary:
   *       - Cancel your subscription
   *     description: Cancel your subscription plan
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: strategy
   *         in: body
   *         required: true
   *         schema:
   *           type: object
   *           properties:
   *             strategy:
   *               type: string
   *               enum:
   *                 - immediately
   *                 - period_end
   *     responses:
   *       200:
   *         $ref: '#/responses/Success'
   *       401:
   *         $ref: '#/responses/Unauthorized'
   */
  app.put(
    subscriptionBaseUrl + '/cancel',
    auth('isAccountAdmin'),
    subscriptionController.cancelSubscription
  );

  /**
   * @swagger
   * /subscription/change/{newPlanId}:
   *   put:
   *     tags:
   *       - Subscription
   *     summary:
   *       - Upgrade or downgrade your subscription plan
   *     description: Upgrade or downgrade your subscription plan
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         $ref: '#/responses/Success'
   *       401:
   *         $ref: '#/responses/Unauthorized'
   *       404:
   *         $ref: '#/responses/NotFound'
   */
  app.put(
    subscriptionBaseUrl + '/change/:id',
    auth('isAccountAdmin'),
    subscriptionController.changeSubscriptionPlan
  );

  /**
   * @swagger
   * /plans:
   *   get:
   *     tags:
   *       - Subscription Plans
   *     summary:
   *       - Plans available for registration
   *     security: []
   *     description: Returns plans available for registration
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: status
   *         in: query
   *         type: string
   *         required: false
   *         default: active
   *         description: Filter by active or inactive plans
   *         enum:
   *           - active
   *           - inactive
   *     responses:
   *       200:
   *         $ref: '#/responses/Success'
   */
  app.get(plansBaseUrl, subscriptionPlans.getSubscriptionPlans);

  /**
   * @swagger
   * /plans/{id}:
   *   get:
   *     tags:
   *       - Subscription Plans
   *     summary:
   *       - View a subscription plan
   *     security: []
   *     description: Returns the subscription plan
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: id
   *         in: path
   *         type: string
   *         required: true
   *     responses:
   *       200:
   *         $ref: '#/responses/Success'
   *       404:
   *         $ref: '#/responses/NotFound'
   */
  app.get(plansBaseUrl + '/:id', subscriptionPlans.getSubscriptionPlanById);

  /**
   * @swagger
   * /plans:
   *   post:
   *     tags:
   *       - Subscription Plans
   *     summary:
   *       - Create a plan
   *     description: Create a plan
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: plan
   *         in: body
   *         required: true
   *         schema:
   *           type: object
   *           properties:
   *             name:
   *               type: string
   *             description:
   *               type: string
   *             price:
   *               type: number
   *             maxNumberOfMembers:
   *               type: number
   *             duration:
   *               type: string
   *               enum:
   *                 - monthly
   *                 - yearly
   *     responses:
   *       200:
   *         $ref: '#/responses/Success'
   *       400:
   *         $ref: '#/responses/BadRequest'
   *       401:
   *         $ref: '#/responses/Unauthorized'
   *       403:
   *         $ref: '#/responses/Forbidden'
   */
  app.post(
    plansBaseUrl,
    auth('isSuperAdmin'),
    validate(subscriptionPlanValidation.create),
    subscriptionPlans.createSubscriptionPlan
  );

  /**
   * @swagger
   * /plans:
   *   put:
   *     tags:
   *       - Subscription Plans
   *     summary:
   *       - Update a plan
   *     description: Update a plan
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: plan
   *         in: body
   *         required: true
   *         schema:
   *           type: object
   *           properties:
   *             _id:
   *               type: string
   *             name:
   *               type: string
   *             description:
   *               type: string
   *     responses:
   *       200:
   *         $ref: '#/responses/Success'
   *       400:
   *         $ref: '#/responses/BadRequest'
   *       401:
   *         $ref: '#/responses/Unauthorized'
   *       403:
   *         $ref: '#/responses/Forbidden'
   */
  app.put(
    plansBaseUrl,
    auth('isSuperAdmin'),
    validate(subscriptionPlanValidation.update),
    subscriptionPlans.updateSubscriptionPlan
  );

  /**
   * @swagger
   * /user:
   *   get:
   *     tags:
   *       - User
   *     summary:
   *       - User account data
   *     description: Returns your user data
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         $ref: '#/responses/Success'
   *       401:
   *         $ref: '#/responses/Unauthorized'
   */
  app.get(userBaseUrl, auth(), userController.getUser);

  /**
   * @swagger
   * /user:
   *   put:
   *     tags:
   *       - User
   *     summary:
   *       - Update profile information and settings
   *     description: Update your user data
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: name
   *         description: User's full name
   *         in: body
   *         required: false
   *         type: string
   *     responses:
   *       200:
   *         $ref: '#/responses/Success'
   *       400:
   *         $ref: '#/responses/BadRequest'
   *       401:
   *         $ref: '#/responses/Unauthorized'
   */
  app.put(userBaseUrl, auth(), userController.updateUser);

  /**
   * @swagger
   * /user/password:
   *   put:
   *     tags:
   *       - User
   *     summary:
   *       - Change password
   *     description: Change password
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: changePassword
   *         in: body
   *         required: true
   *         schema:
   *           type: object
   *           properties:
   *             currentPassword:
   *               type: string
   *             password:
   *               type: string
   *             confirmPassword:
   *               type: string
   *     responses:
   *       204:
   *         $ref: '#/responses/NoContent'
   *       400:
   *         $ref: '#/responses/BadRequest'
   *       401:
   *         $ref: '#/responses/Unauthorized'
   */
  app.put(
    userBaseUrl + '/password',
    auth(),
    validate(authenticationValidation.changePassword),
    userController.changePassword
  );

  app.post(userBaseUrl + '/verifyEmail', userController.verifyEmail);

  /**
   * @swagger
   * /user/sessions:
   *   get:
   *     tags:
   *       - User
   *     summary:
   *       - View active sessions
   *     description: View your active sessions
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         $ref: '#/responses/Success'
   *       401:
   *         $ref: '#/responses/Unauthorized'
   */
  app.get(
    userBaseUrl + '/sessions',
    auth(),
    sessionsController.getUserSessions
  );

  /**
   * @swagger
   * /user/sessions:
   *   put:
   *     tags:
   *       - User
   *     summary:
   *       - Expire all other web sessions
   *     description: Expire all your other web sessions
   *     produces:
   *       - application/json
   *     responses:
   *       204:
   *         $ref: '#/responses/NoContent'
   *       401:
   *         $ref: '#/responses/Unauthorized'
   */
  app.put(
    userBaseUrl + '/sessions',
    auth(),
    sessionsController.forceExpireUserSessions
  );

  /**
   * @swagger
   * /user/activate:
   *   post:
   *     tags:
   *       - User
   *     summary:
   *       - Activates an account using an email code
   *     security: []
   *     description: Activates an account using an email code
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: activate
   *         in: body
   *         required: true
   *         schema:
   *           type: object
   *           properties:
   *             code:
   *               type: string
   *     responses:
   *       200:
   *         $ref: '#/responses/Success'
   *       400:
   *         $ref: '#/responses/BadRequest'
   */
  app.post(
    userBaseUrl + '/activate',
    validate(authenticationValidation.verifyEmailCode),
    userController.activateAccount
  );

  /**
   * @swagger
   * /notification/email:
   *   post:
   *     tags:
   *       - Private Services
   *     summary:
   *       - Send an email on behalf of Taskport
   *     security:
   *       - PrivateKeyAuth: []
   *     description: Send an email on behalf of Taskport. The email addresses in the 'to'
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: email
   *         in: body
   *         required: true
   *         schema:
   *           type: object
   *           properties:
   *             to:
   *               type: array
   *               items:
   *                 type: string
   *             subject:
   *               type: string
   *             message:
   *               type: string
   *     responses:
   *       200:
   *         $ref: '#/responses/Success'
   *       204:
   *         description: Success but no emails were sent (user has unsubscribed)
   *       400:
   *         $ref: '#/responses/BadRequest'
   *       401:
   *         $ref: '#/responses/Unauthorized'
   */
  app.post(
    emailBaseUrl,
    validate(emailValidation),
    authWithPrivateKey(),
    emailController.sendMail
  );

  /**
   * @swagger
   * /notification/sms:
   *   post:
   *     tags:
   *       - Private Services
   *     summary:
   *       - Send an SMS message on behalf of Taskport
   *     security:
   *       - PrivateKeyAuth: []
   *     description: Send an SMS message on behalf of Taskport
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: sms
   *         in: body
   *         required: true
   *         schema:
   *           type: object
   *           properties:
   *             id:
   *               type: string
   *               description: Id of the user
   *             message:
   *               type: string
   *     responses:
   *       204:
   *         $ref: '#/responses/NoContent'
   *       400:
   *         $ref: '#/responses/BadRequest'
   *       401:
   *         $ref: '#/responses/Unauthorized'
   *       404:
   *         description: User not found, or mobile number does not exist for user, or unsubscribed to SMS notifications
   */
  app.post(
    smsBaseUrl,
    validate(smsValidation),
    authWithPrivateKey(),
    smsController
  );

};

/**
 * @swagger
 *   responses:
 *     BadRequest:
 *       description: Bad Request
 *     Created:
 *       description: Success
 *     Forbidden:
 *       description: Forbidden
 *     NoContent:
 *       description: Success
 *     NotFound:
 *       description: Not Found
 *     Success:
 *       description: Success
 *     Unauthorized:
 *       description: Authentication key not provided or expired
 */
