<script type="text/javascript">
/**
 * @file detail_controller.js
 * @link http://www.shopware.de
 * @author S.Pohl <stp@shopware.de>
 * @date 11-05-11
 */
Ext.regController('detail', {
    last:       null,
	shopView:   Ext.getCmp('shop'),
	view:       Ext.getCmp('detail'),
	lastRecord: null,
	store:      App.stores.Detail,

	/**
	 * show
	 *
	 * Create the main view on runtime and handles the detail store
	 *
	 * @param options
	 */
    show: function(options) {
		var store = this.store,
			view = Ext.getCmp('detail');

		this.view = view;

		if(!this.shopView) {
			this.shopView = Ext.getCmp('shop');
		}

        if(!this.view || !this.view.isComponent) {
            this.view = new App.views.Shop.detail;
        }

		if(!Ext.isDefined(options.articleID)) {
			throw new Error("No articleID set in dispatch options");
		}

	    store.load({
            params: { articleId: options.articleID},
		    callback: function() {
			    this.lastRecord = store.getAt(0);
			    store.fireEvent('storeLoaded');
			    Ext.getCmp('teaser').doLayout();
		    }
        });

        Ext.dispatch({
            controller: 'detail',
            action: 'showInfo'
        });

		if(Ext.isDefined(options.parent)) {
			Ext.getCmp('viewport').setActiveItem(0, { type: 'slide', reverse: true });
			this.shopView.toolBar.show();
			this.shopView.backBtn.show();
			this.shopView.doComponentLayout();
		}

		if(!this.shopView.toolBar.isVisible()) {
			this.shopView.backBtn.show();
			this.shopView.toolBar.show();
			this.shopView.doComponentLayout();
		}

        this.shopView.setActiveItem(this.view, 'slide');
    },

	/**
	 * showInfo
	 *
	 * Creates the info view on runtime
	 *
	 * @param options
	 */
    showInfo: function(options) {
        var view = Ext.getCmp('teaser');

        if(!view) {
            view = new App.views.Shop.info;
            this.view.add(view);
        }

		if(options.refresh) {
			this.store.fireEvent('storeLoaded');
		}

		this.view.doLayout();
    },

	/**
	 * showComments
	 *
	 * Creates the comment main view on runtime
	 */
    showComments: function() {
        var view = Ext.getCmp('votes');

        if(!view) {
            view = new App.views.Shop.comments;
            this.view.add(view);
        }
    },

	/**
	 * showPictures
	 *
	 * Creates the picture view on runtime and handles the picture store
	 */
    showPictures: function() {
        var view = Ext.getCmp('pictures'), me = this;

		this.lastRecord = this.store.getAt(0);

        App.stores.Picture.load({
            params: {
                articleId: me.lastRecord.data.articleID
            },
            callback: function() {
                if(!view) {
                    view = new App.views.Shop.pictures;
                    me.view.add(view);
                }
                me.view.setActiveItem(view, 'fade');
            }
        })
    }
});
</script>