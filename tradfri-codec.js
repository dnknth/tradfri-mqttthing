/**
 * Homebridge-MQTTThing Codec (encoder/decoder) for IKEA Trådfri bulbs.
 */

'use strict';

const conv = require( './cie-rgb-converter.js');
 
/**
 * Initialise codec for accessory
 * @param {object} params Initialisation parameters object
 * @param {function} params.log Logging function
 * @param {object} params.config Configuration
 * @return {object} Encode and/or decode functions
 */
function init( params) {
    // extract parameters for convenience
    let { log, config } = params;
    log( `Trådfri codec initialized with ${config.name}.`);

    /**
     * Encode message before sending.
     * The output function may be called to deliver an encoded value for the property later.
     * @param {string} message Message from mqttthing to be published to MQTT
     * @param {object} info Object giving contextual information
     * @param {string} info.topic MQTT topic to be published
     * @param {string} info.property Property associated with publishing operation
     * @param {function} output Function which may be called to deliver the encoded value asynchronously
     * @returns {string} Processed message (optionally)
     */
    function encode( message, info, output) {
        log( `encode() called for topic [${info.topic}], property [${info.property}] with message [${message}]`);

        output( message);
    }

    /**
     * Decode received message, and optionally return decoded value.
     * The output function may be called to deliver a decoded value for the property later.
     * @param {string} message Message received from MQTT
     * @param {object} info Object giving contextual information
     * @param {string} info.topic MQTT topic received
     * @param {string} info.property Property associated with subscription
     * @param {function} output Function which may be called to deliver the decoded value asynchronously
     * @returns {string} Processed message (optionally)
     */
    function decode( message, info, output) { // eslint-disable-line no-unused-vars
        log( `decode() called for topic [${info.topic}], property [${info.property}] with message [${message}]`);

        output( message);
    }

    function encode_on( message) {
      return JSON.stringify({ state: message ? 'ON' :'OFF' });
    }

    function decode_on( message) {
      const msg = JSON.parse( message);
      if (msg.state) {
        return msg.state == 'ON';
      }
    }

    function encode_brightness( message) {
      // scale up to 0-254 range
      return JSON.stringify({ brightness: Math.round( message * 2.54) });
    }

    function decode_brightness( message) {
      // scale down to 0-100 range
      const msg = JSON.parse( message);
      if (msg.brightness) {
        return Math.round( msg.brightness / 2.54);
      }
    }

    function encode_rgb( message) {
      const rgb = message.split( ','),
            // http://www.w3.org/TR/AERT#color-contrast
            brightness = Math.round( 0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]);
      return JSON.stringify({
        color: { r: +rgb[0], g: +rgb[1], b: +rgb[2] },
        brightness: brightness
      });
    }

    function decode_rgb( message) {
      const msg = JSON.parse( message);
      if (msg.color) {
        const rgb = conv.cie_to_rgb( msg.color.x, msg.color.y, msg.brightness);
        return rgb.join( ',');
      }
    }

            
    /**
     * The init() function must return an object containing encode and/or decode functions as defined above.
     * To define property-specific encode/decode functions, the following syntax may be used:
     *  {
     *      properties: {
     *          targetProp1: {
     *              encode: encodeFunction1,
     *              decode: decodeFunction2
     *          },
     *          targetProp2: {
     *              encode: encodeFunction2
     *          },
     *      },
     *      encode: defaultEncodeFunction,
     *      decode: defaultDecodeFunction
     *  }
     * 
     * The default encode/decode functions are called for properties for which no property-specific
     * entry is specified.
     */
    
    // return encode and decode functions
    return { 
        encode, decode, // default encode/decode functions
        properties: {
          on: { // encode/decode functions for on / off
            encode: encode_on,
            decode: decode_on
          },
          brightness: { // encode/decode functions for brightness
            encode: encode_brightness,
            decode: decode_brightness
          },
          RGB: { // encode/decode functions for color
            encode: encode_rgb,
            decode: decode_rgb
          }
        }
    };
}

// export initialisation function
module.exports = {
    init
};
