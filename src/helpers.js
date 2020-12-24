const constants = require('./constants');

module.exports.parseBMAttributes = bmAttributes => {
    let transferType;

    switch (bmAttributes & constants.BITMASK_BM_TRANSFER_TYPE) {
        case constants.BM_TRANSFER_TYPE_CONTROL:
            transferType = 'Control';
            break;

        case constants.BM_TRANSFER_TYPE_ISOCHRONOUS:
            transferType = 'Isochronous';
            break;

        case constants.BM_TRANSFER_TYPE_BULK:
            transferType = 'Bulk';
            break;

        case constants.BM_TRANSFER_TYPE_INTERRUPT:
            transferType = 'Interrupt';
            break;

        default:
            transferType = 'Unknown';
    }

    return {transferType};
}

module.exports.makeBMRequest = (direction, type, recipient) => {
    let bmRequest = 0x00;

    if (direction === 'out') bmRequest += (0x00 << 0x07);
    else if (direction === 'in') bmRequest += (0x01 << 0x07);

    if (type === 'class') bmRequest += (0x01 << 0x05);
    else if (type === 'vendor') bmRequest += (0x02 << 0x05);

    if (recipient === 'interface') bmRequest += (0x01 << 0x00);
    else if (recipient === 'endpoint') bmRequest += (0x02 << 0x00);
    else if (recipient === 'other') bmRequest += (0x03 << 0x00);

    return bmRequest;
}