module.exports.VENDOR_ID = 0x04f3;
module.exports.PRODUCT_ID = 0x0c28;

module.exports.BITMASK_BM_TRANSFER_TYPE = 0x03; // 0b00000011
module.exports.BM_TRANSFER_TYPE_CONTROL = 0x00;
module.exports.BM_TRANSFER_TYPE_ISOCHRONOUS = 0x01;
module.exports.BM_TRANSFER_TYPE_BULK = 0x02;
module.exports.BM_TRANSFER_TYPE_INTERRUPT = 0x03;

module.exports.USB_REQUEST_STATUS = 0x06;

module.exports.CMD_GET_SENSOR_DIMENSIONS = {
    CMD: [0x00, 0x0C],
    RESPONSE_SIZE: 0x04,
};

module.exports.CMD_GET_FIRMWARE_VERSION = {
    CMD: [0x40, 0x19],
    RESPONSE_SIZE: 0x02,
};

module.exports.CMD_ACTIVATE = {
    CMD: [0x40, 0x2A],
    RESPONSE_SIZE: 0x02,
};

module.exports.CMD_GET_IMAGE = {
    CMD: [0x00, 0x09],
    RESPONSE_SIZE: null,
};