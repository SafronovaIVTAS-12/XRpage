var registerComponent = require('../../core/component').registerComponent;
var constants = require('../../constants/');
var utils = require('../../utils/');

var ENTER_VR_CLASS = 'a-enter-vr';
var ENTER_AR_CLASS = 'a-enter-ar';
var HIDDEN_CLASS = 'a-hidden';
var ORIENTATION_MODAL_CLASS = 'a-orientation-modal';

module.exports.Component = registerComponent('xr-mode-ui', {
  dependencies: ['canvas'],

  schema: {
    enabled: {default: true},
    cardboardModeEnabled: {default: false},
    enterVRButton: {default: ''},
    enterVREnabled: {default: true},
    enterARButton: {default: ''},
    enterAREnabled: {default: true},
    XRMode: {default: 'vr', oneOf: ['vr', 'ar', 'xr']}
  },

  sceneOnly: true,

  init: function () {
    var self = this;
    var sceneEl = this.el;

    if (utils.getUrlParameter('ui') === 'false') { return; }

    this.insideLoader = false;
    this.enterVREl = null;
    this.enterAREl = null;
    this.exitVREl = null;

    this.orientationModalEl = null;
    this.bindMethods();

    sceneEl.addEventListener('enter-vr', this.updateEnterInterfaces);
    sceneEl.addEventListener('exit-vr', this.updateEnterInterfaces);
    sceneEl.addEventListener('update-vr-devices', this.updateEnterInterfaces);

    window.addEventListener('message', function (event) {
      if (event.data.type === 'loaderReady') {
        self.insideLoader = true;
        self.remove();
      }
    });

    window.addEventListener('orientationchange', this.toggleOrientationModalIfNeeded);
  },

  bindMethods: function () {
    this.onEnterVRButtonClick = this.onEnterVRButtonClick.bind(this);
    this.onEnterARButtonClick = this.onEnterARButtonClick.bind(this);
    this.onModalClick = this.onModalClick.bind(this);
    this.onExitVRButtonClick = this.onExitVRButtonClick.bind(this); // New binding
    this.toggleOrientationModalIfNeeded = this.toggleOrientationModalIfNeeded.bind(this);
    this.updateEnterInterfaces = this.updateEnterInterfaces.bind(this);
  },

  onModalClick: function () {
    this.el.exitVR();
  },

  onEnterVRButtonClick: function () {
    this.el.enterVR();
  },

  onEnterARButtonClick: function () {
    this.el.enterAR();
  },

  onExitVRButtonClick: function () {
    this.el.exitVR();
  },

  update: function () {
    var data = this.data;
    var sceneEl = this.el;

    if (!data.enabled || this.insideLoader || utils.getUrlParameter('ui') === 'false') {
      return this.remove();
    }

    if (this.enterVREl || this.enterAREl || this.orientationModalEl || this.exitVREl) { return; }

    if (!this.enterVREl && data.enterVREnabled && (data.XRMode === 'xr' || data.XRMode === 'vr')) {
      if (data.enterVRButton) {
        this.enterVREl = document.querySelector(data.enterVRButton);
        this.enterVREl.addEventListener('click', this.onEnterVRButtonClick);
      } else {
        this.enterVREl = createEnterVRButton(this.onEnterVRButtonClick);
        sceneEl.appendChild(this.enterVREl);
      }
    }

    if (!this.enterAREl && data.enterAREnabled && (data.XRMode === 'xr' || data.XRMode === 'ar')) {
      if (data.enterARButton) {
        this.enterAREl = document.querySelector(data.enterARButton);
        this.enterAREl.addEventListener('click', this.onEnterARButtonClick);
      } else {
        this.enterAREl = createEnterARButton(this.onEnterARButtonClick, data.XRMode === 'xr');
        sceneEl.appendChild(this.enterAREl);
      }
    }

    this.orientationModalEl = createOrientationModal(this.onModalClick);
    sceneEl.appendChild(this.orientationModalEl);

    this.exitVREl = createExitVRButton(this.onExitVRButtonClick);
    sceneEl.appendChild(this.exitVREl);

    this.updateEnterInterfaces();
  },

  remove: function () {
    [this.enterVREl, this.enterAREl, this.orientationModalEl, this.exitVREl].forEach(function (uiElement) {
      if (uiElement && uiElement.parentNode) {
        uiElement.parentNode.removeChild(uiElement);
      }
    });
    this.enterVREl = undefined;
    this.enterAREl = undefined;
    this.orientationModalEl = undefined;
    this.exitVREl = undefined;
  },

  updateEnterInterfaces: function () {
    this.toggleEnterVRButtonIfNeeded();
    this.toggleEnterARButtonIfNeeded();
    this.toggleOrientationModalIfNeeded();
    this.toggleExitVRButtonIfNeeded(); // New toggle function
  },

  toggleEnterVRButtonIfNeeded: function () {
    var sceneEl = this.el;
    if (!this.enterVREl) { return; }
    if (sceneEl.is('vr-mode') ||
       ((sceneEl.isMobile || utils.device.isMobileDeviceRequestingDesktopSite()) && !this.data.cardboardModeEnabled && !utils.device.checkVRSupport())) {
      this.enterVREl.classList.add(HIDDEN_CLASS);
    } else {
      if (!utils.device.checkVRSupport()) { this.enterVREl.classList.add('fullscreen'); }
      this.enterVREl.classList.remove(HIDDEN_CLASS);
      sceneEl.enterVR(false, true);
    }
  },

  toggleEnterARButtonIfNeeded: function () {
    var sceneEl = this.el;
    if (!this.enterAREl) { return; }
    if (sceneEl.is('vr-mode') || !utils.device.checkARSupport()) {
      this.enterAREl.classList.add(HIDDEN_CLASS);
    } else {
      this.enterAREl.classList.remove(HIDDEN_CLASS);
      sceneEl.enterVR(true, true);
    }
  },

  toggleExitVRButtonIfNeeded: function () {
    if (!this.exitVREl) { return; }
    if (this.el.is('vr-mode')) {
      this.exitVREl.classList.remove(HIDDEN_CLASS);
    } else {
      this.exitVREl.classList.add(HIDDEN_CLASS);
    }
  },

  toggleOrientationModalIfNeeded: function () {
    var sceneEl = this.el;
    var orientationModalEl = this.orientationModalEl;
    if (!orientationModalEl || !sceneEl.isMobile) { return; }
    if (!utils.device.isLandscape() && sceneEl.is('vr-mode')) {
      orientationModalEl.classList.remove(HIDDEN_CLASS);
    } else {
      orientationModalEl.classList.add(HIDDEN_CLASS);
    }
  }
});

