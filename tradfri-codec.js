/**
 * Homebridge-MQTTThing Codec (encoder/decoder) for IKEA Trådfri bulbs.
 */

 'use strict';

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
      // scale up to 0-254 range
      const rgb = message.split( ',');
      return JSON.stringify({ color: { r: rgb[0], g: rgb[1], b: rgb[2] } });
    }

    function decode_rgb( message) {
      // scale down to 0-100 range
      const msg = JSON.parse( message);
      if (msg.color) {
        const rgb = cie_to_rgb( msg.color.x, msg.color.y);
        return rgb.join( ',');
      }
    }

    /*
    Source: https://raw.githubusercontent.com/usolved/cie-rgb-converter/master/cie_rgb_converter.js
    With these functions you can convert the CIE color space to the RGB color space and vice versa.

    The developer documentation for Philips Hue provides the formulas used in the code below:
    https://developers.meethue.com/documentation/color-conversions-rgb-xy

    I've used the formulas and Objective-C example code and transfered it to JavaScript.


    Examples:

    var rgb = cie_to_rgb(0.6611, 0.2936)
    var cie = rgb_to_cie(255, 39, 60)

    ------------------------------------------------------------------------------------

    The MIT License (MIT)

    Copyright (c) 2017 www.usolved.net
    Published under https://github.com/usolved/cie-rgb-converter

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    THE SOFTWARE.
    */




    /**
     * Converts CIE color space to RGB color space
     * @param {Number} x
     * @param {Number} y
     * @param {Number} brightness - Ranges from 1 to 254
     * @return {Array} Array that contains the color values for red, green and blue
     */
    function cie_to_rgb(x, y, brightness)
    {
    	//Set to maximum brightness if no custom value was given (Not the slick ECMAScript 6 way for compatibility reasons)
    	if (brightness === undefined) {
    		brightness = 254;
    	}

    	var z = 1.0 - x - y;
    	var Y = (brightness / 254).toFixed(2);
    	var X = (Y / y) * x;
    	var Z = (Y / y) * z;

    	//Convert to RGB using Wide RGB D65 conversion
    	var red 	=  X * 1.656492 - Y * 0.354851 - Z * 0.255038;
    	var green 	= -X * 0.707196 + Y * 1.655397 + Z * 0.036152;
    	var blue 	=  X * 0.051713 - Y * 0.121364 + Z * 1.011530;

    	//If red, green or blue is larger than 1.0 set it back to the maximum of 1.0
    	if (red > blue && red > green && red > 1.0) {

    		green = green / red;
    		blue = blue / red;
    		red = 1.0;
    	}
    	else if (green > blue && green > red && green > 1.0) {

    		red = red / green;
    		blue = blue / green;
    		green = 1.0;
    	}
    	else if (blue > red && blue > green && blue > 1.0) {

    		red = red / blue;
    		green = green / blue;
    		blue = 1.0;
    	}

    	//Reverse gamma correction
    	red 	= red <= 0.0031308 ? 12.92 * red : (1.0 + 0.055) * Math.pow(red, (1.0 / 2.4)) - 0.055;
    	green 	= green <= 0.0031308 ? 12.92 * green : (1.0 + 0.055) * Math.pow(green, (1.0 / 2.4)) - 0.055;
    	blue 	= blue <= 0.0031308 ? 12.92 * blue : (1.0 + 0.055) * Math.pow(blue, (1.0 / 2.4)) - 0.055;


    	//Convert normalized decimal to decimal
    	red 	= Math.round(red * 255);
    	green 	= Math.round(green * 255);
    	blue 	= Math.round(blue * 255);

    	if (isNaN(red))
    		red = 0;

    	if (isNaN(green))
    		green = 0;

    	if (isNaN(blue))
    		blue = 0;


    	return [red, green, blue];
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
