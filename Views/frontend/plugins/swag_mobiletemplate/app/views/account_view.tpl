<script type="text/javascript">
/**
 * @file account.js
 * @link http://www.shopware.de
 * @author S.Pohl <stp@shopware.de>
 * @date 11-05-11
 */
Ext.ns('App.views.Viewport', 'App.views.Shop', 'App.views.Search', 'App.views.Cart', 'App.views.Account', 'App.views.Info', 'App.views.Checkout');

/**
 * Main account view
 *
 * Contains the customer center
 *
 * @access public
 * @class
 * @extends Ext.Panel
 */
App.views.Account.index = Ext.extend(Ext.Panel,
/** @lends App.views.Account.index# */
{
	cls: 'account',
	title: 'Kundenkonto',
	iconCls: 'user',
	layout: 'card',
	scroll: false,

	listeners: {
		scope: this,
		activate: function(me) {
			if(Ext.getCmp('accountCenter')) {
				Ext.getCmp('accountCenter').show();
				me.doComponentLayout();
				me.doLayout();
			}
		}
	},

	initComponent: function() {
		/** Back btn */
		this.backBtn = new Ext.Button({
			text: this.title,
			scope: this,
			hidden: true,
			ui: 'back',
			handler:  this.onBackBtn
		});

		/** Toolbar */
		this.toolbar = new Ext.Toolbar({
			dock: 'top',
			title: this.title,
			items: [this.backBtn, { xtype: 'spacer' }]
		});

		/** Logout btn */
		this.logoutBtn = new Ext.Button({
			id: 'logoutBtn',
			ui: 'action',
			scope: this,
			text: 'Logout',
			hidden: (~~isUserLoggedIn) ? false : true,
			handler: function() {
				var me = this;
				Ext.dispatch({
					controller: 'account',
					action: 'logout',
					view: this
				});

				return true;
			}
		});

		/** Login fieldset */
		this.existingPnl = new Ext.Container({
			id: 'existing',
			cls: 'x-form-fieldset',
			hidden: (~~isUserLoggedIn) ? true : false,
			listeners: {
				scope: this,
				tap: {
					element: 'el',
					fn: function() {
						Ext.dispatch({
							controller: 'account',
							action: 'showLogin',
							parentView: this
						});
					}
				}
			},
			html: '<div class="label x-form-fieldset-title">{s name="MobileAccountExistingCustomer"}Bestehender Kunde{/s}</div>' +
					'<div id="inner-existing" class="inner x-panel-body">' +
						'<strong>{s name="MobileAccountLoginText"}Login{/s}</strong>' +
						'<p>{s name="MobileAccountLoginInfoText"}Sie sind bereits Kunde? Dann loggen Sie sich jetzt mit Ihrer E-Mail-Adresse und Ihrem Passwort ein.{/s}</p>' +
					'</div>'
		});

		/** Register fieldset */
		this.newPnl = new Ext.Container({
			id: 'new',
			cls: 'x-form-fieldset',
			hidden: (~~isUserLoggedIn) ? true : false,
			listeners: {
				scope: this,
				tap: {
					element: 'el',
					fn: function() {
						Ext.dispatch({
							controller: 'account',
							action: 'showRegister',
							parentView: this
						});
					}
				}
			},
			html: '<div class="label x-form-fieldset-title">{s name="MobileAccountNewCustomer"}Neuer Kunde{/s}</div>' +
					'<div id="inner-new" class="inner x-panel-body">' +
						'<strong>{s name="MobileAccountRegisterText"}Registrierung{/s}</strong>' +
						'<p>{s name="MobileAccountRegisterInfoText"}Kein Problem, eine Shopbestellung ist einfach und sicher. Die Anmeldung dauert nur wenige Augenblicke.{/s}</p>' +
					'</div>'
		});

		/** Main panel holds all views */
		this.mainPnl = new Ext.Container({
			cls: 'startup',
			height: '100%',
			scroll: 'vertical',
			hidden: (!App.Helpers.isUserLoggedIn()) ? true : false,
			items: [this.newPnl, this.existingPnl]
		});

		Ext.apply(this, {
			dockedItems: [this.toolbar],
			items: [this.mainPnl]
		});

		/** Add logout btn if the user is logged in */
		if(~~isUserLoggedIn) {
			this.toolbar.add(this.logoutBtn);
			this.createCustomerCenter(this.mainPnl)
		}

		App.views.Account.index.superclass.initComponent.call(this);
	},

    /**
     * Creates the customer center if the user is logged in
     * @param parent
     */
	createCustomerCenter: function(parent) {
		var me = this,
			userData = null,
			paymentMethods = [];

		/* Get user data */
		var userData = App.stores.UserData;
		userData = userData.proxy.reader.rawData.sUserData;
		var billingSalutation = (userData.billingaddress.salutation == 'mr') ? 'Herr' : 'Frau';
		var shippingSalutation = (userData.shippingaddress.salutation == 'mr') ? 'Herr' : 'Frau';

		/* Welcome component */
		this.welcomeCmp = new Ext.Component({
			id: 'welcomeCmp',
			cls: 'infoCon',
			html: '<p class="welcome-teaser">{s name="MobileAccountWelcomeText"}Willkommen{/s}, ' + userData.billingaddress.firstname + '&nbsp;' + userData.billingaddress.lastname + '</p>' +
					'<p>{s name="MobileAccountWelcomeInfoText"}Hier erhalten Sie einen &Uuml;berblick &uuml;ber Ihre Registrierungsinformationen.{/s}</p>'
		});

		/* User info component */
		this.userInfoCmp = new Ext.Component({
			id: 'userInfoCmp',
			html: '<div class="label x-form-fieldset-title">{s name="MobileAccountUserText"}Benutzerinformationen{/s}</div>'+
					'<div class="infoCon">' + userData.billingaddress.firstname + '&nbsp;' + userData.billingaddress.lastname + '<br/>' +
					userData.additional.user.email + '</div>'
		});

		/** Payment methods fieldset */
		this.paymentField = new Ext.form.FieldSet({
			title: 'Zahlungsart ausw&auml;hlen'
		});

		/* Billing address component */
		this.billingCmp = new Ext.Component({
			id: 'billingCmp',
			html: '<div class="label x-form-fieldset-title">{s name="MobileAccountBillingText"}Rechnungsadresse{/s}</div>' +
					'<div class="infoCon">' + billingSalutation + '&nbsp;' +
					userData.billingaddress.firstname + '&nbsp;' + userData.billingaddress.lastname + '<br/> ' +
					userData.billingaddress.street + '&nbsp;' + userData.billingaddress.streetnumber + '<br/>' +
					userData.billingaddress.zipcode + '&nbsp;' + userData.billingaddress.city + '</div>'
		});

		/* Shipping address component */
		this.deliveryCmp = new Ext.Component({
			id: 'deliverCmp',
			html: '<div class="label x-form-fieldset-title">{s name="MobileAccountShippingText"}Lieferadresse{/s}</div>' +
					'<div class="infoCon">' + shippingSalutation + '&nbsp;' +
					userData.shippingaddress.firstname + '&nbsp;' + userData.shippingaddress.lastname + '<br/> ' +
					userData.shippingaddress.street + '&nbsp;' + userData.shippingaddress.streetnumber + '<br/>' +
					userData.shippingaddress.zipcode + '&nbsp;' + userData.shippingaddress.city + '</div>'
		});

		/* Customer center */
		this.centerPnl = new Ext.form.FormPanel({
			id: 'accountCenter',
			height: '100%',
			scroll: false,
			items: [this.welcomeCmp, this.userInfoCmp, this.paymentField, this.billingCmp, this.deliveryCmp]
		});

		/** Get the payment methods */
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
			me.centerPnl.doLayout();
		});

		parent.add(this.centerPnl);
		parent.doLayout();
		parent.doComponentLayout();

	},

	/**
	 * onBackBtn
	 *
	 * Handles the back button
	 *
	 * @param btn
	 * @param event
	 */
	onBackBtn: function(btn, event) {
        var curr      = this.getActiveItem(),
            currIdx   = this.items.indexOf(curr);

        if (currIdx != 0) {
            var prevDepth     = currIdx - 1,
                prev          = this.items.getAt(prevDepth);

            this.setActiveItem(prev, {
                type: 'slide',
                reverse: true,
                scope: this
            });
            this.syncToolbar(prev);

	        if(curr) { curr.destroy(); }
        }
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

		return true;
	},

	/**
	 * syncToolbar/tapped
	 *
	 * @param card - active card
	 */
	syncToolbar: function(card) {
		var active        = card || this.getActiveItem(),
			depth         = this.items.indexOf(active),
			backBtn       = this.backBtn,
			backToggleMth = (depth !== 0) ? 'show' : 'hide',
			title;

		if(active.title) {
			title = active.title;
		} else if(active.ownerCt.title) {
			title = active.ownerCt.title;
		}

		if(title.length) {
			this.toolbar.setTitle(title);
		}

	/**
	 * Refreshes the toolbar after the back btn
	 * was clicked
	 */
		if(depth === 0) {
			this.backBtn.hide();
			this.toolbar.doLayout();
		}
	}
});

