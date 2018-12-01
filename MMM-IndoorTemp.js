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
        updateInterval: 60 * 1000, //every minute
        debug: false,
        loadingText: 'Loading Data...',
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
        this.tempLoaded = false;
        this.humLoaded = false;
        this.pressedLoaded = false;
        this.scheduleUpdate(this.config.updateInterval)
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


        if (!this.tempLoaded && !this.humLoaded && !this.pressedLoaded) {
            wrapper.innerHTML = this.config.loadingText;
            return wrapper;
        }

        if (this.tempLoaded) {
            var tempDiv = document.createElement('div');
            var weatherIcon = document.createElement("span");
            weatherIcon.className = "wi wi-thermometer";
            tempDiv.appendChild(weatherIcon);
            var indoorTemperatureElem = document.createElement("span");
            //indoorTemperatureElem.className = "bright";
            indoorTemperatureElem.innerHTML = " " + this.tempVal.replace(".", this.config.decimalSymbol) + "&deg;" + degreeLabel;
            tempDiv.appendChild(indoorTemperatureElem);
            wrapper.appendChild(tempDiv);
        }

        if (this.humLoaded) {
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

        if (this.pressedLoaded) {
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

    notificationReceived: function (notification, payload, sender) {
        if (notification == 'MMM_INDOOR_TEMP') {
            this.tempVal = payload.toString();
            this.tempLoaded = true;
            //this.sendNotification('INDOOR_TEMPERATURE', this.mqttVal);
            if (this.config.debug) {
                this.updateDom();
            }
        }

        if (notification == 'MMM_INDOOR_HUMIDITY') {
            this.mqttHumidityVal = payload.toString();
            this.humLoaded = true;
            //this.sendNotification('INDOOR_HUMIDITY', this.mqttVal);
            if (this.config.debug) {
                this.updateDom();
            }
        }

        if (notification == 'MMM_INDOOR_PRESSURE') {
            this.mqttPressureVal = payload.toString();
            this.pressedLoaded = true;
            //this.sendNotification('INDOOR_HUMIDITY', this.mqttVal);
            if (this.config.debug) {
                this.updateDom();
            }
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
