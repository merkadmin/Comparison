import { ActionMenuItem } from '../components/commonActions/common-drop-down-menu-action-button/common-drop-down-menu-action-button';

/**
 * Returns the standard single-action row menu used by every list component.
 * Contains only a Delete action bound to the provided callback.
 *
 * @param deleteFn - Zero-argument callback that deletes the row (typically `() => this.delete(id)`).
 * @returns Array with one `ActionMenuItem` for the delete action.
 */
export function buildRowMenuItems(deleteFn: () => void): ActionMenuItem[] {
  return [
    { labelKey: 'common.delete', iconClass: 'ki-trash', iconPaths: 5, color: 'danger', action: deleteFn }
  ];
}
