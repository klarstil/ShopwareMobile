Ext.ns('App.views.Viewport', 'App.views.Shop', 'App.views.Search', 'App.views.Cart', 'App.views.Account', 'App.views.Info');

App.views.Viewport = Ext.extend(Ext.TabPanel, {
	fullscreen: true,
	id: 'viewport',
	cls: 'viewport',
	ui: 'dark',
	layout: 'card',
	cardSwitchAnimation: {
		type: 'slide',
		direction: 'left'
	},

	tabBar: {
		id: 'tabbar',
		dock: 'bottom',
		layout: {
			pack: 'center'
		}
	},

	initComponent: function () {
		Ext.apply(App.views, {
			shop:    new App.views.Shop.index,
			search:  new App.views.Search.index,
			cart:    new App.views.Cart.index,
			account: new App.views.Account.index,
			info:    new App.views.Info.index
		});

		Ext.apply(this, {
			items: [
				App.views.shop,
				App.views.search,
				App.views.cart,
				App.views.account,
				App.views.info
			]
		});
		this.constructor.superclass.initComponent.call(this);
	},

	getCartButton: function () {
		return this.tabBar.items.getAt(2)
	}
});

/*	MAIN SHOP PANEL
 -------------------------------------------- */
App.views.Shop.index = Ext.extend(Ext.Panel, {
	id: 'shop',
	title: 'Shop',
	iconCls: 'home',
	layout: 'card',
	initComponent: function () {
		Ext.apply(App.views, {
			home: new App.views.Shop.home
		});
		Ext.apply(this, {
			items: [
				App.views.home
			]
		});
		App.views.Shop.index.superclass.initComponent.call(this);
	}
});

