/**
 * ----------------------------------------------------------------------
 * account.js
 *
 * Views fuer die Registrierung/Login
 * ----------------------------------------------------------------------
 */
Ext.ns('App.views.Viewport', 'App.views.Shop', 'App.views.Search', 'App.views.Cart', 'App.views.Account', 'App.views.Info');
App.views.Account.index = Ext.extend(Ext.Panel, {
	id: 'account',
	title: 'Kundenkonto',
	iconCls: 'user',
	layout: 'card',
	scroll: false,

	initComponent: function() {

		this.backBtn = new Ext.Button({
			text: this.title,
			scope: this,
			hidden: true,
			ui: 'back',
			handler:  this.onBackBtn
		});

		this.toolbar = new Ext.Toolbar({
			dock: 'top',
			title: this.title,
			items: [this.backBtn, { xtype: 'spacer' }]
		});

		this.logoutBtn = new Ext.Button({
			id: 'logoutBtn',
			ui: 'action',
			scope: this,
			text: 'Logout',
			hidden: (Ext.isEmpty(isUserLoggedIn)) ? true : false,
			handler: function() { console.log('onLogout'); }
		});

		this.existingPnl = new Ext.Container({
			id: 'existing',
			cls: 'x-form-fieldset',
			listeners: {
				scope: this,
				tap: {
					element: 'el',
					fn: function() {
						Ext.dispatch({
							controller: 'account',
							action: 'showLogin'
						});
					}
				}
			},
			html: '<div class="label x-form-fieldset-title">Bestehender Kunde</div>' +
					'<div id="inner-existing" class="inner x-panel-body">' +
						'<strong>Login</strong>' +
						'<p>Sie sind bereits Kunde? Dann loggen Sie sich jetzt mit Ihrer E-Mail-Adresse und Ihrem Passwort ein.</p>' +
					'</div>'
		});

		this.newPnl = new Ext.Container({
			id: 'new',
			cls: 'x-form-fieldset',
			listeners: {
				scope: this,
				tap: {
					element: 'el',
					fn: function() {
						Ext.dispatch({
							controller: 'account',
							action: 'showRegister'
						});
					}
				}
			},
			html: '<div class="label x-form-fieldset-title">Neuer Kunde</div>' +
					'<div id="inner-new" class="inner x-panel-body">' +
						'<strong>Registrierung</strong>' +
						'<p>Kein Problem, eine Shopbestellung ist einfach und sicher. Die Anmeldung dauert nur wenige Augenblicke.</p>' +
					'</div>'
		});

		this.mainPnl = new Ext.Container({
			cls: 'startup',
			height: '100%',
			scroll: 'vertical',
			items: [this.newPnl, this.existingPnl]
		});

		Ext.apply(this, {
			dockedItems: [this.toolbar],
			items: [this.mainPnl]
		});
		App.views.Account.index.superclass.initComponent.call(this);
	},

	onBackBtn: function() {
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

		if(depth === 0) {
			this.backBtn.hide();
			this.toolbar.doLayout();
		}
	}
});

