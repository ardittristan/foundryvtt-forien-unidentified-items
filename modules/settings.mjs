import constants from "./constants.mjs";
import DefaultIcons from "./apps/DefaultIcons.mjs";
import ItemProperties from "./apps/ItemProperties.mjs";
import {defaultPropertiesDND5e} from "./integrations/dnd5e.mjs";
import {defaultPropertiesWFRP4e} from "./integrations/wfrp4e.mjs";

export default function registerSettings() {
  registerSettingMenus();

  game.settings.register(constants.moduleName, "defaultIcons", {
    scope: "world",
    config: false,
    default: {}
  });

  game.settings.register(constants.moduleName, "itemProperties", {
    scope: "world",
    config: false,
    default: {}
  });

  game.settings.register(constants.moduleName, "playersWelcomeScreen", {
    name: "ForienUnidentifiedItems.Settings.playersWelcomeScreen.Enable",
    hint: "ForienUnidentifiedItems.Settings.playersWelcomeScreen.EnableHint",
    scope: "world",
    config: true,
    default: true,
    type: Boolean
  });

  checkSettingsInitialized();
}

/**
 * Registers settings menu (button)
 */
function registerSettingMenus() {
  game.settings.registerMenu(constants.moduleName, "defaultIcons", {
    name: "ForienUnidentifiedItems.Settings.defaultIcons.name",
    label: "ForienUnidentifiedItems.Settings.defaultIcons.label",
    hint: "ForienUnidentifiedItems.Settings.defaultIcons.hint",
    icon: "fas fa-image",
    type: DefaultIcons,
    restricted: true
  });

  game.settings.registerMenu(constants.moduleName, "itemProperties", {
    name: "ForienUnidentifiedItems.Settings.itemProperties.name",
    label: "ForienUnidentifiedItems.Settings.itemProperties.label",
    hint: "ForienUnidentifiedItems.Settings.itemProperties.hint",
    icon: "fas fa-gear",
    type: ItemProperties,
    restricted: true
  });
}


/**
 * Checks if options exist, if not, orders their initialization
 */
function checkSettingsInitialized() {
  let defaultIcons = game.settings.get(constants.moduleName, "defaultIcons");
  let itemProperties = game.settings.get(constants.moduleName, "itemProperties");

  if (checkObjEmpty(defaultIcons))
    initializeDefaultIcons();

  if (checkObjEmpty(itemProperties))
    initializeItemProperties();
}

function checkObjEmpty(obj) {
  return (Object.keys(obj).length === 0 && obj.constructor === Object);
}

/**
 * One-time settings initialization function
 *
 * @hook "forien-unidentified-items:onInitializeDefaultIcons"
 */
function initializeDefaultIcons() {
  const di = new DefaultIcons({}, {});
  let settings = di.getSettings();
  const properties = duplicate(settings);
  Hooks.call(`${constants.moduleName}:onInitializeDefaultIcons`, properties);
  settings = mergeObject(settings, properties);
  di.saveSettings(settings);
}

/**
 * One-time settings initialization function
 *
 * @hook "forien-unidentified-items:onInitializeItemProperties"
 */
function initializeItemProperties() {
  const ip = new ItemProperties({}, {});
  let settings = ip.getSettings();
  settings = Object.entries(settings);
  settings = settings.map(type => {
    let entries = Object.entries(type[1]);
    entries = entries.sort((a, b) => {
      if (a[0] < b[0]) return -1;
      if (a[0] > b[0]) return 1;
      return 0;
    });
    type[1] = Object.fromEntries(entries);
    return type;
  });
  settings = Object.fromEntries(settings);
  settings = setDefaultItemProperties(settings);
  const properties = duplicate(settings);
  Hooks.call(`${constants.moduleName}:onInitializeItemProperties`, properties);
  settings = mergeObject(settings, properties)
  ip.saveSettings(settings);
}


/**
 * Function responsible for out-of-the-box integration with systems.
 *
 * Function must return object of key-value entries:
 *   - key   - item type
 *   - value - objects of of key-value pairs of flattened
 *             data names and boolean values
 *
 * Example of "defaults" object:
 *   {
 *     weapon: {
 *       "description": true,
 *       "attack.damage": true
 *     },
 *     armor: {
 *       "weight": true
 *     }
 *   }
 *
 * @param settings
 * @returns {Object}
 */
function setDefaultItemProperties(settings) {
  let defaults;
  switch (game.system.id) {
    case 'dnd5e':
      defaults = defaultPropertiesDND5e;
      break;
    case 'wfrp4e':
      defaults = defaultPropertiesWFRP4e;
      break;
    default:
  }

  return mergeObject(settings, defaults);
}