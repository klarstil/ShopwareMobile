/**
 * ----------------------------------------------------------------------
 * detail_controller.js
 *
 * Handles the complete detail view logic
 *
 * @link http://www.shopware.de
 * @author S.Pohl <stp@shopware.de>
 * ----------------------------------------------------------------------
 */
Ext.regController('detail', {
    last: null,
    detail: Ext.getCmp('detail'),

	/**
	 * show
	 *
	 * Create the main view on runtime and handles the detail store
	 *
	 * @param options
	 */
    show: function(options) {
        var store, rec, pictures, view = Ext.getCmp('detail'), me = this;

        if(!view) {
            view = new App.views.Shop.detail;
            me.detail = view;
            Ext.getCmp('shop').add(view);
        }

        store = options.store;
        rec = store.getAt(options.idx);
        this.last = rec;

	    App.stores.Detail.load({
            params: {
                articleId: rec.data.articleID
            }, callback: function() {
			    App.stores.Detail.fireEvent('storeLoaded');
			    Ext.getCmp('teaser').doLayout();
		    }
        });

        Ext.dispatch({
            controller: 'detail',
            action: 'showInfo'
        });

        Ext.getCmp('shop').setActiveItem(view, 'slide');
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

		console.log(options);
		console.log(App.stores.Detail);

        if(!view) {
            view = new App.views.Shop.info;
            Ext.getCmp('detail').add(view);
        }
		
		if(options.refresh) {
			App.stores.Detail.fireEvent('storeLoaded');
		}

		Ext.getCmp('detail').doLayout();
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
            Ext.getCmp('detail').add(view);
        }
    },

	/**
	 * showPictures
	 *
	 * Creates the picture view on runtime and handles the picture store
	 */
    showPictures: function() {
        var view = Ext.getCmp('pictures'), me = this;

        App.stores.Picture.load({
            params: {
                articleId: me.last.data.articleID
            },
            callback: function() {
                if(!view) {
                    view = new App.views.Shop.pictures;
                    Ext.getCmp('detail').add(view);
                }
                Ext.getCmp('detail').setActiveItem(view, 'fade');
            }
        })
    }
});