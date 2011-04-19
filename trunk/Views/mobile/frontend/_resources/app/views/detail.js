/**
 * ----------------------------------------------------------------------
 * detail.js
 *
 * Views fuer die Artikeldetailseite
 * ----------------------------------------------------------------------
 */
Ext.ns('App.views.Viewport', 'App.views.Shop', 'App.views.Search', 'App.views.Cart', 'App.views.Account', 'App.views.Info');
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
			controller: 'category',
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
		}
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
						labelWidth: '50%'
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

/* Comments views */
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

		// Comment views
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

/* Picture views */
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