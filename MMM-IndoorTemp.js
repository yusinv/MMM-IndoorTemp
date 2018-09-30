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
        interval: 150000,
        debug: false,
        showAlerts: true,
        showTitle: false,
        title: 'Indoor Temperature/Humidity',
        loadingText: 'Loading MQTT Data...',
        postText: ''
    },

    start: function () {
        Log.info('Starting module: ' + this.name);
        this.loaded = false;
        this.mqttVal = '';
        this.updateMqtt(this);
    },

    updateMqtt: function (self) {
        self.sendSocketNotification('MQTT_SERVER', {
            mqttServer: self.config.mqttServer,
            tempTopic: self.config.tempTopic,
            humidityTopic: self.config.humidityTopic
        });
        setTimeout(self.updateMqtt, self.config.interval, self);
    },

    getDom: function () {
        var wrapper = document.createElement('div');

        if (this.config.debug) {

            if (!this.loaded) {
                wrapper.innerHTML = this.config.loadingText;
                return wrapper;
            }

            var titleDiv = document.createElement('div');
            titleDiv.innerHTML = this.config.title;
            wrapper.appendChild(titleDiv);

            var mqttDiv = document.createElement('div');
            mqttDiv.innerHTML = this.mqttVal.toString().concat(this.config.postText);
            wrapper.appendChild(mqttDiv);

        }

        return wrapper;
    },

    socketNotificationReceived: function (notification, payload) {
        if (notification === 'MQTT_DATA' && payload.topic === this.config.tempTopic) {
            this.mqttVal = payload.data.toString();
            this.loaded = true;
            this.sendNotification('INDOOR_TEMPERATURE', this.mqttVal);
            if (this.config.debug) {
                this.updateDom();
            }
        }

        if (notification === 'MQTT_DATA' && payload.topic === this.config.humidityTopic) {
            this.mqttVal = payload.data.toString();
            this.loaded = true;
            this.sendNotification('INDOOR_HUMIDITY', this.mqttVal);
            if (this.config.debug) {
                this.updateDom();
            }
        }

        if (notification === 'ERROR' && this.config.showAlerts) {
            this.sendNotification('SHOW_ALERT', payload);
        }
    }

});
