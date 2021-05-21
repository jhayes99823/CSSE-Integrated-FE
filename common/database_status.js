var _ORIENT_STATUS = true;

function getOrientStatus() {
    return _ORIENT_STATUS;
};

function setOrientStatus(status) {
    _ORIENT_STATUS = status;
};

module.exports = {
    getOrientStatus,
    setOrientStatus
}