/* Shop - Startseite */
App.views.Shop.home = Ext.extend(Ext.Panel, {
	id: 'home',
	scroll: 'vertical',
	layout: 'vbox',

	initComponent: function() {
		var me = this,
				items;

		/* Shoplogo */
		me.logo = new Ext.Panel({
			id: 'logo',
			scroll: false,
			autoHeight: true
		});

		/* Einkaufsweltencarousel */
		me.promotions = new Ext.Carousel({
			id: 'promotions',
			store: App.stores.Promotions,
			height: 150,
			width: '100%',
			direction: 'horizontal',
			style: 'border-bottom: 1px solid #c7c7c7'
		});

		/* Hauptkategorien */
		me.list = new Ext.List({
			id: 'categories',
			store: App.stores.Categories,
			scroll: false,
			itemTpl: '<strong>{name}</strong> <span class="count">({count} Artikel)</span><tpl if="desc"><div class="desc">{desc}</div></tpl>',
			listeners: {
				scope: this,
				selectionchange: function(selModel, recs) {
					selModel.deselect(recs);
				},
				itemtap: function(pnl, idx, el, event) {
					Ext.dispatch({
						controller: 'categories',
						action: 'show',
						idx: idx,
						store: App.stores.Categories,
						type: 'slide',
						direction: 'left'
					});
				}
			}
		});

		/* Render Einkaufswelten, wenn der Store geladen ist */
		me.promotions.store.on({
			scope: this,
			load: function() {
				me.promotions.doLayout();
			}
		});

		/* Einkaufswelten auslesen */
		items = this.getPromotionItems(me.promotions.store);
		me.promotions.add(items);

		Ext.apply(this, {
			items: [me.logo, me.promotions, me.list]
		});

		App.views.Shop.home.superclass.initComponent.call(this);
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

App.views.Shop.listing = Ext.extend(Ext.Panel, {
	id: 'listing',
	layout: 'fit',
	listeners: {
		scope: this,
		beforeactivate: function(me) {
			me.list.update('');
			me.list.setLoading(true);
		},
		activate: function(me) {
			me.list.update(me.list.store);
			me.list.refresh();
			me.list.setLoading(false);
		},
		deactivate: function(me) {
			me.destroy();
		}
	},

	initComponent: function() {
		var me = this;

		/* Kategorieliste */
		me.list = new Ext.List({
			id: 'listingList',
			store: App.stores.Listing,
			itemTpl: '<div class="image"<tpl if="image_url"> style="background-image:url({image_url})"</tpl>></div><strong>{articleName}</strong><span class="price">{price} &euro;</span><div class="desc">{description_long}</div>',
			listeners: {
				scope: this,
				activate: function(me) {
					me.scroller.scrollTo({
						x: 0,
						y: 0
					})
				},
				itemtap: function(me, idx) {
					Ext.dispatch({
						controller: 'detail',
						action: 'show',
						idx: idx,
						store: me.store,
						type: 'slide',
						direction: 'left'
					});
				}
			}
		});

		/* Kategorietoolbar - Back Button */
		me.backBtn = new Ext.Button({
			id: 'backBtn',
			text: 'Zur&uuml;ck',
			ui: 'back',
			scope: this,
			handler: me.onBackBtn
		});

		/* Kategorietoolbar */
		me.toolbar = new Ext.Toolbar({
			id: 'shop_toolbar',
			dock: 'top',
			items: [me.backBtn]
		});

		Ext.apply(me, {
			dockedItems: [me.toolbar],
			items: [me.list]
		});

		App.views.Shop.listing.superclass.initComponent.call(me);
	},

	onBackBtn: function() {
		try {
			this.ownerCt.layout.prev({
				type: 'slide',
				direction: 'right'
			});
		} catch(err) {
			Ext.getCmp('shop').setActiveItem('home', {direction: 'right', type: 'slide'});
		}
	}
});

/* Detail */
App.views.Shop.detail = Ext.extend(Ext.Panel, {
	id: 'detail',
	layout: 'card',
	listeners: {
		scope: this,
		deactivate: function(me) {
			me.destroy();
		}
	},
	initComponent: function() {
		var me = this;
		
		/* Backbutton */
		me.backBtn = new Ext.Button({
			id: 'detailBackBtn',
			text: 'Zur&uuml;ck',
			ui: 'back',
			scope: this,
			handler: me.onBackBtn
		});

		/* Navigationsbutton */
		me.navBtn = new Ext.SegmentedButton({
			id: 'detailSegBtn',
			allowMultiple: false,
			ui: 'light',
			items: [
				{
					text: 'Detail',
					pressed: true
				},
				{
					text: 'Kommentare'
				},
				{
					text: 'Bilder'
				}
			],
			listeners: {
				scope: this,
				toggle: me.onNavBtn
			}
		});

		/* Toolbar */
		me.toolbar = new Ext.Toolbar({
			dock: 'top',
			id: 'detailToolbar',
			items: [
				me.backBtn,
				{ xtype: 'spacer' },
				me.navBtn
			]
		});

		Ext.apply(me, {
			dockedItems: [me.toolbar]
		});

		App.views.Shop.detail.superclass.initComponent.call(me);
	},

	getToolbar: function() {
		return Ext.getCmp('detailToolbar');
	},

	onBackBtn: function() {
		Ext.dispatch({
			controller: 'categories',
			action: 'show',
			store: App.stores.Listing,
			type: 'slide',
			direction: 'right'
		})
	},

	onNavBtn: function(pnl, btn, pressed) {
		if (pressed === true) {
			if (btn.text === 'Detail') {
				Ext.dispatch({
					controller: 'detail',
					action: 'showInfo'
				});

				Ext.getCmp('detail').setActiveItem('teaser', 'fade');
			}
			if (btn.text === 'Kommentare') {
				Ext.dispatch({
					controller: 'detail',
					action: 'showComments'
				});
				Ext.getCmp('detail').setActiveItem('votes', 'fade');
			}
			if (btn.text === 'Bilder') {
				Ext.dispatch({
					controller: 'detail',
					action: 'showPictures'
				})
			}
		}
	}
});

/* Detailseite */
var interval;
App.views.Shop.info = Ext.extend(Ext.Panel, {
	id: 'teaser',
	layout: 'vbox',
	scroll: 'vertical',
	autoHeight: true,
	listeners: {
		scope: this,
		beforeactivate: function(me) {
			me.setLoading(true);
		},
		activate: function(me) {
			me.info.refresh();
			me.desc.refresh();
			me.bundle.refresh();
			me.doLayout();
			me.setLoading(false);
		},
		deactivate: function(me) {
			clearInterval(interval);
			me.destroy();
		}
	},
	
	initComponent: function() {
		var me = this, store = App.stores.Detail, tpl = App.views.Shop;

		/* Infopanel mit Bild */
		me.info = new Ext.DataView({
			store: store,
			tpl: tpl.detailTpl,
			scroll: false,
			autoWidth: true,
			height: '200px',
			itemSelector: '.image',
			listeners: {
				scope: this,
				el: {
					tap: me.onImageTap,
					delegate: '.image'
				}
			}
		});

		store.on({
			datachanged: me.onDataChanged,
			scope: this
		});

		// Hidden Bestellnummer
		me.ordernumber = new Ext.form.Hidden({
			name: 'sOrdernumber'
		});

		// Anzahl spinner
		me.spinner = new Ext.form.Spinner({
			value: 1,
			label: 'Anzahl',
			required: true,
			xtype: 'spinnerfield',
			minValue: 1,
			maxValue: 100,
			cycle: false,
			name: 'sQuantity'
		});

		// Form Panel
		me.formPnl = new Ext.form.FormPanel({
			id: 'formPnl',
			width: '100%',
			items: [
				{
					id: 'buyFieldset',
					xtype: 'fieldset',
					defaults: {
						labelWidth: '50%'
					},
					items: [me.ordernumber, me.spinner]
				}
			]
		});

		// Bestellbutton
		me.buyBtn = new Ext.Button({
			id: 'buyBtn',
			ui: 'confirm round',
			text: 'In den Warenkorb legen',
			scope: this,
			handler: me.onBuyBtn,
			height: '33px'
		});

		// Bundle Support
		me.bundle = new Ext.DataView({
			store: store,
			tpl: tpl.bundleTpl,
			itemSelector: '#bundleBtn',
			scroll: false,
			width: '100%',
			autoHeight: '100%',
			style: 'margin-top: 1em',
			listeners: {
				scope: this,
				el: {
					delegate: '#bundleBtn',
					tap: me.onBundleBtn
				}
			}
		});

		// Beschreibung
		me.desc = new Ext.DataView({
			store: store,
			tpl: tpl.descTpl,
			scroll: false,
			autoWidth: true,
			itemSelector: '.desc'
		});

		Ext.apply(me, {
			items: [
				me.info,
				me.formPnl,
				me.buyBtn
			]
		});

		App.views.Shop.info.superclass.initComponent.call(this);

		if(!store.isLoading()) {
			var item = store.getAt(0), data = item.data;

			// Check for bundle
			if(!Ext.isEmpty(data.sBundles)) {
				me.add(me.bundle);
			}

			// Check for liveshopping
			if(!Ext.isEmpty(data.liveshoppingData)) {
				App.Helpers.server.init(timeNow);
				interval = App.Helpers.liveshopping.init(data.liveshoppingData);
			}

			// Add desc
			me.add(me.desc);
		}
	},

	onDataChanged: function(store) {
		var me = this, item = store.getAt(0), data = item.data.liveshoppingData;

		// Check for bundle
		if(!Ext.isEmpty(item.data.sBundles)) {
			me.add(me.bundle);
		}

		// Check for liveshopping
		if(!Ext.isEmpty(item.data.liveshoppingData)) {
			App.Helpers.server.init(timeNow);
			interval = App.Helpers.liveshopping.init(data);
		}

		me.add(me.desc);
		me.doLayout();
	},

	onBundleBtn: function() {
		var me = this, store = App.stores.Detail;
		var item = store.getAt(0);
		var bundle = item.data.sBundles
		App.stores.Cart.addBundle(item.data.ordernumber, bundle[0].id);
	},

	onBuyBtn: function() {
		var buyPnl = new App.views.Shop.buyPnl
		Ext.getCmp('detail').add(buyPnl);
		Ext.getCmp('detail').setActiveItem(buyPnl, { type: 'cube' })
	},

	onImageTap: function() {
		Ext.dispatch({
			controller: 'detail',
			action: 'showPictures'
		})
	}
});

App.views.Shop.buyPnl = Ext.extend(Ext.Panel, {
	id: 'buyPnl',
	scroll: 'vertical',
	standardSubmit: false,
	listeners: {
		scope: this,
		beforeactivate: function(me) {
			me.setLoading(true);
			Ext.getCmp('detailSegBtn').hide();
		},
		activate: function(me) {
			me.setLoading(false);
		},
		deactivate: function(me) {
			me.destroy();
			Ext.getCmp('detailSegBtn').show();
			Ext.getCmp('detailBackBtn').setHandler(Ext.getCmp('detail').onBackBtn);
		},
	},
	initComponent: function() {
		var me = this,
				store = App.stores.Detail,
				rec = store.getAt(0),
				options = [];

		// Handle toolbar
		Ext.getCmp('detailBackBtn').setHandler(me.onBackBtn, me);

		// Hidden Bestellnummer
		me.ordernumber = new Ext.form.Hidden({
			name: 'sOrdernumber',
			value: rec.get('ordernumber')
		});

		// Anzahl spinner
		me.spinner = new Ext.form.Spinner({
			value: 1,
			label: 'Anzahl',
			required: true,
			xtype: 'spinnerfield',
			minValue: 1,
			maxValue: 100,
			cycle: false,
			name: 'sQuantity'
		});

		// Form panel
		me.formPnl = new Ext.form.FormPanel({
			id: 'formPnl',
			items: [
				{
					id: 'buyFieldset',
					xtype: 'fieldset',
					title: 'Artikel hinzuf&uuml;gen',
					defaults: {
						labelWidth: '50%',
					},
					items: [me.ordernumber, me.spinner]
				}
			]
		});
		
		// Variant support
		if (!Ext.isEmpty(rec.data.sVariants)) {

			// Hauptvariante
			options.push({
				text: rec.data.additionaltext,
				value: rec.data.ordernumber
			});

			for(var idx in rec.data.sVariants) {
				var item = rec.data.sVariants[idx];
				options.push({
					text: item.additionaltext,
					value: item.ordernumber
				});
			}
			me.variant = new Ext.form.Select({
				label: 'Bitte w&auml;hlen',
				required: true,
				options: options,
				name: 'sAdd'
			});
			Ext.getCmp('buyFieldset').add(me.variant);
		}

		// Konfigurator support
		if(!Ext.isEmpty(rec.data.sConfigurator)) {
			var groupIdx = 1;
			var configurator = rec.data.sConfigurator;
			var options = [];
			Ext.each(configurator, function(group, groupID) {

				// Collect options
				for(var idx in group.values) {
					var item =  group.values[idx];

					options.push({
						text: item.optionname,
						value: item.optionID
					});
				}
				var fieldset = new Ext.form.FieldSet({
					title: group.groupname,
					instructions: group.groupdescription,
					items: [{
						xtype: 'selectfield',
						options: options,
						name: 'group['+groupIdx+']'
					}]
				});
				me.formPnl.add(fieldset);
				groupIdx++;
			});
		}

		me.buyBtn = new Ext.Button({
			ui: 'confirm rounded',
			text: 'In den Warenkorb legen',
			style: 'margin: 0 1em',
			handler: me.onBuyBtn
		});

		Ext.apply(me, {
			items: [me.formPnl, me.buyBtn]
		});
		App.views.Shop.buyPnl.superclass.initComponent.call(me);
	},

	onBackBtn: function(scope) {
		Ext.dispatch({
			controller: 'detail',
			action: 'showInfo'
		});
		Ext.getCmp('detail').setActiveItem('teaser', { type: 'cube', direction: 'right'});
	},

	onBuyBtn: function() {
		var values = Ext.getCmp('formPnl').getValues();
		App.stores.Cart.add(values);

		Ext.dispatch({
			controller: 'detail',
			action: 'showInfo'
		});
		Ext.getCmp('detail').setActiveItem('teaser', { type: 'cube', direction: 'right'});
	}
});

/* Comments view */
App.views.Shop.comments = Ext.extend(Ext.Panel, {
	id: 'votes',
	layout: 'vbox',
	scroll: 'vertical',
	listeners: {
		scope: this,
		beforeactivate: function(me) {
			me.setLoading(true);
		},
		activate: function(me) {
			me.setLoading(false);
		},
		deactivate: function(me) {
			me.destroy();
		}
	},
	initComponent: function() {
		var me = this;

		// Comment view
		me.commentsView = new App.views.Shop.commentsView;

		// Comment form
		me.commentForm = new App.views.Shop.commentForm;

		Ext.apply(me, {
			items: [me.commentsView, me.commentForm]
		})

		App.views.Shop.comments.superclass.initComponent.call(me);
	}
});

App.views.Shop.commentsView = Ext.extend(Ext.DataView, {
	id: 'commentsView',
	store: App.stores.Detail,
	scroll: false,
	tpl: App.views.Shop.commentsTpl,
	itemSelector: '.headline',
	emptyText: 'Super Ingo',
	initComponent:  function() {
		var me = this;

		me.store.on({
			datachanged: me.onDataChanged,
			scope: this
		});
		me.update(me.store);

		App.views.Shop.commentsView.superclass.initComponent.call(me);
	},

	onDataChanged: function() {
		this.update(this.store);
		this.refresh();
	},

	update: function(store) {
		if (store) {
			var item = store.getAt(0);
			if (item.data.sVoteComments.length > 0) {
				this.tpl = App.views.Shop.commentsTpl;
			} else {
				this.tpl = App.views.Shop.emptyTpl;
			}
		}
		App.views.Shop.commentsView.superclass.update.apply(this, arguments);
	}
});

App.views.Shop.commentForm = Ext.extend(Ext.form.FormPanel, {
	id: 'commentForm',
	width: '100%',
	items: [{
		xtype: 'fieldset',
		title: 'Kommentar abgeben',
		defaults: { labelWidth: '40%' },
		items: [
			{
				xtype: 'textfield',
				label: 'Name',
				required: true,
				placeHolder: 'Max Mustermann',
				name: 'sVoteName'
			}, {
				xtype: 'emailfield',
				label: 'E-Mail',
				required: true,
				placeHolder: 'me@shopware.ag',
				name: 'sVoteMail'
			}, {
				xtype: 'textfield',
				label: 'Titel',
				required: true,
				placeHolder: 'Sch&ouml;nes Produkt',
				name: 'sVoteSummary'
			}, {
				xtype: 'selectfield',
				label: 'Bewertung',
				required: true,
				name: 'sVoteStars',
				options: [
					{text: '10 sehr gut', value: '10'},
					{text: '9', value: '9'},
					{text: '8', value: '8'},
					{text: '7', value: '7'},
					{text: '6', value: '6'},
					{text: '5', value: '5'},
					{text: '4', value: '4'},
					{text: '3', value: '3'},
					{text: '2', value: '2'},
					{text: '1 sehr schlecht', value: '1'}
				]
			}, {
				xtype: 'textareafield',
				label: 'Ihre Meinung',
				required: true,
				name: 'sVoteComment'
			}
		]
	}, {
		xtype: 'button',
		id: 'voteBtn',
		ui: 'confirm round',
		text: 'Bewertung abgeben',
		handler: function() {
			var me = Ext.getCmp('commentForm'),
			    store = App.stores.Detail,
			    item = store.getAt(0),
			    articleID = store.data.items[0].data.articleID
				values = me.getValues(true);

			values.articleID = articleID;

			App.Helpers.postRequest(App.RequestURL.addComment, values, function(data) {
				Ext.Msg.alert('Erfolg', 'Ihr Kommentar wurde erfolgreich hinzugef&uuml;gt');
				store.load({
					params: {
						articleID: articleID
					}
				});
			});
		}
	}],

	initComponent: function() {
		App.views.Shop.commentForm.superclass.initComponent.call(this);
	}
});

/* Picture view */
var lastpinch = 75;
App.views.Shop.pictures = Ext.extend(Ext.Carousel, {
	id: 'pictures',
	direction: 'horizontal',
	listeners: {
		scope: this,
		beforeactivate: function(me) {
			me.setLoading(true);
		},
		activate: function(me) {
			me.setLoading(false);
		},
		deactivate: function(me) {
			me.destroy();
		}
	},
	initComponent: function() {
		var me = this, items = [], data = App.stores.Picture.data.items;

		// Get Images
		Ext.each(data, function(item, idx) {
			var htmlContent = '<div class="tapImage"><img width="'+lastpinch+'%" src="'+item.get('big_picture')+'"/></div>';
			if(!Ext.isEmpty(item.get('desc'))) {
				htmlContent += '<div class="description">'+item.get('desc')+'</div>';
			}
			items[idx] = new Ext.Panel({
				html: htmlContent,
				cls: 'slide_image',
				scroll: false,
				listeners: {
					scope: this,
					el: {
						delegate: '.tapImage',
						pinch: me.onPinch,
						doubletap: me.onDblTap
					}
				}
			});
		});

		Ext.apply(me, {
			items: [items]
		});
		me.doLayout();

		App.views.Shop.pictures.superclass.initComponent.call(this);
	},

	onPinch: function(obj) {
		var me = this;
		var element = this.query('img');
		var active = Ext.getCmp('pictures').getActiveItem();
		Ext.each(element, function(el) {

			// Calculate zoom value based on deltaScale
			lastpinch = lastpinch + (obj.deltaScale * 10);
			if(lastpinch >= 75) {
				if(lastpinch <= 120) {
					el.setAttribute('width', lastpinch + '%');
				} else {
					lastpinch = 120;
				}
			} else {
				lastpinch = 75;
			}
		});
	},

	onDblTap: function() {
		var active = Ext.getCmp('pictures').getActiveItem();
		if(lastpinch < 75) {
			return;
		}
		var element = this.query('img');
		Ext.each(element, function(el) {
			lastpinch = 75;
			el.setAttribute('width', lastpinch + '%');
		});
	}
});

/*	MAIN SEARCH PANEL	
 -------------------------------------------- */
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

/*	SEARCH PANEL - TOOLBAR	
 -------------------------------------------- */
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
	},
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

/*	MAIN CART PANEL	
 -------------------------------------------- */
App.views.Cart.index = Ext.extend(Ext.Panel, {
	id: 'cart',
	title: 'Warenkorb',
	iconCls: 'cart',
	autoHeight: true,
	scroll: 'vertical',
	initComponent: function() {

		this.toolbar = new Ext.Toolbar({
			dock: 'top',
			title: this.title
		});

		this.checkoutBtn = new Ext.Button({
			id: 'checkout',
			ui: 'confirm',
			text: 'Zur Kasse gehen',
			disabled: true,
			style: 'margin: 0.5em'
		});

		Ext.apply(this, {
			dockedItems: [this.toolbar],
			items: [new App.views.Cart.list, this.checkoutBtn]
		});
		App.views.Cart.index.superclass.initComponent.call(this);
	}
});

App.views.Cart.list = Ext.extend(Ext.Panel, {
	id: 'cartlist',
	scroll: 'vertical',
	layout: 'fit',
	autoHeight: true,
	flex: 1,
	initComponent: function() {

		Ext.apply(this, {
			tpl: App.views.Cart.indexTpl,
			data: App.stores.Cart,
			store: App.stores.Cart,
			autoHeight: true,
			scroll: false,
			listeners: {
				el: {
					tap: this.onDeleteBtn,
					delegate: '.deleteBtn',
					scope: this
				},
				scope: this
			}
		});

		this.store.on({
			datachanged: this.onDataChanged,
			scope: this
		});

		App.views.Cart.list.superclass.initComponent.call(this);
	},

	onDataChanged: function(store) {
		this.update(this.store);
	},

	update: function (store) {
		if (store.items.length) {
			this.tpl = App.views.Cart.indexTpl;
			this.hideCheckoutBtn(false);
		} else {
			this.tpl = App.views.Cart.emptyTpl;
			this.hideCheckoutBtn(true);
		}
		App.views.Cart.list.superclass.update.apply(this, arguments);
	},

	onDeleteBtn: function(event, el) {
		var el = Ext.get(el), val;
		val = el.dom.attributes[1].nodeValue;
		App.stores.Cart.remove(val);
		return false;
	},

	hideCheckoutBtn: function(state) {
		var btn = Ext.getCmp('checkout');
		if (state === true) {
			btn.hide()
		} else {
			btn.show();
		}
	}
});

/*	MAIN ACCOUNT PANEL	
 -------------------------------------------- */
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
					required: true,
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
					required: true,
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

/*	MAIN INFO PANEL	
 -------------------------------------------- */
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
	},
});

App.views.Info.Detail = Ext.extend(Ext.Panel, {
	id: 'infoDetail',
	height: '100%',
	scroll: 'vertical'
});