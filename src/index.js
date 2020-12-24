import WebUSB from './interfaces/WebUSB';
import * as constants from './constants';

import {Buffer} from 'buffer/';

class ELANTouch {
    constructor(vendorId, productId) {
        this.vendorId = vendorId;
        this.productId = productId;

        this.usb = new WebUSB();

        this.iface = 0;
        this.inEndpoint = 3;
        this.inImgEndpoint = 2;
        this.outEndpoint = 1;
    }

    async open() {
        await this.usb.open(this.vendorId, this.productId);
        await this.usb.claimInterface(this.iface);
    }

    async getSensorDimensions() {
        const cmdData = Buffer.from(constants.CMD_GET_SENSOR_DIMENSIONS.CMD);
        await this.usb.bulkTransfer(
            this.iface,
            this.outEndpoint,
            'out',
            cmdData
        );
        const responseData = await this.usb.bulkTransfer(
            this.iface,
            this.inEndpoint,
            'in',
            constants.CMD_GET_SENSOR_DIMENSIONS.RESPONSE_SIZE
        );

        const width = responseData.readUInt16LE(0);
        const height = responseData.readUInt16LE(2);

        return {width, height};
    }

    async getFirmwareVersion() {
        const cmdData = Buffer.from(constants.CMD_GET_FIRMWARE_VERSION.CMD);
        await this.usb.bulkTransfer(
            this.iface,
            this.outEndpoint,
            'out',
            cmdData
        );
        const responseData = await this.usb.bulkTransfer(
            this.iface,
            this.inEndpoint,
            'in',
            constants.CMD_GET_FIRMWARE_VERSION.RESPONSE_SIZE
        );

        return responseData.toString('hex');
    }

    async activate() {
        const cmdData = Buffer.from(constants.CMD_ACTIVATE.CMD);
        await this.usb.bulkTransfer(
            this.iface.id,
            this.outEndpoint,
            'out',
            cmdData
        );
        const responseData = await this.usb.bulkTransfer(
            this.iface.id,
            this.inEndpoint,
            'in',
            constants.CMD_ACTIVATE.RESPONSE_SIZE
        );

        return responseData.toString('hex');
    }

    async getImage() {
        const {width, height} = await this.getSensorDimensions();
        const frameSize = width * height * 2;
        const cmdData = Buffer.from(constants.CMD_GET_IMAGE.CMD);
        await this.usb.bulkTransfer(
            this.iface,
            this.outEndpoint,
            'out',
            cmdData
        );
        const responseData = await this.usb.bulkTransfer(
            this.iface,
            this.inImgEndpoint,
            'in',
            frameSize,
        );


        let sorted = [];
        for (let i = 0; i < responseData.length; i += 1) {
            sorted.push(responseData.readUInt8(i));
        }

        sorted = sorted.sort((a, b) => a - b);

        const lvl0 = sorted[0];
        const lvl1 = sorted[parseInt(frameSize * 3 / 10)];
        const lvl2 = sorted[parseInt(frameSize * 65 / 100)];
        const lvl3 = sorted[parseInt(frameSize - 1)];


        const pixels = [];
        let px;
        for (let i = 0; i < frameSize; i += 1) {
            px = responseData.readUInt8(i);
            if (lvl0 <= px && px < lvl1) {
                px = (px - lvl0) * 99 / (lvl1 - lvl0);
            } else if (lvl1 <= px && px < lvl2) {
                px = 99 + ((px - lvl1) * 56 / (lvl2 - lvl1));
            } else	{
                px = 155 + ((px - lvl2) * 100 / (lvl3 - lvl2));
            }

            pixels.push(px);
        }

        return pixels;
    }
}

const message = document.querySelector('h1');
const canvas = document.querySelector('canvas');
const button = document.querySelector('button');

const init = async () => {
    message.textContent = 'Keep finger off sensor';
    const elan = new ELANTouch(
        constants.VENDOR_ID,
        constants.PRODUCT_ID,
    );
    await elan.open();
    const dimensions = await elan.getSensorDimensions();

    const firmwareVersion = await elan.getFirmwareVersion();
    const activate = await elan.activate();

    const imgBackground = await elan.getImage();

    message.textContent = 'Place finger on sensor';
    const finga = async () => {
        const img = await elan.getImage();

        const WIDTH = dimensions.width;
        const HEIGHT = dimensions.height * 2;

        canvas.width = WIDTH;
        canvas.height = HEIGHT;

        const context = canvas.getContext('2d');

        const x = img
            .map((v, i) => v - imgBackground[i])
            .flatMap(b => b >= 0 ? [0xFF, 0xFF, 0xFF, 0xFF] : [0x00, 0x00, 0x00, 0xFF]);
        const imageData = new ImageData(
            new Uint8ClampedArray(x),
            WIDTH,
            HEIGHT
        );

        context.putImageData(imageData, 0, 0);

        window.requestAnimationFrame(finga.bind(this));
    }

    window.requestAnimationFrame(finga.bind(this));
};

button.onclick = () => init();