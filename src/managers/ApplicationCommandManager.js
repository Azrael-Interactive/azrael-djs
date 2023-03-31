'use strict';

const { isJSONEncodable } = require('@discordjs/builders');
const { Collection } = require('@discordjs/collection');
const ApplicationCommandPermissionsManager = require('./ApplicationCommandPermissionsManager');
const CachedManager = require('./CachedManager');
const { TypeError } = require('../errors');
const ApplicationCommand = require('../structures/ApplicationCommand');
const { ApplicationCommandTypes } = require('../util/Constants');
const Permissions = require('../util/Permissions');

/**
 * Manages API methods for application commands and stores their cache.
 * @extends {CachedManager}
 */

/* eslint-disable max-len */
  /**
   * Data that resolves to the data of an ApplicationCommand
   * @typedef {ApplicationCommandData|APIApplicationCommand|SlashCommandBuilder|ContextMenuCommandBuilder} ApplicationCommandDataResolvable
   */
  /* eslint-enable max-len */
class ApplicationCommandManager extends CachedManager {
  constructor(client, iterable) {
    super(client, ApplicationCommand, iterable);

    /**
     * The manager for permissions of arbitrary commands on arbitrary guilds
     * @type {ApplicationCommandPermissionsManager}
     */
    this.permissions = new ApplicationCommandPermissionsManager(this);
  }

  /**
   * The cache of this manager
   * @type {Collection<Snowflake, ApplicationCommand>}
   * @name ApplicationCommandManager#cache
   */

  _add(data, cache, guildID) {
    return super._add(data, cache, { extras: [this.guild, guildID] });
  }

  /**
   * The APIRouter path to the commands
   * @param {Snowflake} [options.id] The application command's id
   * @param {Snowflake} [options.guildID] The guild's id to use in the path,
   * ignored when using a {@link GuildApplicationCommandManager}
   * @returns {Object}
   * @private
   */
  commandPath({ id, guildID } = {}) {
    let path = this.client.api.applications(this.client.application.id);
    if (this.guild ?? guildID) path = path.guilds(this.guild?.id ?? guildID);
    return id ? path.commands(id) : path.commands;
  }

  /**
   * Data that resolves to give an ApplicationCommand object. This can be:
   * * An ApplicationCommand object
   * * A Snowflake
   * @typedef {ApplicationCommand|Snowflake} ApplicationCommandResolvable
   */

  /**
   * Options used to fetch data from Discord
   * @typedef {Object} BaseFetchOptions
   * @property {boolean} [cache=true] Whether to cache the fetched data if it wasn't already
   * @property {boolean} [force=false] Whether to skip the cache check and request the API
   */

  /**
   * Options used to fetch Application Commands from Discord
   * @typedef {BaseFetchOptions} FetchApplicationCommandOptions
   * @property {Snowflake} [guildID] The guild's id to fetch commands for, for when the guild is not cached
   * @property {LocaleString} [locale] The locale to use when fetching this command
   * @property {boolean} [withLocalizations] Whether to fetch all localization data
   */

  /**
   * Obtains one or multiple application commands from Discord, or the cache if it's already available.
   * @param {Snowflake} [id] The application command's id
   * @param {FetchApplicationCommandOptions} [options] Additional options for this fetch
   * @returns {Promise<ApplicationCommand|Collection<Snowflake, ApplicationCommand>>}
   * @example
   * // Fetch a single command
   * client.application.commands.fetch('123456789012345678')
   *   .then(command => console.log(`Fetched command ${command.name}`))
   *   .catch(console.error);
   * @example
   * // Fetch all commands
   * guild.commands.fetch()
   *   .then(commands => console.log(`Fetched ${commands.size} commands`))
   *   .catch(console.error);
   */
  async fetch(id, { guildID, cache = true, force = false, locale, withLocalizations } = {}) {
    if (typeof id === 'object') {
      ({ guildID, cache = true, locale, withLocalizations } = id);
    } else if (id) {
      if (!force) {
        const existing = this.cache.get(id);
        if (existing) return existing;
      }
      const command = await this.commandPath({ id, guildID }).get();
      return this._add(command, cache);
    }

    const data = await this.commandPath({ guildID }).get({
      headers: {
        'X-Discord-Locale': locale,
      },
      query: typeof withLocalizations === 'boolean' ? { with_localizations: withLocalizations } : undefined,
    });
    return data.reduce((coll, command) => coll.set(command.id, this._add(command, cache, guildID)), new Collection());
  }

