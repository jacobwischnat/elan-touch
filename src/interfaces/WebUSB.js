import {Buffer} from 'buffer/';

export default class WebUSB {
    constructor() {
        this.device = null;
    }

    async open(vendorId, productId) {
        this.device = await navigator.usb.requestDevice({filters: [{vendorId, productId}]});

        if (this.device) {
            await this.device.open();
        }
    }

    async claimInterface(interfaceNumber) {
        await this.device.claimInterface(interfaceNumber);
    }

    interfaces() {
        return Promise.resolve([]);
    }

    async bulkTransfer(_, endpointNumber, direction, bufferOrLength) {
        const result = direction === 'in'
            ? await this.device.transferIn(endpointNumber, bufferOrLength)
            : await this.device.transferOut(endpointNumber, bufferOrLength.buffer);

        if (direction === 'in') return Buffer.from(result.data.buffer);
    }
}