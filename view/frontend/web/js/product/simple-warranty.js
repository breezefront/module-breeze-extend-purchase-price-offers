/**
 * Copied from Extend_PurchasePriceOffers/js/product/simple-warranty.js
 * to make it work on Breeze-powered storefront
 */
define([
    'jquery',
    'underscore',
    'extendWarrantyOffers'
], function ($, _, extendWarrantyOffers) {
    'use strict';

    $.widget('mage.simpleProductWarranty', {
        component: 'simpleProductWarranty',
        options: {
            isInProductView: true,
            productId: null,
            productSku: null,
            buttonEnabled: true,
            modalEnabled: false,
            blockClass: 'product-warranty-offers',
            insertionPoint: '.product-protect div',
            insertionLogic: 'append',
            formInputName: 'warranty',
            formInputClass: 'extend-warranty-input',
            selectors: {
                addToCartForm: '#product_addtocart_form',
                addToCartButton: '#product-addtocart-button'
            }
        },

        mainWrap: $(),
        warrantyBlock: $(),
        addToCartForm: $(),
        addToCartButton: $(),
        useNativeSubmit: false,

        /**
         * Product warranty offers creation
         * @protected
         */
        _create: function () {
            this._initElements();
            this._bind();

            this.warrantyBlock = this._initWarrantyOffersBlock(this.options.productId, this.options.productSku);
        },

        /**
         * Init basic elements
         * @protected
         */
        _initElements: function () {
            this.mainWrap = this.options.isInProductView ?
                this.element.parents('.column.main') :
                this.element;

            this.addToCartForm = $(this.options.selectors.addToCartForm, this.mainWrap);
            this.addToCartButton = $(this.options.selectors.addToCartButton, this.mainWrap);
        },

        /**
         * Bind events
         * @protected
         */
        _bind: function () {
            if (!this.options.buttonEnabled && !this.options.modalEnabled)
                return;

            if (this.addToCartForm && this.addToCartForm.length) {
                this.addToCartButton.on('click', this._onAddToCart.bind(this));
            }
        },

        /**
         * Inserts html-element into DOM and initialize `extendWarrantyOffers` widget
         * @protected
         * @param {String} productId - product ID
         * @param {String} productSku - product SKU
         * @return {jQuery|HTMLElement}
         */
        _initWarrantyOffersBlock: function (productId, productSku) {
            var blockID = 'warranty-offers-' + productId;

            if (this.warrantyBlock.length) {
                this.warrantyBlock.remove();
            }

            var warrantyBlock = $('<div>').attr('id', blockID).addClass(this.options.blockClass);

            var insertion = this._getWarrantyOffersInsertion(productId, productSku);
            warrantyBlock[insertion.method](insertion.element);

            warrantyBlock.extendWarrantyOffers({
                productSku: productSku,
                buttonEnabled: this.options.buttonEnabled,
                modalEnabled: this.options.modalEnabled,
                formInputName: this.options.formInputName.replace('%s', productId)
            });
            this._renderWarrantyOffers(warrantyBlock);

            $(".price-box").on('updatePrice', (event) => {
                const offerdiv = document.querySelector('.extend-product-offer').parentElement;
                const priceBox = $('.price-box').priceBox('instance');
                const finalPrice = (priceBox?.cache?.displayPrices?.finalPrice?.amount) ||
                    $('.price-box').find('[data-price-type="finalPrice"]').data('price-amount');
                const price = Math.trunc(finalPrice * 100);
                window.Extend.setActiveProduct(offerdiv, 'null');
                window.setTimeout(() => {
                    window.Extend.setActiveProduct(offerdiv, { referenceId: productSku, price: price });
                }, 500);
            });

            return warrantyBlock;
        },

        /**
         * Returns information about warranty offers block insertion
         * @protected
         * @param {String} productId - product ID
         * @param {String} productSku - product SKU
         * @return {Object} - contains `element` and `method`
         */
        _getWarrantyOffersInsertion: function (productId, productSku) {
            var method;
            switch (this.options.insertionLogic) {
                case 'before':
                    method = 'insertBefore';
                    break;
                case 'after':
                    method = 'insertAfter';
                    break;
                default:
                    method = 'appendTo';
                    break;
            }

            var elem = this.options.insertionPoint ? $(this.options.insertionPoint) : this.element;

            return {
                element: elem,
                method: method
            };
        },

        /**
         * Enables warranty offers block
         * @protected
         * @param {jQuery|HTMLElement} warrantyBlock - DOM-element connected to `extendWarrantyOffers` widget
         */
        _renderWarrantyOffers: function (warrantyBlock) {
            if (this.options.buttonEnabled) {
                warrantyBlock.extendWarrantyOffers('renderOffersButton');
            }
        },

        /**
         * Returns simple product SKU for warranty offers
         * @protected
         */
        _getWarrantyProductSku: function () {
            return this.options.productSku;
        },

        /**
         * Handles "Add To Cart" form `submit` event.
         * @protected
         * @param {Event} event - The event arguments
         * @return {Boolean}
         */
        _onAddToCart: function (event) {
            this._removeWarrantyInputs();

            if (this.useNativeSubmit || (!this.options.buttonEnabled && !this.options.modalEnabled))
                return true;

            var productSku = this._getWarrantyProductSku();

            // Product warranty offers block enabled
            if (this.options.buttonEnabled) {
                // get the warranty component instance & plan selection
                try {
                    var component = this.warrantyBlock.extendWarrantyOffers('getButtonInstance');

                    var plan = component ? component.getPlanSelection() : null;

                    if (plan) {
                        this._appendWarrantyInputs(this.warrantyBlock, productSku, plan, 'buttons');
                        this._submitAddToCartForm();

                        event.preventDefault();
                        event.stopPropagation();
                        return false;
                    }
                } catch (error) {
                    this._submitAddToCartForm();
                }
            }

            // Plan is not selected & warranty offers modal is enabled
            if (this.options.modalEnabled) {
                this._addToCartFromModal(productSku);

                event.preventDefault();
                event.stopPropagation();
                return false;
            }

            return true;
        },

        /**
         * Opens Extend Warranty modal
         * @protected
         * @param {String} productSku - currently selected product SKU
         */
        _addToCartFromModal: function (productSku) {
            this.warrantyBlock.extendWarrantyOffers('openOffersModal', productSku, function (plan) {
                this._removeWarrantyInputs();

                if (plan) {
                    this._appendWarrantyInputs(this.warrantyBlock, productSku, plan, 'modal');
                }
                this._submitAddToCartForm();
            }.bind(this));
        },

        /**
         * Appends warranty inputs to the "Add To Cart" form
         * @protected
         * @param {jQuery|HTMLElement} warrantyBlock - DOM-element connected to `extendWarrantyOffers` widget
         * @param {Object} plan - selected warranty offer plan
         * @param {String} productSku - currently selected product SKU
         * @param {String} componentName - component name for tracking (`button` or `modal`)
         */
        _appendWarrantyInputs: function (warrantyBlock, productSku, plan, componentName) {
            var inputs = warrantyBlock.extendWarrantyOffers('getWarrantyFormInputs', productSku, plan, componentName);
            _.each(inputs, function (input) {
                input.addClass(this.options.formInputClass)
            }.bind(this));
            _.each(inputs, (input) => {
                this.addToCartForm.append(input);
            });
        },

        /**
         * Removes warranty inputs from the "Add To Cart" form
         * @protected
         */
        _removeWarrantyInputs: function () {
            this.addToCartForm
                .children("input." + this.options.formInputClass)
                .remove();
        },

        /**
         * Submits "Add To Cart" form
         * @protected
         */
        _submitAddToCartForm: function () {
            this.useNativeSubmit = true;
            this.addToCartForm.trigger('submit');
            this.useNativeSubmit = false;
        }
    });

    return $.mage.simpleProductWarranty;
});

