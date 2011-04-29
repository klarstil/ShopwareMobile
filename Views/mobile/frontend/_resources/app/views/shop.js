/**
 * ----------------------------------------------------------------------
 * shop.js
 *
 * Views fuer das Kategorielisting und die Startseite
 * ----------------------------------------------------------------------
 */
Ext.ns('App.views.Viewport', 'App.views.Shop', 'App.views.Search', 'App.views.Cart', 'App.views.Account', 'App.views.Info');
App.views.Shop.index = Ext.extend(Ext.Panel, {
	id: 'shop',
	title: 'Shop',
	iconCls: 'home',
	layout: 'card',

	initComponent: function () {
		var items;
		
		/* Back button */
		this.backBtn = new Ext.Button({
			ui: 'back',
			text: 'Zur&uuml;ck',
			scope: this,
			handler: this.onBackBtn,
			hidden: true
		});

		/* Toolbar */
		this.toolBar = new Ext.Toolbar({
			title: 'Master',
			items: [this.backBtn],
			hidden: true,
			width: '100%'
		});

		/* Shoplogo */
		this.logo = new Ext.Panel({
			id: 'logo',
			scroll: false,
			autoHeight: true
		});

		/* Einkaufsweltencarousel */
		this.promotions = new Ext.Carousel({
			id: 'promotions',
			store: App.stores.Promotions,
			height: 150,
			width: '100%',
			direction: 'horizontal',
			style: 'border-bottom: 1px solid #c7c7c7'
		});

		/* Hauptkategorien */
		this.list = new Ext.List({
			id: 'categories',
			store: App.stores.Categories,
			scroll: false,
			height: '100%',
			width: '100%',
			itemTpl: '<strong>{name}</strong><tpl if="desc"><div class="desc">{desc}</div></tpl>',
			listeners: {
				scope: this,
				selectionchange: this.onSelectionChange,
				itemtap: this.onItemTap
			}
		});

		/* Link zur normalen View */
		this.normalView = new Ext.Panel({
			fullscreen: false,
			cls: 'normalView',
			html: 'Zur normalen Ansicht wechseln',
			listeners: {
				scope: this,
				click: { el: 'body', fn: this.onNormalView }
			}
		});

		/* Render Einkaufswelten, wenn der Store geladen ist */
		this.promotions.store.on({
			scope: this,
			load: function() { this.promotions.doLayout() }
		});

		/* Einkaufswelten auslesen */
		items = this.getPromotionItems(this.promotions.store);
		this.promotions.add(items);

		this.itms = [
			this.logo,
			this.promotions,
			this.list,
			this.normalView
		];

		/* Panel */
		this.pnl = new Ext.Panel({
			id: 'home',
			scroll: 'vertical',
			layout: {
				type: 'vbox',
				align:  'center'
			},
			items: [this.itms]
		});

		Ext.apply(this, {
			items: [ this.pnl ],
			dockedItems:[ this.toolBar ]
		});
		App.views.Shop.index.superclass.initComponent.call(this);
	},
	
	syncToolbar: function(card) {
		var active        = card || this.getActiveItem(),
			depth         = this.items.indexOf(active),
			backBtn       = this.backBtn,
			backToggleMth = (depth !== 0) ? 'show' : 'hide',
			title;

		if(active.title.length) {
			title = active.title;
		} else if(active.ownerCt.title.length) {
			title = active.ownerCt.title;
		}

		if(title.length) {
			this.toolBar.setTitle(title);
		}

		if(backBtn) {
			backBtn[backToggleMth]();
		}
	},

	onBackBtn: function() {
		var curr    = this.getActiveItem(),
			currIdx = this.items.indexOf(curr),
			me      = this;

		if(Ext.getCmp('detailSegBtn')) {
		    Ext.getCmp('detailSegBtn').destroy();
	    }

		if(currIdx != 1) {
			var prevDepth      = currIdx - 1,
				prev           = this.items.getAt(prevDepth);

			this.setActiveItem(prev, {
				type: 'slide',
				reverse: true,
				scope: this
			});
			this.syncToolbar(prev);

			window.setTimeout(function() {
				me.items.getAt(currIdx).destroy();
			}, 250);
		} else {
			var prev = this.items.getAt(0);
			this.setActiveItem(prev, {
				type: 'slide',
				reverse: true,
				scope: this
			});
			this.toolBar.hide();
			this.doComponentLayout();
		}
	},

	onItemTap: function(list, idx) {
		Ext.dispatch({
			controller: 'category',
			action: 'show',
			//historyUrl: 'category/'+ idx,
			index: idx,
			panel: this
		});
	},

	onSelectionChange: function(selModel, recs) {
		selModel.deselect(recs);
	},

	onNormalView: function() {
		window.location.href = App.RequestURL.useNormalSite;
	},

	getPromotionItems: function(store) {
		var items = [];
		store.each(function(rec) {
			items.push({
				html: '<div class="slideArticle"><div class="art_thumb" style="background-image: url(' + rec.get('img_url') + ')"></div><div class="name">' + rec.get('name') + '</div><div class="price">' + rec.get('price') + ' &euro;</div><div class="desc">' + rec.get('desc') + '</div></div>',
				cls: 'slideArticle'
			});
		});
		return items;
	}
});



