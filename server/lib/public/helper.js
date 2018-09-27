/*******************************************
 * Required Library
 *******************************************/
const ShaEncrypt = require('sha256');
const User = require('../models/user');
const Codes = require('../models/codes');

/**********************************************
 * Sends response to the Client
 * @param {*} res  HTTP Response object
 * @param {*} code HTTP Response Code
 * @param {*} data HTTP Response Data
 * @param {*} status HTTP/CUSTOM Response Code
 ***********************************************/
function SendResponse(res, code, data) {
    let payload = {
        code: code,
        status: true
    };

    if (code === 204) {
        return res.status(code).send();

    } else if (code >= 400) {
        payload.errors = data;
        payload.status = false;

    } else {
        payload.data = data;
    }

    res.status(code).json(payload).end();
}

/*******************************************************
 * This method checks that a user is registered or not.
 * @param {*} email String, a valid email.
 ******************************************************/
function ValidateUsername(email) {
    return new Promise((resolve, reject) => {
        User.findOne({
            email
        }, (err, user) => {
            if (!err) {
                return resolve(user);
            }
            return reject(err);
        });
    });
}

/************************************************************************
 * This method generates 6 characters code
 ***********************************************************************/
function Code() {
    let a = String.fromCharCode(Math.floor((Math.random() * 26) + 65));
    let b = String.fromCharCode(Math.floor((Math.random() * 26) + 65));
    let c = Math.floor((Math.random() * 80) + 19);
    let d = Math.floor((Math.random() * 80) + 19);
    return (a + b + c + d);
}

/************************************************************************************
 * This method validates "change password" and "activate account" codes.
 * @param {*} code 6 charcater code Like 'XA9834'
 * @param {*} codeType 'account' to activate account and 'password' to chagne passord
 ***********************************************************************************/
function validCodeQuery(code, codeType = 'account') {
    const condition = {
        $and: [
            { $or: [{ ecode: code }, { mcode: code }] },
            { codeType: codeType },
            { expiredOn: { $gte: new Date() } },
            { isUsed: false }
        ]
    };

    return Codes.findOneAndUpdate(condition, { isUsed: true }, { new: false });
}

/***********************************
 * This method creates custom error
 * @param {*} error object
 ***********************************/
function CustomError(error) {
    let err = new Error();
    err.message = error.message;
    err.code = error.code;
    return err;
}


/************************************************************************
 * This method validates user password entered to reset password.
 * and returns Promise with success or failure details.
 * @param {*} password
 * @param {*} userId
 ***********************************************************************/
function ValidatePassword(password, userId) {
    return new Promise((resolve, reject) => {
        return User.findOne({
            _id: userId
        }, 'password', (err, user) => {
            if (!err) {
                let bool = (user && user.password === ShaEncrypt(password));
                return resolve(bool);
            }
            return reject(err);
        });
    });
}

/*****************************************************************
 * This method calculates plan expire date.
 * @param {*} type string, 'year' or 'month', default is 'month',
 ****************************************************************/
function LastDate(type = 'month') {

    let numberOfDays = {
        month: 30,
        week: 7,
        year: 365
    };

    let todayDate = new Date();
    todayDate.setDate(todayDate.getDate() - numberOfDays[type]);
    let dateOfMonth = todayDate.getDate();
    let month = todayDate.getMonth();
    let year = todayDate.getFullYear();

    let dayStartDate = new Date(year, month, dateOfMonth, 0, 0, 0, 0);
    let dayEndDate = new Date(year, month, dateOfMonth, 23, 59, 59, 99);
    return { dayStartDate, dayEndDate };
}

/********************************************************************
 * This method removes an element from array based on index
 * @param {*} arr array
 *******************************************************************/
function RemoveElementFromArray(arr) {
    let what, a = arguments, L = a.length, ax;
    while (L > 1 && arr.length) {
        what = a[--L];
        while ((ax = arr.indexOf(what)) !== -1) {
            arr.splice(ax, 1);
        }
    }
    return arr;
}

/********************************************************
 * This method removed an element from array of object.
 * @param {*} arr array
 * @param {*} attr key of the object
 * @param {*} value value of the key of the object
 ********************************************************/
function RemoveElementFromArrayByAttr(arr, attr, value) {
    let i = arr.length;
    while (i--) {
        if (arr[i]
            && arr[i].hasOwnProperty(attr)
            && (arguments.length > 2 && arr[i][attr] === value)) {
            arr.splice(i, 1);
        }
    }
    return arr;
}

/**************************************************************************
 * This method add key/value to an element of array
 * @param {*} arr array
 * @param {*} condition object, condition to identify the object in array.
 * @param {*} infomationToAdd key/value pair to add
 **************************************************************************/
function AddElementToArrayByAttr(arr, condition, infomationToAdd) {
    let i = arr.length;
    while (i--) {
        if (arr[i]
            && arr[i].hasOwnProperty(condition.key)
            && (arguments.length > 2
                && arr[i][condition.key] === condition.value)) {
            arr[i][infomationToAdd.key] = infomationToAdd.value;
        }
    }
    return arr;
}


/***************************************************************
 * This method calculates last date of the current subscription
 * @param {*} type
 ***************************************************************/
function CurrentSubscriptionLastDate(type) {
    const numberOfDays = {
        monthly: 30,
        yearly: 365
    };
    let todayDate = new Date();
    todayDate.setDate(todayDate.getDate() + numberOfDays[type]);
    let dateOfMonth = todayDate.getDate();
    let month = todayDate.getMonth();
    let year = todayDate.getFullYear();
    return new Date(year, month, dateOfMonth, 23, 59, 59, 99);
}

module.exports = {
    SendResponse,
    ValidateUsername,
    Code,
    validCodeQuery,
    CustomError,
    ValidatePassword,
    LastDate,
    RemoveElementFromArray,
    RemoveElementFromArrayByAttr,
    AddElementToArrayByAttr,
    CurrentSubscriptionLastDate
};
