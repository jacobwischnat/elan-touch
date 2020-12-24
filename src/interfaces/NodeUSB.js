const usb = require('usb');
const helpers = require('../helpers');

module.exports = class NodeUSB {
    constructor() {
        this.device = null;
    }

    open(vendorId, productId) {
        const devices = usb.getDeviceList();
        this.device = devices.find(({deviceDescriptor: {idVendor, idProduct}}) => idVendor === vendorId && idProduct === productId);

        if (this.device) {
            this.device.open();
        }

        return Promise.resolve();
    }

    claimInterface(interfaceNumber) {
        this.interface = this.device.interfaces.find(iface => iface.id === interfaceNumber);
        this.interface.claim();

        return Promise.resolve();
    }

    interfaces() {
        return Promise.resolve(
            this.device.interfaces.map(interfce => {
                interfce.endpoints.map(endpoint => {
                    endpoint.type = helpers.parseBMAttributes(endpoint.descriptor.bmAttributes);
                    endpoint.direction = endpoint.descriptor.bEndpointAddress & 0x80 ? 'in' : 'out';

                    return endpoint;
                });

                return interfce;
            }));
    }

    bulkTransfer(interfaceNumber, endpointNumber, direction, bufferOrLength) {
        return new Promise((resolve, reject) => {
            const interface_ = this.device.interfaces.find(iface => iface.id === interfaceNumber);
            const endpoint = interface_.endpoints.find(endp => endp.address === endpointNumber && endp.direction === direction);
            endpoint.transfer(bufferOrLength, (error, data) => {
                if (error) return reject(error);

                resolve(data);
            });
        });
    }
}