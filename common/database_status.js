var _ORIENT_STATUS = true;
var _MONGO_STATUS = true;

function getOrientStatus() {
    return _ORIENT_STATUS;
};

function setOrientStatus(status) {
    _ORIENT_STATUS = status;
};

function getMongoStatus() {
    return _MONGO_STATUS;
}

function setMongoStatus(status) {
    _MONGO_STATUS = status;
}

module.exports = {
    getOrientStatus,
    setOrientStatus,
    getMongoStatus,
    setMongoStatus
}