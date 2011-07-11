<script type="text/javascript">
/**
 * @file shop.js
 * @link http://www.shopware.de
 * @author S.Pohl <stp@shopware.de>
 * @date 11-05-11
 */
Ext.ns('App.views.Viewport', 'App.views.Shop', 'App.views.Search', 'App.views.Cart', 'App.views.Account', 'App.views.Info', 'App.views.Checkout');

/**
 * Shop Main view
 *
 * @access public
 * @class
 * @extends Ext.Panel
 */
App.views.Shop.index = Ext.extend(Ext.Panel,
/** @lends App.views.Shop.index# */
{
	id: 'shop',
	title: '{s name="MobileShopTitle"}Shop{/s}',
	iconCls: 'home',
	layout: 'card',
	listeners: {
		scope: this,

		activate: function(me) {
			me.setLoading(false);
			var active = me.getActiveItem();

			if(active.id = 'detail' && Ext.getCmp('teaser')) {
				var teaser = Ext.getCmp('teaser');
				teaser.info.refresh();
				teaser.desc.refresh();
				teaser.bundle.refresh();
				teaser.formPnl.doLayout();
				teaser.doLayout();
			}
		}

	},

	initComponent: function () {
		var items;

		/** Back button */
		this.backBtn = new Ext.Button({
			ui: 'back',
			text: 'Start...',
			scope: this,
			handler: this.onBackBtn,
			hidden: true
		});

		/** Toolbar */
		this.toolBar = new Ext.Toolbar({
			title: 'Master',
			items: [this.backBtn],
			hidden: true,
			width: '100%'
		});

		/** Shop logo */
		this.logo = new Ext.Panel({
			id: 'logo',
			scroll: false,
			autoHeight: true
		});

		/** Promotions */
		this.promotions = new Ext.Carousel({
			id: 'promotions',
			store: App.stores.Promotions,
			height: 150,
			width: '100%',
			direction: 'horizontal',
			listeners: {
				scope: this,
				orientationchange: function(me, orientation, width, height) {
					me.setWidth(width);
					me.doComponentLayout();
				},
				el: {
					tap: function(event,el) {
						el = Ext.get(el);
						Ext.dispatch({
							controller: 'detail',
							action: 'show',
							articleID: el.getAttribute('data-articleid')
						});
					},
					delegate: '.slideArticle'
				}
			}
		});

		/** Main categories */
		this.list = new Ext.List({
			id: 'categories',
			store: App.stores.Categories,
			scroll: false,
			height: '100%',
			width: '100%',
			style: 'border-top: 1px solid #c7c7c7',
			itemTpl: Ext.XTemplate.from('MainCategorylistTpl'),
			listeners: {
				scope: this,
				selectionchange: this.onSelectionChange,
				itemtap: this.onItemTap
			}
		});

		/** Link to the normal version */
		this.normalView = new Ext.Panel({
			fullscreen: false,
			id: 'normalView',
			cls: 'normalView',
			hidden: (Ext.isEmpty(useNormalSite)) ? true : false,
			items: [{
				html: '<div id="clickNormal">{s name="MobileShopNormalViewTitle"}Zur normalen Ansicht wechseln{/s}</div>'
			}],
			listeners: {
				scope: this,
				el: {
					tap: this.onNormalView,
					delegate: '#clickNormal'
				}
			}
		});

		this.starNotice = new Ext.Component({
			style: 'height: 45px',
			html: '<div class="priceNotice x-form-fieldset-instructions">{s name="MobileShopPriceNoticeText"}* Alle Preise inkl. gesetzl. Mehrwertsteuer zzgl. Versandkosten und ggf. Nachnahmegebühren, wenn nicht anders beschrieben{/s}</div>'
		});

		/** Renders the promotion carousel after the store has changes */
		this.promotions.store.on({
			scope: this,
			load: function() { this.promotions.doLayout() }
		});

		/** Get promotion articles */
		items = this.getPromotionItems(this.promotions.store);
		if(items.length) {
			this.promotions.add(items);
		} else {
			this.promotions.hide();
		}

		this.itms = [
			this.logo,
			this.promotions,
			this.list,
			this.normalView,
			this.starNotice
		];

		/** Main view panel */
		this.pnl = new Ext.Panel({
			id: 'home',
			listeners: {
				scope: this,
				activate: function(me) {
					me.setLoading(false);
				}
			},
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

    /**
     * Handles the toolbar
     *
     * @param card
     */
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

    /**
     * Event handler
     */
	onBackBtn: function() {
		var curr    = this.getActiveItem(),
			currIdx = this.items.indexOf(curr),
			me      = this;

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
			var prev = this.items.getAt(0),
				last = this.items.getAt(1);
			this.setActiveItem(prev, {
				type: 'slide',
				reverse: true,
				scope: this
			});
			if(last) {
				last.destroy();
			}
			this.toolBar.hide();
			this.doComponentLayout();
		}

	},

    /**
     * Event handler
     *
     * @param list
     * @param idx
     */
	onItemTap: function(list, idx) {
		Ext.dispatch({
			controller: 'category',
			action: 'show',
			//historyUrl: 'category/'+ idx,
			index: idx,
			panel: this
		});
	},

    /**
     * Event handler
     *
     * @param selModel
     * @param recs
     */
	onSelectionChange: function(selModel, recs) {
		selModel.deselect(recs);
	},

    /**
     * Event handler
     */
	onNormalView: function() {
		window.location.href = App.RequestURL.useNormalSite;
	},

    /**
     * Creates the items for the promotions carousel
     *
     * @param store
     */
	getPromotionItems: function(store) {
		var items = [];
		store.each(function(rec) {
			items.push({
				html: '<div class="slideArticle" data-articleid="'+rec.get('articleID')+'"><div class="art_thumb" style="background-image: url(' + rec.get('img_url') + ')"></div><div class="name">' + rec.get('name') + '</div><div class="price">' + rec.get('price') + ' &euro;*</div><div class="desc">' + rec.get('desc') + '</div></div>',
				cls: 'slideArticle'
			});
		});
		return items;
	}
});

/**
 * Article listing view without subcategories
 *
 * @access public
 * @class
 * @extends Ext.Panel
 */
App.views.Shop.artListing = Ext.extend(Ext.Panel,
/** @lends App.views.Shop.artListing# */
{
	id: 'artListing',
	title: '',
	scroll: 'vertical',
	height: '100%',
	listeners: {
		scope: this,
		activate: function(me) {
			me.scroller.scrollTo({
				x: 0,
				y: 0
			})
		}
	},

	initComponent: function() {

		this.list = new Ext.List({
			id: 'articleListingList',
			store: App.stores.Listing,
			itemTpl: Ext.XTemplate.from('CategorieslistTpl'),
			scroll: false,
			height: '100%',
			plugins: [new Ext.ux.touch.PagingToolbar],
			listeners: {
				scope: this,
				datachanged: function(me) {
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
			}
		});

		this.starNotice = new Ext.Container({
			html: '<div class="priceNotice x-form-fieldset-instructions">{s name="MobileShopPriceNoticeText"}* Alle Preise inkl. gesetzl. Mehrwertsteuer zzgl. Versandkosten und ggf. Nachnahmegebühren, wenn nicht anders beschrieben{/s}</div>'
		});

		this.banner = new Ext.Panel({
			id: 'banner',
			height: '100%'
		});
		this.list.store.on('checkBanner', this.checkForBanner, this);

		if(!Ext.getCmp('filterBtn')) {
			this.filterBtn = new Ext.Button({
				id: 'filterBtn',
				ui: 'plain',
				iconCls: 'compose',
				iconMask: true,
				scope: this,
				handler: this.onFilterBtn
			});
			Ext.getCmp('shop').toolBar.add({ xtype: 'spacer' }, this.filterBtn);
		}

		Ext.apply(this, {
			items: [this.banner, this.list, this.starNotice]
		});

		App.views.Shop.artListing.superclass.initComponent.call(this);
	},

    /**
     * Event handler
     */
	onFilterBtn: function() {
		var filterView = new App.views.Shop.filterView;
		Ext.getCmp('shop').add(filterView);
		Ext.getCmp('shop').setActiveItem(filterView, 'flip');
	},

    /**
     * Event handler
     */
	checkForBanner: function() {
		var raw    = App.stores.Listing.proxy.reader.rawData,
			banner = Ext.getCmp('banner'),
			html;

		if(raw.sBanner) {
			// Calculate actual image size
			var viewportSize = App.Helpers.getViewportSize();
			var height = Math.round((raw.sBanner.width / 1000) * raw.sBanner.height);

			console.log(viewportSize);
			html = '<img src="'+raw.sBanner.img+'" width="'+ viewportSize.width +'" height="'+height+'" alt="'+raw.sBanner.description+'"/>';
			if(banner) { banner.update(html); }
			this.doLayout();
		} else {
			if(banner) { banner.destroy(); }
			this.doLayout();
		}
	}

});

/**
 * Subcategories listing
 *
 * @access public
 * class
 * @extends Ext.NestedList
 */
App.views.Shop.subListing = Ext.extend(Ext.NestedList,
/** @lends App.views.Shop.subListing# */
{
	id: 'subListing',
	store: App.stores.CategoriesTree,
	toolbar: {
		ui: 'dark'
	},
	height:  '100%',
	displayField: 'text',
	updateTitleText: true,
	useToolbar: true,
	title: '{s name="MobileShopSubcategoriesListingTitle"}Kategorien{/s}',
	getItemTextTpl: function(node) {
		return {literal}'<div class="info"><span class="title">{text}</span></div><tpl if="desc"><p class="desc">{desc}</p></tpl>'{/literal}
	},
	listeners: {
		scope: this,
		beforeactivate: function(me) {

			// Hide Shop toolbar
			var shopView = Ext.getCmp('shop');
			shopView.toolBar.hide();
			shopView.doLayout();
			shopView.doComponentLayout();
		},
		activate: function(me) {
			if(me.backButton.isHidden()) {
				me.backBtn.show();
				me.toolbar.doLayout();
			}
		},
		itemtap: function(list, index, item) {
			var tmpRec = list.store.getAt(index);
			list.ownerCt.backBtn.hide();
		},
		leafitemtap: function(me, idx) {
			var subListing = Ext.getCmp('subListing'),
				shopView = Ext.getCmp('shop');
			shopView.backBtn.setText(App.Helpers.truncate(subListing.toolbar.title, 9));
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

		var shopView = Ext.getCmp('shop');

		this.backBtn = new Ext.Button({
			ui: 'back',
			text: 'Start...',
			scope: this,
			handler: function() {
				shopView.setActiveItem(0, {
					type: 'slide',
					reverse: true,
					scope: this
				});

				window.setTimeout(function() {
					Ext.getCmp('subListing').destroy();
				}, 250);

			}
		});

		this.toolbar.add(this.backBtn);
		this.toolbar.doLayout();

		shopView.toolBar.hide();
		shopView.doComponentLayout();


	},

    /**
     * Handles the toolbar
     *
     * @param card
     */
	syncToolbar: function(card) {
		var list          = card || this.getActiveItem(),
			depth         = this.items.indexOf(list),
			recordNode    = list.recordNode,
			parentNode    = recordNode ? recordNode.parentNode : null,
			backBtn       = this.backButton,
			backBtnText   = this.useTitleAsBackText && parentNode ? this.renderTitleText(parentNode) : this.backText,
			backToggleMth = (depth !== 0) ? 'show' : 'hide',
			backHomeMth   = (depth === 0) ? 'show' : 'hide',
			shopView      = Ext.getCmp('shop');

			if (backBtn) {
				backBtn[backToggleMth]();
				this.backBtn[backHomeMth]();
				if (parentNode) {
					backBtn.setText(App.Helpers.truncate(backBtnText, 9));
				} else if(parentNode === null) {
					this.backBtn.show();
					this.toolbar.doLayout();
				}
			}


			if (this.toolbar && this.updateTitleText) {
				this.toolbar.setTitle(recordNode && recordNode.getRecord() ? this.renderTitleText(recordNode) : this.title || '');
				this.toolbar.doLayout();
			}
	}
});

/**
 * Category filter view
 *
 * @access public
 * @class
 * @extends Ext.form.FormPanel
 */
App.views.Shop.filterView = Ext.extend(Ext.form.FormPanel,
/** @lends App.views.Shop.filterView# */
{
	id: 'filterView',
	scroll: 'vertical',
	store: App.stores.Listing,
	listeners: {
		beforeactivate: function() {
			var shopView = Ext.getCmp('shop');
			shopView.toolBar.hide();
			shopView.doComponentLayout();
		},
		deactivate: function(me) {
			var shopView = Ext.getCmp('shop');
			shopView.toolBar.show();
			shopView.doComponentLayout();
			me.destroy();
		}
	},
	initComponent: function() {
		var store = App.stores.Listing,
			rawData = store.proxy.reader.rawData;

		this.toolBar = new Ext.Toolbar({
			ui: 'dark',
			title: '{s name="MobileShopFilterViewToolbarTitle"}Verfeinern{/s}',
			items: [
				{ xtype: 'spacer' },
				{
					xtype: 'button',
					ui: 'action',
					text: '{s name="MobileShopFilterViewToolbarFinishButton"}Fertig{/s}',
					scope: this,
					handler: this.onBackBtn
				}
			]
		});

		this.perPage = new Ext.form.Select({
			label: '{s name="MobileShopFilterViewPerPageLabel"}Pro Seite{/s}',
			name: 'sPerPage',
			labelWidth: '40%',
			listeners: {
				scope: this,
				change: function(select, value) {
					this.store.pageSize = parseInt(value);
				}
			},
			options: [
				{foreach [12, 24, 36, 48] as $pageNum}
					{ text: '{s name="MobileShopFilterViewPerPageArticles"}{$pageNum} Artikel{/s}',  value: '{$pageNum}' }{if !$pageNum@last},{/if}
				{/foreach}
			]
		});

		this.sort = new Ext.form.Select({
			label: 'Sortierung',
			name: 'sSort',
			labelWidth: '40%',
			listeners: {
				scope: this,
				change: function(select, value) {
					this.store.proxy.extraParams.sSort = parseInt(value);
				}
			},
			options: [
				{ text: '{s name="MobileShopFilterViewReleaseDate"}Erscheinungsdatum{/s}',  value: '1' },
				{ text: '{s name="MobileShopFilterViewPopularity"}Beliebtheit{/s}', value: '2' },
				{ text: '{s name="MobileShopFilterViewLowestPrice"}Niedrigster Preis{/s}',  value: '3' },
				{ text: '{s name="MobileShopFilterViewHighestPrice"}H&ouml;chster Preis{/s}', value: '4' },
				{ text: '{s name="MobileShopFilterViewArticlename"}Artikelbezeichnung{/s}', value: '5' }
			]
		});

		var itms = [];
		Ext.each(rawData.sSuppliers, function(item) {
			itms.push(new Ext.form.Radio({
				label:	item.name,
				value: item.id,
				name: 'sSupplier',
				labelWidth: '75%',
				listeners: {
					scope: this,
					check: function(check) {
						store.proxy.extraParams.sSupplier = ~~(check.getValue());
					}
				}
			}));
		});

		this.fieldSet = new Ext.form.FieldSet({
			instructions: '{s name="MobileShopFilterViewInstruction"}Bitte w&auml;hlen Sie eine Eigenschaft um die Artikelauflistung an Ihre pers&ouml;nlichen Bed&uuml;rfnisse anzupassen.{/s}',
			items: [this.perPage, this.sort]
		})

		Ext.apply(this, {
			dockedItems: [this.toolBar],
			items: [this.fieldSet]
		});

		if(Ext.isObject(itms)) {
			this.supplierField = new Ext.form.FieldSet({
				title: '{s name="MobileShopFilterViewSupplierTitle"}Hersteller{/s}',
				instructions: '{s name="MobileShopFilterViewSupplierInstruction"}Bitte w&auml;hlen Sie hier einen Hersteller aus um nur Produkte von diesen Hersteller angezeigt zu bekommen{/s}',
				items: itms
			});
			this.add(this.supplierField);
		}

		App.views.Shop.filterView.superclass.initComponent.call(this);
	},

    /**
     * Event handler
     */
	onBackBtn: function() {
		this.store.load();
		var shopView = Ext.getCmp('shop');
		shopView.setActiveItem(this.prev(), 'flip');
	}
});
</script>