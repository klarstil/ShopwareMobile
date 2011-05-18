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
	title: 'Bestellbest&auml;tigung',
	scroll: 'vertical',
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
			text: 'Warenkorb',
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
			html: '<div class="x-form-fieldset-title">Ihr Warenkorb</div>'
		});
		this.cartView = new App.views.Cart.list;
		this.cartView.tpl = App.views.Checkout.cartTpl;

		/** Contains all price related informations */
		me.orderInfo = new Ext.Container({});

		/** Payment methods fieldset */
		this.paymentField = new Ext.form.FieldSet({
			title: 'Zahlungsart ausw&auml;hlen'
		});

		/** shipping type fieldset */
		this.shippingTypeField = new Ext.form.FieldSet({
			id: 'shippingTypeField',
			title: 'Ausgew&auml;hlte Versandart',
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
			html: '<div class="label x-form-fieldset-title">Rechnungsadresse</div>' +
				  '<div class="inner">' +
				    '<p>' + billing.firstname + '&nbsp;' + billing.lastname + '</p>' +
					'<p>' + billing.street + '&nbsp;' + billing.streetnumber + '</p>' +
					'<p>' + billing.zipcode + '&nbsp;' + billing.city + '</p>' +
				  '</div>'
		});

		/** Shipping address */
		this.shipping = new Ext.Container({
			id: 'shippingAddress',
			html: '<div class="label x-form-fieldset-title">Lieferadresse</div>' +
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
						Ext.Msg.alert('Bestellung fehlgeschlagen', response.msg);
					}
				}
			}
		});

		App.Helpers.postRequest(App.RequestURL.confirm, '', function(response) {
			var totalAmount, net;
			if(response.amountWithTaxAlone && userData.additional.charge_vat) {
				totalAmount = response.amountWithTax
			} else {
				totalAmount = response.amount
			}

			if(userData.additional.charge_vat) {
				net = '<p><strong>Gesamtsumme ohne MwSt.:</strong><span>' + reponse.amountNet  + '</span></p>';
			} else {
				net = '';
			}

			me.orderInfo.update(
				'<div class="deliveryInfo">' +
					'<p><strong>Summe:</strong><span>' + response.basketAmount + '*</span></p>' +
					'<p><strong>Versandkosten:</strong><span>' + response.shippingCosts + '*</span></p>' +
					'<p><strong>Gesamtsumme:</strong><span>' + totalAmount + '&nbsp;</span></p>' +
					net +
					'</div>'
			);
			me.orderInfo.doLayout();
			me.doComponentLayout();
		});

		/** Order comment */
		if(~~useComment) {
			this.commentField = new Ext.form.FieldSet({
				id: 'commentFieldset',
				title: 'Ihr Kommentar',
				instructions: 'Bitte geben Sie hier Ihr Kommentar zu Ihrer Bestellung ein.',
				items: [{
					xtype: 'textareafield',
					name: 'sComment',
					label: 'Kommentar',
					value: ''
				}]
			});
			this.orderPnl.add(this.commentField);
		}

		/** Voucher field */
		if(~~useVoucher) {
			this.voucherField = new Ext.form.FieldSet({
				title: 'Gutschein hinzuf&uuml;gen',
				instructions: 'M&ouml;chten Sie einen Gutschein zu Ihrer Bestellung hinzuf&uuml;gen?',
				items: [{
					xtype: 'textfield',
					label: 'Gutschein',
					name: 'sVoucher'
				}]
			});
			this.orderPnl.add(this.voucherField);
		}

		/** Subscribe to newsletter */
		if(~~useNewsletter) {
			this.newsletterField = new Ext.form.FieldSet({
				id: 'newsletterFieldset',
				title: 'Newsletter abonnieren',
				instructions: 'M?chten Sie den kostenlosen ' + shopName + ' Newsletter erhalten? Sie k?nnen sich jederzeit wieder abmelden! ',
				items: [{
					xtype: 'checkboxfield',
					name: 'sNewsletter',
					label: 'Newsletter',
					checked: false,
					value: 'active'
				}]
			});
			this.orderPnl.add(this.newsletterField);
		}

		/** AGB checkbox */
		this.agbField = new Ext.form.FieldSet({
			id: 'agbFieldset',
			title: 'AGB akzeptieren',
			instructions: 'Bitte best&auml;tigen Sie die geltenden Allgemeinen Gesch&auml;ftsbedingungen.',
			items: [{
				xtype: 'checkboxfield',
				checked: false,
				label: 'AGB',
				name: 'sAGB',
				//required: true,
				value: 'active'
			}]
		});

		this.agbBtn = new Ext.Button({
			text: 'AGB anzeigen',
			ui: 'small',
			scope: this,
			style: 'margin: .6em',
			handler: this.onAGBBtn
		});


		/** Submit order */
		this.submitOrderBtn = new Ext.Button({
			id: 'submitOrderBtn',
			ui: 'confirm',
			text: 'Bestellung absenden',
			scope: this,
			handler: this.onSubmitOrderBtn
		});

		this.orderPnl.add(this.agbField);
		this.orderPnl.add(this.agbBtn);
		this.orderPnl.add(this.submitOrderBtn);

		this.starNotice = new Ext.Container({
			html: '<div class="priceNotice x-form-fieldset-instructions">* Alle Preise inkl. gesetzl. Mehrwertsteuer zzgl. Versandkosten und ggf. Nachnahmegebühren, wenn nicht anders beschrieben</div>'
		});

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
				this.submitOrderBtn,
				this.starNotice
			]
		});

		/** Apply all components to main pnl */
		Ext.apply(this, {
			dockedItems: [this.toolbar],
			items: [this.pnl]
		});
		App.views.Checkout.index.superclass.initComponent.call(this);

		App.Helpers.getRequest(App.RequestURL.getPayment, '', function(data) {
			for(idx in data.sPaymentMethods) {
				var payItem = data.sPaymentMethods[idx];
				if(App.Helpers.inArray(payItem.id, payments)) {
					paymentMethods.push(new Ext.form.Radio({
						name: 'paymentMethod',
						value: payItem.id,
						label: payItem.description,
						checked: (userData.additional.payment.id == payItem.id) ? true : false,
						listeners: {
							scope: this,
							check: me.onPayment
						}
					}));
				}
			}
			me.paymentField.add(paymentMethods);
			me.pnl.doLayout();
		});
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

	/** Event handler */
	onSubmitOrderBtn: function() {
		var pnl     = this.orderPnl,
			values  = pnl.getValues(),
			form    = this.formPnl,
			formVal = form.getValues();

		if(Ext.isEmpty(formVal.paymentMethod)) {
			Ext.Msg.alert('Fehler', 'Bitte w&auml;hlen Sie eine Zahlungsart aus um Ihre Bestellung durchzuf&uuml;hren.');
			return false;
		}

		if(Ext.isEmpty(values.sAGB)) {
			Ext.Msg.alert('Fehler', 'Bitte best&auml;tigen Sie die AGB um Ihre Bestellung durchzuf&uuml;hren.');
			return false;
		}
		pnl.submit();
	},

	/**
	 * Event handler
	 * @param chkbox
	 */
	onPayment: function(chkbox) {
		Ext.Ajax.request({
			url: App.RequestURL.changePayment,
			method: 'post',
			disableCaching: false,
			params: {
				'register[payment]': chkbox.getValue()
			}
		});
	}
});