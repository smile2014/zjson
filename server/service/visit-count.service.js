const VcModel = require('../dao/models/visitCount.model');
const UsersModel = require('../dao/models/users.model');
const fn = require('funclib');
const util = require('../tools/util');

module.exports = {
  pollingVc: pollingVc,
  refreshVc: refreshVc
}

/**
 * 轮询访问量
 * ------------------------------------------------------------
 */
function pollingVc(userId, isOnInit, callback) {
  UsersModel.getUsersById(userId, (err, docs) => {
    util.logErr(err, 'Get User Error');
    if (docs.length) {
      if (docs.length === 1) {
        _setUserExpireTime(userId);
      } else {
        UsersModel.removeUser(userId, err => {
          util.logErr(err, 'Remove User Error');
          _addLoseUser(userId);
        });
      }
    } else if (isOnInit === 'no' && /^ZJSON-[0-9A-Z]{12}$/.test(userId)) {
      _addLoseUser(userId);
    }
    VcModel.getVisitCount((err, doc) => {
      util.logErr(err, 'Get VC Error');
      callback(doc && doc.count || 0);
    });
  });
}

/**
 * 刷新访问量
 * ------------------------------------------------------------
 */
function refreshVc(userId, isExpire, callback) {
  UsersModel.getOneUserById(userId, (err, doc) => {
    util.logErr(err, 'Get User Error');
    if (doc) {
      if (isExpire === 'yes' && doc.isKeepAc) {
        VcModel.addOneVisit((err, doc) => {
          util.logErr(err, 'Add VC Error');
        });
      }
      callback(null);
    } else {
      VcModel.addOneVisit((err, doc) => {
        util.logErr(err, 'Add VC Error');
      });
      userId = 'ZJSON-' + fn.rdid();
      _addUser(userId, () => callback(userId));
    }
  });
}

function _setUserExpireTime(userId) {
  fn.timeout(userId, 20000, () => {
    UsersModel.removeUser(userId, err => {
      util.logErr(err, 'Remove User Error');
    });
  });
}

function _addLoseUser(userId) {
  UsersModel.createUser({
    'userId': userId,
    'vtTime': fn.time(),
    'isActive': true,
    'isKeepAc': true
  });
  _setUserExpireTime(userId);
}

function _addUser(userId, callback) {
  const vtTime = fn.time();
  const newUser = {
    'userId': userId,
    'vtTime': vtTime,
    'isActive': true,
    'isKeepAc': false
  };
  UsersModel.createUser(newUser, err => {
    util.logErr(err, 'Create User Error');
    callback();
  });
  _setUserExpireTime(userId);
  fn.timeout(310000, () => {
    UsersModel.updateUser(userId, err => {
      util.logErr(err, 'Update User Error');
    });
  });
}
