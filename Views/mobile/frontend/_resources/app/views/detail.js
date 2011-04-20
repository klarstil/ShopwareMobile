/**
 * ----------------------------------------------------------------------
 * detail.js
 *
 * View for the article details page
 *
 * @link http://www.shopware.de
 * @author S.Pohl <stp@shopware.de>
 * ----------------------------------------------------------------------
 */

Ext.ns('App.views.Viewport', 'App.views.Shop', 'App.views.Search', 'App.views.Cart', 'App.views.Account', 'App.views.Info');

/**
 * Main Detail Panel
 * Contains the three different sections (e.g. Detail, Comments, Pictures)
 */
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

	/**
	 * getToolbar
	 *
	 * Returns the detail toolbar
	 */
	getToolbar: function() {
		return Ext.getCmp('detailToolbar');
	},

	/**
	 * onBackBtn - event handler
	 *
	 * Handles the back button
	 */
	onBackBtn: function() {
		App.stores.Detail.clearListeners();
		Ext.dispatch({
			controller: 'category',
			action: 'show',
			store: App.stores.Listing,
			type: 'slide',
			direction: 'right'
		})
	},

	/**
	 * onNavBtn - event handler
	 *
	 * Handles the segmented button to change the section
	 *
	 * @param pnl
	 * @param btn
	 * @param pressed
	 */
	onNavBtn: function(pnl, btn, pressed) {
		if (pressed === true) {
			if (btn.text === 'Detail') {
				Ext.dispatch({
					controller: 'detail',
					action: 'showInfo',
					refresh: true
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

/**
 * Detail view
 *
 * Contains the basic article informations
 */
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
			me.formPnl.doLayout();
			me.setLoading(false);
		},
		deactivate: function(me) {
			App.stores.Detail.clearListeners();
			clearInterval(interval);
			me.destroy();
		}
	},

	initComponent: function() {
		var me = this, store = App.stores.Detail, tpl = App.views.Shop;

		/* Teaser Panel with main picture */
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
			scope: this,
			storeLoaded: me.onStoreLoaded
		});
		
		/* Amount spinner */
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

		/* "Buy now" form panel */
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
					items: [me.spinner]
				}
			]
		});

		/* "Buy now"-Button */
		me.buyBtn = new Ext.Button({
			id: 'buyBtn',
			ui: 'confirm round',
			text: 'In den Warenkorb legen',
			scope: this,
			handler: me.onBuyBtn,
			height: '33px'
		});

		/* Bundle support */
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

		/* Article description */
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
	},

	/**
	 * onStoreLoaded - Event handler
	 *
	 * Handles the different article types and creates the needed elements (e.g. variants, configurator, bundles)
	 */
	onStoreLoaded: function() {
		console.log('view onStoreLoaded');
		var me = this, store = App.stores.Detail, item = store.getAt(0), data = item.data.liveshoppingData;
		me._item = item;
		
		/* Create hidden input field */
		me.buildOrdernumber(item);

		/* If needed, add bundle view */
		if(!Ext.isEmpty(item.data.sBundles)) {
			me.add(me.bundle);
		}

		/* If needed, add variant select box */
		if(!Ext.isEmpty(item.data.sVariants)) {
			me.buildVariantField(item);
		}

		/* If needed, add configurator fieldset(s) */
		if(!Ext.isEmpty(item.data.sConfigurator)) {
			me.buildConfigurator(item);
		}

		/* If needed, add live-shopping functionality */
		if(!Ext.isEmpty(item.data.liveshoppingData)) {
			App.Helpers.server.init(timeNow);
			interval = App.Helpers.liveshopping.init(data);
		}

		me.add(me.desc);
		me.doLayout();
	},

	/**
	 * onBundleBtn - Event handler
	 *
	 * Adds bundle articles to cart
	 */
	onBundleBtn: function() {
		var store = App.stores.Detail,
			item = store.getAt(0),
			bundle = item.data.sBundles;


		App.stores.Cart.addBundle(item.data.ordernumber, bundle[0].id);
	},

	/**
	 * onBuyBtn - Event handler
	 *
	 * Adds an article to cart
	 *
	 */
	onBuyBtn: function() {
		var values = Ext.getCmp('formPnl').getValues();
		App.stores.Cart.add(values);
		//var buyPnl = new App.views.Shop.buyPnl
		//Ext.getCmp('detail').add(buyPnl);
		//Ext.getCmp('detail').setActiveItem(buyPnl, { type: 'cube' })
	},

	/**
	 * onImageTap - Event handler
	 *
	 * Calls an controller action
	 */
	onImageTap: function() {
		Ext.dispatch({
			controller: 'detail',
			action: 'showPictures'
		})
	},

	/**
	 * buildVariantField
	 *
	 * Builds the needed form field for variant articles
	 *
	 * @param item - Store article data
	 */
	buildVariantField: function(item) {
		var me = this;
		var options = [];

		/* Main variant */
		options.push({
			text: item.data.additionaltext,
			value: item.data.ordernumber
		});

		for(var idx in item.data.sVariants) {
			var varArticle = item.data.sVariants[idx];
			options.push({
				text: varArticle.additionaltext,
				value: varArticle.ordernumber
			});
		}
		me.variant = new Ext.form.Select({
			label: 'Bitte w&auml;hlen',
			required: true,
			options: options,
			name: 'sAdd'
		});
		Ext.getCmp('buyFieldset').add(me.variant);
	},

	/**
	 * buildConfigurator
	 *
	 * Builds the needed form elements for configurator articles
	 *
	 * @param rec - Store article data
	 */
	buildConfigurator: function(rec) {
		var me = this, groupIdx = 1, configurator = rec.data.sConfigurator, options = [];
		Ext.each(configurator, function(group) {

			/* Collection options */
			for(var idx in group.values) {
				var item =  group.values[idx];

				options.push({
					text: item.optionname,
					value: item.optionID
				});
			}
			
			var fieldset = new Ext.form.FieldSet({
				cls: 'configuratorFieldset',
				title: group.groupname,
				instructions: group.groupdescription,
				items: [{
					xtype: 'selectfield',
					options: options,
					name: 'group['+groupIdx+']',
					listeners: {
						scope: this,
						change: me.onConfiguratorChange
					}
				}]
			});
			Ext.getCmp('formPnl').add(fieldset);
			groupIdx++;
			options = [];
		});
	},

	/**
	 * buildOrdernumber
	 *
	 * Creates an hidden input field - needed
	 *
	 * @param item
	 */
	buildOrdernumber: function(item) {
		var ordernumber = new Ext.form.Hidden({
			id: 'hiddenOrdernumber',
			name: 'sOrdernumber',
			value: item.data.ordernumber
		});
		Ext.getCmp('formPnl').add(ordernumber);
	},

	/**
	 * onConfiguratorChange - Event handler
	 *
	 * Handles the configuration of an configurator article
	 *
	 * @param select
	 * @param val
	 */
	onConfiguratorChange: function(select, val) {
		var store  = App.stores.Detail,
			item   = store.getAt(0),
			configurator = item.data.sConfigurator,
			groupId, active;

		groupId = parseInt(select.name.match(/[0-9]/i));
		configurator = configurator[(groupId - 1)];
		active = configurator.values[val];
		
		if(active && active.ordernumber) {
			Ext.getCmp('hiddenOrdernumber').setValue(active.ordernumber);
		} else {
			Ext.getCmp('hiddenOrdernumber').setValue(item.data.ordernumber);
		}
	}
});