App.views.Account.login = Ext.extend(Ext.form.FormPanel, {
	id: 'login',
	scroll: 'vertical',
	title: 'Login',
	url: App.RequestURL.login,
	method: 'post',
	standardSubmit: false,
	items: [{
		xtype: 'fieldset',
		title: 'Login',
		instructions: 'Bitte geben Sie Ihre Kundendaten ein',
		defaults: { labelWidth: '38%' },
		items: [
			{
				xtype: 'emailfield',
				name: 'email',
				label: 'E-Mail',
				required: true,
				placeHolder: 'me@shopware.de'
			},
			{
				xtype: 'passwordfield',
				name: 'password',
				label: 'Passwort',
				required: true
			}
		]
	}, {
		id: 'loginBtn',
		xtype: 'button',
		text: 'Login absenden',
		style: 'margin: 0.5em',
		ui: 'confirm',
		scope: this,
		handler: this.onLoginBtn
	}],
	listeners: {
		submit: function(form, response) {
			if(response.success && response.msg) {
				Ext.Msg.alert('Login erfolgreich', response.msg);
			}
		},
		exception: function(form, response) {
			if(!response.success && response.msg) {
				Ext.Msg.alert('Login fehlgeschlagen', response.msg);
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

App.views.Account.register = Ext.extend(Ext.form.FormPanel, {
	id: 'register',
	scroll: 'vertical',
	title: 'Registrierung',
	width: '100%',
	url: App.RequestURL.register,
	method: 'post',
	standardSubmit: false,
	items: [
		{
			xtype: 'fieldset',
			title: 'Pers&ouml;nliche Angaben',
			defaults: {
				labelWidth: '38%'
			},
			items: [
				{
					xtype: 'selectfield',
					label: 'Ich bin',
					required: true,
					name: 'register[personal][customer_type]',
					options: [
						{ text: 'Privatkunde', value: 'private' },
						{ text: 'Firma', value: 'buisness' }
					]
				},
				{
					xtype: 'selectfield',
					label: 'Anrede',
					required: true,
					name: 'register[personal][salutation]',
					options: [
						{ text: 'Herr', value: 'mr' },
						{ text: 'Frau', value: 'mrs' }
					]
				},
				{
					xtype: 'textfield',
					label: 'Vorname',
					name: 'register[personal][firstname]',
					required: true,
					placeHolder: 'Max'
				},
				{
					xtype: 'textfield',
					label: 'Nachname',
					name: 'register[personal][lastname]',
					required: true,
					placeHolder: 'Mustermann'
				},
				{
					xtype: 'emailfield',
					label: 'E-Mail',
					name: 'register[personal][email]',
					required: true,
					placeHolder: 'me@shopware.de'
				},
				{
					id: 'passField',
					xtype: 'passwordfield',
					label: 'Passwort',
					name: 'register[personal][password]',
					required: true
				},
				{
					id: 'passWdhField',
					xtype: 'passwordfield',
					label: 'Passwort Wdh.',
					name: 'register[personal][passwordConfirmation]',
					required: true
				},
				{
					xtype: 'textfield',
					label: 'Telefon',
					required: true,
					name: 'register[personal][phone]',
					placeHolder: '02555997500'
				},
				{
					xtype: 'datepickerfield',
					label: 'Geburtstag',
					picker: {
						name: 'birthday',
						yearFrom: 1900,
						yearTo: 1999,
						dayText: 'Tag',
						yearText: 'Jahr',
						monthText: 'Monat',
						slotOrder: ['day', 'month', 'year']
					}
				}
			]
		},
		{
			xtype: 'fieldset',
			title: 'Ihre Adresse',
			instructions: 'Die eingegebene Adresse fungiert als Rechnungsadresse und als Lieferadresse.',
			defaults: {
				labelWidth: '38%'
			},
			items: [
				{
					xtype: 'textfield',
					label: 'Stra&szlig;e',
					name: 'register[billing][street]',
					required: true
				},
				{
					xtype: 'textfield',
					label: 'Hausnr.',
					name: 'register[billing][streetnumber]',
					required: true
				},
				{
					xtype: 'textfield',
					label: 'PLZ',
					name: 'register[billing][zipcode]',
					required: true
				},
				{
					xtype: 'textfield',
					label: 'Stadt',
					name: 'register[billing][city]',
					required: true
				},
				{
					xtype: 'selectfield',
					label: 'Land',
					required: true,
					name: 'register[billing][country]',
					options: [
						{text: 'Deutschland', value: '2'}
					]
				}
			]
		},
		{
			id: 'registerBtn',
			xtype: 'button',
			text: 'Registierung absenden',
			style: 'margin: 0.5em',
			ui: 'confirm',
			scope: this,
			handler: this.onRegisterBtn
			//disabled: true
		}
	],
	listeners: {
		submit: function(form, response) {
			if(response.success && response.msg) {
				Ext.Msg.alert('Registrierung erfolgreich', response.msg);
			}
		},
		
		exception: function(form, response) {
			if(!response.success && response.msg) {
				Ext.Msg.alert('Registrierung fehlgeschlagen', response.msg);
			}
		}
	},

	initComponent: function() {
		App.views.Account.register.superclass.initComponent.call(this);
	},
	
	onRegisterBtn: function() {
		this.submit();
	}
});