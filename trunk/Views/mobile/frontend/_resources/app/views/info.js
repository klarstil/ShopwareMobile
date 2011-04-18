/**
 * ----------------------------------------------------------------------
 * info.js
 *
 * Views fuer die Informationsseiten bzw. statischen Seiten
 * ----------------------------------------------------------------------
 */
Ext.ns('App.views.Viewport', 'App.views.Shop', 'App.views.Search', 'App.views.Cart', 'App.views.Account', 'App.views.Info');
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

	onBackBtn: function() {
		Ext.getCmp('info').getToolbar().setTitle('Informationen');
		Ext.getCmp('info').setActiveItem('static_list', { type: 'slide', direction: 'right' });
	},
	getToolbar: function() {
		return this.toolbar;
	}
});

App.views.Info.list = Ext.extend(Ext.List, {
	store: App.stores.Info,
	itemTpl: '{description}',
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

		this.on({
			scope: this,
			itemtap: this.onItemTap
		})

		App.views.Info.list.superclass.initComponent.call(this);
	},
	onItemTap: function(pnl, idx, item, event) {
		var item = App.stores.Info.getAt(idx);
		var detail = Ext.getCmp('infoDetail');
		detail.update('<div class="inner">' + item.data.html + '</div>');

		Ext.getCmp('info').getToolbar().setTitle(item.data.description);
		Ext.getCmp('info').setActiveItem('infoDetail', { type: 'slide' });
	}
});

App.views.Info.Detail = Ext.extend(Ext.Panel, {
	id: 'infoDetail',
	height: '100%',
	scroll: 'vertical'
});