/**
 * Comments Main view
 * Contains the different elements/views for the article comments
 */
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
		Ext.apply(this, {
			items: [
				new App.views.Shop.commentsView,
				new App.views.Shop.commentForm
			]
		});

		App.views.Shop.comments.superclass.initComponent.call(this);
	}
});

/**
 * Comments View
 * Lists the user comments for an specific article
 */
App.views.Shop.commentsView = Ext.extend(Ext.DataView, {
	id: 'commentsView',
	store: App.stores.Detail,
	scroll: false,
	height: '100%',
	tpl: App.views.Shop.commentsTpl,
	itemSelector: '.headline',
	initComponent:  function() {
		var me = this;

		me.store.on({
			datachanged: me.onDataChanged,
			scope: this
		});
		me.update(me.store);

		App.views.Shop.commentsView.superclass.initComponent.call(me);
	},

	/**
	 * onDataChanged - Event handler
	 *
	 * Updates store and refresh the layout
	 */
	onDataChanged: function() {
		this.update(this.store);
		this.refresh();
	},

	/**
	 * update - Event handler
	 *
	 * Pre dispatch the default update function
	 *
	 * @param store
	 */
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

/**
 * Comment Form
 * Allows the user to create a comment for a specific article
 */
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
			    articleID = store.data.items[0].data.articleID,
				values = me.getValues(true);

			values.articleID = articleID;

			App.Helpers.postRequest(App.RequestURL.addComment, values, function() {
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

/**
 * Picture View
 * Creates an carousel, which contains all article pictures
 */
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

	/**
	 * onPinch - Event handler
	 *
	 * Resize the current picture through a pinch gesture
	 *
	 * @param obj
	 */
	onPinch: function(obj) {
		var element = this.query('img');
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

	/**
	 * onDblTap - Event handler
	 *
	 * Resize the current picture to a specific value
	 */
	onDblTap: function() {
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