/**
 * Account Login
 *
 * Contains a form to login a user
 *
 * @access public
 * @class
 * @extends Ext.form.FormPanel
 */
App.views.Account.login = Ext.extend(Ext.form.FormPanel,
/** @lends App.views.Account.login# */
{
	id: 'login',
	scroll: 'vertical',
	title: 'Login',
	url: App.RequestURL.login,
	method: 'post',
	standardSubmit: false,
	items: [{
		xtype: 'fieldset',
		title: 'Login',
		instructions: '{s name="MobileLoginInstructions"}Bitte geben Sie Ihre Kundendaten ein{/s}',
		defaults: { labelWidth: '38%' },
		items: [
			{
				xtype: 'hiddenfield',
				name: 'accountmode',
				value: 2
			},
			{
				xtype: 'emailfield',
				name: 'email',
				label: '{s name="MobileLoginMail"}E-Mail{/s}',
				required: true,
				autoComplete: false,
				placeHolder: '{s name="MobileLoginMailPlaceholder"}me@shopware.de{/s}'
			},
			{
				xtype: 'passwordfield',
				autoComplete: false,
				name: 'password',
				label: '{s name="MobileLoginPassword"}Passwort{/s}',
				required: true
			}
		]
	}, {
		id: 'loginBtn',
		xtype: 'button',
		text: '{s name="MobileLoginLoginButton"}Login absenden{/s}',
		style: 'margin: 0.5em',
		ui: 'confirm',
		scope: this,
		handler: this.onLoginBtn
	}],
	listeners: {
		scope: this,
		deactivate: function(me) {
			me.destroy();
		},
		submit: function(form, response) {

			if(!response.success && response.msg) {
				return false;
			}
			Ext.Msg.alert('Login erfolgreich', response.msg, function() {
				Ext.dispatch({
					controller: 'account',
					action: 'login',
					form: form,
					response: response
				});

				return true;
			});
		},
		exception: function(form, response) {
			if(!response.success && response.msg) {
				Ext.Msg.alert('{s name="MobileLoginFailedText"}Login fehlgeschlagen{/s}', response.msg);
				isUserLoggedIn = 0;
			}
		}
	},

	initComponent: function() {
		App.views.Account.login.superclass.initComponent.call(this);
		Ext.getCmp('loginBtn').on('tap', this.onLoginBtn, this);
	},

	onLoginBtn: function() {
		this.submit();
	}

});