function createEnterVRButton (onClick) {
  var vrButton;
  var wrapper;

  wrapper = document.createElement('div');
  wrapper.classList.add(ENTER_VR_CLASS);
  wrapper.setAttribute(constants.AFRAME_INJECTED, '');
  vrButton = document.createElement('button');
  vrButton.className = 'a-enter-vr-button';
  vrButton.setAttribute('title', 'Enter VR mode with a headset or fullscreen without');
  vrButton.setAttribute(constants.AFRAME_INJECTED, '');
  if (utils.device.isMobile()) { applyStickyHoverFix(vrButton); }
  wrapper.appendChild(vrButton);
  vrButton.addEventListener('click', function (evt) {
    onClick();
    evt.stopPropagation();
  });
  return wrapper;
}

function createEnterARButton (onClick, xrMode) {
  var arButton;
  var wrapper;

  wrapper = document.createElement('div');
  wrapper.classList.add(ENTER_AR_CLASS);
  if (xrMode) { wrapper.classList.add('xr'); }
  wrapper.setAttribute(constants.AFRAME_INJECTED, '');
  arButton = document.createElement('button');
  arButton.className = 'a-enter-ar-button';
  arButton.setAttribute('title', 'Enter AR mode with a headset or handheld device.');
  arButton.setAttribute(constants.AFRAME_INJECTED, '');
  if (utils.device.isMobile()) { applyStickyHoverFix(arButton); }
  wrapper.appendChild(arButton);
  arButton.addEventListener('click', function (evt) {
    onClick();
    evt.stopPropagation();
  });
  return wrapper;
}

function createOrientationModal (onClick) {
  var modal = document.createElement('div');
  modal.className = ORIENTATION_MODAL_CLASS;
  modal.classList.add(HIDDEN_CLASS);
  modal.setAttribute(constants.AFRAME_INJECTED, '');

  var exit = document.createElement('button');
  exit.setAttribute(constants.AFRAME_INJECTED, '');
  exit.innerHTML = 'Exit VR';

  exit.addEventListener('click', onClick);

  modal.appendChild(exit);

  return modal;
}

function createExitVRButton (onClick) {
  var exitButton;
  var wrapper;

  wrapper = document.createElement('div');
  wrapper.classList.add('a-exit-vr');
  wrapper.setAttribute(constants.AFRAME_INJECTED, '');
  exitButton = document.createElement('button');
  exitButton.className = 'a-exit-vr-button';
  exitButton.setAttribute('title', 'Exit VR mode');
  exitButton.setAttribute(constants.AFRAME_INJECTED, '');
  if (utils.device.isMobile()) { applyStickyHoverFix(exitButton); }
  wrapper.appendChild(exitButton);
  exitButton.addEventListener('click', function (evt) {
    onClick();
    evt.stopPropagation();
  });
  return wrapper;
}

function applyStickyHoverFix (buttonEl) {
  buttonEl.addEventListener('touchstart', function () {
    buttonEl.classList.remove('resethover');
  }, {passive: true});
  buttonEl.addEventListener('touchend', function () {
    buttonEl.classList.add('resethover');
  }, {passive: true});
}