App.views.Shop.artListing = Ext.extend(Ext.List, {
	id: 'artListing',
	store: App.stores.Listing,
	title: '',
	itemTpl: '<div class="image"<tpl if="image_url"> style="background-image:url({image_url})"</tpl>></div><strong>{articleName}</strong><span class="price">{price} &euro;</span><div class="desc">{description_long}</div>',
	listeners: {
		scope: this,
		activate: function(me) {
			me.scroller.scrollTo({
				x: 0,
				y: 0
			})
		},
		datachanged: function() {
			var me = Ext.getCmp('artListing');
			me.setLoading(false);
		},
		itemtap: function(me, idx) {
			var tmpRec = me.store.getAt(idx);
			Ext.dispatch({
				controller: 'detail',
				action: 'show',
				//historyUrl: 'detail/'+tmpRec.data.articleID,
				articleID: tmpRec.data.articleID,
				store: me.store,
				type: 'slide',
				direction: 'left'
			});
		}
	},
	
	initComponent: function() {
		this.store.on('changePage', this.onChangePage, this);

		this.pagination = new Ext.plugins.ListPagingPlugin({
			onPagingTap : function(e) {
				if (!this.loading) {
					this.loading = true;
					this.list.setLoading(true);
					this.list.scroller.setOffset({x: 0, y: 0}, 200);
					this.list.store.nextPage();
					this.el.addCls('x-loading');
					this.list.store.fireEvent('changePage');
				}
			}
		});
		Ext.apply(this, {
			//plugins: [this.pagination]
		});

		App.views.Shop.artListing.superclass.initComponent.call(this);
	},
	
	onChangePage: function() {
		var raw = this.store.proxy.reader.rawData, pagEl;
		if(raw.sNumberPages <= this.store.currentPage) {
			//.. remove plugin
		}
		this.setLoading(false);
	}

});

/* Subcategory list */
App.views.Shop.subListing = Ext.extend(Ext.NestedList, {
	id: 'subListing',
	store: App.stores.CategoriesTree,
	height:  '100%',
	displayField: 'text',
	updateTitleText: false,
	useToolbar: false,
	title: '',
	getItemTextTpl: function(node) {
		return '<div class="info"><span class="title">{text}</span></div>'
			+ '<tpl if="desc"><p class="desc">{desc}</p></tpl>';
	},
	listeners: {
		scope: this,
		itemtap: function(list, index, item) {
			var tmpRec = list.store.getAt(index);
			Ext.getCmp('shop').toolBar.setTitle(tmpRec.data.text);
		},
		leafitemtap: function(me, idx) {
			Ext.dispatch({
				controller: 'category',
				action: 'show',
				index: idx,
				store: me.store,
				panel: this,
				last: true
			});
		}
	},
	initComponent: function() {
		App.views.Shop.subListing.superclass.initComponent.call(this);
	}
});