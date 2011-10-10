<script type="text/javascript">
/**
 * @file checkout.js
 * @link http://www.shopware.de
 * @author S.Pohl <stp@shopware.de>
 * @date 11-05-11
 */
Ext.ns('App.views.Viewport', 'App.views.Shop', 'App.views.Search', 'App.views.Cart', 'App.views.Account', 'App.views.Info', 'App.views.Checkout');

/**
 * Main checkout view
 *
 * Contains all necessary checkout components
 *
 * @access public
 * @class
 * @extends Ext.Panel
 */
App.views.Checkout.index = Ext.extend(Ext.Panel,
/** @lends App.views.Checkout.index# */
{
	id: 'orderConfirmation',
	title: '{s name="MobileCheckoutTitle"}Bestellbest&auml;tigung{/s}',
	scroll: false,
	layout: 'card',

	initComponent: function() {
		var me = this,
			userData = App.stores.UserData.proxy.reader.rawData.sUserData,
			billing  = userData.billingaddress,
			shipping = userData.shippingaddress,
			dispatch = userData.activeDispatch,
			paymentMethods = [];

		/** Back button */
		this.backBtn = new Ext.Button({
			text: 'Waren...',
			ui: 'back',
			scope: this,
			handler: this.onBackBtn
		});

		/** Toolbar */
		this.toolbar = new Ext.Toolbar({
			title: App.Helpers.truncate(this.title, 14),
			items: [this.backBtn]
		});

		/** Cart listing */
		this.cartLabel = new Ext.Container({
			id: 'cartListLabel',
			html: '<div class="x-form-fieldset-title">{s name="MobileCheckoutCartTitle"}Ihr Warenkorb{/s}</div>'
		});
		this.cartView = new App.views.Cart.list;
		this.cartView.scroll = false;
		this.cartView.tpl = Ext.XTemplate.from('CheckoutcartTpl');

		/** Contains all price related informations */
		me.orderInfo = new Ext.Container({ scroll: false });

		/** Payment methods fieldset */
		this.paymentField = new Ext.form.FieldSet({
			title: '{s name="MobileCheckoutSelectPaymentTitle"}Zahlungsart ausw&auml;hlen{/s}',
			scroll: false
		});

		/** shipping type fieldset */
		this.shippingTypeField = new Ext.form.FieldSet({
			id: 'shippingTypeField',
			scroll: false,
			title: '{s name="MobileCheckoutSelectedDispatch"}Ausgew&auml;hlte Versandart{/s}',
			items: [{
				xtype: 'textfield',
				value: dispatch.name,
				checked: true,
				name: 'defaultDispatch',
				disabled: true
			}]
		});

		/** General checkout form pnl */
		this.formPnl = new Ext.form.FormPanel({
			height: '100%',
			scroll: false,
			id: 'checkoutForm',
			items: [this.orderInfo, this.paymentField, this.shippingTypeField]
		});

		/** Billing address */
		this.billing = new Ext.Container({
			id: 'billingAddress',
			scroll: false,
			html: '<div class="label x-form-fieldset-title">{s name="MobileCheckoutBillingAddressTitle"}Rechnungsadresse{/s}</div>' +
				  '<div class="inner">' +
				    '<p>' + billing.firstname + '&nbsp;' + billing.lastname + '</p>' +
					'<p>' + billing.street + '&nbsp;' + billing.streetnumber + '</p>' +
					'<p>' + billing.zipcode + '&nbsp;' + billing.city + '</p>' +
				  '</div>'
		});

		/** Shipping address */
		this.shipping = new Ext.Container({
			id: 'shippingAddress',
			scroll: false,
			html: '<div class="label x-form-fieldset-title">{s name="MobileCheckoutShippingAddressTitle"}Lieferadresse{/s}</div>' +
				  '<div class="inner">' +
				    '<p>' + shipping.firstname + '&nbsp;' + shipping.lastname + '</p>' +
					'<p>' + shipping.street + '&nbsp;' + shipping.streetnumber + '</p>' +
					'<p>' + shipping.zipcode + '&nbsp;' + shipping.city + '</p>' +
				  '</div>'
		});

		/** Handles all neccessary order informations */
		this.orderPnl = new Ext.form.FormPanel({
			id: 'orderPnl',
			url: App.RequestURL.saveOrder,
			scroll: false,
			listeners: {
				submit: function(form, response) {
					if(response.success && response.msg) {
						Ext.Msg.alert('Bestellung erfolgreich', response.msg, function() {
							var owner = me.ownerCt;

							/* Clear cart store */
							App.stores.Cart.removeAll();

							/* Destroy Order confirmation */
							me.destroy();

							/* Create new cart list on owner */
							owner.pnl.update('');
							owner.pnl.show();
							owner.toolbar.show();
							owner.doLayout();

							/* Hide checkout button */
							owner.checkoutBtn.hide();

							/* Slide to home view */
							Ext.getCmp('viewport').setActiveItem(0, {
								type: 'slide',
								reverse: true,
								scope: this
							});

							/* Refresh main view */
							Ext.getCmp('shop').toolBar.hide();
							Ext.getCmp('shop').doLayout();
							Ext.getCmp('shop').doComponentLayout();
							Ext.getCmp('shop').setActiveItem(Ext.getCmp('home'));
						});
					}
				},

				exception: function(form, response) {
					if(!response.success && response.msg) {
						Ext.Msg.alert('{s name="MobileCheckoutOrderFailedTitle"}Bestellung fehlgeschlagen{/s}', response.msg);
					}
				}
			}
		});

		/** Calculate delivery costs, total sum ... */
		App.Helpers.postRequest(App.RequestURL.confirm, '', function(response) {
			var totalAmount, net;
			if(response.amountWithTaxAlone && userData.additional.charge_vat) {
				totalAmount = response.amountWithTax
			} else {
				totalAmount = response.amount
			}

			if(userData.additional.charge_vat) {
				net = '<p class="grey"><strong>{s name="MobileCheckoutAmountWithoutTax"}Gesamtsumme ohne MwSt.:{/s}</strong><span>' + response.amountNet  + '&nbsp;</span></p>';
				for(idx in response.taxRates) {
					net += '<p class="grey"><strong>zzgl. '+ idx +'&nbsp;% MwSt.:</strong><span>'+ App.Helpers.number_format(response.taxRates[idx], 2, ',', '.') +'&nbsp;&euro;&nbsp;</span></p>'
				}
			} else {
				net = '';
			}

			me.orderInfo.update(
				'<div class="deliveryInfo">' +
					'<p class="grey"><strong>{s name="MobileCheckoutSum"}Summe:{/s}</strong><span>' + response.basketAmount + '*</span></p>' +
					'<p class="doubleborder grey"><strong>{s name="MobileCheckoutShippingCosts"}Versandkosten:{/s}</strong><span>' + response.shippingCosts + '*</span></p>' +
					'<p class="totalSum"><strong>{s name="MobileCheckoutTotalSum"}Gesamtsumme:{/s}</strong><span>' + totalAmount + '&nbsp;</span></p>' +
					net +
					'</div>' +
					'<div class="priceNotice x-form-fieldset-instructions">{s name="MobileCheckoutPriceNotice"}* Alle Preise inkl. gesetzl. Mehrwertsteuer zzgl. Versandkosten und ggf. Nachnahmegebühren, wenn nicht anders beschrieben{/s}</div>'
			);
			me.orderInfo.doLayout();
			me.doComponentLayout();
		});

		/** Order comment */
		if(~~useComment) {
			this.commentField = new Ext.form.FieldSet({
				id: 'commentFieldset',
				title: '{s name="MobileCheckoutYourCommentTitle"}Ihr Kommentar{/s}',
				instructions: '{s name="MobileCheckoutYourCommentInstruction"}Bitte geben Sie hier Ihr Kommentar zu Ihrer Bestellung ein.{/s}',
				items: [{
					xtype: 'textareafield',
					name: 'sComment',
					label: '{s name="MobileCheckoutYourCommentLabel"}Kommentar{/s}',
					value: ''
				}]
			});
			this.orderPnl.add(this.commentField);
		}

		/** Voucher field */
		if(~~useVoucher) {
			this.voucherField = new Ext.form.FieldSet({
				title: '{s name="MobileCheckoutVoucherTitle"}Gutschein hinzuf&uuml;gen{/s}',
				instructions: '{s name="MobileCheckoutVoucherInstruction"}M&ouml;chten Sie einen Gutschein zu Ihrer Bestellung hinzuf&uuml;gen?{/s}',
				items: [{
					xtype: 'textfield',
					label: '{s name="MobileCheckoutVoucherLabel"}Gutschein{/s}',
					name: 'sVoucher'
				}]
			});
			this.orderPnl.add(this.voucherField);
		}

		/** Subscribe to newsletter */
		if(~~useNewsletter) {
			this.newsletterField = new Ext.form.FieldSet({
				id: 'newsletterFieldset',
				title: '{s name="MobileCheckoutNewsletterTitle"}Newsletter abonnieren{/s}',
				instructions: '{s name="MobileCheckoutNewsletterInstruction"}M&ouml;chten Sie den kostenlosen ' + shopName + ' Newsletter erhalten? Sie k?nnen sich jederzeit wieder abmelden!{/s}',
				items: [{
					xtype: 'checkboxfield',
					name: 'sNewsletter',
					label: '{s name="MobileCheckoutNewsletterLabel"}Newsletter{/s}',
					checked: false,
					value: 'active'
				}]
			});
			this.orderPnl.add(this.newsletterField);
		}

		/** AGB checkbox */
		this.agbField = new Ext.form.FieldSet({
			id: 'agbFieldset',
			title: '{s name="MobileCheckoutAGBTitle"}AGB akzeptieren{/s}',
			instructions: '{s name="MobileCheckoutAGBInstruction"}Bitte best&auml;tigen Sie die geltenden Allgemeinen Gesch&auml;ftsbedingungen.{/s}',
			items: [{
				xtype: 'checkboxfield',
				checked: false,
				label: '{s name="MobileCheckoutAGBLabel"}AGB{/s}',
				name: 'sAGB',
				value: 'active'
			}]
		});

		/** AGB button */
		this.agbBtn = new Ext.Button({
			text: '{s name="MobileCheckoutAGBButton"}AGB anzeigen{/s}',
			ui: 'small',
			scope: this,
			height: '1.8em',
			style: 'padding: 0.5em 0.4em;margin-left: 2%;display: inline-block;width:44%; border-top-right-radius: 0px; border-bottom-right-radius: 0px;border-right: 0px;',
			handler: this.onAGBBtn
		});

		/** Right of revocation button */
		this.cancellationRightBtn = new Ext.Button({
			text: '{s name="MobileCheckoutRightOfRevocationButton"}Widerrufsrecht anzeigen{/s}',
			ui: 'small',
			scope: this,
			height: '1.8em',
			style: 'padding: 0.5em 0.4em;margin-right: 2%;display: inline-block;width:52%;border-top-left-radius: 0px; border-bottom-left-radius: 0px; text-overflow: none;',
			handler: this.onCancellationRightBtn
		});

		/** Submit order */
		this.submitOrderBtn = new Ext.Button({
			id: 'submitOrderBtn',
			ui: 'confirm',
			text: '{s name="MobileCheckoutSubmitOrderButton"}Bestellung absenden{/s}',
			scope: this,
			handler: this.onSubmitOrderBtn
		});

		/** Add components */
		this.orderPnl.add(this.agbField);
		this.orderPnl.add(this.agbBtn);
		this.orderPnl.add(this.cancellationRightBtn);
		this.orderPnl.add(this.submitOrderBtn);

		/** Main Pnl */
		this.pnl = new Ext.Panel({
			scroll: 'vertical',
			items: [
				this.cartLabel,
				this.cartView,
				this.formPnl,
				this.billing,
				this.shipping,
				this.orderPnl,
				this.submitOrderBtn
			]
		});

		/** Apply all components to main pnl */
		Ext.apply(this, {
			dockedItems: [this.toolbar],
			items: [this.pnl]
		});
		App.views.Checkout.index.superclass.initComponent.call(this);
	},

	/** Event handler */
	onBackBtn: function() {
		var cart = Ext.getCmp('cart');
		cart.setActiveItem(0, {
			type: 'slide',
			reverse: true,
			scope: this
		});

		cart.toolbar.show();
		cart.doComponentLayout();
		this.destroy();
	},

	/** Event handler */
	onAGBBtn: function() {
		var me = this;
		App.Helpers.getRequest(App.RequestURL.customSite, {
			sCustom: ~~agbID
		}, function(response) {
			var view = new Ext.Panel({
				scroll: 'vertical',
				listeners: {
					scope: this,
					deactivate: function(me) {
						me.destroy();
					}
				},
				dockedItems: [{
					xtype: 'toolbar',
					title: 'AGB',
					items: [{
						xtype: 'button',
						ui: 'back',
						text: 'Zur&uuml;ck',
						scope: this,
						handler: function() {
							var active = me.getActiveItem();

							me.toolbar.show();
							me.doComponentLayout();
							me.setActiveItem(active-1, {
								type: 'slide',
								reverse: true,
								scope: this
							});
						}
					}]
				}],
				items: [{
					cls: 'agbBox',
					height: '100%',
					scroll: false,
					html: response
				}]
			});
			me.add(view);
			me.toolbar.hide();
			me.doComponentLayout();
			me.setActiveItem(view, 'slide');
		})
	},

	onCancellationRightBtn: function() {
		var me = this;
		App.Helpers.getRequest(App.RequestURL.customSite, {
			sCustom: ~~cancellationID
		}, function(response) {
			var view = new Ext.Panel({
				scroll: 'vertical',
				listeners: {
					scope: this,
					deactivate: function(me) {
						me.destroy();
					}
				},
				dockedItems: [{
					xtype: 'toolbar',
					title: 'Widerruf...',
					items: [{
						xtype: 'button',
						ui: 'back',
						text: 'Zur&uuml;ck',
						scope: this,
						handler: function() {
							var active = me.getActiveItem();

							me.toolbar.show();
							me.doComponentLayout();
							me.setActiveItem(active-1, {
								type: 'slide',
								reverse: true,
								scope: this
							});
						}
					}]
				}],
				items: [{
					cls: 'agbBox',
					height: '100%',
					scroll: false,
					html: response
				}]
			});
			me.add(view);
			me.toolbar.hide();
			me.doComponentLayout();
			me.setActiveItem(view, 'slide');
		})
	},

	/** Event handler */
	onSubmitOrderBtn: function() {
		var pnl     = this.orderPnl,
			values  = pnl.getValues(),
			form    = this.formPnl,
			formVal = form.getValues();

		if(Ext.isEmpty(formVal.paymentMethod)) {
			Ext.Msg.alert('{s name="MobileCheckoutError"}Fehler{/s}', '{s name="MobileCheckoutEmptyPaymentMethod"}Bitte w&auml;hlen Sie eine Zahlungsart aus um Ihre Bestellung durchzuf&uuml;hren.{/s}');
			return false;
		}

		if(Ext.isEmpty(values.sAGB)) {
			Ext.Msg.alert('{s name="MobileCheckoutError"}Fehler{/s}', '{s name="MobileCheckoutEmptyAGB"}Bitte best&auml;tigen Sie die AGB um Ihre Bestellung durchzuf&uuml;hren.{/s}');
			return false;
		}
		pnl.submit();
	}
});
</script>