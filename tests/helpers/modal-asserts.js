import { click, waitUntil } from '@ember/test-helpers';
import QUnit from 'qunit';

export function findContains(selector, text) {
  return [].slice.apply(document.querySelectorAll(selector)).filter((e) => e.textContent.trim().indexOf(text) > -1)[0];
}

export default function registerAssertHelpers() {
  const { assert } = QUnit;
  const overlaySelector = '.ember-modal-overlay';
  const dialogSelector = '.ember-modal-dialog';

  assert.isPresentOnce = function(selector, message) {
    message = message || `${selector} is present in DOM once`;
    return this.equal(document.querySelectorAll(selector).length, 1, message);
  };

  assert.isAbsent = function(selector, message) {
    message = message || `${selector} is absent from DOM`;
    return this.equal(document.querySelectorAll(selector).length, 0, message);
  };

  assert.isVisible = function(selector, message) {
    message = message || `${selector} is not visible`;
    return this.dom(selector).isVisible(message);
  };

  assert.dialogOpensAndCloses = async function(options) {
    const self = this;
    await click(options.openSelector, options.context);
    await waitUntil(function() {
      return findContains(dialogSelector, options.dialogText);
    });
    if (options.ariaLabelId) {
      assert.isAccessibleDialog(dialogSelector);
      assert.hasAccessibleLabel(dialogSelector, options.ariaLabelId);
    }
    if (options.ariaDescriptionId) {
      assert.hasAccessibleDescription(dialogSelector, options.ariaDescriptionId);
    }
    if (options.hasOverlay) {
      self.isPresentOnce(overlaySelector);
    }
    if (options.whileOpen) {
      await options.whileOpen();
    }
    await click(options.closeSelector, options.context);
    await waitUntil(function() {
      return !findContains(dialogSelector, options.dialogText);
    });
    self.isAbsent(overlaySelector);
  };

  assert.isAccessibleDialog = function(selector, message) {
    message = message || `${selector} has aria dialog role`;
    return this.dom(selector).hasAttribute('role', 'dialog', message);
  }

  assert.hasAccessibleLabel = function(selector, labelId, message) {
    message = message || `${selector} has aria dialog label`;
    return this.dom(selector).hasAttribute('aria-labelledby', labelId, message);
  }

  assert.hasAccessibleDescription = function(selector, descriptionId, message) {
    message = message || `${selector} has aria dialog describes`;
    return this.dom(selector).hasAttribute('aria-describedby', descriptionId, message);
  }
}
