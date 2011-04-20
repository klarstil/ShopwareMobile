/**
 * ----------------------------------------------------------------------
 * info.js
 *
 * View for static pages and forms
 *
 * @link http://www.shopware.de
 * @author S.Pohl <stp@shopware.de>
 * ----------------------------------------------------------------------
 */
Ext.ns('App.views.Viewport', 'App.views.Shop', 'App.views.Search', 'App.views.Cart', 'App.views.Account', 'App.views.Info');

/**
 * Main Info Panel
 * Contains the pages list
 */
App.views.Info.index = Ext.extend(Ext.Panel, {
	id: 'info',
	title: 'Informationen',
	iconCls: 'info',
	layout: 'card',
	initComponent: function() {

		this.toolbar = new Ext.Toolbar({
			dock: 'top',
			title: 'Informationen',
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
			items: [new App.views.Info.list, new App.views.Info.Detail]
		});
		App.views.Info.index.superclass.initComponent.call(this);
	},

	/**
	 * onBackBtn - Event handler
	 *
	 * Handles the back button behavior
	 */
	onBackBtn: function() {
		Ext.getCmp('info').getToolbar().setTitle('Informationen');
		Ext.getCmp('info').setActiveItem('static_list', { type: 'slide', direction: 'right' });
	},

	/**
	 * getToolbar
	 * Returns the toolbar
	 */
	getToolbar: function() {
		return this.toolbar;
	}
});

/**
 * Static pages and form list
 */
App.views.Info.list = Ext.extend(Ext.List, {
	store: App.stores.Info,
	itemTpl: '<strong>{name}</strong>',
	id: 'static_list',
	grouped: true,
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

		this.on({
			scope: this,
			itemtap: this.onItemTap
		});

		App.views.Info.list.superclass.initComponent.call(this);
	},

	/**
	 * onItemTap - Event handler
	 *
	 * Opens the detail view
	 *
	 * @param pnl
	 * @param idx
	 * @param item
	 * @param event
	 */
	onItemTap: function(pnl, idx, item, event) {
		var item = App.stores.Info.getAt(idx);
		var detail = Ext.getCmp('infoDetail');
		detail.update('<div class="inner">' + item.data.content + '</div>');

		Ext.getCmp('info').getToolbar().setTitle(item.data.name);
		Ext.getCmp('info').setActiveItem('infoDetail', { type: 'slide' });
	}
});

/**
 * Detail Panel
 * Filled by onItemTap event handler
 */
App.views.Info.Detail = Ext.extend(Ext.Panel, {
	id: 'infoDetail',
	height: '100%',
	scroll: 'vertical'
});