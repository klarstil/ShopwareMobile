/**
 * @file info.js
 * @link http://www.shopware.de
 * @author S.Pohl <stp@shopware.de>
 * @date 11-05-11
 */
Ext.ns('App.views.Viewport', 'App.views.Shop', 'App.views.Search', 'App.views.Cart', 'App.views.Account', 'App.views.Info', 'App.views.Checkout');

/**
 * Main Info Panel
 *
 * Contains the pages list
 *
 * @access public
 * @class
 * @extends Ext.Panel
 */
App.views.Info.index = Ext.extend(Ext.Panel,
/** @lends App.views.Info.index# */
{
	id: 'info',
	title: '{s name="MobileInfoTitle"}Informationen{/s}',
	iconCls: 'info',
	layout: 'card',
	initComponent: function() {

		this.toolbar = new Ext.Toolbar({
			dock: 'top',
			title: '{s name="MobileInfoToolbarTitle"}Informationen{/s}',
			id: 'info_toolbar',
			items: [
				{
					xtype: 'button',
					id: 'info_backBtn',
					text: 'Zur&uuml;ck',
					handler: this.onBackBtn,
					ui: 'back',
					hidden: true
				}
			]
		});

		Ext.apply(this, {
			dockedItems: [this.toolbar],
			items: [new App.views.Info.list]
		});
		App.views.Info.index.superclass.initComponent.call(this);
	},

	/**
	 * Handles the back button behavior
	 */
	onBackBtn: function() {
		Ext.getCmp('info').getToolbar().setTitle('{s name="MobileInfoToolbarTitle"}Informationen{/s}');
		Ext.getCmp('info').setActiveItem('static_list', { type: 'slide', direction: 'right' });
	},

	/**
	 * Returns the toolbar
     * @return toolbar - Ext.Toolbar
	 */
	getToolbar: function() {
		return this.toolbar;
	}
});

/**
 * Shopsites list
 *
 * @access public
 * @class
 * @extends Ext.List
 */
App.views.Info.list = Ext.extend(Ext.List,
/** @lends App.views.Info.list# */
{
	store: App.stores.Info,
	itemTpl: App.views.Info.listTpl,
	id: 'static_list',
	listeners: {
		scope: this,
		activate: function() {
			var backbtn = Ext.getCmp('info_backBtn');
			backbtn.hide();
		},
		deactivate: function() {
			var backbtn = Ext.getCmp('info_backBtn');
			backbtn.show();
		}
	},
	initComponent: function() {
		App.views.Info.list.superclass.initComponent.call(this);
	},

	/**
	 * Opens the detail view
	 *
	 * @param pnl
	 * @param idx
	 */
	onItemTap: function(pnl, idx) {
		var item = App.stores.Info.getAt(idx), view = Ext.getCmp('infoDetail');

		if(!view) {
			view = new App.views.Info.Detail(item);
			Ext.getCmp('info').add(view);
		}

		Ext.getCmp('info').getToolbar().setTitle(App.Helpers.truncate(item.data.name, 12, '...'));
		Ext.getCmp('info').setActiveItem(view, { type: 'slide' });
	}
});

/**
 * Detail Panel for list items
 *
 * @access public
 * @class
 * @extends Ext.form.FormPanel
 */
App.views.Info.Detail = Ext.extend(Ext.form.FormPanel,
/** @lends App.views.Info.Detail# */
{
	id: 'infoDetail',
	height: '100%',
	scroll: 'vertical',
	url: '/sViewport,Forms',
	listeners: {
		scope: this,
		deactivate: function(me) {
			me.destroy();
		}
	},

	/**
	 * Will be called when a new instance would create
	 *
	 * @param item
	 */
	constructor: function(item) {

		if(Ext.isObject(item.data.form)) {

			this.hidden = new Ext.form.Hidden({
				name: 'id',
				value: item.data.sFid
			});

			this.submitHidden = new Ext.form.Hidden({
				name: 'Submit',
				value: 'Absenden'
			});

			this.fieldset = new Ext.form.FieldSet({
				id: 'customFieldset',
				title: item.data.name,
				instructions: item.data.content,
				items: []
			});
			this.fieldset.removeAll();

			for(var idx in item.data.form) {
				this.createFormElement(item.data.form[idx]);
			}

			this.submitBtn = new Ext.Button({
				text: 'Absenden',
				ui: 'confirm',
				handler: function() {
					Ext.getCmp('infoDetail').submit();
				}
			})

			Ext.apply(this, {
				items: [this.hidden, this.submitHidden, this.fieldset, this.submitBtn]
			});
			this.doLayout();
		} else {
			this.update('<div class="inner">' + item.data.content + '</div>');
		}
		App.views.Info.Detail.superclass.constructor.call(this);
	},

	/**
	 * Dynamic creation of forms
	 * 
	 * @param cfg
	 */
	createFormElement: function(cfg) {

		//Set references
		var defaultValue = '';
		if(cfg.ticket_task != null) {
			if(cfg.ticket_task == 'email') {
				defaultValue = this.userEmail;
			} else if(cfg.ticket_task == 'name') {
				defaultValue = this.userName;
			}
		}
		switch(cfg.typ) {
			case 'checkbox':
				var checkField = new Ext.form.Checkbox({
					label: cfg.label,
					name: cfg.name,
					checked: (parseInt(cfg.value)) ? true : false,
					required: (cfg.required) ? true : false
				});
				this.fieldset.add(checkField);
				break;
			case 'textarea':
				var areaField = new Ext.form.TextArea({
					label: cfg.label,
					name: cfg.name,
					allowBlank: (!cfg.required) ? true : false,
					required: (cfg.required) ? true : false,
					placeHolder: (cfg.note) ? cfg.note : false
				});
				this.fieldset.add(areaField);
				break;

			case 'email':
				var mailField = new Ext.form.Email({
					label: 'Mail',
					name: cfg.name,
					value: defaultValue,
					allowBlank: (!cfg.required) ? true : false,
					required: (cfg.required) ? true : false,
					placeHolder: (cfg.note) ? cfg.note : false
				});
				this.fieldset.add(mailField);
				break;
			
			case 'select':
				var selectValues = cfg.value.split(';');
				var data = new Array();
				if(selectValues != null) {
					for(var i=0; i<selectValues.length; i++) {
						var tmpArr = new Array();
						tmpArr.push(selectValues[i]);
						data.push(tmpArr);
					}
				}

				var selectField = new Ext.form.Select({
					label: cfg.label,
					name: cfg.name,
					hiddenName: cfg.name,
					mode: 'local',
					displayField: 'value',
					valueField: 'value',
					store: new Ext.data.ArrayStore({ autoDestroy: true, fields: ['value'], data: data }),
					triggerAction: 'all',
					required: (cfg.required) ? true : false
				});
				this.fieldset.add(selectField);
				break;
			
			default:
				var textField = new Ext.form.Text({
					label: cfg.label,
					name: cfg.name,
					value: defaultValue,
					allowBlank: (!cfg.required) ? true : false,
					required: (cfg.required) ? true : false,
					placeHolder: (cfg.note) ? cfg.note : false
				});
			this.fieldset.add(textField);
		}
	}
});