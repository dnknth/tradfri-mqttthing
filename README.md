# tradfri-mqttthing

An [MQTT-Thing](https://github.com/arachnetech/homebridge-mqttthing)
[codec](https://github.com/arachnetech/homebridge-mqttthing/blob/master/docs/Configuration.md#codecs)
for IKEA Trådfri light bulbs. It supports color and brightness.

The bulbs are controlled via [zigbee2mqtt](https://www.zigbee2mqtt.io) instead of an IKEA Trådfri gateway.

## Usage

Accessory section for white lightbulbs in `config.json`:

        {
            "accessory": "mqttthing",
            "type": "lightbulb",
            "name": "WhiteBulb",
            "codec": "tradfri-codec.js",
            "topics": {
                "getOn": {
                    "topic": "zigbee2mqtt/WhiteBulb"
                },
                "setOn": {
                    "topic": "zigbee2mqtt/WhiteBulb/set"
                },
                "getBrightness": {
                    "topic": "zigbee2mqtt/WhiteBulb"
                },
                "setBrightness": {
                    "topic": "zigbee2mqtt/WhiteBulb/set"
                }
            }
        }

For color-capable bulbs:

        {
            "accessory": "mqttthing",
            "type": "lightbulb",
            "name": "ColorBulb",
            "codec": "tradfri-codec.js",
            "topics": {
                "getOn": {
                    "topic": "zigbee2mqtt/ColorBulb"
                },
                "setOn": {
                    "topic": "zigbee2mqtt/ColorBulb/set"
                },
                "setRGB": {
                    "topic": "zigbee2mqtt/ColorBulb/set"
                }
            }
        },

## Acknowledgements

The color conversions are from [usolved/cie-rgb-converter](https://github.com/usolved/cie-rgb-converter). Thanks for the excellent work!
 
