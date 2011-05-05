/**
 * ----------------------------------------------------------------------
 * checkout.js
 *
 * Views fuer die Checkoutseiten
 *
 * @link http://www.shopware.de
 * @author S.Pohl <stp@shopware.de>
 * ----------------------------------------------------------------------
 */
Ext.ns('App.views.Viewport', 'App.views.Shop', 'App.views.Search', 'App.views.Cart', 'App.views.Account', 'App.views.Info', 'App.views.Checkout');

App.views.Checkout.index = Ext.extend(Ext.Panel, {
	id: 'orderConfirmation',
	title: 'Bestellbest&auml;tigung',
	scroll: 'vertical',
	layout: 'card',
	initComponent: function() {
		var me = this,
			userData = App.stores.UserData.proxy.reader.rawData.sUserData,
			billing  = userData.billingaddress,
			shipping = userData.shippingaddress,
			dispatch = userData.activeDispatch;

		/* Back btn */
		this.backBtn = new Ext.Button({
			text: 'Warenkorb',
			ui: 'back',
			scope: this,
			handler: this.onBackBtn
		});

		/* Toolbar */
		this.toolbar = new Ext.Toolbar({
			title: App.Helpers.truncate(this.title, 14),
			items: [this.backBtn]
		});

		/* Cart listing */
		this.cartLabel = new Ext.Container({
			id: 'cartListLabel',
			html: '<div class="x-form-fieldset-title">Ihr Warenkorb</div>'
		});
		this.cartView = new App.views.Cart.list;
		this.cartView.tpl = App.views.Checkout.cartTpl;


		/* Payment methods fieldset */
		this.paymentField = new Ext.form.FieldSet({
			title: 'Ausgew&auml;hlte Zahlungsart',
			items: [{
				xtype: 'textfield',
				value: userData.additional.payment.description,
				name: 'paymentMeans',
				disabled: true
			}]
		});

		/* shipping type fieldset */
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

		/* General checkout form pnl */
		this.formPnl = new Ext.form.FormPanel({
			height: '100%',
			scroll: false,
			id: 'checkoutForm',
			items: [this.paymentField, this.shippingTypeField]
		});

		/* Billing address */
		this.billing = new Ext.Container({
			id: 'billingAddress',
			html: '<div class="label x-form-fieldset-title">Rechnungsadresse</div>' +
				  '<div class="inner">' +
				    '<p>' + billing.firstname + '&nbsp;' + billing.lastname + '</p>' +
					'<p>' + billing.street + '&nbsp;' + billing.streetnumber + '</p>' +
					'<p>' + billing.zipcode + '&nbsp;' + billing.city + '</p>' +
				  '</div>'
		});

		/* Shipping address */
		this.shipping = new Ext.Container({
			id: 'shippingAddress',
			html: '<div class="label x-form-fieldset-title">Lieferadresse</div>' +
				  '<div class="inner">' +
				    '<p>' + shipping.firstname + '&nbsp;' + shipping.lastname + '</p>' +
					'<p>' + shipping.street + '&nbsp;' + shipping.streetnumber + '</p>' +
					'<p>' + shipping.zipcode + '&nbsp;' + shipping.city + '</p>' +
				  '</div>'
		});

		/* Order comment */
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

		/* Voucher field */
		this.voucherField = new Ext.form.FieldSet({
			title: 'Gutschein hinzuf&uuml;gen',
			instructions: 'M&ouml;chten Sie einen Gutschein zu Ihrer Bestellung hinzuf&uuml;gen?',
			items: [{
				xtype: 'textfield',
				label: 'Gutschein',
				name: 'sVoucher'
			}]
		});

		/* Subscribe to newsletter */
		this.newsletterField = new Ext.form.FieldSet({
			id: 'newsletterFieldset',
			title: 'Newsletter abonnieren',
			instructions: 'M�chten Sie den kostenlosen ' + shopName + ' Newsletter erhalten? Sie k�nnen sich jederzeit wieder abmelden! ',
			items: [{
				xtype: 'checkboxfield',
				name: 'sNewsletter',
				label: 'Newsletter',
				checked: false,
				value: 'active'
			}]
		});

		/* AGB checkbox */
		this.agbField = new Ext.form.FieldSet({
			id: 'agbFieldset',
			title: 'AGBs akzeptieren',
			instructions: 'Bitte best&auml;tigen Sie die geltenden Allgemeinen Gesch&auml;ftsbedingungen.',
			items: [{
				xtype: 'checkboxfield',
				checked: false,
				label: 'AGBs',
				name: 'sAGB',
				required: true,
				value: 'active'
			}]
		});

		/* Submit order */
		this.submitOrderBtn = new Ext.Button({
			id: 'submitOrderBtn',
			ui: 'confirm',
			text: 'Bestellung absenden',
			scope: this,
			handler: this.onSubmitOrderBtn
		});

		/* Handles all neccessary  */
		this.orderPnl = new Ext.form.FormPanel({
			id: 'orderPnl',
			url: App.RequestURL.saveOrder,
			items: [this.voucherField, this.commentField, this.newsletterField, this.agbField, this.submitOrderBtn],
			listeners: {
				submit: function(form, response) {
					if(response.success && response.msg) {
						Ext.Msg.alert('Bestellung erfolgreich', response.msg);
					}
				},

				exception: function(form, response) {
					if(!response.success && response.msg) {
						Ext.Msg.alert('Bestellung fehlgeschlagen', response.msg);
					}
				}
			}
		});

		/* Main Pnl */
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

		/* Apply all components to main pnl */
		Ext.apply(this, {
			dockedItems: [this.toolbar],
			items: [this.pnl]
		});
		App.views.Checkout.index.superclass.initComponent.call(this);
	},

	/* onBackBtn - event handler */
	onBackBtn: function() {
		var cart = Ext.getCmp('cart');
		cart.setActiveItem(0, {
			type: 'slide',
			reverse: true,
			scope: this
		});
		cart.toolbar.show();
		cart.doComponentLayout();
	},

	/* onSubmitOrderBtn - event handler */
	onSubmitOrderBtn: function() {
		var pnl    = this.orderPnl,
			values = pnl.getValues();

		if(Ext.isEmpty(values.sAGB)) {
			Ext.Msg.alert('Fehler', 'Bitte best&auml;tigen Sie die AGBs um Ihre Bestellung durchzu&uuml;hren.');
			return false;
		}

		pnl.submit();
	}
});