/**
 * Account registration
 *
 * Contains a form to register a user
 *
 * @access public
 * @class
 * @extends Ext.form.FormPanel
 */
App.views.Account.register = Ext.extend(Ext.form.FormPanel,
/** @lends App.views.Account.register# */
{
	id: 'register',
	scroll: 'vertical',
	title: '{s name="MobileRegisterTitle"}Registrierung{/s}',
	width: '100%',
	url: App.RequestURL.register,
	method: 'post',
	standardSubmit: false,
	items: [
		{
			xtype: 'fieldset',
			title: '{s name="MobileRegisterPersonalTitle"}Pers&ouml;nliche Angaben{/s}',
			defaults: {
				labelWidth: '50%'
			},
			items: [
				{
					xtype: 'selectfield',
					label: '{s name="MobileRegisterPersonalIam"}Ich bin{/s}',
					required: true,
					id: 'customer_type',
					name: 'register[personal][customer_type]',
					options: [
						{ text: '{s name="MobileRegisterPersonalPrivateCustomer"}Privatkunde{/s}', value: 'private' },
						{ text: '{s name="MobileRegisterPersonalBusiness"}Firma{/s}', value: 'business' }
					]
				},
				{
					xtype: 'selectfield',
					label: '{s name="MobileRegisterPersonalSalutation"}Anrede{/s}',
					required: true,
					name: 'register[personal][salutation]',
					id: 'salutation',
					options: [
						{ text: 'Herr', value: 'mr' },
						{ text: 'Frau', value: 'mrs' }
					]
				},
				{
					xtype: 'textfield',
					label: '{s name="MobileRegisterPersonalFirstname"}Vorname{/s}',
					name: 'register[personal][firstname]',
					id: 'firstname',
					required: true,
					placeHolder: '{s name="MobileRegisterPersonalFirstnamePlaceholder"}Max{/s}'
				},
				{
					xtype: 'textfield',
					label: '{s name="MobileRegisterPersonalLastname"}Nachname{/s}',
					name: 'register[personal][lastname]',
					id: 'lastname',
					required: true,
					placeHolder: '{s name="MobileRegisterPersonalLastnamePlaceholder"}Mustermann{/s}'
				},
				{
					xtype: 'emailfield',
					label: '{s name="MobileRegisterPersonalMail"}E-Mail{/s}',
					name: 'register[personal][email]',
					id: 'email',
					required: true,
					placeHolder: '{s name="MobileRegisterPersonalMailPlaceholder"}me@shopware.de{/s}'
				},
				{
					id: 'password',
					xtype: 'passwordfield',
					label: '{s name="MobileRegisterPersonalPassword"}Passwort{/s}',
					name: 'register[personal][password]',
					required: true
				},
				{
					id: 'passwordConfirmation',
					xtype: 'passwordfield',
					label: '{s name="MobileRegisterPersonalPasswordRepeat"}Passwort Wdh.{/s}',
					name: 'register[personal][passwordConfirmation]',
					required: true
				},
				{
					xtype: 'textfield',
					label: '{s name="MobileRegisterPersonalPhone"}Telefon{/s}',
					required: true,
					name: 'register[personal][phone]',
					id: 'phone',
					placeHolder: '{s name="MobileRegisterPersonalPhonePlaceholder"}02555997500{/s}'
				},
				{
					xtype: 'localeDatepickerfield',
					label: '{s name="MobileRegisterPersonalBirthday"}Geburtstag{/s}',
					id: 'birthday'
				}
			]
		},
		{
			xtype: 'fieldset',
			title: '{s name="MobileRegisterShippingTitle"}Ihre Adresse{/s}',
			instructions: '{s name="MobileRegisterShippingInstruction"}Die eingegebene Adresse fungiert als Rechnungsadresse und als Lieferadresse.{/s}',
			defaults: {
				labelWidth: '38%'
			},
			items: [
				{
					xtype: 'textfield',
					label: '{s name="MobileRegisterShippingStreet"}Stra&szlig;e{/s}',
					name: 'register[billing][street]',
					id: 'street',
					required: true
				},
				{
					xtype: 'textfield',
					label: '{s name="MobileRegisterShippingStreetNo"}Hausnr.{/s}',
					name: 'register[billing][streetnumber]',
					id: 'streetnumber',
					required: true
				},
				{
					xtype: 'textfield',
					label: '{s name="MobileRegisterShippingZipcode"}PLZ{/s}',
					name: 'register[billing][zipcode]',
					id: 'zipcode',
					required: true
				},
				{
					xtype: 'textfield',
					label: '{s name="MobileRegisterShippingCity"}Stadt{/s}',
					name: 'register[billing][city]',
					id: 'city',
					required: true
				},
				{
					xtype: 'selectfield',
					label: '{s name="MobileRegisterShippingLand"}Land{/s}',
					required: true,
					name: 'register[billing][country]',
					options: [
						{ text: 'Deutschland', value: '2' }
					]
				}
			]
		},
		{
			id: 'registerBtn',
			xtype: 'button',
			text: '{s name="MobileRegisterSendButton"}Registierung absenden{/s}',
			style: 'margin: 0.5em',
			ui: 'confirm',
			scope: this,
			handler: function() { Ext.getCmp('register').submit(); }
		}
	],
	listeners: {
		scope: this,
		deactivate: function(me) {
			me.destroy();
		},

		submit: function(form, response) {
			if(response.success && response.msg) {
				Ext.Msg.alert('{s name="MobileRegisterSuccess"}Registrierung erfolgreich{/s}', response.msg, function() {
					Ext.dispatch({
						controller: 'account',
						action: 'register'
					});
				});
			}

			return true;
		},

		exception: function(form, response) {
			if(!response.success && response.msg) {
				Ext.Msg.alert('{s name="MobileRegisterFailed"}Registrierung fehlgeschlagen{/s}', response.msg + '<br />' + response.errors);

				/* Mark fields from server side validation */
				var error_fields = response.error_fields;
				for(i in error_fields) {
					var errors = error_fields[i];
					Ext.iterate(errors, function(errorField, index) {
						var cmp = Ext.getCmp(errorField);
						cmp.addCls('error');

					});
				}

				isUserLoggedIn = 0;
			}
		}
	},

	initComponent: function() {
		App.views.Account.register.superclass.initComponent.call(this);
	}
});
</script>