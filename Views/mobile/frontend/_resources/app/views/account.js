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
	title: 'Registierung',
	iconCls: 'user',
	layout: 'card',
	scroll: false,
	flex: 1,
	initComponent: function() {

		this.toolbar = new Ext.Toolbar({
			dock: 'top',
			title: this.title
		});

		Ext.apply(this, {
			dockedItems: [this.toolbar],
			items: [new App.views.Account.register]
		});
		App.views.Account.index.superclass.initComponent.call(this);
	}
});

App.views.Account.register = Ext.extend(Ext.form.FormPanel, {
	id: 'register',
	autoHeight: true,
	scroll: 'vertical',
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
					name: 'iam',
					options: [
						{ text: 'Privatkunde', value: 'private' },
						{ text: 'Firma', value: 'company' }
					]
				},
				{
					xtype: 'selectfield',
					label: 'Anrede',
					required: true,
					name: 'salutation',
					options: [
						{ text: 'Herr', value: 'mr' },
						{ text: 'Frau', value: 'mrs' }
					]
				},
				{
					xtype: 'textfield',
					label: 'Vorname',
					required: true,
					placeHolder: 'Max'
				},
				{
					xtype: 'textfield',
					label: 'Nachname',
					required: true,
					placeHolder: 'Mustermann'
				},
				{
					xtype: 'emailfield',
					label: 'E-Mail',
					required: true,
					placeHolder: 'me@shopware.de'
				},
				{
					xtype: 'passwordfield',
					label: 'Passwort',
					required: true
				},
				{
					xtype: 'textfield',
					label: 'Telefon',
					required: true,
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
			defaults: {
				labelWidth: '38%'
			},
			items: [
				{
					xtype: 'textfield',
					label: 'Stra&szlig;e',
					required: true
				},
				{
					xtype: 'textfield',
					label: 'Hausnr.',
					required: true
				},
				{
					xtype: 'textfield',
					label: 'PLZ',
					required: true
				},
				{
					xtype: 'textfield',
					label: 'Ort',
					required: true
				},
				{
					xtype: 'selectfield',
					label: 'Land',
					required: true,
					name: 'country',
					options: [
						{text: 'Deutschland', value: 'germany'},
						{text: '&Ouml;sterreich', value: 'austria'},
						{text: 'Schweiz', value: 'swiss'}
					]
				}
			]
		},
		{
			xtype: 'button',
			text: 'Registierung absenden',
			style: 'margin: 0.5em',
			ui: 'confirm',
			disabled: true
		}
	],
	initComponent: function() {
		App.views.Account.register.superclass.initComponent.call(this);
	}
});