  /**
   * Creates an application command.
   * @param {ApplicationCommandDataResolvable} command The command
   * @param {Snowflake} [guildID] The guild's id to create this command in,
   * ignored when using a {@link GuildApplicationCommandManager}
   * @returns {Promise<ApplicationCommand>}
   * @example
   * // Create a new command
   * client.application.commands.create({
   *   name: 'test',
   *   description: 'A test command',
   * })
   *   .then(console.log)
   *   .catch(console.error);
   */
  async create(command, guildID) {
    const data = await this.commandPath({ guildID }).post({
      data: this.constructor.transformCommand(command),
    });
    return this._add(data, true, guildID);
  }

  /**
   * Sets all the commands for this application or guild.
   * @param {ApplicationCommandDataResolvable[]} commands The commands
   * @param {Snowflake} [guildID] The guild's id to create the commands in,
   * ignored when using a {@link GuildApplicationCommandManager}
   * @returns {Promise<Collection<Snowflake, ApplicationCommand>>}
   * @example
   * // Set all commands to just this one
   * client.application.commands.set([
   *   {
   *     name: 'test',
   *     description: 'A test command',
   *   },
   * ])
   *   .then(console.log)
   *   .catch(console.error);
   * @example
   * // Remove all commands
   * guild.commands.set([])
   *   .then(console.log)
   *   .catch(console.error);
   */
  async set(commands, guildID) {
    const data = await this.commandPath({ guildID }).put({
      data: commands.map(c => this.constructor.transformCommand(c)),
    });
    return data.reduce((coll, command) => coll.set(command.id, this._add(command, true, guildID)), new Collection());
  }

  /**
   * Edits an application command.
   * @param {ApplicationCommandResolvable} command The command to edit
   * @param {Partial<ApplicationCommandDataResolvable>} data The data to update the command with
   * @param {Snowflake} [guildID] The guild's id where the command registered,
   * ignored when using a {@link GuildApplicationCommandManager}
   * @returns {Promise<ApplicationCommand>}
   * @example
   * // Edit an existing command
   * client.application.commands.edit('123456789012345678', {
   *   description: 'New description',
   * })
   *   .then(console.log)
   *   .catch(console.error);
   */
  async edit(command, data, guildID) {
    const id = this.resolveID(command);
    if (!id) throw new TypeError('INVALID_TYPE', 'command', 'ApplicationCommandResolvable');

    const patched = await this.commandPath({ id, guildID }).patch({
      data: this.constructor.transformCommand(data),
    });
    return this._add(patched, true, guildID);
  }

  /**
   * Deletes an application command.
   * @param {ApplicationCommandResolvable} command The command to delete
   * @param {Snowflake} [guildID] The guild's id where the command is registered,
   * ignored when using a {@link GuildApplicationCommandManager}
   * @returns {Promise<?ApplicationCommand>}
   * @example
   * // Delete a command
   * guild.commands.delete('123456789012345678')
   *   .then(console.log)
   *   .catch(console.error);
   */
  async delete(command, guildID) {
    const id = this.resolveID(command);
    if (!id) throw new TypeError('INVALID_TYPE', 'command', 'ApplicationCommandResolvable');

    await this.commandPath({ id, guildID }).delete();

    const cached = this.cache.get(id);
    this.cache.delete(id);
    return cached ?? null;
  }

  /**
   * Transforms an {@link ApplicationCommandData} object into something that can be used with the API.
   * @param {ApplicationCommandDataResolvable} command The command to transform
   * @returns {APIApplicationCommand}
   * @private
   */
  static transformCommand(command) {
    if (isJSONEncodable(command)) return command.toJSON();

    let default_member_permissions;

    if ('default_member_permissions' in command) {
      default_member_permissions = command.default_member_permissions
        ? new Permissions(BigInt(command.default_member_permissions)).bitfield.toString()
        : command.default_member_permissions;
    }

    if ('defaultMemberPermissions' in command) {
      default_member_permissions = command.defaultMemberPermissions
        ? new Permissions(command.defaultMemberPermissions).bitfield.toString()
        : command.defaultMemberPermissions;
    }

    return {
      name: command.name,
      name_localizations: command.nameLocalizations ?? command.name_localizations,
      description: command.description,
      description_localizations: command.descriptionLocalizations ?? command.description_localizations,
      type: typeof command.type === 'number' ? command.type : ApplicationCommandTypes[command.type],
      options: command.options?.map(o => ApplicationCommand.transformOption(o)),
      default_permission: command.defaultPermission ?? command.default_permission,
      default_member_permissions,
      dm_permission: command.dmPermission ?? command.dm_permission,
    };
  }
}

module.exports = ApplicationCommandManager;

/**
 * @external SlashCommandBuilder
 * @see {@link https://discord.js.org/#/docs/builders/main/class/SlashCommandBuilder}
 */

/**
 * @external ContextMenuCommandBuilder
 * @see {@link https://discord.js.org/#/docs/builders/main/class/ContextMenuCommandBuilder}
 */