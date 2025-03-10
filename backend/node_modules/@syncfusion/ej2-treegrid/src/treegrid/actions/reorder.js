import { Grid, Reorder as GridReorder } from '@syncfusion/ej2-grids';
/**
 * TreeGrid Reorder module
 *
 * @hidden
 */
var Reorder = /** @class */ (function () {
    /**
     * Constructor for Reorder module
     *
     * @param {TreeGrid} parent - Tree Grid instance
     */
    function Reorder(parent) {
        Grid.Inject(GridReorder);
        this.parent = parent;
        this.addEventListener();
    }
    /**
     * For internal use only - Get the module name.
     *
     * @private
     * @returns {string} Returns Reorder module name
     */
    Reorder.prototype.getModuleName = function () {
        return 'reorder';
    };
    /**
     * @hidden
     * @returns {void}
     */
    Reorder.prototype.addEventListener = function () {
        this.parent.on('getColumnIndex', this.updateTreeColumn, this);
    };
    Reorder.prototype.removeEventListener = function () {
        if (this.parent.isDestroyed) {
            return;
        }
        this.parent.off('getColumnIndex', this.updateTreeColumn);
    };
    /**
     * To destroy the Reorder
     *
     * @returns {void}
     * @hidden
     */
    Reorder.prototype.destroy = function () {
        this.removeEventListener();
    };
    Reorder.prototype.updateTreeColumn = function () {
        this.parent['getTreeColumn']();
    };
    return Reorder;
}());
export { Reorder };
