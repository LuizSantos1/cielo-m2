/**
 * Copyright Â© Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */

define([
        'jquery',
        'Magento_Checkout/js/view/payment/default',
        'mage/translate',
        'Az2009_Cielo/js/model/credit-card-validation/credit-card-data',
        'Az2009_Cielo/js/model/credit-card-validation/credit-card-number-validator',
        'ko'
    ],
    function ($, Component, $t, creditCardData, cardNumberValidator, ko) {
        'use strict';
        return Component.extend({
            defaults: {
                template: 'Az2009_Cielo/payment/form',
                timeoutMessage: $t('Sorry, but something went wrong. Please contact the seller.'),
                creditCardNumber: '',
                creditCardType: '',
                selectedCardType: '',
                messageValidateDoc: '',
                creditCardName: '',
                creditCardExpMonth: '',
                creditCardExpYear: '',
                creditCardCid: '',
                creditCardSave:'',
                creditCardInstallments:'1',
                isShow:''
            },

            initObservable: function () {
                this._super().observe([
                    'creditCardNumber',
                    'creditCardType',
                    'selectedCardType',
                    'messageValidateDoc',
                    'creditCardName',
                    'creditCardExpMonth',
                    'creditCardExpYear',
                    'creditCardCid',
                    'creditCardSave',
                    'creditCardInstallments',
                    'isShow'
                ]);

                return this;
            },

            initialize: function() {

                this._super();
                var self = this;
                this.iShowForm();
                this.creditCardNumber.subscribe(function (value) {
                    var result;

                    if (value.length > 16) {
                        value = value.substr(0, 16);
                        self.creditCardNumber(value);
                    }

                    self.selectedCardType(null);
                    if (value === '' || value === null) {
                        return false;
                    }

                    result = cardNumberValidator(value);
                    if (!result.isPotentiallyValid && !result.isValid) {
                        self.creditCardType(null);
                        return false;
                    }

                    if (result.card !== null) {
                        self.selectedCardType(result.card.type);
                        creditCardData.creditCard = result.card;
                    }

                    if (result.isValid) {
                        creditCardData.creditCardNumber = value;
                        self.creditCardType(result.card.type);
                    } else {
                        self.creditCardType(null);
                    }
                });

                this.creditCardSave.subscribe(function(value){
                    if (value == '') {
                        $('#az2009_cielo_cc_type_cvv_div, .brandCard').hide();
                    } else {
                        $('#az2009_cielo_cc_type_cvv_div, .brandCard').show();
                        var type = $('#cc_token option:selected').attr('data-type');
                        if (type) {
                            self.creditCardType(type);
                            self.selectedCardType(type);
                        }
                    }

                    if (value == 'new') {
                        $('.boxNewCard').show();
                    } else {
                        $('.boxNewCard').hide();
                    }
                });
            },

            getCode: function() {
                return 'az2009_cielo';
            },

            getData: function() {
                return {
                    'method': this.item.method,
                    'additional_data': {
                        'cc_type': this.creditCardType(),
                        'cc_number' : this.creditCardNumber(),
                        'cc_name' : this.creditCardName(),
                        'cc_exp_month' : this.creditCardExpMonth(),
                        'cc_exp_year' : this.creditCardExpYear(),
                        'cc_cid' : this.creditCardCid(),
                        'cc_token':this.creditCardSave(),
                        'cc_installments': this.creditCardInstallments() ? this.creditCardInstallments() : 1
                    }
                };
            },

            isShowLegend: function () {
                return true;
            },

            isAvailable: function () {
                return true;
            },

            /**
             * Get list of available credit card types values
             * @returns {Object}
             */
            getCcAvailableTypesValues: function () {
                return _.map(this.getCcAvailableTypes(), function (value, key) {
                    return {
                        'value': key,
                        'type': value
                    };
                });
            },

            /**
             * Get list of available credit card types
             * @returns {Object}
             */
            getCcAvailableTypes: function () {
                return window.checkoutConfig.payment.az2009_cielo.availableTypes;
            },

            /**
             * Get payment icons
             * @param {String} type
             * @returns {Boolean}
             */
            getIcons: function (type) {
                return window.checkoutConfig.payment.az2009_cielo.icons.hasOwnProperty(type) ?
                    window.checkoutConfig.payment.az2009_cielo.icons[type]
                    : false;
            },

            isPlaceOrderActionAllowed: function(value) {

                if (this.creditCardSave().length > 5 && this.creditCardCid().length >= 3) {
                    return true;
                }

                var validateCard = cardNumberValidator(this.creditCardNumber());

                if (validateCard.isValid
                    && this.creditCardName().length > 3
                    && this.creditCardExpMonth().length == 2
                    && this.creditCardExpYear().length == 4
                    && this.creditCardCid().length >= 3
                ) {
                    return true;
                }

                return false;
            },

            getCardSave: function()
            {
                return window.checkoutConfig.payment.az2009_cielo.cards;
            },

            getCardSaveValues: function()
            {
                return _.map(this.getCardSave(), function (value, key) {
                    return {
                        'value': key,
                        'type': value
                    };
                });
            },

            hasCardSave:function() {
                var ccsave = window.checkoutConfig.payment.az2009_cielo.cards;
                var map = _.map(ccsave, function (value, key) {
                    return {
                        'key': key,
                        'value': value
                    };
                });

                if (map.length) {
                    return true;
                }

                return false;
            },

            hasInstallments: function() {
                var installments = this.getInstallments();
                if (installments) {
                    return true;
                }

                return false;
            },

            getInstallments: function() {
                var installments = window.checkoutConfig.payment.az2009_cielo.installments;
                var values = {};
                console.log(installments);
                if (installments) {
                    values = _.map(installments, function (value, key) {
                        return {
                            'key': key,
                            'value': value
                        };
                    });
                }

                return values;
            },
            
            isLoggedIn: function () {
                return window.checkoutConfig.payment.az2009_cielo.is_logged_in;
            },

            iShowForm: function() {
                if (!this.isLoggedIn() || !this.hasCardSave()) {
                    this.isShow(true);
                    return;
                }

                this.isShow(false);
            }
        });
    });