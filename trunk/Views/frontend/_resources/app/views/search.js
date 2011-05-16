/**
 * @file search.js
 * @link http://www.shopware.de
 * @author S.Pohl <stp@shopware.de>
 * @date 11-05-11
 */
Ext.ns('App.views.Viewport', 'App.views.Shop', 'App.views.Search', 'App.views.Cart', 'App.views.Account', 'App.views.Info', 'App.views.Checkout');

/**
 * Main search view
 *
 * Contains all necessary sub components
 *
 * @access public
 * @class
 * @extends Ext.Panel
 */
App.views.Search.index = Ext.extend(Ext.Panel,
/** @lends App.views.Search.index# */
{
	id: 'search',
	title: 'Suche',
	iconCls: 'search',
	layout: 'card',
	listeners: {
		beforeactivate: function(me) {
			if(me.toolbar.isHidden()) {
				me.toolbar.show();
				me.show();
			}
		}
	},
	initComponent: function() {

		this.toolbar = new Ext.Toolbar({
			ui: 'dark',
			dock: 'top',
			items: [
				{
					id: 'searchfield',
					xtype: 'searchfield',
					name: 'search_query',
					autoFocus: true,
					hasFocus: true,
					width: '78%',
					placeHolder: 'Ihr Suchbegriff',
					listeners: {
						scope: this,
						keyup: this.onKeyUp
					}
				},
				{ xtype: 'spacer' },
				{
					id: 'searchBtn',
					iconMask: true,
					iconCls: 'search',
					xtype: 'button',
					ui: 'action small',
					scope: this,
					handler: this.onSearch
				}
			]
		});

		this.emptyHtml = '<div class="emptySearch">'+
			'Bitte geben Sie einen Suchbefehl ein, um die Artikelsuche zu starten.'+
			'</div>';

		Ext.apply(this, {
			dockedItems: [this.toolbar],
			html: this.emptyHtml
		});
		App.views.Search.index.superclass.initComponent.call(this);
	},

    /**
     * Event handler
     *
     * @param cmp
     * @param event
     */
	onKeyUp: function(cmp, event) {
		var val = cmp.getValue();
		if (event.browserEvent.keyCode == 13) {
			cmp.blur();
			this.onSearch(val);
		}
	},

    /**
     * Event handler
     *
     * @param val
     */
	onSearch: function(val) {
		var list   = Ext.getCmp('searchList'),
			search = Ext.getCmp('search');
		
		if(!list) {
			list = new App.views.Search.list();
			search.add(list);
			search.doLayout();
		}
		Ext.getCmp('search').add(list);
		
		if(val.length >= 3) {
			Ext.getCmp('search').doLayout();
			App.stores.Search.load({
				params: {
					sSearch: val
				}
			});

			App.stores.Search.proxy.extraParams = {
				sSearch: val
			};
		} else {
			list.destroy();
			this.update(this.emptyHtml);
			this.doLayout();
		}
	}
});

/**
 * Search result list
 *
 * @access public
 * @class
 * @extends Ext.List
 */
App.views.Search.list = Ext.extend(Ext.List,
/** @lends App.views.Search.list */
{
	id: 'searchList',
	store: App.stores.Search,
	itemTpl: App.views.Search.itemTpl,
	itemtap: this.onItemTap,
	scope: this,
	initComponent: function() {

		this.store.on({
			scope: this,
			datachanged: this.onDataChanged
		});
		App.views.Search.list.superclass.initComponent.call(this);
	},

    /**
     * Event handler
     * 
     * @param store
     */
	onDataChanged: function(store) {
		if(store.data.items.length >= 1) {
			this.refresh();
		} else {
			this.ownerCt.update('<div class="emptySearch">Es wurden keine Ergebnisse zu Ihren Suchbegriff gefunden.</div>');
			this.destroy();
		}
	},

    /**
     * Event handler
     *
     * @param view
     * @param idx
     * @param item
     * @param event
     */
	onItemTap: function(view, idx, item, event) {
		var tmpRec = this.store.getAt(idx);
		Ext.dispatch({
			controller: 'detail',
			action: 'show',
			articleID: tmpRec.data.articleID,
			parent: this.ownerCt
		})

		this.ownerCt.toolbar.hide();
	}
});