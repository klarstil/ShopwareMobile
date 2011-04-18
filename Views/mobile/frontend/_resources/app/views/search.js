/**
 * ----------------------------------------------------------------------
 * search.js
 *
 * Views fuer die Suche
 * ----------------------------------------------------------------------
 */
Ext.ns('App.views.Viewport', 'App.views.Shop', 'App.views.Search', 'App.views.Cart', 'App.views.Account', 'App.views.Info');
App.views.Search.index = Ext.extend(Ext.Panel, {
	id: 'search',
	title: 'Suche',
	iconCls: 'search',
	layout: 'card',
	html: 'Suche',
	initComponent: function() {
		Ext.apply(this, {
			dockedItems: [new App.views.Search.toolbar],
			items: [new App.views.Search.list]
		});
		App.views.Search.index.superclass.initComponent.call(this);
	}
});

App.views.Search.toolbar = Ext.extend(Ext.Toolbar, {
	ui: 'dark',
	dock: 'top',
	initComponent: function() {
		Ext.apply(this, {
			items: [
				{
					id: 'searchfield',
					xtype: 'searchfield',
					name: 'search_query',
					autoFocus: true,
					hasFocus: true,
					width: '65%',
					placeHolder: 'Ihr Suchbegriff',
					listeners: {
						scope: this,
						keyup: this.onKeyUp
					}
				},
				{ xtype: 'spacer' },
				{
					id: 'searchBtn',
					xtype: 'button',
					text: 'Suchen',
					ui: 'action small',
					scope: this,
					handler: this.onSearch
				}
			]
		});

		this.constructor.superclass.initComponent.call(this);
	},

	onKeyUp: function(cmp, event) {
		var val = cmp.getValue();
		if (event.browserEvent.keyCode == 13) {
			cmp.blur();
			this.onSearch(val);
		}
	},

	onSearch: function(val) {
		App.stores.Search.load({
			params: {
				sSearch: val
			}
		});
	}
});

App.views.Search.list = Ext.extend(Ext.List, {
	store: App.stores.Search,
	itemTpl: '<div class="image" style="background-image:url({image})"></div><strong class="name">{name}</strong><span class="price">{price} &euro;</span>',
	itemtap: this.onItemTap,
	scope: this,
	initComponent: function() {

		this.store.on({
			scope: this,
			datachanged: this.onDataChanged
		});
		App.views.Search.list.superclass.initComponent.call(this);
	},

	onDataChanged: function(store) {
		this.refresh();
	},

	onItemTap: function(view, idx, item, event) {
		Ext.dispatch({
			controller: 'detail',
			action: 'show',
			idx: idx,
			store: this.store,
			searchCall: true
		})
	}

});