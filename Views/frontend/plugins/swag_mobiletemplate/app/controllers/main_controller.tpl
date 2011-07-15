<script type="text/javascript">
/**
 * @file main_controller.js
 * @link http://www.shopware.de
 * @author S.Pohl <stp@shopware.de>
 * @date 11-05-11
 */
Ext.regController('main', {
	show: function(options) {

		Ext.getCmp('shop').setActiveItem('home', {
			type:  (Ext.isDefined(options.type)) ? options.type : 'slide',
			direction: (Ext.isDefined(options.direction)) ? options.direction : 'left'
		})
	}
})
</script>