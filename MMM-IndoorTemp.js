'use strict';
/* global Module */

/* Magic Mirror
 * Module: MMM-IndoorTemp
 *
 * By Sebastian Hodapp https://www.sebastian-hodapp.de,
 *
 * based on Javier Ayala's module MMM-mqtt http://www.javierayala.com/
 * MIT Licensed.
 */

Module.register('MMM-IndoorTemp', {

    defaults: {
        mqttServer: 'mqtt://test.mosquitto.org',
        tempTopic: '',
        humidityTopic: '',
        pressureTopic: '',
        updateInterval: 60 * 1000, //every minute
        debug: false,
        showAlerts: true,
        //showTitle: false,
        //tempTitle: 'Indoor Temperature/Humidity',
        loadingText: 'Loading MQTT Data...',
        //postTempText: 'C',
        decimalSymbol: ".",
        units: config.units,
        degreeLabel: false,
        pressureUnits: "mmHg"
    },

    // Define required scripts.
    getStyles: function () {
        return ["weather-icons.css"];
    },

    start: function () {
        Log.info('Starting module: ' + this.name);
        this.loaded = false;
        this.updateMqtt(this);
        this.scheduleUpdate(this.config.updateInterval)
    },

    updateMqtt: function (self) {
        self.sendSocketNotification('MQTT_SERVER', {
            mqttServer: self.config.mqttServer,
            tempTopic: self.config.tempTopic,
            humidityTopic: self.config.humidityTopic,
            pressureTopic: self.config.pressureTopic
        });
        setTimeout(self.updateMqtt, self.config.updateInterval, self);
    },

    getDom: function () {
        var wrapper = document.createElement('div');

        var degreeLabel = "";
        if (this.config.degreeLabel) {
            switch (this.config.units) {
                case "metric":
                    degreeLabel = "C";
                    break;
                case "imperial":
                    degreeLabel = "F";
                    break;
                case "default":
                    degreeLabel = "K";
                    break;
            }
        }


        if (!this.loaded) {
            wrapper.innerHTML = this.config.loadingText;
            return wrapper;
        }

        if (this.config.tempTopic !== '') {
            var tempDiv = document.createElement('div');
            var weatherIcon = document.createElement("span");
            weatherIcon.className = "wi wi-thermometer";
            tempDiv.appendChild(weatherIcon);
            var indoorTemperatureElem = document.createElement("span");
            //indoorTemperatureElem.className = "bright";
            indoorTemperatureElem.innerHTML = " " + this.mqttTempVal.replace(".", this.config.decimalSymbol) + "&deg;" + degreeLabel;
            tempDiv.appendChild(indoorTemperatureElem);
            wrapper.appendChild(tempDiv);
        }

        if (this.config.humidityTopic !== '') {
            var humidityDiv = document.createElement('div');
            var humidityIcon = document.createElement("span");
            humidityIcon.className = "wi wi-humidity";
            humidityDiv.appendChild(humidityIcon);
            var indoorHumidityElem = document.createElement("span");
            //indoorTemperatureElem.className = "bright";
            indoorHumidityElem.innerHTML = " " + parseFloat(this.mqttHumidityVal).toFixed(2).replace(".", this.config.decimalSymbol) + "%";
            humidityDiv.appendChild(indoorHumidityElem);
            wrapper.appendChild(humidityDiv);
        }

        if (this.config.pressureTopic !== '') {
            var pressureDiv = document.createElement('div');
            var pressureIcon = document.createElement("span");
            pressureIcon.className = "wi wi-barometer";
            pressureDiv.appendChild(pressureIcon);
            var indoorPressureElem = document.createElement("span");
            //indoorTemperatureElem.className = "bright";
            indoorPressureElem.innerHTML = " " + parseFloat(this.mqttPressureVal).toFixed(1).replace(".", this.config.decimalSymbol) + " " + this.config.pressureUnits;
            pressureDiv.appendChild(indoorPressureElem);
            wrapper.appendChild(pressureDiv);
        }

        return wrapper;
    },

    socketNotificationReceived: function (notification, payload) {
        if (notification === 'MQTT_DATA' && payload.topic === this.config.tempTopic) {
            this.mqttTempVal = payload.data.toString();
            this.loaded = true;
            //this.sendNotification('INDOOR_TEMPERATURE', this.mqttVal);
            if (this.config.debug) {
                this.updateDom();
            }
        }

        if (notification === 'MQTT_DATA' && payload.topic === this.config.humidityTopic) {
            this.mqttHumidityVal = payload.data.toString();
            this.loaded = true;
            //this.sendNotification('INDOOR_HUMIDITY', this.mqttVal);
            if (this.config.debug) {
                this.updateDom();
            }
        }

        if (notification === 'MQTT_DATA' && payload.topic === this.config.pressureTopic) {
            this.mqttPressureVal = payload.data.toString();
            this.loaded = true;
            //this.sendNotification('INDOOR_HUMIDITY', this.mqttVal);
            if (this.config.debug) {
                this.updateDom();
            }
        }

        if (notification === 'ERROR' && this.config.showAlerts) {
            this.sendNotification('SHOW_ALERT', payload);
        }
    },

    /* scheduleUpdate()
	 * Schedule next update.
	 *
	 * argument delay number - Milliseconds before next update. If empty, this.config.updateInterval is used.
	 */
    scheduleUpdate: function (delay) {
        var nextLoad = this.config.updateInterval;
        if (typeof delay !== "undefined" && delay >= 0) {
            nextLoad = delay;
        }

        var self = this;
        setInterval(function () {
            self.updateDom();
        }, nextLoad);
    }

});
